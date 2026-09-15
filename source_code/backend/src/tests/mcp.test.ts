import request from 'supertest';
import app from '../index';
import { connectDB, disconnectDB } from '../db';
import { seedDatabase } from '../seed';

describe('SupplyGuard AI — Model Context Protocol (MCP) & Copilot Suite', () => {
  let analystToken: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
    await seedDatabase();

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'analyst@supplyguard.io', password: 'Password123!' });

    analystToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('MCP Tools Introspection & Execution (10 Tools)', () => {
    it('GET /api/mcp/tools should list exactly 10 MCP tools with input schemas', async () => {
      const res = await request(app)
        .get('/api/mcp/tools')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(10);
      const toolNames = res.body.data.tools.map((t: any) => t.name);

      expect(toolNames).toContain('verify_disruption');
      expect(toolNames).toContain('find_affected_shipments');
      expect(toolNames).toContain('calculate_shipment_risk');
      expect(toolNames).toContain('find_alternative_ports');
      expect(toolNames).toContain('evaluate_route');
      expect(toolNames).toContain('find_available_fleet');
      expect(toolNames).toContain('analyze_cold_chain');
      expect(toolNames).toContain('simulate_network_impact');
      expect(toolNames).toContain('compare_scenarios');
      expect(toolNames).toContain('generate_action_plan');

      // Verify schema structure
      res.body.data.tools.forEach((tool: any) => {
        expect(tool).toHaveProperty('description');
        expect(tool.inputSchema.type).toBe('object');
      });
    });

    it('Tool 1: verify_disruption returns high confidence verification', async () => {
      const res = await request(app)
        .post('/api/mcp/tools/verify_disruption/call')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ disruption_id: 'DIS-2026-BOM-001' });

      expect(res.status).toBe(200);
      expect(res.body.data.verification_status).toBe('verified');
      expect(res.body.data.confidence_score).toBeGreaterThanOrEqual(0.90);
    });

    it('Tool 2: find_affected_shipments locates affected cargo', async () => {
      const res = await request(app)
        .post('/api/mcp/tools/find_affected_shipments/call')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ disruption_id: 'DIS-2026-BOM-001', radius_km: 60 });

      expect(res.status).toBe(200);
      expect(res.body.data.total_affected_count).toBeGreaterThan(0);
      expect(res.body.data.reefer_cargo_count).toBeGreaterThan(0);
    });

    it('Tool 3: calculate_shipment_risk computes composite score for pharma hero shipment', async () => {
      const res = await request(app)
        .post('/api/mcp/tools/calculate_shipment_risk/call')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ shipment_id: 'SHP-PHARMA-1001' });

      expect(res.status).toBe(200);
      expect(res.body.data.risk_score).toBeGreaterThanOrEqual(75);
      expect(res.body.data.risk_level).toBe('critical');
    });

    it('Tool 4: find_alternative_ports ranks suitable diversion ports', async () => {
      const res = await request(app)
        .post('/api/mcp/tools/find_alternative_ports/call')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ origin_port_id: 'INBOM', cargo_type: 'pharmaceuticals', requires_refrigeration: true });

      expect(res.status).toBe(200);
      expect(res.body.data.candidate_ports.length).toBeGreaterThan(0);
      expect(res.body.data.candidate_ports[0].port_id).toBe('INNSA');
    });

    it('Tool 5: evaluate_route checks corridor hazard', async () => {
      const res = await request(app)
        .post('/api/mcp/tools/evaluate_route/call')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ route_id: 'RTE-SIN-BOM-SEA' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('blocked');
    });

    it('Tool 6: find_available_fleet finds nearby reefer trucks', async () => {
      const res = await request(app)
        .post('/api/mcp/tools/find_available_fleet/call')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          location: { lat: 18.95, lng: 72.95 },
          requires_refrigeration: true,
          max_radius_km: 150,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.matched_assets_count).toBeGreaterThan(0);
      expect(res.body.data.assets[0].refrigeration_capable).toBe(true);
    });

    it('Tool 7: analyze_cold_chain detects temperature rise velocity', async () => {
      const res = await request(app)
        .post('/api/mcp/tools/analyze_cold_chain/call')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ container_id: 'CONT-REEFER-9042' });

      expect(res.status).toBe(200);
      expect(res.body.data.container_id).toBe('CONT-REEFER-9042');
      expect(res.body.data.current_temperature).toBeGreaterThanOrEqual(7.0);
    });

    it('Tool 8: simulate_network_impact models 72-hour financial exposure', async () => {
      const res = await request(app)
        .post('/api/mcp/tools/simulate_network_impact/call')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ disruption_id: 'DIS-2026-BOM-001', horizon_hours: 72 });

      expect(res.status).toBe(200);
      expect(res.body.data.simulation_horizon_hours).toBe(72);
      expect(res.body.data.financial_impact.total_estimated_impact_usd).toBeGreaterThan(1000000);
    });

    it('Tool 9: compare_scenarios compares Plan A, B, and C', async () => {
      const res = await request(app)
        .post('/api/mcp/tools/compare_scenarios/call')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ disruption_id: 'DIS-2026-BOM-001', shipment_id: 'SHP-PHARMA-1001' });

      expect(res.status).toBe(200);
      expect(res.body.data.recommended_scenario_id).toBe('PLAN-A');
      expect(res.body.data.scenarios.length).toBe(3);
    });

    it('Tool 10: generate_action_plan produces sequenced steps and approval checkpoint', async () => {
      const res = await request(app)
        .post('/api/mcp/tools/generate_action_plan/call')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          disruption_id: 'DIS-2026-BOM-001',
          chosen_scenario_id: 'PLAN-A',
          shipment_id: 'SHP-PHARMA-1001',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.approval_required).toBe(true);
      expect(res.body.data.steps.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('MCP Resources Introspection & Reading (9 Resources)', () => {
    it('GET /api/mcp/resources should list 9 resource templates', async () => {
      const res = await request(app)
        .get('/api/mcp/resources')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(9);
    });

    it('Read Resource: port://INBOM/status', async () => {
      const res = await request(app)
        .get('/api/mcp/resources/read?uri=port://INBOM/status')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.port_id).toBe('INBOM');
      expect(res.body.data.status).toBe('disrupted');
    });

    it('Read Resource: shipments://at-risk', async () => {
      const res = await request(app)
        .get('/api/mcp/resources/read?uri=shipments://at-risk')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Read Resource: fleet://available', async () => {
      const res = await request(app)
        .get('/api/mcp/resources/read?uri=fleet://available')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Autonomous AI Copilot Orchestrator (POST /api/copilot/query)', () => {
    it('Natural language query should execute MCP tool sequence and return recommendation with approval gating', async () => {
      const res = await request(app)
        .post('/api/copilot/query')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          query: 'Mumbai Port dockworkers strike reported. What is the impact on critical shipments and what should we do?',
          disruption_id: 'DIS-2026-BOM-001',
          shipment_id: 'SHP-PHARMA-1001',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.answer).toBeDefined();
      expect(res.body.data.answer).toContain('Mumbai Port Strike');
      expect(res.body.data.confidence_score).toBeGreaterThanOrEqual(0.90);
      expect(res.body.data.mcp_tools_executed.length).toBeGreaterThanOrEqual(8);
      expect(res.body.data.approval_gating.status).toBe('PENDING_APPROVAL');
      expect(res.body.data.approval_gating.required_role).toBe('Logistics Manager');
    });
  });
});
