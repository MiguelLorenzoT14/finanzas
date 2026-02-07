import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';
import Skeleton from '../components/Skeleton';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { Target, TrendingUp, PiggyBank, Loader, Save } from 'lucide-react';
import './Savings.css';

const Savings = () => {
    const { state, setSavingsGoal, setSavingsRate } = useFinance();
    const { showNotification } = useNotification();
    const [projectedMonths, setProjectedMonths] = useState(12);
    const [editingGoal, setEditingGoal] = useState(false);
    const [newGoal, setNewGoal] = useState('');
    const [saving, setSaving] = useState(false);

    // Calculate current financials
    const totalIncome = state.incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = state.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const currentSavings = totalIncome - totalExpenses;

    // Savings Goal & Rate from context or safe defaults
    const goal = state.savingsGoal || 10000;
    const rate = state.savingsRate || 20;

    // Calculate recommended savings based on rate
    const recommendedSavings = (totalIncome * rate) / 100;
    const savingsPercent = totalIncome > 0 ? ((currentSavings / totalIncome) * 100).toFixed(1) : '0';

    // Adjust savings rate handler
    const handleRateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newRate = parseInt(e.target.value);
        try {
            await setSavingsRate(newRate);
        } catch (error) {
            showNotification('Error al actualizar tasa de ahorro', 'error');
        }
    };

    const handleSaveGoal = async () => {
        const goalValue = parseFloat(newGoal);
        if (!isNaN(goalValue) && goalValue >= 0) {
            setSaving(true);
            try {
                await setSavingsGoal(goalValue);
                showNotification('Meta de ahorro actualizada', 'success');
                setEditingGoal(false);
            } catch (error) {
                showNotification('Error al guardar meta', 'error');
            } finally {
                setSaving(false);
            }
        }
    };

    // Generate projection data
    const generateProjectionData = () => {
        const data = [];
        let accumulatedSavings = 0;
        const monthlySavingAmount = currentSavings > 0 ? currentSavings : 0;

        for (let i = 0; i <= projectedMonths; i++) {
            data.push({
                month: `Mes ${i}`,
                ahorro: accumulatedSavings,
                meta: goal,
            });
            accumulatedSavings += monthlySavingAmount;
        }
        return data;
    };

    const projectionData = generateProjectionData();

    if (state.loading) {
        return (
            <div className="savings-container">
                <div className="header-mb">
                    <Skeleton width="300px" height="2.5rem" className="mb-sm" />
                    <Skeleton width="450px" height="1.2rem" />
                </div>
                <div className="savings-summary">
                    <Skeleton height="200px" borderRadius="12px" />
                    <Skeleton height="200px" borderRadius="12px" />
                </div>
                <div className="projection-chart">
                    <Skeleton height="400px" borderRadius="12px" />
                </div>
            </div>
        );
    }

    return (
        <div className="savings-container animate-fade-in">
            <div className="header-mb">
                <h1>Plan de Ahorro</h1>
                <p className="subtitle">Visualiza y planifica tu futuro financiero.</p>
            </div>

            <div className="savings-summary">
                <div className="savings-card-large animate-slide-up">
                    <div className="savings-card-header">
                        <PiggyBank size={24} />
                        <span>Capacidad de Ahorro Actual</span>
                    </div>
                    <div className="savings-amount-large">
                        S/ {currentSavings.toLocaleString()}
                    </div>
                    <p className="savings-subtitle">Mensual (Ingresos - Gastos)</p>

                    <div className="savings-stats">
                        <div className="stat-item">
                            <span className="stat-value">{savingsPercent}%</span>
                            <span className="stat-label">Tasa de Ahorro Real</span>
                        </div>
                        <div className="stat-item">
                            {editingGoal ? (
                                <div className="edit-goal-inline">
                                    <input
                                        type="number"
                                        value={newGoal}
                                        onChange={(e) => setNewGoal(e.target.value)}
                                        placeholder={goal.toString()}
                                        className="goal-input"
                                        autoFocus
                                    />
                                    <button onClick={handleSaveGoal} disabled={saving} className="save-goal-btn">
                                        {saving ? <Loader className="spinner" size={16} /> : <Save size={16} />}
                                    </button>
                                </div>
                            ) : (
                                <span
                                    className="stat-value editable"
                                    onClick={() => { setEditingGoal(true); setNewGoal(goal.toString()); }}
                                    title="Clic para editar"
                                >
                                    S/ {goal.toLocaleString()}
                                </span>
                            )}
                            <span className="stat-label">Meta Anual</span>
                        </div>
                    </div>
                </div>

                <div className="calculator-card animate-slide-up delay-1">
                    <h3>Calculadora de Ahorro</h3>
                    <p className="calculator-subtitle">Ajusta tu porcentaje ideal de ahorro.</p>

                    <div className="rate-slider-section">
                        <div className="rate-header">
                            <span>Meta: {rate}%</span>
                            <span className="rate-value">S/ {recommendedSavings.toLocaleString()}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            value={rate}
                            onChange={handleRateChange}
                            className="range-slider"
                        />
                        <div className="rate-labels">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                        </div>
                    </div>

                    <div className="recommendation-box">
                        <h4>
                            <Target size={16} /> Recomendación
                        </h4>
                        <p>
                            {currentSavings >= recommendedSavings ? (
                                <span className="status-good">
                                    ¡Excelente! Estás ahorrando más de tu objetivo del {rate}%.
                                </span>
                            ) : (
                                <span className="status-warning">
                                    Estás por debajo de tu objetivo. Intenta reducir gastos en S/ {(recommendedSavings - currentSavings).toLocaleString()}.
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="projection-chart animate-fade-in delay-2">
                <div className="projection-header">
                    <h3>
                        <TrendingUp size={20} /> Proyección a {projectedMonths} Meses
                    </h3>
                    <select
                        value={projectedMonths}
                        onChange={(e) => setProjectedMonths(parseInt(e.target.value))}
                        className="months-select"
                    >
                        <option value="6">6 Meses</option>
                        <option value="12">1 Año</option>
                        <option value="24">2 Años</option>
                        <option value="60">5 Años</option>
                    </select>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={projectionData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="month" stroke="#888" hide={projectedMonths > 12} />
                        <YAxis stroke="#888" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => [`S/ ${(value || 0).toLocaleString()}`, 'Ahorro Acumulado']}
                        />
                        <Line
                            type="monotone"
                            dataKey="ahorro"
                            stroke="var(--color-primary)"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 8 }}
                        />
                        <ReferenceLine y={goal} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Meta', fill: '#ef4444', position: 'right' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Savings Tips Section */}
            <div className="tips-section animate-fade-in delay-3">
                <div className="tips-card">
                    <h3>💡 Consejos de Ahorro</h3>
                    <ul className="tips-list">
                        <li>
                            <strong>Regla 50/30/20:</strong> Destina el 20% de tus ingresos directamente a ahorros.
                        </li>
                        <li>
                            <strong>Fondo de Emergencia:</strong> Intenta tener guardado de 3 a 6 meses de gastos básicos.
                        </li>
                        <li>
                            <strong>Automatiza:</strong> Configura transferencias automáticas a tu cuenta de ahorros.
                        </li>
                        <li>
                            <strong>Reduce Gastos Hormiga:</strong> Pequeños gastos diarios pueden sumar una gran cantidad al mes.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Savings;
