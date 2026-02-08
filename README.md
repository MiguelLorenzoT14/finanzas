# 💰 Finanzas AI - Personal Finance Management / Gestión de Finanzas Personales

![Dashboard Finanzas](./images/captura%20dashboard%20finanzas.png)

### 🤖 Smart Financial Management with Finanzas AI / Gestión Financiera Inteligente con Finanzas AI
*English below* | *Español abajo*

---

## 🇺🇸 English

Take control of your money with real-time insights and personalized AI-driven advice.

![Finanzas AI Chat](./images/captura%20con%20finanzasAI.png)

**Finanzas AI** is a state-of-the-art personal finance application designed to provide a premium user experience while helping you take control of your financial life. Built with a modern tech stack and integrated with artificial intelligence for smart financial insights.

### ✨ Features

- **📊 Dynamic Dashboard**: Get a bird's-eye view of your finances with beautiful, interactive charts powered by Recharts.
- **💸 Expense & Income Tracking**: Register every transaction with ease. Categorize your spending to understand where your money goes.
- **🤖 AI Financial Assistant**: Chat with an intelligent bot powered by **Groq** to get advice, summaries of your spending, and financial tips.
- **📅 Budgeting**: Set monthly budgets for different categories and track your progress in real-time.
- **🏦 Savings Goals**: Plan for the future by setting and monitoring savings objectives.
- **🔒 Secure Authentication**: Integrated with **Supabase Auth** to keep your financial data private and secure.
- **🖥️ Desktop Experience**: Built as an **Electron** app for a seamless desktop experience, while maintaining the flexibility of a web application.
- **🎨 Premium UI/UX**: Designed with a focus on aesthetics, featuring smooth animations, glassmorphism elements, and a choice between dark and light modes.

### 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Desktop Wrapper**: [Electron](https://www.electronjs.org/)
- **Backend Service**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **AI Integration**: [Groq SDK](https://groq.com/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS with modern custom properties.

---

## 🇪🇸 Español

Toma el control de tu dinero con información en tiempo real y asesoramiento personalizado impulsado por IA.

![Finanzas AI Chat](./images/captura%20con%20finanzasAI.png)

**Finanzas AI** es una aplicación de finanzas personales de última generación diseñada para ofrecer una experiencia de usuario premium mientras te ayuda a tomar el control de tu vida financiera. Construida con un stack tecnológico moderno e integrada con inteligencia artificial para obtener análisis financieros inteligentes.

### ✨ Características

- **📊 Dashboard Dinámico**: Obtén una vista panorámica de tus finanzas con gráficos hermosos e interactivos impulsados por Recharts.
- **💸 Seguimiento de Gastos e Ingresos**: Registra cada transacción con facilidad. Categoriza tus gastos para entender a dónde va tu dinero.
- **🤖 Asistente Financiero IA**: Chatea con un bot inteligente impulsado por **Groq** para obtener consejos, resúmenes de tus gastos y tips financieros.
- **📅 Presupuestos**: Establece presupuestos mensuales para diferentes categorías y sigue tu progreso en tiempo real.
- **🏦 Metas de Ahorro**: Planifica el futuro estableciendo y monitoreando objetivos de ahorro.
- **🔒 Autenticación Segura**: Integrado con **Supabase Auth** para mantener tus datos financieros privados y seguros.
- **🖥️ Experiencia de Escritorio**: Construido como una aplicación de **Electron** para una experiencia de escritorio fluida, manteniendo la flexibilidad de una aplicación web.
- **🎨 UI/UX Premium**: Diseñado con un enfoque en la estética, con animaciones suaves, elementos de glassmorphism y opción entre modo claro y oscuro.

### 🛠️ Stack Tecnológico

- **Framework**: [React 19](https://react.dev/)
- **Herramienta de Construcción**: [Vite](https://vitejs.dev/)
- **Contenedor de Escritorio**: [Electron](https://www.electronjs.org/)
- **Servicio Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Integración IA**: [Groq SDK](https://groq.com/)
- **Visualización de Datos**: [Recharts](https://recharts.org/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Estilos**: Vanilla CSS con propiedades personalizadas modernas.

---

## 🚀 Getting Started / Primeros Pasos

### Prerequisites / Requisitos Previos

- Node.js (Latest LTS recommended / Recomendado última LTS)
- A Supabase project / Un proyecto de Supabase
- API Keys for Groq / Claves API para Groq

### Installation / Instalación

1. **Clone the repository / Clonar el repositorio**
   ```bash
   git clone https://github.com/your-username/finanzas.git
   cd finanzas
   ```

2. **Install dependencies / Instalar dependencias**
   ```bash
   npm install
   ```

3. **Environment Setup / Configuración del Entorno**
   Create a `.env` file in the root directory and add your credentials / Crea un archivo `.env` en el directorio raíz y añade tus credenciales:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GROQ_API_KEY=your_groq_api_key
   ```

4. **Run in development mode / Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

## 📦 Scripts

- `npm run dev`: Starts the Vite dev server and the Electron application concurrently / Inicia el servidor de desarrollo de Vite y la aplicación Electron simultáneamente.
- `npm run build`: Compiles the application and builds the Electron installer / Compila la aplicación y genera el instalador de Electron.
- `npm run electron:dev`: Starts only the Electron wrapper (requires Vite running) / Inicia solo el contenedor de Electron (requiere que Vite esté ejecutándose).
- `npm run preview`: Preview the production build locally / Previsualiza la versión de producción localmente.

---

Built with ❤️ by [Miguel Lorenzo](https://github.com/MiguelLorenzoT14)
