import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useNativeDialog } from '../hooks/useNativeDialog';
import { useLanguage } from '../i18n/LanguageContext';
import { adService } from '../services';
import {
  AdCopyMode,
  AdHistoryItem,
  AdVisualStyle,
  ProductSeries,
  StandbyAdItem,
  StandbyCarouselConfig,
} from '../types/cms';

interface AiAdsPageProps {
  deviceId: string;
  deviceName: string;
  seriesList: ProductSeries[];
  standbyConfig: StandbyCarouselConfig;
  selectedAdId: string;
  focusGeneratorToken: number;
  onSelectAd: (adId: string) => void;
  onStandbyConfigChanged: (config: StandbyCarouselConfig) => void;
}

const VISUAL_STYLES: AdVisualStyle[] = [
  'luxury-studio',
  'sunlit-estate',
  'festive-gifting',
  'modern-french',
];

const IDLE_TIMEOUT_OPTIONS = [30, 45, 60, 90, 120, 300];
const SLIDE_DURATION_OPTIONS = [5, 8, 10, 12, 15];

type HistoryGroupBy = 'date' | 'product';
type HistoryStatusFilter = 'all' | 'unsaved' | 'saved';

function formatLocalDateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getPosterThemeClasses(style: AdVisualStyle) {
  switch (style) {
    case 'sunlit-estate':
      return {
        canvas: 'bg-[#F7F3E8] text-[#24301E]',
        eyebrow: 'text-[#8B713D]',
        title: 'text-[#24301E]',
        subtitle: 'text-[#66705B]',
        divider: 'bg-[#BBA66E]/55',
        cta: 'border-[#8B713D] text-[#6F592F]',
        imgBlend: 'mix-blend-multiply',
      };
    case 'nocturne-lounge':
      return {
        canvas: 'bg-[#141414] text-white',
        eyebrow: 'text-[#C6A76E]',
        title: 'text-white',
        subtitle: 'text-[#D6CFC2]',
        divider: 'bg-[#C6A76E]/50',
        cta: 'border-[#C6A76E] text-[#E9D7B5]',
        imgBlend: '',
      };
    case 'festive-gifting':
      return {
        canvas: 'bg-[#261812] text-[#FAF5EC]',
        eyebrow: 'text-[#D4AF6A]',
        title: 'text-[#FAF5EC]',
        subtitle: 'text-[#DFD1BF]',
        divider: 'bg-[#D4AF6A]/60',
        cta: 'border-[#D4AF6A] text-[#F1DFBE]',
        imgBlend: '',
      };
    case 'modern-french':
      return {
        canvas: 'bg-[#F3EFE6] text-[#141414]',
        eyebrow: 'text-[#8E703A]',
        title: 'text-[#141414]',
        subtitle: 'text-[#555049]',
        divider: 'bg-[#A88950]/50',
        cta: 'border-[#141414] text-[#141414]',
        imgBlend: 'mix-blend-multiply',
      };
    case 'luxury-studio':
    default:
      return {
        canvas: 'bg-[#FAF8F4] text-[#141414]',
        eyebrow: 'text-[#A88950]',
        title: 'text-[#141414]',
        subtitle: 'text-[#5A554E]',
        divider: 'bg-[#CBB999]',
        cta: 'border-[#A88950] text-[#7A6136]',
        imgBlend: 'mix-blend-multiply',
      };
  }
}

interface StandbyPosterCanvasProps {
  seriesName: string;
  imageUrl: string;
  visualStyle: AdVisualStyle;
  copyMode: AdCopyMode;
  title: string;
  subtitle: string;
  ctaText: string;
  indexLabel?: string;
  size: 'thumb' | 'card' | 'modal';
  noImageLabel: string;
}

