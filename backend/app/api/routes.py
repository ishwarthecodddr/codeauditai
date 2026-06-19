import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.agents.graph import review_graph

router = APIRouter()

@router.websocket("/ws/review")
async def websocket_review_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Wait for client to send payload
            data = await websocket.receive_text()
            payload = json.loads(data)
            source_code = payload.get("source_code", "")
            language = payload.get("language", "unknown")

            # Initialize LangGraph state
            state = {
                "original_code": source_code,
                "language": language,
                "current_code": source_code,
                "performance_issues": [],
                "security_vulnerabilities": [],
                "iteration_count": 0,
                "review_complete": False
            }

            # Send initial triage status
            await websocket.send_json({
                "type": "status",
                "node": "Triage",
                "message": "Initializing agent graph and parsing source code..."
            })

            # Stream graph updates
            async for event in review_graph.astream(state, stream_mode="updates"):
                # Accumulate state updates
                for node_name, updates in event.items():
                    state.update(updates)

                # Send WebSocket status frames matching active phase transitions
                if "triage" in event:
                    await websocket.send_json({
                        "type": "status",
                        "node": "Performance",
                        "message": f"Analyzing {state.get('language')} time/space complexity..."
                    })
                elif "performance" in event:
                    await websocket.send_json({
                        "type": "status",
                        "node": "Security",
                        "message": "Scanning for security vulnerabilities..."
                    })
                elif "security" in event:
                    await websocket.send_json({
                        "type": "status",
                        "node": "Lead Architect",
                        "message": "Lead Architect compiling audit reports and resolving issues..."
                    })
                elif "architect" in event:
                    if not state.get("review_complete", False) and state.get("iteration_count", 0) < 2:
                        await websocket.send_json({
                            "type": "status",
                            "node": "Performance",
                            "message": f"Re-auditing auto-fixed code (Iteration {state.get('iteration_count')} of 2)..."
                        })

            # Stream final compilation result to client
            await websocket.send_json({
                "type": "result",
                "original_code": state["original_code"],
                "updated_code": state["current_code"],
                "performance_issues": state["performance_issues"],
                "security_vulnerabilities": state["security_vulnerabilities"],
                "iteration_count": state["iteration_count"],
                "review_complete": True
            })

    except WebSocketDisconnect:
        print("WebSocket Client disconnected")
    except Exception as e:
        print(f"WebSocket Error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
