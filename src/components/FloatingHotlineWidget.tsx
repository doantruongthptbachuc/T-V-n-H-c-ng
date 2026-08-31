import React, { useState } from 'react';
import { Phone, PhoneCall, Clock, ShieldAlert, X, HeartHandshake, ChevronUp } from 'lucide-react';
import { SchoolConfig } from '../types';
import { getHotlineDisplay, isHotlineActive } from '../utils/hotlineHelper';

interface FloatingHotlineWidgetProps {
  config?: SchoolConfig;
  hotline?: string;
  onOpenEmergency: () => void;
  onOpenAIChat?: () => void;
}

export const FloatingHotlineWidget: React.FC<FloatingHotlineWidgetProps> = ({
  config,
  hotline,
  onOpenEmergency,
  onOpenAIChat,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const activeHotline = hotline || config?.hotline || '0789 620 212';
  const schoolName = config?.schoolName || 'TRƯỜNG THPT BA CHÚC';
  const cleanPhone = activeHotline.replace(/\s+/g, '');
  const isAvailable = isHotlineActive();

  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start select-none">
      {/* Expanded Quick Contact Card */}
      {isExpanded && (
        <div className="mb-3 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-3xl shadow-2xl border border-amber-400/40 w-72 sm:w-80 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-amber-400 text-slate-950 rounded-xl font-bold">
                <PhoneCall className="w-4 h-4 animate-bounce" />
              </span>
              <div>
                <h4 className="text-xs font-black text-amber-300 uppercase">HOTLINE TƯ VẤN HỌC ĐƯỜNG</h4>
                <p className="text-[10px] text-slate-300 font-semibold">{schoolName}</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              aria-label="Đóng bảng hotline"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Primary Phone Button */}
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black rounded-2xl shadow-lg transition transform hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-slate-900">Bấm để gọi trực tiếp:</div>
                  <div className="text-sm font-black tracking-wider">{activeHotline}</div>
                </div>
              </div>
              <span className="text-[11px] px-2 py-0.5 bg-slate-950 text-amber-300 rounded-lg font-black">
                GỌI NGAY
              </span>
            </a>

            {/* AI Chat Shortcut if provided */}
            {onOpenAIChat && (
              <button
                onClick={() => {
                  setIsExpanded(false);
                  onOpenAIChat();
                }}
                className="w-full py-2.5 bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 border border-purple-400/30 transition cursor-pointer"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-purple-300" />
                <span>Trò chuyện trực tuyến cùng Chat AI 24/7</span>
              </button>
            )}

            {/* Status note */}
            <div className="p-2 bg-slate-800/80 rounded-xl text-[11px] text-slate-300 flex items-center space-x-2 border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Thời gian trực điện thoại: <strong>07:00 - 17:00</strong> (Các ngày học).
              </span>
            </div>

            {/* Direct Emergency Link */}
            <button
              onClick={() => {
                setIsExpanded(false);
                onOpenEmergency();
              }}
              className="w-full py-2 bg-red-600/30 hover:bg-red-600/50 text-red-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 border border-red-500/30 transition cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Kênh Trợ Giúp Khẩn Cấp 24/7 (SOS)</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex items-center space-x-2.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 hover:from-slate-800 hover:to-indigo-900 text-white pl-2.5 pr-4 py-2 rounded-full shadow-2xl border-2 border-amber-400 ring-4 ring-amber-400/20 transition-all duration-300 transform hover:scale-105 cursor-pointer"
        title="Bấm để mở đường dây nóng tư vấn học đường"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-md group-hover:rotate-12 transition-transform">
          <Phone className="w-4 h-4 animate-pulse" />
        </div>
        <div className="text-left leading-tight">
          <div className="text-[9px] font-black uppercase text-amber-300 tracking-wider">HOTLINE TƯ VẤN:</div>
          <div className="text-xs font-black tracking-wide text-white">{activeHotline}</div>
        </div>
        <ChevronUp className={`w-3.5 h-3.5 text-amber-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
};
