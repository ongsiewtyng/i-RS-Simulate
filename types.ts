export enum MachineStatus {
  RunningGood = 'Running (Good)',
  RunningAbnormal = 'Running (Abnormal)',
  Stopped = 'Stopped',
  Offline = 'Offline'
}

export interface TimelineEvent {
  id: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  status: MachineStatus;
  reason?: string;
  remarks?: string;
  durationSeconds: number;
}

export interface Machine {
  id: string;
  serial: string;
  name: string;
  type: string;
  ip: string;
  mac: string;
  currentStatus: MachineStatus;
  lastLog: string;
  runtimeTodayMinutes: number;
  totalLogsToday: number;
}

export interface MachineListItem {
  id: string;
  name: string;
  status: MachineStatus;
  location: string;
  // Dynamic fields for simulation
  temperature: number; // Celsius
  vibration: number; // mm/s
  load: number; // Percentage
  lastUpdate: Date;
}

export interface DowntimeRecord {
  id: string;
  time: string;
  reason: string | null;
  remarks: string | null;
  runTime: string;
  isConfirmed: boolean;
}