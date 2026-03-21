import { _create, PageSize, Margins } from "./utils.js";

const wasmFile = new URL("./plutobook.wasm", import.meta.url).href;

export async function createBook({ fonts = [] } = {}) {
	return _create({
		wasmFile,
		fonts,
	});
}

export { PageSize, Margins, _create };
