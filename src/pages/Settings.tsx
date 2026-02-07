import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { LogOut, Shield, CreditCard, RefreshCw, Database } from 'lucide-react';
import './Settings.css';

const Settings = () => {
    const { user, logout } = useAuth();
    const { refreshData } = useFinance();

    const handleRefreshData = async () => {
        try {
            await refreshData();
            alert('Datos sincronizados correctamente');
        } catch (error) {
            alert('Error al sincronizar datos');
        }
    };

    const getRoleName = (role?: string) => {
        switch (role) {
            case 'admin': return 'Administrador';
            case 'cliente': return 'Cliente';
            default: return 'Usuario';
        }
    };

    return (
        <div className="settings-container">
            <div className="header-mb animate-fade-in">
                <h1>Configuración</h1>
                <p className="subtitle">Administra tu cuenta y preferencias.</p>
            </div>

            {/* User Profile Card */}
            <div className="profile-card card-glass animate-slide-up">
                <div className="profile-avatar animate-scale-in delay-1">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-info">
                    <h2 className="animate-fade-in delay-2">{user?.username || 'Usuario'}</h2>
                    <p className="profile-email animate-fade-in delay-3">{user?.email || 'Sin correo'}</p>
                    <div className="profile-badges animate-fade-in delay-4">
                        <span className="role-badge">{getRoleName(user?.role)}</span>
                        <span className="status-badge active">Activo</span>
                    </div>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="settings-grid">
                <div className="settings-card card-glass animate-slide-up delay-1">
                    <h3>
                        <Shield size={20} className="icon-blue" /> Seguridad
                    </h3>
                    <p className="card-description">Cambiar contraseña o configurar opciones de seguridad.</p>
                    <button className="settings-btn outline">
                        Cambiar Contraseña
                    </button>
                </div>

                <div className="settings-card card-glass animate-slide-up delay-2">
                    <h3>
                        <Database size={20} className="icon-primary" /> Sincronización
                    </h3>
                    <p className="card-description">Sincroniza tus datos con la nube.</p>
                    <button className="settings-btn primary" onClick={handleRefreshData}>
                        <RefreshCw size={16} className="animate-spin-slow" /> Sincronizar Ahora
                    </button>
                </div>

                <div className="settings-card card-glass animate-slide-up delay-3">
                    <h3>
                        <CreditCard size={20} className="icon-green" /> Datos
                    </h3>
                    <p className="card-description">Exportar datos o gestionar tu información.</p>
                    <button className="settings-btn outline">
                        Exportar a CSV
                    </button>
                </div>
            </div>

            {/* Logout Section */}
            <div className="logout-section animate-fade-in delay-5">
                <button onClick={logout} className="logout-btn">
                    <LogOut size={20} /> Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default Settings;
