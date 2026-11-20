import React, { useEffect, useState } from 'react';
import { useNativeDialog } from '../hooks/useNativeDialog';
import { useLanguage } from '../i18n/LanguageContext';
import { ProductSeries } from '../types/cms';
import { LanguageSwitcher } from './LanguageSwitcher';

interface ShowcaseFullPreviewProps {
  deviceName?: string;
  deviceId?: string;
  seriesList: ProductSeries[];
  initialSeriesId: string;
  onClose: () => void;
}

export const ShowcaseFullPreview: React.FC<ShowcaseFullPreviewProps> = ({
  deviceName,
  deviceId,
  seriesList,
  initialSeriesId,
  onClose,
}) => {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState<string>(initialSeriesId);
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);

  const activeIndex = Math.max(
    0,
    seriesList.findIndex((s) => s.id === activeId)
  );
  const activeSeries = seriesList[activeIndex] || seriesList[0];

  const dialogRef = useNativeDialog({
    isOpen: Boolean(activeSeries),
    onClose,
    canDismiss: true,
    lightDismiss: false,
  });

  const activeSkus = activeSeries
    ? activeSeries.skus
        .filter((item) => item.status === 'active')
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  const activeSku =
    activeSkus.find((s) => s.id === selectedSkuId) || null;

  useEffect(() => {
    setSelectedSkuId(null);
  }, [activeId]);

  if (!activeSeries) return null;

  const displayImage = activeSku?.imageUrl || activeSeries.imageUrl;

  return (
    <dialog
      ref={dialogRef}
      aria-label={t.preview.fullPreviewAria}
      className="mwg-fullscreen-dialog overflow-y-auto mwg-scroll-stable"
    >
      {/* Top Bar matching Image 1 */}
      <div className="px-10 lg:px-16 pt-8 pb-4 flex items-start justify-between gap-6 shrink-0">
        <img
          src="/assets/remy/remy-logo.png"
          alt="Rémy Martin"
          width={180}
          height={74}
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-[74px] w-auto object-contain"
        />

        <div className="flex items-center gap-3 pt-1">
          <span className="text-[12px] tracking-[0.12em] text-[#9A8B73] mr-2 hidden sm:inline tabular-nums">
            {deviceName
              ? `${deviceName} · ${deviceId ?? ''}`
              : t.preview.livePreviewLabel}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-[#141414] bg-[#141414] text-[13px] font-medium tracking-[0.04em] text-white hover:bg-[#A88950] hover:border-[#A88950] transition-colors cursor-pointer whitespace-nowrap"
          >
            {t.preview.backToCmsButton}
          </button>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Showcase Stage */}
      <div className="flex-1 max-w-[1360px] w-full mx-auto px-10 lg:px-16 py-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Bottle Stage with Concentric Champagne Rings */}
        <div className="lg:col-span-5 relative flex flex-col items-center justify-center py-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="w-[380px] h-[380px] sm:w-[440px] sm:h-[440px] rounded-full border border-[#F3EFE8]" />
            <div className="absolute w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] rounded-full border border-[#F6F3EC]" />
            <div className="absolute w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] rounded-full border border-[#F9F6F1]" />
          </div>

          {displayImage ? (
            <img
              src={displayImage}
              alt={activeSku ? activeSku.name : activeSeries.name}
              fetchPriority="high"
              referrerPolicy="no-referrer"
              className="relative z-10 h-[360px] sm:h-[440px] w-auto object-contain mix-blend-multiply transition-all duration-300"
            />
          ) : (
            <div className="relative z-10 h-[380px] w-[200px] rounded-2xl bg-[#FAF9F6] border border-[#EDE8DF] flex items-center justify-center text-[13px] text-[#9A8E7A]">
              {t.preview.emptyMainImage}
            </div>
          )}

          <div className="relative z-10 self-start mt-2 text-[13px] tracking-[0.22em] text-[#9A8E7A] tabular-nums">
            {String(activeIndex + 1).padStart(2, '0')} /{' '}
            {String(seriesList.length).padStart(2, '0')}
          </div>
        </div>

        {/* Right: Editorial Specification Block */}
        <div className="lg:col-span-7 max-w-[580px]">
          {/* Gold Hairline & Diamond */}
          <div className="flex items-center mb-6" aria-hidden="true">
            <div className="w-36 h-[1px] bg-[#C5B28E]" />
            <div className="w-2.5 h-2.5 border border-[#C5B28E] rotate-45 -ml-0.5 bg-white" />
          </div>

          <div className="text-[13px] tracking-[0.3em] text-[#8E7F69] uppercase flex items-center gap-3">
            <span>{activeSeries.taglineEn}</span>
            <span aria-hidden="true" className="text-[#C5B28E]">
              ·
            </span>
            <span className="tracking-[0.26em]">{activeSeries.taglineZh}</span>
          </div>

          <h1 className="font-luxury text-[64px] sm:text-[74px] leading-[1.05] tracking-[0.06em] text-[#1D1D1F] mt-2 font-normal">
            {activeSeries.name}
          </h1>

          <p className="text-[13px] tracking-[0.28em] text-[#948671] uppercase mt-2">
            {activeSeries.subtitle}
          </p>

          <p className="mt-8 text-[16px] leading-[1.95] text-[#57544F] font-light">
            {activeSku?.description || activeSeries.description}
          </p>

          {/* 3-Column Tasting Notes */}
          <div className="mt-9 border-t border-b border-[#E6DFD2] grid grid-cols-3">
            <div className="py-5 pr-5 border-r border-[#E6DFD2]">
              <div className="text-[13px] text-[#9A8D78] mb-2">
                {activeSeries.tasting.aromaLabel}
              </div>
              <div className="text-[17px] text-[#2C2A27]">
                {activeSeries.tasting.aromaValue}
              </div>
            </div>
            <div className="py-5 px-5 border-r border-[#E6DFD2]">
              <div className="text-[13px] text-[#9A8D78] mb-2">
                {activeSeries.tasting.palateLabel}
              </div>
              <div className="text-[17px] text-[#2C2A27]">
                {activeSeries.tasting.palateValue}
              </div>
            </div>
            <div className="py-5 pl-5">
              <div className="text-[13px] text-[#9A8D78] mb-2">
                {activeSeries.tasting.finishLabel}
              </div>
              <div className="text-[17px] text-[#2C2A27]">
                {activeSeries.tasting.finishValue}
              </div>
            </div>
          </div>

          {/* Origin & ABV */}
          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 text-[14px] tracking-[0.08em] text-[#8E816C]">
            <span>{activeSeries.origin}</span>
            <span className="tabular-nums">
              {activeSku?.abv || activeSeries.abv}
            </span>
            {activeSku && (
              <>
                <span className="tabular-nums text-[#8F7038] font-medium">
                  {activeSku.volume}
                </span>
                <span className="tabular-nums text-[#8F7038] font-medium">
                  {activeSku.price}
                </span>
              </>
            )}
          </div>

          {/* Active SKUs Quick Selector */}
          {activeSkus.length > 0 && (
            <div className="mt-7 pt-5 border-t border-[#F2EEE6]">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
                <span className="text-[#9A8E7A] tracking-[0.12em]">
                  {t.preview.seriesFormatsLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSkuId(null)}
                  className={`pb-0.5 transition-colors cursor-pointer whitespace-nowrap ${
                    selectedSkuId === null
                      ? 'text-[#1D1D1F] font-medium border-b border-[#B5945B]'
                      : 'text-[#8E8E93] hover:text-[#1D1D1F]'
                  }`}
                >
                  {t.preview.seriesOverviewButton}
                </button>
                {activeSkus.map((sku) => (
                  <button
                    key={sku.id}
                    type="button"
                    onClick={() => setSelectedSkuId(sku.id)}
                    className={`pb-0.5 transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                      selectedSkuId === sku.id
                        ? 'text-[#8F7038] font-medium border-b border-[#B5945B]'
                        : 'text-[#8E8E93] hover:text-[#1D1D1F]'
                    }`}
                  >
                    {sku.volume} · {sku.price}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Series Selector matching Double-Border Champagne Cards */}
      <div className="max-w-[1360px] w-full mx-auto px-10 lg:px-16 pt-4 pb-10 shrink-0">
        <div className="text-[13px] tracking-[0.16em] text-[#8E7F69] mb-4">
          {t.preview.selectSeriesTitle}
        </div>

        <div className="flex items-stretch gap-5 overflow-x-auto pb-2">
          {seriesList.map((series) => {
            const isSelected = series.id === activeSeries.id;
            return (
              <button
                key={series.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setActiveId(series.id)}
                className={`shrink-0 w-[268px] p-1.5 rounded-[26px] border transition-all duration-200 cursor-pointer text-left ${
                  isSelected
                    ? 'border-[#C9B387] bg-[#FDFBF7] shadow-[0_8px_24px_rgba(181,148,91,0.12)]'
                    : 'border-[#EFEAE0] bg-white hover:border-[#DDD1BA]'
                }`}
              >
                <div
                  className={`rounded-[20px] border px-5 py-4 flex items-center gap-5 ${
                    isSelected ? 'border-[#E6D9BE]' : 'border-[#F5F1E9]'
                  }`}
                >
                  <div className="w-[52px] h-[72px] shrink-0 flex items-center justify-center">
                    {series.imageUrl ? (
                      <img
                        src={series.imageUrl}
                        alt={series.name}
                        width={52}
                        height={72}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                      />
                    ) : (
                      <span className="text-[10px] text-[#B8AE9D]">—</span>
                    )}
                  </div>
                  <div className="h-[46px] w-[1px] bg-[#EFEAE0] shrink-0" />
                  <div className="min-w-0">
                    <div className="font-luxury text-[28px] leading-none tracking-[0.06em] text-[#1D1D1F] truncate">
                      {series.name}
                    </div>
                    <div className="text-[10px] tracking-[0.22em] text-[#9A8B73] uppercase mt-2">
                      RÉMY MARTIN
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </dialog>
  );
};
