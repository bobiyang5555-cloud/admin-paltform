import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Edit,
  Eye,
  Image as ImageIcon,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Smartphone,
  Trash2,
  Users,
  X,
} from 'lucide-react';

const roleConfig = {
  super_admin: { label: '超级管理员', canManageUsers: true, canEditConfigs: true, canEditAdmins: true },
  admin: { label: '管理员', canManageUsers: true, canEditConfigs: true, canEditAdmins: false },
  operator: { label: '运营员', canManageUsers: false, canEditConfigs: true, canEditAdmins: false },
  viewer: { label: '普通用户', canManageUsers: false, canEditConfigs: false, canEditAdmins: false },
};

const languages = [
  { code: 'en', name: '英语', label: 'EN' },
  { code: 'jp', name: '日语', label: 'JP' },
  { code: 'fr', name: '法语', label: 'FR' },
  { code: 'de', name: '德语', label: 'DE' },
  { code: 'es', name: '西语', label: 'ES' },
  { code: 'it', name: '意语', label: 'IT' },
  { code: 'ru', name: '俄语', label: 'RU' },
];

const appPageOptions = [
  { label: '默认首页 (app_home)', value: 'app_home' },
  { label: '相机页 (app_camera)', value: 'app_camera' },
  { label: '剪辑页 (app_edit)', value: 'app_editor' },
  { label: '活动会场页 (app_activity)', value: 'app_activity' },
  { label: '消息中心 (app_message)', value: 'app_message' },
  { label: '个人中心 (app_profile)', value: 'app_profile' },
];

const initialBanners = [
  {
    id: 'B001',
    activity_id: 'worldcup_2026',
    placement: 'home_top_banner',
    audience: 'overseas',
    name: '阿尔瓦雷斯世界杯主题',
    jump_type: 'h5_page',
    target: 'https://activity.example.com/worldcup',
    start_time: '2026-06-02T00:00',
    end_time: '2026-07-24T23:59',
    status: 'online',
    operator: '张大拿',
    update_time: '2026-05-18 10:20:00',
  },
  {
    id: 'B002',
    activity_id: 'euro_cup_2024',
    placement: 'channel_banner',
    audience: 'china',
    name: '欧洲杯竞猜入口',
    jump_type: 'h5_page',
    target: 'https://activity.example.com/euro',
    start_time: '2024-06-01T00:00',
    end_time: '2024-07-15T23:59',
    status: 'offline',
    operator: '李主管',
    update_time: '2024-05-15 14:30:00',
  },
];

const initialSplashes = [
  {
    id: 'S001',
    activity_id: 'worldcup_2026',
    audience: 'overseas',
    name: '阿尔瓦雷斯动态开屏',
    media_type: 'video',
    duration: '3',
    frequency: '每日首次',
    jump_type: 'h5_page',
    status: 'online',
    interaction_type: 'clickable',
    operator: '王运营',
    update_time: '2026-05-19 09:15:22',
  },
];

const initialPushes = [
  {
    id: 'P001',
    activity_id: 'worldcup_2026',
    audience: 'overseas',
    title: 'Alvarez 模板上线',
    body: '剪同款视频，赢签名球衣',
    jump_type: 'h5_page',
    send_mode: 'scheduled',
    send_time_raw: '2026-06-05T20:00',
    send_time: '2026-06-05 20:00 (定时)',
    status: 'pending',
    operator: '李主管',
    update_time: '2026-05-19 11:30:00',
    translations: {
      en: { title: 'Alvarez Template Online', body: 'Edit same style videos, win a signed jersey' },
      jp: { title: 'Alvarez テンプレート公開', body: '同款動画を編集してサイン入りユニフォームを獲得' },
    },
  },
];

const initialUsers = [
  { id: 'U001', name: '张大拿', account: 'zhangdn', role: 'super_admin', status: 'active' },
  { id: 'U002', name: '李主管', account: 'lizg', role: 'admin', status: 'active' },
  { id: 'U003', name: '王运营', account: 'wangyy', role: 'operator', status: 'active' },
  { id: 'U004', name: '赵客服', account: 'zhaokf', role: 'viewer', status: 'active' },
];

function createTimestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function normalizeTranslations(translations = {}) {
  const validTranslations = {};

  Object.entries(translations).forEach(([code, value]) => {
    const title = value?.title?.trim() || '';
    const body = value?.body?.trim() || '';
    if (title && body) validTranslations[code] = { title, body };
  });

  return validTranslations;
}

function getActiveLanguageCodes(translations = {}) {
  return Object.keys(normalizeTranslations(translations));
}

function getIncompleteLanguageCodes(translations = {}) {
  return Object.entries(translations)
    .filter(([, value]) => {
      const title = value?.title?.trim() || '';
      const body = value?.body?.trim() || '';
      return (title && !body) || (!title && body);
    })
    .map(([code]) => code.toUpperCase());
}

function getAppPageLabel(pageKey) {
  return appPageOptions.find((item) => item.value === pageKey)?.label || pageKey || '默认首页';
}

