/**
 * TIỆN ÍCH QUẢN LÝ NĂM HỌC, PHÂN KỲ THỜI GIAN & TÍNH ĐIỂM HOẠT ĐỘNG
 * Trường THPT Ba Chúc
 * 
 * QUY TẮC TÍNH THỜI GIAN:
 * 1. Năm học chính khóa: Từ ngày 05/09 năm trước đến ngày 31/05 năm sau (VD: 2026-2027 tính từ 05/09/2026 đến 31/05/2027).
 * 2. Cây hoạt động hè (Chiến dịch tình nguyện hè): Từ ngày 01/06 đến ngày 31/08 của năm học đó (VD: hè 2027 tính từ 01/06/2027 đến 31/08/2027).
 * 3. Điểm số và Bảng Vinh Danh độc lập theo từng năm học: Khi chuyển sang năm học mới, điểm bắt đầu từ 0 của các hoạt động trong năm học mới,
 *    không cộng dồn điểm của năm cũ, đảm bảo tuyệt đối công bằng cho học sinh mới vào trường.
 */

import { VolunteerAttendance, VolunteerMember } from '../types';

export const DEFAULT_ACADEMIC_YEARS = [
  '2024 - 2025',
  '2025 - 2026',
  '2026 - 2027',
  '2027 - 2028',
  '2028 - 2029',
  '2029 - 2030',
  '2030 - 2031',
  '2031 - 2032',
  '2032 - 2033',
];

const ACADEMIC_YEARS_STORAGE_KEY = 'thpt_bachuc_academic_years_list';
const CURRENT_ACTIVE_YEAR_KEY = 'thpt_bachuc_current_active_year';

/**
 * Lấy danh sách các năm học đã lưu
 */
export function getSavedAcademicYears(): string[] {
  if (typeof window === 'undefined') return DEFAULT_ACADEMIC_YEARS;
  try {
    const raw = localStorage.getItem(ACADEMIC_YEARS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Hợp nhất với danh sách mặc định để luôn đầy đủ
        const set = new Set([...DEFAULT_ACADEMIC_YEARS, ...parsed]);
        return Array.from(set);
      }
    }
  } catch {}
  return DEFAULT_ACADEMIC_YEARS;
}

/**
 * Lưu danh sách năm học tùy chỉnh
 */
export function saveAcademicYearsList(years: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACADEMIC_YEARS_STORAGE_KEY, JSON.stringify(years));
  } catch {}
}

/**
 * Lấy năm học hiện hành được thiết lập
 */
export function getCurrentActiveYear(): string {
  if (typeof window === 'undefined') return '2026 - 2027';
  try {
    const saved = localStorage.getItem(CURRENT_ACTIVE_YEAR_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {}
  return '2026 - 2027';
}

/**
 * Thiết lập năm học hiện hành
 */
export function setCurrentActiveYear(year: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CURRENT_ACTIVE_YEAR_KEY, year.trim());
  } catch {}
}

/**
 * Tách năm bắt đầu và năm kết thúc từ chuỗi (VD: "2026 - 2027" -> { startYear: 2026, endYear: 2027 })
 */
export function parseYearRange(yearStr: string): { startYear: number; endYear: number } {
  if (!yearStr) return { startYear: 2026, endYear: 2027 };
  const matches = yearStr.match(/(\d{4})\s*[-–/]\s*(\d{4})/);
  if (matches && matches[1] && matches[2]) {
    return {
      startYear: parseInt(matches[1], 10),
      endYear: parseInt(matches[2], 10),
    };
  }
  const singleYear = parseInt(yearStr.replace(/\D/g, ''), 10);
  if (!isNaN(singleYear) && singleYear > 2000) {
    return { startYear: singleYear, endYear: singleYear + 1 };
  }
  return { startYear: 2026, endYear: 2027 };
}

/**
 * Lấy mốc thời gian chuẩn của một năm học:
 * - Chính khóa: 05/09/{startYear} đến 31/05/{endYear}
 * - Hè: 01/06/{endYear} đến 31/08/{endYear}
 */
export function getAcademicYearBoundaries(yearStr: string) {
  const { startYear, endYear } = parseYearRange(yearStr);

  const mainStart = new Date(`${startYear}-09-05T00:00:00.000Z`);
  const mainEnd = new Date(`${endYear}-05-31T23:59:59.999Z`);

  const summerStart = new Date(`${endYear}-06-01T00:00:00.000Z`);
  const summerEnd = new Date(`${endYear}-08-31T23:59:59.999Z`);

  return {
    startYear,
    endYear,
    mainStart,
    mainEnd,
    summerStart,
    summerEnd,
    labelMain: `05/09/${startYear} – 31/05/${endYear}`,
    labelSummer: `01/06/${endYear} – 31/08/${endYear}`,
  };
}

