import { useState, useRef, useEffect } from "react";
import { useQueryStates, parseAsStringLiteral, parseAsInteger } from "nuqs";
import { createBook, PageSize, Margins } from "clarkbook";
import { Download, Github, ChevronDown, Sun, Moon } from "lucide-react";
import {
	Panel,
	Group as PanelGroup,
	Separator as PanelResizeHandle,
} from "react-resizable-panels";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { EditorView } from "@codemirror/view";
import clsx from "clsx";
import PdfPreview from "./PdfPreview.jsx";
import logoUrl from "../public/plutoprint.jpg?url";
import templateDefault from './templates/default.html?raw';
import templateInvoice from './templates/invoice.html?raw';
import templateResume from './templates/resume.html?raw';
import templateReport from './templates/report.html?raw';
import templateCertificate from './templates/certificate.html?raw';
import templateMenu from './templates/menu.html?raw';
import templateProposal from './templates/proposal.html?raw';
import templateAnnouncement from './templates/announcement.html?raw';
import { fetchRemoteResources } from './utils/resourceCache.js';

export function landscape(pageSize) {
	const [w, h] = pageSize;
	return [h, w];
}

const TEMPLATES = [
	{ id: "default", label: "Default", html: templateDefault },
	{ id: "invoice", label: "Invoice", html: templateInvoice },
	{ id: "resume", label: "Résumé", html: templateResume },
	{ id: "report", label: "Report", html: templateReport },
	{ id: "certificate", label: "Certificate", html: templateCertificate },
	{ id: "menu", label: "Menu", html: templateMenu },
	{ id: "proposal", label: "Proposal (4 pages)", html: templateProposal },
	{ id: "announcement", label: "សេចក្ដីជូនដំណឹង (2 pages)", html: templateAnnouncement },
];

const geistMonoTheme = EditorView.theme({
	"&": { fontFamily: "'Geist Mono', ui-monospace, monospace" },
	".cm-content": { fontFamily: "'Geist Mono', ui-monospace, monospace" },
	".cm-gutters": { fontFamily: "'Geist Mono', ui-monospace, monospace" },
});

const PAGE_SIZES = ["A3", "A4", "A5", "B4", "B5", "Letter", "Legal", "Ledger"];
const MARGIN_TYPES = ["None", "Narrow", "Normal", "Moderate", "Wide"];
const FORMATS = [
	{ value: "pdf", label: "PDF" },
	{ value: "png", label: "PNG" },
	{ value: "jpeg", label: "JPEG" },
	{ value: "webp", label: "WebP" },
];

function Select({ value, onChange, options }) {
	return (
		<div className="relative flex items-center">
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="appearance-none bg-[#f5f5f5] dark:bg-[#0a0a0a] border border-[#e0e0e0] dark:border-[#2a2a2a] text-[#333] dark:text-[#ccc] text-xs pl-2 pr-6 h-7 outline-none focus:border-[#aaa] dark:focus:border-[#555] cursor-pointer"
			>
				{options.map((o) => (
					<option key={o.value ?? o} value={o.value ?? o}>
						{o.label ?? o}
					</option>
				))}
			</select>
			<ChevronDown
				size={10}
				className="absolute right-1.5 text-[#aaa] dark:text-[#555] pointer-events-none"
			/>
		</div>
	);
}

function NumberInput({ value, onChange, placeholder }) {
	return (
		<input
			type="number"
			value={value}
			onChange={(e) => onChange(Number(e.target.value))}
			placeholder={placeholder}
			className="bg-[#f5f5f5] dark:bg-[#0a0a0a] border border-[#e0e0e0] dark:border-[#2a2a2a] text-[#333] dark:text-[#ccc] text-xs px-2 h-7 w-20 outline-none focus:border-[#aaa] dark:focus:border-[#555]"
		/>
	);
}

