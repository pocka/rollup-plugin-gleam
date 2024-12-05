<!--
SPDX-FileCopyrightText: 2024 Shota FUJI <pockawoooh@gmail.com>
SPDX-License-Identifier: Apache-2.0
-->

[dprint]: https://dprint.dev/
[reuse-tool]: https://github.com/fsfe/reuse-tool

# Development Guide

This guide is for whom touches this project's codebase.

## Requirements

This project uses below software tools:

- [Node.js](https://nodejs.org) Active LTS and npm for building, testing and publishing.
- [Gleam](https://gleam.run/) v1.x for testing.
- [dprint][dprint] v0.x for code formatting.
- [reuse][reuse-tool] v4 or later for copyright and license information checking.

You can install these tools other than reuse tool, by using [ASDF](https://asdf-vm.com/) or [mise](https://mise.jdx.dev/). See [`.tool-versions`](../.tool-versions) for more specific versions.

## Source code and build process

Source code is located under `src/` directory, written in TypeScript.

Those files are compiled to JavaScript by TypeScript Compiler (tsc).
You can manually compile them by running:

```
$ npm run build
```

Compiled JavaScript files are located under `esm/es2022/` directory.
That directory is ignored from VCS, and included in published tarball.

To clean the compiled files, simply delete `esm/` directory.

## Testing

Plugin's source code is type-checked by TypeScript Compiler.
If there is a type error, `npm run build` exits with non-zero code.

To test the plugin's behavior, run unit tests by running:

```
$ npm test
```

If you don't want the test runner to go interactive mode, set `CI=true` and run the command:

```
$ CI=true npm test
```

Test files are inside [`tests/`](../tests/) directory, grouped into sub-directories.
Each sub-directory simulates real-world usecase by having `gleam.toml` and `src/` files, and an unit test invokes Rollup/Vite using those files.

Do not write flaky tests: keep assertions simple and avoid timer-based wait functions as much as possible.

## Code formatting

Source code in this project should adhere to style guide defined in [`.editorconfig` file](../.editorconfig).
Use of text editor supporting EditorConfig or EditorConfig plugin is preferable.

Source code in this project should be consistently formatted using [dprint][dprint].

```
$ dprint fmt
```

**Run the above command before creating a commit**.

## Copyright and license annotation

Every checked-in files SHOULD have proper copyright and license annotation.
Annotations MUST conform [REUSE v3.3 Specification](https://reuse.software/spec-3.3/).

To check the annotations, run:

```
$ reuse lint
```

The above command requires [reuse tool][reuse-tool] to be installed on your system.
**Run the above command before creating a commit**.
