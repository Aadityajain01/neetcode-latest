# NeetCode Frontend - Complete Implementation Guide

## 📋 Overview

This document provides a complete guide to the NeetCode frontend implementation. The frontend is a production-ready, dark-themed, responsive Next.js application that connects to the Node.js + Express backend.

## 🎯 Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **State Management**: Zustand
- **Data Fetching**: Axios with React Query
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Authentication**: Firebase Client SDK
- **Code Editor**: Monaco Editor
- **Notifications**: Sonner (toast)
- **Icons**: Lucide React

## 🎨 Design System

### Color Palette (Locked)

```typescript
colors: {
  background: {
    primary: "#0F172A",   // main bg
    secondary: "#111827", // panels
    elevated: "#1E293B"   // cards
  },
  text: {
    primary: "#E5E7EB",
    secondary: "#9CA3AF",
    muted: "#6B7280"
  },
  accent: {
    primary: "#22C55E",   // success / CTA
    secondary: "#38BDF8"  // links
  },
  error: "#EF4444",
  warning: "#F59E0B",
  border: "#334155"
}
```

### Typography

```typescript
font: {
  family: "Inter, system-ui, sans-serif",
  sizes: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "22px",
    heading: "28px"
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700"
  }
}
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── register/
│   │   └── page.tsx             # Register page
│   ├── dashboard/
│   │   └── page.tsx             # Dashboard page
│   ├── problems/
│   │   ├── page.tsx             # Problem list
│   │   └── [id]/
│   │       └── page.tsx         # Problem solving with Monaco
│   ├── practice/
│   │   ├── page.tsx             # Practice problem list
│   │   └── [id]/
│   │       └── page.tsx         # Practice solving
│   ├── mcqs/
│   │   ├── page.tsx             # MCQ list
│   │   └── [id]/
│   │       └── page.tsx         # MCQ practice
│   ├── leaderboard/
│   │   ├── page.tsx             # Global leaderboard
│   │   ├── global/
│   │   │   └── page.tsx       # Global rankings
│   │   └── community/
│   │       └── [id]/
│   │           └── page.tsx     # Community leaderboard
│   ├── communities/
│   │   ├── page.tsx             # Community list
│   │   ├── create/
│   │   │   └── page.tsx       # Create community
│   │   └── [id]/
│   │       └── page.tsx         # Community details
│   ├── profile/
│   │   └── page.tsx             # User profile
│   └── admin/
│       ├── problems/
│       │   └── page.tsx       # Manage problems
│       ├── mcqs/
│       │   └── page.tsx         # Manage MCQs
│       └── submissions/
│           └── page.tsx       # Rejudge submissions
├── components/
│   ├── layouts/
│   │   └── main-layout.tsx     # Main layout with sidebar
│   ├── providers/
│   │   └── auth-provider.tsx   # Auth provider
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── firebase.ts              # Firebase configuration
│   ├── api.ts                  # Axios instance with interceptors
│   └── api-modules/            # API modules
│       ├── user.api.ts
│       ├── problem.api.ts
│       ├── submission.api.ts
│       ├── leaderboard.api.ts
│       ├── community.api.ts
│       ├── mcq.api.ts
│       ├── auth.api.ts
│       ├── admin.api.ts
│       └── index.ts
└── store/
    └── auth-store.ts            # Zustand auth store
```

## 🔐 Authentication Flow

### 1. Firebase Setup

```typescript
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
```

### 2. Auth State Management (Zustand)

```typescript
// src/store/auth-store.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  logout: async () => {
    // Firebase logout + state reset
  }
}));
```

### 3. API Integration

```typescript
// src/lib/api.ts
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
      router.push('/login');
    }
    return Promise.reject(error);
  }
);
```

## 📊 API Modules

All API modules are in `src/lib/api-modules/`:

```typescript
// Example: problemApi
export const problemApi = {
  getProblems: async (params?: { type?: string; difficulty?: string }) => {
    const response = await api.get('/problems', { params });
    return response.data;
  },
  getProblemById: async (problemId: string) => {
    const response = await api.get(`/problems/${problemId}`);
    return response.data;
  },
  // ... more methods
};
```

## 📄 Pages Implemented

### ✅ Completed

1. **Landing Page** (`/`)
   - Hero section
   - Features showcase
   - CTA
   - Auto-redirect to dashboard if logged in

2. **Login Page** (`/login`)
   - Email/password login
   - Google OAuth
   - Error handling
   - Redirect on success

3. **Register Page** (`/register`)
   - Email/password signup
   - Validation
   - Auto-login after registration

4. **Dashboard** (`/dashboard`)
   - User stats cards
   - Quick links grid
   - Leaderboard preview
   - Uses MainLayout

5. **Main Layout** (`src/components/layouts/main-layout.tsx`)
   - Responsive sidebar navigation
   - Mobile hamburger menu
   - Admin section (conditional)
   - Logout functionality

### 📋 To Implement (Architecture Provided)

