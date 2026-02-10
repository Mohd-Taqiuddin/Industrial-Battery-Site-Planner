import React from 'react';
import { type DeviceType, DEVICE_SPECS } from '../types';

interface Props {
  layout: any;
  config: Record<DeviceType, number>;
}

export const StatsPanel: React.FC<Props> = ({ layout, config }) => {
  const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="panel compact">
      <div className="panel-header">Bill of Materials</div>
      <div className="panel-content">
        
        {/* KPI Cards */}
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-label">Total Cost</div>
            <div className="kpi-value">{formatMoney(layout?.total_cost || 0)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Energy</div>
            <div className="kpi-value">{layout?.total_energy?.toFixed(1) || 0} <small>MWh</small></div>
          </div>
        </div>

        <div className="panel-header" style={{padding: '0 0 0.5rem 0', border: 'none', fontSize: '0.75rem'}}>Detailed Breakdown</div>
        
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
            {Object.keys(config).map((key) => {
              const type = key as DeviceType;
              const count = config[type];
              if (count > 0 && type !== 'Transformer') {
                const area = DEVICE_SPECS[type].width * DEVICE_SPECS[type].height;
                return (
                  <tr key={type}>
                    <td>
                      <span className={`dot bg-${type}`}></span>
                      {type}
                    </td>
                    <td>{count}</td>
                    <td>{area * count} <small>sq ft</small></td>
                    <td className="right">{formatMoney(count * DEVICE_SPECS[type].cost)}</td>
                  </tr>
                );
              }
              return null;
            })}
            
            {(layout?.transformers_count || 0) > 0 && (
              <tr>
                <td>
                  <span className="dot bg-Transformer"></span>
                  Transformer
                </td>
                <td>{layout.transformers_count}</td>
                <td>{100 * layout.transformers_count} <small>sq ft</small></td>
                <td className="right">{formatMoney(layout.transformers_count * DEVICE_SPECS['Transformer'].cost)}</td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div style={{marginTop: 'auto', paddingTop: '2rem', textAlign: 'center'}}>
           <div className="kpi-label">Land Dimensions</div>
           <div style={{fontSize: '1.2rem', fontFamily: 'monospace', color: 'var(--text-main)'}}>
             {layout?.total_width || 0}ft x {layout?.total_height || 0}ft
           </div>
           <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px'}}>
             Total Area: {(layout?.total_width || 0) * (layout?.total_height || 0)} sq ft
           </div>
        </div>
      </div>
    </div>
  );
};