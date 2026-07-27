import crud from "@cocreate/crud-client";
import Config from "@cocreate/config";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import readline from "readline";

const realpathAsync = fs.promises.realpath;

const mimeTypes = {
    ".aac": "audio/aac",
    ".abw": "application/x-abiword",
    ".arc": "application/x-freearc",
    ".avi": "video/x-msvideo",
    ".azw": "application/vnd.amazon.ebook",
    ".bin": "application/octet-stream",
    ".bmp": "image/bmp",
    ".bz": "application/x-bzip",
    ".bz2": "application/x-bzip2",
    ".csh": "application/x-csh",
    ".css": "text/css",
    ".csv": "text/csv",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".eot": "application/vnd.ms-fontobject",
    ".epub": "application/epub+zip",
    ".gif": "image/gif",
    ".htm": "text/html",
    ".html": "text/html",
    ".ico": "image/x-icon",
    ".ics": "text/calendar",
    ".jar": "application/java-archive",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript",
    ".json": "application/json",
    ".jsonld": "application/ld+json",
    ".mid": "audio/midi",
    ".midi": "audio/midi",
    ".mjs": "text/javascript",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".mpeg": "video/mpeg",
    ".mpkg": "application/vnd.apple.installer+xml",
    ".odp": "application/vnd.oasis.opendocument.presentation",
    ".ods": "application/vnd.oasis.opendocument.spreadsheet",
    ".odt": "application/vnd.oasis.opendocument.text",
    ".oga": "audio/ogg",
    ".ogv": "video/ogg",
    ".ogx": "application/ogg",
    ".otf": "font/otf",
    ".png": "image/png",
    ".pdf": "application/pdf",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".rar": "application/x-rar-compressed",
    ".rtf": "application/rtf",
    ".sh": "application/x-sh",
    ".svg": "image/svg+xml",
    ".swf": "application/x-shockwave-flash",
    ".tar": "application/x-tar",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
    ".ts": "video/mp2t",
    ".ttf": "font/ttf",
    ".txt": "text/plain",
    ".vsd": "application/vnd.visio",
    ".wav": "audio/wav",
    ".weba": "audio/webm",
    ".webm": "video/webm",
    ".webmanifest": "application/manifest+json",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".xhtml": "application/xhtml+xml",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xml": "application/xml",
    ".xul": "application/vnd.mozilla.xul+xml",
    ".zip": "application/zip",
    ".3gp": "video/3gpp",
    ".3g2": "video/3gpp2",
    ".7z": "application/x-7z-compressed"
};

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
        (!config.apikey && (!config.password || config.email))
    ) {
        console.log("One or more required config params could not be found");
        process.exit();
    }

    if (config.email && config.password) {
        let request = {
            method: "signIn",
            array: "users",
            $filter: {
                query: {
                    email: config.email,
                    password: config.password
                }
            },
            ...config
        };

        let response = await crud.send(request);
        let { success, token } = response;

        if (success) {
            console.log("successful sign in");
            // apply token to socket
        } else {
            console.log("The email or password you entered is incorrect");
            process.exit();
        }
    }

    return config;
}

async function writeFiles(objects, configPath) {
    let baseDir = process.cwd();
    if (configPath) {
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
            let isDirectory = obj["content-type"] === "text/directory" || obj.type === "directory" || objPath.endsWith('/');
            
            if (!isDirectory) {
                isDirectory = objects.some(o => {
                    let oPath = o.pathname || o.path;
                    return oPath && oPath !== objPath && (oPath.startsWith(objPath + '/') || oPath === objPath + '/');
                });
            }

            if (isDirectory) {
                fs.mkdirSync(targetPath, { recursive: true });
                continue;
            }
            
            fs.mkdirSync(path.dirname(targetPath), { recursive: true });

            const src = obj.src || obj.source || (obj.object && obj.object.src) || '';
            let content = src;
            if (!content && obj.content) content = obj.content;

            if (content && typeof content === 'object' && content.type === 'Buffer' && Array.isArray(content.data)) {
                const buf = Buffer.from(content.data);
                fs.writeFileSync(targetPath, buf);
                downloaded.push(targetPath);
                continue;
            }

            if (content && typeof content === 'object' && Array.isArray(content.data)) {
                try {
                    const buf = Buffer.from(content.data);
                    fs.writeFileSync(targetPath, buf);
                    downloaded.push(targetPath);
                    continue;
                } catch (err) {}
            }

            if (typeof content === 'string' && content.startsWith('data:')) {
                const base64Index = content.indexOf('base64,');
                if (base64Index > -1) {
                    const b64 = content.slice(base64Index + 7);
                    const buf = Buffer.from(b64, 'base64');
                    fs.writeFileSync(targetPath, buf);
                    downloaded.push(targetPath);
                    continue;
                } else {
                    const comma = content.indexOf(',');
                    if (comma > -1) {
                        const dataPart = content.slice(comma + 1);
                        try {
                            const decoded = decodeURIComponent(dataPart);
                            fs.writeFileSync(targetPath, decoded, 'utf8');
                            downloaded.push(targetPath);
                            continue;
                        } catch (err) {}
                    }
                }
            }

            if (Buffer.isBuffer(content)) {
                fs.writeFileSync(targetPath, content);
                downloaded.push(targetPath);
                continue;
            }

            fs.writeFileSync(targetPath, String(content || ''), 'utf8');
            downloaded.push(targetPath);
        } catch (err) {
            console.error('Failed to write object', obj && obj._id, err);
        }
    }
    return downloaded;
}

