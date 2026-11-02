import crud from "@cocreate/crud-client";
import { encodeContent, decodeContent, getContentType } from "@cocreate/utils/file";
import Config from "@cocreate/config";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { replaceTemplateVariable } from "./replaceTemplateVariable.js";

const realpathAsync = fs.promises.realpath;

/**
 * Safely dynamic-imports a JavaScript module with a fallback timeout
 * to prevent top-level execution stalls from hanging the uploader loop.
 * @private
 * @environment server
 */
async function safeImport(filePath, timeoutMs = 5000) {
    const fileUrl = pathToFileURL(filePath).href;
    let timerId;

    const timeout = new Promise((_, reject) => {
        timerId = setTimeout(() => reject(new Error(`Import timeout for ${filePath}`)), timeoutMs);
    });

    try {
        const module = await Promise.race([import(fileUrl), timeout]);
        clearTimeout(timerId);
        return module && module.default ? module.default : module;
    } catch (err) {
        clearTimeout(timerId);
        console.warn(`Fallback to raw text reading for ${filePath} due to import error:`, err.message);
        return null;
    }
}

async function loadConfig(configPath) {
    let config = await Config.prompt(
        {
            organization_id: {
                prompt: "Enter your organization_id: "
            },
            host: {
                prompt: "Enter the host: "
            },
            prompt: {
                prompt: "Choose an authentication option: \n1.apikey\n2.Sign In\n",
                choices: {
                    1: {
                        apikey: {
                            prompt: "Enter your apikey: "
                        }
                    },
                    2: {
                        email: {
                            prompt: "Enter your email: "
                        },
                        password: {
                            prompt: "Enter your password: "
                        }
                    }
                }
            }
        },
        null,
        null,
        configPath
    );

    if (
        !config.organization_id ||
        (!config.apikey && (!config.password || !config.email))
    ) {
        console.log("One or more required config params could not be found");
        throw new Error("Missing required configuration parameters");
    }

    if (config.email && config.password) {
        let request = {
            method: "signIn",
            array: "users",
            filter: {
                query: {
                    email: config.email,
                    password: config.password
                }
            },
            ...config
        };

        let response = await crud.send(request);
        let { success } = response || {};

        if (success) {
            console.log("successful sign in");
        } else {
            console.log("The email or password you entered is incorrect");
            throw new Error("Authentication failed");
        }
    }

    return config;
}

async function writeFiles(objects, configPath, destination) {
    let baseDir = destination
        ? path.resolve(destination)
        : process.cwd();
    if (!destination && configPath) {
        const projectRoot = path.dirname(configPath);
        baseDir = path.join(projectRoot, 'src');
        if (!fs.existsSync(baseDir)) {
            baseDir = projectRoot;
        }
    }

    const downloaded = [];
    for (const obj of objects) {
        try {
            const objPath = obj.pathname || obj.path;
            if (!objPath) continue;

            const targetPath = path.resolve(baseDir, '.' + objPath);
            const relativePath = path.relative(baseDir, targetPath);
            if (
                relativePath.startsWith(`..${path.sep}`) ||
                relativePath === '..' ||
                path.isAbsolute(relativePath)
            ) {
                throw new Error(`Path escapes download destination: ${objPath}`);
            }
            let isDirectory = obj["content-type"] === "text/directory" || obj.type === "directory" || objPath.endsWith('/');

            if (!isDirectory) {
                isDirectory = objects.some(o => {
                    let oPath = o.pathname || o.path;
                    return oPath && oPath !== objPath && (oPath.startsWith(objPath + '/') || oPath === objPath + '/');
                });
            }

            if (isDirectory) {
                await fs.promises.mkdir(targetPath, { recursive: true });
                continue;
            }

            await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });

            const src = obj.src || obj.source || (obj.object && obj.object.src) || '';
            let content = src;
            if (!content && obj.content) content = obj.content;

            let decoded;
            try {
                const dataURL = typeof content === "string" && content.startsWith("data:");
                decoded = await decodeContent({
                    value: typeof content === "object" ? content : String(content || ""),
                    encoding: dataURL ? "auto" : "utf8",
                    format: dataURL && !/;base64,/i.test(content) ? "text" : "bytes",
                    fatal: true
                });
            } catch {
                // Preserve the existing fallback for malformed data URLs/objects.
                decoded = decodeContent({ value: String(content || ""), encoding: "utf8", format: "bytes" });
            }
            await fs.promises.writeFile(targetPath, decoded);
            downloaded.push(targetPath);
        } catch (err) {
            console.error('Failed to write object', obj && obj._id, err);
        }
    }
    return downloaded;
}

