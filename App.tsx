import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import MachineConditions from './components/SignalHistory'; // Importing the refactored component
import { Menu, LayoutGrid, Activity, Settings, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'machineConditions'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingView, setIsLoadingView] = useState(false);

  // Simulation: Show loading state when switching views to feel like a real app
  const handleViewChange = (view: 'dashboard' | 'machineConditions') => {
    if (view === currentView) return;
    setIsLoadingView(true);
    setCurrentView(view);
    
    // Simulate network delay/rendering
    setTimeout(() => {
        setIsLoadingView(false);
    }, 600);
  };

  // Hamburger is the only toggle
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-30 shadow-md relative`}
      >
         {/* Sidebar Header with Hamburger */}
         <div className={`h-16 flex items-center border-b border-gray-100 px-4 ${isSidebarOpen ? 'justify-between' : 'justify-center'} bg-white`}>
             {isSidebarOpen && (
                 <div className="flex items-center gap-2 font-bold text-xl text-indigo-900 animate-fade-in overflow-hidden whitespace-nowrap">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg shadow-sm flex-shrink-0">
                        <Zap size={18} fill="currentColor" />
                    </div>
                    <span>i-RS</span>
                 </div>
             )}
             
             {/* Hamburger Menu - ONLY Control for Sidebar */}
             <button 
                onClick={toggleSidebar}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none transition-colors active:bg-gray-200"
                aria-label="Toggle Sidebar"
             >
                 <Menu size={20} />
             </button>
         </div>

         {/* Nav Items */}
         <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
            <NavItem 
                icon={<LayoutGrid size={20} />} 
                label="Dashboard" 
                active={currentView === 'dashboard'} 
                collapsed={!isSidebarOpen}
                onClick={() => handleViewChange('dashboard')}
            />
            <NavItem 
                icon={<Activity size={20} />} 
                label="Machine Conditions" 
                active={currentView === 'machineConditions'} 
                collapsed={!isSidebarOpen}
                onClick={() => handleViewChange('machineConditions')}
            />
         </nav>
         
         {/* Footer / Settings */}
         <div className="p-4 border-t border-gray-100">
             <NavItem 
                icon={<Settings size={20} />} 
                label="Settings" 
                active={false} 
                collapsed={!isSidebarOpen}
            />
            {isSidebarOpen && (
                <div className="mt-4 text-xs text-gray-400 text-center animate-fade-in">
                    v2.1.0
                </div>
            )}
         </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col bg-[#f8fafc]">
         {/* Loading Overlay */}
         {isLoadingView && (
             <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center animate-fade-in">
                 <div className="flex flex-col items-center">
                     <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
                     <span className="text-sm text-indigo-800 font-medium animate-pulse">Loading View...</span>
                 </div>
             </div>
         )}
         
         {currentView === 'dashboard' ? <Dashboard /> : <MachineConditions />}
      </main>

    </div>
  );
};

// Helper Component for Sidebar Items
interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    collapsed: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, collapsed, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center px-4 py-3 transition-all duration-200 relative group
            ${active 
                ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-r-4 border-transparent'
            }
            ${collapsed ? 'justify-center' : 'justify-start gap-3'}
        `}
        title={collapsed ? label : ''}
    >
        <span className={`${active ? 'scale-110' : ''} transition-transform duration-200 flex-shrink-0`}>
            {icon}
        </span>
        {!collapsed && <span className="text-sm font-medium tracking-tight whitespace-nowrap overflow-hidden">{label}</span>}
        
        {/* Active Indicator Dot for Collapsed State */}
        {collapsed && active && (
            <div className="absolute right-1 top-1 w-2 h-2 bg-indigo-600 rounded-full"></div>
        )}
    </button>
);

export default App;