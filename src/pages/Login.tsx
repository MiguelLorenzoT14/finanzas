import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, LogIn, UserPlus } from 'lucide-react';
import './Login.css';

const Login = () => {
    const { login, register } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                // Registration
                if (!name.trim()) {
                    setError('Por favor ingresa tu nombre');
                    setLoading(false);
                    return;
                }
                if (password !== confirmPassword) {
                    setError('Las contraseñas no coinciden');
                    setLoading(false);
                    return;
                }
                if (password.length < 4) {
                    setError('La contraseña debe tener al menos 4 caracteres');
                    setLoading(false);
                    return;
                }

                const result = await register(name, email, password);
                if (!result.success) {
                    setError(result.error || 'Error al registrar');
                }
            } else {
                // Login
                const result = await login(email, password);
                if (!result.success) {
                    setError(result.error || 'Error al iniciar sesión');
                }
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        setError('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="login-container">
            <div className="login-card animate-fade-in">
                <div className="login-header">
                    <h1 className="login-logo">💰 Finanzas Pro</h1>
                    <p className="login-subtitle">
                        {isRegister ? 'Crea tu cuenta para comenzar' : 'Inicia sesión para continuar'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {isRegister && (
                        <div className="form-group">
                            <label className="form-label">
                                <User size={16} /> Nombre
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Tu nombre completo"
                                className="form-input"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">
                            <Mail size={16} /> Correo Electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            className="form-input"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Lock size={16} /> Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="form-input"
                            required
                        />
                    </div>

                    {isRegister && (
                        <div className="form-group">
                            <label className="form-label">
                                <Lock size={16} /> Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="form-input"
                                required
                            />
                        </div>
                    )}

                    {error && (
                        <div className="error-message">{error}</div>
                    )}

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span>Cargando...</span>
                        ) : isRegister ? (
                            <>
                                <UserPlus size={20} /> Crear Cuenta
                            </>
                        ) : (
                            <>
                                <LogIn size={20} /> Iniciar Sesión
                            </>
                        )}
                    </button>
                </form>

                <div className="toggle-mode">
                    <span>{isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}</span>
                    <button type="button" onClick={toggleMode} className="toggle-btn">
                        {isRegister ? 'Inicia Sesión' : 'Regístrate'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
