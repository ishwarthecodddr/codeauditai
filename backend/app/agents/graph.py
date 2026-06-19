from langgraph.graph import StateGraph, START, END
from app.core.state import AgentState
from app.agents.triage import triage_node
from app.agents.performance import performance_node
from app.agents.security import security_node
from app.agents.orchestrator import orchestrator_node

def should_continue(state: AgentState) -> str:
    """
    Decides whether to perform another audit iteration (self-healing loop)
    or complete the graph execution.
    """
    if state.get("review_complete", False) or state.get("iteration_count", 0) >= 2:
        return END
    # If there are unresolved issues, route back to audit
    return "performance"

# Initialize state-based graph
workflow = StateGraph(AgentState)

# Add node functions
workflow.add_node("triage", triage_node)
workflow.add_node("performance", performance_node)
workflow.add_node("security", security_node)
workflow.add_node("architect", orchestrator_node)

# Connect standard sequences
workflow.add_edge(START, "triage")
workflow.add_edge("triage", "performance")
workflow.add_edge("performance", "security")
workflow.add_edge("security", "architect")

# Configure conditional iteration routing
workflow.add_conditional_edges(
    "architect",
    should_continue,
    {
        "performance": "performance",
        END: END
    }
)

# Compile the final graph
review_graph = workflow.compile()