export default async function file(
    CoCreateConfig,
    configPath,
    match,
    options = {}
) {
    let directories = CoCreateConfig.directories || [];
    let sources = CoCreateConfig.sources || [];
    let configDirectoryPath = path.dirname(configPath);

    if (match && !Array.isArray(match)) {
        match = [match];
    } else if (!match) {
        match = [];
    }

    if (!directories.length && !sources.length) {
        if (!options.watch) process.exit(0);
        return;
    }

    let config = await loadConfig(configPath);
    let failed = 0;

    async function runDirectories() {
        for (const directory of directories) {
            const entry = directory.entry;
            await runFiles(directory, entry);
        }
    }

    async function runFiles(directory, entry, Path, directoryName) {
        const entryPath = path.resolve(configDirectoryPath, entry);
        if (!fs.existsSync(entryPath)) return;

        let files = await fs.promises.readdir(entryPath);
        let exclude = directory.exclude || [];
        let include = directory.include || [];

        for (let file of files) {
            const filePath = path.resolve(entryPath, file);

            let stat = await fs.promises.lstat(filePath);
            let isSymlink = stat.isSymbolicLink();
            let isDirectory;

            if (isSymlink) {
                let symlinkPath = await realpathAsync(filePath);
                isDirectory =
                    fs.existsSync(symlinkPath) &&
                    (await fs.promises.lstat(symlinkPath)).isDirectory();
            } else {
                isDirectory = stat.isDirectory();
            }

            let skip = false;

            if (typeof match !== 'undefined' && match && match.length > 0) {
                let isMatched = false;
                for (let i = 0; i < match.length; i++) {
                    if (filePath.startsWith(match[i])) {
                        isMatched = true;
                        break;
                    } else if (isDirectory && match[i].startsWith(filePath)) {
                        isMatched = "directory";
                        break;
                    }
                }

                if (isMatched === false) {
                    skip = true;
                } else if (isMatched === "directory") {
                    skip = "directory";
                }
            }

            if (skip !== true && include && include.length > 0) {
                let included = false;
                for (let i = 0; i < include.length; i++) {
                    if (filePath.includes(include[i])) {
                        included = true;
                        break;
                    } else if (isDirectory) {
                        included = "directory";
                        break;
                    }
                }

                if (included === false) {
                    skip = true;
                } else if (included === "directory" && skip !== "directory") {
                    skip = "directory";
                }
            }

            if (skip !== true && exclude && exclude.length > 0) {
                for (let i = 0; i < exclude.length; i++) {
                    if (filePath.includes(exclude[i])) {
                        skip = true;
                        break;
                    }
                }
            }

            if (skip === true) continue;

            let name = file;
            let source = "";

            let mimeType = getContentType({ pathname: file, fallback: "" });

            if (!directoryName) {
                if (directory.object && directory.object.directory) {
                    if (directory.object.directory === "{{directory}}") {
                        let parts = entry.split("/");
                        directoryName = parts[parts.length - 1];
                    } else directoryName = directory.object.directory;
                } else directoryName = "/";
            }

            if (!Path) {
                if (directoryName === "/") Path = directoryName;
                else Path = "/" + directoryName;
            }

            let pathname;
            if (Path === "/") pathname = Path + name;
            else pathname = Path + "/" + name;

            if (isDirectory) {
                mimeType = "text/directory";
            } else {
                source = await getSource(
                    `${entryPath}/${file}`,
                    mimeType,
                    isSymlink
                );
            }

            let values = {
                "{{name}}": name || "",
                "{{source}}": Buffer.isBuffer(source) ? encodeContent({ value: source, contentType: mimeType, format: "data-url" }) : source || "",
                "{{directory}}": directoryName || "",
                "{{path}}": Path || "",
                "{{pathname}}": pathname,
                "{{content-type}}": mimeType || "",
            };

            let data = {
                array: directory.array || "files"
            };

            let isData = false;

            if (typeof directory.$data === "string") {
                if (isDirectory) {
                    skip = "directory";
                } else {
                    isData = true;
                    data = await getData(
                        `${entryPath}/${file}`,
                        mimeType,
                        isSymlink
                    );
                    if (!data) continue;
                }
            } else if (typeof directory.object === "string") {
                if (isDirectory) {
                    skip = "directory";
                } else {
                    isData = true;
                    data.object = await getData(
                        `${entryPath}/${file}`,
                        mimeType,
                        isSymlink
                    );
                    if (!data.object) continue;
                }
            } else if (typeof directory.object === "object" && directory.object !== null) {
                data.array = directory.array || "files";
                let object = { ...directory.object };

                if (!object.name) object.name = "{{name}}";
                if (!object.src) object.src = "{{source}}";
                if (!object.directory) object.directory = "{{directory}}";
                if (!object.path) object.path = "{{path}}";
                if (!object.pathname) object.pathname = "{{pathname}}";
                if (!object["content-type"])
                    object["content-type"] = "{{content-type}}";
                if (
                    !object.public &&
                    object.public !== false &&
                    object.public !== "false"
                )
                    object.public = "true";

                data.object = object;

                if (!data.object._id) {
                    data.filter = {
                        query: {
                            pathname
                        }
                    };
                }

                if (
                    options.translate &&
                    mimeType === "text/html" &&
                    Array.isArray(directory.languages) &&
                    !object.translations
                ) {
                    try {
                        const translations = await options.translate(
                            Buffer.isBuffer(source) ? decodeContent({ value: source, format: "text" }) : source,
                            directory.languages
                        );
                        data.object.translations = translations;
                    } catch (err) {
                        console.error("Translation error:", err);
                    }
                }

                if (directory.storage) data.storage = directory.storage;
                if (directory.database) data.database = directory.database;
                if (directory.array) data.array = directory.array || "files";

                for (const key of Object.keys(directory.object)) {
                    if (typeof directory.object[key] === "string") {
                        let variables = directory.object[key].match(
                            /{{([A-Za-z0-9_.,\[\]\-\/ ]*)}}/g
                        );
                        if (variables) {
                            for (let variable of variables) {
                                let replacement = values[variable];
                                if (key === 'src' && variable === '{{source}}' && Buffer.isBuffer(source)) {
                                    replacement = encodeContent({ value: source, contentType: mimeType, format: "data-url" });
                                }
                                data.object[key] = replaceTemplateVariable(
                                    data.object[key],
                                    variable,
                                    replacement
                                );
                            }
                        }
                    }
                }
            }

            if (skip !== "directory") {
                let response = await runStore(data);
                if (!response || response.error) {
                    console.error(`Upload not confirmed: ${filePath}`, response?.error || "No server confirmation received");
                } else if (isData) {
                    console.log(`Saved: ${entryPath}/${file}`);
                } else {
                    console.log(
                        `Uploaded: ${entryPath}/${file}`,
                        `To: ${pathname}`
                    );
                }
            }

            if (isDirectory && pathname) {
                let newEntry;
                if (entry.endsWith("/")) newEntry = entry + name;
                else newEntry = entry + "/" + name;

                await runFiles(directory, newEntry, pathname, name);
            }
        }
    }

    async function getSource(filePath, mimeType, isSymlink) {
        const base64MimeTypes = /^(image|audio|video|font\/(woff2?|ttf|otf|eot)|application\/vnd\.ms-fontobject|application\/x-font-.*|application\/octet-stream)/;
        const needsBase64 = base64MimeTypes.test(mimeType);

        let resolvedPath = filePath;
        if (isSymlink) {
            resolvedPath = await realpathAsync(filePath);
        }

        let fileBuffer;
        try {
            fileBuffer = await fs.promises.readFile(resolvedPath);
        } catch (error) {
            console.error(`Error reading file: ${resolvedPath}`, error);
            return "";
        }

        if (needsBase64) {
            return fileBuffer;
        } else {
            return decodeContent({ value: fileBuffer, format: "text" });
        }
    }

    async function getData(filePath, mimeType, isSymlink) {
        let resolvedPath = filePath;
        if (isSymlink) {
            resolvedPath = await realpathAsync(filePath);
        }

        try {
            const fileMimeType = getContentType({ pathname: resolvedPath, fallback: "text/plain" });
            if (fileMimeType === "application/json") {
                const text = await fs.promises.readFile(resolvedPath, "utf8");
                return JSON.parse(text);
            } else if (
                fileMimeType === "application/javascript" ||
                fileMimeType === "text/javascript"
            ) {
                const imported = await safeImport(resolvedPath);
                return imported || (await fs.promises.readFile(resolvedPath, "utf8"));
            } else {
                return await fs.promises.readFile(resolvedPath, "utf8");
            }
        } catch (error) {
            try {
                return await fs.promises.readFile(resolvedPath, "utf8");
            } catch (readErr) {
                console.error(`Failed to process file: ${resolvedPath}`, error);
                return "";
            }
        }
    }

    async function runSources() {
        const importedConfig = await safeImport(configPath);
        let newConfig = importedConfig || CoCreateConfig;

        for (let i = 0; i < sources.length; i++) {
            let data = sources[i];

            if (typeof data === "string") {
                let { value, filePath } = await processVariables(data);
                let response = await runStore(value);
                if (response && response.object && response.object[0]) {
                    await updateFilePath(filePath, response);
                }
            } else if (data.array && data.object) {
                if (typeof data.object === "string") {
                    let { value, filePath } = await processVariables(data.object);
                    if (value) {
                        let response = await runStore(value);
                        if (response && response.object && response.object[0]) {
                            await updateFilePath(filePath, response.object);
                        }
                    }
                } else if (typeof data.object === "object" && data.object !== null) {
                    for (const key in data) {
                        let { value } = await processVariables(data[key]);
                        if (data) {
                            data.object[key] = value;
                        }
                    }
                    let response = await runStore(data);
                    if (response && response.object && response.object[0] && response.object[0]._id) {
                        newConfig.sources[i].object._id = response.object[0]._id;
                    }
                }
            }
        }

        return newConfig;
    }

    async function processVariables(value) {
        let variableMatch = /{{\s*([\w\W]+)\s*}}/g.exec(value);
        if (!variableMatch) return { value, filePath: null };

        let entry = variableMatch[1].trim();
        if (!fs.existsSync(entry)) return { value, filePath: null };

        const filePath = path.resolve(configDirectoryPath, entry);

        let isMatched = match.some((pattern) => filePath.startsWith(pattern));
        if (!isMatched) return { value, filePath: null };

        let content;
        try {
            const fileMimeType = getContentType({ pathname: entry, fallback: "text/plain" });

            if (fileMimeType === "application/json") {
                content = JSON.parse(await fs.promises.readFile(filePath, "utf8"));
            } else if (fileMimeType === "application/javascript" || fileMimeType === "text/javascript") {
                const imported = await safeImport(filePath);
                content = imported || (await fs.promises.readFile(filePath, "utf8"));
            } else {
                content = await fs.promises.readFile(filePath, "utf8");
            }
        } catch (error) {
            console.error(`Failed to process file: ${filePath}`, error);
            return { value, filePath: null };
        }

        return { value: content, filePath };
    }

    async function updateFilePath(filePath, data) {
        try {
            const jsonData = JSON.stringify(data, null, 4);
            await fs.promises.writeFile(filePath, jsonData, "utf8");
            console.log(`File updated successfully at: ${filePath}`);
        } catch (error) {
            console.error(`Failed to update file at: ${filePath}`, error);
        }
    }

    async function runStore(data) {
        try {
            if (typeof data === "string" || (data && Array.isArray(data))) {
                return null;
            }
            let response;
            if (!data.object || (!data.object._id && !data.filter)) {
                response = await crud.send({
                    method: "object.create",
                    ...config,
                    ...data
                });
            } else {
                response = await crud.send({
                    method: "object.update",
                    ...config,
                    ...data,
                    upsert: true
                });
            }
            if (!response || response.error) failed++;
            return response;
        } catch (err) {
            failed++;
            console.error("Store error:", err);
            return null;
        }
    }

    async function run() {
        if (directories.length) {
            await runDirectories();
        }

        if (sources && sources.length) {
            let newConfig = await runSources();
            await fs.promises.writeFile(
                configPath,
                `export default ${JSON.stringify(newConfig, null, 4)};`
            );
        }
    }

    await run();

    if (!options.watch) {
        process.exit(failed ? 1 : 0);
    }
}

