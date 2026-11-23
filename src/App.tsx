import { useCallback, useEffect, useState } from 'react';
import { CreateSeriesModal } from './components/CreateSeriesModal';
import { ShowcaseFullPreview } from './components/ShowcaseFullPreview';
import { Sidebar } from './components/Sidebar';
import { useLanguage } from './i18n/LanguageContext';
import { AiAdsPage } from './pages/AiAdsPage';
import { DeviceManagementPage } from './pages/DeviceManagementPage';
import { LoginPage } from './pages/LoginPage';
import { SeriesDetailPage } from './pages/SeriesDetailPage';
import { SkuManagementPage } from './pages/SkuManagementPage';
import { API_CONFIG, authService, deviceService, seriesService } from './services';
import {
  AuthSession,
  CmsWorkspaceView,
  CreateSeriesPayload,
  ProductSeries,
  ProductSku,
  SeriesBasicInfo,
  ShowcaseDevice,
  StandbyCarouselConfig,
} from './types/cms';

function pickDefaultSeriesId(seriesList: ProductSeries[], preferredId?: string): string {
  if (preferredId && seriesList.some((item) => item.id === preferredId)) {
    return preferredId;
  }
  const club = seriesList.find((item) => item.id === 'club');
  return club ? club.id : (seriesList[0]?.id ?? '');
}

function mergeSeriesBasicInfo(
  devices: ShowcaseDevice[],
  basicSeries: SeriesBasicInfo[]
): ShowcaseDevice[] {
  const basicById = new Map(basicSeries.map((series) => [series.id, series]));
  return devices.map((device) => ({
    ...device,
    series: device.series.map((series) => {
      const basic = basicById.get(series.id);
      return basic ? { ...series, ...basic } : series;
    }),
  }));
}

