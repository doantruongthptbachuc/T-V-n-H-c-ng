import React from 'react';
import { MessageSquare, CheckCircle2, Clock, BookHeart, Users, Sparkles, Flag, Award } from 'lucide-react';
import { Question, Story, YouthRegistration } from '../types';

interface StatsSectionProps {
  questions: Question[];
  stories: Story[];
  registrations: YouthRegistration[];
  volunteerCount?: number;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  questions,
  stories,
  registrations,
  volunteerCount = 0,
}) => {
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter((q) => q.status === 'answered').length;
  const pendingQuestions = questions.filter((q) => q.status === 'pending').length;
  const approvedStories = stories.filter((s) => s.status === 'approved').length;
  const youthRegistrationsCount = registrations.length;
  const approvedRegistrationsCount = registrations.filter((r) => r.status === 'accepted' || r.status === 'assigned').length;

  const stats = [
    {
      id: 'stat-total',
      label: 'Tổng số câu hỏi',
      value: totalQuestions,
      unit: 'câu hỏi',
      description: 'Gửi về từ học sinh',
      icon: MessageSquare,
      gradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      id: 'stat-answered',
      label: 'Đã trả lời',
      value: answeredQuestions,
      unit: 'câu trả lời',
      description: 'Chuyên gia & Thầy cô phản hồi',
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    },
    {
      id: 'stat-stories',
      label: 'Chuyện muốn kể',
      value: approvedStories,
      unit: 'tâm sự',
      description: 'Được chia sẻ & lan tỏa',
      icon: BookHeart,
      gradient: 'from-pink-500 to-rose-600',
      bgLight: 'bg-pink-50',
      textColor: 'text-pink-600',
      borderColor: 'border-pink-200',
    },
    {
      id: 'stat-youth',
      label: 'Hồ sơ đăng ký Đoàn',
      value: youthRegistrationsCount,
      unit: 'học sinh',
      description: `${approvedRegistrationsCount} đã duyệt gia nhập`,
      icon: Flag,
      gradient: 'from-red-500 to-rose-600',
      bgLight: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <section className="py-10 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 border-y border-indigo-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                THỐNG KÊ HOẠT ĐỘNG TƯ VẤN & PHONG TRÀO ĐOÀN
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Dữ liệu tương tác thực tế giữa học sinh THPT, Tổ Tư vấn Học đường & Đội Tình nguyện Đoàn trường
            </p>
          </div>

          <div className="inline-flex items-center space-x-2 text-xs font-semibold px-3.5 py-1.5 bg-white shadow-xs text-slate-700 border border-slate-200 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cập nhật theo thời gian thực</span>
          </div>
        </div>

        {/* 4 Stat Boxes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-white border ${item.borderColor} shadow-sm hover:shadow-md transition-all duration-300 group`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-2xl ${item.bgLight} ${item.textColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {item.unit}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-semibold text-slate-600">
                    {item.label}
                  </p>
                  <p className={`text-3xl sm:text-4xl font-black tracking-tight ${item.textColor}`}>
                    {item.value}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                    {item.description}
                  </p>
                </div>

                {/* Bottom subtle gradient line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient}`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
