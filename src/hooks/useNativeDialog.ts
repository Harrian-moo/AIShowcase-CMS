import { useEffect, useRef } from 'react';

interface UseNativeDialogOptions {
  isOpen: boolean;
  onClose: () => void;
  canDismiss?: boolean;
  lightDismiss?: boolean;
}

/**
 * Modern Web Guidance native <dialog> controller:
 * - Opens/closes via native showModal() / close() in the browser Top Layer
 * - Prevents Escape dismissal cleanly via native `cancel` event when `canDismiss` is false
 * - Progressive backdrop click dismissal using pointerdown/pointerup bounding-box check
 *   (safe fallback when `closedby="any"` is not yet supported by the browser)
 */
export function useNativeDialog({
  isOpen,
  onClose,
  canDismiss = true,
  lightDismiss = true,
}: UseNativeDialogOptions) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const pressedOutsideRef = useRef<boolean>(false);

  // Sync React open state with native Top Layer modal state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Progressive enhancement: set `closedby` attribute when supported
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!canDismiss) {
      dialog.setAttribute('closedby', 'none');
    } else if (lightDismiss) {
      dialog.setAttribute('closedby', 'any');
    } else {
      dialog.setAttribute('closedby', 'closerequest');
    }
  }, [canDismiss, lightDismiss]);

  // Wire native `cancel`, `close`, and pointer light-dismiss fallback
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      if (!canDismiss) {
        event.preventDefault();
      }
    };

    const handleClose = () => {
      onClose();
    };

    const isPointerOutside = (event: PointerEvent) => {
      const rect = dialog.getBoundingClientRect();
      return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      );
    };

    const hasNativeClosedBy = 'closedBy' in HTMLDialogElement.prototype;

    const handlePointerDown = (event: PointerEvent) => {
      if (!lightDismiss || !canDismiss || hasNativeClosedBy) return;
      pressedOutsideRef.current = isPointerOutside(event);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!lightDismiss || !canDismiss || hasNativeClosedBy) return;
      if (pressedOutsideRef.current && isPointerOutside(event) && dialog.open) {
        dialog.close();
      }
      pressedOutsideRef.current = false;
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('pointerdown', handlePointerDown);
    dialog.addEventListener('pointerup', handlePointerUp);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('pointerdown', handlePointerDown);
      dialog.removeEventListener('pointerup', handlePointerUp);
    };
  }, [canDismiss, lightDismiss, onClose]);

  return dialogRef;
}
