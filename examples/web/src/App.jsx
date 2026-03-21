import { useState, useRef, useEffect } from "react";
import { useQueryStates, parseAsStringLiteral, parseAsInteger } from "nuqs";
import { createBook, PageSize, Margins } from "clarkbook";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import clsx from "clsx";
import logoUrl from "../public/plutoprint.jpg?url";
import { fetchRemoteResources } from './utils/resourceCache.js';
import { TEMPLATES, PAGE_SIZES, MARGIN_TYPES } from './constants.js';
import { Header } from './components/Header.jsx';
import { Toolbar } from './components/Toolbar.jsx';
import { EditorPane } from './components/EditorPane.jsx';
import { PreviewPane } from './components/PreviewPane.jsx';
import { StatusBar } from './components/StatusBar.jsx';

export function landscape(pageSize) {
	const [w, h] = pageSize;
	return [h, w];
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

	const [html, setHtml] = useState(
		() => TEMPLATES.find((t) => t.id === templateId)?.html ?? TEMPLATES[0].html,
	);
	const [status, setStatus] = useState("loading");
	const [dark, setDark] = useState(() => localStorage.getItem("theme") !== "light");
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
					fonts: [["GoogleSans-VariableFont_GRAD,opsz,wght.ttf", new Uint8Array(buf)]],
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
				const resolvedPageSize =
					orientation === "landscape" ? landscape(PageSize[pageSize]) : PageSize[pageSize];
				let bytes, mime;
				if (format === "pdf") {
					bytes = bookRef.current.pdf(html, { pageSize: resolvedPageSize, margins: Margins[margins], ...opts });
					mime = "application/pdf";
				} else {
					bytes = bookRef.current.image(html, { format, width: imgWidth, height: imgHeight, ...opts });
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
	}, [html, format, pageSize, orientation, margins, imgWidth, imgHeight, bookReady, exportOptions]);

	async function handleExport() {
		if (!bookRef.current || status === "exporting") return;
		setStatus("exporting");
		try {
			const remoteResources = await fetchRemoteResources(html);
			const opts = {
				...exportOptions,
				resources: { ...exportOptions.resources, ...remoteResources },
			};
			const resolvedPageSize =
				orientation === "landscape" ? landscape(PageSize[pageSize]) : PageSize[pageSize];
			let bytes, mime, ext;
			if (format === "pdf") {
				bytes = bookRef.current.pdf(html, { pageSize: resolvedPageSize, margins: Margins[margins], ...opts });
				mime = "application/pdf";
				ext = "pdf";
			} else {
				bytes = bookRef.current.image(html, { format, width: imgWidth, height: imgHeight, ...opts });
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
					<span className="text-[11px] font-mono text-[#aaa] dark:text-[#555]">Loading WASM...</span>
				</div>
			)}

			<Header
				dark={dark}
				onToggleDark={() =>
					setDark((d) => {
						const next = !d;
						localStorage.setItem("theme", next ? "dark" : "light");
						return next;
					})
				}
			/>

			<Toolbar
				templateId={templateId}
				format={format}
				pageSize={pageSize}
				orientation={orientation}
				margins={margins}
				imgWidth={imgWidth}
				imgHeight={imgHeight}
				status={status}
				onTemplateChange={(id) => {
					const t = TEMPLATES.find((t) => t.id === id);
					if (t) { setUrlState({ templateId: id }); setHtml(t.html); }
				}}
				onFormatChange={(v) =>
					setUrlState({ format: v, ...(v !== "pdf" ? { imgWidth: 1200, imgHeight: 0 } : {}) })
				}
				onPageSizeChange={(v) => setUrlState({ pageSize: v })}
				onOrientationChange={(v) => setUrlState({ orientation: v })}
				onMarginsChange={(v) => setUrlState({ margins: v })}
				onImgWidthChange={(v) => setUrlState({ imgWidth: v })}
				onImgHeightChange={(v) => setUrlState({ imgHeight: v })}
				onExport={handleExport}
			/>

			<PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
				<Panel defaultSize={50} minSize={20} className="flex flex-col overflow-hidden">
					<EditorPane html={html} onChange={setHtml} dark={dark} />
				</Panel>
				<PanelResizeHandle className="w-px bg-[#e5e5e5] dark:bg-[#1a1a1a] hover:bg-[#bbb] dark:hover:bg-[#444] transition-colors cursor-col-resize" />
				<Panel defaultSize={50} minSize={20} className="flex flex-col overflow-hidden">
					<PreviewPane previewUrl={previewUrl} format={format} status={status} />
				</Panel>
			</PanelGroup>

			<StatusBar
				html={html}
				format={format}
				imgWidth={imgWidth}
				imgHeight={imgHeight}
				pageSize={pageSize}
				orientation={orientation}
				margins={margins}
				renderMs={renderMs}
				status={status}
			/>
		</div>
	);
}
