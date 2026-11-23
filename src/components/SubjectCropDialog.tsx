import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNativeDialog } from '../hooks/useNativeDialog';
import { useLanguage } from '../i18n/LanguageContext';
import { cropImageToPngFile, NormalizedCropArea } from '../utils/cropImage';

interface SubjectCropDialogProps {
  imageUrl: string;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (file: File, crop: NormalizedCropArea) => Promise<void>;
}

type DragMode = 'move' | 'nw' | 'ne' | 'sw' | 'se';

const DEFAULT_CROP: NormalizedCropArea = {
  x: 0.12,
  y: 0.06,
  width: 0.76,
  height: 0.88,
};
const MIN_SIZE = 0.08;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export const SubjectCropDialog: React.FC<SubjectCropDialogProps> = ({
  imageUrl,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  const { t, localizeError } = useLanguage();
  const titleId = useId();
  const imageFrameRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    crop: NormalizedCropArea;
  } | null>(null);
  const [crop, setCrop] = useState<NormalizedCropArea>(DEFAULT_CROP);
  const [displaySize, setDisplaySize] = useState<{ width: number; height: number } | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState('');
  const dialogRef = useNativeDialog({
    isOpen,
    onClose,
    canDismiss: !isSubmitting,
    lightDismiss: false,
  });

  useEffect(() => {
    if (isOpen) {
      setCrop(DEFAULT_CROP);
      setDisplaySize(null);
      setErrorMessage('');
    }
  }, [imageUrl, isOpen]);

  const beginDrag = (event: React.PointerEvent<HTMLElement>, mode: DragMode) => {
    if (isSubmitting) return;
    event.preventDefault();
    event.stopPropagation();
    const frame = imageFrameRef.current?.getBoundingClientRect();
    if (!frame) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      mode,
      startX: (event.clientX - frame.left) / frame.width,
      startY: (event.clientY - frame.top) / frame.height,
      crop,
    };
  };

  const continueDrag = (event: React.PointerEvent<HTMLElement>) => {
    const active = dragRef.current;
    const frame = imageFrameRef.current?.getBoundingClientRect();
    if (!active || !frame) return;
    const currentX = (event.clientX - frame.left) / frame.width;
    const currentY = (event.clientY - frame.top) / frame.height;
    const dx = currentX - active.startX;
    const dy = currentY - active.startY;
    const start = active.crop;

    if (active.mode === 'move') {
      setCrop({
        ...start,
        x: clamp(start.x + dx, 0, 1 - start.width),
        y: clamp(start.y + dy, 0, 1 - start.height),
      });
      return;
    }

    const right = start.x + start.width;
    const bottom = start.y + start.height;
    const nextLeft = active.mode.includes('w')
      ? clamp(start.x + dx, 0, right - MIN_SIZE)
      : start.x;
    const nextRight = active.mode.includes('e')
      ? clamp(right + dx, start.x + MIN_SIZE, 1)
      : right;
    const nextTop = active.mode.includes('n')
      ? clamp(start.y + dy, 0, bottom - MIN_SIZE)
      : start.y;
    const nextBottom = active.mode.includes('s')
      ? clamp(bottom + dy, start.y + MIN_SIZE, 1)
      : bottom;

    setCrop({
      x: nextLeft,
      y: nextTop,
      width: nextRight - nextLeft,
      height: nextBottom - nextTop,
    });
  };

  const endDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setErrorMessage('');
    try {
      const file = await cropImageToPngFile(imageUrl, crop);
      await onConfirm(file, crop);
    } catch (error) {
      setErrorMessage(localizeError(error, t.cropper.errorFallback));
    }
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const maxWidth = Math.min(window.innerWidth * 0.7, 720);
    const maxHeight = Math.min(window.innerHeight * 0.58, 640);
    const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
    setDisplaySize({
      width: Math.max(1, Math.round(image.naturalWidth * scale)),
      height: Math.max(1, Math.round(image.naturalHeight * scale)),
    });
  };

  if (typeof document === 'undefined') return null;

  const clipRight = (1 - crop.x - crop.width) * 100;
  const clipBottom = (1 - crop.y - crop.height) * 100;

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="mwg-dialog w-[min(960px,calc(100vw-2rem))] max-h-[94dvh] bg-white border border-[#D4C8B4] shadow-[0_24px_64px_rgba(20,20,20,0.24)] p-0"
    >
      <div className="flex max-h-[94dvh] flex-col bg-white">
        <header className="shrink-0 border-b border-[#E6E0D4] px-6 py-5 sm:px-8 flex items-start justify-between gap-6">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#A88950]">
              {t.cropper.eyebrow}
            </p>
            <h2 id={titleId} className="mt-1 text-[22px] font-semibold text-[#141414]">
              {t.cropper.title}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-[#7D7568]">
              {t.cropper.description}
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="shrink-0 px-3 py-1.5 text-[13px] text-[#6E675C] hover:text-[#141414] disabled:opacity-50 cursor-pointer"
          >
            {t.common.close}
          </button>
        </header>

        <div className="flex-1 min-h-0 overflow-auto bg-[#F3F0E9] p-5 sm:p-8">
          {errorMessage && (
            <div role="alert" className="mb-4 border border-[#EED3CF] bg-[#FDF5F4] px-4 py-3 text-[13px] text-[#B9382C]">
              {errorMessage}
            </div>
          )}
          <div className="mx-auto flex min-h-[360px] items-center justify-center">
            <div ref={imageFrameRef} className="relative inline-block max-w-full select-none touch-none bg-white shadow-[0_8px_30px_rgba(20,20,20,0.12)]">
              <img
                src={imageUrl}
                alt={t.cropper.imageAlt}
                draggable={false}
                onLoad={handleImageLoad}
                className="block max-w-full object-contain"
                style={displaySize ?? undefined}
              />
              <div className="pointer-events-none absolute inset-0 bg-[rgba(20,20,20,0.46)]" />
              <img
                src={imageUrl}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full object-fill"
                style={{
                  clipPath: `inset(${crop.y * 100}% ${clipRight}% ${clipBottom}% ${crop.x * 100}%)`,
                }}
              />
              <div
                role="presentation"
                onPointerDown={(event) => beginDrag(event, 'move')}
                onPointerMove={continueDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className="absolute cursor-move border-2 border-white shadow-[0_0_0_1px_rgba(168,137,80,0.95)]"
                style={{
                  left: `${crop.x * 100}%`,
                  top: `${crop.y * 100}%`,
                  width: `${crop.width * 100}%`,
                  height: `${crop.height * 100}%`,
                }}
              >
                <span className="pointer-events-none absolute left-2 top-2 bg-[#141414]/80 px-2 py-1 text-[11px] text-white">
                  {t.cropper.selectionLabel}
                </span>
                {(['nw', 'ne', 'sw', 'se'] as DragMode[]).map((mode) => (
                  <span
                    key={mode}
                    role="presentation"
                    onPointerDown={(event) => beginDrag(event, mode)}
                    onPointerMove={continueDrag}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    className={`absolute h-4 w-4 rounded-full border-2 border-white bg-[#A88950] shadow-md ${
                      mode.includes('n') ? '-top-2' : '-bottom-2'
                    } ${mode.includes('w') ? '-left-2' : '-right-2'} ${
                      mode === 'nw' || mode === 'se' ? 'cursor-nwse-resize' : 'cursor-nesw-resize'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="shrink-0 border-t border-[#E6E0D4] bg-white px-6 py-4 sm:px-8 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setCrop(DEFAULT_CROP)}
            className="px-3 py-2 text-[13px] text-[#7D7568] hover:text-[#141414] disabled:opacity-50 cursor-pointer"
          >
            {t.cropper.reset}
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-5 py-2.5 border border-[#D8CBB2] bg-white text-[13px] text-[#141414] hover:border-[#141414] disabled:opacity-50 cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleConfirm()}
              className="px-5 py-2.5 bg-[#141414] text-[13px] font-medium text-white hover:bg-[#2F2F2F] disabled:opacity-55 cursor-pointer"
            >
              {isSubmitting ? t.cropper.saving : t.cropper.confirm}
            </button>
          </div>
        </footer>
      </div>
    </dialog>,
    document.body
  );
};
