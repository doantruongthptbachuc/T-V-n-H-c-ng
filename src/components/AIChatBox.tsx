import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  PhoneCall, 
  ShieldAlert, 
  RefreshCw, 
  Trash2, 
  User, 
  Maximize2, 
  Minimize2, 
  Clock,
  Filter,
  Calendar,
  Tag,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Info
} from 'lucide-react';
import { ChatMessage, SchoolConfig, AIPromptQuestion, AIChatLog, TopicType } from '../types';
import { moderateText } from '../lib/contentModeration';

interface AIChatBoxProps {
  config: SchoolConfig;
  prompts?: AIPromptQuestion[];
  onOpenEmergency: () => void;
  onLogChat?: (log: Omit<AIChatLog, 'id' | 'timestamp'>) => void;
}

const DEFAULT_PROMPTS: AIPromptQuestion[] = [
  {
    id: 'def-1',
    promptText: 'Em học nhiều nhưng điểm vẫn thấp, em nên làm gì?',
    category: 'Học tập',
    timePeriod: 'Toàn thời gian',
    isActive: true,
    order: 1,
  },
  {
    id: 'def-2',
    promptText: 'Có nên yêu khi còn học THPT và làm sao để không ảnh hưởng việc học?',
    category: 'Tâm lý',
    timePeriod: 'Toàn thời gian',
    isActive: true,
    order: 2,
  },
  {
    id: 'def-3',
    promptText: 'Làm thế nào để biết ngành nghề nào phù hợp với bản thân?',
    category: 'Hướng nghiệp',
    timePeriod: 'Mùa tuyển sinh & hướng nghiệp',
    isActive: true,
    order: 3,
  },
  {
    id: 'def-4',
    promptText: 'Nên chọn ngành theo sở thích hay theo cơ hội việc làm?',
    category: 'Hướng nghiệp',
    timePeriod: 'Mùa tuyển sinh & hướng nghiệp',
    isActive: true,
    order: 4,
  },
  {
    id: 'def-5',
    promptText: 'Làm thế nào để lập kế hoạch ôn thi tốt nghiệp THPT hiệu quả?',
    category: 'Học tập',
    timePeriod: 'Mùa thi học kỳ & TN THPT',
    isActive: true,
    order: 5,
  },
  {
    id: 'def-6',
    promptText: 'Làm thế nào để sử dụng AI và mạng xã hội an toàn, hiệu quả cho việc học?',
    category: 'Kỹ năng sống',
    timePeriod: 'Toàn thời gian',
    isActive: true,
    order: 6,
  },
  {
    id: 'def-7',
    promptText: 'Em đang bị bạo lực hoặc đe dọa, em có thể tìm sự giúp đỡ ở đâu?',
    category: 'Tâm lý',
    timePeriod: 'Hỗ trợ khẩn cấp',
    isActive: true,
    order: 7,
  }
];

