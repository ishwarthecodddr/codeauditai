"use client";

import { useState } from "react";
import Editor, { DiffEditor } from "@monaco-editor/react";
import { 
  Check, 
  Copy, 
  RotateCcw, 
  Columns, 
  Rows, 
  Undo2, 
  Redo2, 
  Sparkles, 
  Code2
} from "lucide-react";

interface CodeEditorProps {
  code: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  diffMode?: boolean;
  originalCode?: string;
  readOnly?: boolean;
  theme?: "dark" | "light";
  onAcceptRefactor?: () => void;
  onRevertCode?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export default function CodeEditor({ 
  code, 
  onChange, 
  language = "python", 
  diffMode = false, 
  originalCode = "", 
  readOnly = false,
  theme = "dark",
  onAcceptRefactor,
  onRevertCode,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}: CodeEditorProps) {
  const [renderSideBySide, setRenderSideBySide] = useState(true);
  const [copied, setCopied] = useState(false);

  const monacoTheme = theme === "dark" ? "vs-dark" : "light";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[500px] w-full rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--panel-bg)] shadow-sm transition-all duration-200 ease-in-out">
      
      {/* Interactive Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[var(--border-color)] bg-[var(--panel-bg)] shrink-0">
        
        {/* Left Side: Mode Status Badge */}
        <div className="flex items-center gap-2">
          {diffMode ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--accent-color)] bg-[var(--active-bg)] border border-[var(--accent-border)] px-2.5 py-1 rounded-md">
                <Sparkles className="w-3.5 h-3.5" />
                Refactored Diff View
              </span>
              <span className="text-[10px] font-mono text-[var(--muted-text)] hidden sm:inline-block">
                Original vs AI Refactor
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-color)] bg-[var(--inset-bg)] border border-[var(--border-color)] px-2.5 py-1 rounded-md">
                <Code2 className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                Source Editor
              </span>
              <span className="text-[10px] font-mono font-bold text-[var(--muted-text)] bg-[var(--inset-bg)] border border-[var(--border-color)] px-2 py-0.5 rounded uppercase">
                {language}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-1.5">
          
          {/* Diff Mode Actions */}
          {diffMode && (
            <>
              {/* Layout Toggle: Side-by-side vs Inline */}
              <button
                onClick={() => setRenderSideBySide(!renderSideBySide)}
                className="p-1.5 rounded-md border border-[var(--border-color)] hover:bg-[var(--inset-bg)] text-[var(--muted-text)] hover:text-[var(--text-color)] transition-all cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                title={renderSideBySide ? "Switch to Inline View" : "Switch to Side-by-Side View"}
              >
                {renderSideBySide ? (
                  <>
                    <Rows className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Inline</span>
                  </>
                ) : (
                  <>
                    <Columns className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Split</span>
                  </>
                )}
              </button>

              {/* Accept Refactor Button */}
              {onAcceptRefactor && (
                <button
                  onClick={onAcceptRefactor}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Accept AI Refactored Code"
                >
                  <Check className="w-3.5 h-3.5" />
                  Accept
                </button>
              )}
            </>
          )}

          {/* Revert / Ctrl+Z Button */}
          {onRevertCode && (
            <button
              onClick={onRevertCode}
              disabled={!canUndo && !diffMode}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
              title="Revert Code Changes (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Revert</span>
              <kbd className="hidden sm:inline-block text-[9px] font-mono bg-red-500/10 px-1 py-0.2 rounded border border-red-500/30">
                Ctrl+Z
              </kbd>
            </button>
          )}

          {/* Undo / Redo in source editor */}
          {!diffMode && (
            <div className="flex items-center gap-1">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-1.5 rounded-md border border-[var(--border-color)] hover:bg-[var(--inset-bg)] text-[var(--muted-text)] hover:text-[var(--text-color)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-1.5 rounded-md border border-[var(--border-color)] hover:bg-[var(--inset-bg)] text-[var(--muted-text)] hover:text-[var(--text-color)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md border border-[var(--border-color)] hover:bg-[var(--inset-bg)] text-[var(--muted-text)] hover:text-[var(--text-color)] transition-all cursor-pointer flex items-center gap-1 text-[11px]"
            title="Copy Code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] text-emerald-500 font-semibold">Copied!</span>
              </>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

        </div>

      </div>

      {/* Editor Body */}
      <div className="code-editor-shell flex-grow min-h-0 w-full relative">
        {diffMode ? (
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
              lineHeight: 21,
              renderSideBySide: renderSideBySide,
              overviewRulerLanes: 0,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              lineNumbersMinChars: 3,
              scrollbar: {
                verticalScrollbarSize: 6,
                horizontalScrollbarSize: 6,
                useShadows: false,
              },
              padding: { top: 12, bottom: 12 },
            }}
          />
        ) : (
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
              lineHeight: 21,
              overviewRulerLanes: 0,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              lineNumbersMinChars: 3,
              scrollbar: {
                verticalScrollbarSize: 6,
                horizontalScrollbarSize: 6,
                useShadows: false,
              },
              padding: { top: 12, bottom: 12 },
            }}
          />
        )}
      </div>

    </div>
  );
}
