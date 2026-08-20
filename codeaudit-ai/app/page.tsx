"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Sun, Moon, Sparkles, RotateCcw, Check, Command } from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import AgentStatus from "@/components/AgentStatus";
import ReviewResults from "@/components/ReviewResults";
import { ReviewResult, WebSocketMessage } from "@/types";

const INITIAL_CODE = `def calculate_sum(n):
    result = 0
    for i in range(n):
        for j in range(n):
            result += i + j
    return result
`;

interface ToastState {
  message: string;
  type?: "info" | "success" | "warning";
}

export default function Dashboard() {
  // Main Code State
  const [code, setCode] = useState<string>(INITIAL_CODE);
  
  // History stack for Ctrl+Z / Ctrl+Y
  const [history, setHistory] = useState<string[]>([INITIAL_CODE]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  
  // Websocket reference
  const [ws, setWs] = useState<WebSocket | null>(null);
  
  // Theme state
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Streaming UI State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [statusNode, setStatusNode] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("Awaiting code submission...");
  
  // Audit Results
  const [result, setResult] = useState<ReviewResult | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string, type: "info" | "success" | "warning" = "info") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Helper to push state onto undo history stack
  const updateCodeWithHistory = (newCode: string) => {
    setCode(newCode);
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, newCode];
    });
    setHistoryIndex((prev) => prev + 1);
  };

  // Undo (Ctrl+Z) logic
  const handleUndo = useCallback(() => {
    if (result) {
      // If currently viewing diff result, Ctrl+Z reverts back to original code
      const orig = result.original_code;
      setCode(orig);
      setResult(null);
      showToast("Reverted AI refactor to original code (Ctrl+Z)", "warning");
      return;
    }

    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setCode(history[prevIdx]);
      showToast("Undid last change (Ctrl+Z)", "info");
    }
  }, [result, historyIndex, history, showToast]);

  // Redo (Ctrl+Y / Cmd+Shift+Z) logic
  const handleRedo = useCallback(() => {
    if (!result && historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setCode(history[nextIdx]);
      showToast("Redid change (Ctrl+Y)", "info");
    }
  }, [result, historyIndex, history, showToast]);

  // Accept Refactored Code
  const handleAcceptRefactor = () => {
    if (result) {
      const updated = result.updated_code;
      updateCodeWithHistory(updated);
      setResult(null);
      showToast("Accepted AI refactored code!", "success");
    }
  };

  // Revert Refactored Code
  const handleRevertCode = () => {
    handleUndo();
  };

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Cmd+Z, Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (isCmdOrCtrl && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  const startReview = () => {
    setIsEvaluating(true);
    setResult(null);
    setStatusNode("");
    setStatusMessage("Connecting to AI Orchestrator...");

    if (ws) ws.close();

    const socket = new WebSocket("ws://localhost:8000/api/ws/review");
    
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          source_code: code,
          language: "python",
        })
      );
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as WebSocketMessage;
      
      if (data.type === "status") {
        setStatusNode(data.node);
        setStatusMessage(data.message);
      } else if (data.type === "result") {
        const res = data as ReviewResult;
        setResult(res);
        setIsEvaluating(false);
        setStatusMessage("Audit complete.");
        showToast("Audit complete! Review refactored code or press Ctrl+Z to revert.", "success");
        socket.close();
      } else if (data.type === "error") {
        setStatusMessage(`Error: ${data.message || "Something went wrong"}`);
        setIsEvaluating(false);
        showToast(`Audit failed: ${data.message}`, "warning");
      }
    };

    socket.onerror = () => {
      setStatusMessage("WebSocket connection failed. Verify backend server is running on port 8000.");
      setIsEvaluating(false);
      showToast("WebSocket server unreachable at localhost:8000", "warning");
    };

    setWs(socket);
  };

  const resetAudit = () => {
    if (result) {
      setCode(result.updated_code);
    }
    setResult(null);
    setStatusNode("");
    setStatusMessage("Awaiting code submission...");
  };

  return (
    <div className={theme}>
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex flex-col transition-colors duration-200 ease-in-out">
        
        {/* Glassmorphism Header Bar */}
        <header className="sticky top-0 z-30 flex justify-between items-center h-14 border-b border-[var(--border-color)] px-4 sm:px-6 lg:px-8 bg-[var(--panel-glass)] backdrop-blur-md transition-colors duration-200 ease-in-out shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-color)] shadow-xs"></span>
              <span className="font-sans text-xs font-black uppercase tracking-widest text-[var(--text-color)]">
                CodeAudit AI
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-[var(--border-color)] bg-[var(--inset-bg)] text-[var(--muted-text)]">
              v1.0
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Keyboard hint */}
            <div className="hidden md:flex items-center gap-1 text-[10px] font-mono text-[var(--muted-text)] bg-[var(--inset-bg)] border border-[var(--border-color)] px-2 py-1 rounded-md">
              <Command className="w-3 h-3" />
              <span>Ctrl+Z to Revert</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--inset-bg)] text-[var(--muted-text)] hover:text-[var(--text-color)] transition-all cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {result ? (
              <button
                onClick={resetAudit}
                disabled={isEvaluating}
                className="px-3.5 py-1.5 rounded-lg font-sans text-xs font-bold bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] active:scale-95 text-white flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Modify Code
              </button>
            ) : (
              <button
                onClick={startReview}
                disabled={isEvaluating}
                className="px-4 py-1.5 rounded-lg font-sans text-xs font-bold bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] active:scale-95 disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-text)] text-white flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isEvaluating ? "Auditing Code..." : "Run AI Audit"}
              </button>
            )}
          </div>
        </header>

        {/* Main Content Workspace Layout */}
        <main className="flex-grow flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 max-w-[1800px] w-full mx-auto lg:h-[calc(100vh-56px)] lg:overflow-hidden">
          
          {/* Left Column: Code Editor & Diff Viewer (48%) */}
          <section className="w-full lg:w-[48%] flex flex-col shrink-0 min-h-[520px] lg:min-h-0">
            {result && result.updated_code !== result.original_code ? (
              <div className="flex-1 flex flex-col h-full min-h-0">
                <CodeEditor 
                  code={result.updated_code} 
                  originalCode={result.original_code}
                  onChange={() => {}} 
                  diffMode={true} 
                  theme={theme}
                  onAcceptRefactor={handleAcceptRefactor}
                  onRevertCode={handleRevertCode}
                  canUndo={true}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full min-h-0">
                <CodeEditor 
                  code={code} 
                  onChange={(v) => updateCodeWithHistory(v || "")} 
                  readOnly={isEvaluating} 
                  theme={theme}
                  onRevertCode={handleUndo}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={historyIndex > 0}
                  canRedo={historyIndex < history.length - 1}
                />
              </div>
            )}
          </section>

          {/* Right Column: Orchestrator & Audit Reports (52%) */}
          <section className="w-full lg:w-[52%] flex flex-col gap-6 flex-grow lg:min-h-0 lg:overflow-y-auto">
            {/* Live Orchestrator Panel */}
            <div className="shrink-0">
              <AgentStatus 
                currentNode={statusNode} 
                message={statusMessage} 
                isComplete={!!result}
              />
            </div>

            {/* Subtle Divider */}
            <hr className="border-0 border-t border-[var(--border-color)] w-full" />

            {/* Audit Reports */}
            {result && (
              <div className="flex-grow min-h-0">
                <ReviewResults 
                  performance={result.performance_issues} 
                  security={result.security_vulnerabilities}
                  iterationCount={result.iteration_count}
                />
              </div>
            )}
          </section>

        </main>

        {/* Floating Notification Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-toast">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md ${
              toast.type === "success" 
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-200" 
                : toast.type === "warning"
                  ? "bg-amber-950/90 border-amber-500/30 text-amber-200"
                  : "bg-slate-900/90 border-slate-700 text-slate-200"
            }`}>
              {toast.type === "success" ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : toast.type === "warning" ? (
                <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              )}
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
