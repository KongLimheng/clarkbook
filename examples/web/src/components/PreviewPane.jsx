import { memo } from "react";
import PdfPreview from "../PdfPreview.jsx";

export const PreviewPane = memo(function PreviewPane({ previewUrl, format, status }) {
	return (
		<div className="flex flex-col overflow-hidden h-full w-full">
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
		</div>
	);
});
