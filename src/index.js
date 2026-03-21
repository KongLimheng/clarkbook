import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { _create, PageSize, Margins } from "./utils.js";

const cwd = dirname(fileURLToPath(import.meta.url));
const wasmFile = join(cwd, "plutobook.wasm");

export async function createBook({ fonts = [] } = {}) {
	return _create({
		wasmFile,
		fonts,
	});
}

export { PageSize, Margins, _create };
