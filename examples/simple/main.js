import fs from "node:fs/promises";
import { createBook } from "clarkbook";

const book = await createBook({
	fonts: [
		[
			"GoogleSans.ttf",
			await fs.readFile("GoogleSans-VariableFont_GRAD,opsz,wght.ttf"),
		],
	],
});

const html = `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; margin: 0; padding: 2em; color: #222; }
  h1   { color: #2c5f8a; border-bottom: 2px solid #2c5f8a; padding-bottom: .25em; }
  p    { line-height: 1.7; }
  ul   { line-height: 1.9; }
</style>
</head>
<body>
  <h1>Hello from PlutoBook WASM</h1>
  <p>This PDF was rendered entirely by <strong>PlutoBook</strong> running as
     WebAssembly in Node.js — no headless browser required.</p>
  <p>Features:</p>
  <p>ក្នុងឱកាសទិវាអន្តរជាតិហ្វ្រង់កូហ្វូនី(ប្រទេសនិយាយភាសាបារាំង,LaFrancophonie)ដែលបានប្រារព្ធឡើងនៅថ្ងៃទី២០ខែមីនាក្រុមហ៊ុនវិនិយោគទុនអាណិកជនកម្ពុជា(OCIC)និងសម្ព័ន្ធភាពបារាំងខេត្តសៀមរាបបានចុះហត្ថលេខាលើកិច្ចព្រមព្រៀងភាពជាដៃគូមួយដែលមានគោលបំណងគាំទ្រកម្មវិធីអប់រំនិងវប្បធម៌ដែលគាំទ្រដល់ការលើកកម្ពស់ភាសាបារាំងនៅតាមសាលារៀនសាធារណៈក្នុងខេត្តសៀមរាប។</p>
  <ul>
    <li>Full HTML5 / CSS3 layout engine</li>
    <li>Paged media support (@page rules, page breaks)</li>
    <li>SVG rendering</li>
    <li>Cairo-backed PDF output</li>
  </ul>
</body>
</html>`;

await fs.writeFile("out.pdf", book.pdf(html));
await fs.writeFile("out.png", book.image(html));
await fs.writeFile("out.jpg", book.image(html, { format: "jpg" }));
