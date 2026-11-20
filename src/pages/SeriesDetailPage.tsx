import React, { useEffect, useId, useRef, useState } from 'react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ShowcaseCardPreview } from '../components/ShowcaseCardPreview';
import { useNativeDialog } from '../hooks/useNativeDialog';
import { useLanguage } from '../i18n/LanguageContext';
import { mediaService, seriesService } from '../services';
import { ProductSeries, UpdateSeriesPayload } from '../types/cms';

interface SeriesDetailPageProps {
  deviceId: string;
  deviceName: string;
  series: ProductSeries;
  seriesIndex: number;
  totalSeries: number;
  canDelete: boolean;
  onSeriesUpdated: (updated: ProductSeries) => void;
  onSeriesDeleted: (id: string) => void;
  onNavigateToSkus: () => void;
  onOpenFullPreview: () => void;
}

export const SeriesDetailPage: React.FC<SeriesDetailPageProps> = ({
  deviceId,
  deviceName,
  series,
  seriesIndex,
  totalSeries,
  canDelete,
  onSeriesUpdated,
  onSeriesDeleted,
  onNavigateToSkus,
  onOpenFullPreview,
}) => {
  const { locale, t, localizeError } = useLanguage();
  const previewTitleId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [draft, setDraft] = useState<ProductSeries>(series);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isProcessingWhiteBg, setIsProcessingWhiteBg] = useState<boolean>(false);
  const [originalImageBeforeProcess, setOriginalImageBeforeProcess] = useState<string | null>(
    null
  );
  const [imageProcessNotice, setImageProcessNotice] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'detail' | 'stage'>('detail');
  const [statusNotice, setStatusNotice] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const previewDialogRef = useNativeDialog({
    isOpen: isPreviewOpen,
    onClose: () => setIsPreviewOpen(false),
    canDismiss: true,
    lightDismiss: true,
  });

  // Sync draft when switching active device, series, or language dataset
  useEffect(() => {
    setDraft(series);
    setHasUnsavedChanges(false);
    setConfirmDelete(false);
    setOriginalImageBeforeProcess(null);
    setImageProcessNotice('');
    setErrorMessage('');
    setStatusNotice('');
  }, [deviceId, locale, series.id, series.updatedAt, series.skus.length, series.description]);

  const updateDraftField = <K extends keyof ProductSeries>(
    key: K,
    value: ProductSeries[K]
  ) => {
    setConfirmDelete(false);
    setErrorMessage('');
    setHasUnsavedChanges(true);
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateTastingField = (
    field: keyof ProductSeries['tasting'],
    value: string
  ) => {
    setErrorMessage('');
    setHasUnsavedChanges(true);
    setDraft((prev) => ({
      ...prev,
      tasting: {
        ...prev.tasting,
        [field]: value,
      },
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsUploading(true);
    setErrorMessage('');
    setImageProcessNotice('');
    try {
      const uploaded = await mediaService.uploadSeriesImage(file);
      setOriginalImageBeforeProcess(null);
      updateDraftField('imageUrl', uploaded.url);
    } catch (error) {
      setErrorMessage(localizeError(error, t.series.uploadErrorFallback));
    } finally {
      setIsUploading(false);
    }
  };

  const handleProcessWhiteBackground = async () => {
    if (!draft.imageUrl || isProcessingWhiteBg || isUploading) return;
    setIsProcessingWhiteBg(true);
    setErrorMessage('');
    setImageProcessNotice('');
    const sourceImage = draft.imageUrl;
    try {
      const result = await mediaService.processWhiteBackground({
        imageUrl: sourceImage,
        targetAspectRatio: '3:4',
        backgroundColor: '#FFFFFF',
        paddingRatio: 0.08,
      });
      setOriginalImageBeforeProcess((prev) => prev ?? sourceImage);
      updateDraftField('imageUrl', result.url);
      setImageProcessNotice(
        result.isMockPlaceholder
          ? t.series.whiteBgMockNotice
          : t.series.whiteBgProcessedNotice
      );
    } catch (error) {
      setErrorMessage(localizeError(error, t.series.whiteBgErrorFallback));
    } finally {
      setIsProcessingWhiteBg(false);
    }
  };

  const handleRestoreOriginalImage = () => {
    if (!originalImageBeforeProcess) return;
    updateDraftField('imageUrl', originalImageBeforeProcess);
    setOriginalImageBeforeProcess(null);
    setImageProcessNotice('');
  };

  const handleSaveSeries = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setErrorMessage('');

    const payload: UpdateSeriesPayload = {
      name: draft.name,
      taglineEn: draft.taglineEn,
      taglineZh: draft.taglineZh,
      subtitle: draft.subtitle,
      description: draft.description,
      imageUrl: draft.imageUrl,
      tasting: draft.tasting,
      origin: draft.origin,
      abv: draft.abv,
    };

    try {
      const saved = await seriesService.updateSeries(deviceId, series.id, payload);
      setDraft(saved);
      setHasUnsavedChanges(false);
      onSeriesUpdated(saved);
      setStatusNotice(t.series.publishedNotice(deviceName));
      window.setTimeout(() => {
        setStatusNotice('');
      }, 2600);
    } catch (error) {
      setErrorMessage(localizeError(error, t.series.saveErrorFallback));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSeries = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setErrorMessage('');
    try {
      await seriesService.deleteSeries(deviceId, series.id);
      onSeriesDeleted(series.id);
    } catch (error) {
      setErrorMessage(localizeError(error, t.series.deleteErrorFallback));
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const activeSkuCount = series.skus.filter((item) => item.status === 'active').length;
  const headingSubtitle = locale === 'en' ? draft.taglineEn : draft.taglineZh;

  return (
    <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#FAF9F6]">
      {/* Solid White Architectural Top Bar Aligned to 1160px Editor Column */}
      <header className="sticky top-0 z-20 bg-white border-b border-[#E6E0D4]">
        <div className="max-w-[1160px] w-full mx-auto px-8 lg:px-12 h-[76px] flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-[14px] min-w-0">
            <span className="text-[#A88950] font-medium truncate max-w-[220px]">
              {deviceName}
            </span>
            <span className="text-[#CBC4B7]" aria-hidden="true">
              /
            </span>
            <span className="text-[#8E816C] whitespace-nowrap">
              {t.series.breadcrumbSeries}
            </span>
            <span className="text-[#CBC4B7]" aria-hidden="true">
              /
            </span>
            <span className="font-medium text-[#141414] truncate">
              {draft.name || series.name}
            </span>
            <span className="hidden xl:inline text-[#CBC4B7] mx-1" aria-hidden="true">
              ·
            </span>
            <span className="hidden xl:inline text-[13px] text-[#8E816C] tabular-nums whitespace-nowrap">
              {hasUnsavedChanges
                ? t.series.unsavedChanges
                : t.series.updatedAt(draft.updatedAt)}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {statusNotice && (
              <span className="text-[13px] text-[#A88950] font-medium mr-1 whitespace-nowrap">
                {statusNotice}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-4.5 py-2.5 border border-[#141414] bg-white text-[13.5px] font-medium text-[#141414] hover:bg-[#141414] hover:text-white transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#A88950]"
            >
              {t.series.previewButton}
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveSeries}
              className="px-5 py-2.5 bg-[#141414] hover:bg-[#2F2F2F] disabled:opacity-60 text-white text-[13.5px] font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#A88950]"
            >
              {isSaving ? t.common.saving : t.series.saveAndPublish}
            </button>
            <div className="h-5 w-[1px] bg-[#E6E0D4] mx-0.5" aria-hidden="true" />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content Area: Balanced 1160px Single-Column Series Information Editor */}
      <main className="flex-1 px-8 lg:px-12 py-12 max-w-[1160px] w-full mx-auto">
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 px-5 py-3.5 bg-[#FDF5F4] border border-[#EED3CF] text-[14px] text-[#B9382C] flex items-center justify-between gap-4"
          >
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-[13px] text-[#B9382C] hover:underline cursor-pointer whitespace-nowrap"
            >
              {t.common.dismiss}
            </button>
          </div>
        )}

        {/* Page Title & Prominent Top-Right SKU Management Entry */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-9 border-b border-[#E6E0D4]">
          <div>
            <p className="text-[12px] tracking-[0.22em] text-[#A88950] uppercase">
              {t.series.eyebrow}
            </p>
            <h1 className="font-luxury text-[44px] leading-tight text-[#141414] mt-1.5 font-semibold tracking-[0.02em]">
              {draft.name || series.name}{' '}
              {headingSubtitle && (
                <span className="font-sans text-[16px] font-normal tracking-normal text-[#8E816C] ml-2.5">
                  {headingSubtitle}
                </span>
              )}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <span className="text-[14px] text-[#6E675C] tabular-nums whitespace-nowrap">
              {t.series.activeSkuRatio(activeSkuCount, series.skus.length)}
            </span>
            <button
              type="button"
              onClick={onNavigateToSkus}
              className="px-6 py-3 bg-[#A88950] hover:bg-[#8E703A] text-white text-[14px] font-medium tracking-[0.03em] transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#141414]"
            >
              {t.series.enterSkuManagement(series.skus.length)}
            </button>
          </div>
        </div>

        {/* Structured Luxury Form Sections with Soft Architectural Elevation */}
        <div className="mt-11 space-y-11">
          {/* Section 1: Series Visual Asset */}
          <section className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-[13px] font-semibold text-[#A88950] tabular-nums">
                01
              </span>
              <h2
                className={`text-[20px] font-semibold text-[#141414] leading-snug whitespace-nowrap ${
                  locale === 'en' ? 'tracking-[-0.01em]' : 'tracking-[0.02em]'
                }`}
              >
                {t.series.visualSectionTitle}
              </h2>
            </div>

            <div className="bg-white border border-[#ECE7DD] shadow-[0_4px_20px_rgba(20,20,20,0.038),0_1px_3px_rgba(20,20,20,0.025)] p-7 sm:p-9 flex flex-col sm:flex-row items-center gap-9">
              <div className="w-[152px] h-[192px] shrink-0 bg-[#FAF8F4] flex items-center justify-center p-3.5 overflow-hidden">
                {draft.imageUrl ? (
                  <img
                    src={draft.imageUrl}
                    alt={draft.name}
                    width={124}
                    height={164}
                    fetchPriority="high"
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                ) : (
                  <span className="text-[13px] text-[#AEAEB2]">
                    {t.common.notUploaded}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 w-full space-y-4">
                <div className="text-[15px] text-[#4A4845] leading-relaxed">
                  {t.series.visualDescription}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploading || isProcessingWhiteBg}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 border border-[#141414] bg-white text-[14px] font-medium text-[#141414] hover:bg-[#141414] hover:text-white disabled:opacity-60 transition-colors duration-150 cursor-pointer whitespace-nowrap"
                  >
                    {isUploading ? t.common.uploading : t.series.changeImageButton}
                  </button>
                  <button
                    type="button"
                    disabled={!draft.imageUrl || isUploading || isProcessingWhiteBg}
                    onClick={() => void handleProcessWhiteBackground()}
                    className="px-5 py-2.5 border border-[#A88950] bg-[#FAF7F0] text-[14px] font-medium text-[#7A6136] hover:bg-[#A88950] hover:text-white disabled:opacity-45 disabled:hover:bg-[#FAF7F0] disabled:hover:text-[#7A6136] disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#141414]"
                  >
                    {isProcessingWhiteBg
                      ? t.series.processingWhiteBg
                      : t.series.processWhiteBgButton}
                  </button>
                  {draft.imageUrl && (
                    <>
                      <span
                        className="h-4 w-[1px] bg-[#E6E0D4] mx-0.5 hidden sm:inline-block"
                        aria-hidden="true"
                      />
                      {originalImageBeforeProcess && (
                        <button
                          type="button"
                          disabled={isProcessingWhiteBg}
                          onClick={handleRestoreOriginalImage}
                          className="px-2.5 py-2 text-[13.5px] text-[#7A6136] hover:text-[#141414] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {t.series.restoreOriginalImageButton}
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isProcessingWhiteBg}
                        onClick={() => {
                          setOriginalImageBeforeProcess(null);
                          setImageProcessNotice('');
                          updateDraftField('imageUrl', '');
                        }}
                        className="px-2.5 py-2 text-[13.5px] text-[#8E816C] hover:text-[#B9382C] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {t.series.removeImageButton}
                      </button>
                    </>
                  )}
                </div>

                <p className="text-[12.5px] text-[#8E816C] leading-relaxed">
                  {imageProcessNotice || t.series.visualSectionHint}
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Series Identity & Editorial Copy */}
          <section className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-[13px] font-semibold text-[#A88950] tabular-nums">
                02
              </span>
              <h2
                className={`text-[20px] font-semibold text-[#141414] leading-snug ${
                  locale === 'en' ? 'tracking-[-0.01em]' : 'tracking-[0.02em]'
                }`}
              >
                {t.series.basicInfoTitle}
              </h2>
            </div>

            <div className="bg-white border border-[#ECE7DD] shadow-[0_4px_20px_rgba(20,20,20,0.038),0_1px_3px_rgba(20,20,20,0.025)] p-7 sm:p-9 space-y-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-9 gap-y-6">
                <div>
                  <label
                    htmlFor="series-name"
                    className="block text-[13px] text-[#6E675C] mb-2"
                  >
                    {t.series.nameLabel}
                  </label>
                  <input
                    id="series-name"
                    type="text"
                    value={draft.name}
                    onChange={(e) => updateDraftField('name', e.target.value)}
                    placeholder={t.series.namePlaceholder}
                    className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="series-subtitle"
                    className="block text-[13px] text-[#6E675C] mb-2"
                  >
                    {t.series.subtitleLabel}
                  </label>
                  <input
                    id="series-subtitle"
                    type="text"
                    value={draft.subtitle}
                    onChange={(e) => updateDraftField('subtitle', e.target.value)}
                    placeholder={t.series.subtitlePlaceholder}
                    className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-9 gap-y-6">
                <div>
                  <label
                    htmlFor="tagline-en"
                    className="block text-[13px] text-[#6E675C] mb-2"
                  >
                    {t.series.taglinePrimaryLabel}
                  </label>
                  <input
                    id="tagline-en"
                    type="text"
                    value={draft.taglineEn}
                    onChange={(e) => updateDraftField('taglineEn', e.target.value)}
                    placeholder={t.series.taglinePrimaryPlaceholder}
                    className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="tagline-zh"
                    className="block text-[13px] text-[#6E675C] mb-2"
                  >
                    {t.series.taglineSecondaryLabel}
                  </label>
                  <input
                    id="tagline-zh"
                    type="text"
                    value={draft.taglineZh}
                    onChange={(e) => updateDraftField('taglineZh', e.target.value)}
                    placeholder={t.series.taglineSecondaryPlaceholder}
                    className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="series-description"
                  className="block text-[13px] text-[#6E675C] mb-2"
                >
                  {t.series.descriptionLabel}
                </label>
                <textarea
                  id="series-description"
                  rows={4}
                  value={draft.description}
                  onChange={(e) => updateDraftField('description', e.target.value)}
                  placeholder={t.series.descriptionPlaceholder}
                  className="mwg-auto-textarea w-full px-4 py-3.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] leading-relaxed text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Tasting Notes & Specifications */}
          <section className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-[13px] font-semibold text-[#A88950] tabular-nums">
                03
              </span>
              <h2
                className={`text-[20px] font-semibold text-[#141414] leading-snug ${
                  locale === 'en' ? 'tracking-[-0.01em]' : 'tracking-[0.02em]'
                }`}
              >
                {t.series.tastingSectionTitle}
              </h2>
            </div>

            <div className="bg-white border border-[#ECE7DD] shadow-[0_4px_20px_rgba(20,20,20,0.038),0_1px_3px_rgba(20,20,20,0.025)] p-7 sm:p-9 space-y-7">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-7">
                <div>
                  <label
                    htmlFor="tasting-aroma"
                    className="block text-[13px] text-[#6E675C] mb-2"
                  >
                    {draft.tasting.aromaLabel || t.series.aromaFallbackLabel}
                  </label>
                  <input
                    id="tasting-aroma"
                    type="text"
                    value={draft.tasting.aromaValue}
                    onChange={(e) =>
                      updateTastingField('aromaValue', e.target.value)
                    }
                    className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="tasting-palate"
                    className="block text-[13px] text-[#6E675C] mb-2"
                  >
                    {draft.tasting.palateLabel || t.series.palateFallbackLabel}
                  </label>
                  <input
                    id="tasting-palate"
                    type="text"
                    value={draft.tasting.palateValue}
                    onChange={(e) =>
                      updateTastingField('palateValue', e.target.value)
                    }
                    className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="tasting-finish"
                    className="block text-[13px] text-[#6E675C] mb-2"
                  >
                    {draft.tasting.finishLabel || t.series.finishFallbackLabel}
                  </label>
                  <input
                    id="tasting-finish"
                    type="text"
                    value={draft.tasting.finishValue}
                    onChange={(e) =>
                      updateTastingField('finishValue', e.target.value)
                    }
                    className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-9 gap-y-6 pt-5 border-t border-[#F0EAE0]">
                <div>
                  <label
                    htmlFor="series-origin"
                    className="block text-[13px] text-[#6E675C] mb-2"
                  >
                    {t.series.originLabel}
                  </label>
                  <input
                    id="series-origin"
                    type="text"
                    value={draft.origin}
                    onChange={(e) => updateDraftField('origin', e.target.value)}
                    placeholder={t.series.originPlaceholder}
                    className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="series-abv"
                    className="block text-[13px] text-[#6E675C] mb-2"
                  >
                    {t.series.abvLabel}
                  </label>
                  <input
                    id="series-abv"
                    type="text"
                    value={draft.abv}
                    onChange={(e) => updateDraftField('abv', e.target.value)}
                    placeholder={t.series.abvPlaceholder}
                    className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors tabular-nums"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Delete Series Action */}
          {canDelete && (
            <section className="pt-2 pb-8 flex items-center justify-end">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-[12px] text-[#8E816C] hover:text-[#B9382C] transition-colors cursor-pointer py-1 px-2"
                >
                  {t.series.deleteSeriesButton}
                </button>
              ) : (
                <div className="flex items-center gap-3 text-[12px]">
                  <span className="text-[#6E675C]">
                    {t.series.deleteConfirmPrompt(draft.name)}
                  </span>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDeleteSeries}
                    className="text-[#B9382C] font-medium hover:underline cursor-pointer disabled:opacity-60"
                  >
                    {isDeleting ? t.common.deleting : t.series.deleteConfirmButton}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-[#8E816C] hover:text-[#141414] cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* Native Top-Layer Frontend Preview Modal (<dialog> + @starting-style) */}
      <dialog
        ref={previewDialogRef}
        aria-labelledby={previewTitleId}
        className="mwg-dialog w-[min(840px,calc(100vw-3rem))] max-h-[90dvh]"
      >
        <div className="w-full max-h-[90dvh] bg-[#FAF9F6] border border-[#D8CBB2] border-t-2 border-t-[#141414] shadow-[0_28px_72px_rgba(20,20,20,0.18)] flex flex-col overflow-hidden">
          {/* Modal Header */}
          <div className="px-8 py-6 bg-white border-b border-[#E6E0D4] flex flex-wrap items-center justify-between gap-4 shrink-0">
            <div>
              <h2
                id={previewTitleId}
                className="text-[18px] font-semibold text-[#141414]"
              >
                {t.series.previewModalTitle}
              </h2>
              <p className="text-[12px] text-[#8E816C] mt-0.5">
                {t.series.previewModalSubtitle(draft.name)}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#D8CBB2] bg-white shrink-0">
                <button
                  type="button"
                  aria-pressed={previewMode === 'detail'}
                  onClick={() => setPreviewMode('detail')}
                  className={`px-3.5 py-1.5 text-[12px] font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                    previewMode === 'detail'
                      ? 'bg-[#141414] text-white'
                      : 'text-[#6E675C] hover:text-[#141414]'
                  }`}
                >
                  {t.series.previewCardMode}
                </button>
                <button
                  type="button"
                  aria-pressed={previewMode === 'stage'}
                  onClick={() => setPreviewMode('stage')}
                  className={`px-3.5 py-1.5 text-[12px] font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap border-l border-[#D8CBB2] ${
                    previewMode === 'stage'
                      ? 'bg-[#141414] text-white'
                      : 'text-[#6E675C] hover:text-[#141414]'
                  }`}
                >
                  {t.series.previewStageMode}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-2.5 py-1.5 text-[13px] text-[#6E675C] hover:text-[#141414] transition-colors cursor-pointer whitespace-nowrap"
              >
                {t.common.close}
              </button>
            </div>
          </div>

          {/* Modal Preview Canvas */}
          <div className="flex-1 overflow-y-auto mwg-scroll-stable p-6 sm:p-8">
            <ShowcaseCardPreview
              series={draft}
              showBottle={previewMode === 'stage'}
              seriesIndex={seriesIndex}
              totalSeries={totalSeries}
            />
          </div>

          {/* Modal Footer */}
          <div className="px-8 py-4 bg-white border-t border-[#E6E0D4] flex items-center justify-between gap-4 shrink-0 text-[12px]">
            <span className="text-[#8E816C]">{t.series.previewEscHint}</span>
            <button
              type="button"
              onClick={() => {
                setIsPreviewOpen(false);
                onOpenFullPreview();
              }}
              className="text-[#A88950] hover:text-[#141414] font-medium cursor-pointer whitespace-nowrap"
            >
              {t.series.openFullPreview}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};
