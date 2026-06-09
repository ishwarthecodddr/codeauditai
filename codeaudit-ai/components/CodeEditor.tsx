"use client";

import Editor, { DiffEditor } from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language?: string;
  diffMode?: boolean;
  originalCode?: string;
  readOnly?: boolean;
}

export default function CodeEditor({ code, onChange, language = "python", diffMode = false, originalCode = "", readOnly = false }: CodeEditorProps) {
  if (diffMode) {
    return (
      <div className="h-full min-h-[500px] w-full rounded-md overflow-hidden border border-gray-700">
        <DiffEditor
          height="100%"
          language={language}
          original={originalCode}
          modified={code}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false }
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full min-h-[500px] w-full rounded-md overflow-hidden border border-gray-700">
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={onChange}
        theme="vs-dark"
        options={{
          readOnly: readOnly,
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />
    </div>
  );
}
