import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ProductSeries } from '../types/cms';

interface ShowcaseCardPreviewProps {
  series: ProductSeries;
  showBottle?: boolean;
  seriesIndex?: number;
  totalSeries?: number;
}

export const ShowcaseCardPreview: React.FC<ShowcaseCardPreviewProps> = ({
  series,
  showBottle = false,
  seriesIndex = 0,
  totalSeries = 4,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white border border-[#E2DACB] overflow-hidden">
      <div
        className={`p-8 sm:p-10 ${
          showBottle ? 'grid grid-cols-1 xl:grid-cols-12 gap-8 items-center' : ''
        }`}
      >
        {showBottle && (
          <div className="xl:col-span-5 relative flex flex-col items-center justify-center py-6">
            {/* Subtle concentric champagne circles matching Image 1 */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div className="w-[240px] h-[240px] rounded-full border border-[#F2EEE6]" />
              <div className="absolute w-[180px] h-[180px] rounded-full border border-[#F5F1E9]" />
            </div>

            {series.imageUrl ? (
              <img
                src={series.imageUrl}
                alt={series.name}
                referrerPolicy="no-referrer"
                className="relative z-10 h-[280px] w-auto object-contain mix-blend-multiply transition-transform duration-300"
              />
            ) : (
              <div className="relative z-10 h-[280px] w-[160px] bg-[#FAF8F4] border border-[#EDE8DE] flex items-center justify-center text-[12px] text-[#A29580]">
                {t.preview.emptySeriesImage}
              </div>
            )}

            <div className="relative z-10 mt-4 self-start text-[12px] tracking-[0.2em] text-[#9A8E7A] tabular-nums">
              {String(seriesIndex + 1).padStart(2, '0')} / {String(totalSeries).padStart(2, '0')}
            </div>
          </div>
        )}

        {/* Exact Image 2 Frontend Typography Layout */}
        <div className={showBottle ? 'xl:col-span-7' : ''}>
          {/* Gold hairline with subtle diamond ornament */}
          <div className="flex items-center mb-5" aria-hidden="true">
            <div className="w-24 h-[1px] bg-[#C5B28E]" />
            <div className="w-2 h-2 border border-[#C5B28E] rotate-45 -ml-0.5 bg-white" />
          </div>

          {/* Kicker */}
          <div className="text-[12px] tracking-[0.28em] text-[#8E7F69] uppercase flex items-center flex-wrap gap-x-2.5">
            <span>{series.taglineEn || t.preview.fallbackTaglinePrimary}</span>
            <span aria-hidden="true" className="text-[#C5B28E]">
              ·
            </span>
            <span className="tracking-[0.24em]">
              {series.taglineZh || t.preview.fallbackTaglineSecondary}
            </span>
          </div>

          {/* Large Serif Display Title */}
          <h3 className="font-luxury text-[48px] sm:text-[56px] leading-[1.06] tracking-[0.06em] text-[#1D1D1F] mt-2.5 font-normal">
            {series.name || 'SERIES'}
          </h3>

          {/* Subtitle */}
          <p className="text-[12px] tracking-[0.26em] text-[#948671] uppercase mt-2">
            {series.subtitle || 'COGNAC FINE CHAMPAGNE'}
          </p>

          {/* Editorial Description */}
          <p className="mt-7 text-[15px] leading-[1.9] text-[#57544F] font-light">
            {series.description || t.preview.fallbackDescription}
          </p>

          {/* 3-Column Tasting Notes Hairline Grid */}
          <div className="mt-8 border-t border-b border-[#E6DFD2] grid grid-cols-3">
            <div className="py-5 pr-4 border-r border-[#E6DFD2]">
              <div className="text-[12px] text-[#9A8D78] mb-2">
                {series.tasting.aromaLabel || t.series.aromaFallbackLabel}
              </div>
              <div className="text-[15px] text-[#2C2A27] font-normal tracking-[0.02em]">
                {series.tasting.aromaValue || '—'}
              </div>
            </div>
            <div className="py-5 px-4 border-r border-[#E6DFD2]">
              <div className="text-[12px] text-[#9A8D78] mb-2">
                {series.tasting.palateLabel || t.series.palateFallbackLabel}
              </div>
              <div className="text-[15px] text-[#2C2A27] font-normal tracking-[0.02em]">
                {series.tasting.palateValue || '—'}
              </div>
            </div>
            <div className="py-5 pl-4">
              <div className="text-[12px] text-[#9A8D78] mb-2">
                {series.tasting.finishLabel || t.series.finishFallbackLabel}
              </div>
              <div className="text-[15px] text-[#2C2A27] font-normal tracking-[0.02em]">
                {series.tasting.finishValue || '—'}
              </div>
            </div>
          </div>

          {/* Origin & ABV Footer Line */}
          <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-1 text-[13px] tracking-[0.08em] text-[#8E816C]">
            <span>{series.origin || t.preview.fallbackOrigin}</span>
            <span className="tabular-nums">{series.abv || '40% VOL.'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
