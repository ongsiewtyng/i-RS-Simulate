import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { MachineStatus, DowntimeRecord } from '../types';
import { COLORS, REASON_COLORS } from '../constants';
import UtilizationClock from './charts/UtilizationClock';
import { generateTimelineEvents, MOCK_DOWNTIME_RECORDS } from '../services/mockData';
import { Download, RefreshCw, LayoutGrid, List, Clock, Zap, Activity, Info, ChevronDown } from 'lucide-react';

// Options for dropdowns
const REASON_OPTIONS = ['Not Chosen', 'Mechanical', 'Electrical', 'Operational', 'Material'];

// Dynamic remarks based on reason
const REMARK_OPTIONS: Record<string, string[]> = {
  'Not Chosen': ['Not Chosen', 'Pending Investigation'],
  'Mechanical': ['Conveyor Jam', 'Belt Slippage', 'Motor Failure', 'Bearing Issue', 'Hydraulic Leak'],
  'Electrical': ['Sensor Misalignment', 'Overheat Protection', 'Power Loss', 'Fuse Blown', 'Drive Fault'],
  'Operational': ['Shift Changeover', 'Cleaning', 'Operator Break', 'Setup', 'Quality Check'],
  'Material': ['Out of Raw Material', 'Bad Material Quality', 'Hopper Empty', 'Packaging Issue'],
};

