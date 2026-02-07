import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';
import Skeleton from '../components/Skeleton';
import { Plus, Trash2, Calendar, Coins, Tag, FileText, RefreshCw, Loader } from 'lucide-react';
import './Income.css'; // Reusing styles

const Expenses = () => {
    const { state, addExpense, deleteExpense, addExpenseCategory } = useFinance();
    const { showNotification } = useNotification();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [newCategory, setNewCategory] = useState('');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceType, setRecurrenceType] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
    const [submitting, setSubmitting] = useState(false);

    // Set default category when categories load
    React.useEffect(() => {
        if (state.expenseCategories.length > 0 && categoryId === null) {
            setCategoryId(state.expenseCategories[0].id_tipo_gasto);
        }
    }, [state.expenseCategories, categoryId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description) return;

        // Si no estamos creando una categoría, debe haber una seleccionada
        if (!showNewCategoryInput && !categoryId) return;

        setSubmitting(true);

        try {
            // Handle new category
            let finalCategoryId = categoryId;
            let finalCategoryName = '';

            if (showNewCategoryInput && newCategory) {
                const newCatData = await addExpenseCategory(newCategory);
                if (newCatData) {
                    finalCategoryId = newCatData.id_tipo_gasto;
                    finalCategoryName = newCatData.nombre_tipo;
                } else {
                    throw new Error("Error al crear la categoría");
                }
            } else {
                const selectedCategory = state.expenseCategories.find(c => c.id_tipo_gasto === categoryId);
                if (selectedCategory) {
                    finalCategoryName = selectedCategory.nombre_tipo;
                }
            }

            if (!finalCategoryId) throw new Error("Categoría no identificada");

            await addExpense({
                amount: parseFloat(amount),
                description,
                date,
                category: finalCategoryName,
                categoryId: finalCategoryId,
                isRecurring,
                recurrenceType: isRecurring ? recurrenceType : undefined,
            });

            showNotification('Gasto registrado correctamente', 'success');

            // Reset form
            setAmount('');
            setDescription('');
            setNewCategory('');
            setShowNewCategoryInput(false);
            setIsRecurring(false);
        } catch (error) {
            showNotification('Error al registrar gasto', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este gasto?')) {
            try {
                await deleteExpense(id);
                showNotification('Gasto eliminado', 'success');
            } catch (error) {
                showNotification('Error al eliminar gasto', 'error');
            }
        }
    };

    if (state.loading) {
        return (
            <div className="income-container">
                <div className="page-header">
                    <Skeleton width="300px" height="2.5rem" className="mb-sm" />
                    <Skeleton width="450px" height="1.2rem" />
                </div>
                <div className="form-card">
                    <Skeleton height="350px" borderRadius="12px" />
                </div>
                <div className="history-section">
                    <Skeleton height="400px" borderRadius="12px" />
                </div>
            </div>
        );
    }

    return (
        <div className="income-container">
            <div className="page-header animate-fade-in">
                <h1>Gestión de Gastos</h1>
                <p className="subtitle">Controla tus salidas de dinero.</p>
            </div>

            <div className="form-card expense-form animate-slide-up">
                <h3>Nuevo Gasto</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">
                                <Coins size={16} /> Monto
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Tag size={16} /> Categoría
                            </label>
                            {!showNewCategoryInput ? (
                                <select
                                    value={categoryId || ''}
                                    onChange={(e) => {
                                        if (e.target.value === 'new') {
                                            setShowNewCategoryInput(true);
                                        } else {
                                            setCategoryId(parseInt(e.target.value));
                                        }
                                    }}
                                    required
                                >
                                    <option value="" disabled>Selecciona categoría</option>
                                    {state.expenseCategories.map((cat) => (
                                        <option key={cat.id_tipo_gasto} value={cat.id_tipo_gasto}>
                                            {cat.nombre_tipo}
                                        </option>
                                    ))}
                                    <option value="new">+ Nueva Categoría</option>
                                </select>
                            ) : (
                                <div className="new-category-input">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="Nueva categoría"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCategoryInput(false)}
                                        className="btn-secondary"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Calendar size={16} /> Fecha
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <FileText size={16} /> Descripción
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ej: Alquiler mes Octubre"
                                required
                            />
                        </div>
                    </div>

                    {/* Recurring option */}
                    <div className="recurring-section">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                            />
                            <RefreshCw size={16} />
                            <span>Gasto recurrente</span>
                        </label>

                        {isRecurring && (
                            <select
                                value={recurrenceType}
                                onChange={(e) => setRecurrenceType(e.target.value as 'weekly' | 'monthly' | 'yearly')}
                                className="recurrence-select"
                            >
                                <option value="weekly">Semanal</option>
                                <option value="monthly">Mensual</option>
                                <option value="yearly">Anual</option>
                            </select>
                        )}
                    </div>

                    <button type="submit" className="submit-btn expense-btn" disabled={submitting}>
                        {submitting ? (
                            <>
                                <Loader className="spinner" size={20} /> Guardando...
                            </>
                        ) : (
                            <>
                                <Plus size={20} /> Registrar Gasto
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="history-section animate-fade-in delay-2">
                <h3>Historial de Gastos</h3>
                <div className="table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Descripción</th>
                                <th>Categoría</th>
                                <th>Monto</th>
                                <th>Tipo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="empty-state">No hay gastos registrados este mes</td>
                                </tr>
                            ) : (
                                state.expenses.map((expense, index) => (
                                    <tr key={expense.id} className="animate-slide-in-right" style={{ animationDelay: `${0.3 + index * 0.05}s` }}>
                                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                                        <td>{expense.description}</td>
                                        <td>
                                            <span className="category-badge expense">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="amount-cell negative">- S/ {expense.amount.toLocaleString()}</td>
                                        <td>
                                            {expense.isRecurring ? (
                                                <span className="recurring-badge">
                                                    <RefreshCw size={12} />
                                                    {expense.recurrenceType === 'weekly' ? 'Semanal' :
                                                        expense.recurrenceType === 'monthly' ? 'Mensual' : 'Anual'}
                                                </span>
                                            ) : (
                                                <span className="one-time-badge">Único</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(expense.id)}
                                                className="delete-btn"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Expenses;
