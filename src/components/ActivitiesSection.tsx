import React, { useState } from 'react';
import { 
  Camera, 
  Calendar, 
  MapPin, 
  Users, 
  Filter, 
  Plus, 
  X, 
  Sparkles, 
  Image as ImageIcon,
  CheckCircle,
  ChevronRight,
  Edit3,
  Trash2,
  Save,
  Check,
  ThumbsUp,
  Heart,
  Smile,
  Flame,
  MessageSquare,
  Share2,
  Bookmark
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Activity, ActivityCategory } from '../types';
import { compressImageFile } from '../utils/imageCompressor';

interface ActivitiesSectionProps {
  activities: Activity[];
  onAddActivity: (act: Omit<Activity, 'id'>) => void;
  onUpdateActivity?: (id: string, updates: Partial<Activity>) => void;
  onDeleteActivity?: (id: string) => void;
  onReact?: (id: string, type: 'like' | 'heart' | 'haha' | 'fire' | 'care') => void;
  isAdminLoggedIn?: boolean;
}

const CATEGORIES: (ActivityCategory | 'Tất cả')[] = [
  'Tất cả',
  'Hoạt động Đoàn',
  'Tình nguyện',
  'Văn nghệ',
  'Thể thao',
  'Tư vấn học đường',
  'Hoạt động trải nghiệm',
  'Hoạt động cộng đồng'
];

