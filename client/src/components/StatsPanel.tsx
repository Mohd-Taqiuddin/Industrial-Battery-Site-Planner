import React from 'react';
import { DEVICE_SPECS } from '../types';
import type { DeviceType } from '../types';

interface Props {
  layout: any;
  config: Record<DeviceType, number>;
}

export const StatsPanel: React.FC<Props> = ({ layout, config }) => {
  const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="panel">
      <div className="panel-header">Metrics</div>
      <div className="panel-content">
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-label">Cost</div>
            <div className="kpi-value">{formatMoney(layout?.total_cost || 0)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Energy</div>
            <div className="kpi-value">{layout?.total_energy?.toFixed(1) || 0} <small>MWh</small></div>
          </div>
        </div>

        <div className="panel-header" style={{padding: '1rem 0 0.5rem 0', border: 'none'}}>Bill of Materials</div>
        <table className="bom-table">
          <tbody>
            {Object.keys(config).map((key) => {
              const type = key as DeviceType;
              if (config[type] > 0 && type !== 'Transformer') {
                return (
                  <tr key={type}>
                    <td>{type}</td>
                    <td>x{config[type]}</td>
                    <td className="right">{formatMoney(config[type] * DEVICE_SPECS[type].cost)}</td>
                  </tr>
                );
              }
              return null;
            })}
            {(layout?.transformers_count || 0) > 0 && (
              <tr style={{color: 'var(--accent)'}}>
                <td>Transformer</td>
                <td>x{layout.transformers_count}</td>
                <td className="right">Included</td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div style={{marginTop: '2rem', textAlign: 'center'}}>
           <div className="kpi-label">Required Land Area</div>
           <div style={{fontSize: '1.2rem', fontFamily: 'monospace'}}>{layout?.total_width || 0}ft x {layout?.total_height || 0}ft</div>
        </div>
      </div>
    </div>
  );
};