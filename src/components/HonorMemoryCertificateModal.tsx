import React, { useRef, useState } from 'react';
import { Award, Download, Printer, Share2, X, Check, Sparkles, Flag, Camera, Upload } from 'lucide-react';
import { VolunteerMember } from '../types';
import { StudentAvatar, getStudentInitial } from './StudentAvatar';
import { uploadImageToFirebase } from '../lib/storageService';

interface HonorMemoryCertificateModalProps {
  member: VolunteerMember | null;
  onClose: () => void;
  onEditHonor?: (member: VolunteerMember) => void;
  onUpdateMemberPhoto?: (memberId: string, photoUrl: string) => void;
  isAdmin?: boolean;
  schoolLogo?: string;
}

export const HonorMemoryCertificateModal: React.FC<HonorMemoryCertificateModalProps> = ({
  member,
  onClose,
  onEditHonor,
  onUpdateMemberPhoto,
  isAdmin = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!member) return null;

  const currentPhoto = customPhotoUrl || member.honorPhoto || member.avatarUrl || null;
  const count = member.activitiesCount ?? 0;
  const isTop1 = count >= 45;
  const isTopTier = count >= 20;
  const isExcellent = count >= 10;
  
  const rankLabel = isTop1 
    ? '👑 QUÁN QUÂN PHONG TRÀO TÌNH NGUYỆN' 
    : isTopTier 
    ? '👑 KIỆN TƯỚNG TÌNH NGUYỆN BA CHÚC' 
    : isExcellent 
    ? '⭐ CHIẾN SĨ TIÊU BIỂU' 
    : '🎖️ ĐOÀN VIÊN TÍCH CỰC';

  const defaultTitle = member.honorTitle || 'Học Sinh Tích Cực Trong Phong Trào Tình Nguyện';
  const academicYear = member.academicYear || '2025 - 2026';
  const honorDate = member.honorDate || new Date().toLocaleDateString('vi-VN');

  // Handle direct photo upload for honored student
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const url = await uploadImageToFirebase(file, 'images/honors', `honor_${member.id}`);
      setCustomPhotoUrl(url);
      if (onUpdateMemberPhoto) {
        onUpdateMemberPhoto(member.id, url);
      }
    } catch (err) {
      console.error('Lỗi khi tải ảnh học sinh vinh danh:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Copy shareable recognition text
  const handleCopyText = () => {
    const text = `🎖️ VINH DANH HỌC SINH TÍCH CỰC\n` +
      `ĐOÀN TNCS HỒ CHÍ MINH - ĐOÀN TRƯỜNG TRUNG HỌC PHỔ THÔNG BA CHÚC\n` +
      `👑 Đoàn viên: ${member.fullName}\n` +
      `🏫 Chi đoàn: ${member.className} • Năm học: ${academicYear}\n` +
      `⭐ Cống hiến: ${count} hoạt động tình nguyện\n` +
      `🏆 Danh hiệu: ${defaultTitle}\n` +
      `Chúc mừng chiến sĩ đã cống hiến hết mình cho phong trào thanh niên!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Generate PNG certificate via HTML5 Canvas
  const handleDownloadCertificate = async () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1100;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsExporting(false);
        return;
      }

      // Background - Royal Parchment
      const bgGradient = ctx.createLinearGradient(0, 0, 1600, 1100);
      bgGradient.addColorStop(0, '#FFFDF8');
      bgGradient.addColorStop(0.5, '#FEF9EE');
      bgGradient.addColorStop(1, '#FFF5E0');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1600, 1100);

      // Gold Outer Border
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, 1540, 1040);

      // Inner Red Border
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 4;
      ctx.strokeRect(48, 48, 1504, 1004);

      // Thin Gold Accent
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.strokeRect(58, 58, 1484, 984);

      // Corner Ornaments
      const drawCorner = (x: number, y: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawCorner(70, 70);
      drawCorner(1530, 70);
      drawCorner(70, 1030);
      drawCorner(1530, 1030);

      // Header Text - Correct standard Youth Union titles
      ctx.textAlign = 'center';
      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 32px "Montserrat", sans-serif';
      ctx.fillText('ĐOÀN TNCS HỒ CHÍ MINH', 800, 105);

      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 26px "Montserrat", sans-serif';
      ctx.fillText('ĐOÀN TRƯỜNG TRUNG HỌC PHỔ THÔNG BA CHÚC', 800, 145);

      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 18px "Montserrat", sans-serif';
      ctx.fillText('TUỔI TRẺ BA CHÚC - TIÊN PHONG • BẢN LĨNH • ĐOÀN KẾT • SÁNG TẠO', 800, 180);

      // Main Title
      ctx.fillStyle = '#B45309';
      ctx.font = '900 60px "Playfair Display", serif';
      ctx.fillText('GIẤY VINH DANH DANH DỰ', 800, 255);

      ctx.fillStyle = '#451A03';
      ctx.font = 'italic 23px serif';
      ctx.fillText('Ban Chấp Hành Đoàn Trường THPT Ba Chúc Trân Trọng Tuyên Dương', 800, 298);

      // Student Avatar or Initial Circle on Canvas
      const photoToDraw = currentPhoto;
      let imageDrawn = false;

      if (photoToDraw) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = photoToDraw;
          });

          ctx.save();
          ctx.beginPath();
          ctx.arc(800, 365, 55, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, 745, 310, 110, 110);
          ctx.restore();

          // Border for photo
          ctx.strokeStyle = '#D97706';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(800, 365, 55, 0, Math.PI * 2);
          ctx.stroke();

          imageDrawn = true;
        } catch {
          imageDrawn = false;
        }
      }

      if (!imageDrawn) {
        // Fallback: draw elegant initial-letter badge
        const initial = getStudentInitial(member.fullName);
        const grad = ctx.createLinearGradient(745, 310, 855, 420);
        grad.addColorStop(0, '#DC2626');
        grad.addColorStop(1, '#D97706');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(800, 365, 55, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FEF08A';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 48px "Montserrat", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initial, 800, 368);
        ctx.textBaseline = 'alphabetic';
      }

      // Student Name
      ctx.textAlign = 'center';
      ctx.fillStyle = '#991B1B';
      ctx.font = '900 52px "Playfair Display", serif';
      ctx.fillText(member.fullName.toUpperCase(), 800, 480);

      // Class and Cohort
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 26px "Montserrat", sans-serif';
      ctx.fillText(`Chi đoàn: ${member.className}  •  Niên khóa: ${academicYear}`, 800, 525);

      // Achievement Badge
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.roundRect(420, 560, 760, 64, [32]);
      ctx.fill();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#78350F';
      ctx.font = '900 26px "Montserrat", sans-serif';
      ctx.fillText(`🏆 ${rankLabel}`, 800, 603);

      // Citation Text
      ctx.fillStyle = '#334155';
      ctx.font = '22px "Montserrat", sans-serif';
      ctx.fillText(`Đã có thành tích xuất sắc và cống hiến bền bỉ với`, 800, 675);

      ctx.fillStyle = '#DC2626';
      ctx.font = '900 32px "Montserrat", sans-serif';
      ctx.fillText(`⭐ ${count} HOẠT ĐỘNG TÌNH NGUYỆN & PHONG TRÀO ⭐`, 800, 725);

      ctx.fillStyle = '#475569';
      ctx.font = 'italic 22px serif';
      ctx.fillText(`"${defaultTitle}"`, 800, 775);

      ctx.fillStyle = '#64748B';
      ctx.font = '19px "Montserrat", sans-serif';
      ctx.fillText(`Ghi nhận tấm gương sáng, lòng nhiệt huyết và tinh thần xung kích vì cộng đồng của học sinh.`, 800, 815);

      // Footer - Date & Signature
      const today = new Date();
      const dateText = `Ba Chúc, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
      ctx.textAlign = 'right';
      ctx.fillStyle = '#475569';
      ctx.font = 'italic 21px serif';
      ctx.fillText(dateText, 1400, 905);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 23px "Montserrat", sans-serif';
      ctx.fillText('TM. BAN CHẤP HÀNH ĐOÀN TRƯỜNG', 1400, 940);

      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 21px "Montserrat", sans-serif';
      ctx.fillText('BÍ THƯ ĐOÀN TRƯỜNG', 1400, 975);

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'italic 19px serif';
      ctx.fillText('(Đã ký điện tử & Lưu vào Sổ Vàng)', 1400, 1025);

      // Left Footer - Seal / Badge
      ctx.textAlign = 'left';
      ctx.fillStyle = '#DC2626';
      ctx.font = '900 21px "Montserrat", sans-serif';
      ctx.fillText('🚩 SỔ VÀNG TRUYỀN THỐNG ĐOÀN', 120, 940);
      ctx.fillStyle = '#64748B';
      ctx.font = '17px "Montserrat", sans-serif';
      ctx.fillText(`Mã số lưu trữ: THPTBC-VOL-${member.code || member.id.slice(-6)}`, 120, 975);
      ctx.fillText(`Cập nhật bộ nhớ vinh danh ngày: ${honorDate}`, 120, 1005);

      // Download
      const link = document.createElement('a');
      link.download = `GiayVinhDanh_${member.fullName.replace(/\s+/g, '_')}_${member.className}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Lỗi xuất giấy khen:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-amber-300 shadow-2xl overflow-hidden relative my-auto animate-in fade-in zoom-in duration-200">
        {/* Top Decorative Banner */}
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Award className="w-5 h-5 text-yellow-200" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-tight uppercase">
                HỒ SƠ KỶ YẾU & BỘ NHỚ VINH DANH HỌC SINH
              </h3>
              <p className="text-[11px] text-amber-100 font-bold">
                Đoàn TNCS Hồ Chí Minh - Đoàn Trường Trung Học Phổ Thông Ba Chúc
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-all text-white/90 cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden File Input for Direct Honor Photo Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Certificate Card Container */}
        <div className="p-5 sm:p-7 space-y-6 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30">
          <div
            ref={certificateRef}
            className="bg-radial from-amber-50/70 via-white to-yellow-50/40 border-4 border-amber-400/80 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-inner relative overflow-hidden ring-4 ring-red-600/20"
          >
            {/* Corner Ornaments */}
            <div className="absolute top-2 left-2 text-amber-400 text-xs select-none">❖</div>
            <div className="absolute top-2 right-2 text-amber-400 text-xs select-none">❖</div>
            <div className="absolute bottom-2 left-2 text-amber-400 text-xs select-none">❖</div>
            <div className="absolute bottom-2 right-2 text-amber-400 text-xs select-none">❖</div>

            {/* Header Crest - Official Format Requested by User */}
            <div className="flex flex-col items-center justify-center text-center text-red-600 font-black tracking-wider space-y-0.5">
              <div className="flex items-center space-x-1.5 text-xs sm:text-sm uppercase font-black">
                <Flag className="w-4 h-4 text-red-600 shrink-0" />
                <span>ĐOÀN TNCS HỒ CHÍ MINH</span>
              </div>
              <div className="text-[11px] sm:text-xs text-red-700 font-bold uppercase tracking-wide">
                ĐOÀN TRƯỜNG TRUNG HỌC PHỔ THÔNG BA CHÚC
              </div>
            </div>

            {/* Photo & Initial Letter Avatar with Upload Trigger */}
            <div className="relative inline-block mx-auto group">
              <StudentAvatar
                fullName={member.fullName}
                photoUrl={currentPhoto}
                size="3xl"
                border="border-4 border-amber-400 shadow-lg"
                badge={
                  <div className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md border border-amber-200">
                    ⭐ {count} HĐ
                  </div>
                }
              />
              
              {/* Quick Upload Button on Hover */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute inset-0 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer p-1"
                title="Tải ảnh chân dung học sinh vinh danh"
              >
                <Camera className="w-5 h-5 text-amber-300 animate-bounce" />
                <span className="text-[9px] font-bold mt-0.5 text-center leading-tight">
                  {isUploadingPhoto ? 'Đang tải...' : 'Đổi ảnh'}
                </span>
              </button>
            </div>

            {/* Student Name */}
            <div className="space-y-1">
              <span className="text-[10px] sm:text-xs font-bold text-amber-800 uppercase tracking-widest bg-amber-100/80 px-3 py-0.5 rounded-full">
                Giấy Vinh Danh Danh Dự
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-red-700 tracking-tight">
                {member.fullName}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                Chi đoàn: <span className="text-red-600 font-black">{member.className}</span> • Niên khóa: <span className="text-slate-900 font-black">{academicYear}</span>
              </p>
            </div>

            {/* Distinction Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs sm:text-sm font-black shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-900" />
              <span>{rankLabel}</span>
            </div>

            {/* Citation */}
            <div className="p-4 bg-white/90 rounded-xl border border-amber-200 text-xs text-slate-700 space-y-1.5 leading-relaxed">
              <p className="font-bold text-amber-900 text-sm">
                🏆 {defaultTitle}
              </p>
              <p className="text-slate-600">
                Ghi nhận tinh thần cống hiến bền bỉ, tính tiền phong gương mẫu và nhiệt huyết của học sinh trong công tác Đoàn và phong trào tình nguyện tuổi trẻ Trường THPT Ba Chúc.
              </p>
              {member.notes && (
                <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                  "{member.notes}"
                </p>
              )}
            </div>

            {/* Badges Earned */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200">
                🎖️ Đạt chuẩn rèn luyện xuất sắc
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                ⭐ Ghi danh Sổ Vàng Truyền Thống
              </span>
              {member.isLeader && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  🚩 Cờ Thủ Lĩnh Phong Trào
                </span>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Direct Photo Upload Action */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                title="Tải ảnh chân dung học sinh lên giấy khen"
              >
                <Upload className="w-4 h-4 text-amber-700" />
                <span>{isUploadingPhoto ? 'Đang lưu ảnh...' : 'Up ảnh học sinh'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                title="Sao chép thông tin vinh danh"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Đã sao chép!' : 'Chia sẻ'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                title="In Giấy Khen"
              >
                <Printer className="w-4 h-4" />
                <span>In giấy khen</span>
              </button>

              {isAdmin && onEditHonor && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditHonor(member);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                  title="Chỉnh sửa chi tiết vinh danh"
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Sửa vinh danh</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleDownloadCertificate}
                disabled={isExporting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-black shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Đang xuất PNG...' : 'Tải Giấy Khen Điện Tử (PNG)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

