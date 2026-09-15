import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB, disconnectDB } from './db';
import {
  User,
  Organization,
  Port,
  Shipment,
  Fleet,
  Route,
  Carrier,
  Disruption,
  NewsEvent,
  TemperatureLog,
  PortEvent,
  AuditLog,
  Notification,
} from './models';

// Load environment variables
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export async function seedDatabase(): Promise<void> {
  console.log('🌱 Starting SupplyGuard AI synthetic database seeding...');
  await connectDB();

  // 1. Clear existing collections for idempotency
  console.log('🧹 Purging existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Organization.deleteMany({}),
    Port.deleteMany({}),
    Shipment.deleteMany({}),
    Fleet.deleteMany({}),
    Route.deleteMany({}),
    Carrier.deleteMany({}),
    Disruption.deleteMany({}),
    NewsEvent.deleteMany({}),
    TemperatureLog.deleteMany({}),
    PortEvent.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  // 2. Organization
  console.log('🏢 Seeding Organization...');
  const org = await Organization.create({
    organization_id: 'ORG-GLC-001',
    name: 'Global Logistics Operations Corp (Demo Tenant)',
    tier: 'enterprise',
    tenant_settings: {
      risk_threshold_alert: 70,
      auto_reroute_enabled: false,
      default_currency: 'USD',
      timezone: 'Asia/Kolkata',
    },
  });

  // 3. Users with pre-hashed passwords (Password123!)
  console.log('👥 Seeding Users...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  await User.insertMany([
    {
      user_id: 'USR-ADMIN-01',
      organization_id: org.organization_id,
      email: 'admin@supplyguard.io',
      name: 'Capt. Vikramaditya Singhania (Director General & Admin)',
      role: 'Admin',
      permissions: ['*'],
      password_hash: passwordHash,
      active: true,
    },
    {
      user_id: 'USR-MGR-01',
      organization_id: org.organization_id,
      email: 'manager@supplyguard.io',
      name: 'Rajesh Nair (Logistics Director)',
      role: 'Logistics Manager',
      permissions: ['shipments:read', 'shipments:write', 'actions:approve', 'copilot:use', 'fleet:dispatch'],
      password_hash: passwordHash,
      active: true,
    },
    {
      user_id: 'USR-ANALYST-01',
      organization_id: org.organization_id,
      email: 'analyst@supplyguard.io',
      name: 'Priya Patel (Supply Chain Analyst)',
      role: 'Supply Chain Analyst',
      permissions: ['shipments:read', 'copilot:use', 'analytics:view', 'disruptions:view'],
      password_hash: passwordHash,
      active: true,
    },
    {
      user_id: 'USR-AUDITOR-01',
      organization_id: org.organization_id,
      email: 'auditor@supplyguard.io',
      name: 'Vikram Mehta (Compliance Auditor)',
      role: 'Auditor',
      permissions: ['audit:read', 'reports:export', 'shipments:read'],
      password_hash: passwordHash,
      active: true,
    },
    {
      user_id: 'USR-NORMAL-01',
      organization_id: org.organization_id,
      email: 'user@supplyguard.io',
      name: 'Kavita Rao (Guest Viewer)',
      role: 'Normal User',
      permissions: ['shipments:read', 'view:read_only'],
      password_hash: passwordHash,
      active: true,
    },
  ]);

  // 4. Ports (7 major hubs with coordinates)
  console.log('⚓ Seeding Ports...');
  await Port.insertMany([
    {
      port_id: 'INBOM',
      name: 'Mumbai Port Trust',
      code: 'BOM',
      country: 'India',
      location: { lat: 18.9438, lng: 72.855 },
      capacity_teu: 1800000,
      current_congestion_pct: 94,
      status: 'disrupted',
      average_dwell_time_hours: 84,
      berths_total: 12,
      berths_occupied: 11,
      cold_storage_available: true,
      facilities: ['Container Terminal', 'Reefer Yard', 'Bulk Cargo', 'Customs Bonded Area'],
    },
    {
      port_id: 'INNSA',
      name: 'Nhava Sheva (Jawaharlal Nehru Port - JNPT)',
      code: 'NSA',
      country: 'India',
      location: { lat: 18.95, lng: 72.95 },
      capacity_teu: 5100000,
      current_congestion_pct: 62,
      status: 'congested',
      average_dwell_time_hours: 32,
      berths_total: 16,
      berths_occupied: 11,
      cold_storage_available: true,
      facilities: ['Deepwater Terminal', 'Reefer Plugs (2000+)', 'Dedicated Freight Corridor Direct Rail', 'CFS Yards'],
    },
    {
      port_id: 'INMUN',
      name: 'Mundra Port (Adani)',
      code: 'MUN',
      country: 'India',
      location: { lat: 22.7441, lng: 69.7061 },
      capacity_teu: 6600000,
      current_congestion_pct: 28,
      status: 'normal',
      average_dwell_time_hours: 18,
      berths_total: 24,
      berths_occupied: 8,
      cold_storage_available: true,
      facilities: ['Ultra Mega Container Terminal', 'Automated Rail Evacuation', 'Pharma Reefer Super-hub'],
    },
    {
      port_id: 'INMAA',
      name: 'Chennai Port',
      code: 'MAA',
      country: 'India',
      location: { lat: 13.0827, lng: 80.2707 },
      capacity_teu: 2000000,
      current_congestion_pct: 35,
      status: 'normal',
      average_dwell_time_hours: 26,
      berths_total: 14,
      berths_occupied: 5,
      cold_storage_available: true,
      facilities: ['Automotive Ro-Ro Terminal', 'Container Terminal 1 & 2', 'Reefer Infrastructure'],
    },
    {
      port_id: 'LKCMB',
      name: 'Port of Colombo',
      code: 'CMB',
      country: 'Sri Lanka',
      location: { lat: 6.9497, lng: 79.8428 },
      capacity_teu: 7200000,
      current_congestion_pct: 42,
      status: 'normal',
      average_dwell_time_hours: 20,
      berths_total: 20,
      berths_occupied: 9,
      cold_storage_available: true,
      facilities: ['South Asia Transshipment Hub', 'CICT Deepwater', 'SAGT Terminal'],
    },
    {
      port_id: 'SGSIN',
      name: 'Port of Singapore',
      code: 'SIN',
      country: 'Singapore',
      location: { lat: 1.2644, lng: 103.84 },
      capacity_teu: 37000000,
      current_congestion_pct: 55,
      status: 'normal',
      average_dwell_time_hours: 14,
      berths_total: 67,
      berths_occupied: 38,
      cold_storage_available: true,
      facilities: ['Tuas Mega Port', 'PSA Automated Terminals', 'Global Bunkering Hub'],
    },
    {
      port_id: 'AEJEA',
      name: 'Jebel Ali Port (DP World)',
      code: 'JEA',
      country: 'United Arab Emirates',
      location: { lat: 25.0069, lng: 55.06 },
      capacity_teu: 19300000,
      current_congestion_pct: 38,
      status: 'normal',
      average_dwell_time_hours: 16,
      berths_total: 45,
      berths_occupied: 18,
      cold_storage_available: true,
      facilities: ['DP World Flagship Hub', 'Reefer Cold Chain Center', 'Sea-Air Intermodal Bridge'],
    },
  ]);

  // 5. Carriers
  console.log('🚢 Seeding Carriers...');
  await Carrier.insertMany([
    {
      carrier_id: 'CAR-MAERSK',
      name: 'Maersk Line A/S',
      contact_email: 'ops@maersk.com',
      contact_phone: '+45 33 63 33 63',
      modes_supported: ['sea', 'rail', 'road'],
      fleet_size: 730,
      reliability_score: 0.94,
      on_time_rate_pct: 91,
      active_contracts: 18,
      primary_regions: ['Indian Subcontinent', 'Southeast Asia', 'Middle East', 'Europe'],
    },
    {
      carrier_id: 'CAR-MSC',
      name: 'Mediterranean Shipping Company (MSC)',
      contact_email: 'dispatch@msc.com',
      contact_phone: '+41 22 703 8888',
      modes_supported: ['sea', 'rail'],
      fleet_size: 820,
      reliability_score: 0.91,
      on_time_rate_pct: 88,
      active_contracts: 22,
      primary_regions: ['Global', 'Arabian Sea', 'Bay of Bengal'],
    },
    {
      carrier_id: 'CAR-CONCOR',
      name: 'Container Corporation of India (CONCOR)',
      contact_email: 'operations@concorindia.com',
      contact_phone: '+91 11 4167 3093',
      modes_supported: ['rail', 'road'],
      fleet_size: 350,
      reliability_score: 0.95,
      on_time_rate_pct: 94,
      active_contracts: 12,
      primary_regions: ['Western DFC', 'Northern India Hinterland', 'JNPT Rail Corridor'],
    },
    {
      carrier_id: 'CAR-VRL',
      name: 'VRL Logistics Express Fleet',
      contact_email: 'commercial@vrlgroup.in',
      contact_phone: '+91 836 223 7511',
      modes_supported: ['road'],
      fleet_size: 4800,
      reliability_score: 0.92,
      on_time_rate_pct: 93,
      active_contracts: 15,
      primary_regions: ['Maharashtra', 'Gujarat', 'South India', 'Golden Quadrilateral'],
    },
    {
      carrier_id: 'CAR-BLUEDART',
      name: 'Blue Dart Cold Chain Express',
      contact_email: 'coldchain@bluedart.com',
      contact_phone: '+91 22 2839 6444',
      modes_supported: ['road', 'air'],
      fleet_size: 650,
      reliability_score: 0.98,
      on_time_rate_pct: 97,
      active_contracts: 28,
      primary_regions: ['India Pan-National Reefer Network', 'Pharma Corridors'],
    },
  ]);

  // 6. Routes (Maritime and Inland Multi-modal corridors)
  console.log('🛣️ Seeding Routes...');
  await Route.insertMany([
    {
      route_id: 'RTE-SIN-BOM-SEA',
      name: 'Singapore to Mumbai Sea Lane (Direct)',
      origin_port_id: 'SGSIN',
      destination_port_id: 'INBOM',
      mode: 'sea',
      distance_km: 3920,
      estimated_time_hours: 120,
      base_cost_usd: 1850,
      risk_score: 92, // High risk due to Mumbai strike
      status: 'blocked',
      waypoints: [
        { lat: 1.2644, lng: 103.84, name: 'Singapore Strait Departure', order: 1 },
        { lat: 5.75, lng: 95.2, name: 'Malacca North Waypoint', order: 2 },
        { lat: 6.9497, lng: 79.8428, name: 'Sri Lanka Offing', order: 3 },
        { lat: 18.9438, lng: 72.855, name: 'Mumbai Port Pilot Station', order: 4 },
      ],
      passes_through_ports: ['SGSIN', 'INBOM'],
    },
    {
      route_id: 'RTE-SIN-NSA-SEA',
      name: 'Singapore to Nhava Sheva (JNPT) Alternative Sea Lane',
      origin_port_id: 'SGSIN',
      destination_port_id: 'INNSA',
      mode: 'sea',
      distance_km: 3915,
      estimated_time_hours: 122,
      base_cost_usd: 1900,
      risk_score: 35,
      status: 'active',
      waypoints: [
        { lat: 1.2644, lng: 103.84, name: 'Singapore Strait Departure', order: 1 },
        { lat: 5.75, lng: 95.2, name: 'Malacca North', order: 2 },
        { lat: 6.9497, lng: 79.8428, name: 'Sri Lanka Offing', order: 3 },
        { lat: 18.95, lng: 72.95, name: 'JNPT Approach Channel', order: 4 },
      ],
      passes_through_ports: ['SGSIN', 'INNSA'],
    },
    {
      route_id: 'RTE-SIN-MUN-SEA',
      name: 'Singapore to Mundra Deepwater Express',
      origin_port_id: 'SGSIN',
      destination_port_id: 'INMUN',
      mode: 'sea',
      distance_km: 4350,
      estimated_time_hours: 138,
      base_cost_usd: 2100,
      risk_score: 18,
      status: 'active',
      waypoints: [
        { lat: 1.2644, lng: 103.84, name: 'Singapore Strait Departure', order: 1 },
        { lat: 6.9497, lng: 79.8428, name: 'Sri Lanka Offing', order: 2 },
        { lat: 18.5, lng: 71.0, name: 'Arabian Sea Offshore', order: 3 },
        { lat: 22.7441, lng: 69.7061, name: 'Gulf of Kutch Approach', order: 4 },
      ],
      passes_through_ports: ['SGSIN', 'INMUN'],
    },
    {
      route_id: 'RTE-NSA-BOM-ROAD',
      name: 'Nhava Sheva to Mumbai Inland Bypass Corridor',
      origin_port_id: 'INNSA',
      destination_port_id: 'INBOM',
      mode: 'road',
      distance_km: 48,
      estimated_time_hours: 3.5,
      base_cost_usd: 220,
      risk_score: 25,
      status: 'active',
      waypoints: [
        { lat: 18.95, lng: 72.95, name: 'JNPT Gate 1', order: 1 },
        { lat: 18.98, lng: 72.98, name: 'Atal Setu (MTHL Bridge)', order: 2 },
        { lat: 18.9438, lng: 72.855, name: 'Mumbai City Logistics Center', order: 3 },
      ],
      passes_through_ports: ['INNSA', 'INBOM'],
    },
    {
      route_id: 'RTE-MUN-BOM-RAIL',
      name: 'Mundra to Mumbai DFC Rail Link',
      origin_port_id: 'INMUN',
      destination_port_id: 'INBOM',
      mode: 'rail',
      distance_km: 860,
      estimated_time_hours: 22,
      base_cost_usd: 680,
      risk_score: 15,
      status: 'active',
      waypoints: [
        { lat: 22.7441, lng: 69.7061, name: 'Mundra Rail Freight Terminal', order: 1 },
        { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad DFC Junction', order: 2 },
        { lat: 21.1702, lng: 72.8311, name: 'Surat Cargo Yard', order: 3 },
        { lat: 18.95, lng: 72.95, name: 'Navi Mumbai Rail Hub', order: 4 },
      ],
      passes_through_ports: ['INMUN', 'INNSA'],
    },
    {
      route_id: 'RTE-JEA-BOM-SEA',
      name: 'Jebel Ali to Mumbai Arabian Sea Route',
      origin_port_id: 'AEJEA',
      destination_port_id: 'INBOM',
      mode: 'sea',
      distance_km: 2100,
      estimated_time_hours: 68,
      base_cost_usd: 1250,
      risk_score: 88,
      status: 'blocked',
      waypoints: [
        { lat: 25.0069, lng: 55.06, name: 'Jebel Ali Departure', order: 1 },
        { lat: 25.5, lng: 56.5, name: 'Strait of Hormuz Exit', order: 2 },
        { lat: 20.5, lng: 66.0, name: 'Arabian Sea Central', order: 3 },
        { lat: 18.9438, lng: 72.855, name: 'Mumbai Approach', order: 4 },
      ],
      passes_through_ports: ['AEJEA', 'INBOM'],
    },
    {
      route_id: 'RTE-JEA-MUN-SEA',
      name: 'Jebel Ali to Mundra Direct Tanker/Container Lane',
      origin_port_id: 'AEJEA',
      destination_port_id: 'INMUN',
      mode: 'sea',
      distance_km: 1820,
      estimated_time_hours: 56,
      base_cost_usd: 1100,
      risk_score: 12,
      status: 'active',
      waypoints: [
        { lat: 25.0069, lng: 55.06, name: 'Jebel Ali Departure', order: 1 },
        { lat: 24.5, lng: 58.0, name: 'Gulf of Oman', order: 2 },
        { lat: 22.7441, lng: 69.7061, name: 'Mundra Berth', order: 3 },
      ],
      passes_through_ports: ['AEJEA', 'INMUN'],
    },
    {
      route_id: 'RTE-CMB-MAA-SEA',
      name: 'Colombo to Chennai Feeder Shuttle',
      origin_port_id: 'LKCMB',
      destination_port_id: 'INMAA',
      mode: 'sea',
      distance_km: 780,
      estimated_time_hours: 28,
      base_cost_usd: 480,
      risk_score: 10,
      status: 'active',
      waypoints: [
        { lat: 6.9497, lng: 79.8428, name: 'Colombo Harbor Out', order: 1 },
        { lat: 9.0, lng: 80.5, name: 'Palk Strait Bypass', order: 2 },
        { lat: 13.0827, lng: 80.2707, name: 'Chennai Container Pier', order: 3 },
      ],
      passes_through_ports: ['LKCMB', 'INMAA'],
    },
  ]);

  // 7. Disruptions
  console.log('⚠️ Seeding Disruptions...');
  const strikeStart = new Date(Date.now() - 14 * 3600 * 1000); // 14 hours ago
  const strikeEndEst = new Date(Date.now() + 58 * 3600 * 1000); // in ~2.5 days

  const mainDisruption = await Disruption.create({
    disruption_id: 'DIS-2026-BOM-001',
    title: 'Mumbai Port Unannounced Dockworkers & Crane Operators Strike',
    description:
      'Sudden wildcat strike called by the Mumbai Port Labor Federation over crane automation and overtime disputes. All berths 1 through 10 are non-operational. Over 18 container vessels currently queued in outer anchorage with tug operations suspended.',
    type: 'strike',
    severity: 'critical',
    affected_ports: ['INBOM'],
    affected_routes: ['RTE-SIN-BOM-SEA', 'RTE-JEA-BOM-SEA'],
    location: {
      lat: 18.9438,
      lng: 72.855,
      name: 'Mumbai Port Trust Terminals & Anchorage',
    },
    radius_km: 60,
    started_at: strikeStart,
    estimated_end: strikeEndEst,
    status: 'active',
    verification_status: 'verified',
    confidence_score: 0.94,
    evidence_summary:
      'Corroborated by Port Authority Notice #BOM-2026-04, Reuters Maritime News bulletin, and AIS live vessel telemetry indicating 0 vessel movements and 16 moored container ships anchored outside.',
    evidence_count: 4,
    impact_estimate_usd: 14500000,
  });

  await Disruption.create({
    disruption_id: 'DIS-2026-RED-002',
    title: 'Southern Red Sea Maritime Security Advisory',
    description:
      'Heightened security advisory in Bab-el-Mandeb Strait prompting commercial container liners to reroute via Cape of Good Hope, adding 10-14 days to Europe-Asia voyages.',
    type: 'geopolitical',
    severity: 'high',
    affected_ports: ['AEJEA'],
    affected_routes: [],
    location: {
      lat: 12.585,
      lng: 43.33,
      name: 'Bab-el-Mandeb Strait',
    },
    radius_km: 150,
    started_at: new Date(Date.now() - 72 * 3600 * 1000),
    status: 'active',
    verification_status: 'verified',
    confidence_score: 0.98,
    evidence_summary: 'UKMTO Advisory notice and global shipping circulars from Maersk, Hapag-Lloyd, and CMA CGM.',
    evidence_count: 6,
    impact_estimate_usd: 85000000,
  });

  // 8. News Events (corroborating evidence)
  console.log('📰 Seeding News Events...');
  await NewsEvent.insertMany([
    {
      event_id: 'NEWS-BOM-001',
      source: 'port_authority',
      raw_text:
        'CIRCULAR NOTICE: Mumbai Port Trust operations suspended effective 06:00 IST due to sudden union demonstration by crane operators. Inbound container traffic advised to seek emergency diversion.',
      normalized_event: {
        title: 'Mumbai Port Trust Labor Cessation Advisory',
        port_id: 'INBOM',
        disruption_type: 'strike',
        severity: 'critical',
        action_suggested: 'Reroute to Nhava Sheva (JNPT) or Mundra immediately',
      },
      credibility_score: 0.99,
      timestamp: strikeStart,
      verification_status: 'verified',
      matched_disruption_id: mainDisruption.disruption_id,
    },
    {
      event_id: 'NEWS-BOM-002',
      source: 'reuters',
      raw_text:
        'MUMBAI, March 14 (Reuters) - Operations at Mumbai Port ground to a halt on Saturday as over 2,200 terminal staff walked out in protest against contractual restructuring. Over a dozen vessels await clearance.',
      normalized_event: {
        title: 'Over 2,200 Workers Walk Out at Mumbai Port Trust',
        port_id: 'INBOM',
        disruption_type: 'strike',
        severity: 'critical',
        action_suggested: 'Container lines diverting cargo to JNPT and Mundra',
      },
      credibility_score: 0.95,
      timestamp: new Date(strikeStart.getTime() + 2 * 3600 * 1000),
      verification_status: 'verified',
      matched_disruption_id: mainDisruption.disruption_id,
    },
    {
      event_id: 'NEWS-BOM-003',
      source: 'ais_feed',
      raw_text:
        'AUTOMATED AIS ANOMALY DETECTED: Velocity drops below 0.5 knots for 14 commercial container vessels approaching Mumbai Port coordinates. Average waiting anchor queue extended to 34 hours.',
      normalized_event: {
        title: 'AIS Vessel Stoppage Cluster in Mumbai Anchorage',
        port_id: 'INBOM',
        disruption_type: 'congestion',
        severity: 'high',
        action_suggested: 'Evaluate berth availability at JNPT',
      },
      credibility_score: 0.98,
      timestamp: new Date(strikeStart.getTime() + 4 * 3600 * 1000),
      verification_status: 'verified',
      matched_disruption_id: mainDisruption.disruption_id,
    },
    {
      event_id: 'NEWS-BOM-004',
      source: 'maritime_bulletin',
      raw_text:
        'Indian Ministry of Ports & Shipping in emergency talks with labor federation; mediation anticipated within 48-72 hours but backlog recovery expected to take 6 days.',
      normalized_event: {
        title: 'Mediation Underway for Mumbai Port Disruption',
        port_id: 'INBOM',
        disruption_type: 'strike',
        severity: 'medium',
        action_suggested: 'Reefer and time-sensitive cargo priority reroute',
      },
      credibility_score: 0.9,
      timestamp: new Date(Date.now() - 3 * 3600 * 1000),
      verification_status: 'verified',
      matched_disruption_id: mainDisruption.disruption_id,
    },
  ]);

  // 9. Fleet Assets (25 assets including specialized refrigerated trucks & coastal feeders)
  console.log('🚛 Seeding Fleet Assets...');
  const fleetData = [
    // Specialized Reefer Trucks situated near Nhava Sheva & Mumbai corridor ready for dispatch
    {
      vehicle_id: 'TRK-REEFER-01',
      name: 'ThermoKing Arctic Express #01',
      asset_type: 'refrigerated_truck',
      carrier_id: 'CAR-BLUEDART',
      carrier_name: 'Blue Dart Cold Chain Express',
      location: { lat: 18.96, lng: 72.965, city: 'Nhava Sheva Logistic Park' },
      capacity_teu: 2,
      max_weight_tons: 22,
      status: 'idle',
      availability: true,
      refrigeration_capable: true,
      current_temp: 4.0,
      hourly_cost_usd: 85,
      speed_kmh: 65,
      fuel_range_km: 750,
    },
    {
      vehicle_id: 'TRK-REEFER-02',
      name: 'ThermoKing Arctic Express #02',
      asset_type: 'refrigerated_truck',
      carrier_id: 'CAR-BLUEDART',
      carrier_name: 'Blue Dart Cold Chain Express',
      location: { lat: 18.948, lng: 72.938, city: 'JNPT CFS Area' },
      capacity_teu: 2,
      max_weight_tons: 24,
      status: 'idle',
      availability: true,
      refrigeration_capable: true,
      current_temp: 3.8,
      hourly_cost_usd: 85,
      speed_kmh: 65,
      fuel_range_km: 750,
    },
    {
      vehicle_id: 'TRK-REEFER-03',
      name: 'Carrier Transicold SuperHauler #03',
      asset_type: 'refrigerated_truck',
      carrier_id: 'CAR-VRL',
      carrier_name: 'VRL Logistics Express Fleet',
      location: { lat: 18.6298, lng: 73.7997, city: 'Pune Pimpri Industrial Hub' },
      capacity_teu: 2,
      max_weight_tons: 20,
      status: 'idle',
      availability: true,
      refrigeration_capable: true,
      current_temp: 4.2,
      hourly_cost_usd: 78,
      speed_kmh: 70,
      fuel_range_km: 900,
    },
    {
      vehicle_id: 'TRK-REEFER-04',
      name: 'ThermoKing ColdMaster #04',
      asset_type: 'refrigerated_truck',
      carrier_id: 'CAR-BLUEDART',
      carrier_name: 'Blue Dart Cold Chain Express',
      location: { lat: 19.2183, lng: 72.9781, city: 'Thane Warehousing Hub' },
      capacity_teu: 2,
      max_weight_tons: 22,
      status: 'idle',
      availability: true,
      refrigeration_capable: true,
      current_temp: 4.1,
      hourly_cost_usd: 85,
      speed_kmh: 65,
      fuel_range_km: 750,
    },
    {
      vehicle_id: 'TRK-REEFER-05',
      name: 'Gujarat Agro Reefer #05',
      asset_type: 'refrigerated_truck',
      carrier_id: 'CAR-VRL',
      carrier_name: 'VRL Logistics Express Fleet',
      location: { lat: 22.7441, lng: 69.7061, city: 'Mundra Port Gate' },
      capacity_teu: 2,
      max_weight_tons: 25,
      status: 'idle',
      availability: true,
      refrigeration_capable: true,
      current_temp: 3.5,
      hourly_cost_usd: 75,
      speed_kmh: 70,
      fuel_range_km: 850,
    },
    {
      vehicle_id: 'TRK-REEFER-06',
      name: 'Carrier Transicold Reefer #06',
      asset_type: 'refrigerated_truck',
      carrier_id: 'CAR-BLUEDART',
      carrier_name: 'Blue Dart Cold Chain Express',
      location: { lat: 21.1702, lng: 72.8311, city: 'Surat Cargo Terminal' },
      capacity_teu: 2,
      max_weight_tons: 22,
      status: 'idle',
      availability: true,
      refrigeration_capable: true,
      current_temp: 4.5,
      hourly_cost_usd: 80,
      speed_kmh: 68,
      fuel_range_km: 800,
    },
    // Coastal Feeder Vessels
    {
      vehicle_id: 'VES-COASTAL-01',
      name: 'MV Shreyas Reliance (Coastal Feeder)',
      asset_type: 'feeder_vessel',
      carrier_id: 'CAR-MSC',
      carrier_name: 'Mediterranean Shipping Company (MSC)',
      location: { lat: 18.93, lng: 72.82, city: 'Off Mumbai Coastal Anchorage' },
      capacity_teu: 1450,
      max_weight_tons: 18000,
      status: 'idle',
      availability: true,
      refrigeration_capable: true,
      hourly_cost_usd: 1200,
      speed_kmh: 32,
      fuel_range_km: 3500,
    },
    {
      vehicle_id: 'VES-COASTAL-02',
      name: 'MV Gujarat Pioneer (Shuttle)',
      asset_type: 'feeder_vessel',
      carrier_id: 'CAR-MAERSK',
      carrier_name: 'Maersk Line A/S',
      location: { lat: 22.7, lng: 69.65, city: 'Mundra Anchorage' },
      capacity_teu: 1100,
      max_weight_tons: 14000,
      status: 'idle',
      availability: true,
      refrigeration_capable: true,
      hourly_cost_usd: 1050,
      speed_kmh: 30,
      fuel_range_km: 3000,
    },
    // Standard Heavy Container Trucks
    ...Array.from({ length: 14 }).map((_, i) => ({
      vehicle_id: `TRK-HEAVY-${String(i + 1).padStart(2, '0')}`,
      name: `Tata Prima Heavy Hauler #${i + 1}`,
      asset_type: 'container_truck' as const,
      carrier_id: i % 2 === 0 ? 'CAR-VRL' : 'CAR-CONCOR',
      carrier_name: i % 2 === 0 ? 'VRL Logistics Express Fleet' : 'Container Corporation of India (CONCOR)',
      location: {
        lat: 18.9 + (i % 5) * 0.08,
        lng: 72.85 + (i % 4) * 0.09,
        city: i % 2 === 0 ? 'Navi Mumbai Hub' : 'Panvel Cargo Terminal',
      },
      capacity_teu: 2,
      max_weight_tons: 32,
      status: (i < 10 ? 'idle' : 'in_transit') as 'idle' | 'in_transit',
      availability: i < 10,
      refrigeration_capable: false,
      hourly_cost_usd: 55,
      speed_kmh: 60,
      fuel_range_km: 800,
    })),
    // Cargo Aircraft
    {
      vehicle_id: 'AIR-CARGO-01',
      name: 'Boeing 737-800BCF Freighter',
      asset_type: 'cargo_aircraft',
      carrier_id: 'CAR-BLUEDART',
      carrier_name: 'Blue Dart Cold Chain Express',
      location: { lat: 19.0896, lng: 72.8656, city: 'Mumbai Chhatrapati Shivaji Int Airport' },
      capacity_teu: 4,
      max_weight_tons: 23.9,
      status: 'idle',
      availability: true,
      refrigeration_capable: true,
      current_temp: 4.0,
      hourly_cost_usd: 4800,
      speed_kmh: 750,
      fuel_range_km: 3750,
    },
    {
      vehicle_id: 'AIR-CARGO-02',
      name: 'Airbus A321P2F Express',
      asset_type: 'cargo_aircraft',
      carrier_id: 'CAR-BLUEDART',
      carrier_name: 'Blue Dart Cold Chain Express',
      location: { lat: 23.0772, lng: 72.6347, city: 'Ahmedabad Airport Air Cargo Complex' },
      capacity_teu: 4,
      max_weight_tons: 27,
      status: 'idle',
      availability: true,
      refrigeration_capable: true,
      current_temp: 4.0,
      hourly_cost_usd: 5100,
      speed_kmh: 800,
      fuel_range_km: 4000,
    },
  ];

  await Fleet.insertMany(fleetData);

  // 10. Shipments (65 synthetic shipments)
  console.log('📦 Seeding Shipments...');
  const now = Date.now();

  // The primary hero shipment for the hackathon demo scenario:
  const heroShipment = {
    shipment_id: 'SHP-PHARMA-1001',
    tracking_number: 'TRK-SG-2026-IN-8890',
    title: 'High-Value Insulin & Temperature-Critical Vaccines Batch A-7',
    origin_port_id: 'SGSIN',
    destination_port_id: 'INBOM',
    destination_name: 'Serum Institute Cold Storage Depot, Pune (via Mumbai Port)',
    current_location: { lat: 18.88, lng: 72.78 }, // Approaching Mumbai outer waters
    current_route_id: 'RTE-SIN-BOM-SEA',
    cargo_type: 'pharmaceuticals' as const,
    cargo_description: 'Recombinant Human Insulin and Pediatric Vaccines (Requires Strict 2°C - 8°C Cold Chain)',
    container_id: 'CONT-REEFER-9042',
    value_usd: 1250000,
    weight_kg: 8400,
    deadline: new Date(now + 36 * 3600 * 1000), // In 36 hours
    eta: new Date(now + 48 * 3600 * 1000), // ETA slipped past deadline due to strike!
    priority: 'critical' as const,
    requires_refrigeration: true,
    target_temp_min: 2.0,
    target_temp_max: 8.0,
    status: 'at_risk' as const,
    risk_score: 94,
    risk_factors: [
      'Destination port (INBOM) shut down due to strike',
      'Container ambient temperature rising; auxiliary generator runtime critical',
      'Expected delay (+48h) exceeds 24h cold-chain shelf-life threshold',
      'High financial liability ($1.25M USD)',
    ],
    carrier_id: 'CAR-MAERSK',
    reroute_history: [],
  };

  const sampleShipments: any[] = [
    heroShipment,
    {
      shipment_id: 'SHP-ELEC-2002',
      tracking_number: 'TRK-SG-2026-IN-4412',
      title: 'Semiconductor Microcontrollers & ASICs',
      origin_port_id: 'SGSIN',
      destination_port_id: 'INBOM',
      destination_name: 'Tata Electronics Component Hub, Navi Mumbai',
      current_location: { lat: 18.82, lng: 72.75 },
      current_route_id: 'RTE-SIN-BOM-SEA',
      cargo_type: 'electronics' as const,
      cargo_description: 'Automotive Grade MCUs for EV Assembly',
      container_id: 'CONT-DRY-3310',
      value_usd: 890000,
      weight_kg: 6200,
      deadline: new Date(now + 60 * 3600 * 1000),
      eta: new Date(now + 74 * 3600 * 1000),
      priority: 'high' as const,
      requires_refrigeration: false,
      status: 'at_risk' as const,
      risk_score: 82,
      risk_factors: ['Vessel queued in outer Mumbai roads', 'Assembly line stoppage risk'],
      carrier_id: 'CAR-MSC',
      reroute_history: [],
    },
    {
      shipment_id: 'SHP-AGRI-3003',
      tracking_number: 'TRK-SG-2026-IN-1199',
      title: 'Fresh Alphonso Mangoes Export Batch 04',
      origin_port_id: 'INBOM',
      destination_port_id: 'AEJEA',
      destination_name: 'Dubai Fresh Food World Market',
      current_location: { lat: 18.945, lng: 72.856 },
      current_route_id: 'RTE-JEA-BOM-SEA',
      cargo_type: 'perishables' as const,
      cargo_description: 'Export Grade Perishable Fruit',
      container_id: 'CONT-REEFER-7721',
      value_usd: 185000,
      weight_kg: 14500,
      deadline: new Date(now + 40 * 3600 * 1000),
      eta: new Date(now + 80 * 3600 * 1000),
      priority: 'high' as const,
      requires_refrigeration: true,
      target_temp_min: 10.0,
      target_temp_max: 13.0,
      status: 'at_risk' as const,
      risk_score: 89,
      risk_factors: ['Stranded in Mumbai yard without active gantry power', 'Shelf life decaying'],
      carrier_id: 'CAR-MAERSK',
      reroute_history: [],
    },
    {
      shipment_id: 'SHP-AUTO-4004',
      tracking_number: 'TRK-SG-2026-IN-5501',
      title: 'Heavy Transmission Gears & Axles',
      origin_port_id: 'INNSA',
      destination_port_id: 'INMUN',
      destination_name: 'Maruti Suzuki Sanand Plant',
      current_location: { lat: 20.15, lng: 70.82 },
      current_route_id: 'RTE-MUN-BOM-RAIL',
      cargo_type: 'automotive' as const,
      cargo_description: 'Precision engineered transmission subassemblies',
      container_id: 'CONT-DRY-6623',
      value_usd: 420000,
      weight_kg: 24000,
      deadline: new Date(now + 96 * 3600 * 1000),
      eta: new Date(now + 48 * 3600 * 1000),
      priority: 'medium' as const,
      requires_refrigeration: false,
      status: 'in_transit' as const,
      risk_score: 18,
      risk_factors: [],
      carrier_id: 'CAR-CONCOR',
      reroute_history: [],
    },
    {
      shipment_id: 'SHP-GEN-5005',
      tracking_number: 'TRK-SG-2026-IN-9034',
      title: 'Industrial Organic Dyestuffs & Pigments',
      origin_port_id: 'INMAA',
      destination_port_id: 'LKCMB',
      destination_name: 'Colombo Textile Finishing Mills',
      current_location: { lat: 10.4, lng: 80.1 },
      current_route_id: 'RTE-CMB-MAA-SEA',
      cargo_type: 'general' as const,
      cargo_description: 'Standard dry chemical textile dyes',
      container_id: 'CONT-DRY-8841',
      value_usd: 120000,
      weight_kg: 18000,
      deadline: new Date(now + 72 * 3600 * 1000),
      eta: new Date(now + 24 * 3600 * 1000),
      priority: 'low' as const,
      requires_refrigeration: false,
      status: 'in_transit' as const,
      risk_score: 12,
      risk_factors: [],
      carrier_id: 'CAR-MSC',
      reroute_history: [],
    },
  ];

  // Generate 55 additional diverse synthetic shipments across routes and statuses
  const cargoTypes = ['pharmaceuticals', 'electronics', 'perishables', 'automotive', 'general'] as const;
  const priorities = ['critical', 'high', 'medium', 'low'] as const;
  const portIds = ['INBOM', 'INNSA', 'INMUN', 'INMAA', 'LKCMB', 'SGSIN', 'AEJEA'];

  for (let i = 6; i <= 60; i++) {
    const cargoType = cargoTypes[i % cargoTypes.length];
    const origin = portIds[i % portIds.length];
    let dest = portIds[(i + 2) % portIds.length];
    if (dest === origin) dest = portIds[(i + 3) % portIds.length];

    const isReefer = cargoType === 'pharmaceuticals' || cargoType === 'perishables';
    const affectsBOM = origin === 'INBOM' || dest === 'INBOM';
    const risk = affectsBOM ? Math.floor(75 + (i % 24)) : Math.floor(10 + (i % 30));
    const status = affectsBOM ? (risk > 80 ? 'at_risk' : 'delayed') : 'in_transit';

    sampleShipments.push({
      shipment_id: `SHP-SYN-${String(i).padStart(4, '0')}`,
      tracking_number: `TRK-SG-2026-SYN-${10000 + i}`,
      title: `${cargoType.toUpperCase()} Consignment #${i}`,
      origin_port_id: origin,
      destination_port_id: dest,
      destination_name: `${dest} Cargo Logistics Complex`,
      current_location: {
        lat: 15.0 + (i % 8) * 0.9,
        lng: 70.0 + (i % 10) * 1.1,
      },
      current_route_id: 'RTE-SIN-BOM-SEA',
      cargo_type: cargoType,
      cargo_description: `Synthetic commercial batch ${cargoType} unit #${i}`,
      container_id: isReefer ? `CONT-REEFER-${5000 + i}` : `CONT-DRY-${2000 + i}`,
      value_usd: isReefer ? 250000 + (i * 12000) : 75000 + (i * 4500),
      weight_kg: 5000 + (i * 350),
      deadline: new Date(now + (24 + (i % 72)) * 3600 * 1000),
      eta: new Date(now + (affectsBOM ? 60 + (i % 48) : 18 + (i % 36)) * 3600 * 1000),
      priority: priorities[i % priorities.length],
      requires_refrigeration: isReefer,
      target_temp_min: isReefer ? 2.0 : undefined,
      target_temp_max: isReefer ? 8.0 : undefined,
      status: status as any,
      risk_score: risk,
      risk_factors: affectsBOM ? ['Mumbai Port stoppage impact zone', 'Vessel schedule deviation'] : [],
      carrier_id: i % 2 === 0 ? 'CAR-MAERSK' : 'CAR-MSC',
      reroute_history: [],
    });
  }

  await Shipment.insertMany(sampleShipments);

  // 11. Temperature Logs for Hero Shipment (CONT-REEFER-9042)
  console.log('🌡️ Seeding Temperature Telemetry for Cold-Chain Monitoring...');
  const tempLogs = [];
  const hoursBack = 12;

  // Temperature starts at normal 4.0°C and slowly creeps up towards excursion threshold (8.0°C)
  // because the reefer is stuck idling with strained auxiliary genset!
  for (let h = hoursBack; h >= 0; h--) {
    const timestamp = new Date(now - h * 3600 * 1000);
    const tempCelsius = Number((4.0 + (hoursBack - h) * 0.32).toFixed(2)); // reaches 7.84°C
    const excursion = tempCelsius > 7.5;

    tempLogs.push({
      log_id: `LOG-TEMP-${1000 + h}`,
      container_id: 'CONT-REEFER-9042',
      shipment_id: 'SHP-PHARMA-1001',
      timestamp,
      temperature_celsius: tempCelsius,
      ambient_temp_celsius: 33.5,
      humidity_pct: 78,
      battery_level_pct: Math.max(22, 98 - (hoursBack - h) * 6),
      min_threshold: 2.0,
      max_threshold: 8.0,
      excursion_detected: excursion,
      excursion_duration_minutes: excursion ? (hoursBack - h) * 45 : 0,
      location: { lat: 18.88, lng: 72.78 },
    });
  }

  // Normal temperature logs for another container
  for (let h = 6; h >= 0; h--) {
    tempLogs.push({
      log_id: `LOG-TEMP-OK-${2000 + h}`,
      container_id: 'CONT-REEFER-7721',
      shipment_id: 'SHP-AGRI-3003',
      timestamp: new Date(now - h * 3600 * 1000),
      temperature_celsius: 11.2,
      ambient_temp_celsius: 32.0,
      humidity_pct: 65,
      battery_level_pct: 88,
      min_threshold: 10.0,
      max_threshold: 13.0,
      excursion_detected: false,
      excursion_duration_minutes: 0,
      location: { lat: 18.945, lng: 72.856 },
    });
  }

  await TemperatureLog.insertMany(tempLogs);

  // 12. Port Events
  console.log('⚓ Seeding Port Events...');
  await PortEvent.insertMany([
    {
      event_id: 'PE-BOM-001',
      port_id: 'INBOM',
      timestamp: strikeStart,
      event_type: 'labor_action',
      severity: 'critical',
      details: 'Dockworkers and crane operators cease operations across all main terminals.',
      impact_delay_hours: 72,
    },
    {
      event_id: 'PE-BOM-002',
      port_id: 'INBOM',
      timestamp: new Date(strikeStart.getTime() + 1 * 3600 * 1000),
      event_type: 'berth_delay',
      severity: 'high',
      details: 'All container ship berthing clearances frozen until further notice.',
      impact_delay_hours: 48,
    },
    {
      event_id: 'PE-NSA-001',
      port_id: 'INNSA',
      timestamp: new Date(now - 6 * 3600 * 1000),
      event_type: 'berth_delay',
      severity: 'medium',
      details: 'Surge in diversion inquiries. Extra gate lanes opened for emergency reefer intake.',
      impact_delay_hours: 6,
    },
  ]);

  // 13. Audit Log baseline
  console.log('📜 Seeding Audit Logs...');
  await AuditLog.insertMany([
    {
      log_id: 'AUD-2026-0001',
      timestamp: new Date(now - 12 * 3600 * 1000),
      actor: {
        user_id: 'USR-ADMIN-01',
        email: 'admin@supplyguard.io',
        name: 'Capt. Vikramaditya Singhania',
        role: 'Admin',
      },
      organization_id: org.organization_id,
      action: 'SYSTEM_INITIALIZATION',
      target_type: 'plan',
      target_id: 'SYSTEM_CORE',
      details: { version: '1.0.0', tenant: org.name },
      reason: 'Standard tenant deployment and baseline synthetic configuration',
      approval_status: 'approved',
    },
    {
      log_id: 'AUD-2026-0002',
      timestamp: new Date(now - 8 * 3600 * 1000),
      actor: {
        user_id: 'SYSTEM_MCP',
        email: 'copilot@supplyguard.ai',
        name: 'SupplyGuard Copilot Agent',
        role: 'Automated Agent',
      },
      organization_id: org.organization_id,
      action: 'DISRUPTION_VERIFIED',
      target_type: 'disruption',
      target_id: 'DIS-2026-BOM-001',
      details: {
        confidence_score: 0.94,
        sources_analyzed: 4,
        evidence: 'Reuters, AIS telemetry, Port Authority notice',
      },
      reason: 'Confidence score (0.94) exceeded automatic verification threshold (0.80)',
      approval_status: 'auto_applied',
    },
  ]);

  // 14. Notifications
  console.log('🔔 Seeding Notifications...');
  await Notification.insertMany([
    {
      notification_id: 'NOTIF-001',
      user_id: 'USR-MGR-01',
      organization_id: org.organization_id,
      type: 'action_required',
      severity: 'critical',
      title: 'CRITICAL: Cold-chain shipment SHP-PHARMA-1001 requires immediate reroute approval',
      message:
        'Container CONT-REEFER-9042 temperature has reached 7.84°C (Limit: 8.0°C). Mumbai Port strike will cause total cargo loss if not rerouted to Nhava Sheva (JNPT) within 6 hours.',
      payload: { shipment_id: 'SHP-PHARMA-1001', disruption_id: 'DIS-2026-BOM-001' },
      read: false,
      created_at: new Date(now - 30 * 60 * 1000),
    },
    {
      notification_id: 'NOTIF-002',
      user_id: 'USR-MGR-01',
      organization_id: org.organization_id,
      type: 'alert',
      severity: 'high',
      title: 'Disruption Alert: Mumbai Port Strike Verified',
      message: '18 shipments affected across Western India sea corridor. Copilot analysis ready.',
      payload: { disruption_id: 'DIS-2026-BOM-001' },
      read: false,
      created_at: new Date(now - 2 * 3600 * 1000),
    },
  ]);

  console.log('✅ Seeding completed successfully!');
  console.log('📊 Summary:');
  console.log('   - 1 Organization');
  console.log('   - 5 Users (Admin, Manager, Analyst, Auditor, Normal User)');
  console.log('   - 7 Major Ports');
  console.log('   - 5 Logistics Carriers');
  console.log('   - 8 Multi-modal Routes');
  console.log('   - 2 Disruptions (Mumbai Strike + Red Sea Advisory)');
  console.log('   - 4 Verified News & AIS Events');
  console.log('   - 25 Fleet Assets (Reefer trucks, Container haulers, Vessels, Aircraft)');
  console.log('   - 60 Shipments (including Hero Pharma Insulin SHP-PHARMA-1001)');
  console.log('   - 20 IoT Temperature Telemetry Logs');
  console.log('   - 3 Port Events');
  console.log('   - 2 Audit Logs');
  console.log('   - 2 Urgent Notifications');
}

// Execute if run directly via ts-node
if (require.main === module) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Seeding failed:', err);
      await disconnectDB();
      process.exit(1);
    });
}
