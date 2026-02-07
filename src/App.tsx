import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import Savings from './pages/Savings';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Component to sync userId between Auth and Finance contexts
const FinanceSync = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const { setUserId } = useFinance();

    useEffect(() => {
        if (user?.id) {
            setUserId(user.id);
        }
    }, [user?.id, setUserId]);

    return <>{children}</>;
};

// Loading component
const LoadingScreen = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-muted)',
        fontSize: '1.25rem',
    }}>
        <div>Cargando...</div>
    </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

function AppRoutes() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />

            <Route path="/*" element={
                <ProtectedRoute>
                    <FinanceProvider>
                        <FinanceSync>
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/income" element={<Income />} />
                                    <Route path="/expenses" element={<Expenses />} />
                                    <Route path="/budgets" element={<Budgets />} />
                                    <Route path="/savings" element={<Savings />} />
                                    <Route path="/settings" element={<Settings />} />
                                </Routes>
                            </Layout>
                        </FinanceSync>
                    </FinanceProvider>
                </ProtectedRoute>
            } />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;
