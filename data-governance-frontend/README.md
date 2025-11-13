# Data Governance Frontend

A modern server-driven Next.js application implementing the **Data Governance Console** with comprehensive user management capabilities. Built with Next.js 14 App Router, Server Components, and Server Actions for optimal performance and scalability.

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

## 🏗️ Architecture & Design

### Server-Driven Implementation

This application follows a **server-first architecture** using Next.js App Router with:

- **Server Components** for all main content rendering
- **Server Actions** for all data mutations (POST/PUT/DELETE)
- **No client-side data fetching** for main content (no useEffect or client fetching)
- **Proper error and loading boundaries** using error.tsx and loading.tsx

### Folder Structure

```
src/
├── app/                          # App Router pages
│   ├── users/                    # User management pages
│   │   ├── page.tsx             # SSR users list with pagination
│   │   ├── loading.tsx          # Loading UI for users list
│   │   ├── error.tsx            # Error boundary for users list
│   │   └── [id]/                # Dynamic user detail pages
│   │       ├── page.tsx         # SSR user detail page
│   │       ├── loading.tsx      # Loading UI for user detail
│   │       ├── error.tsx        # Error boundary for user detail
│   │       └── not-found.tsx    # 404 page for users
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Homepage with SSR dashboard
├── actions/                      # Server Actions
│   └── userActions.ts           # All user CRUD operations with 'use server'
├── components/                   # React components
│   ├── users-list.tsx           # Server component for users list
│   ├── user-profile-card.tsx    # Server component for user profiles
│   ├── create-user-form.tsx     # Client component with Server Actions
│   └── ...                      # Other reusable components
├── lib/
│   ├── server-api.ts            # Server-side API functions for SSR
│   ├── server-actions.ts        # Legacy (to be removed)
│   ├── api.ts                   # Client-side API (minimal usage)
│   └── services.ts              # Legacy (to be removed)
└── types/
    └── api.ts                   # TypeScript type definitions
```

## 🔄 Data Handling Strategy

### Server-Side Rendering (SSR)

All main pages use **Server Components** with data fetched on the server:

```typescript
// app/users/page.tsx - SSR with caching
export default async function UsersPage() {
  const users = await getUsers() // Server-side fetch with caching
  return <UsersList users={users} />
}
```

### Caching Strategy

**Intelligent caching** based on data volatility:

```typescript
// lib/server-api.ts
export async function getUsers() {
  return fetch('/api/users', {
    next: { 
      revalidate: 60,      // Cache for 60 seconds
      tags: ['users']      // Tagged for selective revalidation
    }
  })
}

export async function getUser(id: string) {
  return fetch(`/api/users/${id}`, {
    next: { 
      revalidate: 300,     // Cache for 5 minutes (more stable)
      tags: [`user-${id}`] // User-specific tags
    }
  })
}

export async function getUserPosts(id: string) {
  return fetch(`/api/users/${id}/posts`, {
    next: { 
      revalidate: 30,      // Cache for 30 seconds (frequent updates)
      tags: [`user-${id}-posts`]
    }
  })
}
```

### Server Actions

All data mutations use **Server Actions** with proper validation and cache revalidation:

```typescript
// actions/userActions.ts
'use server'

export async function createUser(formData: FormData) {
  // Server-side validation
  const validatedData = createUserSchema.parse(rawData)
  
  // API call
  await apiRequest('/users', { method: 'POST', body: JSON.stringify(validatedData) })
  
  // Cache revalidation
  revalidatePath('/users')
  
  return { success: true, message: 'User created successfully!' }
}
```

## 🧪 Testing

### Test Coverage

Comprehensive testing with **strong focus on server logic**:

- **Server Actions Tests** (`tests/serverActions.test.ts`)
  - Input validation testing
  - Error handling scenarios
  - Cache revalidation behavior
  - API integration testing

- **SSR Rendering Tests** (`tests/ssrRendering.test.ts`)
  - Server Component rendering
  - Metadata generation
  - Error boundary testing
  - Cache behavior validation

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Examples

```typescript
// serverActions.test.ts
describe('Server Actions', () => {
  it('should validate required fields', async () => {
    const formData = new FormData()
    // Missing required fields
    
    const result = await createUser(formData)
    
    expect(result.success).toBe(false)
    expect(result.message).toContain('required')
  })
  
  it('should revalidate cache after user creation', async () => {
    // Test cache revalidation behavior
  })
})
```

## ⚡ Performance Optimizations

### SSR & Caching

- **Server-side rendering** for all main content
- **Intelligent caching** with different TTLs based on data volatility
- **Selective revalidation** using cache tags
- **Parallel data fetching** using Promise.all()

### Loading & Error States

- **Proper loading boundaries** with skeleton UIs
- **Error boundaries** at page and component levels
- **Graceful error handling** with retry mechanisms

### Bundle Optimization

- **Server Components** reduce client-side JavaScript
- **Selective client components** only when needed
- **Code splitting** through dynamic imports

## 🛠️ Technology Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Server Actions:** Native Next.js Server Actions
- **Validation:** Zod (server-side)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Testing:** Jest + React Testing Library

## 🔧 Environment Variables

```env
# .env.local
API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## 📊 Functional Requirements Compliance

| Feature | Status | Implementation |
|---------|---------|----------------|
| **U1: User List** | ✅ Complete | SSR paginated list at `/users` |
| **U2: User Details** | ✅ Complete | SSR detail page at `/users/[id]` |
| **U3: Create User** | ✅ Complete | Server Action form with validation |
| **U4: Update Status** | ✅ Complete | Server Actions for status management |
| **U5: Soft Delete** | ✅ Complete | Server Actions with cache revalidation |

## 🎯 Technical Requirements Compliance

### ✅ Rendering & Data Fetching
- All main pages use Server Components with SSR
- Server Actions for all POST/PUT/DELETE operations
- No client-side data fetching for main content
- Proper error.tsx and loading.tsx boundaries

### ✅ Architecture
- `/app/users/page.tsx` - SSR list ✅
- `/app/users/[id]/page.tsx` - SSR detail ✅
- `/actions/userActions.ts` - Server Actions ✅
- `/lib/server-api.ts` - API abstraction ✅

### ✅ Caching & Validation
- `revalidate` and `no-store` options applied ✅
- Server-side validation with Zod ✅
- `revalidatePath()` after mutations ✅

### ✅ Testing
- Unit tests for Server Actions ✅
- SSR rendering tests ✅
- Input validation testing ✅
- Error handling testing ✅

## 🚀 Deployment

The application is configured for deployment with:

- **Standalone output** for containerization
- **Environment variable** configuration
- **Production-optimized** builds
- **Error tracking** and monitoring ready

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔄 Migration from Client-Side

This application was **completely restructured** from a client-side React Query implementation to a server-driven architecture:

### Before (Client-Side)
- ❌ React Query for data fetching
- ❌ Client-side state management
- ❌ useEffect hooks for data loading
- ❌ Client-side error handling

### After (Server-Driven)
- ✅ Server Components with SSR
- ✅ Server Actions for mutations
- ✅ Server-side caching
- ✅ Proper error boundaries

This transformation provides:
- **Better performance** (less client JavaScript)
- **Improved SEO** (server-rendered content)
- **Enhanced security** (server-side validation)
- **Better user experience** (faster initial loads)

---

## 📝 Development Guidelines

When adding new features:

1. **Use Server Components** for data display
2. **Use Server Actions** for data mutations
3. **Add proper error boundaries**
4. **Include loading states**
5. **Write comprehensive tests**
6. **Use appropriate caching strategies**

This ensures consistency with the server-driven architecture and maintains optimal performance.

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