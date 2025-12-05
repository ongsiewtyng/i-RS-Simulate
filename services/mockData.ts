import { MachineStatus, TimelineEvent, DowntimeRecord, Machine, MachineListItem } from '../types';

// Helper to add seed-based randomness
const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

export const generateTimelineEvents = (date: Date, seedOffset: number = 0): TimelineEvent[] => {
  const events: TimelineEvent[] = [];
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  let currentTime = startOfDay.getTime();
  const endOfDay = startOfDay.getTime() + 24 * 60 * 60 * 1000;
  
  let iter = 0;
  while (currentTime < endOfDay) {
    // Vary duration based on seed
    const rand1 = seededRandom(currentTime + seedOffset + iter);
    const durationMins = Math.floor(rand1 * 60) + 5;
    const durationMs = durationMins * 60 * 1000;
    
    // Ensure we don't go past end of day
    const endTime = Math.min(currentTime + durationMs, endOfDay);
    
    const rand2 = seededRandom(endTime + seedOffset + iter);
    let status = MachineStatus.RunningGood;
    let reason = undefined;
    
    // Different probability distributions based on seedOffset (simulating different machine behaviors)
    const thresholdStopped = 0.15 + (seedOffset % 10) / 100; // Vary between 0.15 and 0.25
    
    if (rand2 < thresholdStopped) {
      status = MachineStatus.Stopped;
      reason = "No Metal Detected";
    } else if (rand2 < 0.4) {
      status = MachineStatus.RunningAbnormal;
    }
    
    events.push({
      id: Math.random().toString(36).substr(2, 9),
      startTime: new Date(currentTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      status,
      durationSeconds: (endTime - currentTime) / 1000,
      reason
    });
    
    currentTime = endTime;
    iter++;
  }
  
  return events;
};

export const MOCK_MACHINE: Machine = {
  id: '2CCF67946D27',
  serial: '2CCF67946D27',
  name: 'Raspberry Pi',
  type: 'Auto',
  ip: '192.168.1.105',
  mac: '2c:cf:67...',
  currentStatus: MachineStatus.Stopped,
  lastLog: '13:33',
  runtimeTodayMinutes: 86,
  totalLogsToday: 5270
};

// Generate realistic machine list with metrics
export const generateMachineList = (count: number): MachineListItem[] => {
  const statuses = [
    MachineStatus.RunningGood,
    MachineStatus.RunningGood, // Higher weight
    MachineStatus.RunningAbnormal,
    MachineStatus.Stopped,
    MachineStatus.Offline
  ];
  
  return Array.from({ length: count }).map((_, i) => {
    const idNum = 100 + i;
    const statusIndex = Math.floor(Math.random() * statuses.length);
    return {
      id: `MCH-${idNum}`,
      name: `Machine ${String(i + 1).padStart(2, '0')}`,
      status: statuses[statusIndex],
      location: `Zone ${String.fromCharCode(65 + (i % 3))}`,
      temperature: 40 + Math.random() * 30, // 40-70C
      vibration: Math.random() * 5, // 0-5 mm/s
      load: 50 + Math.random() * 40, // 50-90%
      lastUpdate: new Date()
    };
  });
};

// Simulation helper to drift values
export const simulateMachineUpdate = (machine: MachineListItem): MachineListItem => {
  const newMachine = { ...machine };
  
  // Drift metrics
  const tempDrift = (Math.random() - 0.5) * 1.5;
  const vibDrift = (Math.random() - 0.5) * 0.2;
  const loadDrift = (Math.random() - 0.5) * 2;
  
  newMachine.temperature = Math.max(20, Math.min(100, newMachine.temperature + tempDrift));
  newMachine.vibration = Math.max(0, Math.min(10, newMachine.vibration + vibDrift));
  newMachine.load = Math.max(0, Math.min(100, newMachine.load + loadDrift));
  newMachine.lastUpdate = new Date();
  
  // Low probability status change
  if (Math.random() < 0.05) {
    // Logic for status transitions
    if (newMachine.status === MachineStatus.RunningGood && Math.random() < 0.2) {
      newMachine.status = MachineStatus.RunningAbnormal;
    } else if (newMachine.status === MachineStatus.RunningAbnormal) {
      if (Math.random() < 0.3) newMachine.status = MachineStatus.RunningGood;
      else if (Math.random() < 0.1) newMachine.status = MachineStatus.Stopped;
    } else if (newMachine.status === MachineStatus.Stopped && Math.random() < 0.2) {
      newMachine.status = MachineStatus.RunningGood;
    }
  }

  return newMachine;
};

export const MOCK_DOWNTIME_RECORDS: DowntimeRecord[] = [
  { id: '1', time: '05/12/25 11:45:00', reason: 'Mechanical', remarks: 'Conveyor Jam', runTime: '1:05:44', isConfirmed: true },
  { id: '2', time: '05/12/25 09:30:15', reason: 'Electrical', remarks: 'Sensor Misalignment', runTime: '0:52:32', isConfirmed: true },
  { id: '3', time: '05/12/25 08:15:10', reason: 'Not Chosen', remarks: null, runTime: '0:36:57', isConfirmed: false },
  { id: '4', time: '05/12/25 06:45:22', reason: 'Operational', remarks: 'Shift Changeover', runTime: '1:06:16', isConfirmed: true },
  { id: '5', time: '05/12/25 04:20:05', reason: 'Mechanical', remarks: 'Belt Slippage', runTime: '0:20:33', isConfirmed: true },
  { id: '6', time: '04/12/25 23:10:00', reason: 'Not Chosen', remarks: null, runTime: '0:15:00', isConfirmed: false },
  { id: '7', time: '04/12/25 21:05:30', reason: 'Material', remarks: 'Out of Raw Material', runTime: '0:45:00', isConfirmed: true },
  { id: '8', time: '04/12/25 19:40:12', reason: 'Electrical', remarks: 'Overheat Protection', runTime: '0:25:10', isConfirmed: true },
  { id: '9', time: '04/12/25 16:36:32', reason: 'Not Chosen', remarks: null, runTime: '0:12:33', isConfirmed: false },
  { id: '10', time: '04/12/25 14:15:00', reason: 'Operational', remarks: 'Cleaning', runTime: '0:18:22', isConfirmed: true },
];