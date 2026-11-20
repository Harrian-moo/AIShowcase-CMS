import React, { useMemo, useState } from 'react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { SkuEditorSheet } from '../components/SkuEditorSheet';
import { useLanguage } from '../i18n/LanguageContext';
import { mediaService, skuService } from '../services';
import { ApiError } from '../types/api';
import {
  CreateSkuPayload,
  ProductSeries,
  ProductSku,
  UpdateSkuPayload,
} from '../types/cms';

interface SkuManagementPageProps {
  deviceId: string;
  deviceName: string;
  series: ProductSeries;
  onBackToSeries: () => void;
  onSeriesSkusChanged: (seriesId: string, skus: ProductSku[]) => void;
}

type StatusFilter = 'all' | 'active' | 'inactive';

export const SkuManagementPage: React.FC<SkuManagementPageProps> = ({
  deviceId,
  deviceName,
  series,
  onBackToSeries,
  onSeriesSkusChanged,
}) => {
  const { t, localizeError } = useLanguage();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState<string>('');
  const [editingSku, setEditingSku] = useState<ProductSku | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const sortedAndFilteredSkus = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...series.skus]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter((item) => {
        if (filter !== 'all' && item.status !== filter) return false;
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          item.englishName.toLowerCase().includes(q) ||
          item.skuCode.toLowerCase().includes(q) ||
          item.volume.toLowerCase().includes(q) ||
          item.shelfSlot.toLowerCase().includes(q)
        );
      });
  }, [series.skus, filter, query]);

  const activeCount = series.skus.filter((s) => s.status === 'active').length;
  const inactiveCount = series.skus.length - activeCount;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(''), 2200);
  };

  const handleOpenNewSku = () => {
    const nextOrder =
      series.skus.reduce((max, item) => Math.max(max, item.sortOrder), 0) + 1;
    const prefix = series.name.replace(/\s+/g, '').toUpperCase() || 'RM';
    const draftSku: ProductSku = {
      id: '',
      seriesId: series.id,
      skuCode: `RM-${prefix}-${String(nextOrder).padStart(2, '0')}0`,
      name: t.sku.draftDefaultName(series.name),
      englishName: `Rémy Martin ${series.name} Fine Champagne Cognac 700ml`,
      volume: '700ml',
      abv: series.abv || '40% VOL.',
      price: t.sku.draftDefaultPricePrefix,
      packaging: t.sku.draftDefaultPackaging,
      shelfSlot: `S-0${nextOrder}`,
      status: 'active',
      sortOrder: nextOrder,
      highlight: '',
      description: '',
      servingSuggestion: t.sku.draftDefaultServing,
      imageUrl: series.imageUrl,
      updatedAt: '',
    };
    setErrorMessage('');
    setIsCreatingNew(true);
    setEditingSku(draftSku);
  };

  const handleSaveSku = async (draft: ProductSku) => {
    setErrorMessage('');
    const payload: CreateSkuPayload & UpdateSkuPayload = {
      skuCode: draft.skuCode,
      name: draft.name,
      englishName: draft.englishName,
      volume: draft.volume,
      abv: draft.abv,
      price: draft.price,
      packaging: draft.packaging,
      shelfSlot: draft.shelfSlot,
      status: draft.status,
      sortOrder: draft.sortOrder,
      highlight: draft.highlight,
      description: draft.description,
      servingSuggestion: draft.servingSuggestion,
      imageUrl: draft.imageUrl,
    };

    if (isCreatingNew) {
      const created = await skuService.createSku(deviceId, series.id, payload);
      onSeriesSkusChanged(series.id, [...series.skus, created]);
      setEditingSku(null);
      setIsCreatingNew(false);
      showToast(t.sku.toastCreated);
    } else {
      const updated = await skuService.updateSku(
        deviceId,
        series.id,
        draft.id,
        payload
      );
      const nextSkus = series.skus.map((item) =>
        item.id === updated.id ? updated : item
      );
      onSeriesSkusChanged(series.id, nextSkus);
      setEditingSku(null);
      setIsCreatingNew(false);
      showToast(t.sku.toastUpdated);
    }
  };

  const handleDeleteSku = async (skuId: string) => {
    setErrorMessage('');
    await skuService.deleteSku(deviceId, series.id, skuId);
    const nextSkus = series.skus.filter((item) => item.id !== skuId);
    onSeriesSkusChanged(series.id, nextSkus);
    setEditingSku(null);
    setIsCreatingNew(false);
    showToast(t.sku.toastDeleted);
  };

  const handleUploadImage = async (file: File): Promise<string> => {
    try {
      const result = await mediaService.uploadImage(file);
      return result.url;
    } catch (error) {
      throw new ApiError(localizeError(error, t.sku.uploadErrorFallback));
    }
  };

  const handleProcessWhiteBackground = async (imageUrl: string) => {
    try {
      return await mediaService.processWhiteBackground({
        imageUrl,
        targetAspectRatio: '3:4',
        backgroundColor: '#FFFFFF',
        paddingRatio: 0.08,
      });
    } catch (error) {
      throw new ApiError(localizeError(error, t.skuSheet.whiteBgErrorFallback));
    }
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col h-screen bg-[#FAF9F6] overflow-hidden">
      {/* Solid White Architectural Header Aligned to 1160px Content Grid */}
      <header className="shrink-0 bg-white border-b border-[#E6E0D4]">
        <div className="max-w-[1160px] w-full mx-auto px-8 lg:px-12 h-[76px] flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-[14px] min-w-0">
            <span className="text-[#A88950] font-medium truncate max-w-[200px]">
              {deviceName}
            </span>
            <span className="text-[#CBC4B7]" aria-hidden="true">
              /
            </span>
            <span className="text-[#8E816C] whitespace-nowrap">
              {t.sku.breadcrumbSeries}
            </span>
            <span className="text-[#CBC4B7]" aria-hidden="true">
              /
            </span>
            <button
              type="button"
              onClick={onBackToSeries}
              className="text-[#6E675C] hover:text-[#141414] transition-colors cursor-pointer whitespace-nowrap"
            >
              {series.name}
            </button>
            <span className="text-[#CBC4B7]" aria-hidden="true">
              /
            </span>
            <span className="font-medium text-[#141414] whitespace-nowrap">
              {t.sku.breadcrumbSkuManagement}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {toastMessage && (
              <span className="text-[13px] text-[#A88950] font-medium mr-1 whitespace-nowrap">
                {toastMessage}
              </span>
            )}
            <button
              type="button"
              onClick={onBackToSeries}
              className="px-4.5 py-2.5 border border-[#141414] bg-white text-[13.5px] font-medium text-[#141414] hover:bg-[#141414] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.sku.backToSeries}
            </button>
            <button
              type="button"
              onClick={handleOpenNewSku}
              className="px-5 py-2.5 bg-[#A88950] hover:bg-[#8E703A] text-white text-[13.5px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.sku.addSkuButton}
            </button>
            <div className="h-5 w-[1px] bg-[#E6E0D4] mx-0.5" aria-hidden="true" />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Sub-header Toolbar: Title, Filter Tabs, Search (Aligned 1160px) */}
      <div className="shrink-0 px-8 lg:px-12 pt-10 pb-7 max-w-[1160px] w-full mx-auto">
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 px-5 py-3 bg-[#FDF5F4] border border-[#EED3CF] text-[14px] text-[#B9382C]"
          >
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-7 border-b border-[#E6E0D4]">
          <div>
            <p className="text-[12px] tracking-[0.22em] text-[#A88950] uppercase">
              {t.sku.eyebrow(series.name)}
            </p>
            <h1 className="font-luxury text-[42px] leading-tight text-[#141414] mt-1.5 font-semibold tracking-[0.01em]">
              {t.sku.pageTitle}
            </h1>
            <p className="text-[14px] text-[#8E816C] mt-1.5 tabular-nums">
              {t.sku.pageSubtitle(series.skus.length)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.sku.searchPlaceholder}
              aria-label={t.sku.searchAria}
              className="w-[248px] px-4 py-2.5 bg-white border border-[#D8CBB2] text-[14px] text-[#141414] placeholder:text-[#AEABA4] focus:border-[#141414] focus:outline-none transition-colors"
            />

            {/* Sharp Architectural Status Filter */}
            <div className="flex items-center border border-[#D8CBB2] bg-white">
              <button
                type="button"
                aria-pressed={filter === 'all'}
                onClick={() => setFilter('all')}
                className={`px-4 py-2.5 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                  filter === 'all'
                    ? 'bg-[#141414] text-white'
                    : 'text-[#6E675C] hover:text-[#141414]'
                }`}
              >
                {t.sku.filterAll(series.skus.length)}
              </button>
              <button
                type="button"
                aria-pressed={filter === 'active'}
                onClick={() => setFilter('active')}
                className={`px-4 py-2.5 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap tabular-nums border-l border-[#D8CBB2] ${
                  filter === 'active'
                    ? 'bg-[#141414] text-white'
                    : 'text-[#6E675C] hover:text-[#141414]'
                }`}
              >
                {t.sku.filterActive(activeCount)}
              </button>
              <button
                type="button"
                aria-pressed={filter === 'inactive'}
                onClick={() => setFilter('inactive')}
                className={`px-4 py-2.5 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap tabular-nums border-l border-[#D8CBB2] ${
                  filter === 'inactive'
                    ? 'bg-[#141414] text-white'
                    : 'text-[#6E675C] hover:text-[#141414]'
                }`}
              >
                {t.sku.filterInactive(inactiveCount)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Scrollable Single-Product Card Feed (@container responsive, Aligned 1160px) */}
      <main className="flex-1 overflow-y-auto mwg-scroll-stable pb-16 scroll-smooth">
        <div className="max-w-[1160px] w-full mx-auto px-8 lg:px-12">
          <div className="@container space-y-6">
          {sortedAndFilteredSkus.length === 0 ? (
            <div className="bg-white border border-[#ECE7DD] shadow-[0_4px_20px_rgba(20,20,20,0.038),0_1px_3px_rgba(20,20,20,0.025)] py-20 px-8 text-center">
              <p className="font-luxury text-[24px] text-[#141414]">
                {t.sku.emptyTitle}
              </p>
              <p className="text-[13px] text-[#8E816C] mt-2">
                {series.skus.length === 0
                  ? t.sku.emptyNoSkusHint(series.name)
                  : t.sku.emptyFilterHint}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                {query || filter !== 'all' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setFilter('all');
                    }}
                    className="px-4 py-2 border border-[#141414] bg-white text-[13px] text-[#141414] hover:bg-[#141414] hover:text-white cursor-pointer"
                  >
                    {t.sku.resetFilter}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleOpenNewSku}
                  className="px-5 py-2 bg-[#A88950] hover:bg-[#8E703A] text-white text-[13px] font-medium cursor-pointer"
                >
                  {t.sku.addSkuButton}
                </button>
              </div>
            </div>
          ) : (
            sortedAndFilteredSkus.map((sku, idx) => (
              <button
                key={sku.id}
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingSku(sku);
                }}
                className="group w-full text-left bg-white border border-[#ECE7DD] shadow-[0_4px_18px_rgba(20,20,20,0.035),0_1px_3px_rgba(20,20,20,0.02)] hover:border-[#C8B99E] hover:shadow-[0_10px_28px_rgba(20,20,20,0.06)] p-6 @xl:p-8 transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A88950]"
              >
                <div className="flex flex-col @xl:flex-row items-stretch gap-7 @xl:gap-9">
                  {/* Left: Seamless High-Key Studio Product Plinth */}
                  <div className="w-full @xl:w-[180px] h-[220px] shrink-0 bg-[#FAF8F4] flex items-center justify-center p-4 overflow-hidden">
                    {sku.imageUrl ? (
                      <img
                        src={sku.imageUrl}
                        alt={sku.name}
                        width={148}
                        height={188}
                        loading={idx < 2 ? 'eager' : 'lazy'}
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <span className="text-[13px] text-[#AEAEB2]">
                        {t.common.noImage}
                      </span>
                    )}
                  </div>

                  {/* Right: Structured Editorial Product Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {/* Quiet Unboxed Metadata Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#8E816C] tabular-nums">
                          <span className="font-medium text-[#A88950]">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{sku.skuCode}</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              sku.status === 'active'
                                ? 'text-[#141414] font-medium'
                                : 'text-[#9A9A9E]'
                            }
                          >
                            {sku.status === 'active'
                              ? t.sku.statusActive
                              : t.sku.statusInactive}
                          </span>
                          {sku.shelfSlot && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{t.sku.shelfSlotPrefix(sku.shelfSlot)}</span>
                            </>
                          )}
                        </div>

                        <span className="text-[13px] font-medium text-[#A88950] group-hover:text-[#141414] transition-colors whitespace-nowrap">
                          {t.sku.editProductLink}
                        </span>
                      </div>

                      {/* Product Title & Secondary Name */}
                      <h2 className="text-[21px] font-semibold text-[#141414] mt-3 leading-snug">
                        {sku.name}
                      </h2>
                      {sku.englishName && (
                        <p className="text-[13px] tracking-[0.04em] text-[#8E816C] mt-1">
                          {sku.englishName}
                        </p>
                      )}

                      {/* Selling Point / Description */}
                      <p className="text-[15px] text-[#4A4845] leading-relaxed mt-3.5 line-clamp-2">
                        {sku.highlight || sku.description || t.sku.emptyHighlightHint}
                      </p>
                    </div>

                    {/* Hairline Specification Bar (@container responsive grid) */}
                    <div className="mt-6 pt-4 border-t border-[#EFEAE0] grid grid-cols-2 @2xl:grid-cols-4 gap-5">
                      <div>
                        <div className="text-[12px] text-[#8E816C]">
                          {t.sku.specVolume}
                        </div>
                        <div className="text-[15px] font-medium text-[#141414] mt-0.5 tabular-nums">
                          {sku.volume || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[12px] text-[#8E816C]">
                          {t.sku.specAbv}
                        </div>
                        <div className="text-[15px] font-medium text-[#141414] mt-0.5 tabular-nums">
                          {sku.abv || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[12px] text-[#8E816C]">
                          {t.sku.specPrice}
                        </div>
                        <div className="text-[15px] font-medium text-[#A88950] mt-0.5 tabular-nums">
                          {sku.price || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[12px] text-[#8E816C]">
                          {t.sku.specPackaging}
                        </div>
                        <div className="text-[15px] font-medium text-[#141414] mt-0.5 truncate">
                          {sku.packaging || '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
          </div>
        </div>
      </main>

      {/* Slide-Over Detail Editor when a SKU card is clicked */}
      <SkuEditorSheet
        sku={editingSku}
        seriesName={series.name}
        seriesDefaultImage={series.imageUrl}
        isNew={isCreatingNew}
        onClose={() => {
          setEditingSku(null);
          setIsCreatingNew(false);
        }}
        onSave={handleSaveSku}
        onDelete={handleDeleteSku}
        onUploadImage={handleUploadImage}
        onProcessWhiteBackground={handleProcessWhiteBackground}
      />
    </div>
  );
};
