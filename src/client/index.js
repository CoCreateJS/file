/********************************************************************************
 * Copyright (C) 2023 CoCreate and Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ********************************************************************************/

/**
 * Commercial Licensing Information:
 * For commercial use of this software without the copyleft provisions of the AGPLv3,
 * you must obtain a commercial license from CoCreate LLC.
 * For details, visit <https://cocreate.app/licenses/> or contact us at sales@cocreate.app.
 */

import { toCSV } from "./csv.js";
import { createTransfer, getRawExport } from "./transfer.js";

import Observer from "@cocreate/observer";
import Crud from "@cocreate/crud-client";
import Elements from "@cocreate/elements";
import Actions from "@cocreate/actions";
import { render } from "@cocreate/render";
import { queryElements } from "@cocreate/utils";
import { encodeContent, decodeContent, getContentType } from "@cocreate/utils/file";
import { setValue } from "@cocreate/element-prototype";

const inputs = new Map();
const Files = new Map();
const dropTargets = new WeakMap();
const fileForDropTargets = new WeakSet();
const fileSelectElements = new WeakSet();
const dropControllers = new Set();
let dropTargetObserver;
const fileForAttribute = "file-for";
const fileForControllers = new WeakMap();

/**
 * Initializes file elements. If no parameter is provided, it queries and initializes all elements with type="file".
 * It can also initialize a single element or an array of elements. Specifically focuses on elements of type 'file'.
 *
 * @param {(Element|Element[]|null)} [elements] - Optional. An element, an array of elements, or null.
 *      - If null or omitted, the function queries and initializes all elements in the document with type="file".
 *      - If a single element is provided, it initializes that element (assuming it is of type "file").
 *      - If an array of elements is provided, each element in the array is initialized.
 */
async function init(elements) {
	if (!elements) elements = document.querySelectorAll('[type="file"]');
	else if (!Array.isArray(elements)) elements = [elements];
	for (let i = 0; i < elements.length; i++) {
		let nestedInput,
			isInput = elements[i].tagName === "INPUT";
		if (!isInput) {
			nestedInput = elements[i].querySelector('input[type="file"]');
		}

		elements[i].getValue = async () => await getFiles([elements[i]]);
		elements[i].getFiles = async () => await getFiles([elements[i]]);
		elements[i].getValueSync = () => {
			const selected = inputs.get(elements[i]);
			return selected ? getRenderableFiles(selected.values()) : [];
		};
		elements[i].setValue = (files) => setFiles(elements[i], files);
		elements[i].renderValue = (files) => setFiles(elements[i], files);
		initDropTargets(elements[i]);

		// if (elements[i].renderValue) {
		//     let data = await elements[i].getValue()
		//     if (data)
		//         elements[i].setValue(data)
		// }

		if (elements[i].hasAttribute("directory")) {
			if (!isInput && window.showDirectoryPicker)
				elements[i].addEventListener("click", fileEvent);
			else if ("webkitdirectory" in elements[i]) {
				elements[i].webkitdirectory = true;
				if (!isInput && !nestedInput) {
					nestedInput = document.createElement("input");
					nestedInput.type = "file";
					nestedInput.setAttribute("hidden", "");
					elements[i].appendChild(nestedInput);
					nestedInput.fileElement = elements[i];
				}

				if (nestedInput) {
					elements[i].addEventListener("click", function () {
						nestedInput.click();
					});
					nestedInput.addEventListener("change", fileEvent);
				} else elements[i].addEventListener("change", fileEvent);
			} else
				console.error(
					"Directory selection not supported in this browser."
				);
		} else if (!isInput && window.showOpenFilePicker)
			elements[i].addEventListener("click", fileEvent);
		else {
			if (!isInput && !nestedInput) {
				nestedInput = document.createElement("input");
				nestedInput.type = "file";
				nestedInput.setAttribute("hidden", "");
				elements[i].appendChild(nestedInput);
				nestedInput.fileElement = elements[i];
			}

			if (nestedInput) {
				elements[i].addEventListener("click", function () {
					nestedInput.click();
				});
				nestedInput.addEventListener("change", fileEvent);
			} else elements[i].addEventListener("change", fileEvent);
		}
	}
}

function initDropTargets(input) {
	if (!input.hasAttribute?.("file-drop-query")) return;
	dropControllers.add(input);
	observeDropTargets();

	const targets = queryElements({ element: input, prefix: "file-drop" });
	for (const target of targets) {
		let controllers = dropTargets.get(target);
		if (!controllers) {
			controllers = new WeakSet();
			dropTargets.set(target, controllers);
		}
		if (controllers.has(input)) continue;
		controllers.add(input);

		const hasFiles = (event) =>
			Array.from(event.dataTransfer?.types || []).includes("Files");
		const activate = (event) => {
			if (!hasFiles(event)) return;
			event.preventDefault();
			target.setAttribute("file-drop-active", "");
		};
		const deactivate = (event) => {
			if (event.relatedTarget && target.contains(event.relatedTarget)) return;
			target.removeAttribute("file-drop-active");
		};

		target.addEventListener("dragenter", activate);
		target.addEventListener("dragover", activate);
		target.addEventListener("dragleave", deactivate);
		target.addEventListener("drop", async (event) => {
			if (!hasFiles(event)) return;
			event.preventDefault();
			target.removeAttribute("file-drop-active");
			await fileEvent(event, input);
		});
	}
}

