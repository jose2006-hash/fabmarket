# FabMarket 🏭

Plataforma marketplace de manufactura — conecta clientes con talleres de Lima.

## Stack
- **Next.js 14** (frontend + API routes)
- **Anthropic Claude** (asistente de pedidos con IA)
- **Vercel** (deploy)

## Cómo correr localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de variables de entorno
cp .env.example .env.local
# Edita .env.local y agrega tu API key de Anthropic

# 3. Correr en desarrollo
npm run dev
# Abre http://localhost:3000
```

## Deploy en Vercel

### Paso 1 — Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit — FabMarket"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/fabmarket.git
git push -u origin main
```

### Paso 2 — Conectar con Vercel
1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
2. Haz clic en **"Add New Project"**
3. Selecciona el repositorio `fabmarket`
4. En la sección **"Environment Variables"** agrega:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-xxxx...` (tu API key real)
5. Haz clic en **Deploy** ✅

### Paso 3 — Obtener tu API key de Anthropic
1. Ve a [console.anthropic.com](https://console.anthropic.com)
2. Crea una cuenta o inicia sesión
3. Ve a **API Keys** → **Create Key**
4. Copia la key y pégala en Vercel

## Estructura del proyecto

```
fabmarket/
├── pages/
│   ├── api/
│   │   └── chat.js        ← Backend seguro (API key aquí)
│   ├── _app.js
│   └── index.js           ← App completa
├── lib/
│   └── data.js            ← Datos demo y constantes
├── styles/
│   └── globals.css        ← Estilos globales
├── .env.example           ← Template de variables de entorno
├── .gitignore             ← Excluye .env.local y node_modules
└── package.json
```

## ⚠️ Seguridad importante

- El archivo `.env.local` está en `.gitignore` — **nunca** se sube a GitHub
- El API key de Anthropic solo vive en `pages/api/chat.js` (servidor)
- El frontend llama a `/api/chat` (tu propio backend), no directamente a Anthropic
