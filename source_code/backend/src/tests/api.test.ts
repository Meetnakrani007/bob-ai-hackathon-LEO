import request from 'supertest';
import app from '../index';
import { connectDB, disconnectDB } from '../db';
import { seedDatabase } from '../seed';

describe('SupplyGuard AI — REST API & Auth Suite', () => {
  let managerToken: string;
  let analystToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
    await seedDatabase();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('Health Endpoint (Public)', () => {
    it('GET /api/health should return 200 and ok status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('supplyguard-backend');
    });
  });

  describe('Authentication & Token Lifecycle (POST /api/auth/*)', () => {
    it('POST /api/auth/login with valid Manager credentials should return 200, JWT tokens, and user profile', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'manager@supplyguard.io', password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.role).toBe('Logistics Manager');
      expect(res.body.data.user.email).toBe('manager@supplyguard.io');

      managerToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('POST /api/auth/login with valid Analyst credentials should return 200', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'analyst@supplyguard.io', password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('Supply Chain Analyst');
      analystToken = res.body.data.accessToken;
    });

    it('POST /api/auth/login with invalid password should return 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'manager@supplyguard.io', password: 'WrongPassword!' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('POST /api/auth/login with invalid email format should return 422 Unprocessable Entity', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: 'short' });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.length).toBeGreaterThan(0);
    });

    it('POST /api/auth/refresh with valid refresh token should issue new access token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('GET /api/auth/me without token should return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/auth/me with valid Bearer token should return current user info', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('manager@supplyguard.io');
      expect(res.body.data.role).toBe('Logistics Manager');
    });
  });

  describe('Shipments API (GET /api/shipments)', () => {
    it('GET /api/shipments should return paginated list of shipments for authenticated user', async () => {
      const res = await request(app)
        .get('/api/shipments')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination.total).toBe(60);
      expect(res.body.data.length).toBeGreaterThanOrEqual(50);
    });

    it('GET /api/shipments?requires_refrigeration=true should filter cold-chain shipments', async () => {
      const res = await request(app)
        .get('/api/shipments?requires_refrigeration=true')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((s: any) => {
        expect(s.requires_refrigeration).toBe(true);
      });
    });

    it('GET /api/shipments/:id should return single shipment with temperature history and ports', async () => {
      const res = await request(app)
        .get('/api/shipments/SHP-PHARMA-1001')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.shipment_id).toBe('SHP-PHARMA-1001');
      expect(res.body.data.cargo_type).toBe('pharmaceuticals');
      expect(res.body.data.destination_port.port_id).toBe('INBOM');
      expect(res.body.data.temperature_history.length).toBeGreaterThan(0);
    });

    it('GET /api/shipments/:id/risk should return calculated risk score and factor decomposition', async () => {
      const res = await request(app)
        .get('/api/shipments/SHP-PHARMA-1001/risk')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.risk_score).toBeGreaterThanOrEqual(75);
      expect(res.body.data.factors.length).toBeGreaterThan(0);
      expect(res.body.data.active_disruptions.length).toBeGreaterThan(0);
    });
  });

  describe('Fleet API (GET /api/fleet/available)', () => {
    it('GET /api/fleet/available should list idle available fleet assets', async () => {
      const res = await request(app)
        .get('/api/fleet/available')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThan(0);
    });

    it('GET /api/fleet/available with geo coordinates should return assets sorted by proximity', async () => {
      const res = await request(app)
        .get('/api/fleet/available?requires_refrigeration=true&lat=18.95&lng=72.95&radius_km=150')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('distance_km');
      // Nearest asset should have smallest distance
      if (res.body.data.length > 1) {
        expect(res.body.data[0].distance_km).toBeLessThanOrEqual(res.body.data[1].distance_km);
      }
    });
  });

  describe('Ports & Disruptions API', () => {
    it('GET /api/ports should return all 7 seeded ports', async () => {
      const res = await request(app)
        .get('/api/ports')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(7);
    });

    it('GET /api/ports/INBOM/status should show Mumbai Port disrupted status and active strikes', async () => {
      const res = await request(app)
        .get('/api/ports/INBOM/status')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('disrupted');
      expect(res.body.data.active_disruptions.length).toBeGreaterThan(0);
    });

    it('GET /api/disruptions/active should return verified Mumbai Port strike with news evidence', async () => {
      const res = await request(app)
        .get('/api/disruptions/active')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      const strike = res.body.data.find((d: any) => d.disruption_id === 'DIS-2026-BOM-001');
      expect(strike).toBeDefined();
      expect(strike.verification_status).toBe('verified');
      expect(strike.evidence_items.length).toBeGreaterThan(0);
    });
  });

  describe('RBAC & Human Approval Workflow (POST /api/actions/:id/approve)', () => {
    it('Analyst attempting approval should return 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/actions/ACT-REROUTE-001/approve')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          action_type: 'REROUTE_SHIPMENT',
          target_id: 'SHP-PHARMA-1001',
          target_type: 'shipment',
          new_route_id: 'RTE-SIN-NSA-SEA',
          reason: 'Analyst attempting to execute reroute unauthorized',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('Manager approval with invalid payload should return 422 Unprocessable Entity', async () => {
      const res = await request(app)
        .post('/api/actions/ACT-REROUTE-001/approve')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          // Missing required action_type and reason
          target_id: 'SHP-PHARMA-1001',
        });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('Logistics Manager approval with valid payload should return 200, execute reroute, and create AuditLog', async () => {
      const res = await request(app)
        .post('/api/actions/ACT-REROUTE-001/approve')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          action_type: 'REROUTE_SHIPMENT',
          target_id: 'SHP-PHARMA-1001',
          target_type: 'shipment',
          new_route_id: 'RTE-SIN-NSA-SEA',
          assigned_vehicle_id: 'TRK-REEFER-01',
          reason: 'Urgent diversion to Nhava Sheva (JNPT) and refrigerated truck dispatch to preserve insulin cold-chain amid Mumbai Port strike.',
          confidence_score: 0.94,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.approval_status).toBe('approved');
      expect(res.body.data.audit_log).toBeDefined();
      expect(res.body.data.audit_log.action).toBe('REROUTE_APPROVED');
      expect(res.body.data.audit_log.actor.role).toBe('Logistics Manager');

      // Verify shipment was actually updated in DB
      const shipmentCheck = await request(app)
        .get('/api/shipments/SHP-PHARMA-1001')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(shipmentCheck.body.data.status).toBe('rerouted');
      expect(shipmentCheck.body.data.current_route_id).toBe('RTE-SIN-NSA-SEA');
      expect(shipmentCheck.body.data.destination_port.port_id).toBe('INNSA');
    });

    it('Auditor can query audit trail via GET /api/audit-logs', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      const approvalLog = res.body.data.find((l: any) => l.action === 'REROUTE_APPROVED');
      expect(approvalLog).toBeDefined();
      expect(approvalLog.reason).toContain('Urgent diversion to Nhava Sheva');
    });
  });
});
