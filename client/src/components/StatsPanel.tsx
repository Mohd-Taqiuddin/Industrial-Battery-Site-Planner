import React from 'react';
import { type DeviceType, DEVICE_SPECS, type LayoutResponse } from '../types';

interface Props {
  layout: LayoutResponse | null;
  config: Record<DeviceType, number>;
}

export const StatsPanel: React.FC<Props> = ({ layout, config }) => {

  const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  
  const formatCompact = (num: number, isMoney: boolean = false) => {
    if (num >= 1000000) {
      return (isMoney ? '$' : '') + (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (isMoney ? '$' : '') + (num / 1000).toFixed(2) + 'k';
    }
    return (isMoney ? '$' : '') + num.toLocaleString();
  };

  // Safe calculations to prevent crashes if layout is null
  const totalEnergy = layout?.total_energy || 0;
  const width = layout?.total_width || 0;
  const height = layout?.total_height || 0;
  const areaSqFt = width * height;
  
  const totalCost = layout?.total_cost || 0;

  // Density Math
  // 1 Acre = 43,560 sq ft
  const densitySqFt = areaSqFt > 0 ? (totalEnergy / areaSqFt) : 0;
  const densityAcre = areaSqFt > 0 ? (totalEnergy / (areaSqFt / 43560)) : 0;

  const costPerMWh = totalEnergy > 0 ? (totalCost / totalEnergy) : 0;

  

  return (
    <div className="panel compact">
      <div className="panel-header">Project Metrics</div>
      <div className="panel-content">
        {/* KPI Grid - Row 1 */}
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-label">Total Cost</div>
            <div className="kpi-value">{formatMoney(layout?.total_cost || 0)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Total Energy</div>
            <div className="kpi-value">{totalEnergy.toFixed(1)} <small>MWh</small></div>
          </div>
        </div>

        {/* KPI Grid - Row 2 (Energy Density) */}
        <div className="kpi-row" style={{marginBottom: '2rem'}}>
          <div className="kpi-card">
            <div className="kpi-label">Energy Density</div>
            <div className="kpi-value" style={{fontSize: '1.1rem'}}>
              {densityAcre.toFixed(1)} <small>MWh/acre</small>
            </div>
            <div style={{fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px'}}>
              {densitySqFt.toFixed(4)} MWh/sq ft
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Land Dimensions</div>
            <div className="kpi-value" style={{fontSize: '1.1rem'}}>
              {width}ft x {height}ft
            </div>
            <div style={{fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px'}}>
              {areaSqFt.toLocaleString()} sq ft
            </div>
          </div>
          <div className="kpi-card" style={{ marginTop: '12px', background: 'rgba(61, 90, 254, 0.05)' }}>
            <div className="kpi-label">Capital Efficiency</div>
            <div className="kpi-value" style={{ color: 'var(--accent)' }}>
              {formatMoney(costPerMWh)} <small>/ MWh</small>
            </div>
          </div>
        </div>

        <div className="panel-header" style={{padding: '0 0 0.5rem 0', border: 'none', fontSize: '0.75rem'}}>Bill of Materials</div>
        
        <table className="bom-table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Qty</th>
              <th>Footprint</th>
              <th className="right">Cost</th>
            </tr>
          </thead>
          <tbody>
            {/* Standard Batteries */}
            {Object.keys(config).map((key) => {
              const type = key as DeviceType;
              const count = config[type];
              
              // Skip if count is 0 OR if it is a Transformer (handled separately below)
              if (count > 0 && type !== 'Transformer') {
                const itemArea = DEVICE_SPECS[type].width * DEVICE_SPECS[type].height;
                return (
                  <tr key={type}>
                    <td>
                      <span className={`dot bg-${type}`}></span>
                      {type}
                    </td>
                    <td>{count}</td>
                    <td>{formatCompact(itemArea * count)} <small>sq ft</small></td>
                    <td className="right">{formatCompact(count * DEVICE_SPECS[type].cost)}</td>
                  </tr>
                );
              }
              return null;
            })}
            
            {/* TRANSFORMER ROW - With Fixed Icon */}
            {(layout?.transformers_count || 0) > 0 && (
              <tr>
                <td>
                  {/* ICON FIX: Blue Circle with Lightning Bolt */}
                  <span className="dot bg-Transformer" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '8px',
                    fontWeight: 'bold',
                    verticalAlign: 'middle',
                    marginRight: '8px'
                  }}></span>
                  Transformer
                </td>
                <td>{layout?.transformers_count}</td>
                <td>{formatCompact(100 * (layout?.transformers_count ?? 0))} <small>sq ft</small></td>
                <td className="right">{formatCompact((layout?.transformers_count ?? 0) * DEVICE_SPECS['Transformer'].cost)}</td>
              </tr>
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
};