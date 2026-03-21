import { memo } from "react";

export const StatusBar = memo(function StatusBar({ html, format, imgWidth, imgHeight, pageSize, orientation, margins, renderMs, status }) {
	return (
		<div className="flex items-center gap-3 px-3 h-6 border-t border-[#e5e5e5] dark:border-[#1a1a1a] text-[10px] text-[#bbb] dark:text-[#3a3a3a] font-mono shrink-0 bg-white dark:bg-black">
			<span>{html.length.toLocaleString()} chars</span>
			<span className="text-[#ddd] dark:text-[#222]">·</span>
			<span>{format.toUpperCase()}</span>
			{format !== "pdf" && (
				<>
					<span className="text-[#ddd] dark:text-[#222]">·</span>
					<span>{imgWidth} × {imgHeight}px</span>
				</>
			)}
			{format === "pdf" && (
				<>
					<span className="text-[#ddd] dark:text-[#222]">·</span>
					<span>{pageSize} · {orientation} · {margins}</span>
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
	);
});
