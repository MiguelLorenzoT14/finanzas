import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, Ingreso, Gasto, TipoIngreso, TipoGasto, Presupuesto } from '../lib/supabase';

// App-friendly types (mapped from DB)
export type Income = {
    id: string;
    amount: number;
    description: string;
    date: string;
    category: string;
    categoryId: number;
    isRecurring?: boolean;
    recurrenceType?: 'weekly' | 'monthly' | 'yearly';
};

export type Expense = {
    id: string;
    amount: number;
    description: string;
    date: string;
    category: string;
    categoryId: number;
    isRecurring?: boolean;
    recurrenceType?: 'weekly' | 'monthly' | 'yearly';
};

export type Budget = {
    id: number;
    category: string;
    categoryId: number;
    limit: number;
    spent: number;
};

type FinanceState = {
    incomes: Income[];
    expenses: Expense[];
    incomeCategories: TipoIngreso[];
    expenseCategories: TipoGasto[];
    budgets: Budget[];
    savingsGoal: number;
    savingsRate: number;
    loading: boolean;
    error: string | null;
    userId: number | null;
};

type FinanceContextType = {
    state: FinanceState;
    // Income actions
    addIncome: (income: Omit<Income, 'id'>) => Promise<void>;
    deleteIncome: (id: string) => Promise<void>;
    // Expense actions
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    // Category actions
    addIncomeCategory: (name: string) => Promise<any>;
    addExpenseCategory: (name: string) => Promise<any>;
    deleteExpenseCategory: (id: number) => Promise<void>;
    // Budget actions
    setBudget: (categoryId: number, limit: number) => Promise<void>;
    // Settings
    setSavingsGoal: (goal: number) => Promise<void>;
    setSavingsRate: (rate: number) => Promise<void>;
    // User
    setUserId: (id: number) => void;
    // Refresh
    refreshData: () => Promise<void>;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<FinanceState>({
        incomes: [],
        expenses: [],
        incomeCategories: [],
        expenseCategories: [],
        budgets: [],
        savingsGoal: 0,
        savingsRate: 20,
        loading: true,
        error: null,
        userId: null,
    });

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Set user ID
    const setUserId = useCallback((id: number) => {
        setState(prev => ({ ...prev, userId: id }));
    }, []);

    // Load all data from Supabase
    const refreshData = useCallback(async () => {
        if (!state.userId) return;

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            // Load income categories (global + user specific)
            const { data: incomeCategories, error: incCatError } = await supabase
                .from('TiposIngreso')
                .select('*')
                .or(`id_usuario.is.null,id_usuario.eq.${state.userId}`)
                .order('nombre_tipo');

            if (incCatError) throw incCatError;

            // Load expense categories (global + user specific)
            const { data: expenseCategories, error: expCatError } = await supabase
                .from('TiposGasto')
                .select('*')
                .or(`id_usuario.is.null,id_usuario.eq.${state.userId}`)
                .order('nombre_tipo');

            if (expCatError) throw expCatError;

            // Load incomes for current month
            const { data: ingresos, error: incError } = await supabase
                .from('Ingresos')
                .select('*, TiposIngreso(nombre_tipo)')
                .eq('id_usuario', state.userId)
                .eq('mes', currentMonth)
                .eq('anio', currentYear)
                .order('fecha_ingreso', { ascending: false });

            if (incError) throw incError;

            // Load expenses for current month
            const { data: gastos, error: expError } = await supabase
                .from('Gastos')
                .select('*, TiposGasto(nombre_tipo)')
                .eq('id_usuario', state.userId)
                .eq('mes', currentMonth)
                .eq('anio', currentYear)
                .order('fecha_gasto', { ascending: false });

            if (expError) throw expError;

            // Load budgets for current month
            const { data: presupuestos, error: budError } = await supabase
                .from('Presupuestos')
                .select('*, TiposGasto(nombre_tipo)')
                .eq('id_usuario', state.userId)
                .eq('mes', currentMonth)
                .eq('anio', currentYear);

            if (budError) throw budError;

            // Load user settings
            const { data: usuario, error: userError } = await supabase
                .from('Usuarios')
                .select('meta_ahorro, tasa_ahorro')
                .eq('id_usuario', state.userId)
                .single();

            if (userError && userError.code !== 'PGRST116') throw userError;

            // Map DB data to app format
            const mappedIncomes: Income[] = (ingresos || []).map((i: Ingreso & { TiposIngreso?: TipoIngreso }) => ({
                id: String(i.id_ingreso),
                amount: Number(i.monto),
                description: i.descripcion || '',
                date: i.fecha_ingreso,
                category: i.TiposIngreso?.nombre_tipo || 'Sin categoría',
                categoryId: i.id_tipo_ingreso,
                isRecurring: i.es_recurrente || false,
                recurrenceType: i.tipo_recurrencia as Income['recurrenceType'],
            }));

            const mappedExpenses: Expense[] = (gastos || []).map((g: Gasto & { TiposGasto?: TipoGasto }) => ({
                id: String(g.id_gasto),
                amount: Number(g.monto),
                description: g.descripcion || '',
                date: g.fecha_gasto,
                category: g.TiposGasto?.nombre_tipo || 'Sin categoría',
                categoryId: g.id_tipo_gasto,
                isRecurring: g.es_recurrente || false,
                recurrenceType: g.tipo_recurrencia as Expense['recurrenceType'],
            }));

            // Calculate spent per category
            const spentByCategory: Record<number, number> = {};
            mappedExpenses.forEach(exp => {
                spentByCategory[exp.categoryId] = (spentByCategory[exp.categoryId] || 0) + exp.amount;
            });

            const mappedBudgets: Budget[] = (presupuestos || []).map((p: Presupuesto & { TiposGasto?: TipoGasto }) => ({
                id: p.id_presupuesto,
                category: p.TiposGasto?.nombre_tipo || 'Sin categoría',
                categoryId: p.id_tipo_gasto,
                limit: Number(p.monto),
                spent: spentByCategory[p.id_tipo_gasto] || 0,
            }));

            setState(prev => ({
                ...prev,
                incomes: mappedIncomes,
                expenses: mappedExpenses,
                incomeCategories: incomeCategories || [],
                expenseCategories: expenseCategories || [],
                budgets: mappedBudgets,
                savingsGoal: Number(usuario?.meta_ahorro) || 0,
                savingsRate: Number(usuario?.tasa_ahorro) || 20,
                loading: false,
            }));

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error al cargar datos';
            setState(prev => ({ ...prev, loading: false, error: errorMessage }));
            console.error('Error loading data:', error);
        }
    }, [state.userId, currentMonth, currentYear]);

    // Refresh when userId changes
    useEffect(() => {
        if (state.userId) {
            refreshData();
        }
    }, [state.userId, refreshData]);

    // Add income
    const addIncome = async (income: Omit<Income, 'id'>) => {
        if (!state.userId) throw new Error("Usuario no identificado");

        const date = new Date(income.date);
        const { error } = await supabase.from('Ingresos').insert({
            id_usuario: state.userId,
            id_tipo_ingreso: income.categoryId,
            monto: income.amount,
            mes: date.getMonth() + 1,
            anio: date.getFullYear(),
            fecha_ingreso: income.date,
            descripcion: income.description,
            es_recurrente: income.isRecurring || false,
            tipo_recurrencia: income.recurrenceType || null,
        });

        if (error) {
            console.error('Error adding income:', error);
            throw error;
        }

        await refreshData();
    };

    // Delete income
    const deleteIncome = async (id: string) => {
        const { error } = await supabase.from('Ingresos').delete().eq('id_ingreso', parseInt(id));
        if (error) {
            console.error('Error deleting income:', error);
            throw error;
        }
        await refreshData();
    };

    // Add expense
    const addExpense = async (expense: Omit<Expense, 'id'>) => {
        if (!state.userId) throw new Error("Usuario no identificado");

        const date = new Date(expense.date);
        const { error } = await supabase.from('Gastos').insert({
            id_usuario: state.userId,
            id_tipo_gasto: expense.categoryId,
            monto: expense.amount,
            mes: date.getMonth() + 1,
            anio: date.getFullYear(),
            fecha_gasto: expense.date,
            descripcion: expense.description,
            es_recurrente: expense.isRecurring || false,
            tipo_recurrencia: expense.recurrenceType || null,
        });

        if (error) {
            console.error('Error adding expense:', error);
            throw error;
        }

        await refreshData();
    };

    // Delete expense
    const deleteExpense = async (id: string) => {
        const { error } = await supabase.from('Gastos').delete().eq('id_gasto', parseInt(id));
        if (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
        await refreshData();
    };

    // Add income category
    const addIncomeCategory = async (name: string) => {
        if (!state.userId) return null;
        const { data, error } = await supabase
            .from('TiposIngreso')
            .insert({ nombre_tipo: name, id_usuario: state.userId })
            .select()
            .single();

        if (error) {
            console.error('Error adding income category:', error);
            throw error;
        }
        await refreshData();
        return data;
    };

    // Add expense category
    const addExpenseCategory = async (name: string) => {
        if (!state.userId) return null;
        const { data, error } = await supabase
            .from('TiposGasto')
            .insert({ nombre_tipo: name, id_usuario: state.userId })
            .select()
            .single();

        if (error) {
            console.error('Error adding expense category:', error);
            throw error;
        }
        await refreshData();
        return data;
    };

    // Delete expense category
    const deleteExpenseCategory = async (id: number) => {
        if (!state.userId) return;

        try {
            const { error } = await supabase
                .from('TiposGasto')
                .delete()
                .eq('id_tipo_gasto', id)
                .eq('id_usuario', state.userId);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting expense category:', error);
            throw error;
        }

        await refreshData();
    };

    // Set budget
    const setBudget = async (categoryId: number, limit: number) => {
        if (!state.userId) return;

        // Check if budget exists for this category
        const { data: existing } = await supabase
            .from('Presupuestos')
            .select('id_presupuesto')
            .eq('id_usuario', state.userId)
            .eq('id_tipo_gasto', categoryId)
            .eq('mes', currentMonth)
            .eq('anio', currentYear)
            .single();

        if (existing) {
            // Update
            const { error } = await supabase
                .from('Presupuestos')
                .update({ monto: limit })
                .eq('id_presupuesto', existing.id_presupuesto);
            if (error) throw error;
        } else {
            // Insert
            const { error } = await supabase.from('Presupuestos').insert({
                id_usuario: state.userId,
                id_tipo_gasto: categoryId,
                monto: limit,
                mes: currentMonth,
                anio: currentYear,
            });
            if (error) throw error;
        }

        await refreshData();
    };

    // Set savings goal
    const setSavingsGoal = async (goal: number) => {
        if (!state.userId) return;

        const { error } = await supabase
            .from('Usuarios')
            .update({ meta_ahorro: goal })
            .eq('id_usuario', state.userId);

        if (error) throw error;
        setState(prev => ({ ...prev, savingsGoal: goal }));
    };

    // Set savings rate
    const setSavingsRate = async (rate: number) => {
        if (!state.userId) return;

        const { error } = await supabase
            .from('Usuarios')
            .update({ tasa_ahorro: rate })
            .eq('id_usuario', state.userId);

        if (error) throw error;
        setState(prev => ({ ...prev, savingsRate: rate }));
    };

    return (
        <FinanceContext.Provider value={{
            state,
            addIncome,
            deleteIncome,
            addExpense,
            deleteExpense,
            addIncomeCategory,
            addExpenseCategory,
            deleteExpenseCategory,
            setBudget,
            setSavingsGoal,
            setSavingsRate,
            setUserId,
            refreshData,
        }}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (!context) {
        throw new Error('useFinance must be used within FinanceProvider');
    }
    return context;
};
