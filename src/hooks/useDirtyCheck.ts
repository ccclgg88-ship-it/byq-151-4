import { useEffect, useRef } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router-dom';

export function useDirtyCheck(
  hasUnsavedChanges: boolean,
  onConfirm?: () => Promise<boolean> | boolean
) {
  const onConfirmRef = useRef(onConfirm);
  onConfirmRef.current = onConfirm;

  useBeforeUnload(
    (event) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = '';
      }
    },
    { capture: true }
  );

  const blocker = useBlocker(
    () =>
      hasUnsavedChanges
        ? '您有未保存的修改，确定要离开吗？未保存的内容将会丢失。'
        : false
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirmed = window.confirm(
        '您有未保存的修改，确定要离开吗？\n\n点击「确定」放弃未保存修改并离开，点击「取消」留在此页面。'
      );
      if (confirmed) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  return blocker;
}
