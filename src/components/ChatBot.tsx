import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { supabase } from '../lib/supabase';
import Groq from 'groq-sdk';
import './ChatBot.css';

// Obtener la API Key desde las variables de entorno
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: '¡Hola! Soy tu asistente financiero de Finanzas Pro. ¿En qué puedo ayudarte hoy?',
            timestamp: new Date()
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { state } = useFinance();
    const { userId } = state;

    // --- AI TOOLS CONFIGURATION ---
    const getFinanceTools = () => {
        return [
            {
                type: "function",
                function: {
                    name: "get_financial_summary",
                    description: "Obtiene un resumen de ingresos y gastos totales del usuario.",
                    parameters: { type: "object", properties: {}, required: [] },
                },
            },
            {
                type: "function",
                function: {
                    name: "get_monthly_details",
                    description: "Obtiene el detalle de ingresos y gastos de un mes y año específicos. Útil para calcular ahorros del mes (Ingresos - Gastos).",
                    parameters: {
                        type: "object",
                        properties: {
                            month: { type: "integer", description: "Número del mes (1-12)" },
                            year: { type: "integer", description: "Año (ej. 2024)" }
                        },
                        required: ["month", "year"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "get_savings_info",
                    description: "Obtiene información sobre la meta de ahorro y tasa de ahorro del usuario.",
                    parameters: { type: "object", properties: {}, required: [] },
                }
            }
        ];
    };

    // --- TOOL EXECUTORS ---
    const executeTool = async (functionName: string, args: any) => {
        if (!userId) {
            return { error: "Usuario no identificado." };
        }

        try {
            switch (functionName) {
                case "get_financial_summary": {
                    const { data: incomes } = await supabase.from('Ingresos').select('monto').eq('id_usuario', userId);
                    const { data: expenses } = await supabase.from('Gastos').select('monto').eq('id_usuario', userId);
                    const totalIncomes = incomes?.reduce((acc, curr) => acc + Number(curr.monto), 0) || 0;
                    const totalExpenses = expenses?.reduce((acc, curr) => acc + Number(curr.monto), 0) || 0;
                    return { totalIncomes, totalExpenses, balance: totalIncomes - totalExpenses };
                }
                case "get_monthly_details": {
                    const month = Number(args.month);
                    const year = Number(args.year);
                    if (isNaN(month) || isNaN(year)) return { error: "Mes o año inválidos." };
                    const { data: incomes } = await supabase.from('Ingresos').select('monto, descripcion, fecha_ingreso').eq('id_usuario', userId).eq('mes', month).eq('anio', year);
                    const { data: expenses } = await supabase.from('Gastos').select('monto, descripcion, fecha_gasto').eq('id_usuario', userId).eq('mes', month).eq('anio', year);
                    return { incomes: incomes || [], expenses: expenses || [], month, year };
                }
                case "get_savings_info": {
                    const { data } = await supabase.from('Usuarios').select('meta_ahorro, tasa_ahorro').eq('id_usuario', userId).single();
                    return data || { meta_ahorro: 0, tasa_ahorro: 20 };
                }
                default:
                    return { error: "Función no encontrada o acción no permitida. Este sistema es solo de CONSULTA. Si deseas calcular ahorros, pídeme que revise tus ingresos y gastos del mes." };
            }
        } catch (e: any) {
            console.error('Error inside executeTool:', e);
            return { error: e.message || "Error ejecutando la consulta." };
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        if (!GROQ_API_KEY || GROQ_API_KEY === 'gsk_tukey_here') {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Error: La API Key de Groq no está configurada correctamente en el archivo .env.',
                timestamp: new Date()
            }]);
            return;
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const groq = new Groq({
                apiKey: GROQ_API_KEY,
                dangerouslyAllowBrowser: true
            });

            // Preparar historial de mensajes para la API
            const history = messages.filter(m => m.id !== '1').map(m => ({
                role: m.role as 'user' | 'assistant' | 'system',
                content: m.content
            }));

            // Añadir el mensaje actual
            history.push({ role: 'user', content: userMessage.content });

            // Añadir instrucción del sistema
            const systemMessage = {
                role: 'system',
                content: `Eres un asistente de finanzas personales llamado FinanzasAI. 
                Hoy es ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                Tu objetivo es ayudar al usuario a entender sus finanzas usando las herramientas disponibles.
                IMPORTANTE: Responde SIEMPRE de forma BREVE, DIRECTA y CONCISA. Ve directo a la respuesta.
                NO USES TABLAS NI FORMATOS COMPLEJOS. Di las cosas como texto seguido. Ejemplo: "Tus ingresos de este mes son S/ X provenientes de Y".
                NOTA IMPORTANTE: La moneda oficial es SOLES (S/). Usa siempre S/.
                CRÍTICO: NO puedes crear, editar ni eliminar datos. Solo puedes CONSULTAR información. Si el usuario pide cambiar algo, dile amablemente que no tienes permisos de escritura.
                CÁLCULO DE AHORRO: Si el usuario pregunta "cuánto voy ahorrando este mes", usa 'get_monthly_details' para el mes actual, suma los ingresos, resta los gastos, y dile el resultado.`
            };

            const fullMessages = [systemMessage, ...history];

            let completion = await groq.chat.completions.create({
                messages: fullMessages as any,
                model: "openai/gpt-oss-120b",
                tools: getFinanceTools() as any,
                tool_choice: "auto"
            });

            let responseMessage = completion.choices[0].message;
            let toolCalls = responseMessage.tool_calls;

            if (toolCalls) {
                // Si la IA decide llamar a herramientas
                const toolMessages = [...fullMessages, responseMessage]; // Añadir la respuesta original con tool_calls al historial

                for (const toolCall of toolCalls) {
                    const functionName = toolCall.function.name;
                    const functionArgs = JSON.parse(toolCall.function.arguments);

                    console.log('IA calling tool:', functionName, functionArgs);
                    const toolResult = await executeTool(functionName, functionArgs);
                    console.log('Tool result:', toolResult);

                    toolMessages.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: functionName,
                        content: JSON.stringify(toolResult),
                    } as any);
                }

                // Segunda llamada a la IA con los resultados de las herramientas
                const secondResponse = await groq.chat.completions.create({
                    messages: toolMessages as any,
                    model: "openai/gpt-oss-120b"
                });

                responseMessage = secondResponse.choices[0].message;
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseMessage.content || "Lo siento, no pude generar una respuesta.",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error: any) {
            console.error('Error detail in AI Chat:', error);

            let errorMessage = 'Lo siento, tuve un problema al procesar los datos.';
            if (error.status === 401) {
                errorMessage = 'Error de autenticación con Groq. Verifica la API Key.';
            } else if (error.message) {
                errorMessage = `Error: ${error.message}`;
            }

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: errorMessage,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">
                                <Bot size={22} />
                            </div>
                            <div className="chatbot-info-text">
                                <h3>FinanzasAI</h3>
                                <div className="chatbot-status">
                                    <div className="chatbot-status-dot" />
                                    <span>Asistente Inteligente</span>
                                </div>
                            </div>
                        </div>
                        <Sparkles size={18} style={{ opacity: 0.8 }} />
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                                <div className={`message-avatar ${msg.role}`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className="message-bubble">
                                    {msg.content}
                                    <div className="message-time">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message assistant">
                                <div className="message-avatar assistant">
                                    <Bot size={16} />
                                </div>
                                <div className="message-bubble">
                                    <Loader2 className="spinner" size={18} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input-area">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="chatbot-input-wrapper"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Pregúntame algo..."
                                className="chatbot-input"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="chatbot-send"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
