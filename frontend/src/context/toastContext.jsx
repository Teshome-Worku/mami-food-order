/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

const ToastContext = createContext(null);

const TOAST_DURATION = 3500;

const buildToastId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));

    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      const id = buildToastId();
      setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

      const timer = setTimeout(() => {
        removeToast(id);
      }, TOAST_DURATION);

      timersRef.current.set(id, timer);
    },
    [removeToast]
  );

  useEffect(
    () => () => {
      for (const timer of timersRef.current.values()) {
        clearTimeout(timer);
      }
      timersRef.current.clear();
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onDismiss }) => (
  <div
    className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
    role="region"
    aria-label="Notifications"
  >
    {toasts.map((toast) => (
      <Toast
        key={toast.id}
        id={toast.id}
        message={toast.message}
        type={toast.type}
        onDismiss={onDismiss}
      />
    ))}
  </div>
);

const toastStyles = {
  success: {
    container: "border-green-200 bg-green-50 text-green-800",
    icon: FiCheckCircle,
    iconColor: "text-green-500",
  },
  error: {
    container: "border-red-200 bg-red-50 text-red-800",
    icon: FiAlertCircle,
    iconColor: "text-red-500",
  },
  info: {
    container: "border-blue-200 bg-blue-50 text-blue-800",
    icon: FiInfo,
    iconColor: "text-blue-500",
  },
};

const Toast = ({ id, message, type, onDismiss }) => {
  const style = toastStyles[type] || toastStyles.success;
  const Icon = style.icon;

  return (
    <div
      className={`animate-toast-in flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${style.container}`}
      role="alert"
    >
      <Icon className={`h-5 w-5 shrink-0 ${style.iconColor}`} />
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="shrink-0 rounded-md p-0.5 opacity-50 transition hover:opacity-100"
        aria-label="Dismiss"
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
};
