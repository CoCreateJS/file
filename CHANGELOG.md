# [2.0.0](https://github.com/CoCreateJS/file/compare/v1.23.0...v2.0.0) (2026-11-02)


### chore

* record package identity migration as breaking ([6334c6a](https://github.com/CoCreateJS/file/commit/6334c6afa13c2cfb638bbd9330f39bcbb52ab6ff))


### BREAKING CHANGES

* Consumers must install @cocreate/file and use the renamed CoCreateJS repository identity; the previous package and repository identities are no longer supported.

# [1.23.0](https://github.com/CoCreateJS/file/compare/v1.22.2...v1.23.0) (2026-11-02)


### Bug Fixes

* add Deno specific entries to .gitignore ([5d1d0a3](https://github.com/CoCreateJS/file/commit/5d1d0a3e12d38a9ff4f755531f835d198be54ff8))
* bump [@cocreate](https://github.com/cocreate) dependencies ([5781a0e](https://github.com/CoCreateJS/file/commit/5781a0e7bc7359c5d5373f159b1c5068d9134da5))
* bump [@cocreate](https://github.com/cocreate) package versions ([9605c57](https://github.com/CoCreateJS/file/commit/9605c57951e7465cb3a9cd32fbe725caadf4278a))
* bump versions ([6265e67](https://github.com/CoCreateJS/file/commit/6265e677d4b9fb0b51b72e01cc3005444b70130c))
* bump versions ([22e1c89](https://github.com/CoCreateJS/file/commit/22e1c89a05a365f236fc39ae869cde6f814b3cce))
* preserve file template replacement content ([2af131a](https://github.com/CoCreateJS/file/commit/2af131a2adf2f2c1681aed3491af3a561679482e))
* remove redundant option check in file function ([f6d1753](https://github.com/CoCreateJS/file/commit/f6d175367261fb4386064da47bf85f75509f96cc))
* remove trailing slash from node_modules entry in .gitignore ([fc3d092](https://github.com/CoCreateJS/file/commit/fc3d092489442e4dc1682cfb4128514453fcb59a))
* replace legacy $filter field with filter ([42f4232](https://github.com/CoCreateJS/file/commit/42f4232c07c76e9c2d264e21b26a3b0a99967c15))
* update Config method to request for loading configuration ([94502cd](https://github.com/CoCreateJS/file/commit/94502cda1847413fba8ca06b63240ebe0cd6db4c))
* update git url ([1175acb](https://github.com/CoCreateJS/file/commit/1175acbad01ade96ea074266fe06dc7967acf620))
* update GitHub Actions to use latest versions and sync package.json description ([dc48228](https://github.com/CoCreateJS/file/commit/dc48228690288b25547bcde2569ad48c14974813))
* update loadConfig to use prompt method for user input ([f802714](https://github.com/CoCreateJS/file/commit/f802714baea0607fce88aea744f533924f3065e9))


### Features

* enhance safeImport with timeout handling and improve resource cleanup in file function ([4e501f6](https://github.com/CoCreateJS/file/commit/4e501f621219f6cccac5c3fa93fb8d248dc6bbbe))
* implement safe dynamic import with timeout and refactor file writing to use promises ([9717cbd](https://github.com/CoCreateJS/file/commit/9717cbdddcfb53801d110f2c3592748cdf027557))
* replace uuid import and usage with utils ([7b8a0a9](https://github.com/CoCreateJS/file/commit/7b8a0a9b90c198302b3fd7bb9fb652d862f0ea56))
* support delegated file controls and drop zones ([19208de](https://github.com/CoCreateJS/file/commit/19208de116db90b872cf24d24cfa92e5b3590459))
* support raw file export ([92cb5f7](https://github.com/CoCreateJS/file/commit/92cb5f772e07ca3ce359ab42608fd3401092fe31))
* support recursive streamed downloads ([13ecb26](https://github.com/CoCreateJS/file/commit/13ecb264228785a634fe3ec79d5c79df07a1d20e))

## [1.22.2](https://github.com/CoCreateJS/CoCreate-file/compare/v1.22.1...v1.22.2) (2026-07-19)


### Bug Fixes

* set default branch to main ([e9782e0](https://github.com/CoCreateJS/CoCreate-file/commit/e9782e0c32e933dac07620f02b2ae879607ad927))

## [1.22.1](https://github.com/CoCreateJS/CoCreate-file/compare/v1.22.0...v1.22.1) (2026-07-17)


### Bug Fixes

* bump dependencies ([f466037](https://github.com/CoCreateJS/CoCreate-file/commit/f4660373b423341ec38d550ce97ef8e0ffd4dbfb))

# [1.22.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.21.2...v1.22.0) (2026-07-17)


### Bug Fixes

* bump package versions ([96e570f](https://github.com/CoCreateJS/CoCreate-file/commit/96e570f8059b7280f72a27e2f2b0cdeb6f497a6f))
* Refactor file processing logic for improved match, include, and exclude handling ([84e10b3](https://github.com/CoCreateJS/CoCreate-file/commit/84e10b36fe593ee6964ee83199e514b5c681c337))
* removed post install and add add packages to apprved list ([cc890ec](https://github.com/CoCreateJS/CoCreate-file/commit/cc890ece3bdcb35c7f9061c1f256ded53b9c6614))
* semantic version handling ([0d4c846](https://github.com/CoCreateJS/CoCreate-file/commit/0d4c84670d160e23e1ab6306f36da247182d0f2f))
* update module export to ES6 syntax in release.config.js ([60f57ad](https://github.com/CoCreateJS/CoCreate-file/commit/60f57ade816859c3d2d4e3040d11fb91adb76ee8))


### Features

* download and delete functions ([1207a11](https://github.com/CoCreateJS/CoCreate-file/commit/1207a11ec16e01d7a85b48be0f7dfdf0d2de7603))
* Implement new feature for user authentication and improve error handling ([e91c190](https://github.com/CoCreateJS/CoCreate-file/commit/e91c19021b9e1cc9598797e7a5bafd4a4196eda2))
* update automated workflow and release configuration for improved semantic release handling ([0edec1b](https://github.com/CoCreateJS/CoCreate-file/commit/0edec1b392519842dd3a98a6536f850ee5f07366))

## [1.21.2](https://github.com/CoCreateJS/CoCreate-file/compare/v1.21.1...v1.21.2) (2026-02-09)


### Bug Fixes

* root factory variable Module ([0143d76](https://github.com/CoCreateJS/CoCreate-file/commit/0143d76bdd4ef13106f390c3568f528a2ed1dbfc))

## [1.21.1](https://github.com/CoCreateJS/CoCreate-file/compare/v1.21.0...v1.21.1) (2026-01-17)


### Bug Fixes

* update worklow ([2d82287](https://github.com/CoCreateJS/CoCreate-file/commit/2d8228735691832aaaf4a6d53b879cc0faa2f326))

# [1.21.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.20.0...v1.21.0) (2025-11-16)


### Features

* enhance file processing by adding support for include/exclude filters and implementing dynamic data retrieval for various file types ([d8a2185](https://github.com/CoCreateJS/CoCreate-file/commit/d8a2185ce6f9554aa929f285e24526a281bc0b96))

# [1.20.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.19.6...v1.20.0) (2025-10-11)


### Bug Fixes

* add error handling for translation service in file function ([262dc66](https://github.com/CoCreateJS/CoCreate-file/commit/262dc66d57c13a8948ef1afa863413c203f965bc))
* update import statement and modify exit behavior in server function ([6e72fde](https://github.com/CoCreateJS/CoCreate-file/commit/6e72fdec3867c031e342b3faef598b661f43a620))


### Features

* add options parameter to file function for enhanced translation support ([7fac13d](https://github.com/CoCreateJS/CoCreate-file/commit/7fac13d10b8abd40584d5abc6b89d110f84db288))
* enhance file handling by supporting base64 encoding for binary sources and improving file reading logic ([192337c](https://github.com/CoCreateJS/CoCreate-file/commit/192337c3a44d412f8a8d2c6bb1172451661eebf5))
* enhance file processing with support for base64 and binary types, and add variable processing functionality ([eabfddf](https://github.com/CoCreateJS/CoCreate-file/commit/eabfddf2e1c36e7abd330369c1f28f90290cc1b8))

## [1.19.6](https://github.com/CoCreateJS/CoCreate-file/compare/v1.19.5...v1.19.6) (2025-09-07)


### Bug Fixes

* correct exclusion logic to check each item in the exclude array ([1fae391](https://github.com/CoCreateJS/CoCreate-file/commit/1fae391f4333813aa30805e87ba7ea28fefda5d3))
* ensure match is an array by wrapping non-array values ([5c67ec5](https://github.com/CoCreateJS/CoCreate-file/commit/5c67ec592f0217199b2ce965d14e377d6faa9a5b))
* ensure match is an array of directory paths and await run function ([eb47cf0](https://github.com/CoCreateJS/CoCreate-file/commit/eb47cf00c672ac5110293b3dab38fd8186bb8d64))

## [1.19.5](https://github.com/CoCreateJS/CoCreate-file/compare/v1.19.4...v1.19.5) (2025-05-01)


### Bug Fixes

* update [@cocreate](https://github.com/cocreate) dependencies ([b7830d3](https://github.com/CoCreateJS/CoCreate-file/commit/b7830d30475d7b430c493db4948593fae5c71dba))

## [1.19.4](https://github.com/CoCreateJS/CoCreate-file/compare/v1.19.3...v1.19.4) (2025-04-30)


### Bug Fixes

* added css-loader ([76ce0e7](https://github.com/CoCreateJS/CoCreate-file/commit/76ce0e743104f515419ef47dddc58c3d39cd8501))
* update query attributes ([52612c0](https://github.com/CoCreateJS/CoCreate-file/commit/52612c0e7ae552c0225cde2fe16118ef90338ae6))
* updated cocreate modules versions ([d27f8e8](https://github.com/CoCreateJS/CoCreate-file/commit/d27f8e8c6c82cc6cd0c4d7ef4baf186f81816a2a))
* webpack.config and devdependencies ([41c2a5a](https://github.com/CoCreateJS/CoCreate-file/commit/41c2a5a250ff4f00da8c0649ee4bae7fa4be56dc))

## [1.19.3](https://github.com/CoCreateJS/CoCreate-file/compare/v1.19.2...v1.19.3) (2025-04-11)


### Bug Fixes

* fire action end event on elememt instead of document ([3e78905](https://github.com/CoCreateJS/CoCreate-file/commit/3e789054e65e87c4f988d2041dfe8687684ebff5))
* update observer observe param to type and and attributeName to attributeFilter ([524a05e](https://github.com/CoCreateJS/CoCreate-file/commit/524a05e0080c4473f28fc9e5bd1414479e313eb7))

## [1.19.2](https://github.com/CoCreateJS/CoCreate-file/compare/v1.19.1...v1.19.2) (2025-01-18)


### Bug Fixes

* formating ([65e9a91](https://github.com/CoCreateJS/CoCreate-file/commit/65e9a915b17f616abd5bed917fa7323b1f59bd28))

## [1.19.1](https://github.com/CoCreateJS/CoCreate-file/compare/v1.19.0...v1.19.1) (2024-12-14)


### Bug Fixes

* fileElement refrence ([6042290](https://github.com/CoCreateJS/CoCreate-file/commit/6042290aa667b53e42f7afc2cc85dd4c2642dc76))
* if no file.id set id using  pathname in getCustomData() ([f1ef237](https://github.com/CoCreateJS/CoCreate-file/commit/f1ef237b8d807067537b29ba9ae60401b334a813))
* improved handeling of multiple ([c56ac70](https://github.com/CoCreateJS/CoCreate-file/commit/c56ac70a8732bd86ba04bd0e9004dadd59c48114))

# [1.19.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.18.0...v1.19.0) (2024-11-04)


### Bug Fixes

* observer taget has been renamed to selector ([edccd76](https://github.com/CoCreateJS/CoCreate-file/commit/edccd7664b459fce740f7935514805aa3611047d))
* pretier.config.js and file formating ([a9af856](https://github.com/CoCreateJS/CoCreate-file/commit/a9af8567970d98ff6fcdba0b44d6a3f548423b42))
* return if typeof file not object ([d0463e4](https://github.com/CoCreateJS/CoCreate-file/commit/d0463e417a1b8abd91a2c5c6b2187a62dfb83a17))


### Features

* add prettier.config.js and format files ([1929bea](https://github.com/CoCreateJS/CoCreate-file/commit/1929beaf8e0279bc41a205bad83b88510cefa288))
* add prettier.config.js and format files ([499e705](https://github.com/CoCreateJS/CoCreate-file/commit/499e705ba9bae33afe94d8b109f00e395480b1fc))

# [1.18.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.17.5...v1.18.0) (2024-08-24)


### Bug Fixes

* handle file.id when setFile() rendering. ([f9a561b](https://github.com/CoCreateJS/CoCreate-file/commit/f9a561b325ae0b8fe964b11d192c09ba2d144e4f))


### Features

* import file from url ([c073276](https://github.com/CoCreateJS/CoCreate-file/commit/c073276894009a04fdf59e3bebabbd34bea3f55b))

## [1.17.5](https://github.com/CoCreateJS/CoCreate-file/compare/v1.17.4...v1.17.5) (2024-06-19)


### Bug Fixes

* getFileId uses pathname as id ([be330a5](https://github.com/CoCreateJS/CoCreate-file/commit/be330a54324ae878a8afadc68bdae1684e944b45))
* observer target selector ([50dc031](https://github.com/CoCreateJS/CoCreate-file/commit/50dc0318b7c9c02c2d610fe86158d47e6277e667))
* replace selected file if multiple false ([d419dc3](https://github.com/CoCreateJS/CoCreate-file/commit/d419dc38f223d1d809bcf014dd2fadb0a629fae7))

## [1.17.4](https://github.com/CoCreateJS/CoCreate-file/compare/v1.17.3...v1.17.4) (2024-06-12)


### Bug Fixes

* bump cocreate dependencies ([327849b](https://github.com/CoCreateJS/CoCreate-file/commit/327849b7e69bb1527bc9b29e95648bb0e53535a9))
* svg icon class ([71c132d](https://github.com/CoCreateJS/CoCreate-file/commit/71c132dcf9ed77c53e017f1f79498e48d443c0cb))

## [1.17.3](https://github.com/CoCreateJS/CoCreate-file/compare/v1.17.2...v1.17.3) (2024-05-08)


### Bug Fixes

* description length less than 350 characters ([c2a9a7a](https://github.com/CoCreateJS/CoCreate-file/commit/c2a9a7a8aa6d96cfe0e41e563f4219fd87cfad87))

## [1.17.2](https://github.com/CoCreateJS/CoCreate-file/compare/v1.17.1...v1.17.2) (2024-04-29)


### Bug Fixes

* bump cocreate dependencies ([6034fc5](https://github.com/CoCreateJS/CoCreate-file/commit/6034fc570aade211662c77aaf6d66ea2c11a7340))

## [1.17.1](https://github.com/CoCreateJS/CoCreate-file/compare/v1.17.0...v1.17.1) (2024-04-26)


### Bug Fixes

* condition to check input.ProcessFIle exists ([478d652](https://github.com/CoCreateJS/CoCreate-file/commit/478d65274f52ac8c0de9341ee5ca1766e0542f7f))
* getFiles returns files as is without conversion ([ad57ce3](https://github.com/CoCreateJS/CoCreate-file/commit/ad57ce3895c4246268b49b192d69e2bae09cf0c7))
* method set to static object.update ([27dbf8e](https://github.com/CoCreateJS/CoCreate-file/commit/27dbf8e717a4bc5ffd5c2f6a6bae28e081e8a7b2))
* replaced keyword spaces with hyphens and lowercase letters only ([77f9d89](https://github.com/CoCreateJS/CoCreate-file/commit/77f9d896ded45e1341d58faa6973d58198a4e308))

# [1.17.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.16.0...v1.17.0) (2024-03-18)


### Bug Fixes

* descriptions ([fe2cffc](https://github.com/CoCreateJS/CoCreate-file/commit/fe2cffc731ba9ffecbe6c5768ae43e242d9dea92))


### Features

* handle mediaSegmentation, define path ([4c8e478](https://github.com/CoCreateJS/CoCreate-file/commit/4c8e478bf7ff6a382c18bfbe7af60886af9e0d9e))

# [1.16.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.15.2...v1.16.0) (2024-02-16)


### Features

* if realtime save on file selection ([de3c32c](https://github.com/CoCreateJS/CoCreate-file/commit/de3c32cdf3a1a1c18424ef0e8554fab40a85411d))

## [1.15.2](https://github.com/CoCreateJS/CoCreate-file/compare/v1.15.1...v1.15.2) (2024-02-14)


### Bug Fixes

* realtime defaults to false ([c6fb16c](https://github.com/CoCreateJS/CoCreate-file/commit/c6fb16c6f634c9a0eac244884913941963e5807b))

## [1.15.1](https://github.com/CoCreateJS/CoCreate-file/compare/v1.15.0...v1.15.1) (2024-02-13)


### Bug Fixes

* add file.size and add missing object param ([32f8508](https://github.com/CoCreateJS/CoCreate-file/commit/32f85080079dcb91fee2bb294b72d16d769b3440))

# [1.15.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.14.2...v1.15.0) (2024-02-05)


### Bug Fixes

* Removed https://cdn.CoCreateJS.com/latest/CoCreate.min.css ([e0ae28d](https://github.com/CoCreateJS/CoCreate-file/commit/e0ae28de52a02ee58947093f6dad3dd9dfee93e8))
* renderValue ([4e3308a](https://github.com/CoCreateJS/CoCreate-file/commit/4e3308a157ee2257bc1eb603ddc1484b5579cac8))
* typo renderValue condition ([65ba50f](https://github.com/CoCreateJS/CoCreate-file/commit/65ba50fe6a84e02bad033f423d39a0ab22fdb766))


### Features

* setValue() ([44d4012](https://github.com/CoCreateJS/CoCreate-file/commit/44d40127823d7ccdf8286943b435eeff939e6e2f))

## [1.14.2](https://github.com/CoCreateJS/CoCreate-file/compare/v1.14.1...v1.14.2) (2024-01-17)


### Bug Fixes

* await getFilter() ([339a343](https://github.com/CoCreateJS/CoCreate-file/commit/339a34379f51982b1447e5fffb81f4001c40b223))
* support defining storage and database in config ([bc992c1](https://github.com/CoCreateJS/CoCreate-file/commit/bc992c15dd586bdc3de580557617fc3eddb4a176))
* update to support new query system ([d3d43dc](https://github.com/CoCreateJS/CoCreate-file/commit/d3d43dc0585e6656167a8072fa3d2d848aca3b14))

## [1.14.1](https://github.com/CoCreateJS/CoCreate-file/compare/v1.14.0...v1.14.1) (2023-12-28)


### Bug Fixes

* typo ([b01a79a](https://github.com/CoCreateJS/CoCreate-file/commit/b01a79aa91dcdcca3d17fda1afa248672c24ad14))

# [1.14.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.13.0...v1.14.0) (2023-11-25)


### Bug Fixes

* update licensing details ([8c40ebb](https://github.com/CoCreateJS/CoCreate-file/commit/8c40ebb79f9c81d27574a43130daec77c3f778ba))


### Features

* upgrade dependencies for latest features and fixes ([d30415b](https://github.com/CoCreateJS/CoCreate-file/commit/d30415b76459f3d0fb80085a2560e667d3e66a8d))

# [1.13.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.12.0...v1.13.0) (2023-11-25)


### Bug Fixes

* update nav, edit button and css path ([b88261d](https://github.com/CoCreateJS/CoCreate-file/commit/b88261df87594c7693a29cef287780d3ac44583b))


### Features

* upgrade dependencies for latest features and fixes ([4fb4643](https://github.com/CoCreateJS/CoCreate-file/commit/4fb4643bdda0f7d3ca6fc09f95884e8703e92590))

# [1.12.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.11.0...v1.12.0) (2023-11-19)


### Features

* update dependecies for th latest features and bug fixes ([309a71a](https://github.com/CoCreateJS/CoCreate-file/commit/309a71a3d0318664fb61ed3532a410aa8249c16f))

# [1.11.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.10.0...v1.11.0) (2023-11-12)


### Bug Fixes

* bump dependencies for latest features ([c268d0f](https://github.com/CoCreateJS/CoCreate-file/commit/c268d0fa6ddf28a8149d7ab59f28cbd491eea9a1))


### Features

* symlinks will find realpath to upload ([0984755](https://github.com/CoCreateJS/CoCreate-file/commit/0984755e91cfcf5e819130502d5541f97d8bb9b1))

# [1.10.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.9.10...v1.10.0) (2023-11-09)


### Bug Fixes

* .ico content-type ([8f91239](https://github.com/CoCreateJS/CoCreate-file/commit/8f91239f3658d24363631edfe52d384709e432b4))
* if symbolic link skip ([fb0f4d7](https://github.com/CoCreateJS/CoCreate-file/commit/fb0f4d7d60a1d24d1776199c7a45d701426d3f60))
* meta name typo ([22e2888](https://github.com/CoCreateJS/CoCreate-file/commit/22e2888befd95f84ec214014de94872913092e6e))
* update host ([f5ec5e0](https://github.com/CoCreateJS/CoCreate-file/commit/f5ec5e0c84b84942749c400bfc4e366ef44a1ea9))


### Features

* support webmanifest file type ([aca211d](https://github.com/CoCreateJS/CoCreate-file/commit/aca211d6c4fa830a1934ae68c98527f25f75baf6))

## [1.9.10](https://github.com/CoCreateJS/CoCreate-file/compare/v1.9.9...v1.9.10) (2023-11-03)


### Bug Fixes

* favicon.ico path ([d624243](https://github.com/CoCreateJS/CoCreate-file/commit/d62424361f2f55ee06ee6489a2c51f7e431c2639))
* update dependencies to the lates versions ([109bee3](https://github.com/CoCreateJS/CoCreate-file/commit/109bee3e9f120ec64c8bb1242b5c488bcab32475))
* update method to use object.update etc ([d412fe0](https://github.com/CoCreateJS/CoCreate-file/commit/d412fe0413483e69acd8a7e9817cfcfed50ed52c))

## [1.9.9](https://github.com/CoCreateJS/CoCreate-file/compare/v1.9.8...v1.9.9) (2023-10-25)


### Bug Fixes

* bump dependencies ([e785667](https://github.com/CoCreateJS/CoCreate-file/commit/e785667854cbc76da7650ff99fc39eb18387b843))

## [1.9.8](https://github.com/CoCreateJS/CoCreate-file/compare/v1.9.7...v1.9.8) (2023-10-22)


### Bug Fixes

* base64 conditions ([55ef6e3](https://github.com/CoCreateJS/CoCreate-file/commit/55ef6e3b29ccc2b5b40669ffa16eb92802b6eb2c))
* support watch upload of deeply nested files ([db8b460](https://github.com/CoCreateJS/CoCreate-file/commit/db8b4601aa92ed76ff10095d2505cffbda54a8ac))

## [1.9.7](https://github.com/CoCreateJS/CoCreate-file/compare/v1.9.6...v1.9.7) (2023-10-19)


### Bug Fixes

* declartion of render functions using object spread ([acb3fc5](https://github.com/CoCreateJS/CoCreate-file/commit/acb3fc5a549ff0a4d17bb5c8c7850f2aad4c58c8))

## [1.9.6](https://github.com/CoCreateJS/CoCreate-file/compare/v1.9.5...v1.9.6) (2023-10-17)


### Bug Fixes

* await getValue() ([93a475a](https://github.com/CoCreateJS/CoCreate-file/commit/93a475ae31a77d9dd804b87539524fe75a8249b6))

## [1.9.5](https://github.com/CoCreateJS/CoCreate-file/compare/v1.9.4...v1.9.5) (2023-10-14)


### Bug Fixes

* bump dependencies ([b922b43](https://github.com/CoCreateJS/CoCreate-file/commit/b922b43fd21485db0be2397c2a9c113c7a3a586b))

## [1.9.4](https://github.com/CoCreateJS/CoCreate-file/compare/v1.9.3...v1.9.4) (2023-10-09)


### Bug Fixes

* bump dependencies ([871a4c8](https://github.com/CoCreateJS/CoCreate-file/commit/871a4c80179e10e2c97a5139ef2b2633c9d34d07))

## [1.9.3](https://github.com/CoCreateJS/CoCreate-file/compare/v1.9.2...v1.9.3) (2023-10-09)


### Bug Fixes

* bump dependencies ([eeab116](https://github.com/CoCreateJS/CoCreate-file/commit/eeab11659aabecb339e762e261a902eb83ccbd4b))

## [1.9.2](https://github.com/CoCreateJS/CoCreate-file/compare/v1.9.1...v1.9.2) (2023-10-09)


### Bug Fixes

* bump cocreate dependency versions ([1ff6a15](https://github.com/CoCreateJS/CoCreate-file/commit/1ff6a152bff209813f21f2ebb0a7a5ebfbc33477))
* bump dependencies ([2ce5dc3](https://github.com/CoCreateJS/CoCreate-file/commit/2ce5dc3c735fbf1647ed95aa04447a779211bb4f))

## [1.9.1](https://github.com/CoCreateJS/CoCreate-file/compare/v1.9.0...v1.9.1) (2023-10-09)


### Bug Fixes

* svg bug ([a29f6f0](https://github.com/CoCreateJS/CoCreate-file/commit/a29f6f0ec0ac71d79f86f7472e6f5a7ee86c8fab))

# [1.9.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.8.0...v1.9.0) (2023-09-19)


### Features

* Update CoCreate dependencies to their latest versions ([90ea9c8](https://github.com/CoCreateJS/CoCreate-file/commit/90ea9c8eac20c919f2910817b79692551de80e36))

# [1.8.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.7.3...v1.8.0) (2023-09-19)


### Features

* bump dependencies for there latest features ([3944081](https://github.com/CoCreateJS/CoCreate-file/commit/3944081ce3082541a0f3868ed7463e7c50357ed9))

## [1.7.3](https://github.com/CoCreateJS/CoCreate-file/compare/v1.7.2...v1.7.3) (2023-09-19)


### Bug Fixes

* directory, path, pathname ([9fdad2d](https://github.com/CoCreateJS/CoCreate-file/commit/9fdad2d90d67b08b74d5027999fb1989ca67c853))
* removed crud.socket.create() as it is handeled automatically duing socket.send ([ca012d0](https://github.com/CoCreateJS/CoCreate-file/commit/ca012d0789b6e66af472de688979b8f21b4f73e7))

## [1.7.2](https://github.com/CoCreateJS/CoCreate-file/compare/v1.7.1...v1.7.2) (2023-09-18)


### Bug Fixes

*  Add path and pathname ([8dda8ed](https://github.com/CoCreateJS/CoCreate-file/commit/8dda8edb80c4dca324d6250ef5eb2a8588aa73ab))
* Update CoCreate depndencies to latest versions ([955f3b2](https://github.com/CoCreateJS/CoCreate-file/commit/955f3b2567d6cbb288c25e93f4dd8fa9adc96a27))

## [1.7.1](https://github.com/CoCreateJS/CoCreate-file/compare/v1.7.0...v1.7.1) (2023-09-17)


### Bug Fixes

* renamed filter to $filter ([c8e8390](https://github.com/CoCreateJS/CoCreate-file/commit/c8e83901429d2c370b327449a9f7f0081b03e6fd))
* update broadcast to broadcastSender false ([b93ca93](https://github.com/CoCreateJS/CoCreate-file/commit/b93ca93f6b1bff1b1052c841f63919f4156e551e))
* update data.filter to data.$filter, supports data.object.$filter to ad  filters per object ([7ccb455](https://github.com/CoCreateJS/CoCreate-file/commit/7ccb45521a8af3c67587c756c905d7ed4a557a60))

# [1.7.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.6.3...v1.7.0) (2023-09-07)


### Features

* support match param. An array of files to match with config. if match found upload or save source ([30e6d57](https://github.com/CoCreateJS/CoCreate-file/commit/30e6d57da184f9533a0b75e8acc3a09e68b48629))

## [1.6.3](https://github.com/CoCreateJS/CoCreate-file/compare/v1.6.2...v1.6.3) (2023-08-21)


### Bug Fixes

* remove unused console.log ([610fc0b](https://github.com/CoCreateJS/CoCreate-file/commit/610fc0b99c344a954b776a610c514c56ec034e1f))

## [1.6.2](https://github.com/CoCreateJS/CoCreate-file/compare/v1.6.1...v1.6.2) (2023-08-21)


### Bug Fixes

* bump dependencies ([97157f0](https://github.com/CoCreateJS/CoCreate-file/commit/97157f0566a3fd704737b53cb3729652b1406991))

## [1.6.1](https://github.com/CoCreateJS/CoCreate-file/compare/v1.6.0...v1.6.1) (2023-08-21)


### Bug Fixes

* if directories or source is undefined ([daa2a3a](https://github.com/CoCreateJS/CoCreate-file/commit/daa2a3a86eaabf4838bb20e69e2d1413b04eebf4))

# [1.6.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.5.3...v1.6.0) (2023-08-21)


### Features

* Update cocreate dependencies for the latest features and bug fixes ([2aab571](https://github.com/CoCreateJS/CoCreate-file/commit/2aab571f45cb35ef84a2df219c2a129299c918bd))

## [1.5.3](https://github.com/CoCreateJS/CoCreate-file/compare/v1.5.2...v1.5.3) (2023-08-21)


### Bug Fixes

* /dist/CoCreate.js updated to https://CoCreateJS.com/dist/CoCreate.js ([0903b42](https://github.com/CoCreateJS/CoCreate-file/commit/0903b4285c3e798b5631e6bd251d58ff3bf9e619))
* removed handeling of resolving static configPath CoCreate.config.js ([53604bb](https://github.com/CoCreateJS/CoCreate-file/commit/53604bbdb25d8e89e53469d725ae90d90d1ab4d7))
* replace cdn with /dist ([b305020](https://github.com/CoCreateJS/CoCreate-file/commit/b305020846b839ac147f26b19c68f881c7b0b41c))
* update file uploader ([9fa12e8](https://github.com/CoCreateJS/CoCreate-file/commit/9fa12e8dd0c7a396778bb5aa7c71b745ef1945af))

## [1.5.2](https://github.com/CoCreateJS/CoCreate-file/compare/v1.5.1...v1.5.2) (2023-08-18)


### Bug Fixes

* typo "@cocreate/Actions" to "@cocreate/actions" ([48d98cd](https://github.com/CoCreateJS/CoCreate-file/commit/48d98cda211f907e47f096d9cb52922950a8a2d6))

## [1.5.1](https://github.com/CoCreateJS/CoCreate-file/compare/v1.5.0...v1.5.1) (2023-08-17)


### Bug Fixes

* typo @cocreate/observer ([211cb9a](https://github.com/CoCreateJS/CoCreate-file/commit/211cb9a31a45c9b72f6f4ef6fc7471180477bb85))

# [1.5.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.4.0...v1.5.0) (2023-08-17)


### Features

* bump cocreate dependencies for the latest updates and features ([746d491](https://github.com/CoCreateJS/CoCreate-file/commit/746d491723b4481257431025668d947efdca1b06))

# [1.4.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.3.11...v1.4.0) (2023-08-16)


### Bug Fixes

* add conditional for newConfig.repositiories ([3fae340](https://github.com/CoCreateJS/CoCreate-file/commit/3fae340d2e616e9f9c046062c2816fa63b4900a1))
* crud attributes renamed ([a379ef5](https://github.com/CoCreateJS/CoCreate-file/commit/a379ef5db63ec4bb5b0f4d7b4b7dab2656bb5bc9))
* refactor(client.js): Simplify file selection event listener ([eeb34cc](https://github.com/CoCreateJS/CoCreate-file/commit/eeb34cca7fa405440a2936fa6a71b4b11bced015))
* render-array and render-object attributes renamed to render ([1b2301f](https://github.com/CoCreateJS/CoCreate-file/commit/1b2301f184c9094ecf3a2d39927c956bf633e678))
* replace -target -selector ([ceb96a7](https://github.com/CoCreateJS/CoCreate-file/commit/ceb96a7b60000b99ac3300e289ee88182d5415b0))
* replaced @cocreate/crud-client with @cocreate/elements ([1e012b3](https://github.com/CoCreateJS/CoCreate-file/commit/1e012b3a2b3f74eece733bd0b56f3d54b2dc03c0))
* startIndex renamed to index ([0f174c9](https://github.com/CoCreateJS/CoCreate-file/commit/0f174c986f853de188de13b34afb9841a0b8c62f))
* updated actions callback data object ([edeef71](https://github.com/CoCreateJS/CoCreate-file/commit/edeef718350c06587d861b9f2406f8277dbb9cd4))
* updated fetch-limit to filter-limit ([d40bbf7](https://github.com/CoCreateJS/CoCreate-file/commit/d40bbf788659007133eda4ed34bc33ca4b25c61e))
* webpack.config and package.json make use of mode=production instead of process.env ([a563c53](https://github.com/CoCreateJS/CoCreate-file/commit/a563c534c95a0dc68e0e1c862cfa4ae03aee89d1))


### Features

* actions support finding elements and data using form, selctors, and crud ([c5fd048](https://github.com/CoCreateJS/CoCreate-file/commit/c5fd048c34a29b4b15ff389a56421a5c7ab43fcd))
* Add support for multiple files and directories in file input field, ender and edit file data ([5c06442](https://github.com/CoCreateJS/CoCreate-file/commit/5c06442ac85b1088465aef67320bb5f8a012f519))
* name attribute and variable renamed to key ([7c70ed2](https://github.com/CoCreateJS/CoCreate-file/commit/7c70ed2278cd25086a7d7b1039b110e0ddc6130e))
* Refactor file form actions and add new 'download' action ([d593476](https://github.com/CoCreateJS/CoCreate-file/commit/d5934760e9f297570068d5710f448f195eb209b7))
* Refactor file rendering ([47945de](https://github.com/CoCreateJS/CoCreate-file/commit/47945dede6677d8b4b74cae0a70043117ccc94a5))
* Refactor Import function to import files into the system. ([99f48a7](https://github.com/CoCreateJS/CoCreate-file/commit/99f48a700ff3ceb51dbc51be024923a589eafbfa))
* Refactored code to handle duplicate files when selected from multiple `input[type="file"]` elements. ([c965cae](https://github.com/CoCreateJS/CoCreate-file/commit/c965cae2a6f092b4b57e846d50859266366937e5))
* update template_id to render-selector attribute. update filter attributes to filter selector-attributes ([897d910](https://github.com/CoCreateJS/CoCreate-file/commit/897d9104ef2134e9f05a94a720ca0acdbd84fc89))

## [1.3.11](https://github.com/CoCreateJS/CoCreate-file/compare/v1.3.10...v1.3.11) (2023-06-16)


### Bug Fixes

* Update dependencies versions for [@cocreate](https://github.com/cocreate) libraries ([5fff8c2](https://github.com/CoCreateJS/CoCreate-file/commit/5fff8c278a0b1da78417c075216b950bfb80f180))

## [1.3.10](https://github.com/CoCreateJS/CoCreate-file/compare/v1.3.9...v1.3.10) (2023-06-16)


### Bug Fixes

* Refactor repositories object in newConfig to only include necessary keys ([9cc2559](https://github.com/CoCreateJS/CoCreate-file/commit/9cc2559f0dadec0bf1f6b9f45599435644631ca9))

## [1.3.9](https://github.com/CoCreateJS/CoCreate-file/compare/v1.3.8...v1.3.9) (2023-06-15)


### Bug Fixes

* Updatae [@cocreate](https://github.com/cocreate) dependnenies to the latest versions ([294fa6f](https://github.com/CoCreateJS/CoCreate-file/commit/294fa6f30b12096ce52e2ac66ecd85b59a440c20))

## [1.3.8](https://github.com/CoCreateJS/CoCreate-file/compare/v1.3.7...v1.3.8) (2023-06-15)


### Bug Fixes

* Update dependencies versions for [@cocreate](https://github.com/cocreate) libraries ([a6a21c4](https://github.com/CoCreateJS/CoCreate-file/commit/a6a21c49183adc4c5435c52bcc3a95a991bb9650))

## [1.3.7](https://github.com/CoCreateJS/CoCreate-file/compare/v1.3.6...v1.3.7) (2023-06-14)


### Bug Fixes

* Update dependencies versions for [@cocreate](https://github.com/cocreate) libraries ([447b895](https://github.com/CoCreateJS/CoCreate-file/commit/447b895d02076af348db486d4a46efc882a0ebc8))

## [1.3.6](https://github.com/CoCreateJS/CoCreate-file/compare/v1.3.5...v1.3.6) (2023-06-14)


### Bug Fixes

* choices data structure ([e07322c](https://github.com/CoCreateJS/CoCreate-file/commit/e07322c74a0dd528226b349ad97d09f93c5893f0))

## [1.3.5](https://github.com/CoCreateJS/CoCreate-file/compare/v1.3.4...v1.3.5) (2023-06-14)


### Bug Fixes

* Update dependencies versions for [@cocreate](https://github.com/cocreate) libraries ([08bdadd](https://github.com/CoCreateJS/CoCreate-file/commit/08bdadd6e9e8ee318bab6f8dbc2b1ea2198a60a1))

## [1.3.4](https://github.com/CoCreateJS/CoCreate-file/compare/v1.3.3...v1.3.4) (2023-06-14)


### Bug Fixes

* add @cocreate/config package ([6ae4a9f](https://github.com/CoCreateJS/CoCreate-file/commit/6ae4a9f870f36d293a1c2bcb2ea4f188cf3b136f))

## [1.3.3](https://github.com/CoCreateJS/CoCreate-file/compare/v1.3.2...v1.3.3) (2023-06-11)


### Bug Fixes

* Update dependencies versions for [@cocreate](https://github.com/cocreate) libraries ([b3eb682](https://github.com/CoCreateJS/CoCreate-file/commit/b3eb6822d027ea1b6c37caa41680957a8f13999e))

## [1.3.2](https://github.com/CoCreateJS/CoCreate-file/compare/v1.3.1...v1.3.2) (2023-06-11)


### Bug Fixes

* removed mime-types dependency ([ad199e8](https://github.com/CoCreateJS/CoCreate-file/commit/ad199e85900e46d5e1ccea96bfa2746be255c289))

## [1.3.1](https://github.com/CoCreateJS/CoCreate-file/compare/v1.3.0...v1.3.1) (2023-06-11)


### Bug Fixes

* Update dependencies versions for [@cocreate](https://github.com/cocreate) libraries ([cb11d96](https://github.com/CoCreateJS/CoCreate-file/commit/cb11d96479aabaa10c3d655c22be442be8a4ca9a))

# [1.3.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.2.13...v1.3.0) (2023-06-11)


### Features

* mimeTypes ([739bacd](https://github.com/CoCreateJS/CoCreate-file/commit/739bacdc524646f0ec8a5065f6e84d87872b2a64))

## [1.2.13](https://github.com/CoCreateJS/CoCreate-file/compare/v1.2.12...v1.2.13) (2023-06-11)


### Bug Fixes

* testing workflow ([c3c378a](https://github.com/CoCreateJS/CoCreate-file/commit/c3c378a4f656c4a7443919837800ac93213429f6))

## [1.2.12](https://github.com/CoCreateJS/CoCreate-file/compare/v1.2.11...v1.2.12) (2023-06-11)


### Bug Fixes

* testing workflow ([d457871](https://github.com/CoCreateJS/CoCreate-file/commit/d457871e958e4cf7f93cababb61fbfa209553497))

## [1.2.11](https://github.com/CoCreateJS/CoCreate-file/compare/v1.2.10...v1.2.11) (2023-06-11)


### Bug Fixes

* testing workflow ([e48c335](https://github.com/CoCreateJS/CoCreate-file/commit/e48c33563c4b652222f6e460629468e1b3100327))
* testing workflow ([e82d9e6](https://github.com/CoCreateJS/CoCreate-file/commit/e82d9e6fa48825070511e8915c614f1e2f58f9cd))

## [1.2.10](https://github.com/CoCreateJS/CoCreate-file/compare/v1.2.9...v1.2.10) (2023-06-11)


### Bug Fixes

* testing workflow ([65f2bb0](https://github.com/CoCreateJS/CoCreate-file/commit/65f2bb0e2114e685f7e61b39a7a063cf27bc104e))

## [1.2.9](https://github.com/CoCreateJS/CoCreate-file/compare/v1.2.8...v1.2.9) (2023-06-11)


### Bug Fixes

* Update dependencies versions for [@cocreate](https://github.com/cocreate) libraries ([43af92c](https://github.com/CoCreateJS/CoCreate-file/commit/43af92c58dae418c21e601f4f1a7f00854c138d0))

## [1.2.8](https://github.com/CoCreateJS/CoCreate-file/compare/v1.2.7...v1.2.8) (2023-06-11)


### Bug Fixes

* postintall error ([177123d](https://github.com/CoCreateJS/CoCreate-file/commit/177123d915e1008a19621709a9256f0e01237b20))

## [1.2.7](https://github.com/CoCreateJS/CoCreate-file/compare/v1.2.6...v1.2.7) (2023-06-11)


### Bug Fixes

* @cocreate/cli moved to dependencies ([0ff1ff6](https://github.com/CoCreateJS/CoCreate-file/commit/0ff1ff65fc53bef839866211093db386d84f7097))

## [1.2.6](https://github.com/CoCreateJS/CoCreate-file/compare/v1.2.5...v1.2.6) (2023-06-11)


### Bug Fixes

* Update dependencies versions for [@cocreate](https://github.com/cocreate) libraries ([b676215](https://github.com/CoCreateJS/CoCreate-file/commit/b676215b195dc23f8f955de8c451c0b919c95f41))

## [1.2.5](https://github.com/CoCreateJS/CoCreate-file/compare/v1.2.4...v1.2.5) (2023-06-11)


### Bug Fixes

* renamed hosts to host. the value can be a string or an array of strings ([a427463](https://github.com/CoCreateJS/CoCreate-file/commit/a427463c3f780f26c8e8e6ac2085d8eecb049e6a))

## [1.2.4](https://github.com/CoCreateJS/CoCreate-file/compare/v1.2.3...v1.2.4) (2023-06-10)


### Bug Fixes

* Update dependencies versions for [@cocreate](https://github.com/cocreate) libraries ([62b097d](https://github.com/CoCreateJS/CoCreate-file/commit/62b097d177eee077ae6430fadbf3f2e9c5cb530b))

## [1.2.3](https://github.com/CoCreateJS/CoCreate-file/compare/v1.2.2...v1.2.3) (2023-06-10)


### Bug Fixes

* Update dependencies versions for [@cocreate](https://github.com/cocreate) libraries ([b7c568f](https://github.com/CoCreateJS/CoCreate-file/commit/b7c568fb0de2f61007516df45c1052706eba52b9))

## [1.2.2](https://github.com/CoCreateJS/CoCreate-file/compare/v1.2.1...v1.2.2) (2023-06-10)


### Bug Fixes

* test workflow ([839a093](https://github.com/CoCreateJS/CoCreate-file/commit/839a09329719f78e63d42bfa443982f35c8e5fde))

## [1.2.1](https://github.com/CoCreateJS/CoCreate-file/compare/v1.2.0...v1.2.1) (2023-06-10)


### Bug Fixes

* Refactor authentication & update config file output format ([27da6f0](https://github.com/CoCreateJS/CoCreate-file/commit/27da6f06c832bb3e153074a96a42017f0f0a3c30))

# [1.2.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.1.0...v1.2.0) (2023-06-09)


### Bug Fixes

* Update dependencies versions for [@cocreate](https://github.com/cocreate) libraries ([c86d68d](https://github.com/CoCreateJS/CoCreate-file/commit/c86d68d3ef7fa76e8f52867f7abecaa67bab8270))


### Features

* client and server functions ([af50769](https://github.com/CoCreateJS/CoCreate-file/commit/af5076902607f52c51f5a4fcca4a4a5554617b92))

# [1.1.0](https://github.com/CoCreateJS/CoCreate-file/compare/v1.0.0...v1.1.0) (2023-06-08)


### Features

* add template_id to fileInput and render selected files using template and placeholders ([ca29280](https://github.com/CoCreateJS/CoCreate-file/commit/ca292805b3b3d71e95a022cb249082ace540d33a))

# 1.0.0 (2023-06-06)


### Features

* Initial Release ([64be923](https://github.com/CoCreateJS/CoCreate-file/commit/64be92329bf44a7578f54e389be6d790ddd6afd3))
