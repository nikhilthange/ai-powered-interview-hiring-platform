import toast, { Toaster } from 'react-hot-toast'
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-primary, #ffffff)',
            color: 'var(--text-primary, #0f172a)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '16px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
            backdropFilter: 'blur(16px)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </>
  );
}

export function useToast() {
  return {
    toast: Object.assign((options) => {
      const msg = options.description || options.title;
      if (options.variant === 'destructive') {
        toast.error(msg);
      } else {
        toast.success(msg);
      }
    }, {
      success: (title, message) => toast.success(message ? `${title}: ${message}` : title, {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
      }),
      error: (title, message) => toast.error(message ? `${title}: ${message}` : title, {
        icon: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
      }),
      warning: (title, message) => toast(message ? `${title}: ${message}` : title, {
        icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
      }),
      info: (title, message) => toast(message ? `${title}: ${message}` : title, {
        icon: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
      }),
    }),
    addToast: () => {},
    removeToast: () => {}
  };
}

export { toast };
