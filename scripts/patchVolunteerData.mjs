import fs from 'node:fs';

const storagePath = 'src/utils/storage.ts';
const adminPath = 'src/components/AdminDashboard.tsx';
const youthPath = 'src/components/YouthUnionSection.tsx';

function read(path) { return fs.readFileSync(path, 'utf8'); }
function write(path, text) { fs.writeFileSync(path, text, 'utf8'); }
function replaceOrFail(text, pattern, replacement, label) {
  if (!pattern.test(text)) throw new Error(`Patch target not found: ${label}`);
  return text.replace(pattern, replacement);
}

// 1) Volunteer members: saved/Firestore records are authoritative. Initial data only fills missing students.
let storage = read(storagePath);
storage = replaceOrFail(
  storage,
  /export function deduplicateAndRecomputeVolunteerMembers\([\s\S]*?\n}\n\nexport function addVolunteerMember/,
  `export function deduplicateAndRecomputeVolunteerMembers(\n  members: VolunteerMember[],\n  attendances?: VolunteerAttendance[]\n): { members: VolunteerMember[]; mergedCount: number } {\n  const attList = attendances || getVolunteerAttendance();\n  const byKey = new Map<string, VolunteerMember>();\n  let mergedCount = 0;\n\n  // Existing saved/cloud data wins over baseline seed data. This prevents edits from being overwritten.\n  for (const m of initialVolunteerMembers) {\n    if (!m?.fullName) continue;\n    byKey.set(\`${normalizeStudentName(m.fullName)}_\${normalizeStudentClass(m.className)}\`, m);\n  }\n  for (const m of (members || [])) {\n    if (!m?.fullName) continue;\n    const key = \`${normalizeStudentName(m.fullName)}_\${normalizeStudentClass(m.className)}\`;\n    if (byKey.has(key)) mergedCount++;\n    byKey.set(key, { ...byKey.get(key), ...m });\n  }\n\n  const result: VolunteerMember[] = [];\n  for (const [key, member] of byKey.entries()) {\n    const [normName, normClass] = key.split('_');\n    const matched = attList.filter(a => normalizeStudentName(a.fullName) === normName && normalizeStudentClass(a.className) === normClass);\n    const recordCount = matched.reduce((sum, a) => sum + Math.max(0, Number(a.timesParticipated) || 0), 0);\n    const assignedCount = Math.max(0, Number(member.activitiesCount) || 0);\n    const pointsFromHistory = matched.reduce((sum, a) => sum + Math.max(0, Number(a.activityPoints) || 0), 0);\n    const assignedPoints = Math.max(0, Number(member.activityPoints) || 0);\n    const activitiesCount = Math.max(assignedCount, recordCount);\n    const activityPoints = Math.max(assignedPoints, pointsFromHistory);\n    const isHonored = Boolean(member.isHonored) || activitiesCount >= 5;\n    result.push({\n      ...member,\n      fullName: member.fullName.trim().replace(/\\s+/g, ' '),\n      className: member.className.trim(),\n      activitiesCount,\n      activityPoints,\n      isHonored,\n      status: isHonored ? 'honored' : member.status,\n      honorTitle: member.honorTitle || (isHonored ? 'Học Sinh Tích Cực Trong Phong Trào Tình Nguyện' : undefined),\n      honorDate: member.honorDate || (isHonored ? new Date().toLocaleDateString('vi-VN') : undefined),\n    });\n  }\n\n  result.sort((a, b) => (b.activitiesCount || 0) - (a.activitiesCount || 0));\n  return { members: result, mergedCount };\n}\n\nexport function addVolunteerMember`,
  'deduplicateAndRecomputeVolunteerMembers'
);

