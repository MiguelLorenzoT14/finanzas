import React, { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Skeleton from '../components/Skeleton';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, History, PiggyBank, Target } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { state } = useFinance();
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [notifiedCategories, setNotifiedCategories] = useState<Set<string>>(new Set());

    // Calculate totals
    const totalIncome = state.incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = state.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : '0';
    const savingsGoalProgress = state.savingsGoal > 0 ? Math.min((savings / state.savingsGoal) * 100, 100) : 0;

    // Spending by category
    const spendingByCategory = state.expenses.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {} as { [key: string]: number });

    // Check budgets and notify
    useEffect(() => {
        state.budgets.forEach((budget) => {
            const spent = spendingByCategory[budget.category] || 0;

            if (budget.limit > 0 && spent > budget.limit && !notifiedCategories.has(budget.category)) {
                showNotification(`¡Atención! Has excedido tu presupuesto en ${budget.category}.`, 'warning');
                setNotifiedCategories(prev => new Set(prev).add(budget.category));
            }
        });
    }, [state.expenses, state.budgets, spendingByCategory, notifiedCategories, showNotification]);

    // Prepare expense data for pie chart
    const expenseData = Object.entries(spendingByCategory).map(([name, value]) => ({
        name,
        value,
    }));

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

    // Monthly summary data for bar chart
    const monthlyData = [
        {
            name: 'Este Mes',
            Ingresos: totalIncome,
            Gastos: totalExpenses,
            Ahorro: Math.max(savings, 0),
        },
    ];

    // Recent Transactions (Limit 5)
    const allTransactions = [
        ...state.incomes.map(i => ({ ...i, type: 'income' as const })),
        ...state.expenses.map(e => ({ ...e, type: 'expense' as const }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    const userName = user?.username || 'Usuario';

    if (state.loading) {
        return (
            <div className="dashboard-container">
                <div className="welcome-header">
                    <Skeleton width="300px" height="2.5rem" className="mb-sm" />
                    <Skeleton width="450px" height="1.2rem" />
                </div>
                <div className="summary-cards">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="summary-card">
                            <Skeleton height="80px" borderRadius="12px" />
                        </div>
                    ))}
                </div>
                <div className="charts-section">
                    <div className="chart-card">
                        <Skeleton height="300px" borderRadius="12px" />
                    </div>
                    <div className="chart-card">
                        <Skeleton height="300px" borderRadius="12px" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Welcome Header */}
            <div className="welcome-header animate-fade-in">
                <div>
                    <h1>Bienvenido, {userName} 👋</h1>
                    <p className="subtitle">Aquí está el resumen de tus finanzas este mes.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card income-card card-glass animate-slide-up delay-1">
                    <div className="card-icon">
                        <ArrowUpRight size={24} />
                    </div>
                    <div className="card-content">
                        <div className="card-title">Ingresos Totales</div>
                        <div className="card-amount">S/ {totalIncome.toLocaleString()}</div>
                    </div>
                </div>

                <div className="summary-card expense-card card-glass animate-slide-up delay-2">
                    <div className="card-icon">
                        <ArrowDownRight size={24} />
                    </div>
                    <div className="card-content">
                        <div className="card-title">Gastos Totales</div>
                        <div className="card-amount">S/ {totalExpenses.toLocaleString()}</div>
                    </div>
                </div>

                <div className="summary-card savings-card card-glass animate-slide-up delay-3">
                    <div className="card-icon">
                        <PiggyBank size={24} />
                    </div>
                    <div className="card-content">
                        <div className="card-title">Ahorro Mensual</div>
                        <div className="card-amount">S/ {savings.toLocaleString()}</div>
                        <div className="card-subtitle">{savingsRate}% de tus ingresos</div>
                    </div>
                </div>
            </div>

            {/* Savings Goal Progress */}
            {state.savingsGoal > 0 && (
                <div className="goal-progress-card animate-fade-in delay-4">
                    <div className="goal-header">
                        <div className="goal-icon">
                            <Target size={20} />
                        </div>
                        <div>
                            <h3>Progreso hacia tu meta</h3>
                            <p>Meta: S/ {state.savingsGoal.toLocaleString()}</p>
                        </div>
                        <div className="goal-percentage">{savingsGoalProgress.toFixed(0)}%</div>
                    </div>
                    <div className="goal-bar">
                        <div
                            className="goal-bar-fill"
                            style={{ width: `${savingsGoalProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="charts-section animate-fade-in delay-5">
                <div className="chart-card card-glass">
                    <h3>Resumen Mensual</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                            data={monthlyData}
                            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="name" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => [`S/ ${(value || 0).toLocaleString()}`, '']}
                            />
                            <Legend />
                            <Bar dataKey="Ingresos" fill="#10b981" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="Gastos" fill="#ef4444" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="Ahorro" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card card-glass">
                    <h3>Gastos por Categoría</h3>
                    {expenseData.length === 0 ? (
                        <div className="empty-chart">
                            <Wallet size={48} strokeWidth={1} />
                            <p>No hay gastos registrados</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={expenseData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {expenseData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value) => [`S/ ${(value || 0).toLocaleString()}`, '']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="recent-transactions animate-fade-in delay-5">
                <h3>
                    <History size={20} /> Transacciones Recientes
                </h3>
                {allTransactions.length === 0 ? (
                    <p className="empty-state">No hay movimientos recientes.</p>
                ) : (
                    <div className="transaction-list">
                        {allTransactions.map((t, index) => (
                            <div key={t.id} className="transaction-item card-glass animate-slide-in-right" style={{ animationDelay: `${0.6 + index * 0.1}s` }}>
                                <div className="transaction-info">
                                    <div className={`transaction-icon ${t.type}`}>
                                        {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                    </div>
                                    <div>
                                        <div className="transaction-desc">{t.description}</div>
                                        <div className="transaction-meta">{t.category} • {new Date(t.date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className={`transaction-amount ${t.type}`}>
                                    {t.type === 'income' ? '+' : '-'} S/ {t.amount.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
