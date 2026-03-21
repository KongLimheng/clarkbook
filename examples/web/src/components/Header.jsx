import { Sun, Moon, Github } from "lucide-react";

export function Header({ dark, onToggleDark }) {
	return (
		<header className="flex items-center justify-between px-4 h-12 border-b border-[#e5e5e5] dark:border-[#1a1a1a] shrink-0 bg-white dark:bg-black">
			<div className="flex items-center gap-3">
				<span className="text-sm font-semibold tracking-tight">ClarkBook</span>
				<span className="text-[11px] text-[#aaa] dark:text-[#555] border border-[#e5e5e5] dark:border-[#1f1f1f] px-2 py-0.5 font-mono">
					HTML → PDF & Image
				</span>
			</div>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={onToggleDark}
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
	);
}