export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({
  activities,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onReact,
  isAdminLoggedIn = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [activeModalItem, setActiveModalItem] = useState<Activity | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Edit Activity State
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<ActivityCategory>('Hoạt động Đoàn');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editParticipants, setEditParticipants] = useState('500');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [isCompressingEditImage, setIsCompressingEditImage] = useState(false);

  // New Activity Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('Hoạt động Đoàn');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [participantsCount, setParticipantsCount] = useState('500');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCompressingNewImage, setIsCompressingNewImage] = useState(false);

  const filteredActivities = activities.filter(
    (act) => selectedCategory === 'Tất cả' || act.category === selectedCategory
  );

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingNewImage(true);
        const compressed = await compressImageFile(file, 1200, 800, 0.85);
        setImagePreview(compressed);
        setImageUrl(compressed);
      } catch (err) {
        console.error('Error compressing activity image:', err);
      } finally {
        setIsCompressingNewImage(false);
      }
    }
  };

  const handleOpenEdit = (act: Activity, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingActivity(act);
    setEditTitle(act.title);
    setEditCategory(act.category);
    setEditDate(act.date);
    setEditDescription(act.description);
    setEditLocation(act.location || '');
    setEditParticipants(String(act.participantsCount || '300'));
    setEditImageUrl(act.imageUrl);
  };

  const handleEditImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressingEditImage(true);
        const compressed = await compressImageFile(file, 1200, 800, 0.85);
        setEditImageUrl(compressed);
      } catch (err) {
        console.error('Error compressing activity image:', err);
      } finally {
        setIsCompressingEditImage(false);
      }
    }
  };

  const handleSaveEditActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity || !onUpdateActivity) return;

    onUpdateActivity(editingActivity.id, {
      title: editTitle.trim(),
      category: editCategory,
      date: editDate.trim(),
      description: editDescription.trim(),
      location: editLocation.trim(),
      participantsCount: parseInt(editParticipants) || 300,
      imageUrl: editImageUrl.trim(),
    });

    if (activeModalItem && activeModalItem.id === editingActivity.id) {
      setActiveModalItem({
        ...activeModalItem,
        title: editTitle.trim(),
        category: editCategory,
        date: editDate.trim(),
        description: editDescription.trim(),
        location: editLocation.trim(),
        participantsCount: parseInt(editParticipants) || 300,
        imageUrl: editImageUrl.trim(),
      });
    }

    setEditingActivity(null);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa bài viết hoạt động này?')) {
      if (onDeleteActivity) onDeleteActivity(id);
      if (activeModalItem && activeModalItem.id === id) {
        setActiveModalItem(null);
      }
    }
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || (!imageUrl && !imagePreview)) {
      alert('Vui lòng nhập tiêu đề và chọn ảnh cho hoạt động!');
      return;
    }

    onAddActivity({
      title: title.trim(),
      category,
      date: date.trim() || new Date().toLocaleDateString('vi-VN'),
      description: description.trim() || 'Hoạt động sôi nổi của đoàn viên thanh niên nhà trường.',
      imageUrl: imagePreview || imageUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
      location: location.trim() || 'Trường THPT Ba Chúc',
      participantsCount: parseInt(participantsCount) || 300,
      likes: 0,
      hearts: 0,
      hahas: 0,
      fires: 0,
      cares: 0,
    });

    setIsAddModalOpen(false);
    setTitle('');
    setDescription('');
    setLocation('');
    setImageUrl('');
    setImagePreview(null);
    confetti({ particleCount: 80, spread: 70 });
  };

  const handleReactionClick = (e: React.MouseEvent, actId: string, type: 'like' | 'heart' | 'haha' | 'fire' | 'care') => {
    e.stopPropagation();
    if (onReact) {
      onReact(actId, type);
    }
    if (type === 'heart' || type === 'fire') {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleShareArticle = (act: Activity, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareText = `📌 ${act.title}\n🗓️ Ngày diễn ra: ${act.date}\n📍 Địa điểm: ${act.location || 'Trường THPT Ba Chúc'}\n${act.description.slice(0, 200)}...`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  // Helper to count words
  const countWords = (str: string) => {
    return str.trim() ? str.trim().split(/\s+/).length : 0;
  };

  return (
    <div className="py-8 sm:py-12 bg-gradient-to-b from-purple-50/40 via-white to-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Toast Copied */}
        {copiedToast && (
          <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-sm animate-in slide-in-from-top-4">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>Đã sao chép liên kết & nội dung bài viết vào bộ nhớ tạm!</span>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-purple-200/70 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5 text-purple-600" />
              <span>Khoảnh Khắc & Phong Trào Thanh Niên</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              HOẠT ĐỘNG NỔI BẬT & PHONG TRÀO
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
              Album ảnh và bài viết chuyên đề về các phong trào Đoàn, chiến dịch tình nguyện, giải đấu thể thao, ngày hội văn nghệ và tư vấn học đường. Học sinh có thể đọc bài và thả tim, like, tương tác nhiệt huyết!
            </p>
          </div>

          {isAdminLoggedIn && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng hoạt động mới</span>
            </button>
          )}
        </div>

        {/* Live Activities Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-black shrink-0">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold">Tổng bài viết hoạt động</p>
              <p className="text-2xl font-black text-purple-700">{activities.length} Bài viết</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold">Lượt đoàn viên tham gia</p>
              <p className="text-2xl font-black text-blue-600">
                {activities.reduce((acc, a) => acc + (a.participantsCount || 300), 0).toLocaleString('vi-VN')} Lượt
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black shrink-0">
              <Flame className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold">Lượt tương tác & cảm xúc</p>
              <p className="text-2xl font-black text-rose-600">
                {activities.reduce((acc, a) => acc + (a.likes || 0) + (a.hearts || 0) + (a.hahas || 0) + (a.fires || 0) + (a.cares || 0), 0)} Lượt
              </p>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          {CATEGORIES.map((cat) => {
            const count = cat === 'Tất cả' 
              ? activities.length 
              : activities.filter(a => a.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-sm font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Activities Album Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => {
            const totalReactions = (act.likes || 0) + (act.hearts || 0) + (act.hahas || 0) + (act.fires || 0) + (act.cares || 0);

            return (
              <div
                key={act.id}
                onClick={() => setActiveModalItem(act)}
                className="bg-white rounded-3xl border border-slate-200 hover:border-purple-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between group relative"
              >
                <div>
                  {/* Photo with Overlay Category */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={act.imageUrl}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800';
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                      {act.category}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-xl flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-yellow-300" />
                      <span>{act.date}</span>
                    </div>

                    {/* Admin Quick Action Buttons on Image */}
                    {isAdminLoggedIn && (
                      <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-10">
                        <button
                          onClick={(e) => handleOpenEdit(act, e)}
                          className="p-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-lg font-bold text-xs flex items-center space-x-1 border border-white cursor-pointer"
                          title="Chỉnh sửa bài viết và thay đổi hình ảnh"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Sửa</span>
                        </button>
                        <button
                          onClick={(e) => handleDelete(act.id, e)}
                          className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg border border-white cursor-pointer"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-2.5">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-purple-600 transition">
                      {act.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer & Interactive Reactions */}
                <div className="p-4 pt-2 border-t border-slate-100 space-y-3">
                  {/* Location & participants */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    {act.location && (
                      <span className="flex items-center space-x-1 truncate max-w-[160px]">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{act.location}</span>
                      </span>
                    )}
                    {act.participantsCount && (
                      <span className="flex items-center space-x-1 text-slate-500 font-semibold">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span>{act.participantsCount} học sinh</span>
                      </span>
                    )}
                  </div>

                  {/* Interactive Reaction Buttons for Students */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
                    <div className="flex items-center space-x-1 sm:space-x-1.5">
                      <button
                        onClick={(e) => handleReactionClick(e, act.id, 'like')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition cursor-pointer ${
                          act.userInteracted?.liked 
                            ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' 
                            : 'bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600'
                        }`}
                        title="Thích bài viết"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{act.likes || 0}</span>
                      </button>

                      <button
                        onClick={(e) => handleReactionClick(e, act.id, 'heart')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition cursor-pointer ${
                          act.userInteracted?.hearted 
                            ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-300' 
                            : 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600'
                        }`}
                        title="Thả tim yêu thích"
                      >
                        <Heart className={`w-3.5 h-3.5 ${act.userInteracted?.hearted ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{act.hearts || 0}</span>
                      </button>

                      <button
                        onClick={(e) => handleReactionClick(e, act.id, 'haha')}
                        className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition cursor-pointer ${
                          act.userInteracted?.hahaed 
                            ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300' 
                            : 'bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-600'
                        }`}
                        title="Vui nhộn"
                      >
                        <Smile className="w-3.5 h-3.5" />
                        <span>{act.hahas || 0}</span>
                      </button>

                      <button
                        onClick={(e) => handleReactionClick(e, act.id, 'fire')}
                        className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition cursor-pointer ${
                          act.userInteracted?.fired 
                            ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-300' 
                            : 'bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600'
                        }`}
                        title="Nhiệt huyết"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>{act.fires || 0}</span>
                      </button>
                    </div>

                    <button
                      onClick={(e) => handleShareArticle(act, e)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                      title="Chia sẻ bài viết"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* PHOTO DETAIL MODAL */}
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden relative animate-in zoom-in-95 duration-200 my-8">
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative h-80 sm:h-96 bg-slate-900">
                <img
                  src={activeModalItem.imageUrl}
                  alt={activeModalItem.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg">
                  {activeModalItem.category}
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-500">
                  <span className="flex items-center space-x-1.5 font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl">
                    <Calendar className="w-4 h-4" />
                    <span>Ngày diễn ra: {activeModalItem.date}</span>
                  </span>
                  {activeModalItem.location && (
                    <span className="flex items-center space-x-1.5 text-slate-700">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>{activeModalItem.location}</span>
                    </span>
                  )}
                  {activeModalItem.participantsCount && (
                    <span className="flex items-center space-x-1.5 text-blue-700 font-bold">
                      <Users className="w-4 h-4" />
                      <span>{activeModalItem.participantsCount} học sinh tham gia</span>
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {activeModalItem.title}
                </h2>

                <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                    {activeModalItem.description}
                  </p>
                </div>

                {/* Reaction panel in Modal */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-600">Bày tỏ cảm xúc:</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={(e) => handleReactionClick(e, activeModalItem.id, 'like')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                          activeModalItem.userInteracted?.liked 
                            ? 'bg-blue-600 text-white shadow-xs' 
                            : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Thích ({activeModalItem.likes || 0})</span>
                      </button>

                      <button
                        onClick={(e) => handleReactionClick(e, activeModalItem.id, 'heart')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                          activeModalItem.userInteracted?.hearted 
                            ? 'bg-rose-600 text-white shadow-xs' 
                            : 'bg-white hover:bg-rose-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>Thả tim ({activeModalItem.hearts || 0})</span>
                      </button>

                      <button
                        onClick={(e) => handleReactionClick(e, activeModalItem.id, 'haha')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                          activeModalItem.userInteracted?.hahaed 
                            ? 'bg-amber-500 text-white shadow-xs' 
                            : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Smile className="w-3.5 h-3.5" />
                        <span>Vui nhộn ({activeModalItem.hahas || 0})</span>
                      </button>

                      <button
                        onClick={(e) => handleReactionClick(e, activeModalItem.id, 'fire')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                          activeModalItem.userInteracted?.fired 
                            ? 'bg-orange-500 text-white shadow-xs' 
                            : 'bg-white hover:bg-orange-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Nhiệt huyết ({activeModalItem.fires || 0})</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleShareArticle(activeModalItem, e)}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Chia sẻ bài viết</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isAdminLoggedIn && (
                    <button
                      onClick={() => handleOpenEdit(activeModalItem)}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Sửa bài & Đổi ảnh</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveModalItem(null)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm ml-auto cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDIT ACTIVITY MODAL (FOR ADMIN) */}
        {editingActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 relative animate-in zoom-in-95 duration-200 my-6">
              <button
                onClick={() => setEditingActivity(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">CHỈNH SỬA BÀI VIẾT & ẢNH HOẠT ĐỘNG</h3>
                  <p className="text-xs text-slate-500">Cập nhật hình ảnh và nội dung sự kiện (Hỗ trợ tới 10.000 từ)</p>
                </div>
              </div>

              <form onSubmit={handleSaveEditActivity} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tiêu đề hoạt động <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                {/* Photo modification */}
                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
                  <label className="block font-bold text-purple-950">
                    Hình ảnh hoạt động:
                  </label>
                  
                  {editImageUrl && (
                    <div className="relative h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={editImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] font-bold rounded">
                        Ảnh hiện tại
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="inline-flex items-center space-x-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition">
                      <ImageIcon className="w-4 h-4" />
                      <span>{isCompressingEditImage ? 'Đang nén ảnh...' : 'Tải ảnh mới từ máy tính (Tự động nén)'}</span>
                      <input
                        type="file"
                        accept="image/*,.png,.pjg,.jpg,.jpeg,.jfif,.webp,.gif"
                        onChange={handleEditImageFile}
                        className="hidden"
                        disabled={isCompressingEditImage}
                      />
                    </label>

                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1">Hoặc dán URL ảnh mới:</span>
                      <input
                        type="text"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Phân loại hoạt động
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as ActivityCategory)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      {CATEGORIES.filter((c) => c !== 'Tất cả').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Ngày tổ chức
                    </label>
                    <input
                      type="text"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Địa điểm tổ chức
                    </label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Số lượng học sinh
                    </label>
                    <input
                      type="number"
                      value={editParticipants}
                      onChange={(e) => setEditParticipants(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">
                      Mô tả chi tiết bài viết (Giới hạn tối đa 10.000 từ)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {countWords(editDescription)} / 10.000 từ ({editDescription.length} ký tự)
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Nhập nội dung chi tiết bài viết, diễn biến sự kiện, kết quả thi đua..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-sans"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingActivity(null)}
                    className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow cursor-pointer flex items-center space-x-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Thay Đổi Bài Viết</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD ACTIVITY MODAL (FOR ADMIN) */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 relative animate-in zoom-in-95 duration-200 my-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-2xl font-black text-slate-900">THÊM BÀI VIẾT HOẠT ĐỘNG MỚI</h3>
                <p className="text-xs text-slate-500">Đăng tải thông tin sự kiện & hình ảnh vào album trường (Hỗ trợ bài viết dài tới 10.000 từ)</p>
              </div>

              <form onSubmit={handleCreateActivity} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tiêu đề hoạt động <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Lễ Mít Tinh Kỷ Niệm 95 Năm Ngày Thành Lập Đoàn TNCS Hồ Chí Minh..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phân loại hoạt động <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                      {CATEGORIES.filter((c) => c !== 'Tất cả').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ngày tổ chức
                    </label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="Ví dụ: 26/03/2026"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Địa điểm tổ chức
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ví dụ: Sân trường, Hội trường lớn..."
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Số lượng học sinh tham gia
                    </label>
                    <input
                      type="number"
                      value={participantsCount}
                      onChange={(e) => setParticipantsCount(e.target.value)}
                      placeholder="Ví dụ: 800"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Mô tả chi tiết bài viết (Giới hạn tối đa 10.000 từ)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {countWords(description)} / 10.000 từ
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả chi tiết diễn biến hoạt động, không khí ngày hội, cảm nhận học sinh, kết quả đạt được..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                {/* Photo input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hình ảnh hoạt động <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      placeholder="Dán link ảnh (URL) hoặc chọn file bên dưới..."
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                    <label className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer">
                      <ImageIcon className="w-4 h-4 text-slate-500" />
                      <span>{isCompressingNewImage ? 'Đang nén ảnh...' : 'Chọn file từ máy tính'}</span>
                      <input
                        type="file"
                        accept="image/*,.png,.pjg,.jpg,.jpeg,.jfif,.webp,.gif"
                        onChange={handleImageFile}
                        className="hidden"
                        disabled={isCompressingNewImage}
                      />
                    </label>
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-28 w-full object-cover rounded-xl border border-slate-200 mt-2"
                      />
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 transition cursor-pointer text-sm"
                  >
                    LƯU BÀI VIẾT VÀO ALBUM HOẠT ĐỘNG
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