const Dashboard: React.FC = () => {
  const [timelineEvents] = useState(generateTimelineEvents(new Date()));
  const [downtimeRecords, setDowntimeRecords] = useState(MOCK_DOWNTIME_RECORDS);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // State for interactive filtering
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  // Simulation: Update clock
  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Pie Data from records
  const reasonsPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    downtimeRecords.forEach(r => {
        const reason = r.reason || 'Not Chosen';
        counts[reason] = (counts[reason] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [downtimeRecords]);

  // Daily status pie data (static simulation)
  const pieData = [
    { name: MachineStatus.RunningGood, value: 0 },
    { name: MachineStatus.RunningAbnormal, value: 75 },
    { name: MachineStatus.Stopped, value: 25 },
  ];

  const handleRowClick = (reason: string | null) => {
    const targetReason = reason || 'Not Chosen';
    setSelectedReason(prev => prev === targetReason ? null : targetReason);
  };

  const handlePieClick = (data: any) => {
    if (data && data.name) {
        setSelectedReason(prev => prev === data.name ? null : data.name);
    }
  };

  const clearSelection = () => setSelectedReason(null);

  // Handlers for Select Changes
  const handleReasonChange = (id: string, newReason: string) => {
    setDowntimeRecords(prev => prev.map(record => {
      if (record.id === id) {
        // When reason changes, default to the first available remark for that reason to keep data consistent
        const validRemarks = REMARK_OPTIONS[newReason] || ['Other'];
        return { 
            ...record, 
            reason: newReason, 
            remarks: validRemarks[0] 
        };
      }
      return record;
    }));
  };

  const handleRemarkChange = (id: string, newRemark: string) => {
    setDowntimeRecords(prev => prev.map(record => 
      record.id === id ? { ...record, remarks: newRemark } : record
    ));
  };

  // Safe to sort a copy for display logic
  const topReason = [...reasonsPieData].sort((a,b) => b.value - a.value)[0]?.name || 'Not Chosen';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header Section */}
      <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Machine Overview
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Ops view focused on stops ≥ 15 minutes</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="bg-[#f97316] hover:bg-orange-600 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
            <Download size={14} />
            Export (XLSX)
          </button>
          <div className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
              Updated: {currentTime.toLocaleTimeString()}
          </div>
          <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-all active:scale-95">
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total downtime ≥ 10m', value: '9:19:30', icon: <Clock size={16} className="text-rose-400"/> },
          { label: '% labeled', value: '45%', icon: <List size={16} className="text-gray-400"/> },
          { label: 'Top reason', value: topReason, bold: true, icon: <Zap size={16} className="text-yellow-500"/> },
          { label: 'Avg stop length', value: '0:46:37', icon: <Activity size={16} className="text-blue-400"/> },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-1">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{kpi.label}</div>
                {kpi.icon}
            </div>
            <div className={`text-2xl text-gray-800 mt-2 ${kpi.bold ? 'font-semibold text-rose-500' : ''}`}>
                {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Chart: Daily Status Overview */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="w-full flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900">Daily Status Overview (Production Day)</h3>
            </div>
            <div className="text-xs text-gray-500 mb-4 flex gap-2">
                <span>Time: 08:00 - {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span>|</span>
                <span>Machines: 1</span>
            </div>

            <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="white"
                            strokeWidth={2}
                            paddingAngle={2}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text Simulation */}
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-3xl font-bold text-gray-800">75%</span>
                    <span className="text-xs text-gray-500">Abnormal</span>
                </div>
            </div>

            {/* Legend Stats */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 w-full">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse-subtle"></div>
                    <span className="text-xs text-gray-600">Running (Good)</span>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse-subtle"></div>
                    <span className="text-xs text-gray-600">Running (Abnormal)</span>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse-subtle"></div>
                    <span className="text-xs text-gray-600">Stopped</span>
                </div>
            </div>

            {/* Stat Boxes */}
            <div className="grid grid-cols-3 gap-4 w-full mt-6">
                <div className="bg-emerald-50 p-3 rounded text-center transition-transform hover:scale-105 cursor-default">
                    <div className="text-emerald-600 font-bold text-lg">0</div>
                    <div className="text-emerald-700 text-xs font-medium">Good</div>
                    <div className="text-emerald-600 text-xs">0.0%</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded text-center transition-transform hover:scale-105 cursor-default border border-yellow-100">
                    <div className="text-yellow-600 font-bold text-lg">147</div>
                    <div className="text-yellow-700 text-xs font-medium">Abnormal</div>
                    <div className="text-yellow-600 text-xs">75.0%</div>
                </div>
                <div className="bg-rose-50 p-3 rounded text-center transition-transform hover:scale-105 cursor-default">
                    <div className="text-rose-600 font-bold text-lg">49</div>
                    <div className="text-rose-700 text-xs font-medium">Stopped</div>
                    <div className="text-rose-600 text-xs">25.0%</div>
                </div>
            </div>
        </div>

        {/* Right Chart: Utilization Clock */}
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
             <UtilizationClock events={timelineEvents} date="05/12/25" />
        </div>
      </div>

      {/* Downtime Reasons Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left: Reasons Pie */}
         <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm lg:col-span-1 flex flex-col items-center relative overflow-hidden">
            <h3 className="w-full text-lg font-bold text-gray-900 mb-6 flex justify-between items-center">
                Downtime Reasons
                {selectedReason && (
                    <button onClick={clearSelection} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">
                        Clear Filter
                    </button>
                )}
            </h3>
            
            <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={reasonsPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            dataKey="value"
                            stroke="white"
                            strokeWidth={2}
                            onClick={handlePieClick}
                            cursor="pointer"
                        >
                            {reasonsPieData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={REASON_COLORS[entry.name] || '#9ca3af'} 
                                    opacity={selectedReason && selectedReason !== entry.name ? 0.3 : 1}
                                    stroke={selectedReason === entry.name ? '#000' : '#fff'}
                                    strokeWidth={selectedReason === entry.name ? 2 : 1}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                 {selectedReason && (
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <span className="text-xs font-bold text-gray-800 bg-white/80 px-2 py-1 rounded shadow-sm">{selectedReason}</span>
                     </div>
                 )}
            </div>

            {/* Legend */}
            <div className="w-full mt-4 grid grid-cols-2 gap-2">
                {reasonsPieData.map((entry) => (
                    <div 
                        key={entry.name} 
                        className={`flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded transition-opacity ${
                            selectedReason && selectedReason !== entry.name ? 'opacity-40' : 'opacity-100'
                        }`}
                        onClick={() => handlePieClick(entry)}
                    >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: REASON_COLORS[entry.name] || '#9ca3af' }}></div>
                        <span className="text-gray-600 truncate" title={entry.name}>{entry.name}</span>
                        <span className="text-gray-400 ml-auto">{entry.value}</span>
                    </div>
                ))}
            </div>
         </div>

         {/* Right: Table */}
         <div className="bg-white rounded-lg border border-gray-100 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-purple-50/30">
                <h3 className="font-bold text-purple-900">Downtime ≥ 15 minutes</h3>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    {selectedReason ? `${downtimeRecords.filter(r => (r.reason || 'Not Chosen') === selectedReason).length} filtered` : `${downtimeRecords.length} records`}
                </span>
            </div>
            
            <div className="bg-yellow-50 p-2 px-4 border-l-4 border-yellow-400 text-xs font-bold text-yellow-800 flex justify-between items-center">
                <span>{selectedReason ? `FILTERED: ${selectedReason.toUpperCase()}` : 'ALL REASONS'}</span>
                {selectedReason && <button onClick={clearSelection} className="hover:underline">Show All</button>}
            </div>

            <div className="overflow-x-auto custom-scrollbar flex-1 max-h-[400px]">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10">
                        <tr>
                            <th className="p-3">Time</th>
                            <th className="p-3 w-48">Reason</th>
                            <th className="p-3 w-48">Remarks</th>
                            <th className="p-3 text-right">Run Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {downtimeRecords.map((record) => {
                            const currentReason = record.reason || 'Not Chosen';
                            const isMatch = !selectedReason || currentReason === selectedReason;
                            
                            // Visual dimming for non-matching rows
                            const rowOpacity = !isMatch ? 'opacity-30 grayscale' : 'opacity-100';

                            return (
                                <tr 
                                    key={record.id} 
                                    onClick={() => handleRowClick(currentReason)}
                                    className={`transition-all duration-300 cursor-pointer group ${rowOpacity} ${
                                        selectedReason === currentReason ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <td className="p-3 text-gray-600 font-mono text-xs whitespace-nowrap">{record.time}</td>
                                    
                                    {/* Interactive Reason Select */}
                                    <td className="p-3">
                                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                                            <select 
                                                value={currentReason}
                                                onChange={(e) => handleReasonChange(record.id, e.target.value)}
                                                className={`appearance-none w-full bg-white border rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer transition-colors shadow-sm
                                                    ${selectedReason === currentReason ? 'border-indigo-300' : 'border-gray-200 group-hover:border-gray-300'}
                                                `}
                                                style={{ borderLeftColor: REASON_COLORS[currentReason], borderLeftWidth: '4px' }}
                                            >
                                                {REASON_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </td>

                                    {/* Interactive Remarks Select */}
                                    <td className="p-3">
                                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                                            <select 
                                                value={record.remarks || ''}
                                                onChange={(e) => handleRemarkChange(record.id, e.target.value)}
                                                className="appearance-none w-full bg-transparent border border-transparent hover:border-gray-200 hover:bg-white rounded px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                                            >
                                                {(REMARK_OPTIONS[currentReason] || []).map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                            {/* Only show chevron on hover to keep interface clean */}
                                            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        </div>
                                    </td>

                                    <td className="p-3 text-right text-gray-700 font-medium font-mono">{record.runTime}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            
            <div className="p-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <span>Showing filtered results</span>
                <div className="flex gap-1">
                     <button className="px-2 py-1 border rounded bg-gray-50 text-gray-300 cursor-not-allowed">Prev</button>
                     <span className="px-2 py-1">1 / 1</span>
                     <button className="px-2 py-1 border rounded bg-gray-50 text-gray-300 cursor-not-allowed">Next</button>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;