/**
 *
 * @public
 * @environment server
 */
export async function download(CoCreateConfig, configPath, match, options) {
    let config;
    try {
        config = await loadConfig(configPath);
    } catch (err) {
        console.log(err && err.message ? err.message : err);
        return [];
    }

    if (!config || !config.organization_id) {
        console.log('Failed to load auth config for download.');
        return [];
    }

    let pathArg = '';
    if (options && options.restorePath) {
        pathArg = options.restorePath;
    } else if (match && typeof match === 'string') {
        pathArg = match;
    } else if (match && Array.isArray(match) && match.length) {
        pathArg = match[0];
    }

    if (!pathArg) return [];

    console.log(`Downloading files for: ${pathArg}`);

    const pathname = pathArg.startsWith('/') ? pathArg : `/${pathArg}`;
    const isPrefix = pathname === '/' || pathname.endsWith('/');
    const escapedPathname = pathname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const query = isPrefix
        ? { pathname: { $regex: `^${escapedPathname}` } }
        : { pathname };
    const downloaded = [];
    let index = 0;
    let total;

    while (true) {
        const request = {
            ...config,
            method: 'object.read',
            array: 'files',
            organization_id: config.organization_id,
            filter: {
                query,
                sort: [
                    { key: 'pathname', direction: 'asc' },
                    { key: '_id', direction: 'asc' }
                ],
                index,
                limit: 1
            }
        };

        const response = await crud.send(request);
        const objects = response && Array.isArray(response.object)
            ? response.object
            : [];
        if (!objects.length) break;

        if (total === undefined && response.filter) {
            total = response.filter.count;
        }

        const objectPath = objects[0].pathname || objects[0].path;
        const progress = total === undefined
            ? `${index + 1}`
            : `${index + 1}/${total}`;
        console.log(`Downloading [${progress}] ${objectPath}`);

        const written = await writeFiles(
            objects,
            configPath,
            options && options.destination
        );
        downloaded.push(...written);
        index++;
    }

    if (!downloaded.length) {
        console.log('No stored files found for', pathArg);
    }

    return downloaded;
}