export default function App() {
	const [{ templateId, format, pageSize, orientation, margins, imgWidth, imgHeight }, setUrlState] =
		useQueryStates({
			templateId: parseAsStringLiteral(TEMPLATES.map((t) => t.id)).withDefault("default"),
			format: parseAsStringLiteral(["pdf", "png", "jpeg", "webp"]).withDefault("pdf"),
			pageSize: parseAsStringLiteral(PAGE_SIZES).withDefault("A4"),
			orientation: parseAsStringLiteral(["portrait", "landscape"]).withDefault("portrait"),
			margins: parseAsStringLiteral(MARGIN_TYPES).withDefault("None"),
			imgWidth: parseAsInteger.withDefault(1200),
			imgHeight: parseAsInteger.withDefault(800),
		});

	const setTemplateId = (id) => setUrlState({ templateId: id });
	const setFormat = (v) => setUrlState({ format: v });
	const setPageSize = (v) => setUrlState({ pageSize: v });
	const setOrientation = (v) => setUrlState({ orientation: v });
	const setMargins = (v) => setUrlState({ margins: v });
	const setImgWidth = (v) => setUrlState({ imgWidth: v });
	const setImgHeight = (v) => setUrlState({ imgHeight: v });

	const [html, setHtml] = useState(
		() => TEMPLATES.find((t) => t.id === templateId)?.html ?? TEMPLATES[0].html,
	);
	const [status, setStatus] = useState("loading");
	const [dark, setDark] = useState(
		() => localStorage.getItem("theme") !== "light",
	);

	const [previewUrl, setPreviewUrl] = useState(null);
	const [bookReady, setBookReady] = useState(false);
	const [renderMs, setRenderMs] = useState(null);
	const [exportOptions, setExportOptions] = useState({});

	const bookRef = useRef(null);
	const debounceRef = useRef(null);
	const previewUrlRef = useRef(null);

	useEffect(() => {
		fetch(logoUrl)
			.then((res) => res.arrayBuffer())
			.then((buffer) => {
				setExportOptions({
					baseUrl: "https://example.com",
					resources: {
						"https://example.com/plutoprint.jpg": new Uint8Array(buffer),
					},
				});
			});
	}, []);

	useEffect(() => {
		fetch("/GoogleSans-VariableFont_GRAD,opsz,wght.ttf")
			.then((res) => res.arrayBuffer())
			.then((buf) =>
				createBook({
					fonts: [
						["GoogleSans-VariableFont_GRAD,opsz,wght.ttf", new Uint8Array(buf)],
					],
				}),
			)
			.then((book) => {
				bookRef.current = book;
				setStatus("ready");
				setBookReady(true);
			})
			.catch(() => setStatus("error"));

		return () => {
			if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
		};
	}, []);

	useEffect(() => {
		if (!bookReady) return;
		clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(async () => {
			try {
				const remoteResources = await fetchRemoteResources(html);
				const opts = {
					...exportOptions,
					resources: { ...exportOptions.resources, ...remoteResources },
				};
				const t0 = performance.now();
				let bytes;
				let mime;
				const resolvedPageSize =
					orientation === "landscape"
						? landscape(PageSize[pageSize])
						: PageSize[pageSize];
				if (format === "pdf") {
					bytes = bookRef.current.pdf(html, {
						pageSize: resolvedPageSize,
						margins: Margins[margins],
						...opts,
					});
					mime = "application/pdf";
				} else {
					bytes = bookRef.current.image(html, {
						format,
						width: imgWidth,
						height: imgHeight,
						...opts,
					});
					mime = `image/${format}`;
				}
				setRenderMs(Math.round(performance.now() - t0));
				const blob = new Blob([bytes], { type: mime });
				const url = URL.createObjectURL(blob);
				if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
				previewUrlRef.current = url;
				setPreviewUrl(url);
			} catch (err) {
				console.error(err);
			}
		}, 1);
		return () => clearTimeout(debounceRef.current);
	}, [
		html,
		format,
		pageSize,
		orientation,
		margins,
		imgWidth,
		imgHeight,
		bookReady,
		exportOptions,
	]);

	async function handleExport() {
		if (!bookRef.current || status === "exporting") return;
		setStatus("exporting");
		try {
			let bytes;
			let mime;
			let ext;
			const remoteResources = await fetchRemoteResources(html);
			const opts = {
				...exportOptions,
				resources: { ...exportOptions.resources, ...remoteResources },
			};
			const resolvedPageSize =
				orientation === "landscape"
					? landscape(PageSize[pageSize])
					: PageSize[pageSize];
			if (format === "pdf") {
				bytes = bookRef.current.pdf(html, {
					pageSize: resolvedPageSize,
					margins: Margins[margins],
					...opts,
				});
				mime = "application/pdf";
				ext = "pdf";
			} else {
				bytes = bookRef.current.image(html, {
					format,
					width: imgWidth,
					height: imgHeight,
					...opts,
				});
				mime = `image/${format}`;
				ext = format;
			}
			const blob = new Blob([bytes], { type: mime });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `export.${ext}`;
			a.click();
			URL.revokeObjectURL(url);
			setStatus("ready");
		} catch (err) {
			console.error(err);
			setStatus("error");
		}
	}

	const isReady = status === "ready";

	return (
		<div
			className={clsx(
				"flex flex-col h-screen overflow-hidden bg-white text-black dark:bg-black dark:text-white",
				dark && "dark",
			)}
		>
			{status === "loading" && (
				<div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white dark:bg-black">
					<div className="flex gap-1">
						{[0, 1, 2].map((i) => (
							<span
								key={i}
								className="w-1 h-1 bg-black dark:bg-white animate-bounce"
								style={{ animationDelay: `${i * 0.15}s` }}
							/>
						))}
					</div>
					<span className="text-[11px] font-mono text-[#aaa] dark:text-[#555]">
						Loading WASM...
					</span>
				</div>
			)}
			{/* Header */}
			<header className="flex items-center justify-between px-4 h-12 border-b border-[#e5e5e5] dark:border-[#1a1a1a] shrink-0 bg-white dark:bg-black">
				<div className="flex items-center gap-3">
					<span className="text-sm font-semibold tracking-tight">
						ClarkBook
					</span>
					<span className="text-[11px] text-[#aaa] dark:text-[#555] border border-[#e5e5e5] dark:border-[#1f1f1f] px-2 py-0.5 font-mono">
						HTML → PDF & Image
					</span>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() =>
							setDark((d) => {
								const next = !d;
								localStorage.setItem("theme", next ? "dark" : "light");
								return next;
							})
						}
						className="text-[#aaa] dark:text-[#555] hover:text-black dark:hover:text-white transition-colors p-1"
					>
						{dark ? <Sun size={15} /> : <Moon size={15} />}
					</button>
					<a
						href="https://github.com/seanghay/clarkbook"
						target="_blank"
						rel="noreferrer"
						className="text-[#aaa] dark:text-[#555] hover:text-black dark:hover:text-white transition-colors"
					>
						<Github size={16} />
					</a>
				</div>
			</header>

			{/* Toolbar */}
			<div className="flex items-center gap-2 px-3 h-10 border-b border-[#e5e5e5] dark:border-[#1a1a1a] bg-white dark:bg-black shrink-0">
				<Select
					value={templateId}
					onChange={(id) => {
						const t = TEMPLATES.find((t) => t.id === id);
						if (t) {
							setTemplateId(id);
							setHtml(t.html);
						}
					}}
					options={TEMPLATES.map((t) => ({ value: t.id, label: t.label }))}
				/>
				<div className="w-px h-4 bg-[#e5e5e5] dark:bg-[#1f1f1f]" />
				<Select
					value={format}
					onChange={(v) => {
						setUrlState({ format: v, ...(v !== "pdf" ? { imgWidth: 1200, imgHeight: 0 } : {}) });
					}}
					options={FORMATS}
				/>

				{format === "pdf" ? (
					<>
						<div className="w-px h-4 bg-[#e5e5e5] dark:bg-[#1f1f1f]" />
						<Select
							value={pageSize}
							onChange={setPageSize}
							options={PAGE_SIZES}
						/>
						<Select
							value={orientation}
							onChange={setOrientation}
							options={[
								{ value: "portrait", label: "Portrait" },
								{ value: "landscape", label: "Landscape" },
							]}
						/>
						<Select
							value={margins}
							onChange={setMargins}
							options={MARGIN_TYPES}
						/>
					</>
				) : (
					<>
						<div className="w-px h-4 bg-[#e5e5e5] dark:bg-[#1f1f1f]" />
						<div className="flex items-center gap-1.5">
							<NumberInput
								value={imgWidth}
								onChange={setImgWidth}
								placeholder="Width"
							/>
							<span className="text-[#aaa] dark:text-[#444] text-xs">×</span>
							<NumberInput
								value={imgHeight}
								onChange={setImgHeight}
								placeholder="Height"
							/>
						</div>
					</>
				)}

				<div className="ml-auto">
					<button
						type="button"
						onClick={handleExport}
						disabled={!isReady}
						className={clsx(
							"bg-black text-white dark:bg-white dark:text-black text-xs font-medium px-3 h-7 flex items-center gap-1.5 transition-colors",
							isReady
								? "hover:bg-[#222] dark:hover:bg-[#e5e5e5] cursor-pointer"
								: "opacity-40 cursor-not-allowed",
						)}
					>
						<Download size={12} />
						{status === "exporting" ? "Exporting..." : "Export"}
					</button>
				</div>
			</div>

			{/* Editor */}
			<PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
				{/* Code Pane */}
				<Panel
					defaultSize={50}
					minSize={20}
					className="flex flex-col overflow-hidden"
				>
					<div className="text-[10px] text-[#bbb] dark:text-[#3a3a3a] px-3 py-1.5 border-b border-[#f0f0f0] dark:border-[#111] font-mono uppercase tracking-widest shrink-0 bg-white dark:bg-black">
						HTML
					</div>
					<div className="flex-1 overflow-hidden">
						<CodeMirror
							value={html}
							onChange={setHtml}
							height="100%"
							extensions={[htmlLang(), geistMonoTheme]}
							theme={dark ? githubDark : githubLight}
							basicSetup={{ tabSize: 2, foldGutter: false }}
							style={{
								fontFamily: "'Geist Mono', ui-monospace, monospace",
								fontSize: "13px",
								height: "100%",
							}}
						/>
					</div>
				</Panel>

				{/* Resize Handle */}
				<PanelResizeHandle className="w-px bg-[#e5e5e5] dark:bg-[#1a1a1a] hover:bg-[#bbb] dark:hover:bg-[#444] transition-colors cursor-col-resize" />

				{/* Preview Pane */}
				<Panel
					defaultSize={50}
					minSize={20}
					className="flex flex-col overflow-hidden"
				>
					<div className="text-[10px] text-[#bbb] dark:text-[#3a3a3a] px-3 py-1.5 border-b border-[#f0f0f0] dark:border-[#111] font-mono uppercase tracking-widest shrink-0 bg-white dark:bg-black">
						Preview
					</div>
					<div className="flex-1 overflow-hidden bg-white">
						{previewUrl ? (
							format === "pdf" ? (
								<PdfPreview url={previewUrl} />
							) : (
								<img
									src={previewUrl}
									className="w-full h-full object-contain"
									alt="Preview"
								/>
							)
						) : (
							<div className="w-full h-full flex items-center justify-center text-[#bbb] dark:text-[#3a3a3a] text-xs font-mono">
								{status === "loading" ? "Loading WASM..." : "No preview"}
							</div>
						)}
					</div>
				</Panel>
			</PanelGroup>

			{/* Status Bar */}
			<div className="flex items-center gap-3 px-3 h-6 border-t border-[#e5e5e5] dark:border-[#1a1a1a] text-[10px] text-[#bbb] dark:text-[#3a3a3a] font-mono shrink-0 bg-white dark:bg-black">
				<span>{html.length.toLocaleString()} chars</span>
				<span className="text-[#ddd] dark:text-[#222]">·</span>
				<span>{format.toUpperCase()}</span>
				{format !== "pdf" && (
					<>
						<span className="text-[#ddd] dark:text-[#222]">·</span>
						<span>
							{imgWidth} × {imgHeight}px
						</span>
					</>
				)}
				{format === "pdf" && (
					<>
						<span className="text-[#ddd] dark:text-[#222]">·</span>
						<span>
							{pageSize} · {orientation} · {margins}
						</span>
					</>
				)}
				<span className="ml-auto flex items-center gap-3">
					{renderMs !== null && <span>{renderMs}ms</span>}
					<span>
						{status === "loading" && "Loading WASM..."}
						{status === "ready" && "Ready"}
						{status === "exporting" && "Exporting..."}
						{status === "error" && "Error"}
					</span>
				</span>
			</div>
		</div>
	);
}
