import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not found in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on Supabase schema
export type Usuario = {
    id_usuario: number;
    nombre: string;
    correo: string;
    contrasena: string;
    rol: string;
    fecha_creacion: string;
    meta_ahorro?: number;
    tasa_ahorro?: number;
};

export type TipoIngreso = {
    id_tipo_ingreso: number;
    nombre_tipo: string;
    id_usuario?: number | null;
};

export type TipoGasto = {
    id_tipo_gasto: number;
    nombre_tipo: string;
    id_usuario?: number | null;
};

export type Ingreso = {
    id_ingreso: number;
    id_usuario: number;
    id_tipo_ingreso: number;
    monto: number;
    mes: number;
    anio: number;
    fecha_ingreso: string;
    descripcion?: string;
    es_recurrente?: boolean;
    tipo_recurrencia?: string;
    // Joined field
    tipo_ingreso?: TipoIngreso;
};

export type Gasto = {
    id_gasto: number;
    id_usuario: number;
    id_tipo_gasto: number;
    monto: number;
    mes: number;
    anio: number;
    fecha_gasto: string;
    descripcion?: string;
    es_recurrente?: boolean;
    tipo_recurrencia?: string;
    // Joined field
    tipo_gasto?: TipoGasto;
};

export type Ahorro = {
    id_ahorro: number;
    id_usuario: number;
    monto: number;
    mes: number;
    anio: number;
    fecha_ahorro: string;
};

export type Presupuesto = {
    id_presupuesto: number;
    id_usuario: number;
    id_tipo_gasto: number;
    monto: number;
    mes: number;
    anio: number;
    // Joined field
    tipo_gasto?: TipoGasto;
};

export type ProyeccionAhorro = {
    id_proyeccion: number;
    id_usuario: number;
    ahorro_mensual: number;
    meses: number;
    monto_total: number;
    fecha_proyeccion: string;
};
