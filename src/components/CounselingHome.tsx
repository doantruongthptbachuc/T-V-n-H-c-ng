import React, { useState } from 'react';
import { 
  HeartHandshake, 
  BookOpen, 
  Brain, 
  Compass, 
  Users, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Phone, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  CalendarDays,
  UserCheck,
  Edit3,
  Camera,
  Save,
  X,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { SchoolConfig, Counselor } from '../types';
import { initialCounselors, sampleCounselorAvatars } from '../data/initialData';
import { compressImageFile } from '../utils/imageCompressor';

interface CounselingHomeProps {
  config: SchoolConfig;
  counselors?: Counselor[];
  onNavigate: (tab: string, topic?: string) => void;
  onOpenQuestionModal: () => void;
  isAdminLoggedIn?: boolean;
  onUpdateCounselor?: (id: string, updates: Partial<Counselor>) => void;
}

export const CounselingHome: React.FC<CounselingHomeProps> = ({
  config,
  counselors = initialCounselors,
  onNavigate,
  onOpenQuestionModal,
  isAdminLoggedIn = false,
  onUpdateCounselor,
}) => {
  const [editingCounselor, setEditingCounselor] = useState<Counselor | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const pillars = [
    {
      id: 'pillar-1',
      title: 'Tư Vấn Tâm Lý & Cảm Xúc',
      topic: 'Tâm lý',
      desc: 'Giúp học sinh nhận diện và vượt qua các rối nhiễu tâm lý, áp lực thi cử, căng thẳng, lo âu, tự ti và xây dựng cảm xúc tích cực.',
      icon: Brain,
      color: 'from-pink-500 to-rose-600',
      bg: 'bg-pink-50',
      textColor: 'text-pink-600',
    },
    {
      id: 'pillar-2',
      title: 'Phương Pháp Học Tập Hiệu Quả',
      topic: 'Học tập',
      desc: 'Hướng dẫn kỹ năng tự học, sơ đồ tư duy (Mindmap), quản trị thời gian Pomodoro, chiến lược làm bài thi trắc nghiệm và tự luận.',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-600',
      bg: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      id: 'pillar-3',
      title: 'Định Hướng Nghề Nghiệp & Chọn Trường',
      topic: 'Hướng nghiệp',
      desc: 'Trắc nghiệm tính cách Holland/MBTI, phân tích xu hướng thị trường lao động, tư vấn chọn khối thi, tổ hợp môn và trường Đại học phù hợp.',
      icon: Compass,
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      id: 'pillar-4',
      title: 'Kỹ Năng Sống & Mối Quan Hệ Học Đường',
      topic: 'Kỹ năng sống',
      desc: 'Kỹ năng giao tiếp, giải quyết xung đột bạn bè, ứng phó với bắt nạt học đường và không gian mạng, thấu hiểu cha mẹ và thầy cô.',
      icon: HeartHandshake,
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
  ];

  const activeCounselors = counselors.length > 0 ? counselors : initialCounselors;

  const handleOpenEdit = (c: Counselor) => {
    setEditingCounselor(c);
    setEditName(c.name);
    setEditRole(c.role);
    setEditSpecialty(c.specialty);
    setEditPhone(c.phone || '');
    setEditAvatar(c.avatar);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploadingAvatar(true);
        const compressed = await compressImageFile(file, 400, 400, 0.88);
        setEditAvatar(compressed);
      } catch (err) {
        console.error('Error compressing avatar:', err);
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleSaveCounselor = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCounselor && onUpdateCounselor) {
      onUpdateCounselor(editingCounselor.id, {
        name: editName.trim(),
        role: editRole.trim(),
        specialty: editSpecialty.trim(),
        phone: editPhone.trim(),
        avatar: editAvatar.trim(),
      });
      setEditingCounselor(null);
      alert('Đã cập nhật Avatar & Thông tin Thầy Cô thành công!');
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-gradient-to-b from-blue-50/80 via-indigo-50/50 to-purple-50/60 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />
            <span>NGÔI NHÀ TƯ VẤN HỌC ĐƯỜNG THPT</span>
          </div>
          <h1 
            className="font-black tracking-tight"
            style={{ 
              fontSize: '40px',
              color: '#af3142' 
            }}
          >
            ĐỒNG HÀNH TOÀN DIỆN CÙNG HỌC SINH
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Phòng Tư vấn Học đường là điểm tựa tin cậy, nơi bảo vệ sự an toàn tinh thần, chắp cánh ước mơ và nâng bước các bạn học sinh trưởng thành.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                onClick={() => onNavigate('qa', p.topic)}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="space-y-4">
                  <div className={`w-14 h-14 rounded-2xl ${p.bg} ${p.textColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-black text-blue-600 group-hover:text-blue-700 flex items-center space-x-1.5">
                    <span>Hỏi đáp & Tư vấn ngay</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                    {p.topic}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Counselor Team Section */}
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-yellow-300">
              ĐỘI NGŨ THẦY CÔ & CHUYÊN GIA TƯ VẤN
            </h2>
            <p className="text-xs sm:text-sm text-blue-100">
              Tận tâm, thấu hiểu, giàu kinh nghiệm chuyên môn và luôn bảo mật thông tin học sinh
            </p>
            {isAdminLoggedIn && (
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('admin')}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Quản trị & Thay đổi tên/avatar Thầy Cô</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeCounselors.map((c) => (
              <div
                key={c.id}
                className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 space-y-4 text-center hover:bg-white/15 transition-all flex flex-col justify-between relative group"
              >
                <div className="space-y-3">
                  <div className="relative inline-block mx-auto">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white/30 shadow-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 rounded-full border-2 border-white" title="Đang trực tuyến">
                      <UserCheck className="w-3 h-3 text-white" />
                    </div>

                    {/* Admin Direct Edit Badge on Avatar */}
                    {isAdminLoggedIn && (
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="absolute -top-1 -right-2 p-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full border-2 border-white shadow-md cursor-pointer"
                        title="Đổi Avatar Thầy Cô"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{c.name}</h4>
                    <p className="text-xs font-semibold text-yellow-300">{c.role}</p>
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    {c.specialty}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-center space-x-2 text-[11px] text-blue-200">
                    <Phone className="w-3 h-3 text-yellow-300" />
                    <span>Hotline: {c.phone || config.hotline}</span>
                  </div>

                  {isAdminLoggedIn && (
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="w-full py-2 bg-amber-500/90 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Đổi Avatar & Thông Tin</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ADMIN MODAL: CHỈNH SỬA AVATAR & THÔNG TIN THẦY CÔ */}
          {editingCounselor && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        ĐỔI AVATAR & HỒ SƠ THẦY CÔ
                      </h3>
                      <p className="text-xs text-slate-500">Cập nhật ảnh đại diện và chuyên môn tư vấn</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingCounselor(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCounselor} className="space-y-4 text-xs sm:text-sm">
                  {/* Live Avatar Preview */}
                  <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <img
                      src={editAvatar}
                      alt="Avatar preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-indigo-400 shadow-md shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = sampleCounselorAvatars[0];
                      }}
                    />
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900 text-xs">Ảnh đại diện đang chọn</p>
                      <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>{isUploadingAvatar ? 'Đang nén ảnh...' : 'Tải ảnh từ máy'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={isUploadingAvatar}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Preset Avatars Selection */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block text-xs">Hoặc chọn avatar mẫu Thầy Cô:</label>
                    <div className="grid grid-cols-4 gap-2">
                      {sampleCounselorAvatars.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditAvatar(url)}
                          className={`relative rounded-xl overflow-hidden border-2 h-14 transition cursor-pointer ${
                            editAvatar === url ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                          {editAvatar === url && (
                            <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white drop-shadow" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* URL Input */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">Hoặc nhập link URL ảnh:</label>
                    <input
                      type="text"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-xs">Họ và tên:</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-xs">Chức vụ / Đơn vị:</label>
                      <input
                        type="text"
                        required
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-xs">Lĩnh vực tư vấn chính:</label>
                      <input
                        type="text"
                        required
                        value={editSpecialty}
                        onChange={(e) => setEditSpecialty(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-xs">Số điện thoại liên hệ:</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="0987.xxx.xxx"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingCounselor(null)}
                      className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow cursor-pointer flex items-center space-x-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Lưu Thay Đổi</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Counseling Process & Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Working Schedule & Location */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-indigo-600">
                <CalendarDays className="w-5 h-5" />
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  LỊCH TRỰC TƯ VẤN TRỰC TIẾP
                </h3>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Thời gian làm việc:</p>
                    <p className="text-slate-500">{config.workingHours}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Địa điểm phòng tư vấn:</p>
                    <p className="text-slate-500">{config.consultingRoom}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-2xl">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Đường dây nóng hỗ trợ:</p>
                    <a href={`tel:${config.hotline.replace(/\s+/g, '')}`} className="text-blue-700 font-extrabold hover:underline">
                      {config.hotline}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
              <p className="font-bold flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Quy tắc bảo mật thông tin (100% Confidential):</span>
              </p>
              <p className="text-emerald-800 leading-relaxed">
                Mọi nội dung chia sẻ, trao đổi giữa học sinh và cán bộ tư vấn đều được giữ kín tuyệt đối theo nguyên tắc đạo đức nghề nghiệp tâm lý học đường.
              </p>
            </div>
          </div>

          {/* 4 Steps to Receive Counseling */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 flex items-center space-x-2 text-blue-600">
              <Sparkles className="w-5 h-5" />
              <span>4 BƯỚC ĐỂ NHẬN HỖ TRỢ TƯ VẤN</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Gửi băn khoăn trực tuyến hoặc đến phòng tư vấn</h4>
                  <p className="text-xs text-slate-500">Đặt câu hỏi ẩn danh qua web hoặc gõ cửa phòng 204 nhà B trong giờ ra chơi.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Tiếp nhận & Phân loại chuyên môn</h4>
                  <p className="text-xs text-slate-500">Tổ tư vấn phân công thầy cô phù hợp (tâm lý, học tập, hướng nghiệp) để hỗ trợ.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-7 h-7 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Trò chuyện 1-1 & Tháo gỡ vấn đề</h4>
                  <p className="text-xs text-slate-500">Lắng nghe chân thành, không phán xét, cùng học sinh tìm ra giải pháp tối ưu.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Đồng hành & Theo dõi tiến trình</h4>
                  <p className="text-xs text-slate-500">Tiếp tục đồng hành cho đến khi học sinh lấy lại sự cân bằng, tự tin và vui vẻ.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('qa')}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition text-sm flex items-center justify-center space-x-2 cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>GỬI CÂU HỎI TƯ VẤN NGAY</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
