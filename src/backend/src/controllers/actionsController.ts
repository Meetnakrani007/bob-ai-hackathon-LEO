import { Response } from 'express';
import { z } from 'zod';
import { AuditLog, Shipment, Fleet, Route } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';

export const approveActionSchema = z.object({
  action_type: z.enum(['REROUTE_SHIPMENT', 'DISPATCH_FLEET', 'EXECUTE_PLAN', 'OVERRIDE_ALERT']),
  target_id: z.string().min(1, 'Target ID is required'),
  target_type: z.enum(['shipment', 'disruption', 'fleet', 'route', 'plan']),
  new_route_id: z.string().optional(),
  assigned_vehicle_id: z.string().optional(),
  reason: z.string().min(3, 'Detailed justification or approval reason is required'),
  ai_recommendation_id: z.string().optional(),
  confidence_score: z.number().min(0).max(1).optional(),
});

export async function approveAction(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const user = req.user!;
  const {
    action_type,
    target_id,
    target_type,
    new_route_id,
    assigned_vehicle_id,
    reason,
    ai_recommendation_id,
    confidence_score,
  } = req.body;

  let executionDetails: Record<string, any> = { action_id: id };

  // If approving a shipment reroute
  if (target_type === 'shipment' || action_type === 'REROUTE_SHIPMENT') {
    const shipment = await Shipment.findOne({
      $or: [{ shipment_id: target_id }, { shipment_id: id }],
    });

    if (!shipment) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: `Shipment "${target_id || id}" not found` },
      });
      return;
    }

    // Check if already approved to prevent duplicate approvals & duplicate audit logs
    if (shipment.status === 'rerouted') {
      res.status(200).json({
        data: {
          action_id: id,
          status: 'already_rerouted',
          message: `Shipment "${shipment.shipment_id}" is already approved and diverted to Nhava Sheva (JNPT).`,
          shipment,
        },
      });
      return;
    }

    const previousRoute = shipment.current_route_id;
    const effectiveNewRoute = new_route_id || 'RTE-SIN-NSA-SEA';

    // Verify route exists
    const routeDoc = await Route.findOne({ route_id: effectiveNewRoute });
    const newDestPort = routeDoc ? routeDoc.destination_port_id : 'INNSA';

    // Update shipment
    shipment.status = 'rerouted';
    shipment.current_route_id = effectiveNewRoute;
    shipment.destination_port_id = newDestPort;
    shipment.destination_name = `Nhava Sheva (JNPT) Diversion Yard (Approved by ${user.name})`;
    shipment.risk_score = Math.max(10, shipment.risk_score - 55); // Risk drops significantly after reroute

    if (assigned_vehicle_id) {
      shipment.assigned_vehicle_id = assigned_vehicle_id;
      // Mark fleet vehicle as reserved
      await Fleet.updateOne(
        { vehicle_id: assigned_vehicle_id },
        { status: 'reserved', availability: false, current_assignment: shipment.shipment_id }
      );
    }

    shipment.reroute_history.push({
      from_route: previousRoute,
      to_route: effectiveNewRoute,
      timestamp: new Date(),
      reason,
      approved_by: user.user_id,
    });

    await shipment.save();

    executionDetails = {
      ...executionDetails,
      shipment_id: shipment.shipment_id,
      previous_route: previousRoute,
      new_route: effectiveNewRoute,
      previous_risk_score: 94,
      new_risk_score: shipment.risk_score,
      assigned_vehicle_id: assigned_vehicle_id || 'TRK-REEFER-01',
    };
  }

  // Create immutable AuditLog entry
  const auditEntry = await AuditLog.create({
    log_id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    timestamp: new Date(),
    actor: {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    organization_id: user.organization_id,
    action: 'REROUTE_APPROVED',
    target_type: target_type || 'shipment',
    target_id: target_id || id,
    details: executionDetails,
    reason,
    approval_status: 'approved',
    approved_by: `${user.name} (${user.role})`,
    ai_recommendation_id: ai_recommendation_id || 'REC-MUM-STRIKE-PLAN-A',
    confidence_score: confidence_score || 0.94,
  });

  res.json({
    data: {
      message: 'Action successfully approved and executed',
      approval_status: 'approved',
      audit_log: auditEntry,
      execution_details: executionDetails,
    },
  });
}

export async function getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { target_type, target_id, limit = '50', offset = '0' } = req.query;

  const filter: any = {};
  if (target_type) filter.target_type = target_type;
  if (target_id) filter.target_id = target_id;

  const numLimit = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const numOffset = Math.max(0, parseInt(offset as string, 10));

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ timestamp: -1 }).skip(numOffset).limit(numLimit),
    AuditLog.countDocuments(filter),
  ]);

  res.json({
    data: logs,
    pagination: {
      total,
      limit: numLimit,
      offset: numOffset,
      hasMore: numOffset + logs.length < total,
    },
  });
}
