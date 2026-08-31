/**
 * Hotline Availability Helper
 * Rules:
 * - Working hours: 07:00 to 17:00 (7 AM to 5 PM).
 * - At 17:00 (5 PM) and later until 07:00 next morning: Hotline phone number will NOT be displayed/callable
 *   to protect staff outside working hours. Instead, shows an out-of-hours notice.
 */

export function isHotlineActive(): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  // Active only from 07:00 up to before 17:00 (17h00)
  return currentHour >= 7 && currentHour < 17;
}

export function getHotlineDisplay(hotline: string): {
  isActive: boolean;
  displayText: string;
  phoneLink: string | null;
  statusNote: string;
  badgeColor: string;
} {
  const active = isHotlineActive();
  if (active) {
    return {
      isActive: true,
      displayText: hotline,
      phoneLink: `tel:${hotline.replace(/\s+/g, '')}`,
      statusNote: 'Đang trực tiếp nhận (07:00 - 17:00)',
      badgeColor: 'bg-emerald-500 text-white',
    };
  }
  return {
    isActive: false,
    displayText: 'Nghỉ tiếp nhận cuộc gọi sau 17h00',
    phoneLink: null,
    statusNote: 'Ngoài giờ trực (17:00 - 07:00). Vui lòng gửi câu hỏi trên web/app!',
    badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-400/40',
  };
}
