# CoCreate-file

CoCreate-file is an advanced, configurable headless file uploader designed for comprehensive file management capabilities without a traditional user interface. Accessible via a JavaScript API and HTML5 attributes, it offers unparalleled flexibility in handling file operations on both local and server environments. Take it for a spin in our [playground!](https://CoCreateJS.com/docs/file)

![minified](https://img.badgesize.io/https://cdn.CoCreateJS.com/file/latest/CoCreate-file.min.js?style=flat-square&label=minified&color=orange)
![gzip](https://img.badgesize.io/https://cdn.CoCreateJS.com/file/latest/CoCreate-file.min.js?compression=gzip&style=flat-square&label=gzip&color=yellow)
![brotli](https://img.badgesize.io/https://cdn.CoCreateJS.com/file/latest/CoCreate-file.min.js?compression=brotli&style=flat-square&label=brotli)
![GitHub latest release](https://img.shields.io/github/v/release/CoCreate-app/CoCreate-file?style=flat-square)
![License](https://img.shields.io/github/license/CoCreate-app/CoCreate-file?style=flat-square)
![Hiring](https://img.shields.io/static/v1?style=flat-square&label=&message=Hiring&color=blueviolet)

## Key Features

-   **JavaScript API & HTML5 Customization**: Easily manage file uploads and operations through a powerful JavaScript API or by utilizing HTML5 attributes for easy integration and customization.
-   **Local & Server File Operations**: Supports reading, writing, and uploading files both locally and to the server, catering to a wide range of application needs.
-   **Graceful Fallbacks**: Implements graceful fallbacks to the standard HTML5 file input API, ensuring compatibility and functionality across different browsers and environments.
-   **Headless File Management**: Designed for use in headless applications or scenarios where a UI is not required or desired, providing a clean, efficient backend solution for file management.

![CoCreate-file](https://cdn.CoCreateJS.com/docs/CoCreate-file.gif)

## [Docs & Demo](https://CoCreateJS.com/docs/file)

For a complete guide and working demo refer to the [doumentation](https://CoCreateJS.com/docs/file)

## CDN

```html
<script src="https://cdn.CoCreateJS.com/file/latest/CoCreate-file.min.js"></script>
```

```html
<script src="https://cdn.CoCreateJS.com/file/latest/CoCreate-file.min.css"></script>
```

## NPM

```shell
$ npm i @cocreate/file
```

## yarn

```shell
$ yarn install @cocreate/file
```

## Source structure

```text
src/
  client/
    index.js
    csv.js
    transfer.js
  server/
    index.js
    replaceTemplateVariable.js
```

Package imports resolve to `src/client/index.js` in browser builds and
`src/server/index.js` in Node. Webpack builds the client entry.

# Table of Contents

-   [Table of Contents](#table-of-contents)
-   [Announcements](#announcements)
-   [Roadmap](#roadmap)
-   [How to Contribute](#how-to-contribute)
-   [About](#about)
-   [License](#license)

<a name="announcements"></a>

# Announcements

All updates to this library are documented in our [CHANGELOG](https://github.com/CoCreateJS/CoCreate-file/blob/master/CHANGELOG.md) and [releases](https://github.com/CoCreateJS/CoCreate-file/releases). You may also subscribe to email for releases and breaking changes.

<a name="roadmap"></a>

# Roadmap

If you are interested in the future direction of this project, please take a look at our open [issues](https://github.com/CoCreateJS/CoCreate-file/issues) and [pull requests](https://github.com/CoCreateJS/CoCreate-file/pulls). We would love to hear your feedback.

<a name="about"></a>

# About

CoCreate-file is guided and supported by the CoCreate Developer Experience Team.

Please Email the Developer Experience Team [here](mailto:develop@CoCreateJS.com) in case of any queries.

CoCreate-file is maintained and funded by CoCreate. The names and logos for CoCreate are trademarks of CoCreate, LLC.

<a name="contribute"></a>

# How to Contribute

We encourage contribution to our libraries (you might even score some nifty swag), please see our [CONTRIBUTING](https://github.com/CoCreateJS/CoCreate-file/blob/master/CONTRIBUTING.md) guide for details.

We want this library to be community-driven, and CoCreate led. We need your help to realize this goal. To help make sure we are building the right things in the right order, we ask that you create [issues](https://github.com/CoCreateJS/CoCreate-file/issues) and [pull requests](https://github.com/CoCreateJS/CoCreate-file/pulls) or merely upvote or comment on existing issues or pull requests.

We appreciate your continued support, thank you!

<a name="license"></a>

## JSON import and export actions

Use `actions="export"` with `export-query` to select CRUD-bound elements.
Export follows nested queries once per element and downloads one `export.json`.
The file contains bundles with `type`, collection scope, and records under the
matching type key (for example, `object`). Filtered targets export all matching
pages, starting at index zero, without changing the displayed pagination.
File-input targets export their selected file objects.

Set `export-format="csv"` for CSV instead of the default JSON. Provide
`export-columns-query` targeting table headers with `data-export-key` and
`data-export-label`, or a value-bearing element containing an array of
`{ key, label }` definitions. Visible table headers determine column order;
definitions provide the fallback for grid views. Only these columns are
exported. Nested objects and arrays are JSON within quoted CSV cells; strings
that resemble spreadsheet formulas are prefixed with an apostrophe. CSV is
for spreadsheet export; import continues to accept JSON.

Use `export-format="raw"` to download the text content of one queried element
without serializing it as a CRUD record. Set `export-query` to select that
single source; `export-filename` sets the downloaded filename (default
`export.txt`) and `export-mime` sets its MIME type (default
`text/plain;charset=utf-8`). Raw export is intended for source/code and other
plain text, and rejects zero or multiple source elements.

```html
<button
	actions="export"
	export-format="raw"
	export-query="$closest .code-block code"
	export-filename="example.js"
	export-mime="text/javascript;charset=utf-8">
	Download source
</button>
```

Use `actions="import"` with `import-query` to choose a destination element.
A regular button opens a JSON file picker; a file-input action imports its
selected files. Import accepts export bundles or plain records. An explicit
destination overrides the bundle's collection scope; plain records require a
destination array. Object records with `_id` use update with upsert; records
without `_id` use create. All input is validated before writes begin. Writes
are sequential, not transactional: a later server failure does not undo earlier
successful writes.

Import and export finish their action chain only after the operation succeeds.
Cancellation or failure stops the chain; failures emit `importError` or
`exportError` with the error in `event.detail.error`.

# License

This software is dual-licensed under the GNU Affero General Public License version 3 (AGPLv3) and a commercial license.

-   **Open Source Use**: For open-source projects and non-commercial use, this software is available under the AGPLv3. The AGPLv3 allows you to freely use, modify, and distribute this software, provided that all modifications and derivative works are also licensed under the AGPLv3. For the full license text, see the [LICENSE file](https://github.com/CoCreateJS/CoCreate-file/blob/master/LICENSE).

-   **Commercial Use**: For-profit companies and individuals intending to use this software for commercial purposes must obtain a commercial license. The commercial license is available when you sign up for an API key on our [website](https://CoCreateJS.com). This license permits proprietary use and modification of the software without the copyleft requirements of the AGPLv3. It is ideal for integrating this software into proprietary commercial products and applications.

If you have not purchased a commercial license and intend to use this software for commercial purposes, you are required to sign up for an API key on our website.
