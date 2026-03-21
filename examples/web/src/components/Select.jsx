import { memo } from "react";
import { ChevronDown } from "lucide-react";

export const Select = memo(function Select({ value, onChange, options }) {
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
});

export const NumberInput = memo(function NumberInput({ value, onChange, placeholder }) {
	return (
		<input
			type="number"
			value={value}
			onChange={(e) => onChange(Number(e.target.value))}
			placeholder={placeholder}
			className="bg-[#f5f5f5] dark:bg-[#0a0a0a] border border-[#e0e0e0] dark:border-[#2a2a2a] text-[#333] dark:text-[#ccc] text-xs px-2 h-7 w-20 outline-none focus:border-[#aaa] dark:focus:border-[#555]"
		/>
	);
});