#### Problem List Page (`/problems`)
```typescript
// Features needed:
- Filter by type (DSA/Practice)
- Filter by difficulty (Easy/Medium/Hard)
- Filter by language
- Search by title/description
- Pagination
- Solved status indicator
- Problem cards with metadata
```

#### Problem Solving Page (`/problems/[id]`)
```typescript
// Features needed:
- Monaco Editor integration
- Language selector
- Run button (calls /execute)
- Submit button (calls /submissions)
- Output panel
- Test cases display
- Submission history
- Real-time status updates
```

#### Practice Pages (`/practice`)
```typescript
// Similar to DSA problems but:
- No leaderboard impact
- No scoring
- Practice mode indicator
```

#### MCQ Pages (`/mcqs`)
```typescript
// Features needed:
- Language selector
- MCQ list
- Single MCQ view
- Radio button options
- Submit answer
- Feedback (correct/incorrect)
- Explanation display
- Progress tracking
```

#### Leaderboard Pages (`/leaderboard`)
```typescript
// Features needed:
- Global leaderboard table
- Community selector dropdown
- Community leaderboard (filtered)
- Pagination
- My rank highlight
- Score display
- Solved count
```

#### Community Pages (`/communities`)
```typescript
// Features needed:
- Community list
- Create community form
- Community details view
- Members list
- Join/Leave buttons
- Remove member (owner only)
- Edit settings (owner only)
- Domain validation
```

#### Profile Page (`/profile`)
```typescript
// Features needed:
- User info display
- Edit name/display
- Stats overview
- Submissions history
- Communities joined
```

#### Admin Pages (`/admin/*`)
```typescript
// Features needed:
- Protected routes (admin only)
- Create problem form
- Update problem form
- Delete problem
- Upload test cases (versioned)
- Create MCQ form
- Rejudge submission
```

## 🎨 Component Design Patterns

### 1. Card Component Pattern

```typescript
<Card className="bg-[#1E293B] border-[#334155]">
  <CardHeader>
    <CardTitle className="text-[#E5E7EB]">Title</CardTitle>
    <CardDescription className="text-[#9CA3AF]">
      Description
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### 2. Button Patterns

```typescript
// Primary CTA
<Button className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white">
  Submit
</Button>

// Secondary
<Button variant="outline" className="border-[#334155] text-[#E5E7EB]">
  Cancel
</Button>

// Destructive
<Button variant="ghost" className="text-[#EF4444] hover:text-[#DC2626]">
  Delete
</Button>
```

### 3. Input Patterns

```typescript
<Input
  className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] placeholder:text-[#6B7280]"
  placeholder="Enter text..."
/>
```

## 📱 Responsive Design

### Mobile (< 768px)
- Stack layouts
- Bottom navigation (optional)
- Hamburger menu for sidebar
- Full-width cards
- Collapsible sections

### Tablet (768px - 1024px)
- Two-column grids
- Reduced sidebar width
- Medium-sized cards

### Desktop (> 1024px)
- Fixed sidebar (280px)
- Multi-column layouts
- Wide tables
- Hover effects

## 🚀 Environment Setup

### Required Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## 🔄 Data Flow

```
User Action
    ↓
Firebase Auth (get ID token)
    ↓
Store token in Zustand
    ↓
API Request (Axios with token)
    ↓
Backend validates token
    ↓
Backend processes request
    ↓
Backend returns response
    ↓
Update UI (React state)
```

## ⚠️ Important Notes

### 1. Token Management
- Firebase tokens expire after 1 hour
- Use `getIdToken()` to refresh
- Store in Zustand, not localStorage
- Attach to all API requests

### 2. Error Handling
- Use Axios interceptors for 401
- Show toast notifications for errors
- Implement retry logic for failed requests
- Handle network errors gracefully

### 3. Loading States
- Show skeletons during data fetch
- Disable buttons during operations
- Show spinner for async actions
- Prevent multiple submissions

### 4. Code Execution
- Use Judge0 via backend (not directly)
- Poll for completion status
- Show real-time output
- Handle timeouts

## 🎯 Next Steps

1. **Implement Problem List Page** with filters
2. **Implement Problem Solving Page** with Monaco Editor
3. **Implement MCQ System** with practice mode
4. **Implement Leaderboard Pages** with filtering
5. **Implement Community Pages** with all features
6. **Implement Profile Page** with stats
7. **Implement Admin Panel** with CRUD operations
8. **Optimize for Mobile** responsiveness
9. **Add Error Boundaries** for graceful failures
10. **Add Loading Skeletons** for better UX

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Zustand](https://zustand-demo.pmnd.rs/)

## ✅ Quality Checklist

- [ ] All pages use MainLayout (except auth)
- [ ] Dark theme applied consistently
- [ ] Responsive on all breakpoints
- [ ] Loading states everywhere
- [ ] Error handling implemented
- [ ] Token refresh working
- [ ] 401 redirects to login
- [ ] Admin routes protected
- [ ] Forms validated
- [ ] Toast notifications working
- [ ] API calls using modules
- [ ] Zustand stores used correctly
