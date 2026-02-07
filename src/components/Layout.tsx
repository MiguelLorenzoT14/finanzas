import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    Coins,
    PiggyBank,
    Settings,
    Menu,
    X,
    PieChart,
    CircleDollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ChatBot from './ChatBot';
import './Layout.css';

// Helper function to get short name (first two words)
const getShortName = (fullName: string): string => {
    const parts = fullName.trim().split(' ');
    return parts.slice(0, 2).join(' ') || 'Usuario';
};

// Custom hook to detect window maximized/fullscreen state
const useWindowState = () => {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        const electron = window.electron;
        if (!electron) return;

        // Get initial state
        electron.isMaximized().then(setIsMaximized);
        electron.isFullScreen().then((isFs: boolean) => {
            if (isFs) setIsMaximized(true);
        });

        // Listen for changes
        electron.onMaximize(() => setIsMaximized(true));
        electron.onUnmaximize(() => setIsMaximized(false));
        electron.onEnterFullScreen(() => setIsMaximized(true));
        electron.onLeaveFullScreen(() => setIsMaximized(false));

        return () => {
            electron.removeAllListeners('window-maximized');
            electron.removeAllListeners('window-unmaximized');
            electron.removeAllListeners('window-enter-fullscreen');
            electron.removeAllListeners('window-leave-fullscreen');
        };
    }, []);

    return isMaximized;
};

// Custom Title Bar Component
const CustomTitleBar = ({ username, isMaximized }: { username: string; isMaximized: boolean }) => {
    if (isMaximized) return null;

    // Get first name from full name
    const firstName = username.split(' ')[0] || 'Usuario';

    return (
        <div className="custom-title-bar">
            <CircleDollarSign size={16} className="title-bar-icon" />
            <span className="title-bar-text">Finanzas de {firstName}</span>
        </div>
    );
};

const Sidebar = ({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) => {
    const { user } = useAuth();

    const links = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/income', icon: Wallet, label: 'Ingresos' },
        { to: '/expenses', icon: Coins, label: 'Gastos' },
        { to: '/budgets', icon: PieChart, label: 'Presupuestos' },
        { to: '/savings', icon: PiggyBank, label: 'Ahorro' },
        { to: '/settings', icon: Settings, label: 'Configuración' },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <span className="brand">💰 Finanzas Pro</span>
                <button className="close-btn" onClick={toggleSidebar}>
                    <X size={20} />
                </button>
            </div>

            <nav className="nav-list">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => window.innerWidth < 768 && toggleSidebar()}
                    >
                        <link.icon className="nav-icon" size={20} />
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar-large">
                        {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{getShortName(user?.username || 'Usuario')}</span>
                        <span className="user-role">{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isMaximized = useWindowState();
    const { user } = useAuth();

    return (
        <div className={`app-layout ${isMaximized ? 'maximized' : ''}`}>
            {/* Custom title bar - only visible in windowed mode */}
            <CustomTitleBar
                username={user?.username || 'Usuario'}
                isMaximized={isMaximized}
            />

            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
                onClick={() => setSidebarOpen(false)}
                style={{ pointerEvents: sidebarOpen ? 'auto' : 'none' }}
            />

            {/* Mobile menu button - fixed position */}
            <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Abrir menú"
            >
                <Menu size={24} />
            </button>

            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <main className="main-content">
                <div className="page-container">
                    {children}
                </div>
            </main>

            {/* AI Assistant ChatBot */}
            <ChatBot />
        </div>
    );
};

export default Layout;
