# Architecture

> Detailed architecture documentation will be generated after the backend is implemented, using IBM Bob's diagram capabilities for accuracy.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    React 18 + Vite Frontend                      │
│  Dashboard │ Live Map │ Disruptions │ Shipments │ Ports │ Copilot│
└─────────────────────────┬────────────────────────────────────────┘
                          │ REST API + WebSocket (Socket.IO)
┌─────────────────────────▼────────────────────────────────────────┐
│                 Node.js / Express Backend                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────────┐   │
│  │ Auth     │  │ REST API │  │ Copilot Orchestration        │   │
│  │ JWT/RBAC │  │ CRUD     │  │ Claude API + MCP Tool Calls  │   │
│  └──────────┘  └──────────┘  └──────────────┬───────────────┘   │
│                                              │                   │
│  ┌───────────────────────────────────────────▼───────────────┐   │
│  │            MCP Server (stdio + HTTP transport)            │   │
│  │  ┌──────────────────┐  ┌────────────────────────────┐    │   │
│  │  │ 9 Resources      │  │ 10 Tools                   │    │   │
│  │  │ (read-only       │  │ (compute / decide / act)   │    │   │
│  │  │  context)        │  │                            │    │   │
│  │  └──────────────────┘  └────────────┬───────────────┘    │   │
│  └─────────────────────────────────────┼────────────────────┘   │
└────────────────────────────────────────┼────────────────────────┘
                                         │ HTTP (internal)
┌────────────────────────────────────────▼────────────────────────┐
│              Python FastAPI Analytics Service                    │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐    │
│  │ Risk      │ │ Route    │ │ Fleet    │ │ Cold-Chain    │    │
│  │ Engine    │ │ Optimizer│ │ Optimizer│ │ Analyzer      │    │
│  └───────────┘ └──────────┘ └──────────┘ └───────────────┘    │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐    │
│  │ Simulation│ │ Scenario │ │ Evidence │ │ Disruption    │    │
│  │ Engine    │ │ Compare  │ │ Aggreg.  │ │ Engine        │    │
│  └───────────┘ └──────────┘ └──────────┘ └───────────────┘    │
└────────────────────────────────────────────────────────────────┘
          │                                    │
   ┌──────▼──────┐                    ┌────────▼────────┐
   │  MongoDB 7  │                    │    Redis 7      │
   │  (persist)  │                    │  (cache + rate) │
   └─────────────┘                    └─────────────────┘
```

## Data Flow

1. User interacts with React frontend
2. Frontend calls Express REST API (authenticated via JWT)
3. For AI queries, the Copilot endpoint calls Claude API with MCP tools
4. Claude decides which MCP tools to invoke
5. MCP tools call Python analytics endpoints
6. Python analytics queries MongoDB and returns structured results
7. Results flow back through MCP → Claude → Copilot → Frontend
8. All tool calls logged to audit_logs collection

## MCP Architecture

MCP serves as the **load-bearing integration layer**:
- **Resources** answer "what is happening?" (read-only context)
- **Tools** perform investigation, calculation, simulation, and recommendation

## Security Architecture

- JWT access tokens (15 min) + rotating refresh tokens (7 days)
- RBAC: logistics_manager, operations_analyst, admin, viewer
- Organization/tenant isolation on every query
- Human approval gate on major rerouting decisions
- Audit logging with correlation IDs