export default function App() {
  const { locale, t, localizeError } = useLanguage();
  const [session, setSession] = useState<AuthSession | null>(() =>
    authService.getStoredSession()
  );
  const [devices, setDevices] = useState<ShowcaseDevice[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>('');
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');
  const [selectedAdId, setSelectedAdId] = useState<string>('');
  const [focusAdGeneratorToken, setFocusAdGeneratorToken] = useState<number>(0);
  const [workspaceView, setWorkspaceView] =
    useState<CmsWorkspaceView>('series-edit');
  const [isLoadingDevices, setIsLoadingDevices] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>('');
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState<boolean>(false);
  const [isNewSeriesModalOpen, setIsNewSeriesModalOpen] =
    useState<boolean>(false);

  const fetchDevices = useCallback(async () => {
    setIsLoadingDevices(true);
    setLoadError('');
    try {
      const mockDevices = await deviceService.listDevices();
      const data =
        API_CONFIG.useRealSeriesApi && mockDevices[0]
          ? mergeSeriesBasicInfo(
              mockDevices,
              await seriesService.listBasicSeries(mockDevices[0].id)
            )
          : mockDevices;
      setDevices(data);

      const resolvedDevice =
        data.find((d) => d.id === activeDeviceId) ?? data[0] ?? null;
      if (resolvedDevice) {
        setActiveDeviceId(resolvedDevice.id);
        setSelectedSeriesId((prevSeriesId) =>
          pickDefaultSeriesId(resolvedDevice.series, prevSeriesId)
        );
        const ads = resolvedDevice.standbyConfig?.ads ?? [];
        setSelectedAdId((prevAdId) =>
          prevAdId && ads.some((item) => item.id === prevAdId)
            ? prevAdId
            : (ads[0]?.id ?? '')
        );
      } else {
        setActiveDeviceId('');
        setSelectedSeriesId('');
        setSelectedAdId('');
      }
    } catch (error) {
      setLoadError(localizeError(error, t.app.loadErrorFallback));
    } finally {
      setIsLoadingDevices(false);
    }
  }, [activeDeviceId, localizeError, t.app.loadErrorFallback]);

  useEffect(() => {
    if (!session) {
      setDevices([]);
      setActiveDeviceId('');
      setSelectedSeriesId('');
      return;
    }
    void fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, locale]);

  const activeDevice =
    devices.find((item) => item.id === activeDeviceId) ?? devices[0] ?? null;
  const seriesList = activeDevice?.series ?? [];
  const selectedIndex = Math.max(
    0,
    seriesList.findIndex((item) => item.id === selectedSeriesId)
  );
  const selectedSeries = seriesList[selectedIndex] ?? seriesList[0] ?? null;

  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    setWorkspaceView('series-edit');
  };

  const handleLogout = async () => {
    await authService.logout();
    setSession(null);
    setIsFullPreviewOpen(false);
    setIsNewSeriesModalOpen(false);
    setWorkspaceView('series-edit');
  };

  const handleSelectDevice = (deviceId: string) => {
    const target = devices.find((d) => d.id === deviceId);
    if (!target) return;
    setActiveDeviceId(target.id);
    setSelectedSeriesId(pickDefaultSeriesId(target.series));
    setSelectedAdId(target.standbyConfig?.ads[0]?.id ?? '');
    if (workspaceView === 'device-manage' || workspaceView === 'sku-list') {
      setWorkspaceView('series-edit');
    }
  };

  const handleStandbyConfigChanged = (nextConfig: StandbyCarouselConfig) => {
    if (!activeDevice) return;
    setDevices((prev) =>
      prev.map((device) =>
        device.id === activeDevice.id
          ? {
              ...device,
              standbyConfig: nextConfig,
            }
          : device
      )
    );
  };

  const handleDeviceUpdated = (updatedDevice: ShowcaseDevice) => {
    setDevices((prev) =>
      prev.map((item) => (item.id === updatedDevice.id ? updatedDevice : item))
    );
    if (updatedDevice.id === activeDeviceId) {
      setSelectedSeriesId((prev) =>
        pickDefaultSeriesId(updatedDevice.series, prev)
      );
    }
  };

  const handleSelectSeries = (id: string) => {
    setSelectedSeriesId(id);
    setWorkspaceView('series-edit');
  };

  const handleCreateSeries = async (payload: CreateSeriesPayload) => {
    if (!activeDevice) return;
    const created = await seriesService.createSeries(activeDevice.id, payload);
    setDevices((prev) =>
      prev.map((device) =>
        device.id === activeDevice.id
          ? {
              ...device,
              lastSyncedAt: created.updatedAt,
              series: [...device.series, created],
            }
          : device
      )
    );
    setSelectedSeriesId(created.id);
    setWorkspaceView('series-edit');
  };

  const handleSeriesUpdated = (updatedSeries: ProductSeries) => {
    if (!activeDevice) return;
    setDevices((prev) =>
      prev.map((device) =>
        device.id === activeDevice.id
          ? {
              ...device,
              lastSyncedAt: updatedSeries.updatedAt,
              series: device.series.map((s) =>
                s.id === updatedSeries.id ? updatedSeries : s
              ),
            }
          : device
      )
    );
  };

  const handleSeriesDeleted = (deletedSeriesId: string) => {
    if (!activeDevice) return;
    setDevices((prev) =>
      prev.map((device) => {
        if (device.id !== activeDevice.id) return device;
        const nextSeries = device.series.filter((s) => s.id !== deletedSeriesId);
        if (selectedSeriesId === deletedSeriesId && nextSeries[0]) {
          setSelectedSeriesId(nextSeries[0].id);
          setWorkspaceView('series-edit');
        }
        return {
          ...device,
          series: nextSeries,
        };
      })
    );
  };

  const handleSeriesSkusChanged = (seriesId: string, skus: ProductSku[]) => {
    if (!activeDevice) return;
    setDevices((prev) =>
      prev.map((device) =>
        device.id === activeDevice.id
          ? {
              ...device,
              series: device.series.map((s) =>
                s.id === seriesId ? { ...s, skus } : s
              ),
            }
          : device
      )
    );
  };

  if (!session) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#1D1D1F] flex">
      {/* Left Navigation Sidebar with Top Module Switcher & Bottom Bound Device Switcher */}
      <Sidebar
        devices={devices}
        activeDevice={activeDevice}
        seriesList={seriesList}
        selectedSeriesId={selectedSeries?.id ?? ''}
        standbyAds={activeDevice?.standbyConfig?.ads ?? []}
        selectedAdId={selectedAdId}
        workspaceView={workspaceView}
        currentUser={session.user.username}
        onSelectDevice={handleSelectDevice}
        onOpenDeviceManagement={() => setWorkspaceView('device-manage')}
        onSwitchToProducts={() => setWorkspaceView('series-edit')}
        onSwitchToAiAds={() => {
          const ads = activeDevice?.standbyConfig?.ads ?? [];
          if (!selectedAdId || !ads.some((item) => item.id === selectedAdId)) {
            setSelectedAdId(ads[0]?.id ?? '');
          }
          setWorkspaceView('ai-ads');
        }}
        onSelectSeries={handleSelectSeries}
        onCreateSeries={() => setIsNewSeriesModalOpen(true)}
        onSelectAd={(adId) => {
          setSelectedAdId(adId);
          setWorkspaceView('ai-ads');
        }}
        onFocusAdGenerator={() => {
          setWorkspaceView('ai-ads');
          setFocusAdGeneratorToken((prev) => prev + 1);
        }}
        onLogout={() => void handleLogout()}
      />

      {/* Main Content Area: Loading / Error / Device Management / Series / SKU */}
      {isLoadingDevices && devices.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center space-y-2">
            <p className="font-luxury text-[24px] text-[#1D1D1F]">
              {t.app.loadingTitle}
            </p>
            <p className="text-[13px] text-[#9A8E7A]">
              {t.app.loadingSubtitle}
            </p>
          </div>
        </div>
      ) : loadError && devices.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="bg-white border border-[#E6E0D4] p-8 max-w-[420px] w-full text-center space-y-4">
            <h2 className="text-[16px] font-medium text-[#141414]">
              {t.app.loadErrorTitle}
            </h2>
            <p className="text-[13px] text-[#B9382C]">{loadError}</p>
            <button
              type="button"
              onClick={() => void fetchDevices()}
              className="px-5 py-2 bg-[#141414] hover:bg-[#A88950] text-white text-[13px] font-medium transition-colors cursor-pointer"
            >
              {t.app.retryButton}
            </button>
          </div>
        </div>
      ) : workspaceView === 'device-manage' ? (
        <DeviceManagementPage
          devices={devices}
          activeDeviceId={activeDevice?.id ?? ''}
          storeName={
            locale !== 'zh-CN'
              ? /[\u4e00-\u9fff]/.test(session.user.storeName)
                ? t.meta.defaultStoreName
                : session.user.storeName || t.meta.defaultStoreName
              : session.user.storeName === "Shanghai Jing'an Flagship"
                ? t.meta.defaultStoreName
                : session.user.storeName || t.meta.defaultStoreName
          }
          onSelectDeviceForEdit={handleSelectDevice}
          onDeviceUpdated={handleDeviceUpdated}
          onBackToContent={() => setWorkspaceView('series-edit')}
        />
      ) : activeDevice && workspaceView === 'ai-ads' ? (
        <AiAdsPage
          deviceId={activeDevice.id}
          deviceName={activeDevice.name}
          seriesList={seriesList}
          standbyConfig={activeDevice.standbyConfig}
          selectedAdId={selectedAdId}
          focusGeneratorToken={focusAdGeneratorToken}
          onSelectAd={setSelectedAdId}
          onStandbyConfigChanged={handleStandbyConfigChanged}
        />
      ) : activeDevice && selectedSeries && workspaceView === 'series-edit' ? (
        <SeriesDetailPage
          deviceId={activeDevice.id}
          deviceName={activeDevice.name}
          series={selectedSeries}
          seriesIndex={selectedIndex}
          totalSeries={seriesList.length}
          canDelete={seriesList.length > 1}
          onSeriesUpdated={handleSeriesUpdated}
          onSeriesDeleted={handleSeriesDeleted}
          onNavigateToSkus={() => setWorkspaceView('sku-list')}
          onOpenFullPreview={() => setIsFullPreviewOpen(true)}
        />
      ) : activeDevice && selectedSeries && workspaceView === 'sku-list' ? (
        <SkuManagementPage
          deviceId={activeDevice.id}
          deviceName={activeDevice.name}
          series={selectedSeries}
          onBackToSeries={() => setWorkspaceView('series-edit')}
          onSeriesSkusChanged={handleSeriesSkusChanged}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="bg-white border border-[#E6E0D4] p-10 max-w-[420px] w-full text-center space-y-4">
            <p className="font-luxury text-[24px] text-[#141414]">
              {t.app.emptySeriesTitle}
            </p>
            <p className="text-[13px] text-[#8E816C]">
              {t.app.emptySeriesSubtitle}
            </p>
            <button
              type="button"
              onClick={() => setIsNewSeriesModalOpen(true)}
              className="px-5 py-2.5 bg-[#141414] hover:bg-[#A88950] text-white text-[13px] font-medium transition-colors cursor-pointer"
            >
              {t.app.addFirstSeriesButton}
            </button>
          </div>
        </div>
      )}

      {/* Create New Series Modal */}
      <CreateSeriesModal
        isOpen={isNewSeriesModalOpen}
        onClose={() => setIsNewSeriesModalOpen(false)}
        onCreate={handleCreateSeries}
      />

      {/* Full-Screen Live AI Showcase Preview */}
      {isFullPreviewOpen && activeDevice && selectedSeries && (
        <ShowcaseFullPreview
          deviceName={activeDevice.name}
          deviceId={activeDevice.id}
          seriesList={seriesList}
          initialSeriesId={selectedSeries.id}
          onClose={() => setIsFullPreviewOpen(false)}
        />
      )}
    </div>
  );
}
