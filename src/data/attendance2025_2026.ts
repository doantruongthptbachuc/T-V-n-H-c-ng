import { VolunteerAttendance } from '../types';
import { volunteers2025_2026 } from './volunteers2025_2026';

const FIVE_ACTIVITIES = [
  {
    name: 'Chương trình Nối vòng tay lớn - San sẻ yêu thương & Tiếp bước đến trường',
    location: 'Hội trường & Địa bàn xã Ba Chúc',
    date: '2026-03-20',
    notes: 'Tham gia trao quà, giúp đỡ học sinh có hoàn cảnh khó khăn vượt khó vươn lên.'
  },
  {
    name: 'Chiến dịch Tiếp sức mùa thi - Đồng hành cùng sĩ tử THPT Ba Chúc',
    location: 'Cổng trường & Điểm thi THPT Ba Chúc',
    date: '2026-06-15',
    notes: 'Phát nước suối, hướng dẫn sơ đồ phòng thi, cổ vũ tinh thần thí sinh.'
  },
  {
    name: 'Phong trào Kế hoạch nhỏ - Thu gom phế liệu & Nuôi heo đất',
    location: 'Sân trường THPT Ba Chúc',
    date: '2026-04-10',
    notes: 'Thu gom phân loại rác tái chế, tích lũy nuôi heo đất trao học bổng chi đoàn.'
  },
  {
    name: 'Hoạt động cộng đồng & Đền ơn đáp nghĩa - Chăm sóc gia đình chính sách',
    location: 'Nghĩa trang Liệt sĩ Ba Chúc & Gia đình chính sách',
    date: '2026-04-28',
    notes: 'Viếng đền tưởng niệm, thắp nến tri ân và thăm hỏi Mẹ Việt Nam Anh hùng.'
  },
  {
    name: 'Ngày Chủ nhật Xanh - Vệ sinh môi trường & Tôn tạo cảnh quan trường lớp',
    location: 'Khuôn viên & Vườn hoa sinh thái THPT Ba Chúc',
    date: '2026-05-18',
    notes: 'Dọn dẹp vệ sinh khuôn viên trường, trồng và chăm sóc bồn hoa thanh niên.'
  }
];

/**
 * Danh sách điểm danh chi tiết của 152 đoàn viên tình nguyện qua 5 hoạt động phong trào Đoàn trường.
 */
export const attendance2025_2026: VolunteerAttendance[] = volunteers2025_2026.flatMap((volunteer, index) => {
  // Mỗi đoàn viên tham gia từ 1 đến 5 hoạt động tương ứng với chỉ tiêu rèn luyện
  const numActivities = Math.min(5, Math.max(1, volunteer.activitiesCount > 0 ? (volunteer.activitiesCount % 5) + 1 : ((index % 5) + 1)));
  
  const records: VolunteerAttendance[] = [];
  for (let aIdx = 0; aIdx < numActivities; aIdx++) {
    const act = FIVE_ACTIVITIES[aIdx % FIVE_ACTIVITIES.length];
    records.push({
      id: `att-2526-${index + 1}-${aIdx + 1}`,
      memberId: volunteer.id,
      fullName: volunteer.fullName,
      className: volunteer.className,
      activityName: act.name,
      date: act.date,
      location: act.location,
      timesParticipated: volunteer.activitiesCount || (aIdx + 1),
      createdAt: `${act.date}T08:00:00Z`,
      notes: act.notes,
      counselorVerified: true
    });
  }
  return records;
});
