import { memo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { EditorView } from "@codemirror/view";

const geistMonoTheme = EditorView.theme({
	"&": { fontFamily: "'Geist Mono', ui-monospace, monospace" },
	".cm-content": { fontFamily: "'Geist Mono', ui-monospace, monospace" },
	".cm-gutters": { fontFamily: "'Geist Mono', ui-monospace, monospace" },
});

const extensions = [htmlLang(), geistMonoTheme];

export const EditorPane = memo(function EditorPane({ html, onChange, dark }) {
	return (
		<div className="flex flex-col overflow-hidden h-full">
			<div className="text-[10px] text-[#bbb] dark:text-[#3a3a3a] px-3 py-1.5 border-b border-[#f0f0f0] dark:border-[#111] font-mono uppercase tracking-widest shrink-0 bg-white dark:bg-black">
				HTML
			</div>
			<div className="flex-1 overflow-hidden">
				<CodeMirror
					value={html}
					onChange={onChange}
					height="100%"
					extensions={extensions}
					theme={dark ? githubDark : githubLight}
					basicSetup={{ tabSize: 2, foldGutter: false }}
					style={{
						fontFamily: "'Geist Mono', ui-monospace, monospace",
						fontSize: "13px",
						height: "100%",
					}}
				/>
			</div>
		</div>
	);
});
