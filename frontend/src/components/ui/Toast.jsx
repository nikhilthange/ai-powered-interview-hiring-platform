import toast, { Toaster } from 'react-hot-toast';

export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-primary, #fff)',
            color: 'var(--text-primary, #333)',
            border: '1px solid var(--border-color, #e5e7eb)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }
        }}
      />
    </>
  );
}

export function useToast() {
  return {
    toast: Object.assign((options) => {
      // Map Shadcn-style options
      const msg = options.description || options.title;
      if (options.variant === 'destructive') {
        toast.error(msg);
      } else {
        toast.success(msg);
      }
    }, {
      success: (title, message) => toast.success(message || title),
      error: (title, message) => toast.error(message || title),
      warning: (title, message) => toast(message || title, { icon: '⚠️' }),
      info: (title, message) => toast(message || title, { icon: 'ℹ️' })
    }),
    addToast: () => {},
    removeToast: () => {}
  };
}

export { toast };
