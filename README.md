# JS Car Wash Admin Panel

A modern, feature-rich admin panel built with React, TypeScript, TailwindCSS, and Vite.

## 🚀 Features

- **Modern UI**: Glassmorphism design with soft shadows and gradients
- **Role-Based Access Control**: Admin, Developer, Manager, and Worker roles
- **Complete CRUD Operations**: Manage branches, packages, products, orders, and more
- **Analytics Dashboard**: Advanced charts and insights (Developer only)
- **Responsive Design**: Works seamlessly on all screen sizes
- **Real-time Updates**: Dummy data ready for backend integration

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Modern browser with ES6+ support

## 🛠️ Installation

1. **Navigate to the admin panel directory:**
   ```bash
   cd JS_fd_Admin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🔐 Demo Credentials

### Developer Account (Full Access)
- **Email:** `developer@jscarwash.com`
- **Password:** `developer123`

### Admin Account (Limited Access)
- **Email:** `admin@jscarwash.com`
- **Password:** `admin123`

## 📁 Project Structure

```
JS_fd_Admin/
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication components
│   │   ├── layout/         # Sidebar, Topbar, Layout
│   │   └── ui/            # Reusable UI components
│   ├── contexts/          # React contexts (Auth)
│   ├── pages/             # Page components
│   │   ├── analytics/     # Analytics (Developer only)
│   │   ├── auth/          # Login page
│   │   ├── branches/      # Branch management
│   │   ├── contact/       # Contact messages
│   │   ├── dashboard/     # Dashboard with KPIs
│   │   ├── extra-works/   # Extra works management
│   │   ├── gallery/       # Gallery management
│   │   ├── orders/        # Order management
│   │   ├── packages/      # Package management
│   │   ├── products/      # Product management
│   │   ├── reviews/       # User reviews
│   │   └── users/         # User management
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🎨 Pages Overview

### 1. Dashboard
- KPI cards (Total Orders, Revenue, Today's Orders, Active Users)
- Revenue trend line chart
- Weekly orders bar chart
- Recent orders table

### 2. Branch Details
- List all branches
- **Admin**: View & Edit only
- **Developer**: Full CRUD access
- Shows manager info, address, phone, status

### 3. Our Packages
- Integrated view of:
  - `our_packages`
  - `package_includes`
  - `package_details`
- Expandable cards with nested data
- CRUD for each section

### 4. Extra Works
- List extra services
- Price, duration, status
- Full CRUD operations

### 5. Products
- Product list with images, stock, price, category
- Full CRUD operations

### 6. Product Categories
- Category management
- Full CRUD operations

### 7. Contact Messages
- List of messages from `contact_us`
- Conversation view integrating:
  - `contact_us`
  - `contact_replies`
- Reply functionality

### 8. Gallery
- Grid gallery view
- Upload/delete images

### 9. Orders
- Complete order breakdown:
  - Customer info
  - Vehicle info
  - Services
  - Products
  - Extra works
  - Payment status
- Order status timeline

### 10. User Reviews
- User reviews display
- Ratings, comments, customer info, dates

### 11. Analytics (Developer Only)
- Revenue trends
- Branch performance
- Top-selling products
- Daily order frequency heatmap

### 12. Users
- User list
- Assign roles (Admin, Developer, Manager, Worker)
- Activate/Deactivate users

### 13. User Logs
- Activity logs
- Filters by user, date, activity type

### 14. User Role
- Role management
- Set permissions for each role
- Toggle feature access

## 🔒 Role-Based Access

- **Developer**: Full access to all features
- **Admin**: Can view & edit branches (no create/delete), no analytics access
- **Manager**: Limited access, can manage orders
- **Worker**: View-only access to orders

## 🎯 Key Technologies

- **React 19**: UI library
- **TypeScript**: Type safety
- **TailwindCSS**: Utility-first CSS
- **Vite**: Build tool
- **React Router**: Navigation
- **Recharts**: Chart library
- **Lucide React**: Icon library
- **Framer Motion**: Animations
- **date-fns**: Date formatting

## 📦 Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `dist` directory.

## 🔌 Backend Integration

The admin panel is **fully integrated** with the JS Car Wash Backend API.

### Setup

1. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your backend URL:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

2. **Start the backend server:**
   ```bash
   cd ../JS-Car-Wash-Backend
   npm install
   npm run dev
   ```

3. **Start the admin panel:**
   ```bash
   npm run dev
   ```

### API Integration Details

- ✅ Authentication API (`/users/login`) - Fully integrated
- ✅ Users API - Integrated with backend routes
- ✅ Branches API - Integrated
- ✅ Packages API - Integrated
- ✅ Products API - Integrated (with file upload support)
- ✅ Orders API - Integrated
- ✅ All API responses handle backend format: `{ success, message, data }`
- ✅ JWT token authentication with automatic token injection
- ✅ Automatic logout on 401 unauthorized responses

### Backend Response Format

All backend endpoints return responses in this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

The frontend API layer automatically extracts the `data` field from responses.

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme:

```js
colors: {
  primary: {
    // Your color values
  }
}
```

### Styling
Modify `src/index.css` for global styles and custom utilities.

## 📝 Notes

- ✅ Backend integration complete - All API calls connected to backend
- ✅ Authentication uses real JWT tokens from backend
- ✅ Forms persist data to backend database
- ✅ Images support Cloudinary upload (configured in backend)
- ✅ Role-based access control enforced via backend JWT tokens

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow TailwindCSS utility-first approach
4. Maintain role-based access control
5. Keep components reusable and modular

## 📄 License

Private project for JS Car Wash system.

---

**Built with ❤️ for JS Car Wash**

