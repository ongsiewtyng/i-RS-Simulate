import React, { useState, useEffect, useRef } from 'react';
import { generateTimelineEvents, generateMachineList, simulateMachineUpdate } from '../services/mockData';
import TimelineStrip from './TimelineStrip';
import { MachineStatus, MachineListItem } from '../types';
import { Search, Filter, Thermometer, Activity, Zap, Clock } from 'lucide-react';

const MachineConditions: React.FC = () => {
  // Initialize with a larger set of machines for the sidebar
  const [machines, setMachines] = useState<MachineListItem[]>(() => generateMachineList(25));
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for timeline data which updates when machine changes
  const [events, setEvents] = useState<{ yesterday: any[], today: any[] }>({ yesterday: [], today: [] });
  const [isAnimating, setIsAnimating] = useState(false);

  // Filter machines based on search
  const filteredMachines = machines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedMachine = machines.find(m => m.id === selectedMachineId) || machines[0];

  // Simulation effect: Periodically update machine metrics to feel "Alive"
  useEffect(() => {
    const intervalId = setInterval(() => {
      setMachines(prevMachines => {
        // Randomly pick a few machines to update, including the selected one
        return prevMachines.map(machine => {
           if (machine.id === selectedMachineId || Math.random() < 0.1) {
             return simulateMachineUpdate(machine);
           }
           return machine;
        });
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(intervalId);
  }, [selectedMachineId]);

  // Effect to generate timeline events when machine changes
  useEffect(() => {
    setIsAnimating(true);
    // Simulate data fetch delay
    const timer = setTimeout(() => {
        const seed = parseInt(selectedMachineId.replace(/\D/g, '')) || 0;
        setEvents({
            yesterday: generateTimelineEvents(new Date(Date.now() - 86400000), seed),
            today: generateTimelineEvents(new Date(), seed + 100)
        });
        setIsAnimating(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedMachineId]);

  // Helper to format date relative time
  const formatLastUpdate = (date: Date) => {
    return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
  };

  return (
    <div className="flex h-full animate-fade-in">
       
       {/* Inner Sidebar: Machine List */}
       <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
             <div className="flex justify-between items-center mb-3">
                 <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Machines</h2>
                 <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{filteredMachines.length}</span>
             </div>
             <div className="relative group">
                <Search className="absolute left-2.5 top-2.5 text-gray-400 w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search machines..." 
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-shadow"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
             {filteredMachines.map(machine => (
               <div 
                 key={machine.id}
                 onClick={() => setSelectedMachineId(machine.id)}
                 className={`p-4 border-b border-gray-50 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                   selectedMachineId === machine.id 
                    ? 'bg-indigo-50/60 border-l-4 border-l-indigo-600 shadow-inner' 
                    : 'border-l-4 border-l-transparent hover:border-l-gray-300'
                 }`}
               >
                 <div className="flex justify-between items-start mb-1">
                    <span className={`font-semibold text-sm ${selectedMachineId === machine.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                      {machine.name}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                        <span className={`w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                            machine.status === MachineStatus.RunningGood ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' :
                            machine.status === MachineStatus.Stopped ? 'bg-rose-500 shadow-[0_0_5px_#f43f5e]' :
                            machine.status === MachineStatus.RunningAbnormal ? 'bg-yellow-500 shadow-[0_0_5px_#eab308]' : 'bg-slate-400'
                        }`} />
                    </div>
                 </div>
                 <div className="flex justify-between items-center mt-2">
                   <span className="text-xs text-gray-400 font-mono">{machine.id}</span>
                   <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{machine.location}</span>
                 </div>
               </div>
             ))}
          </div>
       </div>

       {/* Main Content Area */}
       <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6 space-y-6 custom-scrollbar">
          
           {/* Machine Header & Live Metrics */}
           <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-70' : 'opacity-100'}`}>
               <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-xl transition-colors duration-500 ${
                        selectedMachine.status === MachineStatus.RunningGood ? 'bg-emerald-100 text-emerald-600' :
                        selectedMachine.status === MachineStatus.Stopped ? 'bg-rose-100 text-rose-600' :
                        'bg-yellow-100 text-yellow-600'
                     }`}>
                        <Activity className="w-6 h-6" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900">{selectedMachine.name}</h1>
                            {selectedMachine.status === MachineStatus.RunningAbnormal && (
                                <span className="animate-pulse bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full">WARNING</span>
                            )}
                            {selectedMachine.status === MachineStatus.Stopped && (
                                <span className="animate-pulse bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">ALERT</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <span>{selectedMachine.location}</span>
                          <span className="text-gray-300">|</span>
                          <span className="font-mono">{selectedMachine.id}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-xs">Last update: {formatLastUpdate(selectedMachine.lastUpdate)}</span>
                        </div>
                     </div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                     <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded text-sm bg-white hover:bg-gray-50 text-gray-600 transition-colors">
                        <Filter className="w-4 h-4" /> Views
                     </button>
                     <div className={`px-3 py-1.5 rounded-md text-sm font-medium border flex items-center gap-2 ${
                         selectedMachine.status === MachineStatus.RunningGood ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                         selectedMachine.status === MachineStatus.Stopped ? 'bg-rose-50 border-rose-100 text-rose-700' :
                         'bg-yellow-50 border-yellow-100 text-yellow-700'
                     }`}>
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              selectedMachine.status === MachineStatus.RunningGood ? 'bg-emerald-400' :
                              selectedMachine.status === MachineStatus.Stopped ? 'bg-rose-400' : 'bg-yellow-400'
                          }`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${
                              selectedMachine.status === MachineStatus.RunningGood ? 'bg-emerald-500' :
                              selectedMachine.status === MachineStatus.Stopped ? 'bg-rose-500' : 'bg-yellow-500'
                          }`}></span>
                        </span>
                        {selectedMachine.status}
                     </div>
                 </div>
               </div>

               {/* Live Metric Cards */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                   <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                       <div>
                           <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Temperature</p>
                           <p className="text-2xl font-bold text-gray-800 transition-all duration-300">{selectedMachine.temperature.toFixed(1)}°C</p>
                       </div>
                       <div className="p-2 bg-orange-50 rounded-full text-orange-500">
                           <Thermometer className="w-5 h-5" />
                       </div>
                   </div>
                   <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                       <div>
                           <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Vibration</p>
                           <p className="text-2xl font-bold text-gray-800 transition-all duration-300">{selectedMachine.vibration.toFixed(2)} mm/s</p>
                       </div>
                       <div className="p-2 bg-blue-50 rounded-full text-blue-500">
                           <Activity className="w-5 h-5" />
                       </div>
                   </div>
                   <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                       <div>
                           <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Load</p>
                           <p className="text-2xl font-bold text-gray-800 transition-all duration-300">{selectedMachine.load.toFixed(0)}%</p>
                       </div>
                       <div className="p-2 bg-purple-50 rounded-full text-purple-500">
                           <Zap className="w-5 h-5" />
                       </div>
                   </div>
               </div>
           </div>

           {/* Timelines */}
           {isAnimating ? (
               <div className="bg-white rounded-lg p-8 border border-gray-100 shadow-sm space-y-8">
                  <div className="h-24 w-full bg-gray-100 rounded loading-shimmer"></div>
                  <div className="h-24 w-full bg-gray-100 rounded loading-shimmer"></div>
               </div>
           ) : (
               <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
                    <TimelineStrip label="Yesterday" events={events.yesterday} />
                    <TimelineStrip label="Today" events={events.today} />
               </div>
           )}

           {/* Device Status Log Table */}
           <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                        <Clock className="w-4 h-4" />
                        Device Status Log
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <button className="px-3 py-1 border rounded bg-white hover:bg-gray-50 text-gray-600 shadow-sm transition-colors">View: Events</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isAnimating ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-10 w-full bg-gray-100 rounded loading-shimmer"></div>)}
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Time</th>
                                    <th className="px-6 py-3 font-medium text-center">Status</th>
                                    <th className="px-6 py-3 font-medium">Duration</th>
                                    <th className="px-6 py-3 font-medium text-gray-600">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {events.today.length > 0 ? events.today.slice(0, 5).reverse().map((evt, i) => (
                                    <tr key={i} className="hover:bg-gray-50 bg-white transition-colors">
                                        <td className="px-6 py-4 text-gray-700 whitespace-nowrap font-mono text-xs">
                                            {new Date(evt.startTime).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                                                evt.status === MachineStatus.Stopped ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                                evt.status === MachineStatus.RunningAbnormal ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            }`}>
                                                {evt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                                            {new Date(evt.durationSeconds * 1000).toISOString().substr(11, 8)}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {evt.reason ? (
                                                <span className="text-rose-500 font-medium">{evt.reason}</span>
                                            ) : (
                                                <span className="text-gray-400 italic">No remarks</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No events recorded for today.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
           </div>

        </div>
    </div>
  );
};

export default MachineConditions;