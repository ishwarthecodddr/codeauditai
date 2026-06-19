"use client";

import Editor, { DiffEditor } from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language?: string;
  diffMode?: boolean;
  originalCode?: string;
  readOnly?: boolean;
  theme?: "dark" | "light";
}

export default function CodeEditor({ 
  code, 
  onChange, 
  language = "python", 
  diffMode = false, 
  originalCode = "", 
  readOnly = false,
  theme = "dark"
}: CodeEditorProps) {
  
  const monacoTheme = theme === "dark" ? "vs-dark" : "light";

  if (diffMode) {
    return (
      <div className="code-editor-shell h-[560px] lg:h-full min-h-[480px] w-full rounded-lg overflow-hidden border border-[var(--border-color)] bg-[var(--editor-bg)] transition-all duration-150 ease-in-out">
        <DiffEditor
          height="100%"
          language={language}
          original={originalCode}
          modified={code}
          theme={monacoTheme}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontFamily: "JetBrains Mono, Fira Code, monospace",
            fontSize: 13,
            lineHeight: 20,
            renderSideBySide: true,
            overviewRulerLanes: 0,
            scrollBeyondLastLine: false,
            scrollbar: {
              verticalScrollbarSize: 5,
              horizontalScrollbarSize: 5,
              useShadows: false,
            },
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    );
  }

  return (
    <div className="code-editor-shell h-[560px] lg:h-full min-h-[480px] w-full rounded-lg overflow-hidden border border-[var(--border-color)] bg-[var(--editor-bg)] transition-all duration-150 ease-in-out">
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={onChange}
        theme={monacoTheme}
        options={{
          readOnly: readOnly,
          minimap: { enabled: false },
          fontFamily: "JetBrains Mono, Fira Code, monospace",
          fontSize: 13,
          lineHeight: 20,
          overviewRulerLanes: 0,
          scrollBeyondLastLine: false,
          scrollbar: {
            verticalScrollbarSize: 5,
            horizontalScrollbarSize: 5,
            useShadows: false,
          },
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
