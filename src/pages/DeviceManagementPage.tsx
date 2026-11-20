import React, { useState } from 'react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageContext';
import { deviceService } from '../services';
import { ShowcaseDevice } from '../types/cms';

interface DeviceManagementPageProps {
  devices: ShowcaseDevice[];
  activeDeviceId: string;
  storeName: string;
  onSelectDeviceForEdit: (deviceId: string) => void;
  onDeviceUpdated: (updated: ShowcaseDevice) => void;
  onBackToContent: () => void;
}

export const DeviceManagementPage: React.FC<DeviceManagementPageProps> = ({
  devices,
  activeDeviceId,
  storeName,
  onSelectDeviceForEdit,
  onDeviceUpdated,
  onBackToContent,
}) => {
  const { t, localizeError } = useLanguage();
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editLocation, setEditLocation] = useState<string>('');
  const [isSavingMeta, setIsSavingMeta] = useState<boolean>(false);

  const [cloningTargetId, setCloningTargetId] = useState<string | null>(null);
  const [cloneSourceId, setCloneSourceId] = useState<string>('');
  const [isCloning, setIsCloning] = useState<boolean>(false);

  const [noticeMessage, setNoticeMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const showNotice = (msg: string) => {
    setNoticeMessage(msg);
    window.setTimeout(() => setNoticeMessage(''), 2800);
  };

  const openEditMeta = (device: ShowcaseDevice) => {
    setCloningTargetId(null);
    setErrorMessage('');
    setEditingDeviceId(device.id);
    setEditName(device.name);
    setEditLocation(device.location);
  };

  const handleSaveMeta = async (deviceId: string) => {
    if (isSavingMeta) return;
    setIsSavingMeta(true);
    setErrorMessage('');
    try {
      const updated = await deviceService.updateDeviceMeta(deviceId, {
        name: editName,
        location: editLocation,
      });
      onDeviceUpdated(updated);
      setEditingDeviceId(null);
      showNotice(t.device.metaUpdatedNotice(updated.name));
    } catch (error) {
      setErrorMessage(localizeError(error, t.device.metaUpdateErrorFallback));
    } finally {
      setIsSavingMeta(false);
    }
  };

  const openClonePanel = (targetDevice: ShowcaseDevice) => {
    setEditingDeviceId(null);
    setErrorMessage('');
    const firstCandidate = devices.find((d) => d.id !== targetDevice.id);
    setCloningTargetId(targetDevice.id);
    setCloneSourceId(firstCandidate?.id ?? '');
  };

  const handleConfirmClone = async (targetDevice: ShowcaseDevice) => {
    if (!cloneSourceId || isCloning) return;
    setIsCloning(true);
    setErrorMessage('');
    try {
      const updated = await deviceService.cloneDeviceContent(targetDevice.id, {
        sourceDeviceId: cloneSourceId,
      });
      onDeviceUpdated(updated);
      setCloningTargetId(null);
      showNotice(t.device.clonedNotice(updated.name));
    } catch (error) {
      setErrorMessage(localizeError(error, t.device.cloneErrorFallback));
    } finally {
      setIsCloning(false);
    }
  };

  const onlineCount = devices.filter((d) => d.connectionStatus === 'online').length;
  const onlineSummary = t.device.onlineSummary(onlineCount, devices.length);

  return (
    <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#FAF9F6]">
      {/* Solid White Architectural Header Aligned to 1160px Content Grid */}
      <header className="sticky top-0 z-20 bg-white border-b border-[#E6E0D4]">
        <div className="max-w-[1160px] w-full mx-auto px-8 lg:px-12 h-[76px] flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-[14px] min-w-0">
            <span className="text-[#8E816C] whitespace-nowrap">{storeName}</span>
            <span className="text-[#CBC4B7]" aria-hidden="true">
              /
            </span>
            <span className="font-medium text-[#141414] whitespace-nowrap">
              {t.device.breadcrumbTitle}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {noticeMessage && (
              <span className="text-[13px] text-[#A88950] font-medium mr-1 whitespace-nowrap">
                {noticeMessage}
              </span>
            )}
            <button
              type="button"
              onClick={onBackToContent}
              className="px-4.5 py-2.5 border border-[#141414] bg-white text-[13.5px] font-medium text-[#141414] hover:bg-[#141414] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.device.backToContent}
            </button>
            <div className="h-5 w-[1px] bg-[#E6E0D4] mx-0.5" aria-hidden="true" />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
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

        {/* Header Summary */}
        <div className="pb-9 border-b border-[#E6E0D4] flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <p className="text-[12px] tracking-[0.22em] text-[#A88950] uppercase">
              {t.device.eyebrow}
            </p>
            <h1 className="font-luxury text-[42px] leading-tight text-[#141414] mt-1.5 font-semibold tracking-[0.01em]">
              {t.device.pageTitle}
            </h1>
            <p className="text-[14px] text-[#6E675C] mt-2.5 leading-relaxed max-w-[740px]">
              {t.device.pageDescription}
            </p>
          </div>

          <div className="text-[14px] text-[#6E675C] tabular-nums whitespace-nowrap shrink-0">
            {onlineSummary.prefix}
            <span className="text-[#A88950] font-medium">
              {onlineSummary.onlineCount}
            </span>
            {onlineSummary.suffix}
          </div>
        </div>

        {/* Bound Device Cards (Sharp Architectural Geometry + @container responsive) */}
        <div className="@container mt-10 space-y-6 pb-12">
          {devices.map((device, index) => {
            const isCurrent = device.id === activeDeviceId;
            const totalSkus = device.series.reduce(
              (sum, series) => sum + series.skus.length,
              0
            );
            const isEditing = editingDeviceId === device.id;
            const isCloningThis = cloningTargetId === device.id;
            const otherDevices = devices.filter((d) => d.id !== device.id);

            return (
              <section
                key={device.id}
                className={`bg-white border p-6 sm:p-8 transition-all ${
                  isCurrent
                    ? 'border-[#D4C5A9] border-l-[3px] border-l-[#A88950] shadow-[0_8px_26px_rgba(20,20,20,0.055),0_1px_3px_rgba(20,20,20,0.025)]'
                    : 'border-[#ECE7DD] shadow-[0_4px_18px_rgba(20,20,20,0.035),0_1px_3px_rgba(20,20,20,0.02)]'
                }`}
              >
                {/* Unboxed Metadata Row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#8E816C] tabular-nums">
                    <span className="font-medium text-[#A88950]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{t.device.hardwareIdPrefix(device.id)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{t.device.serialNumberPrefix(device.serialNumber)}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        device.connectionStatus === 'online'
                          ? 'text-[#A88950] font-medium'
                          : 'text-[#9A9A9E]'
                      }
                    >
                      {device.connectionStatus === 'online'
                        ? t.common.online
                        : t.common.offline}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{device.resolution}</span>
                  </div>

                  {isCurrent && (
                    <span className="text-[11px] tracking-[0.12em] font-medium text-[#141414] whitespace-nowrap">
                      {t.device.currentEditingTag}
                    </span>
                  )}
                </div>

                {/* Device Title & Location */}
                <div className="mt-4 flex flex-col @3xl:flex-row @3xl:items-center justify-between gap-6">
                  <div className="min-w-0">
                    <h2 className="text-[22px] font-semibold text-[#141414] leading-snug">
                      {device.name}
                    </h2>
                    <p className="text-[14px] text-[#6E675C] mt-1">
                      {device.location || t.device.noLocationPlaceholder}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditMeta(device)}
                      className="px-4.5 py-2.5 border border-[#141414] bg-white text-[13.5px] text-[#141414] hover:bg-[#141414] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t.device.editMetaButton}
                    </button>
                    {otherDevices.length > 0 && (
                      <button
                        type="button"
                        onClick={() => openClonePanel(device)}
                        className="px-4.5 py-2.5 border border-[#D8CBB2] bg-white text-[13.5px] text-[#4A4845] hover:border-[#141414] hover:text-[#141414] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {t.device.cloneContentButton}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectDeviceForEdit(device.id)}
                      className="px-5 py-2.5 bg-[#A88950] hover:bg-[#8E703A] text-white text-[13.5px] font-medium transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t.device.editDeviceContentCta}
                    </button>
                  </div>
                </div>

                {/* Content Summary Strip */}
                <div className="mt-6 pt-4 border-t border-[#EFEAE0] flex flex-wrap items-center gap-x-8 gap-y-2 text-[12px] text-[#8E816C] tabular-nums">
                  <span>
                    {t.device.publishedSeriesLabel(
                      device.series.map((s) => s.name).join(' / ') ||
                        t.device.publishedSeriesEmpty
                    )}
                  </span>
                  <span>
                    {t.device.seriesSkuSummary(device.series.length, totalSkus)}
                  </span>
                  <span>{t.device.lastSyncedLabel(device.lastSyncedAt)}</span>
                </div>

                {/* Inline Edit Device Name & Location Panel */}
                {isEditing && (
                  <div className="mt-6 pt-6 border-t border-[#E6E0D4] space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor={`device-id-${device.id}`}
                          className="block text-[12px] text-[#8E816C] mb-1.5"
                        >
                          {t.device.hardwareIdReadonlyLabel}
                        </label>
                        <input
                          id={`device-id-${device.id}`}
                          type="text"
                          value={device.id}
                          disabled
                          className="w-full px-3.5 py-2.5 bg-[#F4F1EA] border border-[#E6E0D4] text-[13px] text-[#8E816C] tabular-nums cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`device-sn-${device.id}`}
                          className="block text-[12px] text-[#8E816C] mb-1.5"
                        >
                          {t.device.serialNumberReadonlyLabel}
                        </label>
                        <input
                          id={`device-sn-${device.id}`}
                          type="text"
                          value={device.serialNumber}
                          disabled
                          className="w-full px-3.5 py-2.5 bg-[#F4F1EA] border border-[#E6E0D4] text-[13px] text-[#8E816C] tabular-nums cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 @xl:grid-cols-2 gap-5">
                      <div className="mwg-field">
                        <label
                          htmlFor={`device-name-${device.id}`}
                          className="block text-[12px] text-[#6E675C] mb-1.5 transition-colors"
                        >
                          {t.device.displayNameLabel}
                        </label>
                        <input
                          id={`device-name-${device.id}`}
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder={t.device.displayNamePlaceholder}
                          className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[14px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`device-loc-${device.id}`}
                          className="block text-[12px] text-[#6E675C] mb-1.5"
                        >
                          {t.device.locationLabel}
                        </label>
                        <input
                          id={`device-loc-${device.id}`}
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          placeholder={t.device.locationPlaceholder}
                          className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-transparent border-b-[#D8CEBC] text-[14px] text-[#141414] hover:bg-[#F5F1E9] focus:bg-white focus:border-[#141414] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        disabled={isSavingMeta}
                        onClick={() => setEditingDeviceId(null)}
                        className="px-4 py-2 border border-[#D8CBB2] bg-white text-[13px] text-[#4A4845] hover:border-[#141414] hover:text-[#141414] cursor-pointer"
                      >
                        {t.common.cancel}
                      </button>
                      <button
                        type="button"
                        disabled={isSavingMeta}
                        onClick={() => void handleSaveMeta(device.id)}
                        className="px-5 py-2 bg-[#141414] hover:bg-[#A88950] disabled:opacity-60 text-white text-[13px] font-medium transition-colors cursor-pointer"
                      >
                        {isSavingMeta ? t.common.saving : t.device.saveDeviceMeta}
                      </button>
                    </div>
                  </div>
                )}

                {/* Inline Clone Content From Another Device Panel */}
                {isCloningThis && otherDevices.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-[#E6E0D4] space-y-4">
                    <div>
                      <div className="text-[15px] font-semibold text-[#141414]">
                        {t.device.cloneTitle}
                      </div>
                      <p className="text-[12px] text-[#8E816C] mt-1">
                        {t.device.cloneWarning(device.name)}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <select
                        aria-label={t.device.cloneSelectAria}
                        value={cloneSourceId}
                        onChange={(e) => setCloneSourceId(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-[#FCFBF9] border border-[#DDD4C4] text-[13px] text-[#141414] focus:bg-white focus:border-[#141414] focus:outline-none"
                      >
                        {otherDevices.map((candidate) => (
                          <option key={candidate.id} value={candidate.id}>
                            {t.device.cloneOptionLabel(
                              candidate.name,
                              candidate.id,
                              candidate.series.length
                            )}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          disabled={isCloning}
                          onClick={() => setCloningTargetId(null)}
                          className="px-4 py-2 border border-[#D8CBB2] bg-white text-[13px] text-[#4A4845] hover:border-[#141414] hover:text-[#141414] cursor-pointer"
                        >
                          {t.common.cancel}
                        </button>
                        <button
                          type="button"
                          disabled={isCloning || !cloneSourceId}
                          onClick={() => void handleConfirmClone(device)}
                          className="px-5 py-2 bg-[#141414] hover:bg-[#A88950] disabled:opacity-60 text-white text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {isCloning
                            ? t.device.cloningButton
                            : t.device.confirmCloneButton}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};
