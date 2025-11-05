# Data Governance Frontend

A modern Next.js application for managing user profiles, preferences, and posts.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your backend URL
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open application:**
   http://localhost:3000

## 🛠️ Technology Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Query (TanStack Query)
- **Forms:** React Hook Form with Zod validation
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

## 📱 Features

### Dashboard Overview
- System health monitoring
- User statistics
- Quick action buttons
- Recent activity feed

### User Profile Management
- Create new user profiles
- View and edit existing profiles
- Role management (USER, ADMIN, MODERATOR)
- Search and filter functionality
- Soft and hard delete operations

### User Preferences
- Theme settings (light/dark/auto)
- Language preferences
- Notification settings
- Custom JSON configuration
- Real-time updates

### User Posts Management
- Create and manage posts
- Author-based filtering
- Post statistics
- Content management

## 🔌 API Integration

The frontend communicates with the Spring Boot backend through:

- **Base URL:** Configured via `NEXT_PUBLIC_API_BASE_URL`
- **HTTP Client:** Axios with interceptors
- **Data Fetching:** React Query for caching and synchronization
- **Type Safety:** TypeScript interfaces matching backend DTOs

### API Endpoints

- **User Profiles:** `/api/v1/profiles`
- **User Preferences:** `/api/v1/preferences`
- **User Posts:** `/api/v1/posts`
- **Health Check:** `/actuator/health`

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── dashboard-overview.tsx
│   ├── user-profile-manager.tsx
│   ├── user-preferences-manager.tsx
│   ├── user-posts-manager.tsx
│   └── providers.tsx      # React Query provider
├── lib/                   # Utilities and services
│   ├── api.ts            # Axios configuration
│   └── services.ts       # API service functions
└── types/                 # TypeScript type definitions
    └── api.ts            # API types matching backend
```

## 🎨 UI Components

The application uses a custom component library built with Tailwind CSS:

- **Responsive Design:** Mobile-first approach
- **Consistent Styling:** Reusable utility classes
- **Accessibility:** ARIA labels and keyboard navigation
- **Loading States:** Skeleton loaders and spinners
- **Error Handling:** User-friendly error messages

## 🔄 State Management

### React Query Features

- **Caching:** Automatic response caching
- **Background Updates:** Refetch on window focus
- **Optimistic Updates:** Immediate UI feedback
- **Error Retry:** Automatic retry on failures
- **Devtools:** Built-in development tools

### Form Management

- **Validation:** Zod schema validation
- **Type Safety:** TypeScript integration
- **Error Handling:** Field-level error display
- **Submission:** Async form submission with loading states

## 🧪 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

### Code Quality

- **TypeScript:** Full type safety
- **ESLint:** Code linting with Next.js rules
- **Prettier:** Code formatting (recommended)
- **Husky:** Git hooks for quality checks (optional)

### Environment Variables

```bash
# Required
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Optional
NODE_ENV=development
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository to Vercel**
2. **Set environment variables:**
   - `NEXT_PUBLIC_API_BASE_URL`: Your backend URL
3. **Deploy automatically on push**

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Build Command

```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Tailwind CSS

The application uses a custom Tailwind configuration with:

- **Color Palette:** Consistent design system colors
- **Typography:** Responsive font scales
- **Spacing:** Consistent spacing system
- **Components:** Custom utility classes

### Next.js Configuration

```javascript
// next.config.js
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
}
```

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
   - Ensure backend is running on correct port
   - Verify CORS configuration on backend

2. **Build Errors**
   - Run `npm run type-check` to check TypeScript errors
   - Clear `.next` folder and rebuild
   - Check for missing dependencies

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting CSS rules
   - Verify PostCSS configuration

### Debug Mode

```bash
# Enable debug logging
DEBUG=true npm run dev

# Check environment variables
printenv | grep NEXT_PUBLIC

# Test API connection
curl $NEXT_PUBLIC_API_BASE_URL/actuator/health
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.