/**
 *
 * @public
 * @environment server
 */
export async function deleteFiles(CoCreateConfig, configPath, match, options) {
    let config;
    try {
        config = await loadConfig(configPath);
    } catch (err) {
        console.log(err && err.message ? err.message : err);
        return null;
    }

    if (!config || !config.organization_id) {
        console.log('Failed to load auth config for delete.');
        return null;
    }

    let pathArg = '';
    if (options && options.targetPath) {
        pathArg = options.targetPath;
    } else if (match && typeof match === 'string') {
        pathArg = match;
    } else if (match && Array.isArray(match) && match.length) {
        pathArg = match[0];
    }

    if (!pathArg) return null;

    let pathname = pathArg.startsWith('/') ? pathArg : `/${pathArg}`;

    let filter = {
        method: 'object.delete',
        array: 'files',
        filter: {
            query: {
                pathname: {
                    $regex: `^${pathname}`
                }
            }
        },
        ...config,
        organization_id: config.organization_id
    };

    let response = null;
    try {
        if (!options || options.confirm !== false) {
            console.log(`Deleting objects from ${pathname}`);
            response = await crud.send(filter);
        }
    } catch (err) {
        console.error("Delete files error:", err);
    }
    return response;
}

/**
 *
 * @name default
 * @kind member
 * @public
 * @environment server
 */

/**
 * Node-side file synchronization client for CoCreate. It uploads files from the local filesystem, downloads stored files, and deletes remote file records through the CRUD client.
 *
 * @module file
 * @environment server
 */
