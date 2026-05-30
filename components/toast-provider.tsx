"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type ToastType = "success" | "warning" | "info";

type Toast = {
  id: number;
  message: string;
  description?: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, description?: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons: Record<ToastType, string> = {
  success: "✓",
  warning: "⚠",
  info: "ℹ",
};

const styles: Record<ToastType, string> = {
  success: "bg-[#1f4d3a] text-white",
  warning: "bg-[#d6a84f] text-white",
  info: "bg-white text-[#1f2937] ring-1 ring-[#e6ebdf]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, description?: string, type: ToastType = "info") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex w-80 items-start gap-3 rounded-2xl px-4 py-3 shadow-lg transition-all ${styles[toast.type]}`}
          >
            <span className="mt-0.5 text-base font-bold">
              {icons[toast.type]}
            </span>

            <div className="flex-1">
              <p className="text-sm font-semibold">{toast.message}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs opacity-80">{toast.description}</p>
              )}
            </div>

            <button
              onClick={() => dismiss(toast.id)}
              className="mt-0.5 text-xs opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
