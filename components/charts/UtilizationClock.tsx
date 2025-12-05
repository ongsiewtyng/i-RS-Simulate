import React from 'react';
import { TimelineEvent, MachineStatus } from '../../types';
import { COLORS } from '../../constants';

interface UtilizationClockProps {
  events: TimelineEvent[];
  date: string;
}

const UtilizationClock: React.FC<UtilizationClockProps> = ({ events, date }) => {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 100;
  const strokeWidth = 40;
  
  // Calculate SVG path for an arc
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const d = [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    return d;
  };

  // Convert time to degrees (0-360) for a 24h clock
  const timeToDegrees = (dateStr: string) => {
    const d = new Date(dateStr);
    const totalMinutes = d.getHours() * 60 + d.getMinutes();
    return (totalMinutes / 1440) * 360;
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 border rounded px-2 py-1 text-xs text-gray-500 flex items-center gap-1 cursor-pointer hover:bg-gray-50">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Clock
      </div>
      
      <h3 className="w-full text-lg font-bold text-gray-900 mb-1">Production-Day Utilization</h3>
      <p className="w-full text-xs text-gray-500 mb-6">Window: {date} 08:00 - {date} 11:19</p>

      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
           {/* Background Circle */}
           <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
           
           {/* Inner white circle for donut effect */}
           <circle cx={cx} cy={cy} r={radius - strokeWidth/2} fill="white" />

           {/* Event Arcs */}
           {events.map((event, i) => {
             const startDeg = timeToDegrees(event.startTime);
             const endDeg = timeToDegrees(event.endTime);
             // Handle wrapping slightly for simplicity (assuming single day view mostly)
             if (endDeg < startDeg) return null; 
             
             return (
               <path
                 key={i}
                 d={describeArc(cx, cy, radius, startDeg, endDeg)}
                 fill="none"
                 stroke={COLORS[event.status]}
                 strokeWidth={strokeWidth}
                 className="transition-all duration-300 hover:opacity-80"
               />
             );
           })}

           {/* Hour Markers (Outer Ring) */}
           {Array.from({ length: 24 }).map((_, i) => {
             const angle = (i / 24) * 360;
             const markerPos = polarToCartesian(cx, cy, radius + 40, angle);
             return (
               <text
                 key={i}
                 x={markerPos.x}
                 y={markerPos.y}
                 textAnchor="middle"
                 dominantBaseline="middle"
                 className="text-[10px] fill-gray-400 font-medium"
                 style={{ fontSize: '10px' }}
               >
                 {i.toString().padStart(2, '0')}
               </text>
             );
           })}
           
           {/* Dividing lines for hours */}
           {Array.from({ length: 24 }).map((_, i) => {
             const angle = (i / 24) * 360;
             const inner = polarToCartesian(cx, cy, radius - strokeWidth/2, angle);
             const outer = polarToCartesian(cx, cy, radius + strokeWidth/2, angle);
             return (
               <line 
                key={`line-${i}`}
                x1={inner.x} y1={inner.y}
                x2={outer.x} y2={outer.y}
                stroke="white"
                strokeWidth="1"
               />
             );
           })}
        </svg>
      </div>

      <div className="flex gap-4 mt-6 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Running Good
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span> Running Abnormal
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span> Stopped
          </div>
      </div>
    </div>
  );
};

export default UtilizationClock;