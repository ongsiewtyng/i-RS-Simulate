import { MachineStatus } from './types';

export const COLORS = {
  [MachineStatus.RunningGood]: '#10b981', // emerald-500
  [MachineStatus.RunningAbnormal]: '#facc15', // yellow-400
  [MachineStatus.Stopped]: '#f43f5e', // rose-500
  [MachineStatus.Offline]: '#94a3b8', // slate-400
  NotChosen: '#fb7185', // rose-400 (Pinkish for pie chart)
};

export const REASON_COLORS: Record<string, string> = {
  'Not Chosen': '#fb7185', // rose-400
  'Mechanical': '#6366f1', // indigo-500
  'Electrical': '#f59e0b', // amber-500
  'Operational': '#10b981', // emerald-500
  'Material': '#8b5cf6', // violet-500
};

export const TAILWIND_COLORS = {
  [MachineStatus.RunningGood]: 'bg-emerald-500 text-emerald-500',
  [MachineStatus.RunningAbnormal]: 'bg-yellow-400 text-yellow-600',
  [MachineStatus.Stopped]: 'bg-rose-500 text-rose-500',
  [MachineStatus.Offline]: 'bg-slate-400 text-slate-500',
};