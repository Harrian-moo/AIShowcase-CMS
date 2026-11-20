import { Locale } from './localeStorage';

export interface TranslationDictionary {
  meta: {
    pageTitle: string;
    defaultStoreName: string;
  };
  language: {
    buttonPrefix: string;
    currentName: string;
    menuHeader: string;
    activeTag: string;
    options: {
      zh: string;
      en: string;
    };
  };
  common: {
    close: string;
    cancel: string;
    dismiss: string;
    online: string;
    offline: string;
    current: string;
    saving: string;
    deleting: string;
    uploading: string;
    notUploaded: string;
    noImage: string;
  };
  login: {
    subtitle: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    showPassword: string;
    hidePassword: string;
    submitting: string;
    submitButton: string;
    fallbackError: string;
  };
  sidebar: {
    moduleProducts: string;
    moduleAiAds: string;
    moduleSwitchAria: string;
    productSeries: string;
    addSeries: string;
    seriesNavAria: string;
    unnamedTheme: string;
    skuUnit: string;
    adPlaylistTitle: string;
    generateAdShort: string;
    adPlaylistNavAria: string;
    adStatusActive: string;
    adStatusPaused: string;
    adDurationSeconds: (seconds: number) => string;
    adNoCopyLabel: (seriesName: string) => string;
    adPlaylistEmpty: string;
    currentShowcase: string;
    deviceListboxAria: string;
    selectShowcaseHeader: string;
    totalDevicesCount: (count: number) => string;
    switchAction: string;
    collapseAction: string;
    manageBoundDevices: string;
    deviceCountUnit: (count: number) => string;
    adminPrefix: (username: string) => string;
    logout: string;
  };
  app: {
    loadingTitle: string;
    loadingSubtitle: string;
    loadErrorTitle: string;
    loadErrorFallback: string;
    retryButton: string;
    emptySeriesTitle: string;
    emptySeriesSubtitle: string;
    addFirstSeriesButton: string;
  };
  series: {
    breadcrumbSeries: string;
    unsavedChanges: string;
    updatedAt: (timestamp: string) => string;
    previewButton: string;
    saveAndPublish: string;
    publishedNotice: (deviceName: string) => string;
    saveErrorFallback: string;
    uploadErrorFallback: string;
    deleteErrorFallback: string;
    eyebrow: string;
    activeSkuRatio: (active: number, total: number) => string;
    enterSkuManagement: (count: number) => string;
    visualSectionTitle: string;
    visualSectionHint: string;
    visualDescription: string;
    changeImageButton: string;
    processWhiteBgButton: string;
    processingWhiteBg: string;
    restoreOriginalImageButton: string;
    whiteBgProcessedNotice: string;
    whiteBgMockNotice: string;
    whiteBgErrorFallback: string;
    removeImageButton: string;
    basicInfoTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    subtitleLabel: string;
    subtitlePlaceholder: string;
    taglinePrimaryLabel: string;
    taglinePrimaryPlaceholder: string;
    taglineSecondaryLabel: string;
    taglineSecondaryPlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    tastingSectionTitle: string;
    aromaFallbackLabel: string;
    palateFallbackLabel: string;
    finishFallbackLabel: string;
    originLabel: string;
    originPlaceholder: string;
    abvLabel: string;
    abvPlaceholder: string;
    deleteSeriesButton: string;
    deleteConfirmPrompt: (name: string) => string;
    deleteConfirmButton: string;
    previewModalAria: string;
    previewModalTitle: string;
    previewModalSubtitle: (name: string) => string;
    previewCardMode: string;
    previewStageMode: string;
    previewEscHint: string;
    openFullPreview: string;
  };
  sku: {
    breadcrumbSeries: string;
    breadcrumbSkuManagement: string;
    backToSeries: string;
    addSkuButton: string;
    eyebrow: (seriesName: string) => string;
    pageTitle: string;
    loadErrorFallback: string;
    searchPlaceholder: string;
    searchAria: string;
    filterAll: (count: number) => string;
    filterActive: (count: number) => string;
    filterInactive: (count: number) => string;
    emptyTitle: string;
    emptyNoSkusHint: (seriesName: string) => string;
    emptyFilterHint: string;
    resetFilter: string;
    statusActive: string;
    statusInactive: string;
    shelfSlotPrefix: (slot: string) => string;
    editProductLink: string;
    emptyHighlightHint: string;
    specVolume: string;
    specAbv: string;
    specPrice: string;
    specPackaging: string;
    toastCreated: string;
    toastUpdated: string;
    toastDeleted: string;
    uploadErrorFallback: string;
    draftDefaultName: (seriesName: string) => string;
    draftDefaultPackaging: string;
    draftDefaultServing: string;
    draftDefaultPricePrefix: string;
  };
  skuSheet: {
    ariaNew: string;
    ariaEdit: (name: string) => string;
    headerNew: (seriesName: string) => string;
    headerEdit: (seriesName: string) => string;
    unnamedProduct: string;
    fallbackName: (seriesName: string) => string;
    saveErrorFallback: string;
    deleteErrorFallback: string;
    uploadErrorFallback: string;
    productImageTitle: string;
    productImageHint: string;
    uploadNewImage: string;
    processWhiteBgButton: string;
    processingWhiteBg: string;
    restoreOriginalImageButton: string;
    whiteBgMockNotice: string;
    whiteBgErrorFallback: string;
    restoreDefaultImage: string;
    basicInfoTitle: string;
    primaryNameLabel: string;
    primaryNamePlaceholder: string;
    secondaryNameLabel: string;
    secondaryNamePlaceholder: string;
    skuCodeLabel: string;
    skuCodePlaceholder: string;
    shelfSlotLabel: string;
    shelfSlotPlaceholder: string;
    specSectionTitle: string;
    volumeLabel: string;
    volumePlaceholder: string;
    abvLabel: string;
    abvPlaceholder: string;
    priceLabel: string;
    pricePlaceholder: string;
    packagingLabel: string;
    packagingPlaceholder: string;
    sortOrderLabel: string;
    editorialSectionTitle: string;
    highlightLabel: string;
    highlightPlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    servingLabel: string;
    servingPlaceholder: string;
    deleteProduct: string;
    confirmDeletePrompt: string;
    confirmDeleteAction: string;
    createProductButton: string;
    saveChangesButton: string;
  };
  device: {
    breadcrumbTitle: string;
    backToContent: string;
    eyebrow: string;
    pageTitle: string;
    pageDescription: string;
    onlineSummary: (online: number, total: number) => {
      prefix: string;
      onlineCount: string;
      suffix: string;
    };
    hardwareIdPrefix: (id: string) => string;
    serialNumberPrefix: (sn: string) => string;
    currentEditingTag: string;
    noLocationPlaceholder: string;
    editMetaButton: string;
    cloneContentButton: string;
    editDeviceContentCta: string;
    publishedSeriesLabel: (names: string) => string;
    publishedSeriesEmpty: string;
    seriesSkuSummary: (seriesCount: number, skuCount: number) => string;
    lastSyncedLabel: (timestamp: string) => string;
    hardwareIdReadonlyLabel: string;
    serialNumberReadonlyLabel: string;
    displayNameLabel: string;
    displayNamePlaceholder: string;
    locationLabel: string;
    locationPlaceholder: string;
    saveDeviceMeta: string;
    cloneTitle: string;
    cloneWarning: (deviceName: string) => string;
    cloneSelectAria: string;
    cloneOptionLabel: (name: string, id: string, seriesCount: number) => string;
    cloningButton: string;
    confirmCloneButton: string;
    metaUpdatedNotice: (name: string) => string;
    metaUpdateErrorFallback: string;
    clonedNotice: (name: string) => string;
    cloneErrorFallback: string;
  };
  createSeries: {
    ariaLabel: string;
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    taglinePrimaryLabel: string;
    taglinePrimaryPlaceholder: string;
    taglineSecondaryLabel: string;
    taglineSecondaryPlaceholder: string;
    nameRequiredError: string;
    createErrorFallback: string;
    creatingButton: string;
    createButton: string;
  };
  preview: {
    emptySeriesImage: string;
    fallbackTaglinePrimary: string;
    fallbackTaglineSecondary: string;
    fallbackDescription: string;
    fallbackOrigin: string;
    fullPreviewAria: string;
    livePreviewLabel: string;
    backToCmsButton: string;
    emptyMainImage: string;
    seriesFormatsLabel: string;
    seriesOverviewButton: string;
    selectSeriesTitle: string;
  };
  aiAds: {
    breadcrumbTitle: string;
    standbyPreviewButton: string;
    saveAndPublish: string;
    eyebrow: string;
    pageTitle: string;
    pageSubtitle: string;
    autoRotateLabel: string;
    autoRotateOn: string;
    autoRotateOff: string;
    idleTimeoutLabel: string;
    idleTimeoutOption: (seconds: number) => string;
    activeAdsSummary: (active: number, total: number) => string;
    sectionGenerateTitle: string;
    sectionEditorTitle: string;
    sectionHistoryTitle: string;
    targetSeriesLabel: string;
    targetSkuLabel: string;
    allSeriesHeroOption: string;
    visualStyleLabel: string;
    visualStyles: {
      'luxury-studio': string;
      'nocturne-lounge': string;
      'festive-gifting': string;
      'modern-french': string;
    };
    copyModeLabel: string;
    copyModeWithCopy: string;
    copyModeNoCopy: string;
    copyModeNoCopyHint: string;
    copyFieldsHint: string;
    autoFillCopyButton: string;
    genTitleLabel: string;
    genTitlePlaceholder: string;
    genSubtitleLabel: string;
    genSubtitlePlaceholder: string;
    genCtaLabel: string;
    genCtaPlaceholder: string;
    promptBriefLabel: string;
    promptBriefPlaceholder: string;
    generateButton: string;
    generatingButton: string;
    generateMockNotice: string;
    generateSuccessNotice: string;
    generateErrorFallback: string;
    generatedModalTitle: string;
    generatedModalSubtitle: string;
    historyModalTitle: string;
    historyModalSubtitle: string;
    saveToCarouselButton: string;
    savingToCarouselButton: string;
    keepInHistoryOnlyButton: string;
    keptInHistoryNotice: string;
    savedToCarouselNotice: string;
    settingsSavedNotice: string;
    adSavedNotice: (deviceName: string) => string;
    saveErrorFallback: string;
    deleteErrorFallback: string;
    lockedStyleLabel: string;
    copyModeMetaLabel: string;
    lockedAfterGenerateHint: string;
    noCopyReadonlyNotice: string;
    adHeadlineLabel: string;
    adHeadlinePlaceholder: string;
    adSubtitleLabel: string;
    adSubtitlePlaceholder: string;
    adCtaLabel: string;
    adCtaPlaceholder: string;
    adDurationLabel: string;
    adDurationOption: (seconds: number) => string;
    adStatusLabel: string;
    statusActive: string;
    statusPaused: string;
    moveUpButton: string;
    moveDownButton: string;
    deleteAdButton: string;
    deleteConfirmPrompt: string;
    deleteConfirmAction: string;
    emptyEditorTitle: string;
    emptyEditorSubtitle: string;
    historyRetentionHint: (days: number) => string;
    historySummaryLine: (total: number, unsaved: number) => string;
    historyExpandButton: string;
    historyCollapseButton: string;
    historyGroupByLabel: string;
    historyGroupByDate: string;
    historyGroupByProduct: string;
    historyFilterAll: (count: number) => string;
    historyFilterUnsaved: (count: number) => string;
    historyFilterSaved: (count: number) => string;
    historyExpandAllGroups: string;
    historyCollapseAllGroups: string;
    historyGroupCount: (count: number) => string;
    historyGroupExpand: string;
    historyGroupCollapse: string;
    historyDateToday: string;
    historyDateYesterday: string;
    historyFilteredEmptyTitle: string;
    historyResetFilterButton: string;
    historyDeleteShort: string;
    historyEmptyTitle: string;
    historyEmptySubtitle: string;
    historySavedTag: string;
    historyUnsavedTag: string;
    historyPreviewButton: string;
    historyAddToCarouselButton: string;
    historyViewInCarouselButton: string;
    historyDeleteButton: string;
    historyCreatedLabel: string;
    historyExpiresLabel: string;
    historyProductLabel: string;
    historyDeleteErrorFallback: string;
    previewPosterTag: string;
    fullscreenHeaderLabel: string;
    fullscreenSlideCounter: (current: number, total: number) => string;
    fullscreenExitButton: string;
    fullscreenIdleNotice: (seconds: number) => string;
    fullscreenNoActiveAds: string;
  };
  errors: Record<string, string>;
}

