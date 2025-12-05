import React from 'react';
import { TimelineEvent, MachineStatus } from '../types';
import { COLORS } from '../constants';

interface TimelineStripProps {
  events: TimelineEvent[];
  label: string;
}

const TimelineStrip: React.FC<TimelineStripProps> = ({ events, label }) => {
  // Assume standard day 00:00 to 24:00
  const totalSeconds = 24 * 60 * 60;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
           {label}
        </div>
        <div className="flex gap-2 text-gray-400">
            <button className="hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
            <button className="hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
            <button className="hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg></button>
        </div>
      </div>
      
      {/* Time Axis */}
      <div className="flex justify-between text-[10px] text-gray-400 mb-1 px-1">
        {Array.from({ length: 25 }).map((_, i) => (
          <span key={i}>{i.toString().padStart(2, '0')}:00</span>
        ))}
      </div>

      {/* Bar Strip */}
      <div className="w-full h-16 bg-gray-100 rounded-sm relative overflow-hidden flex">
        {events.map((event, idx) => {
            // Simplified calculation assuming events are sequential and cover the day
            // In a real app, position using absolute left/width % based on start/end times
            const start = new Date(event.startTime);
            const midnight = new Date(start);
            midnight.setHours(0,0,0,0);
            
            const startSeconds = (start.getTime() - midnight.getTime()) / 1000;
            const widthPercent = (event.durationSeconds / totalSeconds) * 100;
            const leftPercent = (startSeconds / totalSeconds) * 100;
            
            // Fix color mapping for "Offline" or special Blue signal seen in screenshot
            let color = COLORS[event.status];
            if (event.status === MachineStatus.Offline) color = '#3b82f6'; // Blue

            return (
                <div 
                    key={idx}
                    className="h-full absolute top-0 bottom-0 border-r border-white/20 hover:opacity-80 cursor-pointer group"
                    style={{ 
                        left: `${leftPercent}%`, 
                        width: `${widthPercent}%`, 
                        backgroundColor: color 
                    }}
                >
                    <div className="hidden group-hover:block absolute bottom-full mb-1 left-0 z-10 bg-black text-white text-xs p-1 rounded whitespace-nowrap">
                        {new Date(event.startTime).toLocaleTimeString()} - {event.status}
                    </div>
                </div>
            );
        })}
        {/* Current time marker (simulation) */}
        {label === "Today" && (
            <div className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10" style={{ left: '35%' }}></div>
        )}
      </div>
    </div>
  );
};

export default TimelineStrip;