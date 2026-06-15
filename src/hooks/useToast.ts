import { useCallback, useRef, useState } from 'react';
import type { ToastMessage } from '@/types/employee';
import { generateId } from '@/utils/fileUtils';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback(
    (type: ToastMessage['type'], message: string, duration = 3500) => {
      const id = generateId('T');
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      if (duration > 0) {
        timers.current[id] = setTimeout(() => removeToast(id), duration);
      }
      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (msg: string, duration?: number) => showToast('success', msg, duration),
    [showToast]
  );
  const error = useCallback(
    (msg: string, duration?: number) => showToast('error', msg, duration),
    [showToast]
  );
  const warning = useCallback(
    (msg: string, duration?: number) => showToast('warning', msg, duration),
    [showToast]
  );
  const info = useCallback(
    (msg: string, duration?: number) => showToast('info', msg, duration),
    [showToast]
  );

  return { toasts, showToast, removeToast, success, error, warning, info };
}
