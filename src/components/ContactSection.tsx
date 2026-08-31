import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  HeartHandshake, 
  Users, 
  MessageSquare,
  Facebook,
  UserCheck
} from 'lucide-react';
import { SchoolConfig, Counselor } from '../types';
import { initialCounselors } from '../data/initialData';
import { moderateText } from '../lib/contentModeration';

interface ContactSectionProps {
  config: SchoolConfig;
  counselors?: Counselor[];
  onSendMessage: (msg: { name: string; phone: string; email: string; message: string }) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ 
  config, 
  counselors = initialCounselors,
  onSendMessage 
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const activeCounselors = counselors.length > 0 ? counselors : initialCounselors;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Nội dung liên hệ!');
      return;
    }

    const nameMod = moderateText(name);
    if (!nameMod.isSafe) {
      alert(nameMod.reason || 'Họ tên chứa từ ngữ không phù hợp!');
      return;
    }

    const msgMod = moderateText(message);
    if (!msgMod.isSafe) {
      alert(msgMod.reason || 'Nội dung liên hệ chứa từ ngữ nhạy cảm hoặc không phù hợp!');
      return;
    }

    onSendMessage({
      name: nameMod.sanitizedText || name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      message: msgMod.sanitizedText || message.trim(),
    });

    setSubmitted(true);
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="py-8 sm:py-12 bg-gradient-to-b from-blue-50/50 via-slate-50 to-indigo-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-black uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4 text-blue-600" />
            <span>KẾT NỐI & TƯ VẤN TRỰC TIẾP</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            LIÊN HỆ PHÒNG TƯ VẤN & ĐOÀN TRƯỜNG
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Thầy cô và Ban Chấp Hành Đoàn Trường luôn mở rộng cánh cửa chào đón mọi học sinh đến trao đổi, chia sẻ và tìm kiếm giải pháp cho những khó khăn học đường.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Contact Details & Advisors */}
          <div className="lg:col-span-5 space-y-6">
            {/* Main Info Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center space-x-2 border-b border-slate-100 pb-3">
                <MapPin className="w-5 h-5 text-rose-500" />
                <span>THÔNG TIN TIẾP NHẬN</span>
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start space-x-3.5 p-3.5 bg-slate-50 rounded-2xl">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-xl shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Địa điểm văn phòng:</p>
                    <p className="text-slate-600 leading-relaxed mt-0.5 font-medium">{config.consultingRoom}</p>
                    <p className="text-slate-400 text-xs mt-1">{config.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-3.5 bg-slate-50 rounded-2xl">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Đường dây nóng (Hotline 24/7):</p>
                    <a href={`tel:${config.hotline.replace(/\s+/g, '')}`} className="text-base font-extrabold text-blue-700 hover:underline">
                      {config.hotline}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-3.5 bg-slate-50 rounded-2xl">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Hòm thư điện tử:</p>
                    <a href={`mailto:${config.email}`} className="text-blue-700 font-semibold hover:underline">
                      {config.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-3.5 bg-slate-50 rounded-2xl">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Lịch làm việc trực tiếp:</p>
                    <p className="text-slate-600">{config.workingHours}</p>
                  </div>
                </div>

                {config.facebookUrl && (
                  <div className="flex items-start space-x-3.5 p-3.5 bg-sky-50 rounded-2xl">
                    <div className="p-2 bg-sky-100 text-sky-600 rounded-xl shrink-0 mt-0.5">
                      <Facebook className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Trang Facebook Đoàn trường:</p>
                      <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-sky-700 font-semibold hover:underline text-xs">
                        Facebook Đoàn Trường THPT Ba Chúc
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Teachers in Charge Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-3xl p-6 sm:p-7 shadow-md space-y-4">
              <h4 className="text-base font-black text-yellow-300 uppercase tracking-tight flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>THẦY CÔ PHỤ TRÁCH TIẾP NHẬN</span>
              </h4>
              <ul className="space-y-3 text-xs text-blue-100">
                {activeCounselors.map((c) => (
                  <li key={c.id} className="p-2.5 bg-white/10 rounded-2xl flex items-center justify-between gap-3 hover:bg-white/15 transition">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white/40 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="truncate">
                        <p className="font-bold text-white truncate">{c.name}</p>
                        <p className="text-[10px] text-blue-200 truncate">{c.phone || config.hotline}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-yellow-400 text-slate-950 font-bold rounded-lg text-[10px] shrink-0 whitespace-nowrap">
                      {c.role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Contact & Appointment Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span>GỬI THÔNG ĐIỆP HOẶC HẸN LỊCH TƯ VẤN</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Điền thông tin bên dưới nếu bạn muốn hẹn gặp trực tiếp hoặc gửi thông điệp riêng tới thầy cô.
              </p>
            </div>

            {submitted && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-xs sm:text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Đã gửi thông điệp thành công!</p>
                  <p className="text-emerald-700 text-xs">Thầy cô sẽ liên hệ lại với bạn trong thời gian sớm nhất qua số điện thoại hoặc email.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Họ và tên học sinh / Phụ huynh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Số điện thoại liên hệ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Địa chỉ Email (Không bắt buộc)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hocsinh@thptbachuc.edu.vn"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Nội dung muốn liên hệ / Thời gian mong muốn gặp <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mô tả tóm tắt nội dung bạn muốn tư vấn hoặc đề xuất thời gian hẹn gặp thầy cô tại Phòng Đoàn trường..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center space-x-2 text-[11px] text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mọi thông tin liên hệ và nội dung trao đổi đều được bảo mật 100% theo quy chuẩn tư vấn học đường.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Gửi Tin Nhắn / Đặt Lịch Hẹn Ngay</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