function observeDropTargets() {
	if (dropTargetObserver || typeof MutationObserver === "undefined") return;

	dropTargetObserver = new MutationObserver(() => {
		for (const input of dropControllers) {
			if (!input.isConnected) {
				dropControllers.delete(input);
				continue;
			}
			initDropTargets(input);
		}
	});
	dropTargetObserver.observe(document.documentElement, {
		childList: true,
		subtree: true
	});
}

function initFileForDropTarget(target) {
	if (fileForDropTargets.has(target)) return;
	fileForDropTargets.add(target);

	const hasFiles = (event) =>
		Array.from(event.dataTransfer?.types || []).includes("Files");
	const activate = (event) => {
		if (!hasFiles(event) || !resolveFileController(target)) return;
		event.preventDefault();
		target.setAttribute("file-drop-active", "");
	};
	const deactivate = (event) => {
		if (event.relatedTarget && target.contains(event.relatedTarget)) return;
		target.removeAttribute("file-drop-active");
	};

	target.addEventListener("dragenter", activate);
	target.addEventListener("dragover", activate);
	target.addEventListener("dragleave", deactivate);
	target.addEventListener("drop", async (event) => {
		if (!hasFiles(event)) return;
		const controller = resolveFileController(target);
		if (!controller) return;

		event.preventDefault();
		target.removeAttribute("file-drop-active");
		await fileEvent(event, controller);
	});
}

