import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

@router.websocket("/ws/review")
async def websocket_review_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Wait for the frontend to send the code payload
            data = await websocket.receive_text()
            payload = json.loads(data)
            source_code = payload.get("source_code", "")
            language = payload.get("language", "unknown")

            # MOCK STREAMING RESPONSE (To test UI before LangGraph integration)
            
            # 1. Triage Phase
            await websocket.send_json({
                "type": "status",
                "node": "Triage",
                "message": f"Analyzing {language} code..."
            })
            await asyncio.sleep(1)
            
            # 2. Performance Phase
            await websocket.send_json({
                "type": "status",
                "node": "Performance",
                "message": "Evaluating time/space complexity..."
            })
            await asyncio.sleep(1.5)
            
            # 3. Security Phase
            await websocket.send_json({
                "type": "status",
                "node": "Security",
                "message": "Scanning for vulnerabilities..."
            })
            await asyncio.sleep(1.5)
            
            # 4. Lead Architect Phase
            await websocket.send_json({
                "type": "status",
                "node": "Lead Architect",
                "message": "Compiling reports and verifying auto-fixes..."
            })
            await asyncio.sleep(1)

            # Final Result payload matching your required state structure
            await websocket.send_json({
                "type": "result",
                "original_code": source_code,
                "updated_code": source_code + "\n\n# Optimized & Secured by Lead Architect",
                "performance_issues": [
                    {"issue": "O(N^2) loop detected, risk of TLE", "severity": "high"}
                ],
                "security_vulnerabilities": [
                    {"issue": "Unsanitized user input", "severity": "medium"}
                ],
                "iteration_count": 1,
                "review_complete": True
            })

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})
