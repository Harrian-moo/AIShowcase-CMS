import React, { useId, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  CmsWorkspaceView,
  ProductSeries,
  ShowcaseDevice,
  StandbyAdItem,
} from '../types/cms';

interface SidebarProps {
  devices: ShowcaseDevice[];
  activeDevice: ShowcaseDevice | null;
  seriesList: ProductSeries[];
  selectedSeriesId: string;
  standbyAds: StandbyAdItem[];
  selectedAdId: string;
  workspaceView: CmsWorkspaceView;
  currentUser: string;
  onSelectDevice: (deviceId: string) => void;
  onOpenDeviceManagement: () => void;
  onSwitchToProducts: () => void;
  onSwitchToAiAds: () => void;
  onSelectSeries: (id: string) => void;
  onCreateSeries: () => void;
  onSelectAd: (adId: string) => void;
  onFocusAdGenerator: () => void;
  onLogout: () => void;
}

function supportsAnchorPositioning(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('anchor-name', '--mwg-check') &&
    CSS.supports('position-area', 'inline-end')
  );
}

export const Sidebar: React.FC<SidebarProps> = ({
  devices,
  activeDevice,
  seriesList,
  selectedSeriesId,
  standbyAds,
  selectedAdId,
  workspaceView,
  currentUser,
  onSelectDevice,
  onOpenDeviceManagement,
  onSwitchToProducts,
  onSwitchToAiAds,
  onSelectSeries,
  onCreateSeries,
  onSelectAd,
  onFocusAdGenerator,
  onLogout,
}) => {
  const { locale, t } = useLanguage();
  const isAiAdsModule = workspaceView === 'ai-ads';
  const isProductsModule =
    workspaceView === 'series-edit' || workspaceView === 'sku-list';
  const sortedAds = [...standbyAds].sort((a, b) => a.sortOrder - b.sortOrder);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState<boolean>(false);
  const [fallbackCoords, setFallbackCoords] = useState<{
    left: number;
    bottom: number;
  } | null>(null);

  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const popoverId = `device-switcher-${safeId}`;
  const anchorName = `--device-anchor-${safeId}`;

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const handleSwitcherToggle = (event: React.ToggleEvent<HTMLDivElement>) => {
    const nextOpen = event.newState === 'open';
    setIsSwitcherOpen(nextOpen);

    if (nextOpen && !supportsAnchorPositioning() && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setFallbackCoords({
        left: Math.round(rect.right + 36),
        bottom: Math.max(12, Math.round(window.innerHeight - rect.bottom)),
      });
    } else if (!nextOpen) {
      setFallbackCoords(null);
    }
  };

  const closeSwitcher = () => {
    popoverRef.current?.hidePopover?.();
  };

  const triggerStyle = {
    anchorName,
  } as React.CSSProperties;

  const popoverStyle = (
    fallbackCoords
      ? {
          positionAnchor: anchorName,
          left: `${fallbackCoords.left}px`,
          bottom: `${fallbackCoords.bottom}px`,
          top: 'auto',
          right: 'auto',
        }
      : {
          positionAnchor: anchorName,
        }
  ) as React.CSSProperties;

  return (
    <aside className="w-[304px] xl:w-[316px] shrink-0 bg-white border-r border-[#EAE4D9] shadow-[2px_0_16px_rgba(20,20,20,0.025)] flex flex-col h-screen sticky top-0 z-30">
      {/* Top-Left Brand Mark: Rémy Martin Centaur Logo */}
      <div className="px-7 pt-7 pb-5 border-b border-[#EFEAE0] flex flex-col items-start">
        <img
          src="/assets/remy/remy-logo.png"
          alt="Rémy Martin"
          width={166}
          height={68}
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-[64px] w-auto object-contain"
        />
        <p className="mt-3 text-[11px] tracking-[0.22em] text-[#8E7D63] uppercase">
          AI SHOWCASE CMS
        </p>
      </div>

      {/* Primary Top-Level Module Switcher (Option 1: Collections vs AI Standby Ads) */}
      <div className="px-7 py-4 border-b border-[#EFEAE0]">
        <div
          role="tablist"
          aria-label={t.sidebar.moduleSwitchAria}
          className="grid grid-cols-2 border border-[#DDD4C4] bg-[#FAF8F4] p-0.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={isProductsModule}
            onClick={onSwitchToProducts}
            className={`py-2 px-2 text-[13px] font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#A88950] ${
              isProductsModule
                ? 'bg-[#141414] text-white'
                : 'text-[#6E675C] hover:text-[#141414]'
            }`}
          >
            {t.sidebar.moduleProducts}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isAiAdsModule}
            onClick={onSwitchToAiAds}
            className={`py-2 px-2 text-[13px] font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#A88950] ${
              isAiAdsModule
                ? 'bg-[#141414] text-white'
                : 'text-[#6E675C] hover:text-[#141414]'
            }`}
          >
            {t.sidebar.moduleAiAds}
          </button>
        </div>
      </div>

      {/* Dynamic Middle Zone: Product Series Catalogue OR Standby Ad Playlist */}
      {isAiAdsModule ? (
        <div className="flex-1 overflow-y-auto mwg-scroll-stable pt-6 pb-6">
          <div className="px-7 mb-5 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2 min-w-0">
              <h2
                className={`text-[14px] font-semibold text-[#141414] whitespace-nowrap ${
                  locale === 'en' ? 'tracking-[0.04em] uppercase' : 'tracking-[0.1em]'
                }`}
              >
                {t.sidebar.adPlaylistTitle}
              </h2>
              <span className="text-[12px] text-[#9E9280] tabular-nums shrink-0">
                {String(sortedAds.length).padStart(2, '0')}
              </span>
            </div>
            <button
              type="button"
              onClick={onFocusAdGenerator}
              className={`px-3 py-1 border border-[#D4C7B0] bg-white text-[12px] font-medium text-[#7A6136] hover:border-[#141414] hover:bg-[#141414] hover:text-white transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#A88950] ${
                locale === 'en' ? 'tracking-[0.02em]' : 'tracking-[0.06em]'
              }`}
            >
              {t.sidebar.generateAdShort}
            </button>
          </div>

          {sortedAds.length === 0 ? (
            <p className="px-7 text-[12.5px] text-[#8E816C] leading-relaxed">
              {t.sidebar.adPlaylistEmpty}
            </p>
          ) : (
            <nav aria-label={t.sidebar.adPlaylistNavAria} className="px-5 space-y-1.5">
              {sortedAds.map((ad, index) => {
                const isSelected = ad.id === selectedAdId;
                return (
                  <div key={ad.id} className={isSelected ? 'py-1' : 'py-0'}>
                    <button
                      type="button"
                      aria-current={isSelected ? 'page' : undefined}
                      onClick={() => onSelectAd(ad.id)}
                      className={`group w-full text-left px-4 transition-all duration-200 ease-out cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A88950] ${
                        isSelected
                          ? 'py-4 bg-white border border-[#EFE9DD] shadow-[0_10px_28px_rgba(20,20,20,0.075),0_1px_4px_rgba(20,20,20,0.03)]'
                          : 'py-3 bg-transparent border border-transparent border-b-[#F2ECE2] hover:bg-[#FAF8F4] hover:border-b-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-2.5 min-w-0">
                          <span
                            className={`tabular-nums shrink-0 ${
                              isSelected
                                ? 'text-[12.5px] text-[#A88950] font-semibold'
                                : 'text-[11.5px] text-[#C5BDB0] group-hover:text-[#968466]'
                            }`}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span
                            className={`text-[11.5px] tracking-[0.1em] uppercase truncate ${
                              isSelected
                                ? 'text-[#A88950] font-semibold'
                                : 'text-[#8E816C]'
                            }`}
                          >
                            {ad.seriesName}
                          </span>
                        </div>
                        <span
                          className={`text-[11px] tabular-nums shrink-0 ${
                            ad.status === 'active'
                              ? isSelected
                                ? 'text-[#141414] font-medium'
                                : 'text-[#7D7568]'
                              : 'text-[#B5AEA2]'
                          }`}
                        >
                          {ad.status === 'active'
                            ? `${t.sidebar.adStatusActive} · ${t.sidebar.adDurationSeconds(ad.durationSeconds)}`
                            : t.sidebar.adStatusPaused}
                        </span>
                      </div>
                      <div
                        className={`mt-1.5 leading-snug line-clamp-1 transition-colors ${
                          isSelected
                            ? 'text-[14.5px] font-semibold text-[#141414]'
                            : 'text-[13.5px] font-medium text-[#5B564E] group-hover:text-[#141414]'
                        }`}
                      >
                        {ad.title || t.sidebar.adNoCopyLabel(ad.seriesName)}
                      </div>
                    </button>
                  </div>
                );
              })}
            </nav>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto mwg-scroll-stable pt-6 pb-6">
          <div className="px-7 mb-5 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2 min-w-0">
              <h2
                className={`text-[14px] font-semibold text-[#141414] whitespace-nowrap ${
                  locale === 'en' ? 'tracking-[0.04em] uppercase' : 'tracking-[0.1em]'
                }`}
              >
                {t.sidebar.productSeries}
              </h2>
              <span className="text-[12px] text-[#9E9280] tabular-nums shrink-0">
                {String(seriesList.length).padStart(2, '0')}
              </span>
            </div>
            <button
              type="button"
              onClick={onCreateSeries}
              className={`px-3 py-1 border border-[#D4C7B0] bg-white text-[12px] font-medium text-[#7A6136] hover:border-[#141414] hover:bg-[#141414] hover:text-white transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#A88950] ${
                locale === 'en' ? 'tracking-[0.02em]' : 'tracking-[0.06em]'
              }`}
            >
              {t.sidebar.addSeries}
            </button>
          </div>

          <nav aria-label={t.sidebar.seriesNavAria} className="px-5 space-y-1.5">
            {seriesList.map((series, index) => {
              const isSelected =
                workspaceView !== 'device-manage' && series.id === selectedSeriesId;
              const seriesSubtitle =
                locale === 'en'
                  ? series.taglineEn || series.taglineZh || t.sidebar.unnamedTheme
                  : series.taglineZh || t.sidebar.unnamedTheme;
              return (
                <div
                  key={series.id}
                  className={isSelected ? 'py-1' : 'py-0'}
                >
                  <button
                    type="button"
                    aria-current={isSelected ? 'page' : undefined}
                    onClick={() => onSelectSeries(series.id)}
                    className={`group w-full text-left px-4 transition-all duration-200 ease-out cursor-pointer flex items-center justify-between gap-3 focus-visible:outline-2 focus-visible:outline-[#A88950] ${
                      isSelected
                        ? 'py-4 bg-white border border-[#EFE9DD] shadow-[0_10px_28px_rgba(20,20,20,0.075),0_1px_4px_rgba(20,20,20,0.03)]'
                        : 'py-3 bg-transparent border border-transparent border-b-[#F2ECE2] hover:bg-[#FAF8F4] hover:border-b-transparent'
                    }`}
                  >
                    <div className="min-w-0 flex items-baseline gap-3">
                      <span
                        className={`tabular-nums shrink-0 transition-colors duration-200 ${
                          isSelected
                            ? 'text-[13px] text-[#A88950] font-semibold'
                            : 'text-[12px] text-[#C5BDB0] group-hover:text-[#968466]'
                        }`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <div
                          className={`font-luxury leading-tight tracking-[0.02em] truncate transition-all duration-200 ${
                            isSelected
                              ? 'text-[23px] text-[#141414] font-semibold'
                              : 'text-[18px] text-[#5B564E] font-medium group-hover:text-[#141414]'
                          }`}
                        >
                          {series.name}
                        </div>
                        <div
                          className={`tracking-[0.06em] truncate transition-colors duration-200 ${
                            isSelected
                              ? 'text-[12px] text-[#7D6E57] mt-1'
                              : 'text-[11px] text-[#A8A095] mt-0.5 group-hover:text-[#787066]'
                          }`}
                        >
                          {seriesSubtitle}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`tabular-nums shrink-0 transition-colors duration-200 ${
                        isSelected
                          ? 'text-[12.5px] text-[#A88950] font-semibold'
                          : 'text-[11.5px] text-[#BDB6AB] group-hover:text-[#847866]'
                      }`}
                    >
                      {series.skus.length} {t.sidebar.skuUnit}
                    </span>
                  </button>
                </div>
              );
            })}
          </nav>
        </div>
      )}

      {/* Bottom Zone: Native Popover API Right-Expanding Showcase Selector */}
      <div className="px-7 pt-5 pb-6 border-t border-[#E6E0D4] bg-white space-y-4">
        {activeDevice && (
          <div className="relative">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span
                className={`text-[11px] text-[#9A8E7A] whitespace-nowrap ${
                  locale === 'en' ? 'tracking-[0.06em] uppercase' : 'tracking-[0.14em]'
                }`}
              >
                {t.sidebar.currentShowcase}
              </span>
              <span className="text-[11px] text-[#9A8E7A] tabular-nums whitespace-nowrap shrink-0">
                {activeDevice.id} ·{' '}
                <span
                  className={
                    activeDevice.connectionStatus === 'online'
                      ? 'text-[#A88950] font-medium'
                      : 'text-[#A4A19B]'
                  }
                >
                  {activeDevice.connectionStatus === 'online'
                    ? t.common.online
                    : t.common.offline}
                </span>
              </span>
            </div>

            {/* Minimalist Hairline Select Trigger (Native Popover Invoker + Anchor) */}
            <button
              ref={triggerRef}
              type="button"
              popoverTarget={devices.length > 1 ? popoverId : undefined}
              popoverTargetAction={devices.length > 1 ? 'toggle' : undefined}
              aria-expanded={isSwitcherOpen}
              aria-haspopup="listbox"
              aria-controls={devices.length > 1 ? popoverId : undefined}
              disabled={devices.length <= 1}
              style={triggerStyle}
              className={`w-full px-3.5 py-3 bg-white border text-left transition-colors duration-150 flex items-center justify-between gap-3 focus-visible:outline-2 focus-visible:outline-[#A88950] ${
                devices.length > 1 ? 'cursor-pointer' : 'cursor-default'
              } ${
                isSwitcherOpen
                  ? 'border-[#141414] bg-[#FCFBF8]'
                  : 'border-[#DCD3C4] hover:border-[#141414]'
              }`}
            >
              <span className="text-[13.5px] font-medium text-[#141414] truncate">
                {activeDevice.name}
              </span>
              {devices.length > 1 && (
                <span
                  aria-hidden="true"
                  className="text-[11px] tracking-[0.1em] text-[#9A7D47] font-medium shrink-0"
                >
                  {isSwitcherOpen ? t.sidebar.collapseAction : t.sidebar.switchAction}
                </span>
              )}
            </button>

            {/* Right-Expanding Native Top-Layer Popover (Zero Overlap with Series List) */}
            {devices.length > 1 && (
              <div
                ref={popoverRef}
                id={popoverId}
                popover="auto"
                role="listbox"
                aria-label={t.sidebar.deviceListboxAria}
                onToggle={handleSwitcherToggle}
                style={popoverStyle}
                className="mwg-popover mwg-popover--device w-[320px] bg-white border border-[#D4C8B4] border-t-2 border-t-[#141414] shadow-[0_18px_42px_rgba(20,20,20,0.11)]"
              >
                <div className="px-4 py-2.5 border-b border-[#EFEAE0] bg-[#FAF8F4] flex items-center justify-between">
                  <span className="text-[11px] tracking-[0.14em] text-[#8E7D63]">
                    {t.sidebar.selectShowcaseHeader}
                  </span>
                  <span className="text-[11px] text-[#9A8E7A] tabular-nums">
                    {t.sidebar.totalDevicesCount(devices.length)}
                  </span>
                </div>
                <div className="max-h-[340px] overflow-y-auto mwg-scroll-stable divide-y divide-[#F2EDE4]">
                  {devices.map((device) => {
                    const isCurrent = device.id === activeDevice.id;
                    return (
                      <button
                        key={device.id}
                        type="button"
                        role="option"
                        aria-selected={isCurrent}
                        onClick={() => {
                          onSelectDevice(device.id);
                          closeSwitcher();
                        }}
                        className={`group w-full text-left px-4 py-3.5 transition-colors cursor-pointer border-l-[3px] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#A88950] ${
                          isCurrent
                            ? 'bg-[#FAF7F0] border-l-[#A88950]'
                            : 'bg-white border-l-transparent hover:bg-[#FCFBF8] hover:border-l-[#141414]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className={`text-[13px] truncate ${
                              isCurrent
                                ? 'font-medium text-[#141414]'
                                : 'font-normal text-[#45433F] group-hover:text-[#141414]'
                            }`}
                          >
                            {device.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] tracking-[0.12em] text-[#A88950] font-medium shrink-0">
                              {t.common.current}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-[11px] text-[#7D7568] truncate">
                          {device.location}
                        </div>
                        <div className="mt-1 text-[11px] tabular-nums text-[#9A8E7A]">
                          {device.id} ·{' '}
                          <span
                            className={
                              device.connectionStatus === 'online'
                                ? 'text-[#A88950] font-medium'
                                : 'text-[#A4A19B]'
                            }
                          >
                            {device.connectionStatus === 'online'
                              ? t.common.online
                              : t.common.offline}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Boutique Link to Bound Device Management */}
            <div className="mt-3.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  closeSwitcher();
                  onOpenDeviceManagement();
                }}
                className={`text-[13px] pb-0.5 border-b transition-colors cursor-pointer whitespace-nowrap ${
                  locale === 'en' ? 'tracking-normal' : 'tracking-[0.04em]'
                } ${
                  workspaceView === 'device-manage'
                    ? 'text-[#141414] border-[#A88950] font-medium'
                    : 'text-[#6E6E73] border-transparent hover:text-[#141414] hover:border-[#141414]'
                }`}
              >
                {t.sidebar.manageBoundDevices}
              </button>
              <span className="text-[12px] text-[#9A8E7A] tabular-nums whitespace-nowrap shrink-0">
                {t.sidebar.deviceCountUnit(devices.length)}
              </span>
            </div>
          </div>
        )}

        {/* Account Footer */}
        <div className="pt-3.5 border-t border-[#EFEAE0] flex items-center justify-between text-[13px] text-[#8E816C]">
          <span className="truncate">{t.sidebar.adminPrefix(currentUser)}</span>
          <button
            type="button"
            onClick={onLogout}
            className="text-[#6E6E73] hover:text-[#141414] transition-colors cursor-pointer whitespace-nowrap shrink-0 ml-2"
          >
            {t.sidebar.logout}
          </button>
        </div>
      </div>
    </aside>
  );
};
