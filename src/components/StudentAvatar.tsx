import React, { useState } from 'react';

interface StudentAvatarProps {
  fullName?: string;
  photoUrl?: string | null;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  rounded?: 'full' | 'xl' | '2xl' | 'lg';
  border?: string;
  alt?: string;
  badge?: React.ReactNode;
}

/**
 * Lấy chữ cái đầu của tên học sinh (chữ cái đầu của Tên chính, ví dụ: "Nguyễn Văn An" -> "A")
 */
export function getStudentInitial(fullName?: string): string {
  if (!fullName || typeof fullName !== 'string') return 'ĐV';
  const trimmed = fullName.trim();
  if (!trimmed) return 'ĐV';
  
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    const givenName = words[words.length - 1]; // Tên chính
    return givenName.charAt(0).toUpperCase();
  }
  return trimmed.charAt(0).toUpperCase();
}

/**
 * Tạo bảng màu gradient đồng bộ và đẹp mắt dựa trên tên học sinh
 */
const GRADIENT_PALETTES = [
  'from-indigo-600 to-blue-500 text-white',
  'from-rose-600 to-pink-500 text-white',
  'from-amber-600 to-yellow-500 text-white',
  'from-emerald-600 to-teal-500 text-white',
  'from-violet-600 to-purple-500 text-white',
  'from-sky-600 to-cyan-500 text-white',
  'from-teal-600 to-emerald-500 text-white',
  'from-fuchsia-600 to-pink-500 text-white',
  'from-red-600 to-orange-500 text-white',
  'from-blue-700 to-indigo-600 text-white',
];

export function getStudentAvatarColor(name?: string): string {
  if (!name) return GRADIENT_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  fullName = '',
  photoUrl,
  className = '',
  size = 'md',
  rounded = 'full',
  border = 'border border-slate-200 shadow-xs',
  alt,
  badge,
}) => {
  const [imageError, setImageError] = useState(false);

  // Kích thước chuẩn
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-black',
    lg: 'w-12 h-12 text-base font-black',
    xl: 'w-16 h-16 text-xl font-black',
    '2xl': 'w-20 h-20 text-2xl font-black',
    '3xl': 'w-24 h-24 sm:w-28 sm:h-28 text-3xl sm:text-4xl font-black',
  }[size];

  const roundedClasses = {
    full: 'rounded-full',
    '2xl': 'rounded-2xl',
    xl: 'rounded-xl',
    lg: 'rounded-lg',
  }[rounded];

  const initial = getStudentInitial(fullName);
  const colorGradient = getStudentAvatarColor(fullName);

  // Kiểm tra ảnh hợp lệ (chỉ hiển thị ảnh nếu là ảnh cá nhân thực tế đã tải lên, không bị lỗi hoặc placeholder)
  const hasValidPhoto = Boolean(
    photoUrl &&
    typeof photoUrl === 'string' &&
    photoUrl.trim().length > 15 &&
    !imageError &&
    !photoUrl.includes('placeholder') &&
    !photoUrl.includes('unsplash.com/photo-1534528741775')
  );

  return (
    <div className={`relative inline-flex shrink-0 select-none ${className}`}>
      {hasValidPhoto ? (
        <img
          src={photoUrl!}
          alt={alt || fullName}
          onError={() => setImageError(true)}
          className={`${sizeClasses} ${roundedClasses} ${border} object-cover bg-slate-100 transition-all`}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : (
        <div
          className={`${sizeClasses} ${roundedClasses} ${border} bg-gradient-to-br ${colorGradient} flex items-center justify-center select-none shadow-xs font-black tracking-wider transition-all transform hover:scale-105`}
          title={fullName}
        >
          <span className="drop-shadow-xs font-mono font-black">{initial}</span>
        </div>
      )}
      {badge && <div className="absolute -bottom-1 -right-1 z-10">{badge}</div>}
    </div>
  );
};
