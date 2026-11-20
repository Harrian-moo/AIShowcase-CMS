import React, { useEffect, useId, useState } from 'react';
import { useNativeDialog } from '../hooks/useNativeDialog';
import { useLanguage } from '../i18n/LanguageContext';
import { CreateSeriesPayload } from '../types/cms';

interface CreateSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: CreateSeriesPayload) => Promise<void>;
}

export const CreateSeriesModal: React.FC<CreateSeriesModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const { t, localizeError } = useLanguage();
  const titleId = useId();
  const [name, setName] = useState<string>('');
  const [taglineEn, setTaglineEn] = useState<string>('');
  const [taglineZh, setTaglineZh] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const dialogRef = useNativeDialog({
    isOpen,
    onClose,
    canDismiss: !isSubmitting,
    lightDismiss: true,
  });

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!name.trim()) {
      setErrorMessage(t.createSeries.nameRequiredError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onCreate({
        name: name.trim(),
        taglineEn: taglineEn.trim(),
        taglineZh: taglineZh.trim(),
      });
      setName('');
      setTaglineEn('');
      setTaglineZh('');
      onClose();
    } catch (error) {
      setErrorMessage(localizeError(error, t.createSeries.createErrorFallback));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="mwg-dialog w-[min(460px,calc(100vw-3rem))]"
    >
      <div className="w-full bg-white border border-[#D8CBB2] border-t-2 border-t-[#141414] shadow-[0_24px_64px_rgba(20,20,20,0.14)] overflow-hidden">
        <div className="px-7 py-6 border-b border-[#EFEAE0] flex items-center justify-between">
          <div>
            <div className="text-[11px] tracking-[0.2em] text-[#9A8B73] uppercase">
              RÉMY MARTIN
            </div>
            <h2
              id={titleId}
              className="text-[20px] font-semibold text-[#141414] mt-0.5"
            >
              {t.createSeries.title}
            </h2>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="text-[13px] text-[#7D7568] hover:text-[#141414] cursor-pointer disabled:opacity-50"
          >
            {t.common.close}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5" noValidate>
          <div className="mwg-field">
            <label
              htmlFor="new-series-name"
              className="block text-[12px] text-[#6E675C] mb-2 transition-colors"
            >
              {t.createSeries.nameLabel}
            </label>
            <input
              id="new-series-name"
              type="text"
              required
              autoFocus
              disabled={isSubmitting}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder={t.createSeries.namePlaceholder}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[14px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mwg-field">
              <label
                htmlFor="new-series-en"
                className="block text-[12px] text-[#6E675C] mb-2"
              >
                {t.createSeries.taglinePrimaryLabel}
              </label>
              <input
                id="new-series-en"
                type="text"
                disabled={isSubmitting}
                value={taglineEn}
                onChange={(e) => setTaglineEn(e.target.value)}
                placeholder={t.createSeries.taglinePrimaryPlaceholder}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[14px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors disabled:opacity-60"
              />
            </div>
            <div className="mwg-field">
              <label
                htmlFor="new-series-zh"
                className="block text-[12px] text-[#6E675C] mb-2"
              >
                {t.createSeries.taglineSecondaryLabel}
              </label>
              <input
                id="new-series-zh"
                type="text"
                disabled={isSubmitting}
                value={taglineZh}
                onChange={(e) => setTaglineZh(e.target.value)}
                placeholder={t.createSeries.taglineSecondaryPlaceholder}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[14px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          {errorMessage && (
            <p role="alert" className="text-[12px] text-[#B9382C]">
              {errorMessage}
            </p>
          )}

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 border border-[#D8CEBC] bg-white text-[13px] text-[#555558] hover:border-[#141414] hover:text-[#141414] cursor-pointer disabled:opacity-50"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#141414] hover:bg-[#A88950] disabled:opacity-60 text-white text-[13px] font-medium transition-colors cursor-pointer"
            >
              {isSubmitting ? t.createSeries.creatingButton : t.createSeries.createButton}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
