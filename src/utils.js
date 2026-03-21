import initialize from "./plutobook.js";

export const FONTS_CONF = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>/fonts</dir>
</fontconfig>`;

export const PageSize = {
	A3: [(297 * 72) / 25.4, (420 * 72) / 25.4],
	A4: [(210 * 72) / 25.4, (297 * 72) / 25.4],
	A5: [(148 * 72) / 25.4, (210 * 72) / 25.4],
	B4: [(250 * 72) / 25.4, (353 * 72) / 25.4],
	B5: [(176 * 72) / 25.4, (250 * 72) / 25.4],
	Letter: [8.5 * 72, 11 * 72],
	Legal: [8.5 * 72, 14 * 72],
	Ledger: [11 * 72, 17 * 72],
};

export const Margins = {
	None: [0, 0, 0, 0],
	Narrow: [36, 36, 36, 36],
	Normal: [72, 72, 72, 72],
	Moderate: [72, 54, 72, 54],
	Wide: [72, 144, 72, 144],
};

function detectMime(url) {
	const ext = url.split(".").pop().split("?")[0].toLowerCase();
	return (
		{
			css: "text/css",
			html: "text/html",
			htm: "text/html",
			xml: "application/xml",
			svg: "image/svg+xml",
			png: "image/png",
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			gif: "image/gif",
			webp: "image/webp",
			ttf: "font/ttf",
			otf: "font/otf",
			woff: "font/woff",
			woff2: "font/woff2",
			js: "text/javascript",
		}[ext] || "application/octet-stream"
	);
}

export function _loadResources(Module, resources) {
	for (const [url, data] of Object.entries(resources)) {
		const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
		const mime = detectMime(url);
		const ptr = Module._malloc(bytes.length);
		Module.HEAPU8.set(bytes, ptr);
		Module.ccall(
			"plutobook_wasm_register_resource",
			null,
			["string", "number", "number", "string"],
			[url, ptr, bytes.length, mime],
		);
		Module._free(ptr);
	}
}

export async function _create({ wasmFile, fonts = [] } = {}) {
	const Module = await initialize({
		locateFile: () => wasmFile,
		print: () => {},
		printErr: () => {},
	});

	Module.FS.mkdir("/fonts");
	Module.FS.writeFile("/fonts/fonts.conf", FONTS_CONF);

	for (const [name, buffer] of fonts) {
		Module.FS.writeFile(`/fonts/${name}`, buffer);
	}

	Module.ccall("plutobook_wasm_init", null, [], []);

	return {
		image(
			html,
			{
				format = "png",
				width = -1,
				height = -1,
				quality = 95,
				pageSize = PageSize.A4,
				margins = Margins.Normal,
				resources = {},
				userStyle = "",
				baseUrl = "",
			} = {},
		) {
			_loadResources(Module, resources);

			const [pageW, pageH] = pageSize;
			const [mT, mR, mB, mL] = margins;

			const outLenPtr = Module._malloc(4);
			Module.HEAPU32[outLenPtr >> 2] = 0;

			const imgPtr = Module.ccall(
				"plutobook_wasm_html_to_image",
				"number",
				[
					"string",
					"number",
					"number",
					"number",
					"number",
					"number",
					"number",
					"number",
					"string",
					"string",
					"number",
					"number",
					"number",
					"string",
					"number",
				],
				[
					html,
					-1,
					pageW,
					pageH,
					mT,
					mR,
					mB,
					mL,
					baseUrl,
					userStyle,
					width,
					height,
					quality,
					format,
					outLenPtr,
				],
			);

			const imgLen = Module.HEAPU32[outLenPtr >> 2];
			Module._free(outLenPtr);
			Module.ccall("plutobook_wasm_clear_resources", null, [], []);

			if (!imgPtr || imgLen === 0) {
				throw new Error(
					`plutobook: image rendering failed (format: ${format})`,
				);
			}

			const imgBytes = new Uint8Array(
				Module.HEAPU8.buffer,
				imgPtr,
				imgLen,
			).slice();
			Module.ccall("plutobook_wasm_free_buffer", null, ["number"], [imgPtr]);
			return imgBytes;
		},

		pdf(
			html,
			{
				pageSize = PageSize.A4,
				margins = Margins.Normal,
				resources = {},
				userStyle = "",
				baseUrl = "",
			} = {},
		) {
			_loadResources(Module, resources);
			const [pageW, pageH] = pageSize;
			const [mT, mR, mB, mL] = margins;
			const outLenPtr = Module._malloc(4);
			Module.HEAPU32[outLenPtr >> 2] = 0;

			const pdfPtr = Module.ccall(
				"plutobook_wasm_html_to_pdf",
				"number",
				[
					"string",
					"number",
					"number",
					"number",
					"number",
					"number",
					"number",
					"number",
					"string",
					"string",
					"number",
				],
				[html, -1, pageW, pageH, mT, mR, mB, mL, baseUrl, userStyle, outLenPtr],
			);

			const pdfLen = Module.HEAPU32[outLenPtr >> 2];
			Module._free(outLenPtr);
			Module.ccall("plutobook_wasm_clear_resources", null, [], []);

			if (!pdfPtr || pdfLen === 0) {
				throw new Error("plutobook: PDF rendering failed");
			}

			const pdfBytes = new Uint8Array(
				Module.HEAPU8.buffer,
				pdfPtr,
				pdfLen,
			).slice();
			Module.ccall("plutobook_wasm_free_buffer", null, ["number"], [pdfPtr]);
			return pdfBytes;
		},
	};
}