export const AIChatBox: React.FC<AIChatBoxProps> = ({ 
  config, 
  prompts = DEFAULT_PROMPTS, 
  onOpenEmergency,
  onLogChat
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Xin chào bạn! Mình là **Trợ lý AI Tư vấn Học đường** của ${config.schoolName}. 🌟\n\nMình luôn ở đây 24/7 để lắng nghe, chia sẻ và đồng hành cùng bạn về:\n- 📚 **Phương pháp học tập & giảm áp lực thi cử**\n- 🧭 **Định hướng chọn ngành, chọn nghề tương lai**\n- 💬 **Tâm lý tuổi học trò, cảm xúc & sự tự tin**\n- 👫 **Mối quan hệ bạn bè, thầy cô, gia đình**\n- 🚩 **Hoạt động Đoàn trường & các Câu lạc bộ thanh niên**\n\nBạn có thể chọn nhanh các câu hỏi gợi ý bên dưới theo từng khoảng thời gian học đường hoặc nhập trực tiếp băn khoăn của mình nhé!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Tất cả');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Determine active prompts
  const activePrompts = prompts.filter(p => p.isActive);

  // Available unique periods
  const timePeriods = ['Tất cả', ...Array.from(new Set(activePrompts.map(p => p.timePeriod).filter(Boolean)))];

  // Filtered prompt list
  const filteredPrompts = activePrompts.filter(p => {
    const matchPeriod = selectedPeriod === 'Tất cả' || p.timePeriod === selectedPeriod;
    const matchCat = selectedCategory === 'Tất cả' || p.category === selectedCategory;
    return matchPeriod && matchCat;
  });

  // Guess topic for logging
  const guessTopic = (text: string): TopicType => {
    const t = text.toLowerCase();
    if (t.includes('học') || t.includes('thi') || t.includes('điểm') || t.includes('môn') || t.includes('bài tập')) return 'Học tập';
    if (t.includes('ngành') || t.includes('nghề') || t.includes('đại học') || t.includes('trường') || t.includes('tuyển sinh')) return 'Hướng nghiệp';
    if (t.includes('bạn') || t.includes('tình bạn') || t.includes('tẩy chay') || t.includes('lớp')) return 'Bạn bè';
    if (t.includes('bố') || t.includes('mẹ') || t.includes('gia đình') || t.includes('ba mẹ') || t.includes('cha mẹ')) return 'Gia đình';
    if (t.includes('đoàn') || t.includes('clb') || t.includes('tình nguyện') || t.includes('hoa phượng đỏ')) return 'Hoạt động Đoàn';
    if (t.includes('buồn') || t.includes('khóc') || t.includes('áp lực') || t.includes('tâm lý') || t.includes('lo lắng') || t.includes('stress')) return 'Tâm lý';
    if (t.includes('kỹ năng') || t.includes('thời gian') || t.includes('giao tiếp')) return 'Kỹ năng sống';
    return 'Khác';
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    // Kiểm tra Bức tường lửa an toàn nội dung
    const modResult = moderateText(text);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Nếu phát hiện nội dung đồi trụy, độc hại, cờ bạc, hoặc mã tấn công
    if (!modResult.isSafe && !modResult.isEmergency) {
      const blockedReply = `🛡️ **BỨC TƯỜNG LỬA BẢO VỆ HỌC ĐƯỜNG:**\n\n${modResult.reason}\n\n*Hệ thống Trợ lý AI Tư vấn Học đường Trường THPT Ba Chúc luôn hướng đến môi trường trao đổi văn minh, an toàn, hỗ trợ học tập và phát triển lành mạnh cho học sinh.*`;
      
      const aiBlockedMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: blockedReply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiBlockedMsg]);
      return;
    }

    setIsLoading(true);

    try {
      // Build history for context
      const history = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          knowledgeBase: prompts.filter(p => p.isActive).map(p => ({
            question: p.promptText,
            promptText: p.promptText,
            answer: p.answer || '',
            category: p.category,
            timePeriod: p.timePeriod,
          })),
        }),
      });

      const data = await res.json();
      const replyContent = data.reply || 'Xin lỗi, hiện tại hệ thống đang bận. Bạn vui lòng thử lại sau ít phút nhé!';
      const isEmerg = !!data.isEmergency;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isEmergency: isEmerg,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Automatically store/log this chat query for Admin analytics & record keeping
      if (onLogChat) {
        onLogChat({
          userQuestion: text,
          aiResponse: replyContent,
          topicCategory: guessTopic(text),
          isEmergency: isEmerg,
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackReply = `Cảm ơn bạn đã chia sẻ. Do đường truyền mạng tạm thời gián đoạn, nếu bạn đang gặp băn khoăn cần giải đáp gấp, bạn có thể gọi trực tiếp Hotline hỗ trợ trường: **${config.hotline}** hoặc đến **${config.consultingRoom}** nhé! 💙`;
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);

      if (onLogChat) {
        onLogChat({
          userQuestion: text,
          aiResponse: fallbackReply,
          topicCategory: guessTopic(text),
          isEmergency: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Bạn có muốn xóa toàn bộ đoạn hội thoại này và bắt đầu lại không?')) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: 'Cuộc trò chuyện đã được làm mới. Hãy chia sẻ bất cứ điều gì bạn đang băn khoăn nhé! 😊',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-gradient-to-b from-purple-50/50 via-indigo-50/30 to-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header Title Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 text-purple-800 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-xs">
            <Bot className="w-4 h-4 text-purple-600 animate-pulse" />
            <span>HỎI ĐÁP VỚI CHAT AI TƯ VẤN HỌC ĐƯỜNG 24/7</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            TRỢ LÝ THÔNG MINH ĐỒNG HÀNH CÙNG HỌC SINH
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Hệ thống AI phản hồi tức thì các băn khoăn về học tập, tâm lý tuổi học trò, định hướng chọn ngành nghề và các hoạt động phong trào Đoàn trường.
          </p>
        </div>

        {/* Emergency Alert Protocol Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-red-500 p-0.5 rounded-2xl shadow-md">
          <div className="bg-white rounded-[14px] p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-xs sm:text-sm">
              <div className="p-2 bg-red-100 text-red-600 rounded-xl shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <p className="text-slate-700">
                <strong className="text-red-600">Lưu ý an toàn:</strong> Khi gặp khủng hoảng tâm lý nghiêm trọng, hãy liên hệ ngay <strong className="text-slate-900">Hotline: {config.hotline}</strong> (Phòng Đoàn Trường THPT Ba Chúc) hoặc Tổng đài Quốc gia <strong className="text-slate-900">111</strong>.
              </p>
            </div>
            <button
              onClick={onOpenEmergency}
              className="shrink-0 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Xem Kênh Khẩn Cấp
            </button>
          </div>
        </div>

        {/* Main Chat Card */}
        <div className={`bg-white rounded-3xl border border-purple-200 shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${
          isExpanded ? 'h-[780px]' : 'h-[620px]'
        }`}>
          {/* Chat Window Top Bar */}
          <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white px-5 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-yellow-300 shadow-xs">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-purple-700 rounded-full" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-sm sm:text-base">Trợ Lý AI Tư Vấn Học Đường</h3>
                  <span className="px-2 py-0.5 bg-white/20 text-yellow-200 text-[10px] font-bold rounded-full">
                    TRỰC TUYẾN 24/7
                  </span>
                </div>
                <p className="text-[11px] text-purple-100 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping inline-block" />
                  <span>{config.schoolName} – Thấu hiểu & Bảo mật thông tin</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:bg-white/15 rounded-xl text-white/90 hover:text-white transition cursor-pointer"
                title={isExpanded ? 'Thu nhỏ' : 'Mở rộng khung chat'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={handleClearChat}
                className="p-2 hover:bg-white/15 rounded-xl text-white/90 hover:text-white transition cursor-pointer"
                title="Làm mới cuộc trò chuyện"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Time Period & Category Filters for Suggested Prompts */}
          <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none">
              <span className="text-slate-500 font-bold flex items-center space-x-1 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Giai đoạn:</span>
              </span>
              {timePeriods.map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedPeriod === period
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              ✨ Câu hỏi do Quản trị viên cập nhật theo mốc thời gian
            </span>
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isAI = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
                >
                  {isAI && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[88%] sm:max-w-[78%] rounded-3xl p-4 sm:p-5 shadow-xs space-y-1.5 ${
                    isAI
                      ? msg.isEmergency
                        ? 'bg-rose-50 border-2 border-red-400 text-slate-900'
                        : 'bg-white border border-slate-200 text-slate-800'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium'
                  }`}>
                    <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                      {msg.content}
                    </div>

                    <div className={`flex items-center justify-between text-[10px] pt-1 border-t ${
                      isAI ? 'border-slate-100 text-slate-400' : 'border-blue-500/30 text-blue-100'
                    }`}>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{msg.timestamp}</span>
                      </div>
                      {isAI && msg.id !== 'welcome-msg' && (
                        <span className="text-[10px] text-slate-400 italic">
                          Tư vấn học đường THPT Ba Chúc
                        </span>
                      )}
                    </div>
                  </div>

                  {!isAI && (
                    <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4 animate-spin-slow" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xs flex items-center space-x-2 text-xs text-slate-500">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 font-semibold text-purple-700">AI đang suy nghĩ và chuẩn bị câu trả lời phù hợp nhất...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic Suggested Prompts (Configured by Admin by Time Period) */}
          <div className="px-4 py-2.5 bg-white border-t border-slate-100 overflow-x-auto flex items-center space-x-2 scrollbar-none">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider shrink-0 flex items-center space-x-1 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Gợi ý ({filteredPrompts.length}):</span>
            </span>

            {filteredPrompts.length === 0 ? (
              <span className="text-xs text-slate-400 italic">Không có câu hỏi gợi ý cho bộ lọc này.</span>
            ) : (
              filteredPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleSendMessage(prompt.promptText)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-purple-50/80 hover:bg-purple-100 text-purple-800 text-xs font-medium rounded-full whitespace-nowrap border border-purple-200/70 hover:border-purple-300 transition cursor-pointer disabled:opacity-50 flex items-center space-x-1.5 shadow-2xs"
                  title={`Chủ đề: ${prompt.category} | Thời gian: ${prompt.timePeriod}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>{prompt.promptText}</span>
                </button>
              ))
            )}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi băn khoăn của bạn (học tập, chọn ngành, bạn bè, tâm lý, Đoàn trường...)"
                disabled={isLoading}
                className="flex-1 px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 disabled:bg-slate-100"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                title="Gửi câu hỏi"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
              <span>Nhấn <strong>Enter</strong> để gửi tin nhắn.</span>
              <span className="flex items-center space-x-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bảo mật 100% – Mọi câu hỏi lưu trữ nội bộ an toàn</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