/**
 * Kiểm tra xem một ngày có thuộc năm học chính khóa (05/09 - 31/05) của năm học hay không
 */
export function isDateInMainAcademicYear(dateInput: string | Date, yearStr: string): boolean {
  if (!dateInput) return false;
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return false;
    const { mainStart, mainEnd } = getAcademicYearBoundaries(yearStr);
    return d >= mainStart && d <= mainEnd;
  } catch {
    return false;
  }
}

/**
 * Kiểm tra xem một ngày có thuộc giai đoạn Chiến dịch Tình nguyện Hè (01/06 - 31/08) hay không
 */
export function isDateInSummerCampaign(dateInput: string | Date, yearStr: string): boolean {
  if (!dateInput) return false;
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return false;
    const { summerStart, summerEnd } = getAcademicYearBoundaries(yearStr);
    return d >= summerStart && d <= summerEnd;
  } catch {
    return false;
  }
}

/**
 * Xác định phân loại mùa của một ngày đối với năm học được chỉ định
 */
export function getSeasonTypeForDate(dateInput: string | Date, yearStr: string): 'main_academic' | 'summer' | 'outside' {
  if (isDateInMainAcademicYear(dateInput, yearStr)) return 'main_academic';
  if (isDateInSummerCampaign(dateInput, yearStr)) return 'summer';
  return 'outside';
}

/**
 * Tính điểm hoạt động của một đoàn viên / học sinh theo từng năm học và từng mùa cụ thể:
 * - 'main': Chỉ tính các hoạt động từ 05/09 đến 31/05 của năm học đó
 * - 'summer': Chỉ tính các hoạt động từ 01/06 đến 31/08 của mùa hè năm học đó
 * - 'all': Tính toàn bộ các hoạt động thuộc năm học đó (Chính khóa + Hè)
 * 
 * ĐẢM BẢO CÔNG BẰNG: Nếu năm học mới (VD 2027-2028), điểm của năm cũ sẽ KHÔNG bị tính gộp,
 * học sinh mới sẽ cạnh tranh hoàn toàn bình đẳng từ các hoạt động mới!
 */
export function computeMemberScoreForYear(
  member: VolunteerMember,
  allAttendances: VolunteerAttendance[],
  targetYear: string,
  period: 'main' | 'summer' | 'all' = 'all'
): {
  mainPoints: number;
  summerPoints: number;
  totalPoints: number;
  isEligibleForHonor: boolean;
  honorRank: 'top' | 'excellent' | 'active' | 'none';
} {
  const normName = (member.fullName || '').trim().toLowerCase();
  const normClass = (member.className || '').trim().toUpperCase();

  // Lọc các bản ghi điểm danh của học sinh này
  const studentAttendances = allAttendances.filter(a => {
    const aName = (a.fullName || '').trim().toLowerCase();
    const aClass = (a.className || '').trim().toUpperCase();
    return aName === normName && (!aClass || !normClass || aClass === normClass);
  });

  // Đếm các hoạt động trong năm học chính khóa (05/09 - 31/05)
  const mainAttendances = studentAttendances.filter(a => isDateInMainAcademicYear(a.date, targetYear));
  
  // Đếm các hoạt động trong chiến dịch hè (01/06 - 31/08)
  const summerAttendances = studentAttendances.filter(a => isDateInSummerCampaign(a.date, targetYear));

  let mainPoints = mainAttendances.length;
  let summerPoints = summerAttendances.length;

  // Nếu là năm học cũ đã có sẵn điểm tích lũy ban đầu và đúng năm học của học sinh
  if ((member.academicYear || '2025 - 2026') === targetYear) {
    // Nếu chưa có điểm danh chi tiết trong DB nhưng có activitiesCount ghi nhận
    const directCount = Number(member.activitiesCount) || 0;
    if (directCount > (mainPoints + summerPoints)) {
      mainPoints = Math.max(mainPoints, directCount);
    }
  }

  const totalPoints = period === 'main' ? mainPoints : period === 'summer' ? summerPoints : (mainPoints + summerPoints);

  let honorRank: 'top' | 'excellent' | 'active' | 'none' = 'none';
  if (totalPoints >= 20) honorRank = 'top';
  else if (totalPoints >= 10) honorRank = 'excellent';
  else if (totalPoints >= 5) honorRank = 'active';

  return {
    mainPoints,
    summerPoints,
    totalPoints,
    isEligibleForHonor: totalPoints >= 5 || member.isHonored === true,
    honorRank,
  };
}
