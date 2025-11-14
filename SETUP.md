# Installation Commands & Setup Steps

## Complete Installation Commands

### Step 1: Create Vite React Project
```bash
npm create vite@latest . -- --template react
```

### Step 2: Install Base Dependencies
```bash
npm install
```

### Step 3: Install Material UI and Emotion
```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

### Step 4: Install Framer Motion
```bash
npm install framer-motion
```

### Step 5: Install React and TypeScript Dependencies
```bash
npm install react react-dom
npm install -D @types/react @types/react-dom @vitejs/plugin-react
```

## Alternative: All-in-One Installation

If setting up from scratch, you can combine steps 3-5:
```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material framer-motion react react-dom
npm install -D @types/react @types/react-dom @vitejs/plugin-react
```

## Project Setup Steps

### 1. Configuration Files Created

- **vite.config.ts** - Vite configuration with React plugin
- **tsconfig.json** - TypeScript configuration with React JSX support
- **index.html** - Updated to use React root element

### 2. Folder Structure Created

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable React components
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── styles/          # Global styles and theme
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

### 3. Core Files Created

- **src/main.tsx** - React entry point with MUI ThemeProvider
- **src/App.tsx** - Main App component
- **src/components/ExampleCard.tsx** - Example component using MUI and Framer Motion
- **src/styles/theme.ts** - MUI theme configuration
- **src/styles/index.css** - Global CSS styles

## Verification

After installation, verify everything is working:

```bash
# Check installed packages
npm list react react-dom @mui/material framer-motion

# Start development server
npm run dev
```

The app should open at `http://localhost:5173` (or the port shown in terminal).

## Dependencies Installed

### Runtime Dependencies
- `react@^19.2.0`
- `react-dom@^19.2.0`
- `@mui/material@^7.3.5`
- `@emotion/react@^11.14.0`
- `@emotion/styled@^11.14.1`
- `@mui/icons-material@^7.3.5`
- `framer-motion@^12.23.24`

### Dev Dependencies
- `@types/react@^19.2.4`
- `@types/react-dom@^19.2.3`
- `@vitejs/plugin-react@^5.1.1`
- `typescript@~5.9.3`
- `vite@^7.2.2`

