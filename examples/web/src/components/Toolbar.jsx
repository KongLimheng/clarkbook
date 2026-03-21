import { memo } from "react";
import { Download } from "lucide-react";
import clsx from "clsx";
import { Select, NumberInput } from "./Select.jsx";
import { TEMPLATES, FORMATS, PAGE_SIZES, MARGIN_TYPES } from "../constants.js";

export const Toolbar = memo(function Toolbar({
	templateId, format, pageSize, orientation, margins, imgWidth, imgHeight,
	status, onTemplateChange, onFormatChange, onPageSizeChange, onOrientationChange,
	onMarginsChange, onImgWidthChange, onImgHeightChange, onExport,
}) {
	const isReady = status === "ready";

	return (
		<div className="flex items-center gap-2 px-3 h-10 border-b border-[#e5e5e5] dark:border-[#1a1a1a] bg-white dark:bg-black shrink-0 overflow-x-auto">
			<Select
				value={templateId}
				onChange={onTemplateChange}
				options={TEMPLATES.map((t) => ({ value: t.id, label: t.label }))}
			/>
			<div className="w-px h-4 bg-[#e5e5e5] dark:bg-[#1f1f1f]" />
			<Select value={format} onChange={onFormatChange} options={FORMATS} />

			{format === "pdf" ? (
				<>
					<div className="w-px h-4 bg-[#e5e5e5] dark:bg-[#1f1f1f]" />
					<Select value={pageSize} onChange={onPageSizeChange} options={PAGE_SIZES} />
					<Select
						value={orientation}
						onChange={onOrientationChange}
						options={[
							{ value: "portrait", label: "Portrait" },
							{ value: "landscape", label: "Landscape" },
						]}
					/>
					<Select value={margins} onChange={onMarginsChange} options={MARGIN_TYPES} />
				</>
			) : (
				<>
					<div className="w-px h-4 bg-[#e5e5e5] dark:bg-[#1f1f1f]" />
					<div className="flex items-center gap-1.5">
						<NumberInput value={imgWidth} onChange={onImgWidthChange} placeholder="Width" />
						<span className="text-[#aaa] dark:text-[#444] text-xs">×</span>
						<NumberInput value={imgHeight} onChange={onImgHeightChange} placeholder="Height" />
					</div>
				</>
			)}

			<div className="ml-auto">
				<button
					type="button"
					onClick={onExport}
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
	);
});
