import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';
import Skeleton from '../components/Skeleton';
import { Plus, Trash2, Calendar, Coins, Tag, FileText, RefreshCw, Loader } from 'lucide-react';
import './Income.css';

const Income = () => {
    const { state, addIncome, deleteIncome, addIncomeCategory } = useFinance();
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
        if (state.incomeCategories.length > 0 && categoryId === null) {
            setCategoryId(state.incomeCategories[0].id_tipo_ingreso);
        }
    }, [state.incomeCategories, categoryId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description || !categoryId) return;

        setSubmitting(true);

        try {
            // Handle new category
            let finalCategoryId = categoryId;
            if (showNewCategoryInput && newCategory) {
                await addIncomeCategory(newCategory);
                // After adding, get the new category ID
                const newCat = state.incomeCategories.find(c => c.nombre_tipo === newCategory);
                if (newCat) finalCategoryId = newCat.id_tipo_ingreso;
            }

            const selectedCategory = state.incomeCategories.find(c => c.id_tipo_ingreso === finalCategoryId);

            await addIncome({
                amount: parseFloat(amount),
                description,
                date,
                category: selectedCategory?.nombre_tipo || '',
                categoryId: finalCategoryId,
                isRecurring,
                recurrenceType: isRecurring ? recurrenceType : undefined,
            });

            showNotification('Ingreso registrado correctamente', 'success');

            // Reset form
            setAmount('');
            setDescription('');
            setNewCategory('');
            setShowNewCategoryInput(false);
            setIsRecurring(false);
        } catch (error) {
            showNotification('Error al registrar ingreso', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este ingreso?')) {
            try {
                await deleteIncome(id);
                showNotification('Ingreso eliminado', 'success');
            } catch (error) {
                showNotification('Error al eliminar ingreso', 'error');
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
                <h1>Gestión de Ingresos</h1>
                <p className="subtitle">Registra y administra tus fuentes de dinero.</p>
            </div>

            <div className="form-card animate-slide-up">
                <h3>Nuevo Ingreso</h3>
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
                                    {state.incomeCategories.map((cat) => (
                                        <option key={cat.id_tipo_ingreso} value={cat.id_tipo_ingreso}>
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
                                placeholder="Ej: Bono de ventas"
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
                            <span>Ingreso recurrente</span>
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

                    <button type="submit" className="submit-btn" disabled={submitting}>
                        {submitting ? (
                            <>
                                <Loader className="spinner" size={20} /> Guardando...
                            </>
                        ) : (
                            <>
                                <Plus size={20} /> Registrar Ingreso
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="history-section animate-fade-in delay-2">
                <h3>Historial de Ingresos</h3>
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
                            {state.incomes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="empty-state">No hay ingresos registrados este mes</td>
                                </tr>
                            ) : (
                                state.incomes.map((income, index) => (
                                    <tr key={income.id} className="animate-slide-in-right" style={{ animationDelay: `${0.3 + index * 0.05}s` }}>
                                        <td>{new Date(income.date).toLocaleDateString()}</td>
                                        <td>{income.description}</td>
                                        <td>
                                            <span className="category-badge income">
                                                {income.category}
                                            </span>
                                        </td>
                                        <td className="amount-cell positive">+ S/ {income.amount.toLocaleString()}</td>
                                        <td>
                                            {income.isRecurring ? (
                                                <span className="recurring-badge">
                                                    <RefreshCw size={12} />
                                                    {income.recurrenceType === 'weekly' ? 'Semanal' :
                                                        income.recurrenceType === 'monthly' ? 'Mensual' : 'Anual'}
                                                </span>
                                            ) : (
                                                <span className="one-time-badge">Único</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(income.id)}
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

export default Income;
