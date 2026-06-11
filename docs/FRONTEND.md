# AI-Powered Interview & Hiring Platform - Frontend Client Architecture
> **Senior Engineer Note:** When writing modern React apps, divide state into two categories: **Server State** (data fetched from DB that can get stale, managed via TanStack Query) and **Client State** (routing, modals, active themes, local authentication, managed via Context API/useState). Do not duplicate server data into local states—it causes synchronization bugs.

---

## 1. Project Directory Layout
We use a structured folder layout grouping files by feature and module rather than by file type.

```
src/
├── assets/             # Global graphics, icons, style files
├── components/         # Reusable global UI (Buttons, Cards, Inputs, Modals)
├── context/            # Shared Context APIs (AuthContext, SocketContext)
├── hooks/              # Global custom hooks (useDebounce, useLocalStorage)
├── layouts/            # Page shell layouts (DashboardLayout, AuthLayout)
├── pages/              # Routed pages with lazy loading code splitting
│   ├── candidate/      # ResumeBuilder, CareerRoadmap, MockInterview
│   ├── recruiter/      # JobManager, CandidateList, Analytics
│   └── shared/         # Login, Register, LandingPage, PageNotFound
├── services/           # Axios client configuration & API wrappers
├── utils/              # Helper utilities (date formatters, validators)
├── App.jsx             # Router definition & QueryProvider config
└── main.jsx            # DOM renderer mounting
```

---

## 2. Advanced Routing & Protected Routes
We leverage `react-router-dom` to configure path structures. Features are lazy-loaded to optimize bundle size.

### 2.1 Route Guard Component (`components/ProtectedRoute.jsx`)
```jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
```

---

## 3. Global Authentication & Axios Client
We maintain user sessions in React Context and configure Axios to capture `TOKEN_EXPIRED` (401) errors, refresh the access token silently in the background, and replay the original API call.

### 3.1 HTTP Client Service (`services/api.js`)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Crucial for sending/receiving HTTP-only cookies
});

// Attach Access Token to all outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Catch 401 and trigger refresh token rotation
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (error.response.data?.code === 'TOKEN_EXPIRED') {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // POST to server refresh endpoint. (Browser sends HttpOnly cookie automatically)
          const response = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          processQueue(null, accessToken);
          isRefreshing = false;

          return api(originalRequest); // Retry original call
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          // Clear credentials and logout user on token rejection
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 4. Custom Hooks & Query Caching (TanStack Query)
By using React Query, we hook our APIs into a reactive cache. The local state remains clean of loading flags, error flags, and fetch timers.

### 4.1 Jobs Query Hook (`hooks/useJobs.js`)
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Fetch jobs lists hook
export const useJobs = (filters = {}) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const { data } = await api.get('/jobs', { params: filters });
      return data.data; // Standard envelope layout: { status: 'success', data: [...] }
    },
    staleTime: 1000 * 60 * 5, // Keep cache active for 5 mins
  });
};

// Create job listing mutation hook
export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobData) => {
      const { data } = await api.post('/jobs', jobData);
      return data.data;
    },
    onSuccess: () => {
      // Invalidate the jobs cache so the search list updates automatically
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    }
  });
};
```

---

## 5. Reusable UI Components
All custom interfaces are built using Tailwind classes and standard accessibility properties.

### 5.1 Reusable Button Component (`components/Button.jsx`)
```jsx
import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-lg shadow-indigo-500/20",
    secondary: "bg-gray-800 hover:bg-gray-700 text-gray-200 focus:ring-gray-700 border border-gray-700",
    danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-lg shadow-rose-500/20"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
```
---

## 6. Error Boundary Component
Ensures runtime component errors do not crash the entire application viewport.

```jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white p-6">
          <h2 className="text-2xl font-bold text-rose-500 mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-4">The screen failed to render. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```
