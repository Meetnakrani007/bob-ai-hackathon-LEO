import {
  Port,
  Shipment,
  Fleet,
  Route,
  Disruption,
  NewsEvent,
  TemperatureLog,
} from '../../models';

export interface MCPResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  read: (uri: string) => Promise<string>;
}

export const mcpResourceTemplates = [
  {
    uriTemplate: 'port://{port_id}/status',
    name: 'Port Operational Status',
    description: 'Current operational status, capacity, and active berths for the specified port.',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'port://{port_id}/congestion',
    name: 'Port Congestion & Queue Telemetry',
    description: 'Congestion percentage, dwell times, and vessel anchor backlog for the specified port.',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'port://{port_id}/disruptions',
    name: 'Port Active Disruptions',
    description: 'List of active strikes, weather anomalies, and equipment failures affecting this port.',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'shipments://active',
    name: 'Active Shipments',
    description: 'All currently in-transit commercial cargo shipments across the network.',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'shipments://at-risk',
    name: 'At-Risk Shipments',
    description: 'Shipments exhibiting high risk score (>= 70) or facing delivery deadline jeopardy.',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'fleet://available',
    name: 'Available Fleet Assets',
    description: 'Real-time inventory of idle and ready-to-dispatch transport assets.',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'routes://risk',
    name: 'Multi-Modal Route Risk Directory',
    description: 'Risk classifications, obstruction flags, and transit costs for all corridors.',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'coldchain://alerts',
    name: 'Cold-Chain Temperature Excursion Alerts',
    description: 'Active and impending temperature excursions across refrigerated containers.',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'news://logistics/disruptions',
    name: 'Verified Disruption News Feed',
    description: 'Corroborated intelligence bulletins from Port Authorities, Reuters, and AIS sensors.',
    mimeType: 'application/json',
  },
];

export async function readMCPResource(uri: string): Promise<{ text: string; mimeType: string }> {
  // 1. port://{port_id}/status
  const statusMatch = uri.match(/^port:\/\/([^/]+)\/status$/);
  if (statusMatch) {
    const portId = statusMatch[1].toUpperCase();
    const port = await Port.findOne({ $or: [{ port_id: portId }, { code: portId }] });
    return {
      mimeType: 'application/json',
      text: JSON.stringify(port || { error: `Port ${portId} not found` }, null, 2),
    };
  }

  // 2. port://{port_id}/congestion
  const congestionMatch = uri.match(/^port:\/\/([^/]+)\/congestion$/);
  if (congestionMatch) {
    const portId = congestionMatch[1].toUpperCase();
    const port = await Port.findOne({ $or: [{ port_id: portId }, { code: portId }] });
    const payload = port
      ? {
          port_id: port.port_id,
          current_congestion_pct: port.current_congestion_pct,
          average_dwell_time_hours: port.average_dwell_time_hours,
          berths_occupied: port.berths_occupied,
          berths_total: port.berths_total,
          status: port.status,
        }
      : { error: `Port ${portId} not found` };
    return { mimeType: 'application/json', text: JSON.stringify(payload, null, 2) };
  }

  // 3. port://{port_id}/disruptions
  const disruptionsMatch = uri.match(/^port:\/\/([^/]+)\/disruptions$/);
  if (disruptionsMatch) {
    const portId = disruptionsMatch[1].toUpperCase();
    const disruptions = await Disruption.find({ affected_ports: portId, status: 'active' });
    return { mimeType: 'application/json', text: JSON.stringify(disruptions, null, 2) };
  }

  // 4. shipments://active
  if (uri === 'shipments://active') {
    const shipments = await Shipment.find({ status: { $in: ['in_transit', 'delayed', 'at_risk'] } }).limit(50);
    return { mimeType: 'application/json', text: JSON.stringify(shipments, null, 2) };
  }

  // 5. shipments://at-risk
  if (uri === 'shipments://at-risk') {
    const atRisk = await Shipment.find({
      $or: [{ risk_score: { $gte: 70 } }, { status: 'at_risk' }],
    }).sort({ risk_score: -1 });
    return { mimeType: 'application/json', text: JSON.stringify(atRisk, null, 2) };
  }

  // 6. fleet://available
  if (uri === 'fleet://available') {
    const availableFleet = await Fleet.find({ availability: true, status: 'idle' });
    return { mimeType: 'application/json', text: JSON.stringify(availableFleet, null, 2) };
  }

  // 7. routes://risk
  if (uri === 'routes://risk') {
    const routes = await Route.find().sort({ risk_score: -1 });
    return { mimeType: 'application/json', text: JSON.stringify(routes, null, 2) };
  }

  // 8. coldchain://alerts
  if (uri === 'coldchain://alerts') {
    const logs = await TemperatureLog.find({ excursion_detected: true }).sort({ timestamp: -1 }).limit(20);
    return { mimeType: 'application/json', text: JSON.stringify(logs, null, 2) };
  }

  // 9. news://logistics/disruptions
  if (uri === 'news://logistics/disruptions') {
    const news = await NewsEvent.find({ verification_status: 'verified' }).sort({ timestamp: -1 }).limit(20);
    return { mimeType: 'application/json', text: JSON.stringify(news, null, 2) };
  }

  throw new Error(`Unknown MCP Resource URI: ${uri}`);
}
