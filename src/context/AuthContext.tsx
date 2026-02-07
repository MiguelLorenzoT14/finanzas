import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase, Usuario } from '../lib/supabase';

type UserRole = 'admin' | 'user' | 'cliente';

interface User {
    id: number;
    username: string;
    email: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            const storedUserId = localStorage.getItem('user_id');
            if (storedUserId) {
                const { data, error } = await supabase
                    .from('Usuarios')
                    .select('*')
                    .eq('id_usuario', parseInt(storedUserId))
                    .single();

                if (data && !error) {
                    setUser({
                        id: data.id_usuario,
                        username: data.nombre,
                        email: data.correo,
                        role: data.rol as UserRole,
                    });
                } else {
                    localStorage.removeItem('user_id');
                }
            }
            setLoading(false);
        };

        checkSession();
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data, error } = await supabase
                .from('Usuarios')
                .select('*')
                .eq('correo', email)
                .eq('contrasena', password)
                .single();

            if (error || !data) {
                return { success: false, error: 'Correo o contraseña incorrectos' };
            }

            const loggedUser: User = {
                id: data.id_usuario,
                username: data.nombre,
                email: data.correo,
                role: data.rol as UserRole,
            };

            setUser(loggedUser);
            localStorage.setItem('user_id', String(data.id_usuario));

            return { success: true };
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, error: 'Error al iniciar sesión' };
        }
    };

    const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Check if email already exists
            const { data: existing } = await supabase
                .from('Usuarios')
                .select('id_usuario')
                .eq('correo', email)
                .single();

            if (existing) {
                return { success: false, error: 'Este correo ya está registrado' };
            }

            // Create new user
            const { data, error } = await supabase
                .from('Usuarios')
                .insert({
                    nombre: name,
                    correo: email,
                    contrasena: password,
                    rol: 'cliente',
                })
                .select()
                .single();

            if (error) {
                console.error('Register error:', error);
                return { success: false, error: 'Error al registrar usuario' };
            }

            const newUser: User = {
                id: data.id_usuario,
                username: data.nombre,
                email: data.correo,
                role: data.rol as UserRole,
            };

            setUser(newUser);
            localStorage.setItem('user_id', String(data.id_usuario));

            return { success: true };
        } catch (err) {
            console.error('Register error:', err);
            return { success: false, error: 'Error al registrar usuario' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user_id');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