function resolveFileController(element) {
	let current = element;
	while (current) {
		const controllerId = current.getAttribute?.(fileForAttribute)?.trim();
		if (controllerId) {
			const controller = document.getElementById(
				controllerId.replace(/^#/, "")
			);
			return controller?.matches?.('input[type="file"]')
				? controller
				: null;
		}
		current = current.parentElement;
	}
	return null;
}

function getFileForElements(controller) {
	return Array.from(document.querySelectorAll(`[${fileForAttribute}]`)).filter(
		(element) => resolveFileController(element) === controller
	);
}

function syncFileCapture(element) {
	const input = resolveFileController(element);
	if (!input || !element.hasAttribute("file-capture")) return;

	const capture = element.getAttribute("file-capture");
	if (!capture || capture === "false") {
		input.removeAttribute("capture");
	} else {
		input.setAttribute("capture", capture);
	}
}

async function getFileSelectValue(element) {
	const renderController = element.closest("[render-query]");
	const renderedElement = element.closest("[render-clone]");
	if (!renderController?.getData || !renderedElement) return;

	const data = await renderController.getData();
	const renderKey = renderController.getAttribute("render") || "object";
	const records = Array.isArray(data) ? data : data?.[renderKey];
	if (!Array.isArray(records)) return;

	const objectId = renderedElement.getAttribute("object") ||
		renderedElement.getAttribute("eid");
	const file = records.find(record =>
		String(record?._id || record?.id || record?.pathname) === String(objectId)
	);
	if (!file) return;

	const selectedFile = { ...file };

	if (!selectedFile.id) {
		selectedFile.id = selectedFile._id || selectedFile.pathname;
	}
	if (!selectedFile.src) {
		const preview = element.querySelector("img[src], video[src], audio[src]");
		const renderedPreview = preview || renderedElement.querySelector(
			"img[src], video[src], audio[src]"
		);
		if (renderedPreview) {
			selectedFile.src = renderedPreview.currentSrc || renderedPreview.src;
		}
	}
	return selectedFile;
}

function initFileSelect(element) {
	if (fileSelectElements.has(element)) return;
	fileSelectElements.add(element);

	element.addEventListener("click", async (event) => {
		// A label click produces a second click on its nested form control.
		if (event.target !== element && event.target.matches?.("input, select, textarea")) {
			return;
		}

		const controller = resolveFileController(element);
		const file = await getFileSelectValue(element);
		if (!controller || !file) return;

		setFiles(controller, [file]);
		controller.dispatchEvent(new CustomEvent("filesSelected", { bubbles: true }));
		controller.dispatchEvent(new Event("input", { bubbles: true }));
		controller.dispatchEvent(new Event("change", { bubbles: true }));
	});
}

function getRenderableFiles(files) {
	return Array.from(files || [], (file) => ({
		...file,
		name: file.name,
		type: file.type,
		size: file.size,
		lastModified: file.lastModified,
		webkitRelativePath: file.webkitRelativePath
	}));
}

function acceptToFilterValue(accept) {
	const patterns = String(accept || "")
		.split(",")
		.map((value) => value.trim().toLowerCase())
		.filter((value) => value && value !== "*/*" && value.includes("/"))
		.map((value) => {
			const wildcard = value.endsWith("/*");
			const pattern = wildcard ? value.slice(0, -1) : value;
			const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			return wildcard ? `${escaped}.*` : escaped;
		});

	if (!patterns.length) return "";
	if (patterns.length === 1) {
		return patterns[0].endsWith("/.*")
			? `^${patterns[0].slice(0, -2)}`
			: `^${patterns[0]}$`;
	}
	return `^(?:${patterns.join("|")})$`;
}

function applyFileFor(element) {
	if (!element?.matches?.(`[${fileForAttribute}]`)) return;

	const controller = resolveFileController(element);
	const previousController = fileForControllers.get(element);
	if (controller) {
		fileForControllers.set(element, controller);
		if (element.hasAttribute("file-dropzone")) {
			initFileForDropTarget(element);
		}
		if (element.tagName === "LABEL") {
			element.htmlFor = controller.id;
			if (!element.fileCaptureEvent) {
				element.fileCaptureEvent = () => syncFileCapture(element);
				element.addEventListener(
					"mouseover",
					element.fileCaptureEvent
				);
				element.addEventListener(
					"pointerdown",
					element.fileCaptureEvent,
					{ capture: true }
				);
				element.addEventListener(
					"touchstart",
					element.fileCaptureEvent,
					{ capture: true, passive: true }
				);
				element.addEventListener(
					"click",
					element.fileCaptureEvent,
					{ capture: true }
				);
			}
		}

		if (element.hasAttribute("filter-query-key")) {
			const filterValue = acceptToFilterValue(controller.accept);
			if (filterValue) {
				element.setAttribute("filter-query-value", filterValue);
			} else {
				element.removeAttribute("filter-query-value");
			}
		}

		if (
			element.matches("template, [template], .template, [render]") &&
			!element.hasAttribute("render-query") &&
			!element.hasAttribute("render-clone")
		) {
			const selected = inputs.get(controller);
			render({
				source: controller,
				element: [element],
				data: selected ? getRenderableFiles(selected.values()) : [],
				key: "object"
			});
		}
	} else {
		fileForControllers.delete(element);
		if (element.tagName === "LABEL") element.removeAttribute("for");
		if (element.hasAttribute("filter-query-key")) {
			element.removeAttribute("filter-query-value");
		}
		if (
			previousController &&
			element.matches("template, [template], .template, [render]") &&
			!element.hasAttribute("render-query") &&
			!element.hasAttribute("render-clone")
		) {
			render({
				source: previousController,
				element: [element],
				data: [],
				key: "object"
			});
		}
	}

	for (const child of element.querySelectorAll?.(`[${fileForAttribute}]`) || []) {
		applyFileFor(child);
	}
}

function refreshFileForController(controller) {
	for (const element of getFileForElements(controller)) {
		applyFileFor(element);
	}
}

function acceptsFile(input, file) {
	const accept = input.accept || input.getAttribute("accept") || "";
	const types = accept
		.split(",")
		.map((type) => type.trim().toLowerCase())
		.filter(Boolean);
	if (!types.length) return true;

	const name = (file.name || "").toLowerCase();
	const mime = (file.type || "").toLowerCase();
	return types.some((type) => {
		if (type.startsWith(".")) return name.endsWith(type);
		if (type.endsWith("/*")) return mime.startsWith(type.slice(0, -1));
		return mime === type;
	});
}

async function fileEvent(event, controller) {
	try {
		// Render dispatches synthetic input/change events after updating a
		// template. Do not treat that notification as another file selection.
		if (event.type === "change" && event.isTrusted === false) return;
		const fileInput = controller || event.currentTarget;
		let input = fileInput.fileElement || fileInput;
		let multiple = input.multiple;

		// If 'multiple' is not explicitly set, check the attribute.
		if (multiple !== true && multiple !== false) {
			multiple = input.getAttribute("multiple");
			multiple = multiple !== null && multiple !== "false";
			input.multiple = multiple;
		}

		let selected = inputs.get(input) || new Map();
		const isDrop = Boolean(event.dataTransfer);
		let files = isDrop
			? Array.from(event.dataTransfer.files || []).filter((file) =>
				acceptsFile(input, file)
			)
			: fileInput.files;
		if (isDrop && !multiple && files.length > 1) files = files.slice(0, 1);
		if (!files || !files.length) {
			event.preventDefault();
			if (isDrop) return;
			if (input.hasAttribute("directory")) {
				let handle = await window.showDirectoryPicker();
				let file = {
					name: handle.name,
					directory: "/",
					path: "/" + handle.name,
					type: "text/directory",
					"content-type": "text/directory"
				};
				file.input = input;
				file.id = await getFileId(file);
				if (selected.has(file.id)) {
					console.log(
						"Duplicate file has been selected. This could be in error as the browser does not provide a clear way of checking duplictaes"
					);
				}

				file.handle = handle;

				if (!multiple) {
					for (let [id] of selected) {
						Files.delete(id);
					}
					selected.clear();
				}

				selected.set(file.id, file);
				Files.set(file.id, file);

				files = await getDirectoryHandles(handle, handle.name);
			} else {
				files = await window.showOpenFilePicker({ multiple });
			}
		}

		for (let i = 0; i < files.length; i++) {
			const handle = files[i];
			if (files[i].kind === "file") {
				files[i] = await files[i].getFile();
				files[i].handle = handle;
			} else if (files[i].kind === "directory") {
				files[i].handle = handle;
			}

			if (!files[i].src) await readFile(files[i]);
			// if (!files[i].src)
			//     files[i].src = files[i]

			// if (!files[i].src.name)
			//     files[i].src = files[i]

			if (!files[i].size) files[i].size = handle.size;

			let configuredPath = input.getAttribute("path") || "/";
			if (!configuredPath.startsWith("/")) configuredPath = "/" + configuredPath;
			if (!configuredPath.endsWith("/")) configuredPath += "/";
			const configuredDirectory = configuredPath === "/"
				? "/"
				: configuredPath.split("/").filter(Boolean).pop();
			files[i].directory = handle.directory || configuredDirectory;
			files[i].path = handle.path || configuredPath;
			files[i].pathname = handle.pathname || configuredPath + handle.name;
			files[i]["content-type"] = files[i].type;
			files[i].input = input;
			files[i].id = await getFileId(files[i]);
			if (selected.has(files[i].id)) {
				console.log(
					"Duplicate file has been selected. This could be in error as the browser does not provide a clear way of checking duplictaes"
				);
			}

			if (!multiple) {
				for (let [id] of selected) {
					Files.delete(id);
				}
				selected.clear();
			}

			selected.set(files[i].id, files[i]);
			Files.set(files[i].id, files[i]);
		}

		if (selected.size) {
			inputs.set(input, selected);
			// console.log("Files selected:", selected);

			if (input.renderValue)
				input.renderValue(Array.from(selected.values()));

			input.dispatchEvent(new CustomEvent("filesSelected", { bubbles: true }));

			const isImport = input.getAttribute("import");
			const isRealtime = input.getAttribute("realtime");
			if (isRealtime && isRealtime !== "false") {
				if (isImport || isImport == "") {
					Import(input);
				} else if (input.save) input.save();
			}
		}
	} catch (error) {
		if (error.name !== "AbortError") {
			console.error("Error selecting directory:", error);
		}
	}
}

async function getDirectoryHandles(handle, name) {
	let handles = [];
	for await (const entry of handle.values()) {
		entry.directory = name;
		entry.path = "/" + name + "/";
		entry.pathname = "/" + name + "/" + entry.name;
		if (!entry.webkitRelativePath) entry.webkitRelativePath = name;

		if (entry.kind === "file") {
			handles.push(entry);
		} else if (entry.kind === "directory") {
			entry.type = "text/directory";
			handles.push(entry);
			const entries = await getDirectoryHandles(
				entry,
				name + "/" + entry.name
			);
			handles = handles.concat(entries);
		}
	}
	return handles;
}

async function getFileId(file) {
	if ((file.id = file.pathname)) {
		return file.id;
	} else {
		file.id = `${file.name}${file.size}${file.type}${file.lastModified}`;
		return file.id;
	}
}

async function getFiles(fileInputs, readAs) {
	const files = [];

	if (!Array.isArray(fileInputs)) fileInputs = [fileInputs];

	for (let input of fileInputs) {
		const selected = inputs.get(input);
		if (selected) {
			for (let file of Array.from(selected.values())) {
				if (!file.src) {
					// if (readAs === 'blob')
					file.src = file;
					// else
					//     await readFile(file, readAs)
				}

				let fileObject = { ...file };
				fileObject.size = file.size;
				fileObject.name = file.name;
				fileObject.type = file.type;
				fileObject.lastModified = file.lastModified;
				await getCustomData(fileObject);

				files.push(fileObject);
			}
		}
	}

	return files;
}

async function getCustomData(file) {
	if (!file.id) file.id = file.pathname;
	// TODO: Consider potential replacment of file_id, perhaps supporting selector
	let form = document.querySelector(`[file_id="${file.id}"]`);
	if (form) {
		let elements = form.querySelectorAll("[file]");
		for (let i = 0; i < elements.length; i++) {
			let name = elements[i].getAttribute("file");
			if (name) {
				file[name] = await elements[i].getValue();
			}
		}
	}

	delete file.input;

	return file;
}

// This function reads the file and returns its src
async function readFile(file, readAs) {
    const fileType = getContentType({ contentType: file.type, fallback: "" }).split("/");
    if (fileType[1] === "directory" || readAs === "blob") return file;

    if (!readAs) {
        if (["image", "video", "audio"].includes(fileType[0]) || fileType[1] === "pdf") {
            readAs = "readAsDataURL";
        } else if (["doc", "msword", "docx", "xlsx", "pptx"].includes(fileType[1])) {
            readAs = "readAsBinaryString";
        } else {
            readAs = "readAsText";
        }
    }

    if (readAs === "readAsDataURL") {
        file.src = await encodeContent({ value: file, contentType: file.type || "application/octet-stream", format: "data-url" });
    } else {
        const format = {
            readAsText: "text",
            readAsBinaryString: "binary",
            readAsArrayBuffer: "arraybuffer"
        }[readAs];
        if (!format) throw new TypeError(`Unsupported file read mode: ${readAs}`);
        file.src = await decodeContent({ value: file, format, charset: "auto" });
    }
    return file;
}

function setFiles(element, files) {
	if (!files || typeof files !== "object") return;
	if (!Array.isArray(files)) files = [files];
	else if (!files.length) return;

	let selected = inputs.get(element) || new Map();

	if (!element.multiple) {
		for (let key of selected.keys()) {
			selected.delete(key); // Remove the entry from the selected map
			Files.delete(key); // Remove the corresponding entry from the Files map
		}
	}
	for (let i = 0; i < files.length; i++) {
		if (!files[i].id) files[i].id = files[i].pathname;
		files[i].input = element;
		selected.set(files[i].id, files[i]);
		Files.set(files[i].id, files[i]);
	}

	inputs.set(element, selected);
	if (element.renderValue)
		render({
			source: element,
			data: getRenderableFiles(selected.values()),
			key: "object"
		});

	const renderTargets = getFileForElements(element).filter(
		(target) =>
			target.matches("template, [template], .template, [render]") &&
			!target.hasAttribute("render-query") &&
			!target.hasAttribute("render-clone")
	);
	if (renderTargets.length) {
		render({
			source: element,
			element: renderTargets,
			data: getRenderableFiles(selected.values()),
			key: "object"
		});
	}
}

// TODO: Could this benifit from media processing to save results locally
async function save(element, action, data) {
	try {
		if (!data) data = [];

		if (!Array.isArray(element)) element = [element];

		for (let i = 0; i < element.length; i++) {
			const inputs = [];
			if (element[i].type === "file") inputs.push(element[i]);
			else if (element[i].tagName === "form") {
				let fileInputs =
					element[i].querySelectorAll('input[type="file"]');
				inputs.push(...fileInputs);
			} else {
				const form = element[i].closest("form");
				if (form)
					inputs.push(...form.querySelectorAll('input[type="file"]'));
			}

			for (let input of inputs) {
				let files = await getFiles(input);

				for (let i = 0; i < files.length; i++) {
					if (!files[i].src) continue;

					if (files[i].handle && action !== "download") {
						if (action === "saveAs") {
							if (files[i].kind === "file") {
								const options = {
									suggestedName: files[i].name,
									types: [
										{
											description: "Text Files"
										}
									]
								};
								files[i].handle =
									await window.showSaveFilePicker(options);
							} else if (files[i].kind === "directory") {
								// Create a new subdirectory
								files[i].handle = await files[
									i
								].handle.getDirectoryHandle("new_directory", {
									create: true
								});
								return;
							}
						}

						if (files[i].handle.kind === "directory") continue;

						const writable = await files[i].handle.createWritable();
						await writable.write(files[i].src);
						await writable.close();
					} else {
						const blob = new Blob([files[i].src], {
							type: files[i].type
						});

						// Create a temporary <a> element to trigger the file download
						const downloadLink = document.createElement("a");
						downloadLink.href = URL.createObjectURL(blob);
						downloadLink.download = files[i].name;

						// Trigger the download
						downloadLink.click();
					}
				}
			}

			let queryElements = queryElements({
				element: element[i],
				prefix: action
			});
			if (queryElements.length) {
				save(queryElements, action, data);
			}
		}
		return data;
	} catch (error) {
		if (error.name !== "AbortError") {
			console.error("Error selecting files:", error);
		}
	}
}

async function upload(element, data) {
	if (!data) data = [];

	if (!Array.isArray(element)) element = [element];

	for (let i = 0; i < element.length; i++) {
		const fileInputs = [];
		if (element[i].type === "file") fileInputs.push(element[i]);
		else if (element[i].tagName === "form") {
			fileInputs.push(
				...element[i].querySelectorAll('input[type="file"]')
			);
		} else {
			const form = element[i].closest("form");
			if (form)
				fileInputs.push(...form.querySelectorAll('input[type="file"]'));
		}

		for (let input of fileInputs) {
			let Data = Elements.getObject(input);
			let object = input.getAttribute("object") || "";
			let key = input.getAttribute("key");

			Data.broadcastClient = false;
			Data.method = "object.update";
			if (!Data.array) Data.array = "files";

			let path = input.getAttribute("path");
			let directory = "/";

			if (path) {
				directory = path.split("/");
				directory = directory[directory.length - 1];
				if (!path.endsWith("/")) path += "/";
			} else path = directory = "/";

			if (!Data.host) Data.host = ["*"];

			if (!Data.public) Data.public = true;

			if (input.getFilter) {
				Data.filter = await input.getFilter();
				if (!Data.filter.query) Data.filter.query = {};
			} else
				Data.filter = {
					query: {}
				};

			// let files = await getFiles(input, 'blob')
			let files;
			const selected = inputs.get(input);
			if (selected) {
				files = Array.from(selected.values());
			}

			let segmentSize = 10 * 1024 * 1024;
			for (let i = 0; i < files.length; i++) {
				files[i].path = path;
				files[i].pathname = path + files[i].name;
				files[i].directory = directory;

				// let fileObject = { ...file }
				// fileObject.size = file.size
				// await getCustomData(fileObject)

				if (input.processFile && files[i].size > segmentSize) {
					// let test = await input.processFile(files[i], null, segmentSize, null, null, null, input);
					let { playlist, segments } = await input.processFile(
						files[i],
						null,
						segmentSize
					);

					// Create a video element
					const videoElement = document.createElement("video");
					videoElement.setAttribute("controls", ""); // Add controls so you can play/pause
					videoElement.style.width = "100%";
					document.body.appendChild(videoElement);

					const mediaSource = new MediaSource();
					videoElement.src = URL.createObjectURL(mediaSource);

					mediaSource.addEventListener("sourceopen", () => {
						const sourceBuffer = mediaSource.addSourceBuffer(
							'video/mp4; codecs="avc1.42E01E"'
						);

						sourceBuffer.addEventListener("updateend", () => {
							console.log("Append operation completed.");
							try {
								console.log(
									"Buffered ranges:",
									sourceBuffer.buffered
								);
								// Append next segment here if applicable
							} catch (e) {
								console.error(
									"Error accessing buffered property:",
									e
								);
							}
						});

						function appendSegment(index) {
							if (index >= segments.length) {
								console.log("All segments have been appended.");
								return;
							}

							if (!sourceBuffer.updating) {
								segments[index].src
									.arrayBuffer()
									.then((arrayBuffer) => {
										console.log(
											`Appending segment ${index}`
										);
										sourceBuffer.appendBuffer(arrayBuffer);
										// Next segment will be appended on 'updateend' event
									})
									.catch((error) => {
										console.error(
											`Error reading segment[${index}] as ArrayBuffer:`,
											error
										);
									});
							}
						}

						// Append the first segment to start
						appendSegment(0);
					});

					// mediaSource.addEventListener('sourceopen', () => {
					//     const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E"'); // avc1.4D401E, avc1.4D401F, avc1.4D4028, avc1.4D4020, avc1.4D4029, avc1.4D402A

					//     // Append the first segment to start
					//     if (!sourceBuffer.updating) {

					//         segments[0].src.arrayBuffer().then(arrayBuffer => {
					//             sourceBuffer.appendBuffer(arrayBuffer);

					//             // Wait for 3 seconds before logging the sourceBuffer state
					//             setTimeout(() => {
					//                 console.log(sourceBuffer);
					//             }, 3000); // 3000 milliseconds = 3 seconds

					//             sourceBuffer.addEventListener('updateend', () => {
					//                 console.log('Append operation completed.');
					//                 try {
					//                     console.log('Buffered ranges:', sourceBuffer.buffered);
					//                 } catch (e) {
					//                     console.error('Error accessing buffered property:', e);
					//                 }
					//                 // Proceed with additional operations here
					//             });

					//         }).catch(error => {
					//             console.error('Error reading segment[0] as ArrayBuffer:', error);
					//         });

					//         // segments[0].src.arrayBuffer().then(arrayBuffer => {
					//         //     sourceBuffer.appendBuffer(arrayBuffer);
					//         // })

					//         // let segmentLength = 0
					//         // sourceBuffer.addEventListener('updateend', () => {
					//         //     segmentLength += 1
					//         //     if (segments[segmentLength])
					//         //         segments[segmentLength].src.arrayBuffer().then(arrayBuffer => {
					//         //             console.log(sourceBuffer)
					//         //             // sourceBuffer.appendBuffer(arrayBuffer);
					//         //         })
					//         // });
					//     }
					// });
				}

				// files[i].src = playlist
				// for (let j = 0; j < segments.length; j++) {
				//     segments[j].path = path
				//     segments[j].pathname = path + segments[j].name
				//     segments[j].directory = directory
				//     segments[j] = { ...segments[j], ...await readFile(segments[j].src) }
				//     segments[j].public = true
				//     segments[j].host = ['*']

				//     playlist.segments[j].src = segments[j].pathname
				//     Data.filter.query.pathname = segments[j].pathname
				//     Crud.send({
				//         ...Data,
				//         object: segments[j],
				//         upsert: true
				//     });
				// }

				// } else {
				//     files[i] = { ...files[i], ...await readFile(files[i].src) }
				// }

				// if (!key) {
				//     Data.object = { ...files[i] }
				// } else {
				//     Data.object = { [key]: { ...files[i] } }
				// }

				// if (object) {
				//     Data.object._id = object // test
				// }

				// delete Data.object.input
				// Data.filter.query.pathname = files[i].pathname
				// let response = await Crud.send({
				//     ...Data,
				//     upsert: true
				// });

				// console.log(response, 'tes')
				// if (response && (!object || object !== response.object)) {
				//     Elements.setTypeValue(element, response);
				// }
			}
		}

		let queriedElements = queryElements({
			element: element[i],
			prefix: "upload"
		});
		if (queriedElements.length) {
			upload(queriedElements, data);
		}
	}
	return data;
}

const transfer = createTransfer({
    getDataObject: element => Elements.getDataObject(element),
    getFiles,
    queryElements,
    send: data => Crud.send(data),
    download: exportFile
});

async function Import(element, data) {
    return transfer.importData(element, data);
}

async function Export(element) {
    const format = element.getAttribute("export-format") || "json";
    if (format === "raw") return exportRaw(element);
    if (!["json", "csv"].includes(format)) throw new Error("Unsupported export format.");
    let columns;
    if (format === "csv") {
        const sources = queryElements({ element, prefix: "export-columns" });
        const headers = sources.filter(source => source.hasAttribute("data-export-key") && !source.hidden && getComputedStyle(source).display !== "none");
        if (headers.length) columns = headers.map(source => ({
            key: source.getAttribute("data-export-key"),
            label: source.getAttribute("data-export-label") || source.textContent.trim()
        }));
        else {
            const source = sources.find(source => !source.hasAttribute("data-export-key"));
            columns = source ? await source.getValue() : null;
        }
        if (!Array.isArray(columns) || !columns.length) throw new Error("CSV export requires columns.");
    }
    return transfer.exportData(element, { format, columns });
}

function exportRaw(element) {
    const data = getRawExport(element, queryElements);
    const blob = new Blob([data.content], { type: data.mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = data.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    return data;
}

function pickImportFile() {
    return new Promise(resolve => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,application/json";
        input.hidden = true;
        const finish = file => { input.remove(); resolve(file); };
        input.addEventListener("change", () => finish(input.files[0] || null), { once: true });
        input.addEventListener("cancel", () => finish(null), { once: true });
        document.body.appendChild(input);
        input.click();
    });
}

async function exportFile(data, { format = "json", columns } = {}) {
	let name = `export.${format}`;
	let exportData = format === "csv"
        ? "\uFEFF" + toCSV(data.flatMap(bundle => Array.isArray(bundle[bundle.type]) ? bundle[bundle.type] : [bundle]), columns)
        : JSON.stringify(data, null, 2);
	let blob = new Blob([exportData], { type: format === "csv" ? "text/csv;charset=utf-8" : "application/json" });
	let url = URL.createObjectURL(blob);

	let link = document.createElement("a");

	link.href = url;
	link.download = name;

	document.body.appendChild(link);

	link.dispatchEvent(
		new MouseEvent("click", {
			bubbles: true,
			cancelable: true,
			view: window
		})
	);

	URL.revokeObjectURL(url);
	link.remove();
}

// TODO: handled by import? if value is a valid url get file by url?
async function importURL(action) {
	try {
		let element = action.element;
		let url = element.getAttribute("url");
		if (!url) {
			element = action.form.querySelector("[import-url]");
			if (!element) return;
			url = element.getValue();
			if (!url) return;
		}

		const urlObject = new URL(url);
		const filename = urlObject.pathname.split("/").pop();

		const file = {
			src: url,
			name: filename,
			directory: "/",
			path: "/",
			pathname: "/" + filename
		};

		await getCustomData(file);

		let data = await Crud.socket.send({
			method: "importUrl",
			file,
			broadcast: false,
			broadcastClient: false
		});

		let queriedElements = queryElements({ element, prefix: "import-url" });
		if (queriedElements.length) {
			for (let queriedElement of queriedElements)
				queriedElement.setValue(data.file);
		}

		action.element.dispatchEvent(
			new CustomEvent(action.name, {
				detail: {}
			})
		);
	} catch (error) {
		console.error("Error importing file from URL:", error);
		throw error;
	}
}

async function fileRenderAction(action) {
	const element = action.element;

	let file_id = element.getAttribute("file_id");
	if (!file_id) {
		const closestElement = element.closest("[file_id]");
		if (closestElement) file_id = closestElement.getAttribute("file_id");
	}

	if (!file_id) return;
	const registeredFile = Files.get(file_id);
	if (!registeredFile) return;
	let input = registeredFile.input;
	if (!input) return;

	let file = inputs.get(input).get(file_id);
	if (!file) return;

	if (action.name === "createFile") {
		let name = element.getAttribute("value");
		create(file, "file", name);
	} else if (action.name === "deleteFile") Delete(file);
	else if (action.name === "removeFile") {
		remove(file);
		element.closest("[file_id]")?.remove();
	} else if (action.name === "createDirectory") {
		let name = element.getAttribute("value");
		create(file, "directory", name);
	} else if (action.name === "deleteDirectory") Delete(file);

	action.element.dispatchEvent(
		new CustomEvent(action.name, {
			detail: {}
		})
	);
}

function remove(file) {
	if (!file?.input || !file.id) return;
	inputs.get(file.input)?.delete(file.id);
	Files.delete(file.id);
}

async function create(directory, type, name, src = "") {
	try {
		if (directory.handle && directory.input) {
			if (!name) {
				const name = prompt("Enter the file name:");
				if (!name) {
					console.log("Invalid file name.");
					return;
				}
			}

			let handle, file;
			if (type === "directory") {
				handle = await directory.handle.getDirectoryHandle(name, {
					create: true
				});
				file = { name: handle.name, type: "text/directory" };
			} else if (type === "file") {
				handle = await directory.handle.getFileHandle(name, {
					create: true
				});
				const writable = await handle.createWritable();

				// Write data to the new file...
				await writable.write(src);
				await writable.close();

				file = handle.getFile();
			}

			if (directory.input) {
				file.directory = directory.name;
				file.pathname = directory.path + "/" + file.name;
				file.path = directory.path + "/" + file.name;
				file.input = directory.input;
				file.handle = handle;
				file["content-type"] = file.type;

				file.id = await getFileId(file);
				if (inputs.get(directory.input).has(file.id)) {
					console.log(
						"Duplicate file has been selected. This could be in error as the browser does not provide a clear way of checking duplictaes"
					);
				}

				inputs.get(directory.input).set(file.id, file);
			}
		}
	} catch (error) {
		console.log("Error adding file:", error);
	}
}

async function Delete(file) {
	try {
		if (file.handle) {
			await file.handle.remove();
			if (file.input && file.id) inputs.get(file.input).delete(file.id);
		}
	} catch (error) {
		console.log("Error deleting file:", error);
	}
}

Observer.init({
	name: "CoCreateFileAddedNodes",
	types: ["addedNodes"],
	selector: '[type="file"]',
	callback: (mutation) => {
		init(mutation.target);
		refreshFileForController(mutation.target);
	}
});

Observer.init({
	name: "CoCreateFileAttributes",
	types: ["attributes"],
	attributeFilter: ["type", "accept", "id"],
	selector: '[type="file"]',
	callback: (mutation) => {
		init(mutation.target);
		refreshFileForController(mutation.target);
	}
});

Observer.init({
	name: "CoCreateFileForAddedNodes",
	types: ["addedNodes"],
	selector: `[${fileForAttribute}]`,
	callback: (mutation) => applyFileFor(mutation.target)
});

Observer.init({
	name: "CoCreateFileForAttributes",
	types: ["attributes"],
	attributeFilter: [fileForAttribute, "file-dropzone", "filter-query-key"],
	selector: `[${fileForAttribute}]`,
	callback: (mutation) => applyFileFor(mutation.target)
});

Observer.init({
	name: "CoCreateFileSelectAddedNodes",
	types: ["addedNodes"],
	selector: "[file-select]",
	callback: (mutation) => initFileSelect(mutation.target)
});

for (const element of document.querySelectorAll(`[${fileForAttribute}]`)) {
	applyFileFor(element);
}

for (const element of document.querySelectorAll("[file-select]")) {
	initFileSelect(element);
}

Actions.init([
	{
		name: [
			"upload",
			"download",
			"saveLocally",
			"saveAs",
			"import",
			"export",
			"importUrl"
		],
        callback: async (action) => {
            try {
                let result;
                if (action.name === "export") result = await Export(action.element);
                else if (action.name === "import") {
                    if (action.element.type === "file") result = await Import(action.element);
                    else {
                        const file = await pickImportFile();
                        if (!file) { action.abort?.(); return; }
                        result = await Import(action.element, JSON.parse(await file.text()));
                    }
                } else if (action.name === "upload") result = await upload(action.element);
                else if (action.name === "saveLocally" || action.name === "saveAs")
                    result = await save(action.element);
                else if (action.name === "importUrl") { await importURL(action); return; }
                else { action.abort?.(); return; }
                if (action.end) action.end({ result });
                else action.element.dispatchEvent(new CustomEvent(action.endEvent || action.name, {
                    detail: { result }
                }));
            } catch (error) {
                action.abort?.();
                action.element.dispatchEvent(new CustomEvent(`${action.name}Error`, {
                    bubbles: true, detail: { error }
                }));
                console.error(`File ${action.name} failed:`, error);
            }
        }
	},
	{
		name: [
			"createFile",
			"deleteFile",
			"removeFile",
			"createDirectory",
			"deleteDirectory"
		],
		callback: (action) => {
			fileRenderAction(action);
		}
	}
]);

init();

export default { inputs, getFiles, create, Delete, remove };
