import React, { useEffect, useId, useRef, useState } from 'react';
import { useNativeDialog } from '../hooks/useNativeDialog';
import { useLanguage } from '../i18n/LanguageContext';
import { ProductSku } from '../types/cms';
import { SubjectCropDialog } from './SubjectCropDialog';

interface SkuEditorSheetProps {
  sku: ProductSku | null;
  seriesName: string;
  seriesDefaultImage: string;
  isNew: boolean;
  onClose: () => void;
  onSave: (sku: ProductSku) => Promise<void>;
  onDelete?: (skuId: string) => Promise<void>;
  onUploadImage: (file: File) => Promise<string>;
}

export const SkuEditorSheet: React.FC<SkuEditorSheetProps> = ({
  sku,
  seriesName,
  seriesDefaultImage,
  isNew,
  onClose,
  onSave,
  onDelete,
  onUploadImage,
}) => {
  const { t, localizeError } = useLanguage();
  const titleId = useId();
  const [draft, setDraft] = useState<ProductSku | null>(sku);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState<boolean>(false);
  const [isCroppingSubject, setIsCroppingSubject] = useState<boolean>(false);
  const [originalImageBeforeCrop, setOriginalImageBeforeCrop] = useState<string | null>(
    null
  );
  const [imageProcessNotice, setImageProcessNotice] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isOpen = sku !== null;
  const dialogRef = useNativeDialog({
    isOpen,
    onClose,
    canDismiss: !isSaving && !isDeleting,
    lightDismiss: true,
  });

  useEffect(() => {
    if (sku) {
      setDraft(sku);
      setConfirmDelete(false);
      setOriginalImageBeforeCrop(null);
      setIsCropDialogOpen(false);
      setImageProcessNotice('');
      setErrorMessage('');
    }
  }, [sku]);

  const updateField = <K extends keyof ProductSku>(key: K, value: ProductSku[K]) => {
    setErrorMessage('');
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsUploading(true);
    setErrorMessage('');
    setImageProcessNotice('');
    try {
      const url = await onUploadImage(file);
      setOriginalImageBeforeCrop(null);
      updateField('imageUrl', url);
    } catch (error) {
      setErrorMessage(localizeError(error, t.skuSheet.uploadErrorFallback));
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmSubjectCrop = async (file: File) => {
    if (!draft?.imageUrl || isCroppingSubject || isUploading) return;
    setIsCroppingSubject(true);
    setErrorMessage('');
    setImageProcessNotice('');
    const sourceImage = draft.imageUrl;
    try {
      const url = await onUploadImage(file);
      setOriginalImageBeforeCrop((prev) => prev ?? sourceImage);
      updateField('imageUrl', url);
      setImageProcessNotice(t.skuSheet.subjectCropSavedNotice);
      setIsCropDialogOpen(false);
    } catch (error) {
      throw new Error(localizeError(error, t.skuSheet.subjectCropErrorFallback));
    } finally {
      setIsCroppingSubject(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !draft) return;

    setIsSaving(true);
    setErrorMessage('');
    try {
      await onSave({
        ...draft,
        name: draft.name.trim() || t.skuSheet.fallbackName(seriesName),
        skuCode: draft.skuCode.trim() || `RM-${seriesName.toUpperCase()}-NEW`,
      });
    } catch (error) {
      setErrorMessage(localizeError(error, t.skuSheet.saveErrorFallback));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDelete || isDeleting || !draft) return;
    setIsDeleting(true);
    setErrorMessage('');
    try {
      await onDelete(draft.id);
    } catch (error) {
      setErrorMessage(localizeError(error, t.skuSheet.deleteErrorFallback));
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="mwg-drawer"
    >
      {draft && (
        <div className="w-full h-full bg-white border-l border-[#141414] shadow-[-16px_0_48px_rgba(20,20,20,0.12)] flex flex-col">
          {/* Header */}
          <div className="px-8 py-6 border-b border-[#E6E0D4] flex items-center justify-between gap-6 shrink-0">
            <div className="min-w-0">
              <div className="text-[11px] text-[#A88950] tracking-[0.16em] uppercase">
                {isNew
                  ? t.skuSheet.headerNew(seriesName)
                  : t.skuSheet.headerEdit(seriesName)}
              </div>
              <h2
                id={titleId}
                className="text-[20px] font-semibold text-[#141414] mt-1 truncate"
              >
                {draft.name || t.skuSheet.unnamedProduct}
              </h2>
            </div>
            <button
              type="button"
              disabled={isSaving || isDeleting}
              onClick={onClose}
              className="px-3 py-1.5 text-[13px] text-[#6E675C] hover:text-[#141414] transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              {t.common.close}
            </button>
          </div>

          {/* Form Body */}
          <form
            id="sku-editor-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto mwg-scroll-stable px-8 py-7 space-y-8"
          >
            {errorMessage && (
              <div
                role="alert"
                className="px-4 py-3 bg-[#FDF5F4] border border-[#EED3CF] text-[12px] text-[#B9382C]"
              >
                {errorMessage}
              </div>
            )}

            {/* Product Image Block */}
            <section className="flex items-center gap-6 pb-7 border-b border-[#EFEAE0]">
              <div className="w-[104px] h-[132px] shrink-0 bg-[#FAF8F4] flex items-center justify-center p-2.5 overflow-hidden">
                {draft.imageUrl ? (
                  <img
                    src={draft.imageUrl}
                    alt={draft.name}
                    width={84}
                    height={112}
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                ) : (
                  <span className="text-[11px] text-[#AEAEB2]">
                    {t.common.noImage}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-3">
                <div className="text-[16px] font-semibold text-[#141414]">
                  {t.skuSheet.productImageTitle}
                </div>
                <p className="text-[12px] text-[#8E816C] leading-relaxed">
                  {t.skuSheet.productImageHint}
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploading || isCroppingSubject}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 border border-[#141414] bg-white text-[12px] font-medium text-[#141414] hover:bg-[#141414] hover:text-white disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isUploading ? t.common.uploading : t.skuSheet.uploadNewImage}
                  </button>
                  <button
                    type="button"
                    disabled={!draft.imageUrl || isUploading || isCroppingSubject}
                    onClick={() => setIsCropDialogOpen(true)}
                    className="px-3.5 py-1.5 border border-[#A88950] bg-[#FAF7F0] text-[12px] font-medium text-[#7A6136] hover:bg-[#A88950] hover:text-white disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isCroppingSubject
                      ? t.skuSheet.subjectCropping
                      : t.skuSheet.subjectCropButton}
                  </button>
                  {originalImageBeforeCrop && (
                    <button
                      type="button"
                      disabled={isCroppingSubject}
                      onClick={() => {
                        updateField('imageUrl', originalImageBeforeCrop);
                        setOriginalImageBeforeCrop(null);
                        setImageProcessNotice('');
                      }}
                      className="px-2 py-1.5 text-[12px] text-[#7A6136] hover:text-[#141414] cursor-pointer whitespace-nowrap"
                    >
                      {t.skuSheet.restoreOriginalImageButton}
                    </button>
                  )}
                  {seriesDefaultImage && draft.imageUrl !== seriesDefaultImage && (
                    <button
                      type="button"
                      disabled={isCroppingSubject}
                      onClick={() => {
                        setOriginalImageBeforeCrop(null);
                        setImageProcessNotice('');
                        updateField('imageUrl', seriesDefaultImage);
                      }}
                      className="px-2 py-1.5 text-[12px] text-[#8E816C] hover:text-[#141414] cursor-pointer whitespace-nowrap"
                    >
                      {t.skuSheet.restoreDefaultImage}
                    </button>
                  )}
                </div>
                {imageProcessNotice && (
                  <p className="text-[11.5px] text-[#8E7D63] leading-relaxed">
                    {imageProcessNotice}
                  </p>
                )}
              </div>
            </section>

            {/* Basic Information */}
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-[#141414]">
                  {t.skuSheet.basicInfoTitle}
                </h3>

                {/* Sharp Architectural Status Toggle */}
                <div className="flex items-center border border-[#D8CBB2] bg-white">
                  <button
                    type="button"
                    aria-pressed={draft.status === 'active'}
                    onClick={() => updateField('status', 'active')}
                    className={`px-3.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      draft.status === 'active'
                        ? 'bg-[#141414] text-white'
                        : 'text-[#7D7568] hover:text-[#141414]'
                    }`}
                  >
                    {t.sku.statusActive}
                  </button>
                  <button
                    type="button"
                    aria-pressed={draft.status === 'inactive'}
                    onClick={() => updateField('status', 'inactive')}
                    className={`px-3.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap border-l border-[#D8CBB2] ${
                      draft.status === 'inactive'
                        ? 'bg-[#141414] text-white'
                        : 'text-[#7D7568] hover:text-[#141414]'
                    }`}
                  >
                    {t.sku.statusInactive}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="mwg-field">
                  <label
                    htmlFor="sku-name"
                    className="block text-[12px] text-[#6E675C] mb-1.5 transition-colors"
                  >
                    {t.skuSheet.primaryNameLabel}
                  </label>
                  <input
                    id="sku-name"
                    type="text"
                    required
                    value={draft.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder={t.skuSheet.primaryNamePlaceholder}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] hover:bg-[#F5F1E9] text-[14px] text-[#141414] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                  />
                </div>

                <div className="mwg-field">
                  <label
                    htmlFor="sku-en-name"
                    className="block text-[12px] text-[#6E675C] mb-1.5"
                  >
                    {t.skuSheet.secondaryNameLabel}
                  </label>
                  <input
                    id="sku-en-name"
                    type="text"
                    value={draft.englishName}
                    onChange={(e) => updateField('englishName', e.target.value)}
                    placeholder={t.skuSheet.secondaryNamePlaceholder}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] hover:bg-[#F5F1E9] text-[14px] text-[#141414] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="mwg-field">
                    <label
                      htmlFor="sku-code"
                      className="block text-[12px] text-[#6E675C] mb-1.5 transition-colors"
                    >
                      {t.skuSheet.skuCodeLabel}
                    </label>
                    <input
                      id="sku-code"
                      type="text"
                      required
                      value={draft.skuCode}
                      onChange={(e) => updateField('skuCode', e.target.value)}
                      placeholder={t.skuSheet.skuCodePlaceholder}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] hover:bg-[#F5F1E9] text-[14px] text-[#141414] tabular-nums focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="mwg-field">
                    <label
                      htmlFor="sku-slot"
                      className="block text-[12px] text-[#6E675C] mb-1.5"
                    >
                      {t.skuSheet.shelfSlotLabel}
                    </label>
                    <input
                      id="sku-slot"
                      type="text"
                      value={draft.shelfSlot}
                      onChange={(e) => updateField('shelfSlot', e.target.value)}
                      placeholder={t.skuSheet.shelfSlotPlaceholder}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] hover:bg-[#F5F1E9] text-[14px] text-[#141414] tabular-nums focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Specification Parameters */}
            <section className="space-y-4 pt-6 border-t border-[#EFEAE0]">
              <h3 className="text-[16px] font-semibold text-[#141414]">
                {t.skuSheet.specSectionTitle}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="sku-volume"
                    className="block text-[12px] text-[#6E675C] mb-1.5"
                  >
                    {t.skuSheet.volumeLabel}
                  </label>
                  <input
                    id="sku-volume"
                    type="text"
                    value={draft.volume}
                    onChange={(e) => updateField('volume', e.target.value)}
                    placeholder={t.skuSheet.volumePlaceholder}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] hover:bg-[#F5F1E9] text-[14px] text-[#141414] tabular-nums focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="sku-abv"
                    className="block text-[12px] text-[#6E675C] mb-1.5"
                  >
                    {t.skuSheet.abvLabel}
                  </label>
                  <input
                    id="sku-abv"
                    type="text"
                    value={draft.abv}
                    onChange={(e) => updateField('abv', e.target.value)}
                    placeholder={t.skuSheet.abvPlaceholder}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] hover:bg-[#F5F1E9] text-[14px] text-[#141414] tabular-nums focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label
                    htmlFor="sku-price"
                    className="block text-[12px] text-[#6E675C] mb-1.5"
                  >
                    {t.skuSheet.priceLabel}
                  </label>
                  <input
                    id="sku-price"
                    type="text"
                    value={draft.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    placeholder={t.skuSheet.pricePlaceholder}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] hover:bg-[#F5F1E9] text-[14px] text-[#141414] tabular-nums focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="sku-packaging"
                    className="block text-[12px] text-[#6E675C] mb-1.5"
                  >
                    {t.skuSheet.packagingLabel}
                  </label>
                  <input
                    id="sku-packaging"
                    type="text"
                    value={draft.packaging}
                    onChange={(e) => updateField('packaging', e.target.value)}
                    placeholder={t.skuSheet.packagingPlaceholder}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] hover:bg-[#F5F1E9] text-[14px] text-[#141414] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="sku-sort"
                    className="block text-[12px] text-[#6E675C] mb-1.5"
                  >
                    {t.skuSheet.sortOrderLabel}
                  </label>
                  <input
                    id="sku-sort"
                    type="number"
                    min={1}
                    value={draft.sortOrder}
                    onChange={(e) =>
                      updateField('sortOrder', Math.max(1, Number(e.target.value) || 1))
                    }
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] hover:bg-[#F5F1E9] text-[14px] text-[#141414] tabular-nums focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Editorial Copy & Tasting Guidance (Auto-sizing field-sizing: content textareas) */}
            <section className="space-y-4 pt-6 border-t border-[#EFEAE0]">
              <h3 className="text-[16px] font-semibold text-[#141414]">
                {t.skuSheet.editorialSectionTitle}
              </h3>

              <div>
                <label
                  htmlFor="sku-highlight"
                  className="block text-[12px] text-[#6E675C] mb-1.5"
                >
                  {t.skuSheet.highlightLabel}
                </label>
                <input
                  id="sku-highlight"
                  type="text"
                  value={draft.highlight}
                  onChange={(e) => updateField('highlight', e.target.value)}
                  placeholder={t.skuSheet.highlightPlaceholder}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] hover:bg-[#F5F1E9] text-[14px] text-[#141414] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="sku-description"
                  className="block text-[12px] text-[#6E675C] mb-1.5"
                >
                  {t.skuSheet.descriptionLabel}
                </label>
                <textarea
                  id="sku-description"
                  rows={3}
                  value={draft.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder={t.skuSheet.descriptionPlaceholder}
                  className="mwg-auto-textarea w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] hover:bg-[#F5F1E9] text-[14px] leading-relaxed text-[#141414] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="sku-serving"
                  className="block text-[12px] text-[#6E675C] mb-1.5"
                >
                  {t.skuSheet.servingLabel}
                </label>
                <textarea
                  id="sku-serving"
                  rows={2}
                  value={draft.servingSuggestion}
                  onChange={(e) => updateField('servingSuggestion', e.target.value)}
                  placeholder={t.skuSheet.servingPlaceholder}
                  className="mwg-auto-textarea--compact w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] hover:bg-[#F5F1E9] text-[14px] leading-relaxed text-[#141414] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                />
              </div>
            </section>
          </form>

          {/* Footer Actions */}
          <div className="px-8 py-5 border-t border-[#E6E0D4] bg-white flex items-center justify-between gap-4 shrink-0">
            <div>
              {!isNew && onDelete && (
                <>
                  {!confirmDelete ? (
                    <button
                      type="button"
                      disabled={isSaving || isDeleting}
                      onClick={() => setConfirmDelete(true)}
                      className="text-[13px] text-[#8E816C] hover:text-[#B9382C] transition-colors cursor-pointer py-1.5 disabled:opacity-50"
                    >
                      {t.skuSheet.deleteProduct}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 text-[12px]">
                      <span className="text-[#6E675C]">
                        {t.skuSheet.confirmDeletePrompt}
                      </span>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={handleConfirmDelete}
                        className="text-[#B9382C] font-medium hover:underline cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting ? t.common.deleting : t.skuSheet.confirmDeleteAction}
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => setConfirmDelete(false)}
                        className="text-[#8E816C] hover:text-[#141414] cursor-pointer"
                      >
                        {t.common.cancel}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSaving || isDeleting}
                onClick={onClose}
                className="px-4 py-2 border border-[#D8CEBC] bg-white text-[13px] text-[#4A4845] hover:border-[#141414] hover:text-[#141414] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                form="sku-editor-form"
                disabled={isSaving || isDeleting}
                className="px-5 py-2 bg-[#141414] hover:bg-[#A88950] disabled:opacity-60 text-white text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                {isSaving
                  ? t.common.saving
                  : isNew
                    ? t.skuSheet.createProductButton
                    : t.skuSheet.saveChangesButton}
              </button>
            </div>
          </div>
        </div>
      )}
      <SubjectCropDialog
        imageUrl={draft?.imageUrl ?? ''}
        isOpen={isCropDialogOpen}
        isSubmitting={isCroppingSubject}
        onClose={() => setIsCropDialogOpen(false)}
        onConfirm={handleConfirmSubjectCrop}
      />
    </dialog>
  );
};
