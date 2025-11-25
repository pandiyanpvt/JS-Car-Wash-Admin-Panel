# React + Vite + Material UI + Framer Motion

A modern React application built with Vite, Material UI (MUI), Emotion, and Framer Motion.

## Installation Commands

The project has been set up with the following packages:

### Initial Setup
```bash
# Create React project with Vite
npm create vite@latest . -- --template react

# Install base dependencies
npm install
```

### Install Material UI, Emotion, and Framer Motion
```bash
# Install MUI and required dependencies
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# Install Framer Motion
npm install framer-motion
```

### Install React and TypeScript dependencies
```bash
# Install React and React DOM
npm install react react-dom

# Install TypeScript types and Vite React plugin
npm install -D @types/react @types/react-dom @vitejs/plugin-react
```

## Project Structure

```
js-fd/
├── public/                 # Static assets
│   └── LOGO.png
├── src/
│   ├── api/               # API client and services
│   ├── assets/            # Images, fonts, and other static files
│   ├── components/        # Reusable React components
│   ├── constants/         # Constants and configurations
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   │   ├── admin/         # Admin pages
│   │   └── auth/          # Authentication pages
│   ├── styles/            # Global styles and theme
│   │   ├── theme.ts       # MUI theme configuration
│   │   └── index.css      # Global CSS
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main App component
│   └── main.tsx           # Application entry point
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Technologies Used

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Material UI (MUI)** - Component library
- **Emotion** - CSS-in-JS styling (required by MUI)
- **Framer Motion** - Animation library

## Getting Started

1. Install dependencies (already done):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Project Features

- Admin Dashboard with analytics and management pages
- Authentication system (Login, Register, Forgot Password, Reset Password)
- Booking Management
- Customer Management
- Services Management
- Promotions/Offers Management
- Gallery/Media Management
- Testimonials/Reviews Management
- Feedback/Messages Management
- Reports and Analytics
- User Management
- Settings Configuration

## Customization

### Theme Configuration
Edit `src/styles/theme.ts` to customize your Material UI theme:
- Colors
- Typography
- Spacing
- Breakpoints
- And more...

### Adding New Components
Place reusable components in `src/components/`

### Adding New Pages
Place page components in `src/pages/`

## License

MIT