const StandbyPosterCanvas: React.FC<StandbyPosterCanvasProps> = ({
  seriesName,
  imageUrl,
  visualStyle,
  copyMode,
  title,
  subtitle,
  ctaText,
  indexLabel,
  size,
  noImageLabel,
}) => {
  const theme = getPosterThemeClasses(visualStyle);
  const isNoCopy = copyMode === 'no-copy';
  const hasTitle = !isNoCopy && title.trim().length > 0;
  const hasSubtitle = !isNoCopy && subtitle.trim().length > 0;
  const hasCta = !isNoCopy && ctaText.trim().length > 0;
  const hasAnyCopy = hasTitle || hasSubtitle || hasCta;

  const paddingClass =
    size === 'thumb' ? 'p-4' : size === 'modal' ? 'p-6 sm:p-7' : 'p-7';

  const imgMaxHeightClass = isNoCopy
    ? size === 'thumb'
      ? 'max-h-[185px]'
      : size === 'modal'
        ? 'max-h-[320px]'
        : 'max-h-[340px]'
    : size === 'thumb'
      ? 'max-h-[120px]'
      : size === 'modal'
        ? 'max-h-[210px]'
        : 'max-h-[220px]';

  const titleClass =
    size === 'thumb'
      ? 'text-[14px]'
      : size === 'modal'
        ? 'text-[21px]'
        : 'text-[22px]';

  const subtitleClass =
    size === 'thumb' ? 'text-[10.5px] line-clamp-2' : 'text-[12.5px] line-clamp-3';

  return (
    <div
      className={`w-full aspect-[3/4] ${theme.canvas} border border-[#E6E0D4] ${paddingClass} flex flex-col justify-between transition-colors duration-200 overflow-hidden`}
    >
      {/* Pure product visual when no-copy is selected; top brand rail only on with-copy */}
      {!isNoCopy && (
        <div
          className={`flex items-center justify-between gap-2 uppercase shrink-0 ${
            size === 'thumb'
              ? 'text-[8.5px] tracking-[0.18em]'
              : 'text-[10px] tracking-[0.22em]'
          }`}
        >
          <span className={`${theme.eyebrow} truncate`}>
            RÉMY MARTIN · {seriesName}
          </span>
          {indexLabel && (
            <span className="opacity-60 tabular-nums shrink-0">{indexLabel}</span>
          )}
        </div>
      )}

      <div
        className={`flex-1 flex items-center justify-center min-h-0 ${
          isNoCopy ? 'py-2' : size === 'thumb' ? 'py-2' : 'py-4'
        }`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title || seriesName}
            referrerPolicy="no-referrer"
            className={`${imgMaxHeightClass} w-auto object-contain ${theme.imgBlend}`}
          />
        ) : (
          <span className="text-[12px] opacity-50">{noImageLabel}</span>
        )}
      </div>

      {hasAnyCopy && (
        <div
          className={`${
            size === 'thumb' ? 'space-y-1.5' : 'space-y-3'
          } text-center shrink-0`}
        >
          <div
            className={`${size === 'thumb' ? 'w-5' : 'w-8'} h-[1px] mx-auto ${theme.divider}`}
          />
          {hasTitle && (
            <h3
              className={`font-luxury ${titleClass} leading-snug font-semibold ${theme.title}`}
            >
              {title}
            </h3>
          )}
          {hasSubtitle && (
            <p className={`${subtitleClass} leading-relaxed ${theme.subtitle}`}>
              {subtitle}
            </p>
          )}
          {hasCta && (
            <div className={size === 'thumb' ? 'pt-0.5' : 'pt-1.5'}>
              <span
                className={`inline-block border ${theme.cta} ${
                  size === 'thumb'
                    ? 'px-2.5 py-0.5 text-[9px] tracking-[0.08em]'
                    : 'px-4 py-1.5 text-[11px] tracking-[0.12em]'
                }`}
              >
                {ctaText}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const AiAdsPage: React.FC<AiAdsPageProps> = ({
  deviceId,
  deviceName,
  seriesList,
  standbyConfig,
  selectedAdId,
  focusGeneratorToken,
  onSelectAd,
  onStandbyConfigChanged,
}) => {
  const { locale, t, localizeError } = useLanguage();
  const generatorSectionRef = useRef<HTMLElement | null>(null);
  const editorSectionRef = useRef<HTMLElement | null>(null);
  const previewTitleId = useId();
  const historyDialogTitleId = useId();

  // Generator state
  const [targetSeriesId, setTargetSeriesId] = useState<string>(
    seriesList[0]?.id ?? ''
  );
  const [targetSkuId, setTargetSkuId] = useState<string>('');
  const [visualStyle, setVisualStyle] = useState<AdVisualStyle>('sunlit-estate');
  const [copyMode, setCopyMode] = useState<AdCopyMode>('with-copy');
  const [genTitle, setGenTitle] = useState<string>('');
  const [genSubtitle, setGenSubtitle] = useState<string>('');
  const [genCtaText, setGenCtaText] = useState<string>('');
  const [promptBrief, setPromptBrief] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatorNotice, setGeneratorNotice] = useState<string>('');

  // Post-generation & history preview decision modal state
  const [historyModalState, setHistoryModalState] = useState<{
    itemId: string;
    isFreshGeneration: boolean;
  } | null>(null);
  const [promotingHistoryId, setPromotingHistoryId] = useState<string | null>(null);
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null);

  // Collapsible Section 03 history organizer state (Option 1: default collapsed)
  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(false);
  const [historyGroupBy, setHistoryGroupBy] = useState<HistoryGroupBy>('date');
  const [historyStatusFilter, setHistoryStatusFilter] =
    useState<HistoryStatusFilter>('all');
  const [collapsedGroupKeys, setCollapsedGroupKeys] = useState<
    Record<string, boolean>
  >({});

  // Settings & active ad editor state
  const [isUpdatingSettings, setIsUpdatingSettings] = useState<boolean>(false);
  const [isSavingAd, setIsSavingAd] = useState<boolean>(false);
  const [isDeletingAd, setIsDeletingAd] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fullscreen standby preview state
  const [isStandbyPreviewOpen, setIsStandbyPreviewOpen] = useState<boolean>(false);
  const [previewSlideIndex, setPreviewSlideIndex] = useState<number>(0);

  const sortedAds = useMemo(
    () => [...standbyConfig.ads].sort((a, b) => a.sortOrder - b.sortOrder),
    [standbyConfig.ads]
  );

  const historyItems = useMemo(
    () => standbyConfig.history ?? [],
    [standbyConfig.history]
  );

  const unsavedHistoryCount = useMemo(
    () => historyItems.filter((item) => !item.savedToCarousel).length,
    [historyItems]
  );
  const savedHistoryCount = historyItems.length - unsavedHistoryCount;

  const filteredHistoryItems = useMemo(() => {
    if (historyStatusFilter === 'unsaved') {
      return historyItems.filter((item) => !item.savedToCarousel);
    }
    if (historyStatusFilter === 'saved') {
      return historyItems.filter((item) => item.savedToCarousel);
    }
    return historyItems;
  }, [historyItems, historyStatusFilter]);

  const historyGroups = useMemo(() => {
    const now = new Date();
    const todayKey = formatLocalDateKey(now);
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayKey = formatLocalDateKey(yesterdayDate);

    if (historyGroupBy === 'product') {
      const seriesOrder = new Map(seriesList.map((s, idx) => [s.id, idx]));
      const buckets = new Map<
        string,
        { key: string; label: string; sortRank: number; items: AdHistoryItem[] }
      >();

      filteredHistoryItems.forEach((item) => {
        const key = `product:${item.seriesId || item.seriesName}`;
        const existing = buckets.get(key);
        if (existing) {
          existing.items.push(item);
        } else {
          buckets.set(key, {
            key,
            label: item.seriesName,
            sortRank: seriesOrder.get(item.seriesId) ?? 999,
            items: [item],
          });
        }
      });

      return Array.from(buckets.values()).sort((a, b) =>
        a.sortRank !== b.sortRank
          ? a.sortRank - b.sortRank
          : a.label.localeCompare(b.label)
      );
    }

    // Default: Group by date (newest day first)
    const buckets = new Map<
      string,
      { key: string; dateKey: string; label: string; items: AdHistoryItem[] }
    >();

    filteredHistoryItems.forEach((item) => {
      const dateKey = item.createdAt.slice(0, 10) || 'unknown';
      const key = `date:${dateKey}`;
      const existing = buckets.get(key);
      if (existing) {
        existing.items.push(item);
      } else {
        let label = dateKey;
        if (dateKey === todayKey) {
          label = `${t.aiAds.historyDateToday} · ${dateKey}`;
        } else if (dateKey === yesterdayKey) {
          label = `${t.aiAds.historyDateYesterday} · ${dateKey}`;
        }
        buckets.set(key, {
          key,
          dateKey,
          label,
          items: [item],
        });
      }
    });

    return Array.from(buckets.values()).sort((a, b) =>
      b.dateKey.localeCompare(a.dateKey)
    );
  }, [
    filteredHistoryItems,
    historyGroupBy,
    seriesList,
    t.aiAds.historyDateToday,
    t.aiAds.historyDateYesterday,
  ]);

  const areAllGroupsCollapsed =
    historyGroups.length > 0 &&
    historyGroups.every((group) => Boolean(collapsedGroupKeys[group.key]));

  const handleToggleSingleGroup = (groupKey: string) => {
    setCollapsedGroupKeys((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleToggleAllGroups = () => {
    if (areAllGroupsCollapsed) {
      setCollapsedGroupKeys({});
    } else {
      const next: Record<string, boolean> = {};
      historyGroups.forEach((group) => {
        next[group.key] = true;
      });
      setCollapsedGroupKeys(next);
    }
  };

  const retentionDays = standbyConfig.historyRetentionDays || 5;

  const selectedAdIndex = sortedAds.findIndex((item) => item.id === selectedAdId);
  const selectedAd =
    (selectedAdIndex >= 0 ? sortedAds[selectedAdIndex] : sortedAds[0]) ?? null;

  const [draftAd, setDraftAd] = useState<StandbyAdItem | null>(selectedAd);

  const activeAds = useMemo(
    () => sortedAds.filter((item) => item.status === 'active'),
    [sortedAds]
  );

  const activeHistoryModalItem: AdHistoryItem | null = useMemo(() => {
    if (!historyModalState) return null;
    return (
      historyItems.find((item) => item.id === historyModalState.itemId) ?? null
    );
  }, [historyItems, historyModalState]);

  const standbyDialogRef = useNativeDialog({
    isOpen: isStandbyPreviewOpen,
    onClose: () => setIsStandbyPreviewOpen(false),
    canDismiss: true,
    lightDismiss: false,
  });

  const historyDialogRef = useNativeDialog({
    isOpen: Boolean(activeHistoryModalItem),
    onClose: () => {
      if (historyModalState?.isFreshGeneration && activeHistoryModalItem && !activeHistoryModalItem.savedToCarousel) {
        setGeneratorNotice(t.aiAds.keptInHistoryNotice);
      }
      setHistoryModalState(null);
    },
    canDismiss: promotingHistoryId === null,
    lightDismiss: promotingHistoryId === null,
  });

  // Keep target series valid when switching showcase devices
  useEffect(() => {
    if (!seriesList.some((s) => s.id === targetSeriesId)) {
      setTargetSeriesId(seriesList[0]?.id ?? '');
      setTargetSkuId('');
    }
  }, [seriesList, targetSeriesId]);

  // Sync draft ad when switching selected ad, device, or language
  useEffect(() => {
    setDraftAd(selectedAd);
    setConfirmDelete(false);
    setErrorMessage('');
  }, [deviceId, locale, selectedAd?.id, selectedAd?.updatedAt]);

  // Smooth scroll to generator studio when user clicks "+ Generate" in sidebar
  useEffect(() => {
    if (focusGeneratorToken > 0) {
      generatorSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [focusGeneratorToken]);

  // Auto-advance timer inside fullscreen standby preview
  useEffect(() => {
    if (!isStandbyPreviewOpen || activeAds.length <= 1) return;
    const safeIndex = previewSlideIndex % activeAds.length;
    const currentSlide = activeAds[safeIndex];
    const durationMs = Math.max(3, currentSlide.durationSeconds) * 1000;
    const timer = window.setTimeout(() => {
      setPreviewSlideIndex((prev) => (prev + 1) % activeAds.length);
    }, durationMs);
    return () => window.clearTimeout(timer);
  }, [isStandbyPreviewOpen, previewSlideIndex, activeAds]);

  const targetSeries = seriesList.find((s) => s.id === targetSeriesId) ?? null;
  const targetSku = targetSeries?.skus.find((sku) => sku.id === targetSkuId) ?? null;

  const showToast = (msg: string) => {
    setStatusNotice(msg);
    window.setTimeout(() => setStatusNotice(''), 2800);
  };

  const handleAutoFillCopy = () => {
    if (!targetSeries) return;
    const isEn = locale === 'en';
    if (targetSku) {
      setGenTitle(targetSku.name);
      setGenSubtitle(targetSku.highlight || targetSeries.description.slice(0, 60));
      setGenCtaText(
        isEn
          ? `Touch screen · Discover ${targetSeries.name}`
          : `轻触屏幕 · 探索 ${targetSeries.name} 系列`
      );
    } else {
      setGenTitle(
        isEn
          ? `${targetSeries.name} · ${targetSeries.taglineEn || 'Fine Champagne Cognac'}`
          : `人头马 ${targetSeries.name} · ${targetSeries.taglineZh || '非凡风范'}`
      );
      setGenSubtitle(targetSeries.description.slice(0, 58));
      setGenCtaText(
        isEn
          ? `Touch screen · Explore ${targetSeries.name}`
          : `轻触屏幕 · 探索 ${targetSeries.name} 风味`
      );
    }
  };

  const handleToggleAutoRotate = async (enabled: boolean) => {
    if (isUpdatingSettings) return;
    setIsUpdatingSettings(true);
    setErrorMessage('');
    try {
      const updated = await adService.updateSettings(deviceId, {
        enabled,
        idleTimeoutSeconds: standbyConfig.idleTimeoutSeconds,
      });
      onStandbyConfigChanged(updated);
      showToast(t.aiAds.settingsSavedNotice);
    } catch (error) {
      setErrorMessage(localizeError(error, t.aiAds.saveErrorFallback));
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleChangeIdleTimeout = async (seconds: number) => {
    if (isUpdatingSettings) return;
    setIsUpdatingSettings(true);
    setErrorMessage('');
    try {
      const updated = await adService.updateSettings(deviceId, {
        enabled: standbyConfig.enabled,
        idleTimeoutSeconds: seconds,
      });
      onStandbyConfigChanged(updated);
      showToast(t.aiAds.settingsSavedNotice);
    } catch (error) {
      setErrorMessage(localizeError(error, t.aiAds.saveErrorFallback));
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleGenerateAd = async () => {
    if (!targetSeriesId || !targetSeries || isGenerating) return;
    setIsGenerating(true);
    setErrorMessage('');
    setGeneratorNotice('');
    try {
      const createdHistory = await adService.generateAdDraft(deviceId, {
        seriesId: targetSeriesId,
        skuId: targetSkuId || undefined,
        referenceImageUrl: new URL(
          targetSku?.imageUrl || targetSeries.imageUrl,
          window.location.origin
        ).toString(),
        visualStyle,
        copyMode,
        title: copyMode === 'with-copy' ? genTitle : undefined,
        subtitle: copyMode === 'with-copy' ? genSubtitle : undefined,
        ctaText: copyMode === 'with-copy' ? genCtaText : undefined,
        promptBrief: promptBrief.trim() || undefined,
      });

      const nextConfig: StandbyCarouselConfig = {
        ...standbyConfig,
        history: [createdHistory, ...historyItems],
      };
      onStandbyConfigChanged(nextConfig);
      setPromptBrief('');
      setHistoryModalState({
        itemId: createdHistory.id,
        isFreshGeneration: true,
      });
    } catch (error) {
      setErrorMessage(localizeError(error, t.aiAds.generateErrorFallback));
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromoteHistoryToCarousel = async (
    historyId: string,
    closeModalAfter = false
  ) => {
    if (promotingHistoryId) return;
    setPromotingHistoryId(historyId);
    setErrorMessage('');
    try {
      const { ad, config } = await adService.saveHistoryToCarousel(deviceId, {
        historyId,
        durationSeconds: 8,
      });
      onStandbyConfigChanged(config);
      onSelectAd(ad.id);
      if (closeModalAfter) {
        setHistoryModalState(null);
      }
      setGeneratorNotice('');
      showToast(t.aiAds.savedToCarouselNotice);
    } catch (error) {
      setErrorMessage(localizeError(error, t.aiAds.saveErrorFallback));
    } finally {
      setPromotingHistoryId(null);
    }
  };

  const handleDeleteHistoryItem = async (historyId: string) => {
    if (deletingHistoryId) return;
    setDeletingHistoryId(historyId);
    setErrorMessage('');
    try {
      const nextConfig = await adService.deleteHistoryItem(deviceId, historyId);
      onStandbyConfigChanged(nextConfig);
      if (historyModalState?.itemId === historyId) {
        setHistoryModalState(null);
      }
    } catch (error) {
      setErrorMessage(localizeError(error, t.aiAds.historyDeleteErrorFallback));
    } finally {
      setDeletingHistoryId(null);
    }
  };

  const handleJumpToCarouselAd = (adId: string) => {
    onSelectAd(adId);
    setHistoryModalState(null);
    window.setTimeout(() => {
      editorSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 60);
  };

  const handleSaveAd = async () => {
    if (!draftAd || isSavingAd) return;
    setIsSavingAd(true);
    setErrorMessage('');
    try {
      const updated = await adService.updateAd(deviceId, draftAd.id, {
        title: draftAd.copyMode === 'no-copy' ? '' : draftAd.title,
        subtitle: draftAd.copyMode === 'no-copy' ? '' : draftAd.subtitle,
        ctaText: draftAd.copyMode === 'no-copy' ? '' : draftAd.ctaText,
        durationSeconds: draftAd.durationSeconds,
        status: draftAd.status,
      });
      onStandbyConfigChanged({
        ...standbyConfig,
        ads: standbyConfig.ads.map((item) =>
          item.id === updated.id ? updated : item
        ),
      });
      setDraftAd(updated);
      showToast(t.aiAds.adSavedNotice(deviceName));
    } catch (error) {
      setErrorMessage(localizeError(error, t.aiAds.saveErrorFallback));
    } finally {
      setIsSavingAd(false);
    }
  };

  const handleMoveAd = async (direction: -1 | 1) => {
    if (!draftAd) return;
    const currentIdx = sortedAds.findIndex((item) => item.id === draftAd.id);
    const targetIdx = currentIdx + direction;
    if (currentIdx < 0 || targetIdx < 0 || targetIdx >= sortedAds.length) return;

    const nextOrdered = [...sortedAds];
    const [moved] = nextOrdered.splice(currentIdx, 1);
    nextOrdered.splice(targetIdx, 0, moved);

    try {
      const reordered = await adService.reorderAds(
        deviceId,
        nextOrdered.map((item) => item.id)
      );
      onStandbyConfigChanged({
        ...standbyConfig,
        ads: reordered,
      });
    } catch (error) {
      setErrorMessage(localizeError(error, t.aiAds.saveErrorFallback));
    }
  };

  const handleDeleteAd = async () => {
    if (!draftAd || isDeletingAd) return;
    setIsDeletingAd(true);
    setErrorMessage('');
    try {
      const nextConfig = await adService.deleteAd(deviceId, draftAd.id);
      onStandbyConfigChanged(nextConfig);
      onSelectAd(nextConfig.ads[0]?.id ?? '');
      setConfirmDelete(false);
    } catch (error) {
      setErrorMessage(localizeError(error, t.aiAds.deleteErrorFallback));
    } finally {
      setIsDeletingAd(false);
    }
  };

  const currentSlideForPreview =
    activeAds.length > 0 ? activeAds[previewSlideIndex % activeAds.length] : null;
  const previewTheme = currentSlideForPreview
    ? getPosterThemeClasses(currentSlideForPreview.visualStyle)
    : getPosterThemeClasses('nocturne-lounge');

  const draftDisplayLabel = draftAd
    ? draftAd.title || t.sidebar.adNoCopyLabel(draftAd.seriesName)
    : '';

  return (
    <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#FAF9F6]">
      {/* Solid White Architectural Header Aligned to 1160px Grid */}
      <header className="sticky top-0 z-20 bg-white border-b border-[#E6E0D4]">
        <div className="max-w-[1160px] w-full mx-auto px-8 lg:px-12 h-[76px] flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-[14px] min-w-0">
            <span className="text-[#A88950] font-medium truncate max-w-[220px]">
              {deviceName}
            </span>
            <span className="text-[#CBC4B7]" aria-hidden="true">
              /
            </span>
            <span className="font-medium text-[#141414] whitespace-nowrap">
              {t.aiAds.breadcrumbTitle}
            </span>
            {draftAd && (
              <>
                <span className="hidden xl:inline text-[#CBC4B7]" aria-hidden="true">
                  /
                </span>
                <span className="hidden xl:inline text-[#8E816C] truncate max-w-[240px]">
                  {draftDisplayLabel}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {statusNotice && (
              <span className="text-[13px] text-[#A88950] font-medium mr-1 whitespace-nowrap">
                {statusNotice}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setPreviewSlideIndex(0);
                setIsStandbyPreviewOpen(true);
              }}
              className="px-4.5 py-2.5 border border-[#141414] bg-white text-[13.5px] font-medium text-[#141414] hover:bg-[#141414] hover:text-white transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#A88950]"
            >
              {t.aiAds.standbyPreviewButton}
            </button>
            <button
              type="button"
              disabled={!draftAd || isSavingAd}
              onClick={() => void handleSaveAd()}
              className="px-5 py-2.5 bg-[#141414] hover:bg-[#2F2F2F] disabled:opacity-50 text-white text-[13.5px] font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#A88950]"
            >
              {isSavingAd ? t.common.saving : t.aiAds.saveAndPublish}
            </button>
            <div className="h-5 w-[1px] bg-[#E6E0D4] mx-0.5" aria-hidden="true" />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content Area: 1160px Single-Column Luxury Studio */}
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

        {/* Page Title & Standby Trigger Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-9 border-b border-[#E6E0D4]">
          <div className="max-w-[640px]">
            <p className="text-[12px] tracking-[0.22em] text-[#A88950] uppercase">
              {t.aiAds.eyebrow}
            </p>
            <h1 className="font-luxury text-[42px] leading-tight text-[#141414] mt-1.5 font-semibold tracking-[0.01em]">
              {t.aiAds.pageTitle}
            </h1>
            <p className="text-[14px] text-[#6E675C] mt-2.5 leading-relaxed">
              {t.aiAds.pageSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <span className="text-[13.5px] text-[#8E816C] tabular-nums whitespace-nowrap">
              {t.aiAds.activeAdsSummary(activeAds.length, sortedAds.length)}
            </span>

            {/* Idle Trigger Timeout Selector */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="idle-timeout-select"
                className="text-[12.5px] text-[#6E675C] whitespace-nowrap"
              >
                {t.aiAds.idleTimeoutLabel}
              </label>
              <select
                id="idle-timeout-select"
                disabled={isUpdatingSettings}
                value={standbyConfig.idleTimeoutSeconds}
                onChange={(e) =>
                  void handleChangeIdleTimeout(Number(e.target.value))
                }
                className="px-3.5 py-2 bg-white border border-[#D8CBB2] text-[13px] text-[#141414] tabular-nums focus:border-[#141414] focus:outline-none cursor-pointer"
              >
                {IDLE_TIMEOUT_OPTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    {t.aiAds.idleTimeoutOption(sec)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sharp Architectural Auto-Rotate Switch */}
            <div
              role="group"
              aria-label={t.aiAds.autoRotateLabel}
              className="flex items-center border border-[#D8CBB2] bg-white"
            >
              <button
                type="button"
                aria-pressed={standbyConfig.enabled}
                disabled={isUpdatingSettings}
                onClick={() => void handleToggleAutoRotate(true)}
                className={`px-3.5 py-2 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  standbyConfig.enabled
                    ? 'bg-[#141414] text-white'
                    : 'text-[#6E675C] hover:text-[#141414]'
                }`}
              >
                {t.aiAds.autoRotateOn}
              </button>
              <button
                type="button"
                aria-pressed={!standbyConfig.enabled}
                disabled={isUpdatingSettings}
                onClick={() => void handleToggleAutoRotate(false)}
                className={`px-3.5 py-2 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap border-l border-[#D8CBB2] ${
                  !standbyConfig.enabled
                    ? 'bg-[#141414] text-white'
                    : 'text-[#6E675C] hover:text-[#141414]'
                }`}
              >
                {t.aiAds.autoRotateOff}
              </button>
            </div>
          </div>
        </div>

        {/* Main Vertical Sections */}
        <div className="mt-11 space-y-12 pb-12">
          {/* Section 01: AI Campaign Generator Studio */}
          <section ref={generatorSectionRef} className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-[13px] font-semibold text-[#A88950] tabular-nums">
                01
              </span>
              <h2
                className={`text-[20px] font-semibold text-[#141414] leading-snug ${
                  locale === 'en' ? 'tracking-[-0.01em]' : 'tracking-[0.02em]'
                }`}
              >
                {t.aiAds.sectionGenerateTitle}
              </h2>
            </div>

            <div className="bg-white border border-[#ECE7DD] shadow-[0_4px_20px_rgba(20,20,20,0.038),0_1px_3px_rgba(20,20,20,0.025)] p-7 sm:p-9 space-y-7">
              {/* Row 1: Series + Optional SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-9 gap-y-6">
                <div>
                  <label
                    htmlFor="ai-ad-series"
                    className="block text-[13px] text-[#6E675C] mb-2"
                  >
                    {t.aiAds.targetSeriesLabel}
                  </label>
                  <select
                    id="ai-ad-series"
                    value={targetSeriesId}
                    onChange={(e) => {
                      setTargetSeriesId(e.target.value);
                      setTargetSkuId('');
                    }}
                    className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors cursor-pointer"
                  >
                    {seriesList.map((series) => (
                      <option key={series.id} value={series.id}>
                        {series.name}
                        {locale === 'en'
                          ? series.taglineEn
                            ? ` · ${series.taglineEn}`
                            : ''
                          : series.taglineZh
                            ? ` · ${series.taglineZh}`
                            : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="ai-ad-sku"
                    className="block text-[13px] text-[#6E675C] mb-2"
                  >
                    {t.aiAds.targetSkuLabel}
                  </label>
                  <select
                    id="ai-ad-sku"
                    value={targetSkuId}
                    onChange={(e) => setTargetSkuId(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="">{t.aiAds.allSeriesHeroOption}</option>
                    {(targetSeries?.skus ?? []).map((sku) => (
                      <option key={sku.id} value={sku.id}>
                        {sku.name} ({sku.volume})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Visual Style Selector */}
              <div>
                <div className="block text-[13px] text-[#6E675C] mb-2.5">
                  {t.aiAds.visualStyleLabel}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {VISUAL_STYLES.map((styleKey) => {
                    const isActive = visualStyle === styleKey;
                    return (
                      <button
                        key={styleKey}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setVisualStyle(styleKey)}
                        className={`px-4 py-2.5 border text-[13.5px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'border-[#141414] bg-[#141414] text-white'
                            : 'border-[#DDD4C4] bg-[#FAF8F4] text-[#555049] hover:border-[#141414] hover:text-[#141414]'
                        }`}
                      >
                        {t.aiAds.visualStyles[styleKey]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Copy Mode Switch (With Copy vs No Copy) */}
              <div className="pt-2 border-t border-[#F0EAE0] space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-[13px] text-[#6E675C]">
                      {t.aiAds.copyModeLabel}
                    </span>
                    <div
                      role="group"
                      aria-label={t.aiAds.copyModeLabel}
                      className="inline-flex border border-[#D8CBB2] bg-white"
                    >
                      <button
                        type="button"
                        aria-pressed={copyMode === 'with-copy'}
                        onClick={() => setCopyMode('with-copy')}
                        className={`px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          copyMode === 'with-copy'
                            ? 'bg-[#141414] text-white'
                            : 'text-[#6E675C] hover:text-[#141414]'
                        }`}
                      >
                        {t.aiAds.copyModeWithCopy}
                      </button>
                      <button
                        type="button"
                        aria-pressed={copyMode === 'no-copy'}
                        onClick={() => setCopyMode('no-copy')}
                        className={`px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap border-l border-[#D8CBB2] ${
                          copyMode === 'no-copy'
                            ? 'bg-[#141414] text-white'
                            : 'text-[#6E675C] hover:text-[#141414]'
                        }`}
                      >
                        {t.aiAds.copyModeNoCopy}
                      </button>
                    </div>
                  </div>

                  {copyMode === 'with-copy' && targetSeries && (
                    <button
                      type="button"
                      onClick={handleAutoFillCopy}
                      className="px-3.5 py-1.5 border border-[#D4C7B0] bg-white text-[12.5px] font-medium text-[#7A6136] hover:border-[#141414] hover:text-[#141414] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t.aiAds.autoFillCopyButton}
                    </button>
                  )}
                </div>

                {copyMode === 'no-copy' ? (
                  <p className="text-[13px] text-[#8E816C] leading-relaxed">
                    {t.aiAds.copyModeNoCopyHint}
                  </p>
                ) : (
                  <div className="space-y-5">
                    <p className="text-[12.5px] text-[#8E816C] leading-relaxed">
                      {t.aiAds.copyFieldsHint}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-9 gap-y-5">
                      <div>
                        <label
                          htmlFor="ai-gen-title"
                          className="block text-[13px] text-[#6E675C] mb-2"
                        >
                          {t.aiAds.genTitleLabel}
                        </label>
                        <input
                          id="ai-gen-title"
                          type="text"
                          value={genTitle}
                          onChange={(e) => setGenTitle(e.target.value)}
                          placeholder={t.aiAds.genTitlePlaceholder}
                          className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="ai-gen-cta"
                          className="block text-[13px] text-[#6E675C] mb-2"
                        >
                          {t.aiAds.genCtaLabel}
                        </label>
                        <input
                          id="ai-gen-cta"
                          type="text"
                          value={genCtaText}
                          onChange={(e) => setGenCtaText(e.target.value)}
                          placeholder={t.aiAds.genCtaPlaceholder}
                          className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="ai-gen-subtitle"
                        className="block text-[13px] text-[#6E675C] mb-2"
                      >
                        {t.aiAds.genSubtitleLabel}
                      </label>
                      <input
                        id="ai-gen-subtitle"
                        type="text"
                        value={genSubtitle}
                        onChange={(e) => setGenSubtitle(e.target.value)}
                        placeholder={t.aiAds.genSubtitlePlaceholder}
                        className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Row 4: Optional Creative Direction Brief */}
              <div>
                <label
                  htmlFor="ai-ad-brief"
                  className="block text-[13px] text-[#6E675C] mb-2"
                >
                  {t.aiAds.promptBriefLabel}
                </label>
                <textarea
                  id="ai-ad-brief"
                  rows={2}
                  value={promptBrief}
                  onChange={(e) => setPromptBrief(e.target.value)}
                  placeholder={t.aiAds.promptBriefPlaceholder}
                  className="mwg-auto-textarea--compact w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] leading-relaxed text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <button
                  type="button"
                  disabled={!targetSeriesId || isGenerating}
                  onClick={() => void handleGenerateAd()}
                  className="px-6 py-3 bg-[#A88950] hover:bg-[#8E703A] disabled:opacity-55 text-white text-[14px] font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#141414]"
                >
                  {isGenerating ? t.aiAds.generatingButton : t.aiAds.generateButton}
                </button>

                {generatorNotice && (
                  <p className="text-[12.5px] text-[#8E7D63] leading-relaxed flex-1 min-w-[260px]">
                    {generatorNotice}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Section 02: Selected Slide Creative & Playback Configuration */}
          <section ref={editorSectionRef} className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-[13px] font-semibold text-[#A88950] tabular-nums">
                02
              </span>
              <h2
                className={`text-[20px] font-semibold text-[#141414] leading-snug ${
                  locale === 'en' ? 'tracking-[-0.01em]' : 'tracking-[0.02em]'
                }`}
              >
                {t.aiAds.sectionEditorTitle}
              </h2>
            </div>

            {!draftAd ? (
              <div className="bg-white border border-[#ECE7DD] shadow-[0_4px_20px_rgba(20,20,20,0.038),0_1px_3px_rgba(20,20,20,0.025)] py-16 px-8 text-center">
                <p className="font-luxury text-[24px] text-[#141414]">
                  {t.aiAds.emptyEditorTitle}
                </p>
                <p className="text-[14px] text-[#8E816C] mt-2">
                  {t.aiAds.emptyEditorSubtitle}
                </p>
              </div>
            ) : (
              <div className="bg-white border border-[#ECE7DD] shadow-[0_4px_20px_rgba(20,20,20,0.038),0_1px_3px_rgba(20,20,20,0.025)] p-7 sm:p-9">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-9 items-start">
                  {/* Left: Vertical Showcase Standby Poster Live Preview */}
                  <div className="lg:col-span-5">
                    <StandbyPosterCanvas
                      seriesName={draftAd.seriesName}
                      imageUrl={draftAd.imageUrl}
                      visualStyle={draftAd.visualStyle}
                      copyMode={draftAd.copyMode}
                      title={draftAd.title}
                      subtitle={draftAd.subtitle}
                      ctaText={draftAd.ctaText}
                      indexLabel={String(
                        (selectedAdIndex >= 0 ? selectedAdIndex : 0) + 1
                      ).padStart(2, '0')}
                      size="card"
                      noImageLabel={t.common.noImage}
                    />
                  </div>

                  {/* Right: Slide Copy (if with-copy) & Locked Style + Playback Controls */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Locked Generation Metadata (Style cannot be changed after generation) */}
                    <div className="pb-4 border-b border-[#EFEAE0] space-y-1.5">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px]">
                        <span className="text-[#8E816C]">
                          {t.aiAds.lockedStyleLabel}：
                          <span className="text-[#141414] font-medium">
                            {t.aiAds.visualStyles[draftAd.visualStyle]}
                          </span>
                        </span>
                        <span className="text-[#D4CBB8]" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-[#8E816C]">
                          {t.aiAds.copyModeMetaLabel}：
                          <span className="text-[#141414] font-medium">
                            {draftAd.copyMode === 'no-copy'
                              ? t.aiAds.copyModeNoCopy
                              : t.aiAds.copyModeWithCopy}
                          </span>
                        </span>
                      </div>
                      <p className="text-[12px] text-[#9A8E7A]">
                        {t.aiAds.lockedAfterGenerateHint}
                      </p>
                    </div>

                    {draftAd.copyMode === 'no-copy' ? (
                      <div className="py-5 px-5 bg-[#FAF8F4] border-l-2 border-l-[#A88950] text-[13.5px] text-[#6E675C] leading-relaxed">
                        {t.aiAds.noCopyReadonlyNotice}
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div>
                          <label
                            htmlFor="ad-edit-title"
                            className="block text-[13px] text-[#6E675C] mb-2"
                          >
                            {t.aiAds.adHeadlineLabel}
                          </label>
                          <input
                            id="ad-edit-title"
                            type="text"
                            value={draftAd.title}
                            onChange={(e) =>
                              setDraftAd({ ...draftAd, title: e.target.value })
                            }
                            placeholder={t.aiAds.adHeadlinePlaceholder}
                            className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="ad-edit-subtitle"
                            className="block text-[13px] text-[#6E675C] mb-2"
                          >
                            {t.aiAds.adSubtitleLabel}
                          </label>
                          <textarea
                            id="ad-edit-subtitle"
                            rows={2}
                            value={draftAd.subtitle}
                            onChange={(e) =>
                              setDraftAd({ ...draftAd, subtitle: e.target.value })
                            }
                            placeholder={t.aiAds.adSubtitlePlaceholder}
                            className="mwg-auto-textarea--compact w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] leading-relaxed text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="ad-edit-cta"
                            className="block text-[13px] text-[#6E675C] mb-2"
                          >
                            {t.aiAds.adCtaLabel}
                          </label>
                          <input
                            id="ad-edit-cta"
                            type="text"
                            value={draftAd.ctaText}
                            onChange={(e) =>
                              setDraftAd({ ...draftAd, ctaText: e.target.value })
                            }
                            placeholder={t.aiAds.adCtaPlaceholder}
                            className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    {/* Playback Duration */}
                    <div className="max-w-[280px]">
                      <label
                        htmlFor="ad-edit-duration"
                        className="block text-[13px] text-[#6E675C] mb-2"
                      >
                        {t.aiAds.adDurationLabel}
                      </label>
                      <select
                        id="ad-edit-duration"
                        value={draftAd.durationSeconds}
                        onChange={(e) =>
                          setDraftAd({
                            ...draftAd,
                            durationSeconds: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[15px] text-[#141414] tabular-nums hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors cursor-pointer"
                      >
                        {SLIDE_DURATION_OPTIONS.map((sec) => (
                          <option key={sec} value={sec}>
                            {t.aiAds.adDurationOption(sec)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status & Playlist Order Row */}
                    <div className="pt-4 border-t border-[#EFEAE0] flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] text-[#6E675C]">
                          {t.aiAds.adStatusLabel}
                        </span>
                        <div className="flex items-center border border-[#D8CBB2] bg-white">
                          <button
                            type="button"
                            aria-pressed={draftAd.status === 'active'}
                            onClick={() =>
                              setDraftAd({ ...draftAd, status: 'active' })
                            }
                            className={`px-3.5 py-1.5 text-[12.5px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                              draftAd.status === 'active'
                                ? 'bg-[#141414] text-white'
                                : 'text-[#6E675C] hover:text-[#141414]'
                            }`}
                          >
                            {t.aiAds.statusActive}
                          </button>
                          <button
                            type="button"
                            aria-pressed={draftAd.status === 'paused'}
                            onClick={() =>
                              setDraftAd({ ...draftAd, status: 'paused' })
                            }
                            className={`px-3.5 py-1.5 text-[12.5px] font-medium transition-colors cursor-pointer whitespace-nowrap border-l border-[#D8CBB2] ${
                              draftAd.status === 'paused'
                                ? 'bg-[#141414] text-white'
                                : 'text-[#6E675C] hover:text-[#141414]'
                            }`}
                          >
                            {t.aiAds.statusPaused}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          disabled={selectedAdIndex <= 0}
                          onClick={() => void handleMoveAd(-1)}
                          className="px-3.5 py-1.5 border border-[#D8CBB2] bg-white text-[12.5px] text-[#4A4845] hover:border-[#141414] hover:text-[#141414] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {t.aiAds.moveUpButton}
                        </button>
                        <button
                          type="button"
                          disabled={
                            selectedAdIndex < 0 ||
                            selectedAdIndex >= sortedAds.length - 1
                          }
                          onClick={() => void handleMoveAd(1)}
                          className="px-3.5 py-1.5 border border-[#D8CBB2] bg-white text-[12.5px] text-[#4A4845] hover:border-[#141414] hover:text-[#141414] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {t.aiAds.moveDownButton}
                        </button>
                      </div>
                    </div>

                    {/* Remove from Carousel Action */}
                    <div className="pt-2 flex items-center justify-end">
                      {!confirmDelete ? (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(true)}
                          className="text-[12.5px] text-[#8E816C] hover:text-[#B9382C] transition-colors cursor-pointer py-1 px-2"
                        >
                          {t.aiAds.deleteAdButton}
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 text-[12.5px]">
                          <span className="text-[#6E675C]">
                            {t.aiAds.deleteConfirmPrompt}
                          </span>
                          <button
                            type="button"
                            disabled={isDeletingAd}
                            onClick={() => void handleDeleteAd()}
                            className="text-[#B9382C] font-medium hover:underline cursor-pointer disabled:opacity-60"
                          >
                            {isDeletingAd
                              ? t.common.deleting
                              : t.aiAds.deleteConfirmAction}
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
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Section 03: Collapsible Recent Generation History Gallery (Option 1) */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-3">
                <span className="text-[13px] font-semibold text-[#A88950] tabular-nums">
                  03
                </span>
                <h2
                  className={`text-[20px] font-semibold text-[#141414] leading-snug ${
                    locale === 'en' ? 'tracking-[-0.01em]' : 'tracking-[0.02em]'
                  }`}
                >
                  {t.aiAds.sectionHistoryTitle}
                </h2>
                <span className="text-[13px] text-[#9E9280] tabular-nums">
                  {String(historyItems.length).padStart(2, '0')}
                </span>
              </div>
              <p className="text-[12.5px] text-[#8E816C]">
                {t.aiAds.historyRetentionHint(retentionDays)}
              </p>
            </div>

            <div className="bg-white border border-[#ECE7DD] shadow-[0_4px_20px_rgba(20,20,20,0.038),0_1px_3px_rgba(20,20,20,0.025)]">
              {/* Collapsible Summary Bar Header */}
              <div className="px-6 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-5">
                <div className="space-y-1 min-w-0">
                  <p className="text-[14.5px] font-medium text-[#141414] tabular-nums">
                    {historyItems.length === 0
                      ? t.aiAds.historyEmptyTitle
                      : t.aiAds.historySummaryLine(
                          historyItems.length,
                          unsavedHistoryCount
                        )}
                  </p>
                  <p className="text-[12.5px] text-[#8E816C]">
                    {historyItems.length === 0
                      ? t.aiAds.historyEmptySubtitle
                      : t.aiAds.historyRetentionHint(retentionDays)}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Compact thumbnail strip visible only while collapsed */}
                  {!isHistoryExpanded && historyItems.length > 0 && (
                    <div
                      aria-hidden="true"
                      className="hidden sm:flex items-center gap-1.5"
                    >
                      {historyItems.slice(0, 4).map((item) => {
                        const miniTheme = getPosterThemeClasses(item.visualStyle);
                        return (
                          <div
                            key={item.id}
                            className={`w-8 h-[42px] ${miniTheme.canvas} border border-[#E2DACB] flex items-center justify-center p-1 overflow-hidden`}
                          >
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt=""
                                referrerPolicy="no-referrer"
                                className={`max-h-full w-auto object-contain ${miniTheme.imgBlend}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {historyItems.length > 0 && (
                    <button
                      type="button"
                      aria-expanded={isHistoryExpanded}
                      onClick={() => setIsHistoryExpanded((prev) => !prev)}
                      className={`px-4 py-2 border text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#A88950] ${
                        isHistoryExpanded
                          ? 'border-[#141414] bg-[#141414] text-white'
                          : 'border-[#D8CBB2] bg-white text-[#141414] hover:border-[#141414]'
                      }`}
                    >
                      {isHistoryExpanded
                        ? t.aiAds.historyCollapseButton
                        : t.aiAds.historyExpandButton}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Organizer: Grouping Toolbar + Collapsible Groups + 4-Col Compact Grid */}
              {isHistoryExpanded && historyItems.length > 0 && (
                <div className="border-t border-[#EFEAE0]">
                  {/* Control Toolbar: Group By (Date / Product) + Status Filter + Expand/Collapse All */}
                  <div className="px-6 sm:px-8 py-4 bg-[#FCFBF8] border-b border-[#EFEAE0] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[12.5px] text-[#6E675C]">
                        {t.aiAds.historyGroupByLabel}
                      </span>
                      <div
                        role="group"
                        aria-label={t.aiAds.historyGroupByLabel}
                        className="inline-flex border border-[#D8CBB2] bg-white"
                      >
                        <button
                          type="button"
                          aria-pressed={historyGroupBy === 'date'}
                          onClick={() => {
                            setHistoryGroupBy('date');
                            setCollapsedGroupKeys({});
                          }}
                          className={`px-3.5 py-1.5 text-[12.5px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            historyGroupBy === 'date'
                              ? 'bg-[#141414] text-white'
                              : 'text-[#6E675C] hover:text-[#141414]'
                          }`}
                        >
                          {t.aiAds.historyGroupByDate}
                        </button>
                        <button
                          type="button"
                          aria-pressed={historyGroupBy === 'product'}
                          onClick={() => {
                            setHistoryGroupBy('product');
                            setCollapsedGroupKeys({});
                          }}
                          className={`px-3.5 py-1.5 text-[12.5px] font-medium transition-colors cursor-pointer whitespace-nowrap border-l border-[#D8CBB2] ${
                            historyGroupBy === 'product'
                              ? 'bg-[#141414] text-white'
                              : 'text-[#6E675C] hover:text-[#141414]'
                          }`}
                        >
                          {t.aiAds.historyGroupByProduct}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="inline-flex border border-[#D8CBB2] bg-white">
                        <button
                          type="button"
                          aria-pressed={historyStatusFilter === 'all'}
                          onClick={() => setHistoryStatusFilter('all')}
                          className={`px-3 py-1.5 text-[12px] font-medium tabular-nums transition-colors cursor-pointer whitespace-nowrap ${
                            historyStatusFilter === 'all'
                              ? 'bg-[#141414] text-white'
                              : 'text-[#6E675C] hover:text-[#141414]'
                          }`}
                        >
                          {t.aiAds.historyFilterAll(historyItems.length)}
                        </button>
                        <button
                          type="button"
                          aria-pressed={historyStatusFilter === 'unsaved'}
                          onClick={() => setHistoryStatusFilter('unsaved')}
                          className={`px-3 py-1.5 text-[12px] font-medium tabular-nums transition-colors cursor-pointer whitespace-nowrap border-l border-[#D8CBB2] ${
                            historyStatusFilter === 'unsaved'
                              ? 'bg-[#141414] text-white'
                              : 'text-[#6E675C] hover:text-[#141414]'
                          }`}
                        >
                          {t.aiAds.historyFilterUnsaved(unsavedHistoryCount)}
                        </button>
                        <button
                          type="button"
                          aria-pressed={historyStatusFilter === 'saved'}
                          onClick={() => setHistoryStatusFilter('saved')}
                          className={`px-3 py-1.5 text-[12px] font-medium tabular-nums transition-colors cursor-pointer whitespace-nowrap border-l border-[#D8CBB2] ${
                            historyStatusFilter === 'saved'
                              ? 'bg-[#141414] text-white'
                              : 'text-[#6E675C] hover:text-[#141414]'
                          }`}
                        >
                          {t.aiAds.historyFilterSaved(savedHistoryCount)}
                        </button>
                      </div>

                      {historyGroups.length > 1 && (
                        <button
                          type="button"
                          onClick={handleToggleAllGroups}
                          className="text-[12.5px] text-[#7A6136] hover:text-[#141414] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {areAllGroupsCollapsed
                            ? t.aiAds.historyExpandAllGroups
                            : t.aiAds.historyCollapseAllGroups}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grouped Collapsible Lists */}
                  {filteredHistoryItems.length === 0 ? (
                    <div className="py-12 px-8 text-center space-y-3">
                      <p className="text-[14.5px] text-[#555049]">
                        {t.aiAds.historyFilteredEmptyTitle}
                      </p>
                      <button
                        type="button"
                        onClick={() => setHistoryStatusFilter('all')}
                        className="px-4 py-2 border border-[#D8CBB2] bg-white text-[12.5px] font-medium text-[#141414] hover:border-[#141414] transition-colors cursor-pointer"
                      >
                        {t.aiAds.historyResetFilterButton}
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#EFEAE0]">
                      {historyGroups.map((group) => {
                        const isGroupCollapsed = Boolean(
                          collapsedGroupKeys[group.key]
                        );
                        return (
                          <div key={group.key} className="px-6 sm:px-8 py-5">
                            {/* Collapsible Group Header */}
                            <button
                              type="button"
                              aria-expanded={!isGroupCollapsed}
                              onClick={() => handleToggleSingleGroup(group.key)}
                              className="w-full flex items-center justify-between gap-4 py-1 text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A88950]"
                            >
                              <div className="flex items-baseline gap-3 min-w-0">
                                <span
                                  className={`font-semibold text-[#141414] truncate ${
                                    historyGroupBy === 'product'
                                      ? 'font-luxury text-[18px] tracking-[0.02em]'
                                      : 'text-[14.5px] tabular-nums'
                                  }`}
                                >
                                  {group.label}
                                </span>
                                <span className="text-[12px] text-[#9A8E7A] tabular-nums shrink-0">
                                  {t.aiAds.historyGroupCount(group.items.length)}
                                </span>
                              </div>
                              <span className="text-[12px] text-[#8E816C] group-hover:text-[#141414] transition-colors shrink-0">
                                {isGroupCollapsed
                                  ? t.aiAds.historyGroupExpand
                                  : t.aiAds.historyGroupCollapse}
                              </span>
                            </button>

                            {/* Compact 4-Column Gallery Grid */}
                            {!isGroupCollapsed && (
                              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {group.items.map((item) => {
                                  const displayTitle =
                                    item.title ||
                                    t.sidebar.adNoCopyLabel(item.seriesName);
                                  const isPromoting =
                                    promotingHistoryId === item.id;
                                  const isDeleting =
                                    deletingHistoryId === item.id;
                                  const timeStampShort =
                                    historyGroupBy === 'date'
                                      ? item.createdAt.slice(11) || item.createdAt
                                      : item.createdAt.slice(5);

                                  return (
                                    <article
                                      key={item.id}
                                      className="bg-[#FDFCFA] border border-[#ECE7DD] flex flex-col"
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setHistoryModalState({
                                            itemId: item.id,
                                            isFreshGeneration: false,
                                          })
                                        }
                                        className="block w-full text-left p-3.5 pb-0 cursor-pointer group focus-visible:outline-2 focus-visible:outline-[#A88950]"
                                      >
                                        <div className="transition-transform duration-200 group-hover:scale-[1.015]">
                                          <StandbyPosterCanvas
                                            seriesName={item.seriesName}
                                            imageUrl={item.imageUrl}
                                            visualStyle={item.visualStyle}
                                            copyMode={item.copyMode}
                                            title={item.title}
                                            subtitle={item.subtitle}
                                            ctaText={item.ctaText}
                                            size="thumb"
                                            noImageLabel={t.common.noImage}
                                          />
                                        </div>
                                      </button>

                                      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                                        <div className="space-y-1">
                                          <div className="flex items-center justify-between gap-2 text-[11px]">
                                            <span className="text-[#8E816C] truncate">
                                              {historyGroupBy === 'product'
                                                ? t.aiAds.visualStyles[
                                                    item.visualStyle
                                                  ]
                                                : `${item.seriesName} · ${t.aiAds.visualStyles[item.visualStyle]}`}
                                            </span>
                                            <span
                                              className={`shrink-0 font-medium ${
                                                item.savedToCarousel
                                                  ? 'text-[#A88950]'
                                                  : 'text-[#9A9389]'
                                              }`}
                                            >
                                              {item.savedToCarousel
                                                ? t.aiAds.historySavedTag
                                                : t.aiAds.historyUnsavedTag}
                                            </span>
                                          </div>

                                          <h3 className="text-[13.5px] font-semibold text-[#141414] line-clamp-1">
                                            {displayTitle}
                                          </h3>

                                          <div className="flex items-center justify-between gap-2 text-[11px] text-[#9A8E7A] tabular-nums">
                                            <span className="truncate">
                                              {item.copyMode === 'no-copy'
                                                ? t.aiAds.copyModeNoCopy
                                                : t.aiAds.copyModeWithCopy}
                                            </span>
                                            <span className="shrink-0">
                                              {timeStampShort}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="pt-2.5 border-t border-[#EFEAE0] flex items-center justify-between gap-2">
                                          {item.savedToCarousel &&
                                          item.linkedAdId ? (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleJumpToCarouselAd(
                                                  item.linkedAdId!
                                                )
                                              }
                                              className="px-2.5 py-1 border border-[#D8CBB2] bg-white text-[11.5px] font-medium text-[#141414] hover:border-[#141414] transition-colors cursor-pointer whitespace-nowrap"
                                            >
                                              {t.aiAds.historyViewInCarouselButton}
                                            </button>
                                          ) : (
                                            <button
                                              type="button"
                                              disabled={isPromoting}
                                              onClick={() =>
                                                void handlePromoteHistoryToCarousel(
                                                  item.id,
                                                  false
                                                )
                                              }
                                              className="px-2.5 py-1 bg-[#141414] hover:bg-[#2F2F2F] disabled:opacity-55 text-white text-[11.5px] font-medium transition-colors cursor-pointer whitespace-nowrap"
                                            >
                                              {isPromoting
                                                ? t.aiAds.savingToCarouselButton
                                                : t.aiAds.historyAddToCarouselButton}
                                            </button>
                                          )}

                                          <button
                                            type="button"
                                            disabled={isDeleting}
                                            onClick={() =>
                                              void handleDeleteHistoryItem(item.id)
                                            }
                                            className="text-[11.5px] text-[#9A8E7A] hover:text-[#B9382C] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
                                          >
                                            {isDeleting
                                              ? t.common.deleting
                                              : t.aiAds.historyDeleteShort}
                                          </button>
                                        </div>
                                      </div>
                                    </article>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Native Top-Layer Post-Generation Save-or-Discard / History Inspect Modal */}
      <dialog
        ref={historyDialogRef}
        aria-labelledby={historyDialogTitleId}
        className="mwg-dialog w-[min(92vw,840px)] bg-white border border-[#D4C8B4] shadow-[0_24px_64px_rgba(20,20,20,0.22)] p-0"
      >
        {activeHistoryModalItem && (
          <div className="flex flex-col max-h-[90vh]">
            <div className="px-7 py-5 border-b border-[#EFEAE0] flex items-start justify-between gap-4">
              <div>
                <h2
                  id={historyDialogTitleId}
                  className="text-[19px] font-semibold text-[#141414]"
                >
                  {historyModalState?.isFreshGeneration
                    ? t.aiAds.generatedModalTitle
                    : t.aiAds.historyModalTitle}
                </h2>
                <p className="text-[13px] text-[#7D7568] mt-1 leading-relaxed">
                  {historyModalState?.isFreshGeneration
                    ? t.aiAds.generatedModalSubtitle
                    : t.aiAds.historyModalSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (
                    historyModalState?.isFreshGeneration &&
                    !activeHistoryModalItem.savedToCarousel
                  ) {
                    setGeneratorNotice(t.aiAds.keptInHistoryNotice);
                  }
                  setHistoryModalState(null);
                }}
                className="text-[13px] text-[#6E675C] hover:text-[#141414] transition-colors cursor-pointer shrink-0 py-1 px-2"
              >
                {t.common.close}
              </button>
            </div>

            <div className="p-7 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-6">
                <StandbyPosterCanvas
                  seriesName={activeHistoryModalItem.seriesName}
                  imageUrl={activeHistoryModalItem.imageUrl}
                  visualStyle={activeHistoryModalItem.visualStyle}
                  copyMode={activeHistoryModalItem.copyMode}
                  title={activeHistoryModalItem.title}
                  subtitle={activeHistoryModalItem.subtitle}
                  ctaText={activeHistoryModalItem.ctaText}
                  size="modal"
                  noImageLabel={t.common.noImage}
                />
              </div>

              <div className="md:col-span-6 flex flex-col justify-between space-y-6">
                <dl className="divide-y divide-[#F0EAE0] text-[13.5px]">
                  <div className="py-3 flex items-baseline justify-between gap-4">
                    <dt className="text-[#8E816C] shrink-0">
                      {t.aiAds.historyProductLabel}
                    </dt>
                    <dd className="text-[#141414] font-medium text-right">
                      {activeHistoryModalItem.skuName
                        ? `${activeHistoryModalItem.seriesName} · ${activeHistoryModalItem.skuName}`
                        : activeHistoryModalItem.seriesName}
                    </dd>
                  </div>

                  <div className="py-3 flex items-baseline justify-between gap-4">
                    <dt className="text-[#8E816C] shrink-0">
                      {t.aiAds.lockedStyleLabel}
                    </dt>
                    <dd className="text-[#141414] font-medium">
                      {t.aiAds.visualStyles[activeHistoryModalItem.visualStyle]}
                    </dd>
                  </div>

                  <div className="py-3 flex items-baseline justify-between gap-4">
                    <dt className="text-[#8E816C] shrink-0">
                      {t.aiAds.copyModeMetaLabel}
                    </dt>
                    <dd className="text-[#141414] font-medium">
                      {activeHistoryModalItem.copyMode === 'no-copy'
                        ? t.aiAds.copyModeNoCopy
                        : t.aiAds.copyModeWithCopy}
                    </dd>
                  </div>

                  <div className="py-3 flex items-baseline justify-between gap-4">
                    <dt className="text-[#8E816C] shrink-0">
                      {t.aiAds.historyCreatedLabel}
                    </dt>
                    <dd className="text-[#555049] tabular-nums">
                      {activeHistoryModalItem.createdAt}
                    </dd>
                  </div>

                  <div className="py-3 flex items-baseline justify-between gap-4">
                    <dt className="text-[#8E816C] shrink-0">
                      {t.aiAds.historyExpiresLabel}
                    </dt>
                    <dd className="text-[#555049] tabular-nums">
                      {activeHistoryModalItem.expiresAt}
                    </dd>
                  </div>
                </dl>

                {activeHistoryModalItem.isMockGenerated && (
                  <p className="text-[12px] text-[#8E7D63] leading-relaxed bg-[#FAF8F4] p-3.5 border-l-2 border-l-[#D4C7B0]">
                    {t.aiAds.generateMockNotice}
                  </p>
                )}

                <div className="pt-2 space-y-3">
                  {!activeHistoryModalItem.savedToCarousel ? (
                    <>
                      <button
                        type="button"
                        disabled={promotingHistoryId !== null}
                        onClick={() =>
                          void handlePromoteHistoryToCarousel(
                            activeHistoryModalItem.id,
                            true
                          )
                        }
                        className="w-full py-3 px-5 bg-[#141414] hover:bg-[#2F2F2F] disabled:opacity-55 text-white text-[14px] font-medium transition-colors cursor-pointer"
                      >
                        {promotingHistoryId === activeHistoryModalItem.id
                          ? t.aiAds.savingToCarouselButton
                          : t.aiAds.saveToCarouselButton}
                      </button>

                      <button
                        type="button"
                        disabled={promotingHistoryId !== null}
                        onClick={() => {
                          setGeneratorNotice(t.aiAds.keptInHistoryNotice);
                          setHistoryModalState(null);
                        }}
                        className="w-full py-2.5 px-5 border border-[#D8CBB2] bg-white hover:border-[#141414] text-[#555049] hover:text-[#141414] text-[13.5px] font-medium transition-colors cursor-pointer"
                      >
                        {t.aiAds.keepInHistoryOnlyButton}
                      </button>
                    </>
                  ) : (
                    <>
                      {activeHistoryModalItem.linkedAdId && (
                        <button
                          type="button"
                          onClick={() =>
                            handleJumpToCarouselAd(
                              activeHistoryModalItem.linkedAdId!
                            )
                          }
                          className="w-full py-3 px-5 bg-[#141414] hover:bg-[#2F2F2F] text-white text-[14px] font-medium transition-colors cursor-pointer"
                        >
                          {t.aiAds.historyViewInCarouselButton}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setHistoryModalState(null)}
                        className="w-full py-2.5 px-5 border border-[#D8CBB2] bg-white hover:border-[#141414] text-[#555049] hover:text-[#141414] text-[13.5px] font-medium transition-colors cursor-pointer"
                      >
                        {t.common.close}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </dialog>

      {/* Native Top-Layer Fullscreen Standby Auto-Playing Carousel Preview */}
      <dialog
        ref={standbyDialogRef}
        aria-labelledby={previewTitleId}
        className="mwg-fullscreen-dialog"
      >
        <div
          className={`w-full h-full flex flex-col ${previewTheme.canvas} transition-colors duration-300`}
        >
          {/* Minimalist Top Bar */}
          <div className="px-8 lg:px-12 h-[68px] border-b border-current/10 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span
                id={previewTitleId}
                className={`text-[12px] tracking-[0.2em] uppercase font-medium ${previewTheme.eyebrow}`}
              >
                {t.aiAds.fullscreenHeaderLabel}
              </span>
              <span className="opacity-35" aria-hidden="true">
                ·
              </span>
              <span className="text-[13px] opacity-80 truncate">{deviceName}</span>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {activeAds.length > 0 && (
                <span className="text-[12.5px] opacity-75 tabular-nums">
                  {t.aiAds.fullscreenSlideCounter(
                    (previewSlideIndex % activeAds.length) + 1,
                    activeAds.length
                  )}
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsStandbyPreviewOpen(false)}
                className="px-4 py-1.5 border border-current/35 text-[13px] hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap"
              >
                {t.aiAds.fullscreenExitButton}
              </button>
            </div>
          </div>

          {/* Center Standby Stage */}
          <div className="flex-1 flex items-center justify-center p-8 lg:p-16 overflow-hidden">
            {!currentSlideForPreview ? (
              <p className="text-[15px] opacity-75 text-center max-w-[460px]">
                {t.aiAds.fullscreenNoActiveAds}
              </p>
            ) : currentSlideForPreview.copyMode === 'no-copy' ? (
              <div className="w-full h-full flex items-center justify-center">
                {currentSlideForPreview.imageUrl && (
                  <img
                    src={currentSlideForPreview.imageUrl}
                    alt={currentSlideForPreview.seriesName}
                    referrerPolicy="no-referrer"
                    className={`max-h-[68vh] w-auto object-contain ${previewTheme.imgBlend}`}
                  />
                )}
              </div>
            ) : (
              <div className="max-w-[1040px] w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                <div className="md:col-span-5 flex items-center justify-center">
                  {currentSlideForPreview.imageUrl && (
                    <img
                      src={currentSlideForPreview.imageUrl}
                      alt={
                        currentSlideForPreview.title ||
                        currentSlideForPreview.seriesName
                      }
                      referrerPolicy="no-referrer"
                      className={`max-h-[58vh] w-auto object-contain ${previewTheme.imgBlend}`}
                    />
                  )}
                </div>

                <div className="md:col-span-7 space-y-6">
                  <p
                    className={`text-[13px] tracking-[0.26em] uppercase ${previewTheme.eyebrow}`}
                  >
                    RÉMY MARTIN · {currentSlideForPreview.seriesName}
                  </p>
                  {currentSlideForPreview.title && (
                    <h2
                      className={`font-luxury text-[40px] lg:text-[50px] leading-tight font-semibold ${previewTheme.title}`}
                    >
                      {currentSlideForPreview.title}
                    </h2>
                  )}
                  {(currentSlideForPreview.title ||
                    currentSlideForPreview.subtitle) && (
                    <div className={`w-14 h-[1px] ${previewTheme.divider}`} />
                  )}
                  {currentSlideForPreview.subtitle && (
                    <p
                      className={`text-[17px] leading-relaxed max-w-[540px] ${previewTheme.subtitle}`}
                    >
                      {currentSlideForPreview.subtitle}
                    </p>
                  )}
                  {currentSlideForPreview.ctaText && (
                    <div className="pt-4">
                      <span
                        className={`inline-block px-6 py-3 border text-[13px] tracking-[0.14em] ${previewTheme.cta}`}
                      >
                        {currentSlideForPreview.ctaText}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Slide Progress & Controls */}
          <div className="px-8 lg:px-12 h-[64px] border-t border-current/10 flex items-center justify-between gap-4 shrink-0 text-[12px]">
            <span className="opacity-65">
              {t.aiAds.fullscreenIdleNotice(standbyConfig.idleTimeoutSeconds)}
            </span>

            {activeAds.length > 1 && (
              <div className="flex items-center gap-2">
                {activeAds.map((ad, idx) => {
                  const isCurrent =
                    idx === previewSlideIndex % activeAds.length;
                  return (
                    <button
                      key={ad.id}
                      type="button"
                      aria-label={ad.title || t.sidebar.adNoCopyLabel(ad.seriesName)}
                      onClick={() => setPreviewSlideIndex(idx)}
                      className={`h-1.5 transition-all cursor-pointer ${
                        isCurrent
                          ? 'w-10 bg-[#A88950]'
                          : 'w-4 bg-current/25 hover:bg-current/50'
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
};
