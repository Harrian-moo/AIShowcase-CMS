import React, { useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Locale } from '../i18n/localeStorage';

const LOCALE_OPTIONS: Locale[] = ['zh', 'en'];

function supportsAnchorPositioning(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('anchor-name', '--mwg-check') &&
    CSS.supports('position-area', 'block-end')
  );
}

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, t } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [fallbackCoords, setFallbackCoords] = useState<{
    top: number;
    right: number;
  } | null>(null);

  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const popoverId = `lang-popover-${safeId}`;
  const anchorName = `--lang-anchor-${safeId}`;

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const handleToggle = (event: React.ToggleEvent<HTMLDivElement>) => {
    const nextOpen = event.newState === 'open';
    setIsOpen(nextOpen);

    if (nextOpen && !supportsAnchorPositioning() && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setFallbackCoords({
        top: Math.round(rect.bottom + 8),
        right: Math.max(12, Math.round(window.innerWidth - rect.right)),
      });
    } else if (!nextOpen) {
      setFallbackCoords(null);
    }
  };

  const handleSelectLocale = (option: Locale) => {
    setLocale(option);
    popoverRef.current?.hidePopover?.();
  };

  const triggerStyle = {
    anchorName,
  } as React.CSSProperties;

  const popoverStyle = (
    fallbackCoords
      ? {
          positionAnchor: anchorName,
          top: `${fallbackCoords.top}px`,
          right: `${fallbackCoords.right}px`,
          left: 'auto',
          bottom: 'auto',
        }
      : {
          positionAnchor: anchorName,
        }
  ) as React.CSSProperties;

  const compactLocaleLabel = locale === 'zh' ? '中' : 'EN';

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        popoverTarget={popoverId}
        popoverTargetAction="toggle"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={popoverId}
        aria-label={t.language.menuHeader}
        style={triggerStyle}
        className={`h-10 min-w-[52px] px-2.5 bg-white border text-[12px] transition-colors duration-150 cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A88950] ${
          isOpen
            ? 'border-[#141414] bg-[#FCFBF8] text-[#141414]'
            : 'border-[#DCD3C4] text-[#141414] hover:border-[#141414]'
        }`}
      >
        <span className="font-semibold tracking-[0.04em] text-[#141414]">
          {compactLocaleLabel}
        </span>
        <ChevronDown
          aria-hidden="true"
          size={13}
          strokeWidth={1.8}
          className={`text-[#8E816C] transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Native Popover API (Top Layer) + CSS Anchor Positioning */}
      <div
        ref={popoverRef}
        id={popoverId}
        popover="auto"
        role="listbox"
        aria-label={t.language.menuHeader}
        onToggle={handleToggle}
        style={popoverStyle}
        className="mwg-popover mwg-popover--lang w-[176px] bg-white border border-[#D4C8B4] border-t-2 border-t-[#141414] shadow-[0_16px_38px_rgba(20,20,20,0.10)]"
      >
        <div className="px-3.5 py-2 border-b border-[#EFEAE0] bg-[#FAF8F4] text-[10px] tracking-[0.14em] text-[#8E7D63] uppercase">
          {t.language.menuHeader}
        </div>
        <div className="divide-y divide-[#F2EDE4]">
          {LOCALE_OPTIONS.map((option) => {
            const isSelected = option === locale;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectLocale(option)}
                className={`w-full text-left px-3.5 py-2.5 text-[13px] transition-colors cursor-pointer flex items-center justify-between gap-3 border-l-[3px] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#A88950] ${
                  isSelected
                    ? 'bg-[#FAF7F0] border-l-[#A88950] font-medium text-[#141414]'
                    : 'bg-white border-l-transparent text-[#4A4845] hover:bg-[#FCFBF8] hover:border-l-[#141414] hover:text-[#141414]'
                }`}
              >
                <span>{t.language.options[option]}</span>
                {isSelected && (
                  <span className="text-[10px] tracking-[0.1em] text-[#A88950] font-medium shrink-0">
                    {t.language.activeTag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