export const TRANSLATIONS: Record<Locale, TranslationDictionary> = {
  zh: {
    meta: {
      pageTitle: '人头马 AI SHOWCASE 展示柜后台管理系统',
      defaultStoreName: '上海静安旗舰店',
    },
    language: {
      buttonPrefix: '语言',
      currentName: '简体中文',
      menuHeader: '切换界面语言',
      activeTag: '当前',
      options: {
        zh: '简体中文',
        en: '英文',
      },
    },
    common: {
      close: '关闭',
      cancel: '取消',
      dismiss: '忽略',
      online: '在线',
      offline: '离线',
      current: '当前',
      saving: '保存中...',
      deleting: '删除中...',
      uploading: '上传中...',
      notUploaded: '未上传',
      noImage: '无图片',
    },
    login: {
      subtitle: '展示柜后台内容管理系统',
      usernameLabel: '用户名',
      usernamePlaceholder: '请输入用户名',
      passwordLabel: '密码',
      passwordPlaceholder: '请输入密码',
      showPassword: '显示',
      hidePassword: '隐藏',
      submitting: '验证中...',
      submitButton: '登录管理系统',
      fallbackError: '登录失败，请稍后重试',
    },
    sidebar: {
      moduleProducts: '产品展示',
      moduleAiAds: 'AI 轮播广告',
      moduleSwitchAria: '切换后台核心功能模块',
      productSeries: '产品系列',
      addSeries: '+ 新增系列',
      seriesNavAria: '产品系列导航',
      unnamedTheme: '未命名主题',
      skuUnit: 'SKU',
      adPlaylistTitle: '轮播清单',
      generateAdShort: '+ 生成广告',
      adPlaylistNavAria: '待机轮播广告清单',
      adStatusActive: '轮播中',
      adStatusPaused: '已暂停',
      adDurationSeconds: (seconds) => `${seconds}秒`,
      adNoCopyLabel: (seriesName) => `${seriesName} · 纯图海报`,
      adPlaylistEmpty: '暂无轮播广告，点击右上角即可基于产品信息生成。',
      currentShowcase: '当前展示柜',
      deviceListboxAria: '选择门店展示柜设备',
      selectShowcaseHeader: '选择切换展示柜',
      totalDevicesCount: (count) => `共 ${count} 台`,
      switchAction: '切换',
      collapseAction: '收起',
      manageBoundDevices: '管理已绑定设备',
      deviceCountUnit: (count) => `${count} 台`,
      adminPrefix: (username) => `管理员 · ${username}`,
      logout: '退出登录',
    },
    app: {
      loadingTitle: '正在加载门店展示柜数据',
      loadingSubtitle: '正在同步已绑定设备与产品配置...',
      loadErrorTitle: '设备数据加载失败',
      loadErrorFallback: '加载门店设备数据失败',
      retryButton: '重新加载',
      emptySeriesTitle: '当前设备暂无产品系列',
      emptySeriesSubtitle: '点击下方按钮为该展示柜创建首个产品系列。',
      addFirstSeriesButton: '新增产品系列',
    },
    series: {
      breadcrumbSeries: '产品系列',
      unsavedChanges: '有未保存更改',
      updatedAt: (timestamp) => `更新于 ${timestamp}`,
      previewButton: '前端效果预览',
      saveAndPublish: '保存并发布',
      publishedNotice: (deviceName) => `已发布至 ${deviceName}`,
      saveErrorFallback: '保存产品系列失败，请稍后重试',
      uploadErrorFallback: '图片上传失败，请重试',
      deleteErrorFallback: '删除产品系列失败',
      eyebrow: '产品系列内容配置',
      activeSkuRatio: (active, total) => `在售 SKU ${active} / ${total}`,
      enterSkuManagement: (count) => `进入系列产品 SKU 管理 (${count}) →`,
      visualSectionTitle: '系列主视觉图片',
      visualSectionHint:
        '支持上传 JPG / PNG / WebP 原图，上传后可点击“生成标准白底图”自动适配展示柜画幅。',
      visualDescription:
        '此图片将同步展示于 AI SHOWCASE 前端主展台及底部系列选择卡片。',
      changeImageButton: '更换系列图片',
      processWhiteBgButton: '生成标准白底图',
      processingWhiteBg: '白底处理中...',
      restoreOriginalImageButton: '恢复原图',
      whiteBgProcessedNotice: '已按展示柜比例生成标准白底图，保存后将同步至终端。',
      whiteBgMockNotice:
        '已按 3:4 白底画布居中规范化（当前为本地预览占位，接入外部 AI / 插件后将自动执行智能抠图）。',
      whiteBgErrorFallback: '白底图处理失败，请重试',
      removeImageButton: '移除图片',
      basicInfoTitle: '系列基础信息',
      nameLabel: '产品系列名称',
      namePlaceholder: '例如：CLUB / XO / VSOP',
      subtitleLabel: '系列副标题（英文定位）',
      subtitlePlaceholder: 'COGNAC FINE CHAMPAGNE',
      taglinePrimaryLabel: '顶部英文主题词',
      taglinePrimaryPlaceholder: 'MULTIFACETED',
      taglineSecondaryLabel: '顶部中文主题词',
      taglineSecondaryPlaceholder: '多面风范',
      descriptionLabel: '系列品鉴简介',
      descriptionPlaceholder: '输入展示于前端的系列故事与品鉴介绍...',
      tastingSectionTitle: '品鉴维度与产区参数',
      aromaFallbackLabel: '香气',
      palateFallbackLabel: '口感',
      finishFallbackLabel: '余韵',
      originLabel: '生命之水产区',
      originPlaceholder: '大香槟区 & 小香槟区',
      abvLabel: '标准酒精度',
      abvPlaceholder: '40% VOL.',
      deleteSeriesButton: '删除该产品系列',
      deleteConfirmPrompt: (name) => `确认删除“${name}”及其全部 SKU？`,
      deleteConfirmButton: '确认删除',
      previewModalAria: '前端展示效果实时预览',
      previewModalTitle: '前端展示效果实时预览',
      previewModalSubtitle: (name) =>
        `当前系列：${name} · 字体比例与三栏品鉴格与展示柜终端完全一致`,
      previewCardMode: '信息卡视图',
      previewStageMode: '瓶身联动视图',
      previewEscHint: '按 ESC 或点击空白处返回编辑界面',
      openFullPreview: '全屏预览整柜效果 →',
    },
    sku: {
      breadcrumbSeries: '产品系列',
      breadcrumbSkuManagement: 'SKU 商品管理',
      backToSeries: '返回系列信息',
      addSkuButton: '新增 SKU 商品',
      eyebrow: (seriesName) => `${seriesName} 系列产品清单`,
      pageTitle: 'SKU 商品管理',
      loadErrorFallback: 'SKU 商品数据加载失败，请重试',
      searchPlaceholder: '搜索商品名称、编码或陈列位...',
      searchAria: '搜索 SKU 商品',
      filterAll: (count) => `全部 ${count}`,
      filterActive: (count) => `展示中 ${count}`,
      filterInactive: (count) => `已下架 ${count}`,
      emptyTitle: '暂无符合条件的 SKU 商品',
      emptyNoSkusHint: (seriesName) =>
        `当前 ${seriesName} 系列尚未添加单品，点击下方按钮创建首个 SKU。`,
      emptyFilterHint: '请调整筛选条件或清空搜索关键词后重试。',
      resetFilter: '重置筛选',
      statusActive: '展示中',
      statusInactive: '已下架',
      shelfSlotPrefix: (slot) => `陈列位 ${slot}`,
      editProductLink: '编辑商品信息 →',
      emptyHighlightHint: '点击卡片补充该商品的展示卖点与详细说明。',
      specVolume: '容量规格',
      specAbv: '酒精度',
      specPrice: '建议零售价',
      specPackaging: '包装形式',
      toastCreated: '已新增 SKU 商品',
      toastUpdated: '商品信息已更新',
      toastDeleted: '已删除该 SKU 商品',
      uploadErrorFallback: '商品图片上传失败',
      draftDefaultName: (seriesName) => `人头马 ${seriesName} 优质香槟区干邑 700ml`,
      draftDefaultPackaging: '标准礼盒装',
      draftDefaultServing: '建议室温纯饮或加冰品鉴。',
      draftDefaultPricePrefix: '¥',
    },
    skuSheet: {
      ariaNew: '新增 SKU 商品',
      ariaEdit: (name) => `编辑 ${name}`,
      headerNew: (seriesName) => `${seriesName} 系列 · 新增商品 SKU`,
      headerEdit: (seriesName) => `${seriesName} 系列 · 编辑商品信息`,
      unnamedProduct: '未命名商品',
      fallbackName: (seriesName) => `人头马 ${seriesName} 新商品`,
      saveErrorFallback: '保存商品失败，请稍后重试',
      deleteErrorFallback: '删除商品失败，请稍后重试',
      uploadErrorFallback: '图片上传失败，请重试',
      productImageTitle: '商品展示图片',
      productImageHint:
        '用于 SKU 卡片及展示柜单品详情，上传商品原图后可一键生成标准白底图。',
      uploadNewImage: '上传新图片',
      processWhiteBgButton: '生成标准白底图',
      processingWhiteBg: '白底处理中...',
      restoreOriginalImageButton: '恢复原图',
      whiteBgMockNotice:
        '已按 3:4 白底画布居中规范化（本地占位，接入外部 AI / 插件后将自动智能抠图）。',
      whiteBgErrorFallback: '白底图处理失败，请重试',
      restoreDefaultImage: '恢复系列默认图',
      basicInfoTitle: '基础商品信息',
      primaryNameLabel: '商品中文名称',
      primaryNamePlaceholder: '例如：人头马 CLUB 优质香槟区干邑 700ml',
      secondaryNameLabel: '商品英文名称',
      secondaryNamePlaceholder: 'Rémy Martin CLUB Fine Champagne Cognac 700ml',
      skuCodeLabel: 'SKU 编码',
      skuCodePlaceholder: 'RM-CLUB-700',
      shelfSlotLabel: '展示柜陈列位编号',
      shelfSlotPlaceholder: 'C-01',
      specSectionTitle: '规格与价格参数',
      volumeLabel: '容量规格',
      volumePlaceholder: '700ml',
      abvLabel: '酒精度',
      abvPlaceholder: '40% VOL.',
      priceLabel: '建议零售价',
      pricePlaceholder: '¥628',
      packagingLabel: '包装形式',
      packagingPlaceholder: '标准礼盒装',
      sortOrderLabel: '展示排序序号',
      editorialSectionTitle: '展示文案与品鉴说明',
      highlightLabel: '一句话核心卖点',
      highlightPlaceholder: '例如：经典八角切面酒樽，专为现代多面品鉴家打造',
      descriptionLabel: '商品详细介绍',
      descriptionPlaceholder: '输入商品工艺、陈酿特点及风味描述...',
      servingLabel: '饮用与搭配建议',
      servingPlaceholder: '例如：建议室温纯饮、加冰或搭配精致餐食',
      deleteProduct: '删除商品',
      confirmDeletePrompt: '确认删除？',
      confirmDeleteAction: '删除',
      createProductButton: '创建商品',
      saveChangesButton: '保存更改',
    },
    device: {
      breadcrumbTitle: '门店已绑定设备管理',
      backToContent: '返回内容编辑',
      eyebrow: '预置绑定硬件终端',
      pageTitle: '已绑定展示柜设备',
      pageDescription:
        '硬件设备编号与实际物理屏幕系统预置绑定，不可手动新增或删除；您可在此维护每台展柜的备注名称、摆放位置，或在设备间一键复制发布内容。',
      onlineSummary: (online, total) => ({
        prefix: '在线 ',
        onlineCount: String(online),
        suffix: ` / 共 ${total} 台`,
      }),
      hardwareIdPrefix: (id) => `硬件编号 ${id}`,
      serialNumberPrefix: (sn) => `序列号 ${sn}`,
      currentEditingTag: '当前编辑设备',
      noLocationPlaceholder: '暂未填写摆放位置',
      editMetaButton: '修改名称与位置',
      cloneContentButton: '复制其他设备内容',
      editDeviceContentCta: '编辑此设备内容 →',
      publishedSeriesLabel: (names) => `已发布系列：${names}`,
      publishedSeriesEmpty: '暂无',
      seriesSkuSummary: (seriesCount, skuCount) =>
        `共 ${seriesCount} 个系列 · ${skuCount} 款 SKU`,
      lastSyncedLabel: (timestamp) => `最近同步：${timestamp}`,
      hardwareIdReadonlyLabel: '硬件设备编号（出厂只读）',
      serialNumberReadonlyLabel: '屏幕硬件序列号（出厂只读）',
      displayNameLabel: '展示柜备注名称',
      displayNamePlaceholder: '例如：一楼主入口展示柜',
      locationLabel: '门店摆放位置',
      locationPlaceholder: '例如：上海静安旗舰店 · 1F 主入口',
      saveDeviceMeta: '保存设备信息',
      cloneTitle: '从其他已绑定设备复制展示内容',
      cloneWarning: (deviceName) =>
        `将完整覆盖当前设备（${deviceName}）的产品系列与 SKU 配置，硬件编号保持不变。`,
      cloneSelectAria: '选择源展示柜设备',
      cloneOptionLabel: (name, id, seriesCount) =>
        `${name}（${id} · ${seriesCount} 个系列）`,
      cloningButton: '同步复制中...',
      confirmCloneButton: '确认覆盖复制',
      metaUpdatedNotice: (name) => `已更新设备“${name}”的信息`,
      metaUpdateErrorFallback: '更新设备信息失败',
      clonedNotice: (name) =>
        `已将选定设备的系列与 SKU 内容同步复制至“${name}”`,
      cloneErrorFallback: '复制设备内容失败',
    },
    createSeries: {
      ariaLabel: '新增产品系列',
      title: '新增产品系列',
      nameLabel: '系列名称',
      namePlaceholder: '例如：LOUIS XIII / TERCET',
      taglinePrimaryLabel: '英文主题词',
      taglinePrimaryPlaceholder: 'TIMELESS',
      taglineSecondaryLabel: '中文主题词',
      taglineSecondaryPlaceholder: '百年传奇',
      nameRequiredError: '请输入产品系列名称',
      createErrorFallback: '创建产品系列失败，请稍后重试',
      creatingButton: '创建中...',
      createButton: '创建系列',
    },
    preview: {
      emptySeriesImage: '暂无系列图片',
      fallbackTaglinePrimary: 'COLLECTION',
      fallbackTaglineSecondary: '系列风范',
      fallbackDescription: '请输入产品系列前端展示文案。',
      fallbackOrigin: '大香槟区 & 小香槟区',
      fullPreviewAria: 'AI SHOWCASE 展示柜全屏预览',
      livePreviewLabel: 'AI SHOWCASE 实时预览',
      backToCmsButton: '返回 CMS 后台',
      emptyMainImage: '暂无主图',
      seriesFormatsLabel: '系列规格',
      seriesOverviewButton: '系列概览',
      selectSeriesTitle: '选择系列',
    },
    aiAds: {
      breadcrumbTitle: 'AI 轮播广告',
      standbyPreviewButton: '待机轮播预览',
      saveAndPublish: '保存并发布',
      eyebrow: '无人交互待机轮播管理',
      pageTitle: 'AI 轮播广告',
      pageSubtitle:
        '基于当前展示柜已配置的产品系列与单品信息生成待机轮播画面；当门店屏幕无人交互达到设定时长后，将按清单顺序自动轮播。',
      autoRotateLabel: '无人交互自动轮播',
      autoRotateOn: '已开启',
      autoRotateOff: '已关闭',
      idleTimeoutLabel: '待机触发时长',
      idleTimeoutOption: (seconds) => `无人操作 ${seconds} 秒后`,
      activeAdsSummary: (active, total) => `启用轮播 ${active} / ${total} 条`,
      sectionGenerateTitle: 'AI 广告生成工作台',
      sectionEditorTitle: '当前轮播广告详情与编排',
      sectionHistoryTitle: '历史生成图片查看区',
      targetSeriesLabel: '关联产品系列',
      targetSkuLabel: '关联单品 SKU（可选）',
      allSeriesHeroOption: '整系列主推（使用系列主图与文案）',
      visualStyleLabel: '画面视觉风格',
      visualStyles: {
        'luxury-studio': '高奢静物',
        'nocturne-lounge': '暗调酒廊',
        'festive-gifting': '节庆礼赠',
        'modern-french': '现代法式',
      },
      copyModeLabel: '海报文案配置',
      copyModeWithCopy: '有文案',
      copyModeNoCopy: '无文案（纯图海报）',
      copyModeNoCopyHint:
        '选择无文案后，将自动生成不含任何叠加文字的纯产品视觉海报。',
      copyFieldsHint:
        '主题标题、副标题与底部小字均为选填，可按需只保留标题或自由组合。',
      autoFillCopyButton: '填入产品推荐文案',
      genTitleLabel: '主题标题（可选）',
      genTitlePlaceholder: '例如：人头马 XO · 璀璨典范（留空则不显示或由系统默认）',
      genSubtitleLabel: '副标题（可选）',
      genSubtitlePlaceholder: '例如：历经岁月陈酿，演绎多层次非凡馥郁',
      genCtaLabel: '底部小字 / 交互引导语（可选）',
      genCtaPlaceholder: '例如：轻触屏幕 · 探索系列风味',
      promptBriefLabel: '画面创意补充（可选）',
      promptBriefPlaceholder:
        '例如：突出春节礼赠氛围、强调八角酒樽质感或光影细节...',
      generateButton: '根据产品信息生成 AI 广告',
      generatingButton: 'AI 生成中...',
      generateMockNotice:
        '当前为本地预览占位生成（后续通过 Codex 对接外部 AI 生图模型即可替换真实生成画面）。',
      generateSuccessNotice: '已生成海报，请确认是否保存到当前轮播。',
      generateErrorFallback: '生成 AI 广告失败，请稍后重试',
      generatedModalTitle: 'AI 海报已生成',
      generatedModalSubtitle:
        '预览生成效果，确认是否立即保存到当前待机轮播；暂不保存的图片也将自动保留在历史生成记录中。',
      historyModalTitle: '历史生成海报详情',
      historyModalSubtitle:
        '查看近期生成的海报原图与参数，可随时将其加入当前展示柜待机轮播。',
      saveToCarouselButton: '保存到当前轮播',
      savingToCarouselButton: '正在加入轮播...',
      keepInHistoryOnlyButton: '暂不加入轮播（保留至历史）',
      keptInHistoryNotice: '已保留至下方历史生成记录，可随时重新加入轮播。',
      savedToCarouselNotice: '已保存并加入当前待机轮播清单。',
      settingsSavedNotice: '待机轮播触发设置已更新',
      adSavedNotice: (deviceName) => `轮播广告已同步至 ${deviceName}`,
      saveErrorFallback: '保存轮播广告失败，请稍后重试',
      deleteErrorFallback: '删除轮播广告失败',
      lockedStyleLabel: '视觉风格',
      copyModeMetaLabel: '文案模式',
      lockedAfterGenerateHint: '海报生成后视觉风格已锁定；如需更换风格请重新生成。',
      noCopyReadonlyNotice:
        '该广告为“无文案纯图海报”，画面不叠加任何文字；如需调整风格或改为有文案海报，请在上方工作台重新生成。',
      adHeadlineLabel: '主题标题（可选）',
      adHeadlinePlaceholder: '输入待机画面主题标题，留空则不显示...',
      adSubtitleLabel: '副标题（可选）',
      adSubtitlePlaceholder: '输入副标题或品鉴卖点，留空则不显示...',
      adCtaLabel: '底部小字 / 引导语（可选）',
      adCtaPlaceholder: '例如：轻触屏幕 · 探索系列风味（留空则不显示）',
      adDurationLabel: '单张轮播停留时长',
      adDurationOption: (seconds) => `${seconds} 秒`,
      adStatusLabel: '轮播播放状态',
      statusActive: '启用轮播',
      statusPaused: '暂不播放',
      moveUpButton: '上移一位',
      moveDownButton: '下移一位',
      deleteAdButton: '移出当前轮播',
      deleteConfirmPrompt: '确认将该海报从当前轮播中移除？',
      deleteConfirmAction: '确认移除',
      emptyEditorTitle: '尚未选择轮播广告',
      emptyEditorSubtitle:
        '请从左侧清单选择一条广告，或在上方生成工作台创建并保存新的 AI 轮播海报。',
      historyRetentionHint: (days) => `系统自动保留最近 ${days} 天内的生成图片记录`,
      historySummaryLine: (total, unsaved) =>
        `共 ${total} 张生成记录 · ${unsaved} 张未加入轮播`,
      historyExpandButton: '展开历史记录',
      historyCollapseButton: '收起历史记录',
      historyGroupByLabel: '分组方式',
      historyGroupByDate: '按日期',
      historyGroupByProduct: '按产品系列',
      historyFilterAll: (count) => `全部 ${count}`,
      historyFilterUnsaved: (count) => `未加入轮播 ${count}`,
      historyFilterSaved: (count) => `已加入轮播 ${count}`,
      historyExpandAllGroups: '全部展开',
      historyCollapseAllGroups: '全部收起',
      historyGroupCount: (count) => `${count} 张`,
      historyGroupExpand: '展开',
      historyGroupCollapse: '收起',
      historyDateToday: '今天',
      historyDateYesterday: '昨天',
      historyFilteredEmptyTitle: '当前筛选条件下暂无历史记录',
      historyResetFilterButton: '查看全部历史',
      historyDeleteShort: '删除',
      historyEmptyTitle: '暂无近期生成记录',
      historyEmptySubtitle:
        '每次通过 AI 广告生成工作台生成的海报都会自动归档于此，无论是否立即加入轮播。',
      historySavedTag: '已加入轮播',
      historyUnsavedTag: '未加入轮播',
      historyPreviewButton: '查看大图',
      historyAddToCarouselButton: '加入轮播',
      historyViewInCarouselButton: '查看轮播项',
      historyDeleteButton: '删除记录',
      historyCreatedLabel: '生成时间',
      historyExpiresLabel: '自动保留至',
      historyProductLabel: '关联产品',
      historyDeleteErrorFallback: '删除历史记录失败，请重试',
      previewPosterTag: 'STANDBY VISUAL PREVIEW',
      fullscreenHeaderLabel: 'AI SHOWCASE 待机轮播实时预览',
      fullscreenSlideCounter: (current, total) => `第 ${current} / ${total} 条`,
      fullscreenExitButton: '退出预览',
      fullscreenIdleNotice: (seconds) =>
        `无人交互 ${seconds} 秒自动进入 · 按 ESC 或点击右上角退出`,
      fullscreenNoActiveAds:
        '当前展示柜没有处于“启用轮播”状态的广告，请先至少启用一条广告。',
    },
    errors: {
      INVALID_CREDENTIALS: '用户名或密码不正确，请重新输入',
      DEVICE_NOT_FOUND: '未找到对应的已绑定展示柜设备',
      VALIDATION_ERROR: '请检查必填项是否填写完整',
      INVALID_CLONE_TARGET: '源设备与目标设备不能相同',
      SERIES_NOT_FOUND: '未找到指定的产品系列',
      LAST_SERIES_PROTECTED: '每台展示柜至少需要保留一个产品系列',
      SKU_NOT_FOUND: '未找到指定的 SKU 商品',
      AD_NOT_FOUND: '未找到指定的轮播广告',
      INVALID_MEDIA_TYPE: '仅支持上传图片格式文件',
      MEDIA_READ_ERROR: '图片读取失败，请重新选择',
      MEDIA_REQUIRED: '请先上传商品图片后再执行白底图处理',
      MEDIA_PROCESS_ERROR: '白底图处理失败，请重试',
      MISSING_API_BASE_URL: '未配置 VITE_API_BASE_URL 环境变量，无法连接后端服务',
      REQUEST_TIMEOUT: '请求超时，请检查后端服务状态',
      NETWORK_ERROR: '网络连接异常，请稍后重试',
    },
  },

  en: {
    meta: {
      pageTitle: 'Rémy Martin AI SHOWCASE CMS',
      defaultStoreName: "Shanghai Jing'an Flagship",
    },
    language: {
      buttonPrefix: 'Language',
      currentName: 'English',
      menuHeader: 'Select Interface Language',
      activeTag: 'Active',
      options: {
        zh: 'Simplified Chinese',
        en: 'English',
      },
    },
    common: {
      close: 'Close',
      cancel: 'Cancel',
      dismiss: 'Dismiss',
      online: 'Online',
      offline: 'Offline',
      current: 'Current',
      saving: 'Saving...',
      deleting: 'Deleting...',
      uploading: 'Uploading...',
      notUploaded: 'No Image',
      noImage: 'No Image',
    },
    login: {
      subtitle: 'SHOWCASE CONTENT MANAGEMENT SYSTEM',
      usernameLabel: 'Username',
      usernamePlaceholder: 'Enter username',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter password',
      showPassword: 'Show',
      hidePassword: 'Hide',
      submitting: 'Verifying...',
      submitButton: 'Sign In to CMS',
      fallbackError: 'Sign in failed. Please try again.',
    },
    sidebar: {
      moduleProducts: 'Collections',
      moduleAiAds: 'AI Ads',
      moduleSwitchAria: 'Switch primary CMS workspace module',
      productSeries: 'Series',
      addSeries: '+ New',
      seriesNavAria: 'Product series navigation',
      unnamedTheme: 'Untitled Collection',
      skuUnit: 'SKUs',
      adPlaylistTitle: 'Ad Playlist',
      generateAdShort: '+ Generate',
      adPlaylistNavAria: 'Standby ad carousel playlist',
      adStatusActive: 'Active',
      adStatusPaused: 'Paused',
      adDurationSeconds: (seconds) => `${seconds}s`,
      adNoCopyLabel: (seriesName) => `${seriesName} · Visual Poster`,
      adPlaylistEmpty: 'No standby ads yet. Generate one from your product catalog.',
      currentShowcase: 'Showcase',
      deviceListboxAria: 'Select store showcase terminal',
      selectShowcaseHeader: 'Switch Showcase Terminal',
      totalDevicesCount: (count) => `${count} Total`,
      switchAction: 'Switch',
      collapseAction: 'Hide',
      manageBoundDevices: 'Bound Devices',
      deviceCountUnit: (count) => `${count} Units`,
      adminPrefix: (username) => `Admin · ${username}`,
      logout: 'Sign Out',
    },
    app: {
      loadingTitle: 'Loading Showcase Data',
      loadingSubtitle: 'Syncing bound store terminals and collections...',
      loadErrorTitle: 'Failed to Load Terminals',
      loadErrorFallback: 'Unable to load store showcase terminals.',
      retryButton: 'Retry',
      emptySeriesTitle: 'No Product Series Yet',
      emptySeriesSubtitle:
        'Create the first product series for this showcase terminal.',
      addFirstSeriesButton: 'Create Product Series',
    },
    series: {
      breadcrumbSeries: 'Collections',
      unsavedChanges: 'Unsaved changes',
      updatedAt: (timestamp) => `Updated ${timestamp}`,
      previewButton: 'Live Preview',
      saveAndPublish: 'Save & Publish',
      publishedNotice: (deviceName) => `Published to ${deviceName}`,
      saveErrorFallback: 'Failed to save product series. Please try again.',
      uploadErrorFallback: 'Image upload failed. Please try again.',
      deleteErrorFallback: 'Failed to delete product series.',
      eyebrow: 'COLLECTION CONTENT CONFIGURATION',
      activeSkuRatio: (active, total) => `Active SKUs ${active} / ${total}`,
      enterSkuManagement: (count) => `Manage Series SKUs (${count}) →`,
      visualSectionTitle: 'Collection Hero Visual',
      visualSectionHint:
        'Supports JPG, PNG, or WebP uploads — standardize to a showcase white backdrop in one click.',
      visualDescription:
        'This visual syncs directly to the AI SHOWCASE main stage and bottom collection selector cards.',
      changeImageButton: 'Replace Image',
      processWhiteBgButton: 'Generate White Backdrop',
      processingWhiteBg: 'Processing...',
      restoreOriginalImageButton: 'Restore Original',
      whiteBgProcessedNotice:
        'Standardized white-background image generated. Save & Publish to sync.',
      whiteBgMockNotice:
        'Framed on a 3:4 pure white canvas (local placeholder; connect your AI/plugin via mediaService.processWhiteBackground).',
      whiteBgErrorFallback: 'Failed to process white background. Please try again.',
      removeImageButton: 'Remove Image',
      basicInfoTitle: 'Collection Identity',
      nameLabel: 'Series Name',
      namePlaceholder: 'e.g. CLUB / XO / VSOP',
      subtitleLabel: 'Collection Subtitle',
      subtitlePlaceholder: 'COGNAC FINE CHAMPAGNE',
      taglinePrimaryLabel: 'Primary Tagline',
      taglinePrimaryPlaceholder: 'MULTIFACETED',
      taglineSecondaryLabel: 'Collection Descriptor',
      taglineSecondaryPlaceholder: 'MODERN EDGE',
      descriptionLabel: 'Tasting Narrative',
      descriptionPlaceholder:
        'Enter the collection story and tasting narrative displayed on the showcase...',
      tastingSectionTitle: 'Tasting Profile & Terroir Specifications',
      aromaFallbackLabel: 'Aroma',
      palateFallbackLabel: 'Palate',
      finishFallbackLabel: 'Finish',
      originLabel: 'Eaux-de-Vie Origin',
      originPlaceholder: 'Grande & Petite Champagne',
      abvLabel: 'Alcohol By Volume',
      abvPlaceholder: '40% VOL.',
      deleteSeriesButton: 'Delete This Series',
      deleteConfirmPrompt: (name) =>
        `Delete "${name}" and all associated SKUs?`,
      deleteConfirmButton: 'Confirm Delete',
      previewModalAria: 'Live showcase preview',
      previewModalTitle: 'Live Showcase Preview',
      previewModalSubtitle: (name) =>
        `Series: ${name} · Exact terminal typography and 3-column tasting layout`,
      previewCardMode: 'Info Card View',
      previewStageMode: 'Bottle Stage View',
      previewEscHint: 'Press ESC or click outside to return to editor',
      openFullPreview: 'Open Full Cabinet Preview →',
    },
    sku: {
      breadcrumbSeries: 'Collections',
      breadcrumbSkuManagement: 'SKU Management',
      backToSeries: 'Back to Series',
      addSkuButton: 'Add New SKU',
      eyebrow: (seriesName) => `${seriesName} COLLECTION CATALOG`,
      pageTitle: 'SKU Management',
      loadErrorFallback: 'Failed to load SKU data. Please try again.',
      searchPlaceholder: 'Search SKU name, code, or slot...',
      searchAria: 'Search SKUs',
      filterAll: (count) => `All ${count}`,
      filterActive: (count) => `Live ${count}`,
      filterInactive: (count) => `Hidden ${count}`,
      emptyTitle: 'No Matching SKUs Found',
      emptyNoSkusHint: (seriesName) =>
        `No SKUs added to the ${seriesName} collection yet. Create the first item below.`,
      emptyFilterHint: 'Adjust your status filter or clear the search query.',
      resetFilter: 'Reset Filters',
      statusActive: 'Live',
      statusInactive: 'Hidden',
      shelfSlotPrefix: (slot) => `Slot ${slot}`,
      editProductLink: 'Edit Details →',
      emptyHighlightHint:
        'Click this card to add key highlights and product storytelling.',
      specVolume: 'Volume',
      specAbv: 'ABV',
      specPrice: 'Retail Price',
      specPackaging: 'Packaging',
      toastCreated: 'SKU created',
      toastUpdated: 'SKU updated',
      toastDeleted: 'SKU deleted',
      uploadErrorFallback: 'Failed to upload product image.',
      draftDefaultName: (seriesName) =>
        `Rémy Martin ${seriesName} Fine Champagne Cognac 700ml`,
      draftDefaultPackaging: 'Signature Gift Box',
      draftDefaultServing: 'Serve neat at room temperature or over a large crystal ice sphere.',
      draftDefaultPricePrefix: '$',
    },
    skuSheet: {
      ariaNew: 'Add new SKU',
      ariaEdit: (name) => `Edit ${name}`,
      headerNew: (seriesName) => `${seriesName} SERIES · NEW SKU`,
      headerEdit: (seriesName) => `${seriesName} SERIES · EDIT SKU`,
      unnamedProduct: 'Untitled Product',
      fallbackName: (seriesName) => `Rémy Martin ${seriesName} Edition`,
      saveErrorFallback: 'Failed to save product. Please try again.',
      deleteErrorFallback: 'Failed to delete product. Please try again.',
      uploadErrorFallback: 'Image upload failed. Please try again.',
      productImageTitle: 'Product Studio Image',
      productImageHint:
        'Displayed on SKU cards and showcase detail views. Upload any bottle photo and standardize to a white backdrop in one click.',
      uploadNewImage: 'Upload Image',
      processWhiteBgButton: 'White Backdrop',
      processingWhiteBg: 'Processing...',
      restoreOriginalImageButton: 'Restore Original',
      whiteBgMockNotice:
        'Framed on a 3:4 white canvas (local placeholder; external AI/plugin connects via mediaService).',
      whiteBgErrorFallback: 'Failed to process white background. Please try again.',
      restoreDefaultImage: 'Use Series Default',
      basicInfoTitle: 'Core Product Details',
      primaryNameLabel: 'Product Display Name',
      primaryNamePlaceholder: 'e.g. Rémy Martin CLUB Fine Champagne Cognac 700ml',
      secondaryNameLabel: 'Edition / Sub-Title',
      secondaryNamePlaceholder: 'Signature Octagonal Decanter · 700ml',
      skuCodeLabel: 'SKU Code',
      skuCodePlaceholder: 'RM-CLUB-700',
      shelfSlotLabel: 'Showcase Shelf Slot',
      shelfSlotPlaceholder: 'C-01',
      specSectionTitle: 'Specifications & Pricing',
      volumeLabel: 'Volume',
      volumePlaceholder: '700ml',
      abvLabel: 'ABV',
      abvPlaceholder: '40% VOL.',
      priceLabel: 'Retail Price',
      pricePlaceholder: '$88',
      packagingLabel: 'Packaging',
      packagingPlaceholder: 'Signature Gift Box',
      sortOrderLabel: 'Display Sort Order',
      editorialSectionTitle: 'Storytelling & Serving Notes',
      highlightLabel: 'Key Selling Highlight',
      highlightPlaceholder:
        'e.g. Iconic faceted octagonal decanter crafted for modern connoisseurs',
      descriptionLabel: 'Product Description',
      descriptionPlaceholder:
        'Describe craftsmanship, oak maturation, and aromatic profile...',
      servingLabel: 'Serving & Pairing Ritual',
      servingPlaceholder:
        'e.g. Enjoy neat, over ice, or paired with fine gastronomy',
      deleteProduct: 'Delete SKU',
      confirmDeletePrompt: 'Confirm deletion?',
      confirmDeleteAction: 'Delete',
      createProductButton: 'Create SKU',
      saveChangesButton: 'Save Changes',
    },
    device: {
      breadcrumbTitle: 'Bound Store Terminals',
      backToContent: 'Back to Editor',
      eyebrow: 'PRE-ASSIGNED SHOWCASE TERMINALS',
      pageTitle: 'Bound Showcase Devices',
      pageDescription:
        'Hardware device IDs are factory-bound to physical display terminals and cannot be added or deleted here. Maintain display names, store locations, or clone published content across terminals.',
      onlineSummary: (online, total) => ({
        prefix: 'Online ',
        onlineCount: String(online),
        suffix: ` / ${total} Units`,
      }),
      hardwareIdPrefix: (id) => `Hardware ID ${id}`,
      serialNumberPrefix: (sn) => `S/N ${sn}`,
      currentEditingTag: 'Active Terminal',
      noLocationPlaceholder: 'No store location specified',
      editMetaButton: 'Edit Info',
      cloneContentButton: 'Clone Content',
      editDeviceContentCta: 'Edit Content →',
      publishedSeriesLabel: (names) => `Published Series: ${names}`,
      publishedSeriesEmpty: 'None',
      seriesSkuSummary: (seriesCount, skuCount) =>
        `${seriesCount} Series · ${skuCount} SKUs`,
      lastSyncedLabel: (timestamp) => `Last Synced: ${timestamp}`,
      hardwareIdReadonlyLabel: 'Hardware Device ID (Read-Only)',
      serialNumberReadonlyLabel: 'Display Serial Number (Read-Only)',
      displayNameLabel: 'Showcase Display Name',
      displayNamePlaceholder: 'e.g. 1F Main Entrance Showcase',
      locationLabel: 'Store Placement Location',
      locationPlaceholder: "e.g. Shanghai Jing'an Flagship · 1F Main Atrium",
      saveDeviceMeta: 'Save Terminal Info',
      cloneTitle: 'Clone Published Content from Another Terminal',
      cloneWarning: (deviceName) =>
        `This will replace all series and SKUs on "${deviceName}" while preserving its hardware ID.`,
      cloneSelectAria: 'Select source showcase terminal',
      cloneOptionLabel: (name, id, seriesCount) =>
        `${name} (${id} · ${seriesCount} Series)`,
      cloningButton: 'Syncing...',
      confirmCloneButton: 'Confirm Overwrite & Clone',
      metaUpdatedNotice: (name) => `Updated terminal "${name}"`,
      metaUpdateErrorFallback: 'Failed to update terminal details.',
      clonedNotice: (name) =>
        `Synced selected terminal collections & SKUs to "${name}"`,
      cloneErrorFallback: 'Failed to clone terminal content.',
    },
    createSeries: {
      ariaLabel: 'Create new product series',
      title: 'New Product Series',
      nameLabel: 'Series Name',
      namePlaceholder: 'e.g. LOUIS XIII / TERCET',
      taglinePrimaryLabel: 'Primary Tagline',
      taglinePrimaryPlaceholder: 'TIMELESS',
      taglineSecondaryLabel: 'Collection Descriptor',
      taglineSecondaryPlaceholder: 'CENTURY LEGACY',
      nameRequiredError: 'Please enter a product series name.',
      createErrorFallback: 'Failed to create product series. Please try again.',
      creatingButton: 'Creating...',
      createButton: 'Create Series',
    },
    preview: {
      emptySeriesImage: 'No Series Visual',
      fallbackTaglinePrimary: 'COLLECTION',
      fallbackTaglineSecondary: 'SIGNATURE RESERVE',
      fallbackDescription: 'Enter the collection tasting narrative to preview here.',
      fallbackOrigin: 'Grande & Petite Champagne',
      fullPreviewAria: 'AI SHOWCASE full-screen cabinet preview',
      livePreviewLabel: 'AI SHOWCASE LIVE PREVIEW',
      backToCmsButton: 'Back to CMS',
      emptyMainImage: 'No Main Image',
      seriesFormatsLabel: 'Formats',
      seriesOverviewButton: 'Series Overview',
      selectSeriesTitle: 'SELECT COLLECTION',
    },
    aiAds: {
      breadcrumbTitle: 'AI Ad Carousel',
      standbyPreviewButton: 'Standby Preview',
      saveAndPublish: 'Save & Publish',
      eyebrow: 'IDLE-SCREEN CAROUSEL STUDIO',
      pageTitle: 'AI Standby Ad Carousel',
      pageSubtitle:
        'Generate luxury standby campaign visuals directly from this showcase’s product collections and SKUs. Slides rotate automatically whenever the screen is idle.',
      autoRotateLabel: 'Idle Auto-Rotation',
      autoRotateOn: 'Enabled',
      autoRotateOff: 'Disabled',
      idleTimeoutLabel: 'Trigger After Idle',
      idleTimeoutOption: (seconds) => `After ${seconds}s idle`,
      activeAdsSummary: (active, total) => `${active} / ${total} Active Slides`,
      sectionGenerateTitle: 'AI Campaign Generator',
      sectionEditorTitle: 'Selected Slide Creative & Playback',
      sectionHistoryTitle: 'Recent Generation History',
      targetSeriesLabel: 'Source Product Series',
      targetSkuLabel: 'Featured SKU (Optional)',
      allSeriesHeroOption: 'Entire Collection Hero (Series visual & copy)',
      visualStyleLabel: 'Visual Atmosphere',
      visualStyles: {
        'luxury-studio': 'Luxury Studio',
        'nocturne-lounge': 'Nocturne Lounge',
        'festive-gifting': 'Festive Gifting',
        'modern-french': 'Modern French',
      },
      copyModeLabel: 'Poster Copy Mode',
      copyModeWithCopy: 'With Copy',
      copyModeNoCopy: 'No Copy (Visual Only)',
      copyModeNoCopyHint:
        'Generates a pure product-focused visual poster with zero overlaid typography.',
      copyFieldsHint:
        'Headline, subheadline, and small caption are all optional — keep only a title or any combination you prefer.',
      autoFillCopyButton: 'Fill Suggested Product Copy',
      genTitleLabel: 'Theme Headline (Optional)',
      genTitlePlaceholder: 'e.g. Rémy Martin XO · Opulence',
      genSubtitleLabel: 'Subheadline (Optional)',
      genSubtitlePlaceholder: 'e.g. Aged up to 37 years for extraordinary aromatic complexity',
      genCtaLabel: 'Small Caption / Touch Prompt (Optional)',
      genCtaPlaceholder: 'e.g. Touch screen · Explore the collection',
      promptBriefLabel: 'Visual Creative Direction (Optional)',
      promptBriefPlaceholder:
        'e.g. Highlight holiday gifting, emphasize the octagonal decanter, or warm amber lighting...',
      generateButton: 'Generate AI Ad from Product Data',
      generatingButton: 'Generating...',
      generateMockNotice:
        'Local preview placeholder generated (connect your external AI creative model via adService.generateAdDraft).',
      generateSuccessNotice: 'Poster generated. Choose whether to save it to the live carousel.',
      generateErrorFallback: 'Failed to generate AI ad. Please try again.',
      generatedModalTitle: 'AI Poster Generated',
      generatedModalSubtitle:
        'Review the generated creative and decide whether to publish it to the active standby carousel. Unsaved posters remain in recent history.',
      historyModalTitle: 'Generated Poster Details',
      historyModalSubtitle:
        'Inspect a recently generated poster and promote it into the active standby carousel at any time.',
      saveToCarouselButton: 'Save to Active Carousel',
      savingToCarouselButton: 'Adding to Carousel...',
      keepInHistoryOnlyButton: 'Keep in History Only',
      keptInHistoryNotice: 'Saved to recent generation history below without altering the active carousel.',
      savedToCarouselNotice: 'Added to the active standby carousel playlist.',
      settingsSavedNotice: 'Standby rotation settings updated',
      adSavedNotice: (deviceName) => `Carousel ads published to ${deviceName}`,
      saveErrorFallback: 'Failed to save carousel slide. Please try again.',
      deleteErrorFallback: 'Failed to remove carousel slide.',
      lockedStyleLabel: 'Visual Style',
      copyModeMetaLabel: 'Copy Mode',
      lockedAfterGenerateHint:
        'Visual style is locked after poster generation. Generate a new poster above to use another style.',
      noCopyReadonlyNotice:
        'This slide is a visual-only poster with no overlaid copy. Generate a new creative above if you want to switch style or add text.',
      adHeadlineLabel: 'Theme Headline (Optional)',
      adHeadlinePlaceholder: 'Enter theme headline or leave blank to omit...',
      adSubtitleLabel: 'Subheadline (Optional)',
      adSubtitlePlaceholder: 'Enter subheadline or leave blank to omit...',
      adCtaLabel: 'Small Caption / Touch Prompt (Optional)',
      adCtaPlaceholder: 'e.g. Touch screen to explore (leave blank to omit)',
      adDurationLabel: 'Slide Display Duration',
      adDurationOption: (seconds) => `${seconds} seconds`,
      adStatusLabel: 'Rotation Status',
      statusActive: 'Active',
      statusPaused: 'Paused',
      moveUpButton: 'Move Up',
      moveDownButton: 'Move Down',
      deleteAdButton: 'Remove from Carousel',
      deleteConfirmPrompt: 'Remove this poster from the active carousel?',
      deleteConfirmAction: 'Confirm Remove',
      emptyEditorTitle: 'No Carousel Slide Selected',
      emptyEditorSubtitle:
        'Select a slide from the left playlist or generate and save a new AI standby poster above.',
      historyRetentionHint: (days) => `Automatically retained for the last ${days} days`,
      historySummaryLine: (total, unsaved) =>
        `${total} Generated ${total === 1 ? 'Poster' : 'Posters'} · ${unsaved} History Only`,
      historyExpandButton: 'Expand History',
      historyCollapseButton: 'Collapse',
      historyGroupByLabel: 'Group By',
      historyGroupByDate: 'By Date',
      historyGroupByProduct: 'By Product',
      historyFilterAll: (count) => `All ${count}`,
      historyFilterUnsaved: (count) => `History Only ${count}`,
      historyFilterSaved: (count) => `In Carousel ${count}`,
      historyExpandAllGroups: 'Expand All',
      historyCollapseAllGroups: 'Collapse All',
      historyGroupCount: (count) => `${count} ${count === 1 ? 'poster' : 'posters'}`,
      historyGroupExpand: 'Expand',
      historyGroupCollapse: 'Collapse',
      historyDateToday: 'Today',
      historyDateYesterday: 'Yesterday',
      historyFilteredEmptyTitle: 'No matching posters under this filter',
      historyResetFilterButton: 'Show All History',
      historyDeleteShort: 'Delete',
      historyEmptyTitle: 'No Recent Generation History',
      historyEmptySubtitle:
        'Every poster generated in the studio above is archived here automatically, whether saved to the carousel or not.',
      historySavedTag: 'In Carousel',
      historyUnsavedTag: 'History Only',
      historyPreviewButton: 'Inspect Poster',
      historyAddToCarouselButton: 'Add to Carousel',
      historyViewInCarouselButton: 'View in Carousel',
      historyDeleteButton: 'Delete Record',
      historyCreatedLabel: 'Generated',
      historyExpiresLabel: 'Retained Until',
      historyProductLabel: 'Source Product',
      historyDeleteErrorFallback: 'Failed to delete history record. Please try again.',
      previewPosterTag: 'STANDBY VISUAL PREVIEW',
      fullscreenHeaderLabel: 'AI SHOWCASE STANDBY CAROUSEL PREVIEW',
      fullscreenSlideCounter: (current, total) => `Slide ${current} / ${total}`,
      fullscreenExitButton: 'Exit Preview',
      fullscreenIdleNotice: (seconds) =>
        `Starts after ${seconds}s idle · Press ESC or click Exit Preview`,
      fullscreenNoActiveAds:
        'No active carousel slides on this terminal. Enable at least one slide first.',
    },
    errors: {
      INVALID_CREDENTIALS: 'Incorrect username or password. Please try again.',
      DEVICE_NOT_FOUND: 'Bound showcase terminal not found.',
      VALIDATION_ERROR: 'Please complete all required fields.',
      INVALID_CLONE_TARGET: 'Source and target terminals cannot be the same.',
      SERIES_NOT_FOUND: 'Product series not found.',
      LAST_SERIES_PROTECTED: 'Each showcase must keep at least one product series.',
      SKU_NOT_FOUND: 'SKU item not found.',
      AD_NOT_FOUND: 'Standby carousel slide not found.',
      INVALID_MEDIA_TYPE: 'Only image files are supported for upload.',
      MEDIA_READ_ERROR: 'Failed to read image file. Please try again.',
      MEDIA_REQUIRED: 'Please upload a product image before generating a white backdrop.',
      MEDIA_PROCESS_ERROR: 'Failed to process white background. Please try again.',
      MISSING_API_BASE_URL: 'VITE_API_BASE_URL is not configured.',
      REQUEST_TIMEOUT: 'Request timed out. Please check backend connectivity.',
      NETWORK_ERROR: 'Network connection error. Please try again.',
    },
  },
};
