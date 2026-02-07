import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';
import Skeleton from '../components/Skeleton';
import { Edit2, Loader, Plus, Trash2, X } from 'lucide-react';
import './Budgets.css';

const Budgets = () => {
    const { state, setBudget, addExpenseCategory, deleteExpenseCategory } = useFinance();
    const { showNotification } = useNotification();
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [newBudgetAmount, setNewBudgetAmount] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Calculate spending per category
    const spendingByCategory = state.expenses.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {} as { [key: string]: number });

    // Create a map of category ID to budget
    const budgetByCategory = state.budgets.reduce((acc, budget) => {
        acc[budget.categoryId] = budget;
        return acc;
    }, {} as { [key: number]: typeof state.budgets[0] });

    const handleEditClick = (categoryId: number, currentBudget: number) => {
        setEditingCategoryId(categoryId);
        setNewBudgetAmount(currentBudget ? currentBudget.toString() : '');
    };

    const handleSaveBudget = async (categoryId: number) => {
        const amount = parseFloat(newBudgetAmount);
        if (!isNaN(amount) && amount >= 0) {
            setSaving(true);
            try {
                await setBudget(categoryId, amount);
                showNotification('Presupuesto actualizado', 'success');
            } catch (error) {
                showNotification('Error al guardar presupuesto', 'error');
            } finally {
                setSaving(false);
            }
        }
        setEditingCategoryId(null);
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            showNotification('Ingresa un nombre para la categoría', 'error');
            return;
        }

        setSaving(true);
        try {
            await addExpenseCategory(newCategoryName.trim());
            showNotification('Categoría agregada exitosamente', 'success');
            setNewCategoryName('');
            setShowAddCategory(false);
        } catch (error) {
            showNotification('Error al agregar categoría', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCategory = async (id: number, name: string) => {
        if (deletingId === id) {
            // Confirm delete
            try {
                await deleteExpenseCategory(id);
                showNotification(`Categoría "${name}" eliminada`, 'success');
            } catch (error) {
                showNotification('Error al eliminar categoría', 'error');
            }
            setDeletingId(null);
        } else {
            // First click - show confirm
            setDeletingId(id);
            setTimeout(() => setDeletingId(null), 3000); // Reset after 3 seconds
        }
    };

    const getProgressColor = (percent: number) => {
        if (percent >= 100) return 'var(--color-danger)';
        if (percent >= 80) return 'var(--color-warning)';
        return 'var(--color-success)';
    };

    const getStatusClass = (percent: number) => {
        if (percent >= 100) return 'status-danger';
        if (percent >= 80) return 'status-warning';
        return 'status-safe';
    };

    if (state.loading) {
        return (
            <div className="budget-container">
                <div className="header-mb">
                    <Skeleton width="400px" height="2.5rem" className="mb-sm" />
                    <Skeleton width="550px" height="1.2rem" />
                </div>
                <div className="budget-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="budget-card">
                            <Skeleton height="150px" borderRadius="12px" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="budget-container">
            <div className="header-mb animate-fade-in">
                <div className="header-row">
                    <div>
                        <h1>Presupuestos Mensuales</h1>
                        <p className="subtitle">Establece límites para cada categoría y controla tus gastos.</p>
                    </div>
                    <button
                        className="add-category-btn"
                        onClick={() => setShowAddCategory(true)}
                    >
                        <Plus size={20} />
                        <span>Nueva Categoría</span>
                    </button>
                </div>
            </div>

            {/* Add Category Modal */}
            {showAddCategory && (
                <div className="add-category-modal animate-scale-in">
                    <div className="modal-header">
                        <h3>Nueva Categoría de Gasto</h3>
                        <button className="close-modal-btn" onClick={() => setShowAddCategory(false)}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className="modal-body">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nombre de la categoría"
                            className="category-input"
                            autoFocus
                        />
                        <button
                            className="save-category-btn"
                            onClick={handleAddCategory}
                            disabled={saving}
                        >
                            {saving ? <Loader className="spinner" size={18} /> : 'Agregar Categoría'}
                        </button>
                    </div>
                </div>
            )}

            <div className="budget-grid">
                {state.expenseCategories.map((category, index) => {
                    const categoryBudget = budgetByCategory[category.id_tipo_gasto];
                    const budget = categoryBudget?.limit || 0;
                    const spent = spendingByCategory[category.nombre_tipo] || 0;
                    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                    const remaining = Math.max(0, budget - spent);
                    const isOverBudget = spent > budget && budget > 0;

                    return (
                        <div key={category.id_tipo_gasto} className="budget-card animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                            <div className="budget-header">
                                <span className="budget-category">{category.nombre_tipo}</span>
                                <div className="budget-actions">
                                    <button
                                        className="budget-edit-btn"
                                        onClick={() => handleEditClick(category.id_tipo_gasto, budget)}
                                        title="Editar Presupuesto"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    {category.id_usuario && (
                                        <button
                                            className={`budget-delete-btn ${deletingId === category.id_tipo_gasto ? 'confirm' : ''}`}
                                            onClick={() => handleDeleteCategory(category.id_tipo_gasto, category.nombre_tipo)}
                                            title={deletingId === category.id_tipo_gasto ? 'Click para confirmar' : 'Eliminar Categoría'}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {editingCategoryId === category.id_tipo_gasto ? (
                                <div className="set-budget-modal animate-fade-in">
                                    <div className="form-group">
                                        <label className="form-label">Nuevo Límite</label>
                                        <input
                                            type="number"
                                            value={newBudgetAmount}
                                            onChange={(e) => setNewBudgetAmount(e.target.value)}
                                            className="budget-input"
                                            autoFocus
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="set-budget-actions">
                                        <button
                                            className="save-budget-btn"
                                            onClick={() => handleSaveBudget(category.id_tipo_gasto)}
                                            disabled={saving}
                                        >
                                            {saving ? <Loader className="spinner" size={16} /> : 'Guardar'}
                                        </button>
                                        <button
                                            className="cancel-budget-btn"
                                            onClick={() => setEditingCategoryId(null)}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="budget-progress-container">
                                        <div
                                            className={`budget-progress-bar ${percentage >= 80 ? 'pulse-subtle' : ''}`}
                                            style={{
                                                width: `${Math.min(percentage, 100)}%`,
                                                backgroundColor: getProgressColor(percentage)
                                            }}
                                        />
                                    </div>

                                    <div className="budget-info">
                                        <span>Gastado: <b>S/ {spent.toLocaleString()}</b></span>
                                        <span>Límite: <b className="budget-amount">S/ {budget.toLocaleString()}</b></span>
                                    </div>

                                    <div className="budget-footer">
                                        <span className={`budget-status ${getStatusClass(percentage)}`}>
                                            {budget === 0 ? 'Sin límite definido' :
                                                isOverBudget ? 'Excedido' :
                                                    percentage >= 80 ? 'Cerca del límite' : 'En rango'}
                                        </span>
                                        <span className="budget-remaining">
                                            Restante: <span style={{ color: remaining === 0 && budget > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                                                S/ {remaining.toLocaleString()}
                                            </span>
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Budgets;
