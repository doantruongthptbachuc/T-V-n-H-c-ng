import React, { useState } from 'react';
import { 
  BookOpen, 
  Send, 
  Heart, 
  Sparkles, 
  Image as ImageIcon, 
  UserCheck, 
  UserX, 
  MessageCircle, 
  Filter, 
  Search, 
  ShieldCheck,
  CheckCircle,
  Clock,
  X,
  Share2,
  Edit3,
  Trash2,
  RotateCcw,
  Camera,
  Save,
  CheckCircle2,
  Shield,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Story, TopicType } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import { moderateText, validateImageFile } from '../lib/contentModeration';

interface StoriesSectionProps {
  stories: Story[];
  onAddStory: (story: Omit<Story, 'id' | 'code' | 'createdAt' | 'status' | 'likes' | 'hearts' | 'cheers'>) => void;
  onReact: (storyId: string, reactionType: 'like' | 'heart' | 'cheer') => void;
  isAdminLoggedIn?: boolean;
  onUpdateStory?: (storyId: string, updates: Partial<Story>) => void;
  onDeleteStory?: (storyId: string) => void;
}

const STORY_TOPICS = [
  'Tất cả',
  '🎓 Tri ân & Đậu Đại học',
  'Gia đình & Áp lực',
  'Tình bạn',
  'Tuổi học trò',
  'Học tập & Ước mơ',
  'Tình cảm tuổi mới lớn',
  'Kỹ năng & Thử thách',
  'Khác'
];

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  stories,
  onAddStory,
  onReact,
  isAdminLoggedIn = false,
  onUpdateStory,
  onDeleteStory,
}) => {
  const [selectedTopic, setSelectedTopic] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Form states for students creating new stories
  const [authorName, setAuthorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [className, setClassName] = useState('');
  const [topic, setTopic] = useState('Tuổi học trò');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Admin Editing states
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editIsAnonymous, setEditIsAnonymous] = useState(false);
  const [editClass, setEditClass] = useState('');
  const [editTopic, setEditTopic] = useState<TopicType>('Tâm lý');
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editCounselorNote, setEditCounselorNote] = useState('');
  const [editStatus, setEditStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
  const [editCreatedAt, setEditCreatedAt] = useState('');
  const [editHearts, setEditHearts] = useState(1);
  const [editCheers, setEditCheers] = useState(0);
  const [isCompressingEditImage, setIsCompressingEditImage] = useState(false);

  // Newest stories appear first at the top
  const approvedStories = [...stories]
    .filter((s) => s.status === 'approved')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredStories = approvedStories.filter((s) => {
    let matchesTopic = true;
    if (selectedTopic === '🎓 Tri ân & Đậu Đại học') {
      matchesTopic = s.topic.includes('Tri ân') || 
                     s.topic.includes('Đậu Đại học') || 
                     s.title.toLowerCase().includes('đại học') || 
                     s.title.toLowerCase().includes('đậu') ||
                     s.content.toLowerCase().includes('đại học') ||
                     s.content.toLowerCase().includes('trúng tuyển');
    } else if (selectedTopic !== 'Tất cả') {
      matchesTopic = s.topic.toLowerCase().includes(selectedTopic.toLowerCase());
    }
    
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  const handleHeartClick = (e: React.MouseEvent, storyId: string, isHearted: boolean) => {
    onReact(storyId, 'heart');
    if (!isHearted) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 22,
        spread: 50,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#e11d48'],
        scalar: 0.9,
      });
    }
  };

  const handleClapClick = (e: React.MouseEvent, storyId: string, isCheered: boolean) => {
    onReact(storyId, 'cheer');
    if (!isCheered) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 25,
        spread: 55,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#10b981'],
        scalar: 0.9,
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = await validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.reason || 'Tệp ảnh không hợp lệ hoặc bị từ chối bởi bức tường lửa.');
        e.target.value = '';
        return;
      }
      try {
        const compressed = await compressImageFile(file, 800, 600, 0.82);
        setImagePreview(compressed);
      } catch (err) {
        console.error('Error compressing story image:', err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Vui lòng điền tiêu đề và nội dung tâm sự!');
      return;
    }

    // Kiểm duyệt nội dung bài viết qua Tường lửa
    const titleMod = moderateText(title);
    if (!titleMod.isSafe) {
      alert(titleMod.reason || 'Tiêu đề tâm sự chứa từ ngữ không phù hợp với môi trường học đường!');
      return;
    }

    const contentMod = moderateText(content);
    if (!contentMod.isSafe) {
      alert(contentMod.reason || 'Nội dung tâm sự chứa từ ngữ không phù hợp hoặc nhạy cảm!');
      return;
    }

    if (!isAnonymous && authorName.trim()) {
      const nameMod = moderateText(authorName);
      if (!nameMod.isSafe) {
        alert('Tên tác giả không hợp lệ!');
        return;
      }
    }

    onAddStory({
      authorName: isAnonymous ? 'Học sinh ẩn danh' : (authorName.trim() || 'Học sinh giấu tên'),
      isAnonymous,
      className: className.trim() || 'Học sinh THPT',
      topic,
      title: titleMod.sanitizedText || title.trim(),
      content: contentMod.sanitizedText || content.trim(),
      attachedImage: imagePreview || undefined,
    });

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
    });

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setIsModalOpen(false);
      // Reset form
      setAuthorName('');
      setClassName('');
      setTitle('');
      setContent('');
      setImagePreview(null);
    }, 2800);
  };

  // Admin Quick Actions & Edit Modal handlers
  const handleOpenEditStory = (story: Story) => {
    setEditingStory(story);
    setEditTitle(story.title || '');
    setEditAuthor(story.isAnonymous ? (story.authorName || 'Học sinh ẩn danh') : (story.authorName || 'Học sinh giấu tên'));
    setEditIsAnonymous(story.isAnonymous || false);
    setEditClass(story.className || '');
    setEditTopic((story.topic as TopicType) || 'Tâm lý');
    setEditContent(story.content || '');
    setEditImage(story.attachedImage || story.imageUrl || '');
    setEditCounselorNote(story.counselorNote || '');
    setEditStatus(story.status || 'approved');
    setEditCreatedAt(story.createdAt ? story.createdAt.substring(0, 16) : new Date().toISOString().substring(0, 16));
    setEditHearts(story.hearts ?? 1);
    setEditCheers(story.cheers ?? story.likes ?? 0);
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressingEditImage(true);
      try {
        const compressed = await compressImageFile(file, 900, 700, 0.85);
        setEditImage(compressed);
      } catch (err) {
        console.error('Error compressing edit image:', err);
      } finally {
        setIsCompressingEditImage(false);
      }
    }
  };

  const handleSaveAdminEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory || !onUpdateStory) return;
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết!');
      return;
    }

    onUpdateStory(editingStory.id, {
      title: editTitle.trim(),
      authorName: editIsAnonymous ? 'Học sinh ẩn danh' : (editAuthor.trim() || 'Học sinh giấu tên'),
      isAnonymous: editIsAnonymous,
      className: editClass.trim() || undefined,
      topic: editTopic,
      content: editContent.trim(),
      attachedImage: editImage || undefined,
      imageUrl: editImage || undefined,
      counselorNote: editCounselorNote.trim() || undefined,
      status: editStatus,
      createdAt: editCreatedAt ? new Date(editCreatedAt).toISOString() : editingStory.createdAt,
      hearts: Number(editHearts) || 0,
      cheers: Number(editCheers) || 0,
      likes: Number(editCheers) || 0,
    });

    setEditingStory(null);
  };

  const handleRevertToPending = (storyId: string) => {
    if (!onUpdateStory) return;
    if (confirm('Bạn có muốn gỡ bài viết này về trạng thái Chờ Duyệt (không hiển thị công khai)?')) {
      onUpdateStory(storyId, { status: 'pending' });
    }
  };

  const handleDeleteApprovedStory = (story: Story) => {
    if (!onDeleteStory) return;
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn bài viết "${story.title}"?`)) {
      onDeleteStory(story.id);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-gradient-to-b from-amber-50/40 via-white to-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-amber-200/70 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Góc Cảm Xúc & Tâm Tình Học Trò</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              CHUYỆN MUỐN KỂ
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
              Nơi bạn có thể gửi gắm những tâm tư, kỷ niệm, áp lực hay những rung động tuổi học trò. Tất cả câu chuyện đều được lắng nghe và bảo mật tuyệt đối.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all text-sm sm:text-base cursor-pointer self-start md:self-auto"
          >
            <Send className="w-4 h-4" />
            <span>Gửi câu chuyện mới</span>
          </button>
        </div>

        {/* Admin Notification Banner when Admin is logged in */}
        {isAdminLoggedIn && (
          <div className="p-4 bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-3xl shadow-md border border-indigo-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-700/80 rounded-xl">
                <Shield className="w-5 h-5 text-indigo-200" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-indigo-100 flex items-center space-x-1.5">
                  <span>QUẢN TRỊ VIÊN: TOÀN QUYỀN DUYỆT & CHỈNH SỬA BÀI VIẾT, HÌNH ẢNH</span>
                </p>
                <p className="text-[11px] text-indigo-200/90">
                  Thầy Cô có thể chỉnh sửa nội dung, thay ảnh học sinh gửi lên, thêm lời khuyên hoặc gỡ bài viết đã duyệt bất kỳ lúc nào.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold bg-indigo-700/80 px-3 py-1 rounded-full text-indigo-100 border border-indigo-500/50 shrink-0">
              Đang có {approvedStories.length} bài đã xuất bản
            </span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Topics Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            {STORY_TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedTopic === t
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm tâm sự..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <BookOpen className="w-12 h-12 text-amber-300 mx-auto" />
            <p className="text-lg font-bold text-slate-700">Chưa có câu chuyện nào trong chủ đề này</p>
            <p className="text-sm text-slate-500">Hãy là người đầu tiên chia sẻ tâm sự của bạn!</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-sm"
            >
              <Send className="w-4 h-4" />
              <span>Gửi câu chuyện ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story, index) => {
              const isNewlyAdded = index < 2;
              return (
                <div
                  key={story.id}
                  className="bg-white rounded-3xl border border-amber-100 hover:border-amber-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group relative"
                >
                  <div>
                    {/* Attached Image (if any) */}
                    {(story.attachedImage || story.imageUrl) && (
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img
                          src={story.attachedImage || story.imageUrl}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-slate-900/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                          {story.code}
                        </div>
                        {isNewlyAdded && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center space-x-1 animate-pulse">
                            <Sparkles className="w-3 h-3" />
                            <span>MỚI ĐĂNG</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-6 space-y-4">
                      {/* Header Info */}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center space-x-1.5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-800">
                            {story.topic}
                          </span>
                          {!story.attachedImage && !story.imageUrl && isNewlyAdded && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 animate-pulse">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>MỚI</span>
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(story.createdAt).toLocaleDateString('vi-VN')}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-amber-600 transition-colors">
                        {story.title}
                      </h3>

                      {/* Content */}
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line line-clamp-6">
                        {story.content}
                      </p>

                      {/* Counselor Advice Box (if any) */}
                      {story.counselorNote && (
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 space-y-1.5">
                          <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-700">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            <span>Lời nhắn từ Phòng Tư vấn:</span>
                          </div>
                          <p className="text-xs text-indigo-900 italic leading-relaxed">
                            "{story.counselorNote}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Author & Reactions */}
                  <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 text-xs text-slate-600">
                      <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs">
                        {story.isAnonymous ? 'Ẩn' : story.authorName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 truncate max-w-[120px]">
                          {story.isAnonymous ? 'Học sinh ẩn danh' : story.authorName}
                        </p>
                        <p className="text-[10px] text-slate-400">Lớp {story.className}</p>
                      </div>
                    </div>

                    {/* Reaction Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleHeartClick(e, story.id, !!story.userInteracted?.hearted)}
                        className={`inline-flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${
                          story.userInteracted?.hearted
                            ? 'bg-rose-500 text-white font-black shadow-rose-500/30'
                            : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200'
                        }`}
                        title="Thả tim yêu thương & thấu hiểu"
                      >
                        <Heart className={`w-3.5 h-3.5 transition-transform ${story.userInteracted?.hearted ? 'fill-white text-white scale-110' : 'text-rose-500'}`} />
                        <span>{story.hearts || 0}</span>
                      </button>

                      <button
                        onClick={(e) => handleClapClick(e, story.id, !!(story.userInteracted?.cheered || story.userInteracted?.liked))}
                        className={`inline-flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${
                          story.userInteracted?.cheered || story.userInteracted?.liked
                            ? 'bg-amber-500 text-white font-black shadow-amber-500/30'
                            : 'bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 hover:border-amber-200'
                        }`}
                        title="Vỗ tay tán thưởng & đồng cảm"
                      >
                        <span className="text-sm">👏</span>
                        <span>{story.cheers || story.likes || 0}</span>
                      </button>
                    </div>
                  </div>

                  {/* Admin Quick Action Toolbar on each card */}
                  {isAdminLoggedIn && (
                    <div className="px-5 py-2.5 bg-indigo-950 text-white border-t border-indigo-900 flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-indigo-300 flex items-center space-x-1 text-[11px]">
                        <Shield className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Admin ({story.code})</span>
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEditStory(story)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center space-x-1 text-[11px] transition cursor-pointer"
                          title="Chỉnh sửa nội dung, thông tin & hình ảnh bài viết này"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Sửa bài & ảnh</span>
                        </button>
                        <button
                          onClick={() => handleRevertToPending(story.id)}
                          className="p-1 bg-amber-600/80 hover:bg-amber-600 text-white rounded-lg transition cursor-pointer"
                          title="Gỡ bài về trạng thái Chờ duyệt"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteApprovedStory(story)}
                          className="p-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg transition cursor-pointer"
                          title="Xóa vĩnh viễn bài viết"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ADMIN STORY EDIT MODAL */}
        {editingStory && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-slate-100 shadow-2xl space-y-5 my-8 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-black text-lg text-slate-900 flex items-center space-x-2">
                    <Edit3 className="w-5 h-5 text-indigo-600" />
                    <span>CHỈNH SỬA NỘI DUNG & HÌNH ẢNH CÂU CHUYỆN (ADMIN)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mã bài viết: <span className="font-mono font-bold text-slate-700">{editingStory.code}</span>
                  </p>
                </div>
                <button
                  onClick={() => setEditingStory(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAdminEdit} className="space-y-4 text-xs sm:text-sm max-h-[75vh] overflow-y-auto pr-1">
                {/* Title */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Tiêu đề câu chuyện: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Nhập tiêu đề ý nghĩa..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Author, Class, Anonymous toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tác giả / Học sinh:</label>
                    <input
                      type="text"
                      value={editAuthor}
                      onChange={(e) => setEditAuthor(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn An"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Lớp:</label>
                    <input
                      type="text"
                      value={editClass}
                      onChange={(e) => setEditClass(e.target.value)}
                      placeholder="Ví dụ: 12A1"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Chế độ hiển thị tên:</label>
                    <button
                      type="button"
                      onClick={() => setEditIsAnonymous(!editIsAnonymous)}
                      className={`w-full py-2 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition text-xs cursor-pointer ${
                        editIsAnonymous
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                    >
                      {editIsAnonymous ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      <span>{editIsAnonymous ? 'Đang ẨN DANH' : 'Hiện tên thật'}</span>
                    </button>
                  </div>
                </div>

                {/* Topic, Status, Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Chủ đề:</label>
                    <select
                      value={editTopic}
                      onChange={(e) => setEditTopic(e.target.value as TopicType)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                    >
                      {STORY_TOPICS.filter((t) => t !== 'Tất cả').map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Trạng thái xuất bản:</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as 'pending' | 'approved' | 'rejected')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-indigo-900 text-xs"
                    >
                      <option value="approved">✅ ĐÃ DUYỆT (Hiển thị)</option>
                      <option value="pending">⏳ CHỜ DUYỆT (Tạm ẩn)</option>
                      <option value="rejected">❌ TỪ CHỐI / ĐÃ ẨN</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">Ngày & giờ đăng:</label>
                    <input
                      type="datetime-local"
                      value={editCreatedAt}
                      onChange={(e) => setEditCreatedAt(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Nội dung câu chuyện: <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Chỉnh sửa nội dung bài viết..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 leading-relaxed focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Attached Image / Image upload & edit */}
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-indigo-900 flex items-center space-x-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                      <span>Hình ảnh đính kèm câu chuyện</span>
                    </label>
                    {editImage && (
                      <button
                        type="button"
                        onClick={() => setEditImage('')}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa ảnh đính kèm</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="inline-flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs cursor-pointer shadow-xs transition">
                        <Camera className="w-4 h-4 text-indigo-600" />
                        <span>{isCompressingEditImage ? 'Đang xử lý ảnh...' : 'Tải ảnh mới từ máy'}</span>
                        <input
                          type="file"
                          accept="image/*,.png,.pjg,.jpg,.jpeg,.jfif,.webp,.gif"
                          onChange={handleEditImageUpload}
                          disabled={isCompressingEditImage}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Tự động nén ảnh chất lượng cao để tải nhanh
                      </p>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        placeholder="Hoặc dán liên kết URL ảnh..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                      />
                    </div>
                  </div>

                  {editImage && (
                    <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-100 flex items-center justify-center">
                      <img
                        src={editImage}
                        alt="Preview"
                        className="max-h-48 w-auto object-contain"
                      />
                      <span className="absolute bottom-2 right-2 bg-slate-900/70 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                        Ảnh xem trước
                      </span>
                    </div>
                  )}
                </div>

                {/* Counselor Note (Lời nhắn từ Phòng Tư vấn) */}
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                  <label className="font-bold text-amber-900 flex items-center space-x-1.5 text-xs">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>Lời nhắn gửi / Lời khuyên từ Phòng Tư Vấn (Sẽ xuất hiện nổi bật dưới bài viết):</span>
                  </label>
                  <textarea
                    rows={2}
                    value={editCounselorNote}
                    onChange={(e) => setEditCounselorNote(e.target.value)}
                    placeholder="Ví dụ: Thầy Cô luôn bên em, đừng ngại ghé phòng tư vấn để cùng trò chuyện nhé..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-amber-200 bg-white"
                  />
                </div>

                {/* Hearts & Cheers Adjustments */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">Số lượt Thả tim (❤️):</label>
                    <input
                      type="number"
                      min={0}
                      value={editHearts}
                      onChange={(e) => setEditHearts(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">Số lượt Vỗ tay (👏):</label>
                    <input
                      type="number"
                      min={0}
                      value={editCheers}
                      onChange={(e) => setEditCheers(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingStory(null)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition text-xs cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5 text-xs cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>LƯU THAY ĐỔI BÀI VIẾT</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUBMISSION MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 duration-200">
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {formSubmitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">GỬI CÂU CHUYỆN THÀNH CÔNG!</h3>
                  <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                    Cảm ơn bạn đã tin tưởng và trải lòng. Câu chuyện của bạn đã được gửi đến Ban Cố vấn & Quản trị viên để duyệt nội dung. Sau khi được duyệt, bài viết sẽ xuất hiện ở đầu trang để mọi người cùng đón đọc, thả tim và vỗ tay cổ vũ!
                  </p>
                  <div className="p-3 bg-amber-50 text-amber-800 rounded-2xl text-xs font-semibold">
                    🔒 Thông tin cá nhân của bạn luôn được cam kết bảo mật 100%.
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs uppercase">
                      <BookOpen className="w-4 h-4" />
                      <span>Không Gian Trải Lòng THPT</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">
                      GỬI CÂU CHUYỆN MUỐN KỂ
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Hãy chia sẻ chân thành những suy nghĩ, cảm xúc hoặc câu chuyện học đường của bạn nhé!
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Anonymous toggle & Name */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Chế độ gửi:</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsAnonymous(!isAnonymous)}
                          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                            isAnonymous
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-700 border border-slate-300'
                          }`}
                        >
                          {isAnonymous ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          <span>{isAnonymous ? 'Đang bật ẨN DANH' : 'Công khai tên'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Họ và tên {isAnonymous && '(Tuỳ chọn, sẽ được ẩn danh)'}
                          </label>
                          <input
                            type="text"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder={isAnonymous ? "Học sinh ẩn danh" : "Ví dụ: Nguyễn Văn An"}
                            disabled={isAnonymous}
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Lớp học <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            placeholder="Ví dụ: 11A2, 10 Chuyên Văn..."
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Topic */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Chủ đề tâm sự <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      >
                        {STORY_TOPICS.filter((t) => t !== 'Tất cả').map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tiêu đề câu chuyện <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Đặt một tựa đề ý nghĩa cho câu chuyện của bạn..."
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nội dung muốn chia sẻ <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Hãy viết ra tất cả những gì bạn đang cảm thấy. Không có đúng hay sai, chỉ có sự chân thành..."
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
                      />
                    </div>

                    {/* Image Attachment */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Đính kèm hình ảnh kỷ niệm (Tuỳ chọn)
                      </label>
                      <div className="flex items-center space-x-3">
                        <label className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition">
                          <ImageIcon className="w-4 h-4 text-slate-500" />
                          <span>Chọn ảnh từ máy</span>
                          <input
                            type="file"
                            accept="image/*,.png,.pjg,.jpg,.jpeg,.jfif,.webp,.gif"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {imagePreview && (
                          <div className="flex items-center space-x-2">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => setImagePreview(null)}
                              className="text-xs text-rose-600 hover:underline"
                            >
                              Xóa ảnh
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/25 transition cursor-pointer text-sm sm:text-base flex items-center justify-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>GỬI CÂU CHUYỆN</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