export default function App() {
  const [activeTab, setActiveTab] = useState('banner');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState('super_admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [banners, setBanners] = useState(initialBanners);
  const [splashes, setSplashes] = useState(initialSplashes);
  const [pushes, setPushes] = useState(initialPushes);
  const [systemUsers, setSystemUsers] = useState(initialUsers);
  const [formData, setFormData] = useState({});
  const previewUrlRef = useRef(null);

  const permissions = roleConfig[currentRole];

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const currentList = activeTab === 'banner'
    ? banners
    : activeTab === 'splash'
      ? splashes
      : activeTab === 'push'
        ? pushes
        : systemUsers;

  const filteredList = currentList.filter((item) => {
    const matchesSearch = !searchTerm.trim()
      || JSON.stringify(item).toLowerCase().includes(searchTerm.trim().toLowerCase());
    const needsAudienceFilter = activeTab === 'banner' || activeTab === 'splash';
    const matchesAudience = !needsAudienceFilter || audienceFilter === 'all' || item.audience === audienceFilter;
    return matchesSearch && matchesAudience;
  });

  const setCurrentList = (updater) => {
    if (activeTab === 'banner') setBanners(updater);
    if (activeTab === 'splash') setSplashes(updater);
    if (activeTab === 'push') setPushes(updater);
    if (activeTab === 'users') setSystemUsers(updater);
  };

  const clearPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const openModal = (item = null) => {
    clearPreview();

    const normalizedItem = item
      ? {
          ...item,
          jump_type: item.jump_type === 'h5_package' ? 'h5_page' : item.jump_type,
          app_page_key: item.app_page_key || (item.jump_type === 'app_page' ? item.target || 'app_home' : ''),
          app_page_params: item.app_page_params || '',
        }
      : null;

    if (activeTab === 'users') {
      setFormData(normalizedItem || { status: 'active', role: 'operator' });
    } else if (activeTab === 'push') {
      setFormData(normalizedItem || {
        audience: 'overseas',
        jump_type: 'h5_page',
        app_page_key: 'app_home',
        app_page_params: '',
        status: 'draft',
        send_mode: 'scheduled',
        translations: {},
      });
    } else {
      setFormData(normalizedItem || {
        audience: 'overseas',
        jump_type: 'h5_page',
        app_page_key: activeTab === 'splash' ? 'app_home' : '',
        app_page_params: '',
        status: 'draft',
        interaction_type: 'clickable',
      });
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    clearPreview();
    setFormData({});
    setIsModalOpen(false);
  };

  const handleSave = () => {
    if (!permissions.canEditConfigs && activeTab !== 'users') return;
    if (activeTab === 'users' && !permissions.canManageUsers) return;

    const currentUser = systemUsers.find((user) => user.role === currentRole);
    const newItem = {
      ...formData,
      id: formData.id || `NEW_${Math.floor(Math.random() * 1000)}`,
      operator: currentUser?.name || 'System',
      update_time: createTimestamp(),
    };

    delete newItem.download_url;
    delete newItem.fallback_url;

    if (newItem.jump_type === 'app_page') {
      const appPageKey = activeTab === 'splash' ? 'app_home' : (formData.app_page_key || 'app_home');
      const appPageParams = activeTab === 'splash' ? '' : (formData.app_page_params || '').trim();
      newItem.app_page_key = appPageKey;
      newItem.app_page_params = appPageParams;
      newItem.target = appPageKey;
      newItem.target_display = activeTab === 'splash'
        ? '默认首页 (app_home)'
        : `${getAppPageLabel(appPageKey)}${appPageParams ? `?${appPageParams}` : ''}`;
    } else if (newItem.jump_type === 'h5_page') {
      newItem.target = (formData.target || '').trim();
      newItem.target_display = newItem.target;
    }

    if ((activeTab === 'banner' || activeTab === 'splash') && (formData.start_time || '').trim()) {
      newItem.status = 'pending';
    }

    if (activeTab === 'push') {
      newItem.translations = normalizeTranslations(formData.translations);
      if (formData.send_mode === 'immediate') {
        newItem.status = 'sent';
        newItem.send_time = `${createTimestamp()} (立即发送)`;
      } else if (formData.send_time_raw) {
        newItem.status = formData.status || 'pending';
        newItem.send_time = `${formData.send_time_raw.replace('T', ' ')} (定时)`;
      }
    }

    setCurrentList((prev) => (
      formData.id
        ? prev.map((item) => (item.id === formData.id ? newItem : item))
        : [newItem, ...prev]
    ));

    closeModal();
  };

  const getStatusBadge = (status, tabName) => {
    const statusMap = {
      online: { text: '已上线', style: 'bg-green-100 text-green-700 border-green-200' },
      offline: { text: '已下线', style: 'bg-gray-100 text-gray-600 border-gray-200' },
      draft: { text: '草稿', style: 'bg-blue-50 text-blue-600 border-blue-200' },
      pending: { text: tabName === 'push' ? '待发送' : '待上线', style: 'bg-orange-100 text-orange-600 border-orange-200' },
      sent: { text: '已发送', style: 'bg-green-100 text-green-700 border-green-200' },
      failed: { text: '发送失败', style: 'bg-red-100 text-red-700 border-red-200' },
      active: { text: '正常', style: 'bg-green-100 text-green-700 border-green-200' },
      disabled: { text: '停用', style: 'bg-gray-100 text-gray-600 border-gray-200' },
    };

    const config = statusMap[status] || statusMap.draft;
    return <span className={`inline-flex whitespace-nowrap px-2 py-1 text-xs rounded-full border ${config.style}`}>{config.text}</span>;
  };

  const getAudienceBadge = (audience) => {
    const config = audience === 'china'
      ? { text: '中国用户', style: 'bg-red-50 text-red-700 border-red-200' }
      : { text: '海外用户', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' };

    return <span className={`inline-flex whitespace-nowrap px-2 py-1 text-xs rounded-full border ${config.style}`}>{config.text}</span>;
  };

  const renderFormInput = (label, name, type = 'text', placeholder = '', required = false) => (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        disabled={!permissions.canEditConfigs && activeTab !== 'users'}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
        placeholder={placeholder}
        value={formData[name] || ''}
        onChange={(event) => setFormData({ ...formData, [name]: event.target.value })}
      />
    </div>
  );

  const renderFormSelect = (label, name, options, required = false) => (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        disabled={!permissions.canEditConfigs && activeTab !== 'users'}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
        value={formData[name] ?? ''}
        onChange={(event) => setFormData({ ...formData, [name]: event.target.value })}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const handleMaterialFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    clearPreview();

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const previewUrl = isImage || isVideo ? URL.createObjectURL(file) : '';

    if (previewUrl) previewUrlRef.current = previewUrl;

    setFormData((prev) => ({
      ...prev,
      material_file_name: file.name,
      material_file_type: file.type || 'unknown',
      material_kind: isVideo ? 'video' : isImage ? 'image' : 'file',
      material_preview_url: previewUrl,
    }));
  };

  const renderLegacyMaterialPreview = () => {
    const previewUrl = formData.material_preview_url;
    const materialKind = formData.material_kind;
    const fileName = formData.material_file_name;
    const fileType = formData.material_file_type;

    return (
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">素材预览</p>
            <p className="text-xs text-gray-500">上传后可在这里确认当前素材内容</p>
          </div>
          {fileName && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {materialKind === 'video' ? '视频' : materialKind === 'image' ? '图片' : '文件'}
            </span>
          )}
        </div>

        {previewUrl && materialKind === 'image' && (
          <img src={previewUrl} alt={fileName || 'material preview'} className="w-full h-56 object-contain rounded-lg border border-gray-100 bg-gray-50" />
        )}

        {previewUrl && materialKind === 'video' && (
          <video src={previewUrl} controls className="w-full h-56 rounded-lg border border-gray-100 bg-black/90" />
        )}

        {!previewUrl && (
          <div className="h-56 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center px-6">
            <ImageIcon className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">{fileName ? '当前文件暂不支持直接预览' : '暂未选择素材'}</p>
            <p className="text-xs text-gray-400 mt-1">{fileName ? '可以通过文件名确认素材是否正确' : '支持图片和视频预览'}</p>
          </div>
        )}

        {fileName && (
          <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
            <div className="text-sm text-gray-700 font-medium truncate">{fileName}</div>
            <div className="text-xs text-gray-500 mt-1">{fileType || 'unknown'}</div>
          </div>
        )}
      </div>
    );
  };

  const renderMediaContent = (className = '') => {
    const previewUrl = formData.material_preview_url;
    const materialKind = formData.material_kind;
    const fileName = formData.material_file_name;

    if (previewUrl && materialKind === 'image') {
      return <img src={previewUrl} alt={fileName || 'material preview'} className={className} />;
    }

    if (previewUrl && materialKind === 'video') {
      return (
        <video
          src={previewUrl}
          className={className}
          controls
          muted
          loop
          autoPlay
          playsInline
        />
      );
    }

    return (
      <div className={`flex flex-col items-center justify-center px-6 text-center ${className}`}>
        <ImageIcon className="mb-3 h-10 w-10 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">
          {fileName ? '当前文件暂不支持直接预览' : '上传后预览素材展示效果'}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {fileName ? '可通过文件名确认素材是否正确' : '支持图片、GIF 和视频素材'}
        </p>
      </div>
    );
  };

  const renderBannerPhonePreview = () => {
    const previewUrl = formData.material_preview_url;
    const materialKind = formData.material_kind;
    const hasMedia = Boolean(previewUrl && (materialKind === 'image' || materialKind === 'video'));

    return (
      <div className="mt-4 rounded-2xl border border-gray-200 bg-gradient-to-b from-orange-50 via-white to-white p-4">
        <div className="mb-3">
          <p className="text-sm font-semibold text-gray-800">手机首页 Banner 位预览</p>
          <p className="mt-1 text-xs text-gray-500">模拟运营素材在 App 首页顶部 Banner 区域的实际展示效果</p>
        </div>

        <div className="mx-auto w-full max-w-[340px] rounded-[2rem] bg-[#f5f5f7] p-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)] ring-1 ring-black/5">
          <div className="overflow-hidden rounded-[1.65rem] bg-white">
            <div className="bg-white px-4 pt-3 pb-2">
              <div className="mb-3 flex items-center justify-between text-[11px] font-semibold text-gray-700">
                <span>9:41</span>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                  <span className="h-3 w-6 rounded-sm border border-gray-400 p-[1px]">
                    <span className="block h-full w-4 rounded-[2px] bg-gray-500"></span>
                  </span>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <div className="w-7"></div>
                <div className="text-base font-semibold tracking-[0.18em] text-gray-800">XbotGo</div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm">
                  <span className="text-sm leading-none">+</span>
                </div>
              </div>

              <div className="relative mb-4">
                <div className="pointer-events-none absolute left-0 top-3 h-[126px] w-4 rounded-r-2xl bg-gray-200/70"></div>
                <div className="pointer-events-none absolute right-0 top-3 h-[126px] w-4 rounded-l-2xl bg-gray-200/70"></div>
                <div className="mx-3 overflow-hidden rounded-[1.35rem] bg-gray-100 shadow-[0_14px_30px_rgba(249,115,22,0.16)]">
                  <div className="relative aspect-[16/7]">
                    {hasMedia ? (
                      renderMediaContent('h-full w-full object-cover')
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-orange-100 via-amber-50 to-orange-50 text-center">
                        <div>
                          <ImageIcon className="mx-auto mb-2 h-9 w-9 text-orange-300" />
                          <p className="text-sm font-medium text-orange-600">上传后预览首页 Banner 效果</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex justify-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-300"></span>
                  <span className="h-1.5 w-4 rounded-full bg-orange-500"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-300"></span>
                </div>
              </div>

              <div className="space-y-4 px-1 pb-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">设备连接</span>
                    <span className="text-xs text-gray-400">更多</span>
                  </div>
                  <div className="rounded-2xl bg-[#f8fafc] p-4 shadow-sm ring-1 ring-gray-100">
                    <div className="text-sm font-medium text-gray-700">连接相机设备</div>
                    <div className="mt-1 text-xs text-gray-400">快速接入你的 Xbot 相机与配件</div>
                    <div className="mt-3 flex gap-2">
                      <div className="h-16 flex-1 rounded-xl bg-white shadow-sm ring-1 ring-gray-100"></div>
                      <div className="h-16 w-20 rounded-xl bg-orange-50 ring-1 ring-orange-100"></div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">基础教程</span>
                    <span className="text-xs text-gray-400">查看全部</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
                      <div className="mb-2 h-16 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50"></div>
                      <div className="h-2.5 w-16 rounded-full bg-gray-200"></div>
                      <div className="mt-2 h-2.5 w-10 rounded-full bg-gray-100"></div>
                    </div>
                    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
                      <div className="mb-2 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50"></div>
                      <div className="h-2.5 w-14 rounded-full bg-gray-200"></div>
                      <div className="mt-2 h-2.5 w-12 rounded-full bg-gray-100"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 px-3 py-3">
                <div className="grid grid-cols-5 gap-1 text-center text-[10px] text-gray-400">
                  <div className="rounded-xl bg-orange-50 px-1 py-2 text-orange-500">
                    <div className="mb-1 text-sm">•</div>
                    首页
                  </div>
                  <div className="px-1 py-2">
                    <div className="mb-1 text-sm">•</div>
                    相册
                  </div>
                  <div className="px-1 py-2">
                    <div className="mb-1 text-sm">•</div>
                    相机
                  </div>
                  <div className="px-1 py-2">
                    <div className="mb-1 text-sm">•</div>
                    编辑
                  </div>
                  <div className="px-1 py-2">
                    <div className="mb-1 text-sm">•</div>
                    账户
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSplashPhonePreview = () => {
    const previewUrl = formData.material_preview_url;
    const materialKind = formData.material_kind;
    const hasMedia = Boolean(previewUrl && (materialKind === 'image' || materialKind === 'video'));
    const duration = formData.duration || '3';
    const interactionType = formData.interaction_type || 'clickable';

    return (
      <div className="mt-4 rounded-2xl border border-gray-200 bg-gradient-to-b from-slate-50 via-white to-white p-4">
        <div className="mb-3">
          <p className="text-sm font-semibold text-gray-800">手机开屏预览</p>
          <p className="mt-1 text-xs text-gray-500">模拟用户冷启动 App 时看到的全屏开屏广告展示效果</p>
        </div>

        <div className="mx-auto w-full max-w-[300px] rounded-[2.2rem] bg-[#111827] p-3 shadow-[0_20px_40px_rgba(15,23,42,0.24)]">
          <div className="relative overflow-hidden rounded-[1.8rem] bg-black">
            <div className="relative aspect-[9/19.5] bg-gray-950">
              {hasMedia ? (
                renderMediaContent('absolute inset-0 h-full w-full object-cover')
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-slate-900 to-black px-8 text-center">
                  <ImageIcon className="mb-4 h-12 w-12 text-white/30" />
                  <p className="text-sm font-medium text-white/80">上传后预览开屏效果</p>
                  <p className="mt-2 text-xs text-white/45">素材会铺满整个手机屏幕区域</p>
                </div>
              )}

              <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3 text-[11px] font-medium text-white">
                <span>9:41</span>
                <div className="flex items-center gap-1.5 text-white/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80"></span>
                  <span className="h-3 w-6 rounded-sm border border-white/70 p-[1px]">
                    <span className="block h-full w-4 rounded-[2px] bg-white/80"></span>
                  </span>
                </div>
              </div>

              <div className="absolute right-4 top-12 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                跳过 {duration}s
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4">
                {interactionType === 'clickable' ? (
                  <div className="rounded-2xl bg-black/35 px-4 py-3 text-center text-sm font-medium text-white backdrop-blur-md ring-1 ring-white/20">
                    点击查看活动
                  </div>
                ) : (
                  <div className="text-center text-xs tracking-[0.22em] text-white/75">
                    品牌曝光开屏
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDefaultMaterialPreview = () => {
    return renderLegacyMaterialPreview();
  };

  const renderMaterialPreview = () => {
    const fileName = formData.material_file_name;
    const fileType = formData.material_file_type;
    const materialKind = formData.material_kind;

    const previewContent = activeTab === 'banner'
      ? renderBannerPhonePreview()
      : activeTab === 'splash'
        ? renderSplashPhonePreview()
        : renderDefaultMaterialPreview();

    return (
      <>
        {previewContent}
        {fileName && (activeTab === 'banner' || activeTab === 'splash') && (
          <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-gray-700">{fileName}</div>
                <div className="mt-1 text-xs text-gray-500">{fileType || 'unknown'}</div>
              </div>
              <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs text-blue-700">
                {materialKind === 'video' ? '视频' : materialKind === 'image' ? '图片/GIF' : '文件'}
              </span>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderMaterialUpload = () => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">素材上传 (图片/视频) *</label>
      <input
        disabled={!permissions.canEditConfigs}
        type="file"
        accept="image/*,video/*"
        onChange={handleMaterialFileChange}
        className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer disabled:opacity-50 transition-colors"
      />
      {renderMaterialPreview()}
    </div>
  );

  const renderJumpConfig = () => (
    <div className="p-6 bg-blue-50/30 rounded-xl border border-blue-100 mb-6">
      <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-3.5 bg-blue-500 rounded-full"></span>
        跳转承接配置
      </h4>
      <div className="grid grid-cols-1 gap-6">
        {renderFormSelect('跳转类型', 'jump_type', [
          { label: '在线 H5 (h5_page)', value: 'h5_page' },
          { label: 'App 内页 (app_page)', value: 'app_page' },
        ], true)}
      </div>

      {formData.jump_type === 'h5_page' && (
        <div className="grid grid-cols-1 gap-6">
          {renderFormInput('在线 H5 URL 地址', 'target', 'text', 'https://...', true)}
        </div>
      )}

      {formData.jump_type === 'app_page' && (
        <div className="grid grid-cols-1 gap-6">
          {renderFormInput('页面配置已在下方展示', 'target_display', 'text', '', false)}
        </div>
      )}  
    </div>
  );

  const renderAppPageConfig = () => {
    if (formData.jump_type !== 'app_page') return null;

    if (activeTab === 'splash') {
      return (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="font-semibold">App 内页策略</div>
          <div className="mt-1">开屏管理选择 App 内页时，首版固定进入默认首页 `app_home`，无需额外配置参数。</div>
        </div>
      );
    }

    return (
      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/40 p-5">
        <div className="text-sm font-semibold text-gray-800 mb-4">App 内页配置</div>
        <div className="grid grid-cols-2 gap-6">
          {renderFormSelect('页面标识 (Page Key)', 'app_page_key', appPageOptions, true)}
          {renderFormInput('页面参数 (Query Params)', 'app_page_params', 'text', '例如：tab=camera&from=banner')}
        </div>
        <div className="mt-3 text-xs text-gray-500 leading-6">
          后台配置客户端可识别的页面标识和参数，保存时会按这组配置生成 App 内页跳转目标。
        </div>
      </div>
    );
  };

  const renderActionButtons = (item) => (
    <td className="px-6 py-4 align-middle">
      <div className="flex items-center gap-3 text-blue-600 min-h-[24px]">
        {permissions.canEditConfigs ? (
          <>
            <button onClick={() => openModal(item)} className="hover:text-blue-800" title="编辑"><Edit size={16} /></button>
            <button className="text-red-500 hover:text-red-700" title="删除"><Trash2 size={16} /></button>
          </>
        ) : (
          <button onClick={() => openModal(item)} className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-xs"><Eye size={14} /> 查看</button>
        )}
      </div>
    </td>
  );

  const renderBusinessRows = () => {
    if (activeTab === 'banner') {
      return filteredList.map((item) => (
        <tr key={item.id} className="hover:bg-gray-50">
          <td className="px-6 py-4">
            <div className="font-medium text-gray-900">{item.name}</div>
            <div className="text-gray-500 text-xs mt-1">ID: {item.activity_id}</div>
          </td>
          <td className="px-6 py-4 text-gray-600">{item.placement}</td>
          <td className="px-6 py-4 whitespace-nowrap min-w-[110px]">{getAudienceBadge(item.audience)}</td>
          <td className="px-6 py-4">
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{item.jump_type}</span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap min-w-[100px]">{getStatusBadge(item.status, 'banner')}</td>
          <td className="px-6 py-4">
            <div className="text-gray-900">{item.operator || '-'}</div>
            <div className="text-gray-500 text-xs mt-1">{item.update_time || '-'}</div>
          </td>
          {renderActionButtons(item)}
        </tr>
      ));
    }

    if (activeTab === 'splash') {
      return filteredList.map((item) => (
        <tr key={item.id} className="hover:bg-gray-50">
          <td className="px-6 py-4">
            <div className="font-medium text-gray-900">{item.name}</div>
            <div className="text-gray-500 text-xs mt-1">ID: {item.activity_id}</div>
          </td>
          <td className="px-6 py-4 text-gray-600">
            <div>{item.duration} 秒 ({item.media_type})</div>
            <div className="text-xs text-gray-400 mt-1">{item.frequency}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap min-w-[110px]">{getAudienceBadge(item.audience)}</td>
          <td className="px-6 py-4">
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{item.jump_type}</span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap min-w-[100px]">{getStatusBadge(item.status, 'splash')}</td>
          <td className="px-6 py-4">
            <div className="text-gray-900">{item.operator || '-'}</div>
            <div className="text-gray-500 text-xs mt-1">{item.update_time || '-'}</div>
          </td>
          {renderActionButtons(item)}
        </tr>
      ));
    }

    if (activeTab === 'push') {
      return filteredList.map((item) => (
        <tr key={item.id} className="hover:bg-gray-50">
          <td className="px-6 py-4">
            <div className="font-medium text-gray-900">{item.title}</div>
            <div className="text-gray-500 text-xs mt-1">ID: {item.activity_id}</div>
          </td>
          <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.send_time}</td>
          <td className="px-6 py-4 min-w-[160px] whitespace-nowrap">
            <div className="text-gray-900 whitespace-nowrap">{getActiveLanguageCodes(item.translations).length} 种语言</div>
            <div className="text-gray-500 text-xs mt-1">{getActiveLanguageCodes(item.translations).join(', ').toUpperCase() || '仅默认文案'}</div>
          </td>
          <td className="px-6 py-4">
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{item.jump_type}</span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap min-w-[100px]">{getStatusBadge(item.status, 'push')}</td>
          <td className="px-6 py-4">
            <div className="text-gray-900">{item.operator || '-'}</div>
            <div className="text-gray-500 text-xs mt-1">{item.update_time || '-'}</div>
          </td>
          {renderActionButtons(item)}
        </tr>
      ));
    }

    return filteredList.map((user) => {
      const canEditUser = currentRole === 'super_admin' || (currentRole === 'admin' && user.role !== 'super_admin' && user.role !== 'admin');
      return (
        <tr key={user.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
          <td className="px-6 py-4 text-gray-600">{user.account}</td>
          <td className="px-6 py-4">
            <span className={`px-2 py-1 rounded text-xs border ${
              user.role === 'super_admin'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : user.role === 'admin'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : user.role === 'operator'
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
            }`}
            >
              {roleConfig[user.role]?.label || '未知'}
            </span>
          </td>
          <td className="px-6 py-4">{getStatusBadge(user.status, 'users')}</td>
          <td className="px-6 py-4 align-middle">
            <div className="flex items-center gap-3 text-blue-600 min-h-[24px]">
              {canEditUser ? (
                <>
                  <button onClick={() => openModal(user)} className="hover:text-blue-800" title="编辑权限"><Edit size={16} /></button>
                  <button className="text-red-500 hover:text-red-700" title="移除账号"><Trash2 size={16} /></button>
                </>
              ) : (
                <span className="text-gray-400 text-xs">无编辑权限</span>
              )}
            </div>
          </td>
        </tr>
      );
    });
  };

  const pushSaveLabel = formData.send_mode === 'immediate' ? '保存并发送' : '保存';

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-10">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">OP</div>
          <span className="font-bold text-lg text-gray-800">运营触达工作台</span>
        </div>

        <div className="flex-1 py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">核心配置</div>
          <nav className="space-y-1 px-2 mb-6">
            {[
              { id: 'banner', icon: ImageIcon, label: 'Banner 管理' },
              { id: 'splash', icon: Smartphone, label: '开屏管理' },
              { id: 'push', icon: Bell, label: 'Push 消息管理' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={18} className={activeTab === item.id ? 'text-blue-600' : 'text-gray-400'} />
                {item.label}
              </button>
            ))}
          </nav>

          {permissions.canManageUsers && (
            <>
              <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">系统设置</div>
              <nav className="space-y-1 px-2">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Users size={18} className={activeTab === 'users' ? 'text-blue-600' : 'text-gray-400'} />
                  用户管理 <span className="ml-auto text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Admin</span>
                </button>
              </nav>
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 text-sm text-gray-500">v1.0.0 (PRD Base)</div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
          <h1 className="text-xl font-bold text-gray-800">
            {activeTab === 'banner' && 'Banner 管理 (固定运营位)'}
            {activeTab === 'splash' && '开屏管理 (启动物料)'}
            {activeTab === 'push' && 'Push 消息管理'}
            {activeTab === 'users' && '系统用户管理'}
          </h1>

          <div className="flex items-center gap-5 text-sm text-gray-600">
            <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200 shadow-sm transition-all">
              <ShieldAlert size={16} className="text-yellow-600" />
              <span className="text-yellow-800 font-medium whitespace-nowrap">体验切换视角:</span>
              <select
                className="bg-transparent font-bold text-yellow-900 outline-none cursor-pointer"
                value={currentRole}
                onChange={(event) => {
                  setCurrentRole(event.target.value);
                  if (event.target.value !== 'super_admin' && event.target.value !== 'admin' && activeTab === 'users') {
                    setActiveTab('banner');
                  }
                }}
              >
                {Object.entries(roleConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            <button className="flex items-center gap-1 hover:text-gray-900">
              <Settings size={16} /> 基础设置
            </button>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-3">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="avatar" className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200" />
              <div className="flex flex-col">
                <span className="leading-tight font-bold text-gray-800">{systemUsers.find((user) => user.role === currentRole)?.name || 'Admin'}</span>
                <span className="text-[11px] text-gray-500 font-medium">{permissions.label}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2.5 w-96 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <Search size={18} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={activeTab === 'users' ? '搜索用户名或账号...' : '搜索活动ID、名称或群体...'}
                  className="w-full text-sm outline-none bg-transparent"
                />
              </div>

              {(activeTab === 'banner' || activeTab === 'splash') && (
                <select
                  value={audienceFilter}
                  onChange={(event) => setAudienceFilter(event.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全部群体</option>
                  <option value="china">中国用户</option>
                  <option value="overseas">海外用户</option>
                </select>
              )}
            </div>

            {((activeTab !== 'users' && permissions.canEditConfigs) || (activeTab === 'users' && permissions.canManageUsers)) && (
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                <Plus size={18} />
                {activeTab === 'banner' ? '新建 Banner' : activeTab === 'splash' ? '新建开屏' : activeTab === 'push' ? '新建 Push' : '添加用户'}
              </button>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  {activeTab !== 'users' ? (
                    <>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">基础信息</th>
                      {activeTab === 'banner' && <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">资源位</th>}
                      {activeTab === 'splash' && <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">展示策略</th>}
                      {(activeTab === 'banner' || activeTab === 'splash') && <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">下发群体</th>}
                      {activeTab === 'push' && <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">发送时间</th>}
                      {activeTab === 'push' && <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">生效语言</th>}
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">跳转类型</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">最后操作</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">用户姓名</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">登录账号</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">角色权限</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">{renderBusinessRows()}</tbody>
            </table>

            {filteredList.length === 0 && <div className="p-8 text-center text-gray-500">暂无匹配数据</div>}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-[860px] h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-white z-10 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                {!permissions.canEditConfigs && activeTab !== 'users' && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md uppercase font-semibold border border-gray-200">只读模式</span>
                )}
                {formData.id ? '编辑' : (activeTab === 'users' ? '添加' : '新建')} {activeTab === 'banner' ? 'Banner' : activeTab === 'splash' ? '开屏' : activeTab === 'push' ? 'Push' : '系统用户'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {activeTab !== 'users' && (
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {renderFormInput('活动标识 (Activity ID)', 'activity_id', 'text', '例如: worldcup_2026', true)}
                  {activeTab === 'push'
                    ? renderFormSelect('状态', 'status', [
                        { label: '草稿', value: 'draft' },
                        { label: '待发送', value: 'pending' },
                        { label: '已发送', value: 'sent' },
                        { label: '发送失败', value: 'failed' },
                      ])
                    : renderFormSelect('状态', 'status', [
                        { label: '草稿', value: 'draft' },
                        { label: '待上线', value: 'pending' },
                        { label: '上线', value: 'online' },
                        { label: '下线', value: 'offline' },
                      ])}
                </div>
              )}

              {activeTab === 'users' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    {renderFormInput('用户姓名', 'name', 'text', '例如: 张大拿', true)}
                    {renderFormInput('登录账号 (工号/邮箱)', 'account', 'text', '例如: zhangdn', true)}
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-2">
                    {renderFormSelect('角色权限', 'role', [
                      ...(currentRole === 'super_admin'
                        ? [
                            { label: '超级管理员 (全量权限)', value: 'super_admin' },
                            { label: '管理员', value: 'admin' },
                          ]
                        : []),
                      { label: '运营员', value: 'operator' },
                      { label: '普通用户', value: 'viewer' },
                    ], true)}
                    {renderFormSelect('账号状态', 'status', [
                      { label: '正常 (Active)', value: 'active' },
                      { label: '停用 (Disabled)', value: 'disabled' },
                    ])}
                  </div>

                  <div className="mt-8 bg-blue-50 p-5 rounded-xl text-sm border border-blue-100 shadow-sm">
                    <span className="font-bold text-blue-900 flex items-center gap-2 mb-3 text-base">
                      <ShieldAlert size={18} /> 权限级别说明
                    </span>
                    <ul className="text-blue-800 space-y-3 mt-2 leading-relaxed">
                      <li className="flex items-start gap-2.5">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                        <p><strong>超级管理员：</strong>拥有系统全部模块的查看、编辑、发布与用户管理权限。</p>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                        <p><strong>管理员：</strong>可管理所有运营配置，并可新增和维护运营员、普通用户账号，但不能管理超级管理员。</p>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                        <p><strong>运营员：</strong>可新建、编辑、发布 Banner、开屏和 Push 配置，但不可进入用户管理模块。</p>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                        <p><strong>普通用户：</strong>仅可查看配置数据，没有新增、修改或删除权限。</p>
                      </li>
                    </ul>
                  </div>
                </>
              )}

              {activeTab === 'banner' && (
                <>
                  {renderFormInput('素材名称/说明', 'name', 'text', '内部标记名称')}
                  {renderFormSelect('资源位 (Placement)', 'placement', [
                    { label: '首页顶部 Banner', value: 'home_top_banner' },
                    { label: '频道页 Banner', value: 'channel_banner' },
                  ], true)}
                  {renderFormSelect('下发群体', 'audience', [
                    { label: '中国用户', value: 'china' },
                    { label: '海外用户', value: 'overseas' },
                  ], true)}
                  {renderMaterialUpload()}
                  {renderJumpConfig()}
                  {renderAppPageConfig()}
                  <div className="grid grid-cols-2 gap-6">
                    {renderFormInput('上线时间', 'start_time', 'datetime-local')}
                    {renderFormInput('下线时间', 'end_time', 'datetime-local')}
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {renderFormInput('最低 App 版本', 'min_version', 'text', '例如: 4.4.4')}
                    {renderFormInput('展示顺序', 'sort', 'number', '数值越小越靠前')}
                  </div>
                </>
              )}

              {activeTab === 'splash' && (
                <>
                  {renderFormInput('开屏物料名称', 'name', 'text')}
                  <div className="grid grid-cols-2 gap-6">
                    {renderFormSelect('素材类型', 'media_type', [
                      { label: '静态图片', value: 'image' },
                      { label: '动态图 GIF', value: 'gif' },
                      { label: '视频', value: 'video' },
                    ], true)}
                    {renderFormSelect('展示时长', 'duration', [
                      { label: '3 秒', value: '3' },
                      { label: '5 秒', value: '5' },
                    ], true)}
                  </div>
                  {renderFormSelect('下发群体', 'audience', [
                    { label: '中国用户', value: 'china' },
                    { label: '海外用户', value: 'overseas' },
                  ], true)}
                  {renderMaterialUpload()}
                  <div className="grid grid-cols-2 gap-6">
                    {renderFormSelect('是否可跳过', 'skippable', [
                      { label: '是 (可点击跳过)', value: 'true' },
                      { label: '否 (强制看完)', value: 'false' },
                    ])}
                    {renderFormSelect('展示频次规则', 'frequency', [
                      { label: '每日首次冷启动', value: '每日首次' },
                      { label: '每次冷启动', value: '每次启动' },
                      { label: '仅展示一次', value: '单次' },
                    ])}
                  </div>
                  <div className="mb-6">
                    {renderFormSelect('交互模式', 'interaction_type', [
                      { label: '支持点击跳转 (需配置承接)', value: 'clickable' },
                      { label: '纯曝光模式 (无跳转)', value: 'pure_exposure' },
                    ], true)}
                  </div>
                  {formData.interaction_type !== 'pure_exposure' && renderJumpConfig()}
                  {formData.interaction_type !== 'pure_exposure' && renderAppPageConfig()}
                  <div className="grid grid-cols-2 gap-6 border-t border-gray-100 pt-6 mt-2">
                    {renderFormInput('上线时间', 'start_time', 'datetime-local')}
                    {renderFormInput('下线时间', 'end_time', 'datetime-local')}
                  </div>
                </>
              )}

              {activeTab === 'push' && (
                <>
                  {renderFormInput('默认 PUSH 标题', 'title', 'text', '请输入默认标题', true)}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">默认 PUSH 正文 *</label>
                    <textarea
                      disabled={!permissions.canEditConfigs}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 transition-colors resize-none leading-relaxed"
                      rows="2"
                      placeholder="请输入默认推送正文..."
                      value={formData.body || ''}
                      onChange={(event) => setFormData({ ...formData, body: event.target.value })}
                    ></textarea>
                  </div>

                  <div className="mb-8 border-t border-gray-100 pt-6">
                    <label className="block text-base font-bold text-gray-800 mb-2">多语言推送内容配置</label>
                    <p className="text-sm text-gray-500 mb-3">只有同时填写了标题和正文的语言，才会纳入下发配置。</p>
                    <p className="text-sm text-gray-500 mb-5">未填写完整的语言将不会给 App 内切换到该语言的用户发送通知。</p>
                    <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                      <div className="text-sm font-semibold text-blue-900">
                        当前生效语言：{getActiveLanguageCodes(formData.translations).length} 种
                      </div>
                      <div className="text-xs text-blue-700 mt-1">
                        {getActiveLanguageCodes(formData.translations).length > 0
                          ? getActiveLanguageCodes(formData.translations).join(', ').toUpperCase()
                          : '仅发送默认文案'}
                      </div>
                      {getIncompleteLanguageCodes(formData.translations).length > 0 && (
                        <div className="text-xs text-amber-700 mt-2">
                          以下语言未填写完整，不会发送：{getIncompleteLanguageCodes(formData.translations).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      {languages.map((lang) => (
                        <div key={lang.code} className="border border-blue-100 bg-blue-50/30 rounded-xl p-5 transition-all shadow-sm">
                          <div className="text-sm text-blue-800 mb-4 font-bold flex items-center gap-2">
                            <span className="bg-blue-200 text-blue-900 px-2 py-0.5 rounded-md leading-none">{lang.label}</span>
                            {lang.name}
                          </div>
                          <input
                            type="text"
                            disabled={!permissions.canEditConfigs}
                            className="w-full text-sm bg-transparent border-b border-blue-200 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-400 pb-2 mb-4 disabled:text-gray-400 font-medium transition-colors"
                            placeholder={`[标题] ${lang.name}译文`}
                            value={formData?.translations?.[lang.code]?.title || ''}
                            onChange={(event) => {
                              const nextTranslations = { ...(formData.translations || {}) };
                              if (!nextTranslations[lang.code]) nextTranslations[lang.code] = {};
                              nextTranslations[lang.code].title = event.target.value;
                              setFormData({ ...formData, translations: nextTranslations });
                            }}
                          />
                          <textarea
                            disabled={!permissions.canEditConfigs}
                            className="w-full text-sm bg-transparent border-b border-blue-200 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-400 pb-2 resize-none disabled:text-gray-400 leading-relaxed transition-colors"
                            rows="2"
                            placeholder={`[正文] ${lang.name}译文`}
                            value={formData?.translations?.[lang.code]?.body || ''}
                            onChange={(event) => {
                              const nextTranslations = { ...(formData.translations || {}) };
                              if (!nextTranslations[lang.code]) nextTranslations[lang.code] = {};
                              nextTranslations[lang.code].body = event.target.value;
                              setFormData({ ...formData, translations: nextTranslations });
                            }}
                          ></textarea>
                        </div>
                      ))}
                    </div>
                  </div>

                  {renderJumpConfig()}
                  {renderAppPageConfig()}

                  <div className="grid grid-cols-2 gap-6">
                    {renderFormSelect('发送模式', 'send_mode', [
                      { label: '定时发送', value: 'scheduled' },
                      { label: '立即发送', value: 'immediate' },
                    ])}
                    {renderFormInput('设定发送时间', 'send_time_raw', 'datetime-local')}
                  </div>
                </>
              )}
            </div>

            <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-end gap-4 rounded-b-xl">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                {(permissions.canEditConfigs || activeTab === 'users') ? '取消' : '关闭'}
              </button>

              {((permissions.canEditConfigs && activeTab !== 'users') || (activeTab === 'users' && permissions.canManageUsers)) && (
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
                >
                  {activeTab === 'push' ? pushSaveLabel : '保存'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      ` }} />
    </div>
  );
}
