"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Sparkles, RotateCcw, ArrowRight } from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import AgentStatus from "@/components/AgentStatus";
import ReviewResults from "@/components/ReviewResults";
import { ReviewResult, WebSocketMessage } from "@/types";

export default function Dashboard() {
  const [code, setCode] = useState<string>(
    'def calculate_sum(n):\n    result = 0\n    for i in range(n):\n        for j in range(n):\n            result += i + j\n    return result\n'
  );
  const [ws, setWs] = useState<WebSocket | null>(null);
  
  // Theme state (dark default)
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light";
    if (savedTheme) {
      // The persisted preference is intentionally applied after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // State for streaming UI
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [statusNode, setStatusNode] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("Awaiting code submission...");
  
  // Final Results
  const [result, setResult] = useState<ReviewResult | null>(null);

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
        setResult(data as ReviewResult);
        setIsEvaluating(false);
        setStatusMessage("Audit complete.");
        socket.close();
      } else if (data.type === "error") {
        setStatusMessage(`Error: ${data.message || "Something went wrong"}`);
        setIsEvaluating(false);
      }
    };

    socket.onerror = () => {
      setStatusMessage("WebSocket connection failed. Verify FastAPI server is running on port 8000.");
      setIsEvaluating(false);
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
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex flex-col transition-colors duration-150 ease-in-out">
        
        {/* Top Navbar */}
        <nav className="flex justify-between items-center h-14 border-b border-[var(--border-color)] px-4 sm:px-6 lg:px-8 bg-[var(--panel-bg)] transition-colors duration-150 ease-in-out shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-sans text-xs font-extrabold uppercase tracking-widest text-[var(--text-color)]">
              CodeAudit AI
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-[var(--border-color)] bg-[var(--inset-bg)] text-[var(--muted-text)]">
              v1.0
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme switch button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md border border-[var(--border-color)] hover:bg-[var(--inset-bg)] text-[var(--muted-text)] hover:text-[var(--text-color)] transition-all duration-150 ease-in-out cursor-pointer"
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {result ? (
              <button
                onClick={resetAudit}
                disabled={isEvaluating}
                className="px-3 sm:px-4 py-2 rounded-md font-sans text-xs font-semibold bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] active:scale-[0.98] disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-text)] disabled:border disabled:border-[var(--border-color)] disabled:opacity-100 disabled:cursor-not-allowed text-white flex items-center gap-2 transition-all duration-150 ease-in-out shadow-none cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Modify Code
              </button>
            ) : (
              <button
                onClick={startReview}
                disabled={isEvaluating}
                className="px-3 sm:px-4 py-2 rounded-md font-sans text-xs font-semibold bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] active:scale-[0.98] disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-text)] disabled:border disabled:border-[var(--border-color)] disabled:opacity-100 disabled:cursor-not-allowed text-white flex items-center gap-2 transition-all duration-150 ease-in-out shadow-none cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                {isEvaluating ? "Auditing..." : "Run Audit"}
              </button>
            )}
          </div>
        </nav>

        {/* Main Content Layout */}
        <div className="flex-grow flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 max-w-[1800px] w-full mx-auto lg:h-[calc(100vh-56px)] lg:overflow-hidden">
          
          {/* Left Column: Editor & Diff Viewer (45%) */}
          <section className="w-full lg:w-[45%] flex flex-col shrink-0 min-h-[520px] lg:min-h-0">
            {result && result.updated_code !== result.original_code ? (
              <div className="flex-1 flex flex-col h-full">
                <div className="diff-column-header mb-2">
                  <div className="contents">
                    <span className="diff-column-title">
                      Original
                    </span>
                    <ArrowRight className="hidden" />
                    <span className="diff-column-title">
                      Refactored
                    </span>
                  </div>
                  <span className="hidden">PYTHON</span>
                </div>
                <div className="flex-grow min-h-0">
                  <CodeEditor 
                    code={result.updated_code} 
                    originalCode={result.original_code}
                    onChange={() => {}} 
                    diffMode={true} 
                    theme={theme}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full">
                <div className="flex items-center justify-between mb-2 px-1 min-h-8">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-[var(--muted-text)] uppercase bg-[var(--inset-bg)] border border-[var(--border-color)] px-2 py-0.5 rounded">
                    Source Editor
                  </span>
                  <span className="text-[10px] font-mono text-[var(--muted-text)]">PYTHON</span>
                </div>
                <div className="flex-grow min-h-0">
                  <CodeEditor 
                    code={code} 
                    onChange={(v) => setCode(v || "")} 
                    readOnly={isEvaluating} 
                    theme={theme}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Right Column: Orchestrator & Audit Reports (55%) */}
          <section className="w-full lg:w-[55%] flex flex-col gap-6 flex-grow lg:min-h-0 lg:overflow-y-auto">
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
              <div className="flex-grow">
                <ReviewResults 
                  performance={result.performance_issues} 
                  security={result.security_vulnerabilities}
                  iterationCount={result.iteration_count}
                />
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
