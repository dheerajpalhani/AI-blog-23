import React from 'react';

const AnalyticsChart = ({ type = 'bar', data = [], xKey = 'label', yKey = 'value', height = 220 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center bg-slate-950/40 rounded-xl border border-slate-850" style={{ height: `${height}px` }}>
        <span className="text-sm text-slate-555 italic text-slate-400">No analytical data available</span>
      </div>
    );
  }

  const values = data.map(item => item[yKey] || 0);
  const maxVal = Math.max(...values, 10); // Minimum scale of 10
  const labels = data.map(item => item[xKey]);

  if (type === 'line') {
    const padding = 40;
    const chartWidth = 500;
    const chartHeight = height;
    
    // Convert data to SVG points
    const points = data.map((item, idx) => {
      const x = padding + (idx / (data.length - 1 || 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - ((item[yKey] || 0) / maxVal) * (chartHeight - padding * 2);
      return { x, y };
    });

    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = points.length > 0 
      ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
      : '';

    return (
      <div className="relative bg-slate-900/60 border border-slate-800 rounded-xl p-4 w-full">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="line-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0"/>
            </linearGradient>
          </defs>
          
          {/* Coordinates grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + ratio * (chartHeight - padding * 2);
            return (
              <line key={i} x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#1e293b" strokeDasharray="3" />
            );
          })}

          {/* Area overlay */}
          {areaPath && <path d={areaPath} fill="url(#line-glow)" />}
          
          {/* Main trend line */}
          {linePath && <path d={linePath} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />}

          {/* Circle markers */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="5" fill="#06b6d4" stroke="#0b0f19" strokeWidth="2" />
              <circle cx={p.x} cy={p.y} r="10" fill="#06b6d4" opacity="0" className="hover:opacity-30 transition-opacity" />
              <title>{`${labels[idx]}: ${values[idx]}`}</title>
            </g>
          ))}

          {/* Solid axis bounds */}
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#334155" />
          <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#334155" />
          
          {/* Text markers */}
          {points.map((p, idx) => (
            <text key={idx} x={p.x} y={chartHeight - 15} fill="#64748b" fontSize="9" textAnchor="middle">
              {labels[idx]?.length > 10 ? labels[idx].slice(0, 8) + '..' : labels[idx]}
            </text>
          ))}
        </svg>
      </div>
    );
  }

  // Default Bar Chart logic
  const padding = 40;
  const chartWidth = 500;
  const chartHeight = height;
  const barWidth = Math.max(12, (chartWidth - padding * 2) / (data.length * 2 || 1));

  return (
    <div className="relative bg-slate-900/60 border border-slate-800 rounded-xl p-4 w-full">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + ratio * (chartHeight - padding * 2);
          return (
            <line key={i} x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#1e293b" strokeDasharray="3" />
          );
        })}

        {/* Graphical Bars */}
        {data.map((item, idx) => {
          const x = padding + idx * ((chartWidth - padding * 2) / data.length) + barWidth / 2;
          const barHeight = ((item[yKey] || 0) / maxVal) * (chartHeight - padding * 2);
          const y = chartHeight - padding - barHeight;

          return (
            <g key={idx} className="group cursor-pointer">
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={Math.max(barHeight, 2)} 
                fill="url(#bar-grad)" 
                rx="3"
                className="hover:opacity-80 transition-opacity"
              />
              <title>{`${labels[idx]}: ${values[idx]}`}</title>
            </g>
          );
        })}

        {/* Solid axes bounds */}
        <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#334155" />
        <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#334155" />
        
        {/* Label names */}
        {data.map((item, idx) => {
          const x = padding + idx * ((chartWidth - padding * 2) / data.length) + barWidth / 2 + barWidth / 2;
          return (
            <text key={idx} x={x} y={chartHeight - 15} fill="#64748b" fontSize="9" textAnchor="middle">
              {labels[idx]?.length > 10 ? labels[idx].slice(0, 8) + '..' : labels[idx]}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default AnalyticsChart;
