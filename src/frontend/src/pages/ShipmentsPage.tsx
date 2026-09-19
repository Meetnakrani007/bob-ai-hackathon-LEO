import React from 'react';
import { Package, Truck, ShieldAlert, ArrowRight } from 'lucide-react';
import { ShipmentsGrid } from '../components/ShipmentsGrid';

interface ShipmentsPageProps {
  shipments: any[];
  fleet: any[];
  isRerouted: boolean;
  onOpenApproval: () => void;
  mitigatedShipments?: Record<string, any>;
  onMitigateShipment?: (shipmentId: string, solution: any) => void;
  onResetShipment?: (shipmentId: string) => void;
}

export const ShipmentsPage: React.FC<ShipmentsPageProps> = ({
  shipments,
  fleet,
  isRerouted,
  onOpenApproval,
  mitigatedShipments,
  onMitigateShipment,
  onResetShipment,
}) => {
  const totalCargoValue = shipments.reduce((acc, s) => acc + (s.value_usd || 0), 0);
  const deliveredCount = shipments.filter((s) => s.status === 'delivered').length;
  const inTransitCount = shipments.filter((s) => s.status === 'in_transit' || s.status === 'rerouted' || s.status === 'mitigated').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border-white/10 bg-gradient-to-r from-slate-900/90 to-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                Live Manifest Registry
              </span>
              <span className="text-xs text-slate-400">
                Total Tracked Cargo: ${(totalCargoValue / 1000000).toFixed(1)}M USD • {inTransitCount} In-Transit • {deliveredCount} Completed
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">
              Fleet Assets & Active Cargo Manifest
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Real-time manifest of maritime containers, refrigerated trailers, and inter-modal assets across Indian Ocean corridors.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Component */}
      <ShipmentsGrid
        shipments={shipments}
        fleet={fleet}
        onSelectShipment={(s) => {
          if (s.shipment_id === 'SHP-PHARMA-1001') {
            onOpenApproval();
          }
        }}
        isRerouted={isRerouted}
        mitigatedShipments={mitigatedShipments}
        onMitigateShipment={onMitigateShipment}
        onResetShipment={onResetShipment}
      />
    </div>
  );
};
