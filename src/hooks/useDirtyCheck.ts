import { useEffect, useRef } from 'react';

export function useDirtyCheck(
  hasUnsavedChanges: boolean,
  _onConfirm?: () => Promise<boolean> | boolean
) {
  const hasChangesRef = useRef(hasUnsavedChanges);
  hasChangesRef.current = hasUnsavedChanges;

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasChangesRef.current) {
        event.preventDefault();
        event.returnValue = '您有未保存的修改，确定要离开吗？';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return { state: 'idle' as const, proceed: () => {}, reset: () => {} };
}