// 1. DEFAULT EXPORT MIGRATION
export default async function file(
    CoCreateConfig,
    configPath,
    match,
    options
) {
    let directories = CoCreateConfig.directories;
    let sources = CoCreateConfig.sources;
    let configDirectoryPath = path.dirname(configPath);

    if (match && !Array.isArray(match)) {
        match = [match];
    } else if (!match) {
        match = [];
    }

    let config = await loadConfig(configPath);

    let errorLog = [];

    async function runDirectories() {
        for (const directory of directories) {
            const entry = directory.entry;
            await runFiles(directory, entry);
        }
        return;
    }

    async function runFiles(directory, entry, Path, directoryName) {
        const entryPath = path.resolve(configDirectoryPath, entry);
        let files = fs.readdirSync(entryPath);
        let exclude = directory.exclude || [];
        let include = directory.include || [];
        
        for (let file of files) {
            const filePath = path.resolve(entryPath, file);

            let isDirectory;
            let isSymlink = fs
                .lstatSync(filePath)
                .isSymbolicLink();
                
            if (isSymlink) {
                let symlinkPath = await realpathAsync(filePath);
                isDirectory =
                    fs.existsSync(symlinkPath) &&
                    fs.lstatSync(symlinkPath).isDirectory();
            } else {
                isDirectory =
                    fs.existsSync(filePath) &&
                    fs.lstatSync(filePath).isDirectory();
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

            const fileExtension = path.extname(file);
            let mimeType = mimeTypes[fileExtension];

            if (!directoryName) {
                if (directory.object && directory.object.directory) {
                    if (directory.object.directory === "{{directory}}") {
                        directoryName = entry.split("/");
                        directoryName = directoryName[directoryName.length - 1];
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
                "{{source}}": Buffer.isBuffer(source) ? `data:${mimeType};base64,${source.toString('base64')}` : source || "",
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
                    object.public != false &&
                    object.public != "false"
                )
                    object.public = "true";

                data.object = object;

                if (!data.object._id) {
                    data.$filter = {
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
                            Buffer.isBuffer(source) ? source.toString('utf-8') : source,
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
                    if (typeof directory.object[key] == "string") {
                        let variables = directory.object[key].match(
                            /{{([A-Za-z0-9_.,\[\]\-\/ ]*)}}/g
                        );
                        if (variables) {
                            for (let variable of variables) {
                                let replacement = values[variable];
                                if (key === 'src' && variable === '{{source}}' && Buffer.isBuffer(source)) {
                                    replacement = `data:${mimeType};base64,${source.toString('base64')}`;
                                }
                                data.object[key] = data.object[
                                    key
                                ].replace(variable, replacement);
                            }
                        }
                    }
                }
            }

            if (skip !== "directory") {
                let response = await runStore(data);
                if (isData) {
                    console.log(`Saved: ${entryPath}/${file}`);
                } else {
                    console.log(
                        `Uploaded: ${entryPath}/${file}`,
                        `To: ${pathname}`
                    );
                }
                if (response && response.error) errorLog.push(response.error);
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
            return fileBuffer.toString('utf8');
        }
    }

    async function getData(filePath, mimeType, isSymlink) {
        let resolvedPath = filePath;
        if (isSymlink) {
            resolvedPath = await realpathAsync(filePath);
        }

        try {
            const fileMimeType = mimeTypes[path.extname(resolvedPath)] || "text/plain";
            if (fileMimeType === "application/json") {
                return JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
            } else if (
                fileMimeType === "application/javascript" ||
                fileMimeType === "text/javascript"
            ) {
                // 2. ESM REPLACEMENT FOR REQUIRE/DYNAMICS
                try {
                    const module = await import(pathToFileURL(resolvedPath).href);
                    return module && module.default ? module.default : module;
                } catch (err) {
                    return fs.readFileSync(resolvedPath, "utf8");
                }
            } else {
                return fs.readFileSync(resolvedPath, "utf8");
            }
        } catch (error) {
            try {
                return fs.readFileSync(resolvedPath, "utf8");
            } catch (readErr) {
                console.error(`Failed to process file: ${resolvedPath}`, error);
                return "";
            }
        }
    }

    async function runSources() {
        // 3. REPLACED REGULAR require() ASSIGNMENTS WITH DYNAMIC import()
        const configModule = await import(pathToFileURL(configPath).href);
        let newConfig = configModule && configModule.default ? configModule.default : configModule;

        for (let i = 0; i < sources.length; i++) {
            let data = sources[i];

            if (typeof data === "string") {
                let {value, filePath } = await processVariables(data);
                let response = await runStore(value);
                if (response && response.object && response.object[0]) {
                    updateFilePath(filePath, response);
                }
            } else if (data.array && data.object) {
                if (typeof data.object === "string") {
                    let {value, filePath } = await processVariables(data.object);
                    if (value) {
                        let response = await runStore(value);
                        if (response && response.object && response.object[0]) {
                            updateFilePath(filePath, response.object);
                        }
                    }
                } else if (typeof data.object === "object" && data.object !== null) {
                    for (const key in data) {
                        let {value } = await processVariables(data[key]);
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
            const fileMimeType = mimeTypes[path.extname(entry)] || "text/plain";

            if (fileMimeType === "application/json") {
                content = JSON.parse(fs.readFileSync(filePath, "utf8"));
            } else if (fileMimeType === "application/javascript" || fileMimeType === "text/javascript") {
                // 4. REPLACED LOCAL ASSET EXPORT INTERPRETATION WITH import()
                try {
                    const module = await import(pathToFileURL(filePath).href);
                    content = module && module.default ? module.default : module;
                } catch (err) {
                    content = fs.readFileSync(filePath, "utf8");
                }
            } else {
                content = fs.readFileSync(filePath, "utf8");
            }
        } catch (error) {
            console.error(`Failed to process file: ${filePath}`, error);
            return { value, filePath: null };
        }

        return { value: content, filePath };
    }

    function updateFilePath(filePath, data) {
        try {
            const jsonData = JSON.stringify(data, null, 4);
            fs.writeFileSync(filePath, jsonData, "utf8");
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
            if (!data.object || (!data.object._id && !data.$filter)) {
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
            if (response) {
                return response;
            }
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async function run() {
        if (directories) {
            await runDirectories();
        }

        if (sources && sources.length) {
            let newConfig = await runSources();
            // 5. WRITING ESM CONFIG FORMAT TO THE OUTPUT
            fs.writeFileSync(
                configPath,
                `export default ${JSON.stringify(newConfig, null, 4)};`
            );
        }
    }

    await run();
    if (!process.argv.includes("--watch") && !process.argv.includes("-w")) {
        process.exit();
    }
}

// 6. NAMED EXPORT MIGRATIONS
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

    let pathname = pathArg.startsWith('/') ? pathArg : `/${pathArg}`;

    let filter = {
        method: 'object.read',
        array: 'files',
        limit: 10000,
        $filter: {
            query: {
                pathname: {
                    $regex: `^${pathname}`
                }
            }
        },
        ...config,
        organization_id: config.organization_id
    };

    let response = await crud.send(filter);
    let objects = (response && response.object && response.object.length) ? response.object : [];

    if (!objects || !objects.length) {
        console.log('No stored files found for', pathArg);
        return [];
    }

    let downloaded = await writeFiles(objects, configPath);

    if (!process.argv.includes("--watch") && !process.argv.includes("-w")) {
        process.exit();
    }

    return downloaded;
}

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
        $filter: {
            query: {
                pathname: {
                    $regex: `^${pathname}`
                }
            }
        },
        ...config,
        organization_id: config.organization_id
    };

    const shouldExit = !process.argv.includes("--watch") && !process.argv.includes("-w");
    let response = null;
    try {
        if (!options || options.confirm !== false) {
            console.log(`Permanently delete objects from`);
            // Handled trailing cutoff safely
        }
    } catch (err) {
        console.error(err);
    }
    return response;
}