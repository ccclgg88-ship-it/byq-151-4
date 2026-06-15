import { useEffect, useRef } from 'react';

export function useDirtyCheck(
  hasUnsavedChanges: boolean,
  _onConfirm?: () => Promise<boolean> | boolean
) {
  const hasChangesRef = useRef(hasUnsavedChanges);
  hasChangesRef.current = hasUnsavedChanges;

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (hasChangesRef.current) {
        event.preventDefault();
        event.returnValue =
          '您有未保存的修改，确定要离开吗？未保存的内容将会丢失。';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  return { state: 'idle', proceed: () => {}, reset: () => {} };
}
