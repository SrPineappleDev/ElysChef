# Ely's Chef

**Aplicación web de recetas inteligentes impulsada por IA.**
Introduce los ingredientes que tienes en casa — por texto o fotografía — y obtén recetas personalizadas con información nutricional completa en segundos.

> Trabajo de Fin de Grado · Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Multiplataforma (DAM)

---

## Demo en vivo

**[elys-chef.vercel.app](https://elys-chef.vercel.app)**

| Pantalla principal | Generación de recetas |
|---|---|
| ![Landing](./screenshots/demo1.jpg) | ![Recetas](./screenshots/demo2.png) |

---

## Funcionalidades principales

- **Reconocimiento de ingredientes por imagen** — sube una foto y la IA identifica los ingredientes automáticamente
- **Entrada de ingredientes por texto** — añade y edita ingredientes de forma manual
- **Generación de recetas con IA** — recetas personalizadas basadas en tus ingredientes y preferencias
- **Información nutricional detallada** — calorías, macronutrientes y datos de cada receta
- **Filtros avanzados** — filtra por país de origen, categoría y tipo de dieta
- **Sistema de alergias (VIP)** — la IA excluye ingredientes según tus alergias registradas
- **Favoritos** — guarda y consulta tus recetas favoritas
- **Descarga en PDF** — exporta cualquier receta en formato PDF
- **Sistema de créditos** — plan gratuito y plan VIP con más funcionalidades
- **Panel de administración** — gestión de usuarios, catálogos y configuración del sistema

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18 · TypeScript · Vite |
| **UI / Estilos** | Tailwind CSS · shadcn/ui · Radix UI · Lucide Icons |
| **Enrutamiento** | React Router v6 |
| **Estado del servidor** | TanStack React Query v5 |
| **Formularios y validación** | React Hook Form · Zod |
| **Backend / Base de datos** | Supabase (PostgreSQL + Auth + Storage) |
| **Inteligencia Artificial** | Groq API (generación de recetas e imágenes, reconocimiento de ingredientes) |
| **Exportación PDF** | jsPDF |
| **Testing** | Vitest · Testing Library |
| **Despliegue** | Vercel |

---

## Arquitectura del proyecto

La aplicación sigue un patrón **MVC adaptado a React** con separación clara de responsabilidades:

```
src/
├── pages/           # Vistas principales (Index, Analyze, Favorites, Profile, Admin, Auth)
├── components/      # Componentes reutilizables de UI
│   └── ui/          # Librería de componentes base (shadcn/ui)
├── controllers/     # Custom hooks con lógica de negocio (recipe-generator, auth, favorites…)
├── models/          # Servicios de acceso a datos y llamadas a APIs externas
├── hooks/           # Hooks de infraestructura (autenticación, responsive)
├── integrations/    # Configuración del cliente Supabase y tipos generados
└── lib/             # Tipos globales y utilidades
```

**Decisiones de diseño relevantes:**
- **Lazy loading** con `React.lazy` + `Suspense` para reducir el bundle inicial
- **Error Boundary** global para capturar errores no controlados
- **Rutas protegidas** (`ProtectedRoute`) y de administrador (`AdminRoute`) con redirección automática
- **React Query** para caché de catálogos y datos del servidor, evitando peticiones redundantes
- **Race condition guard** en la generación de recetas mediante un contador de versión por referencia

---

## Instalación y configuración local

### Requisitos previos
- Node.js 18+ o Bun
- Cuenta en [Supabase](https://supabase.com) con un proyecto activo
- Clave de API de [Groq](https://console.groq.com)

### Pasos

```bash
git clone https://github.com/SrPineappleDev/ElysChef.git
cd ElysChef
npm install
```

Copia el fichero de variables de entorno y rellena los valores:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_PROJECT_ID=your-supabase-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
VITE_SUPABASE_URL=https://your-project-id.supabase.co
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción |
| `npm run preview` | Previsualización del build |
| `npm run test` | Ejecutar tests con Vitest |
| `npm run lint` | Análisis estático con ESLint |

---

## Licencia

Proyecto académico desarrollado con fines educativos.
