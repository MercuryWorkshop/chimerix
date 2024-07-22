/*
 * Copyright (C) 2024 Puter Technologies Inc.
 *
 * This file is part of Puter.
 *
 * Puter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs';
import { SHELL_VERSIONS } from "./src/meta/versions.js";

const ajs_options = {
    // The shell language defaults to module but we should be explicit.
    lang: "module",
    // Version info is optional for anura binaries but we include it here for completeness.
    version: SHELL_VERSIONS[0].v,
}

export default {
    input: "src/main_anura.js",
    output: {
        file: "dist/phoenix.ajs",
        format: "es",
        banner: `#! ${JSON.stringify(ajs_options)}`,
    },
    plugins: [
        nodeResolve(),
        commonjs()
    ]
}