// 2) Attendance: one aggregate row per volunteer. Every check-in increments count and points; no duplicate attendance rows.
storage = replaceOrFail(
  storage,
  /export function addVolunteerAttendanceRecord\([\s\S]*?\n}\n\n\/\/ Activities/,
  `export function addVolunteerAttendanceRecord(attData: Omit<VolunteerAttendance, 'id' | 'createdAt'>): VolunteerAttendance {\n  const current = getVolunteerAttendance();\n  const members = getVolunteerMembers();\n  const points = Math.max(0, Number((attData as any).activityPoints) || 1);\n  const memberIndex = members.findIndex(m =>\n    (attData.memberId && m.id === attData.memberId) ||\n    (normalizeStudentName(m.fullName) === normalizeStudentName(attData.fullName) && normalizeStudentClass(m.className) === normalizeStudentClass(attData.className))\n  );\n\n  let member: VolunteerMember | undefined = memberIndex >= 0 ? members[memberIndex] : undefined;\n  if (member) {\n    member = {\n      ...member,\n      activitiesCount: Math.max(0, Number(member.activitiesCount) || 0) + 1,\n      activityPoints: Math.max(0, Number(member.activityPoints) || 0) + points,\n    };\n    if (member.activitiesCount >= 5 && !member.isHonored) {\n      member.isHonored = true;\n      member.status = 'honored';\n      member.honorTitle = 'Học Sinh Tích Cực Trong Phong Trào Tình Nguyện';\n      member.honorDate = new Date().toLocaleDateString('vi-VN');\n    }\n    members[memberIndex] = member;\n    saveVolunteerMembers(members);\n    saveFirebaseDoc('volunteerMembers', member).catch(() => {});\n  }\n\n  const memberId = member?.id || attData.memberId;\n  const existingIndex = current.findIndex(a =>\n    (memberId && a.memberId === memberId) ||\n    (normalizeStudentName(a.fullName) === normalizeStudentName(attData.fullName) && normalizeStudentClass(a.className) === normalizeStudentClass(attData.className))\n  );\n\n  if (existingIndex >= 0) {\n    const old = current[existingIndex];\n    const aggregate: VolunteerAttendance = {\n      ...old,\n      memberId: memberId || old.memberId,\n      fullName: member?.fullName || attData.fullName,\n      className: member?.className || attData.className,\n      activityName: attData.activityName,\n      date: attData.date,\n      location: attData.location,\n      timesParticipated: (Number(old.timesParticipated) || 0) + 1,\n      activityPoints: (Number(old.activityPoints) || 0) + points,\n      notes: attData.notes ?? old.notes,\n      counselorVerified: attData.counselorVerified ?? old.counselorVerified,\n    };\n    current[existingIndex] = aggregate;\n    saveVolunteerAttendance(current);\n    saveFirebaseDoc('volunteerAttendance', aggregate).catch(() => {});\n    return aggregate;\n  }\n\n  const record: VolunteerAttendance = {\n    ...attData,\n    memberId,\n    timesParticipated: member?.activitiesCount || 1,\n    activityPoints: points,\n    id: `att-${Date.now()}`,\n    createdAt: new Date().toISOString(),\n  };\n  const updated = [record, ...current];\n  saveVolunteerAttendance(updated);\n  saveFirebaseDoc('volunteerAttendance', record).catch(() => {});\n  return record;\n}\n\n// Activities`,
  'addVolunteerAttendanceRecord'
);
write(storagePath, storage);

// 3) Prevent the old quick-check handler from incrementing the member twice. The storage service owns the increment.
let admin = read(adminPath);
admin = replaceOrFail(
  admin,
  /  const handleQuickIncrementAttendance = \(m: VolunteerMember\) => \{[\s\S]*?\n  };\n\n  const handleOpenVolHonor/,
  `  const handleQuickIncrementAttendance = (m: VolunteerMember) => {\n    if (!onAddAttendance) return;\n    const raw = window.prompt('Số điểm cộng cho hoạt động này (1, 2, 3, 5...)', '1');\n    if (raw === null) return;\n    const points = Math.max(0, Number(raw) || 0);\n    if (points <= 0) { alert('Số điểm phải lớn hơn 0.'); return; }\n    onAddAttendance({\n      memberId: m.id,\n      fullName: m.fullName,\n      className: m.className,\n      activityName: 'Hoạt động phong trào Đoàn trường',\n      date: new Date().toISOString().split('T')[0],\n      location: 'Trường THPT Ba Chúc',\n      timesParticipated: 1,\n      activityPoints: points,\n      counselorVerified: true,\n    });\n  };\n\n  const handleOpenVolHonor`,
  'Admin quick attendance handler'
);

// 4) Manual attendance also asks for the points for this activity.
admin = admin.replace(
  /timesParticipated: 1,\n        counselorVerified: true,/g,
  "timesParticipated: 1,\n        activityPoints: Math.max(1, Number(window.prompt('Số điểm cộng cho hoạt động này (1, 2, 3, 5...)', '1') || '1')),\n        counselorVerified: true,"
);
write(adminPath, admin);

// 5) Public attendance quick check: add points without duplicating the volunteer profile.
let youth = read(youthPath);
youth = youth.replace(
  /timesParticipated: 1,\n        counselorVerified: true,/g,
  "timesParticipated: 1,\n        activityPoints: Math.max(1, Number(window.prompt('Số điểm cộng cho hoạt động này (1, 2, 3, 5...)', '1') || '1')),\n        counselorVerified: true,"
);
write(youthPath, youth);

console.log('Volunteer data patch applied: persistence, cumulative count/points, aggregate attendance, and double-increment fix.');
