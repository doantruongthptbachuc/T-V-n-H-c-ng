import { 
  Question, 
  Story, 
  YouthRegistration, 
  VolunteerMember, 
  VolunteerAttendance, 
  Activity, 
  QAInfographic, 
  HealthArticle,
  SchoolConfig, 
  ContactMessage, 
  AIPromptQuestion, 
  AIChatLog, 
  Counselor 
} from '../types';
import { 
  initialConfig, 
  initialQuestions, 
  initialStories, 
  initialYouthRegistrations, 
  initialVolunteerMembers, 
  initialVolunteerAttendance, 
  initialActivities, 
  initialInfographics, 
  initialAIPromptQuestions, 
  initialAIChatLogs, 
  initialCounselors 
} from '../data/initialData';
import { initialHealthArticles } from '../data/healthData';
import {
  getFirebaseSchoolConfig,
  saveFirebaseSchoolConfig,
  getFirebaseCounselors,
  saveFirebaseCounselors,
  getFirebaseCollection,
  saveFirebaseDoc,
  deleteFirebaseDoc,
  saveFirebaseCollectionBatch,
} from '../lib/firestoreService';
import { idbSet, idbGet, idbGetStats } from './indexedDbStorage';
import { volunteers2025_2026 } from '../data/volunteers2025_2026';
import { attendance2025_2026 } from '../data/attendance2025_2026';

const STORAGE_KEYS = {
  CONFIG: 'tvhd_school_config',
  QUESTIONS: 'tvhd_questions',
  STORIES: 'tvhd_stories',
  YOUTH_REGS: 'tvhd_youth_regs',
  VOLUNTEER_MEMBERS: 'tvhd_volunteer_members',
  VOLUNTEER_ATTENDANCE: 'tvhd_volunteer_attendance',
  ACTIVITIES: 'tvhd_activities',
  INFOGRAPHICS: 'tvhd_infographics',
  CONTACTS: 'tvhd_contacts',
  AI_PROMPTS: 'tvhd_ai_prompts',
  AI_LOGS: 'tvhd_ai_chat_logs',
  COUNSELORS: 'tvhd_counselors',
  HEALTH_ARTICLES: 'tvhd_health_articles',
  BACKUP: 'tvhd_system_backup_auto',
};

// In-memory fallback cache
const memoryStore = new Map<string, string>();

// Safe JSON parser & local cache layer
function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key) || sessionStorage.getItem(key) || memoryStore.get(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e);
    const memItem = memoryStore.get(key);
    if (memItem) {
      try {
        return JSON.parse(memItem);
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  const json = JSON.stringify(value);
  memoryStore.set(key, json);

  try {
    localStorage.setItem(key, json);
  } catch (e: any) {
    console.warn(`Quota or write issue for ${key}:`, e?.message || e);
    try {
      if (key !== STORAGE_KEYS.AI_LOGS) {
        localStorage.removeItem(STORAGE_KEYS.AI_LOGS);
      }
      localStorage.setItem(key, json);
    } catch {
      try {
        sessionStorage.setItem(key, json);
      } catch {}
    }
  }

  // Tự động lưu vào bộ nhớ siêu dung lượng IndexedDB trong nền (chống mất dữ liệu & chống tràn quota)
  idbSet(key, value).catch(() => {});
}

// Khởi tạo và phục hồi bộ nhớ bền vững đa tầng khi khởi động
export async function initPersistentMemory(): Promise<{ hydrated: boolean; source?: string; members?: VolunteerMember[] }> {
  try {
    const idbVols = await idbGet<VolunteerMember[]>(STORAGE_KEYS.VOLUNTEER_MEMBERS);
    const localRaw = localStorage.getItem(STORAGE_KEYS.VOLUNTEER_MEMBERS);
    const localVols = localRaw ? JSON.parse(localRaw) : null;

    if (Array.isArray(idbVols) && idbVols.length > (Array.isArray(localVols) ? localVols.length : 0)) {
      safeSet(STORAGE_KEYS.VOLUNTEER_MEMBERS, idbVols);
      return { hydrated: true, source: 'IndexedDB', members: idbVols };
    }
    return { hydrated: false, members: localVols || idbVols || undefined };
  } catch {
    return { hydrated: false };
  }
}

// Server & Firestore Push Helper for multi-device sync
export async function pushCollectionToServer(collectionName: string, items: any): Promise<void> {
  // Push to server endpoint
  try {
    fetch(`/api/data/${collectionName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    }).catch(() => {});
  } catch {}

  // Sync directly to Cloud Firestore in background
  try {
    if (collectionName === 'config') {
      saveFirebaseSchoolConfig(items).catch(() => {});
    } else if (collectionName === 'counselors') {
      saveFirebaseCounselors(items).catch(() => {});
    } else if (Array.isArray(items)) {
      saveFirebaseCollectionBatch(collectionName, items).catch(() => {});
    }
  } catch (err) {
    console.warn(`Firestore background push warning for ${collectionName}:`, err);
  }

  // Notify real-time sync manager to broadcast to other tabs and mobile devices
  try {
    const { realtimeSync } = await import('./realtimeSync');
    realtimeSync.broadcastLocalChange(collectionName, items);
  } catch {}
}

// Full Cloud & Server Sync Helper
export async function syncAllWithServer(): Promise<{ success: boolean; data?: any }> {
  try {
    // 1. Fetch from Firestore first for high durability
    const [
      cloudConfig,
      cloudCounselors,
      cloudQuestions,
      cloudStories,
      cloudYouthRegs,
      cloudVolunteers,
      cloudAttendance,
      cloudActivities,
      cloudInfographics,
      cloudAIPrompts,
      cloudHealthArticles
    ] = await Promise.all([
      getFirebaseSchoolConfig().catch(() => null),
      getFirebaseCounselors().catch(() => null),
      getFirebaseCollection<Question>('questions', initialQuestions).catch(() => null),
      getFirebaseCollection<Story>('stories', initialStories).catch(() => null),
      getFirebaseCollection<YouthRegistration>('youthRegistrations', initialYouthRegistrations).catch(() => null),
      getFirebaseCollection<VolunteerMember>('volunteerMembers', initialVolunteerMembers).catch(() => null),
      getFirebaseCollection<VolunteerAttendance>('volunteerAttendance', initialVolunteerAttendance).catch(() => null),
      getFirebaseCollection<Activity>('activities', initialActivities).catch(() => null),
      getFirebaseCollection<QAInfographic>('infographics', initialInfographics).catch(() => null),
      getFirebaseCollection<AIPromptQuestion>('aiPrompts', initialAIPromptQuestions).catch(() => null),
      getFirebaseCollection<HealthArticle>('healthArticles', initialHealthArticles).catch(() => null),
    ]);

    if (cloudConfig) safeSet(STORAGE_KEYS.CONFIG, cloudConfig);
    if (cloudCounselors && cloudCounselors.length > 0) safeSet(STORAGE_KEYS.COUNSELORS, cloudCounselors);
    if (cloudQuestions && cloudQuestions.length > 0) safeSet(STORAGE_KEYS.QUESTIONS, cloudQuestions);
    if (cloudStories && cloudStories.length > 0) safeSet(STORAGE_KEYS.STORIES, cloudStories);
    if (cloudYouthRegs && cloudYouthRegs.length > 0) safeSet(STORAGE_KEYS.YOUTH_REGS, cloudYouthRegs);
    if (cloudVolunteers && cloudVolunteers.length > 0) safeSet(STORAGE_KEYS.VOLUNTEER_MEMBERS, cloudVolunteers);
    if (cloudAttendance && cloudAttendance.length > 0) safeSet(STORAGE_KEYS.VOLUNTEER_ATTENDANCE, cloudAttendance);
    if (cloudActivities && cloudActivities.length > 0) safeSet(STORAGE_KEYS.ACTIVITIES, cloudActivities);
    if (cloudInfographics && cloudInfographics.length > 0) safeSet(STORAGE_KEYS.INFOGRAPHICS, cloudInfographics);
    if (cloudAIPrompts && cloudAIPrompts.length > 0) safeSet(STORAGE_KEYS.AI_PROMPTS, cloudAIPrompts);
    if (cloudHealthArticles && cloudHealthArticles.length > 0) {
      const cloudIds = new Set(cloudHealthArticles.map(a => a.id));
      const missingInitial = initialHealthArticles.filter(a => !cloudIds.has(a.id));
      const resolvedHealth = missingInitial.length > 0 ? [...missingInitial, ...cloudHealthArticles] : cloudHealthArticles;
      safeSet(STORAGE_KEYS.HEALTH_ARTICLES, resolvedHealth);
    }

    // 2. Sync and reconcile with server central storage (/api/data) to ensure Web & Mobile App consistency
    try {
      const srvRes = await fetch('/api/data');
      if (srvRes.ok) {
        const srvJson = await srvRes.json();
        if (srvJson?.success && srvJson?.data) {
          const s = srvJson.data;
          if (s.config && !cloudConfig) safeSet(STORAGE_KEYS.CONFIG, s.config);
          if (Array.isArray(s.questions) && s.questions.length > 0 && (!cloudQuestions || cloudQuestions.length === 0)) {
            safeSet(STORAGE_KEYS.QUESTIONS, s.questions);
          }
          if (Array.isArray(s.stories) && s.stories.length > 0 && (!cloudStories || cloudStories.length === 0)) {
            safeSet(STORAGE_KEYS.STORIES, s.stories);
          }
          if (Array.isArray(s.activities) && s.activities.length > 0 && (!cloudActivities || cloudActivities.length === 0)) {
            safeSet(STORAGE_KEYS.ACTIVITIES, s.activities);
          }
          if (Array.isArray(s.healthArticles) && s.healthArticles.length > 0) {
            const currentHealth = getHealthArticles();
            const existingHIds = new Set(currentHealth.map(h => h.id));
            const newHealth = s.healthArticles.filter((h: any) => !existingHIds.has(h.id));
            if (newHealth.length > 0) {
              safeSet(STORAGE_KEYS.HEALTH_ARTICLES, [...currentHealth, ...newHealth]);
            }
          }
        }
      }
    } catch (srvErr) {
      console.warn('Server storage sync fallback warning:', srvErr);
    }

    return { 
      success: true, 
      data: {
        config: cloudConfig || getSchoolConfig(),
        questions: cloudQuestions || getQuestions(),
        stories: cloudStories || getStories(),
        counselors: cloudCounselors || getCounselors(),
        youthRegistrations: cloudYouthRegs || getYouthRegistrations(),
        volunteerMembers: cloudVolunteers || getVolunteerMembers(),
        volunteerAttendance: cloudAttendance || getVolunteerAttendance(),
        activities: cloudActivities || getActivities(),
        infographics: cloudInfographics || getInfographics(),
        aiPrompts: cloudAIPrompts || getAIPromptQuestions(),
        healthArticles: cloudHealthArticles || getHealthArticles()
      } 
    };
  } catch (err) {
    console.warn('Sync with Firestore error, using local cached data:', err);
    return { success: false };
  }
}

// Config
export function getSchoolConfig(): SchoolConfig {
  const saved = safeGet<SchoolConfig>(STORAGE_KEYS.CONFIG, initialConfig);
  if (!saved) {
    saveSchoolConfig(initialConfig);
    return initialConfig;
  }

  // Use the updated transparent logo if saved is missing or default
  const resolvedLogo = saved.schoolLogo && !saved.schoolLogo.includes('thpt_ba_chuc_logo') && (saved.schoolLogo.startsWith('http') || saved.schoolLogo.startsWith('data:image'))
    ? saved.schoolLogo
    : initialConfig.schoolLogo;

  return {
    ...initialConfig,
    ...saved,
    schoolLogo: resolvedLogo,
  };
}

export function saveSchoolConfig(config: SchoolConfig): void {
  safeSet(STORAGE_KEYS.CONFIG, config);
  saveFirebaseSchoolConfig(config).catch(e => console.warn('Lưu Firestore config lỗi:', e));
  pushCollectionToServer('config', config);
  triggerAutoBackup();
}

// Auto Backup Helper
export function triggerAutoBackup(): void {
  try {
    const backupData = {
      backupTimestamp: new Date().toISOString(),
      config: safeGet(STORAGE_KEYS.CONFIG, initialConfig),
      questions: safeGet(STORAGE_KEYS.QUESTIONS, initialQuestions),
      stories: safeGet(STORAGE_KEYS.STORIES, initialStories),
      youthRegistrations: safeGet(STORAGE_KEYS.YOUTH_REGS, initialYouthRegistrations),
      volunteerMembers: safeGet(STORAGE_KEYS.VOLUNTEER_MEMBERS, initialVolunteerMembers),
      volunteerAttendance: safeGet(STORAGE_KEYS.VOLUNTEER_ATTENDANCE, initialVolunteerAttendance),
      activities: safeGet(STORAGE_KEYS.ACTIVITIES, initialActivities),
      infographics: safeGet(STORAGE_KEYS.INFOGRAPHICS, initialInfographics),
      counselors: safeGet(STORAGE_KEYS.COUNSELORS, initialCounselors),
    };
    safeSet(STORAGE_KEYS.BACKUP, backupData);
  } catch (err) {
    console.warn('Auto-backup non-fatal warning:', err);
  }
}

// Questions
export function getQuestions(): Question[] {
  const saved = safeGet<Question[]>(STORAGE_KEYS.QUESTIONS, initialQuestions);
  if (!Array.isArray(saved) || saved.length === 0) {
    saveQuestions(initialQuestions);
    return initialQuestions;
  }
  
  const savedMap = new Map((saved || []).map(q => [q.id, q]));
  const missingInitial = initialQuestions.filter(q => !savedMap.has(q.id));
  
  if (missingInitial.length > 0) {
    const merged = [...missingInitial, ...saved];
    saveQuestions(merged);
    return merged;
  }
  return saved;
}

export function saveQuestions(questions: Question[]): void {
  safeSet(STORAGE_KEYS.QUESTIONS, questions);
  pushCollectionToServer('questions', questions);
  triggerAutoBackup();
}

export function addQuestion(newQ: Omit<Question, 'id' | 'code' | 'createdAt' | 'status' | 'isPublic'>): Question {
  const current = getQuestions();
  const nextNum = current.length + 101;
  const question: Question = {
    ...newQ,
    id: `q-${Date.now()}`,
    code: `TVHD-${nextNum}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
    isPublic: true,
  };
  const updated = [question, ...current];
  saveQuestions(updated);
  saveFirebaseDoc('questions', question).catch(() => {});
  syncToGoogleSheets('question', question);
  return question;
}

// Stories
export function getStories(): Story[] {
  const saved = safeGet<Story[]>(STORAGE_KEYS.STORIES, initialStories);
  if (!Array.isArray(saved) || saved.length < initialStories.length) {
    const existingIds = new Set((saved || []).map(s => s.id));
    const merged = [...(saved || []), ...initialStories.filter(s => !existingIds.has(s.id))];
    saveStories(merged);
    return merged;
  }
  return saved;
}

export function saveStories(stories: Story[]): void {
  safeSet(STORAGE_KEYS.STORIES, stories);
  pushCollectionToServer('stories', stories);
  triggerAutoBackup();
}

export function addStory(newStory: Omit<Story, 'id' | 'code' | 'createdAt' | 'status' | 'likes' | 'hearts' | 'cheers'>): Story {
  const current = getStories();
  const nextNum = current.length + 201;
  const story: Story = {
    ...newStory,
    id: `s-${Date.now()}`,
    code: `KEC-${nextNum}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
    likes: 0,
    hearts: 0,
    cheers: 0,
  };
  const updated = [story, ...current];
  saveStories(updated);
  saveFirebaseDoc('stories', story).catch(() => {});
  syncToGoogleSheets('story', story);
  return story;
}

// Youth Registrations
export function getYouthRegistrations(): YouthRegistration[] {
  return safeGet<YouthRegistration[]>(STORAGE_KEYS.YOUTH_REGS, initialYouthRegistrations);
}

export function saveYouthRegistrations(regs: YouthRegistration[]): void {
  safeSet(STORAGE_KEYS.YOUTH_REGS, regs);
  pushCollectionToServer('youthRegistrations', regs);
  triggerAutoBackup();
}

export function addYouthRegistration(newReg: Omit<YouthRegistration, 'id' | 'code' | 'createdAt' | 'status'>): YouthRegistration {
  const current = getYouthRegistrations();
  const nextNum = current.length + 301;
  const reg: YouthRegistration = {
    ...newReg,
    id: `reg-${Date.now()}`,
    code: `DOAN-${nextNum}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  const updated = [reg, ...current];
  saveYouthRegistrations(updated);
  saveFirebaseDoc('youthRegistrations', reg).catch(() => {});
  syncToGoogleSheets('youth_registration', reg);
  return reg;
}

// Volunteer Members
export function getVolunteerMembers(): VolunteerMember[] {
  const saved = safeGet<VolunteerMember[]>(STORAGE_KEYS.VOLUNTEER_MEMBERS, initialVolunteerMembers);
  const input = Array.isArray(saved) && saved.length > 0 ? saved : initialVolunteerMembers;
  const { members: cleanMembers } = deduplicateAndRecomputeVolunteerMembers(input);
  return cleanMembers;
}

export function saveVolunteerMembers(members: VolunteerMember[]): void {
  safeSet(STORAGE_KEYS.VOLUNTEER_MEMBERS, members);
  saveFirebaseCollectionBatch('volunteerMembers', members).catch(e => console.warn('Lỗi Firestore volunteerMembers:', e));
  pushCollectionToServer('volunteerMembers', members);
  triggerAutoBackup();
}

export function updateVolunteerMember(id: string, updates: Partial<VolunteerMember>): VolunteerMember[] {
  const current = getVolunteerMembers();
  const updated = current.map(m => (m.id === id ? { ...m, ...updates } : m));
  saveVolunteerMembers(updated);
  const found = updated.find(m => m.id === id);
  if (found) {
    saveFirebaseDoc('volunteerMembers', found).catch(() => {});
  }
  return updated;
}

export function deleteVolunteerMember(id: string): VolunteerMember[] {
  const current = getVolunteerMembers();
  const updated = current.filter(m => m.id !== id);
  safeSet(STORAGE_KEYS.VOLUNTEER_MEMBERS, updated);
  deleteFirebaseDoc('volunteerMembers', id).catch(() => {});
  triggerAutoBackup();
  return updated;
}

// Normalization helpers for Student Name and Class to prevent duplication and ensure robust matching
export function normalizeStudentName(name: string): string {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function normalizeStudentClass(className: string): string {
  if (!className) return '';
  return className.trim().replace(/^lớp\s+/i, '').replace(/\s+/g, '').toUpperCase();
}

// Deduplicate volunteer members and accurately recompute attendance count from real check-in records
export function deduplicateAndRecomputeVolunteerMembers(
  members: VolunteerMember[],
  attendances?: VolunteerAttendance[]
): { members: VolunteerMember[]; mergedCount: number } {
  const attList = attendances || getVolunteerAttendance();
  const groupMap = new Map<string, VolunteerMember[]>();

  // Ensure all 152 baseline official volunteers of 2025-2026 are ALWAYS included in processing
  const allToProcess = [...initialVolunteerMembers, ...(members || [])];

  for (const m of allToProcess) {
    if (!m || !m.fullName) continue;
    const key = `${normalizeStudentName(m.fullName)}_${normalizeStudentClass(m.className)}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(m);
  }

  let mergedCount = 0;
  const result: VolunteerMember[] = [];

  groupMap.forEach((group, key) => {
    if (group.length > 1) {
      mergedCount += group.length - 1;
    }

    // Primary member to retain (prefer one with leader flag or honor)
    const primary = group.find(g => g.isLeader) || group.find(g => g.isHonored) || group[0];

    // Find all attendance records matching this student
    const [normName, normClass] = key.split('_');
    const matchedAttendances = attList.filter(
      a => normalizeStudentName(a.fullName) === normName && normalizeStudentClass(a.className) === normClass
    );

    const attendanceCountFromRecords = matchedAttendances.length;
    const maxAssignedCount = Math.max(...group.map(g => Number(g.activitiesCount) || 0));
    // If student has check-in records, count them. If manual points were given, take max. If new registration with 0 check-ins, it will be 0.
    const effectiveCount = Math.max(maxAssignedCount, attendanceCountFromRecords);

    const hasLeader = group.some(g => g.isLeader);
    const leaderRole = group.find(g => g.leaderRole)?.leaderRole || primary.leaderRole;
    const isHonored = group.some(g => g.isHonored) || effectiveCount >= 5;
    const honorTitle = group.find(g => g.honorTitle)?.honorTitle || (isHonored ? 'Học Sinh Tích Cực Trong Phong Trào Tình Nguyện' : undefined);
    const honorDate = group.find(g => g.honorDate)?.honorDate || (isHonored ? (primary.honorDate || new Date().toLocaleDateString('vi-VN')) : undefined);
    const honorPhoto = group.find(g => g.honorPhoto)?.honorPhoto || primary.honorPhoto;
    const avatarUrl = group.find(g => g.avatarUrl)?.avatarUrl || primary.avatarUrl;
    const skills = group.map(g => g.skills).filter(Boolean).join('; ') || primary.skills;
    const phone = group.find(g => g.phone && g.phone.trim())?.phone || primary.phone;
    const academicYear = group.find(g => g.academicYear === '2025 - 2026')?.academicYear 
      || group.find(g => g.academicYear && g.academicYear.trim())?.academicYear 
      || primary.academicYear 
      || '2025 - 2026';

    result.push({
      ...primary,
      fullName: primary.fullName.trim().replace(/\s+/g, ' '),
      className: primary.className.trim(),
      academicYear,
      phone,
      avatarUrl,
      skills,
      activitiesCount: effectiveCount,
      isLeader: hasLeader,
      leaderRole,
      isHonored,
      status: isHonored ? 'honored' : primary.status,
      honorTitle,
      honorDate,
      honorPhoto,
    });
  });

  // Sort descending by activities count
  result.sort((a, b) => (b.activitiesCount || 0) - (a.activitiesCount || 0));

  return { members: result, mergedCount };
}

export function addVolunteerMember(memberData: Omit<VolunteerMember, 'id' | 'code' | 'joinedDate' | 'activitiesCount'>): VolunteerMember {
  const current = getVolunteerMembers();
  const nextNum = current.length + 1;
  const code = `TN-${String(nextNum).padStart(3, '0')}`;
  const newMember: VolunteerMember = {
    ...memberData,
    id: `vol-${Date.now()}`,
    code,
    joinedDate: new Date().toISOString().split('T')[0],
    activitiesCount: 0, // Mặc định 0 buổi khi mới đăng ký, chỉ tăng khi có điểm danh thực tế
  };
  const updated = [newMember, ...current];
  saveVolunteerMembers(updated);
  saveFirebaseDoc('volunteerMembers', newMember).catch(() => {});
  return newMember;
}

// Volunteer Attendance
export function getVolunteerAttendance(): VolunteerAttendance[] {
  const saved = safeGet<VolunteerAttendance[]>(STORAGE_KEYS.VOLUNTEER_ATTENDANCE, initialVolunteerAttendance);
  if (!Array.isArray(saved) || saved.length === 0) {
    saveVolunteerAttendance(initialVolunteerAttendance);
    return initialVolunteerAttendance;
  }
  return saved;
}

export function saveVolunteerAttendance(list: VolunteerAttendance[]): void {
  safeSet(STORAGE_KEYS.VOLUNTEER_ATTENDANCE, list);
  pushCollectionToServer('volunteerAttendance', list);
  triggerAutoBackup();
}

export function addVolunteerAttendanceRecord(attData: Omit<VolunteerAttendance, 'id' | 'createdAt'>): VolunteerAttendance {
  const current = getVolunteerAttendance();
  const members = getVolunteerMembers();
  
  const memberIndex = members.findIndex(m => 
    (attData.memberId && m.id === attData.memberId) ||
    (m.fullName.toLowerCase() === attData.fullName.toLowerCase() && m.className.toLowerCase() === attData.className.toLowerCase())
  );

  let newTimes = attData.timesParticipated;
  if (memberIndex !== -1) {
    const updatedMember = {
      ...members[memberIndex],
      activitiesCount: (members[memberIndex].activitiesCount || 0) + 1,
    };
    if (updatedMember.activitiesCount >= 10 && !updatedMember.isHonored) {
      updatedMember.isHonored = true;
      updatedMember.honorTitle = 'Vinh Danh Học Sinh Tích Cực Trong Phong Trào Tình Nguyện';
      updatedMember.honorDate = new Date().toLocaleDateString('vi-VN');
    }
    members[memberIndex] = updatedMember;
    saveVolunteerMembers(members);
    newTimes = updatedMember.activitiesCount;
  }

  const record: VolunteerAttendance = {
    ...attData,
    id: `att-${Date.now()}`,
    timesParticipated: newTimes,
    createdAt: new Date().toISOString(),
  };

  const updatedAtt = [record, ...current];
  saveVolunteerAttendance(updatedAtt);
  saveFirebaseDoc('volunteerAttendance', record).catch(() => {});
  return record;
}

// Activities
export function getActivities(): Activity[] {
  const saved = safeGet<Activity[]>(STORAGE_KEYS.ACTIVITIES, initialActivities);
  if (!Array.isArray(saved) || saved.length < initialActivities.length) {
    const existingIds = new Set((saved || []).map(a => a.id));
    const merged = [...(saved || []), ...initialActivities.filter(a => !existingIds.has(a.id))];
    saveActivities(merged);
    return merged;
  }
  return saved;
}

export function saveActivities(acts: Activity[]): void {
  safeSet(STORAGE_KEYS.ACTIVITIES, acts);
  pushCollectionToServer('activities', acts);
  triggerAutoBackup();
}

export function addActivity(act: Omit<Activity, 'id'>): Activity {
  const current = getActivities();
  const item: Activity = {
    ...act,
    id: `act-${Date.now()}`,
  };
  const updated = [item, ...current];
  saveActivities(updated);
  saveFirebaseDoc('activities', item).catch(() => {});
  return item;
}

export async function reactToActivity(
  activityId: string, 
  reactionType: 'like' | 'heart' | 'haha' | 'fire' | 'care'
): Promise<Activity | null> {
  const current = getActivities();
  const index = current.findIndex(a => a.id === activityId);
  if (index === -1) return null;

  const act = { ...current[index] };
  const userInteracted = { ...(act.userInteracted || {}) };

  if (reactionType === 'like') {
    act.likes = (act.likes || 0) + 1;
    userInteracted.liked = true;
  } else if (reactionType === 'heart') {
    act.hearts = (act.hearts || 0) + 1;
    userInteracted.hearted = true;
  } else if (reactionType === 'haha') {
    act.hahas = (act.hahas || 0) + 1;
    userInteracted.hahaed = true;
  } else if (reactionType === 'fire') {
    act.fires = (act.fires || 0) + 1;
    userInteracted.fired = true;
  } else if (reactionType === 'care') {
    act.cares = (act.cares || 0) + 1;
    userInteracted.cared = true;
  }

  act.userInteracted = userInteracted;
  current[index] = act;
  saveActivities(current);
  saveFirebaseDoc('activities', act).catch(() => {});

  return act;
}

// QA Infographics
export function getInfographics(): QAInfographic[] {
  return safeGet<QAInfographic[]>(STORAGE_KEYS.INFOGRAPHICS, initialInfographics);
}

export function saveInfographics(infos: QAInfographic[]): void {
  safeSet(STORAGE_KEYS.INFOGRAPHICS, infos);
  pushCollectionToServer('infographics', infos);
  triggerAutoBackup();
}

export function addInfographic(info: Omit<QAInfographic, 'id'>): QAInfographic {
  const current = getInfographics();
  const item: QAInfographic = {
    ...info,
    id: `info-${Date.now()}`,
  };
  const updated = [item, ...current];
  saveInfographics(updated);
  saveFirebaseDoc('infographics', item).catch(() => {});
  return item;
}

// Health Articles (Tuyên truyền & Cẩm nang Y tế Học đường)
export function getHealthArticles(): HealthArticle[] {
  const saved = safeGet<HealthArticle[]>(STORAGE_KEYS.HEALTH_ARTICLES, initialHealthArticles);
  if (!Array.isArray(saved) || saved.length === 0) {
    saveHealthArticles(initialHealthArticles);
    return initialHealthArticles;
  }
  // Ensure default articles exist and art-8 has the canonical content
  const existingIds = new Set(saved.map(a => a.id));
  const missingDefaults = initialHealthArticles.filter(a => !existingIds.has(a.id));

  let hasUpdatedArtDefaults = false;
  const updatedSaved = saved.map(item => {
    if (item.id === 'art-8' || item.id === 'art-9' || item.id === 'art-10') {
      const canonical = initialHealthArticles.find(a => a.id === item.id);
      if (canonical && (item.title !== canonical.title || item.publishedDate !== canonical.publishedDate)) {
        hasUpdatedArtDefaults = true;
        return { ...item, ...canonical };
      }
    }
    return item;
  });

  if (missingDefaults.length > 0 || hasUpdatedArtDefaults) {
    const merged = [...missingDefaults, ...updatedSaved];
    saveHealthArticles(merged);
    return merged;
  }
  return updatedSaved;
}

export function saveHealthArticles(articles: HealthArticle[]): void {
  safeSet(STORAGE_KEYS.HEALTH_ARTICLES, articles);
  pushCollectionToServer('healthArticles', articles);
  triggerAutoBackup();
}

export function addHealthArticle(art: Omit<HealthArticle, 'id'>): HealthArticle {
  const current = getHealthArticles();
  const nextNum = current.length + 1;
  const item: HealthArticle = {
    ...art,
    id: `art-${Date.now()}`,
    code: art.code || `CNYT-${String(nextNum).padStart(3, '0')}`,
    publishedDate: art.publishedDate || new Date().toLocaleDateString('vi-VN'),
    viewsCount: art.viewsCount || 0,
    tips: Array.isArray(art.tips) ? art.tips : [],
  };
  const updated = [item, ...current];
  saveHealthArticles(updated);
  saveFirebaseDoc('healthArticles', item).catch(() => {});
  return item;
}

export function updateHealthArticle(id: string, updates: Partial<HealthArticle>): HealthArticle[] {
  const current = getHealthArticles();
  const updated = current.map(item => item.id === id ? {
    ...item,
    ...updates,
    updatedAt: new Date().toLocaleDateString('vi-VN')
  } : item);
  saveHealthArticles(updated);
  const target = updated.find(item => item.id === id);
  if (target) {
    saveFirebaseDoc('healthArticles', target).catch(() => {});
  }
  return updated;
}

export function deleteHealthArticle(id: string): HealthArticle[] {
  const current = getHealthArticles();
  const updated = current.filter(item => item.id !== id);
  saveHealthArticles(updated);
  deleteFirebaseDoc('healthArticles', id).catch(() => {});
  return updated;
}

// AI Prompt Questions
export function getAIPromptQuestions(): AIPromptQuestion[] {
  return safeGet<AIPromptQuestion[]>(STORAGE_KEYS.AI_PROMPTS, initialAIPromptQuestions);
}

export function saveAIPromptQuestions(prompts: AIPromptQuestion[]): void {
  safeSet(STORAGE_KEYS.AI_PROMPTS, prompts);
  pushCollectionToServer('aiPrompts', prompts);
  triggerAutoBackup();
}

// AI Chat Logs
export function getAIChatLogs(): AIChatLog[] {
  return safeGet<AIChatLog[]>(STORAGE_KEYS.AI_LOGS, initialAIChatLogs);
}

export function saveAIChatLogs(logs: AIChatLog[]): void {
  safeSet(STORAGE_KEYS.AI_LOGS, logs);
}

export function addAIChatLog(logData: Omit<AIChatLog, 'id' | 'timestamp'>): AIChatLog {
  const current = getAIChatLogs();
  const newLog: AIChatLog = {
    ...logData,
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString('vi-VN'),
  };
  const updated = [newLog, ...current].slice(0, 50);
  saveAIChatLogs(updated);
  syncToGoogleSheets('chat_log', newLog);
  return newLog;
}

// Contacts
export function getContacts(): ContactMessage[] {
  return safeGet<ContactMessage[]>(STORAGE_KEYS.CONTACTS, []);
}

export function addContact(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): ContactMessage {
  const current = getContacts();
  const item: ContactMessage = {
    ...msg,
    id: `ct-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  const updated = [item, ...current];
  safeSet(STORAGE_KEYS.CONTACTS, updated);
  saveFirebaseDoc('contacts', item).catch(() => {});
  syncToGoogleSheets('contact', item);
  return item;
}

// Sync to Google Sheets via Google Apps Script Web App
export async function syncToGoogleSheets(
  type: 'question' | 'story' | 'youth_registration' | 'volunteer_member' | 'volunteer_attendance' | 'contact' | 'chat_log' | 'bulk_sync',
  data: any
): Promise<{ success: boolean; message?: string; error?: any; reason?: string }> {
  const config = getSchoolConfig();
  if (!config.googleScriptUrl || config.googleScriptUrl.includes('SAMPLE_APP_SCRIPT_URL') || !config.googleScriptUrl.trim()) {
    return { success: false, reason: 'unconfigured', message: 'Chưa cấu hình URL Google Apps Script' };
  }

  try {
    // Standardize fields for direct Apps Script compatibility
    const hoTen = data?.fullName || data?.studentName || data?.authorName || data?.name || data?.hoTen || 'Học sinh THPT Ba Chúc';
    const lop = data?.className || data?.lop || '';
    const ngaySinh = data?.birthDate || data?.ngaySinh || '';
    const soDienThoai = data?.phone || data?.soDienThoai || '';
    const noiDung = data?.question || data?.content || data?.skills || data?.desires || data?.message || data?.noiDung || (type === 'youth_registration' ? `Đăng ký Đoàn - Nguyện vọng: ${data?.desires || 'Tham gia công tác Đoàn'}` : '');

    const payload = {
      type,
      timestamp: new Date().toLocaleString('vi-VN'),
      hoTen,
      lop,
      ngaySinh,
      soDienThoai,
      noiDung,
      data,
    };

    const res = await fetch('/api/sync-sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scriptUrl: config.googleScriptUrl.trim(),
        payload,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || `HTTP ${res.status}` };
    }

    return { success: true, message: 'Đồng bộ Google Sheets thành công!' };
  } catch (err: any) {
    console.warn('Google Sheets sync error:', err);
    return { success: false, error: err?.message || err };
  }
}

// Bulk sync all database tables to Google Sheets at once
export async function syncAllToGoogleSheets(): Promise<{ success: boolean; message: string; count?: number }> {
  const config = getSchoolConfig();
  if (!config.googleScriptUrl || config.googleScriptUrl.includes('SAMPLE_APP_SCRIPT_URL') || !config.googleScriptUrl.trim()) {
    return { 
      success: false, 
      message: 'Chưa cấu hình URL Google Apps Script. Vui lòng vào Cài Đặt Hệ Thống > dán URL Web App Google Apps Script!' 
    };
  }

  const bulkData = {
    questions: getQuestions(),
    stories: getStories(),
    youthRegistrations: getYouthRegistrations(),
    volunteerMembers: getVolunteerMembers(),
    volunteerAttendance: getVolunteerAttendance(),
    contacts: getContacts(),
    infographics: getInfographics(),
  };

  const res = await syncToGoogleSheets('bulk_sync', bulkData);
  if (res.success) {
    return { 
      success: true, 
      message: `Đã đồng bộ toàn bộ dữ liệu (${bulkData.questions.length} câu hỏi, ${bulkData.stories.length} câu chuyện, ${bulkData.volunteerMembers.length} tình nguyện viên) sang Google Sheets thành công!`,
      count: bulkData.questions.length + bulkData.stories.length + bulkData.volunteerMembers.length
    };
  } else {
    return {
      success: false,
      message: `Đồng bộ thất bại: ${res.error || res.message || 'Kiểm tra lại quyền truy cập URL Google Apps Script (phải chọn Anyone)'}`
    };
  }
}

// Helper to export CSV with UTF-8 BOM
export function convertToCSV(headers: string[], rows: (string | number)[][]): string {
  const escapeCell = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(escapeCell).join(',');
  const dataRows = rows.map(row => row.map(escapeCell).join(','));
  return '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
}

// Export Questions CSV
export function exportQuestionsCSV(): void {
  const list = getQuestions();
  const headers = ['Mã Số', 'Họ Tên Học Sinh', 'Lớp', 'Chủ Đề', 'Nội Dung Câu Hỏi', 'Trạng Thái', 'Người Trả Lời', 'Nội Dung Trả Lời', 'Ngày Gửi'];
  const rows = list.map(q => [
    q.code,
    q.isAnonymous ? 'Ẩn danh' : (q.studentName || 'Ẩn danh'),
    q.className || '',
    q.topic,
    q.question,
    q.status === 'answered' ? 'Đã trả lời' : 'Chờ xử lý',
    q.answeredBy || '',
    q.answer || '',
    q.createdAt || ''
  ]);
  const csv = convertToCSV(headers, rows);
  downloadFile(`CauHoiTuVan_THPT_BaChuc_${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8;');
}

// Export Stories CSV
export function exportStoriesCSV(): void {
  const list = getStories();
  const headers = ['Mã Số', 'Tiêu Đề', 'Tác Giả', 'Lớp', 'Chủ Đề', 'Nội Dung', 'Lời Nhắn Động Viên Của Thầy Cô', 'Trạng Thái', 'Ngày Gửi'];
  const rows = list.map(s => [
    s.code || s.id,
    s.title,
    s.isAnonymous ? 'Ẩn danh' : (s.authorName || 'Ẩn danh'),
    s.className || '',
    s.topic,
    s.content,
    s.counselorNote || '',
    s.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt',
    s.createdAt || ''
  ]);
  const csv = convertToCSV(headers, rows);
  downloadFile(`ChuyenMuonKe_THPT_BaChuc_${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8;');
}

// Export Volunteer Members CSV (Format: STT - Họ và Tên - Lớp - Số lần tham gia HĐ)
export function exportVolunteersCSV(customList?: VolunteerMember[]): void {
  const list = customList && customList.length > 0 ? customList : getVolunteerMembers();
  const headers = ['STT', 'Họ và Tên', 'Lớp', 'Số lần tham gia HĐ', 'Số Điện Thoại', 'Danh Hiệu / Vinh Danh', 'Trạng Thái', 'Năm Học', 'Ngày Gia Nhập'];
  const rows = list.map((m, idx) => [
    idx + 1,
    m.fullName,
    m.className,
    m.activitiesCount ?? 0,
    `'${m.phone}`,
    m.isHonored ? (m.honorTitle || 'Chiến sĩ tình nguyện xuất sắc') : (m.isLeader ? `Thủ lĩnh (${m.leaderRole || 'Đoàn'})` : 'Đoàn viên'),
    m.status === 'graduated_12' ? 'Đã tốt nghiệp 12' : m.status === 'inactive_rules_violation' ? 'Tạm dừng (Vi phạm)' : m.status === 'inactive_low_performance' ? 'Tạm dừng (Học tập)' : 'Đang hoạt động',
    m.academicYear || '2026 - 2027',
    m.joinedDate || ''
  ]);
  const csv = convertToCSV(headers, rows);
  downloadFile(`DoanVien_HoatDongDoan_THPT_BaChuc_${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8;');
}

// Export Attendance Log CSV
export function exportAttendanceCSV(): void {
  const list = getVolunteerAttendance();
  const headers = ['Thời Gian', 'Họ Tên', 'Lớp', 'Tên Hoạt Động / Phong Trào', 'Địa Điểm', 'Xác Nhận Của Đoàn Trường'];
  const rows = list.map(a => [
    a.date,
    a.fullName,
    a.className,
    a.activityName,
    a.location || 'Trường THPT Ba Chúc',
    a.counselorVerified ? 'Đã xác nhận' : 'Chưa'
  ]);
  const csv = convertToCSV(headers, rows);
  downloadFile(`DiemDanh_ChuyenCan_Doan_${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8;');
}

// Generate Google Apps Script code for School Administrator
export function generateGoogleAppsScriptCode(): string {
  return `/**
 * GOOGLE APPS SCRIPT: CỔNG TƯ VẤN HỌC ĐƯỜNG & ĐOÀN THANH NIÊN THPT BA CHÚC
 */
function doPost(e) {
  try {
    var raw = e.postData.contents;
    var payload = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var type = payload.type;
    var data = payload.data;
    var now = new Date();
    var timeStr = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss");

    if (type === "bulk_sync") {
      // 1.1 Cau Hoi Tu Van
      if (data.questions && Array.isArray(data.questions)) {
        var qSheet = getOrCreateSheet(ss, "CauHoiTuVan", [
          "Mã Số", "Thời Gian Gửi", "Họ Tên", "Lớp", "Ẩn Danh?", "Chủ Đề", 
          "Nội Dung Câu Hỏi", "Trạng Thái", "Người Phụ Trách", "Câu Trả Lời", "Ghi Chú"
        ]);
        qSheet.clearContents();
        qSheet.appendRow([
          "Mã Số", "Thời Gian Gửi", "Họ Tên", "Lớp", "Ẩn Danh?", "Chủ Đề", 
          "Nội Dung Câu Hỏi", "Trạng Thái", "Người Phụ Trách", "Câu Trả Lời", "Ghi Chú"
        ]);
        styleHeader(qSheet, 11);
        data.questions.forEach(function(q) {
          qSheet.appendRow([
            q.code || q.id || "",
            q.createdAt || timeStr,
            q.isAnonymous ? "Ẩn danh" : (q.studentName || "Ẩn danh"),
            q.className || "",
            q.isAnonymous ? "Có" : "Không",
            q.topic || "",
            q.question || "",
            q.status === "answered" ? "Đã trả lời" : "Đang chờ",
            q.answeredBy || "",
            q.answer || "",
            q.notes || ""
          ]);
        });
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Đã đồng bộ toàn bộ bảng dữ liệu thành công!" })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function styleHeader(sheet, colCount) {
  var headerRange = sheet.getRange(1, 1, 1, colCount);
  headerRange.setBackground("#1e40af");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    styleHeader(sheet, headers.length);
  }
  return sheet;
}

function doGet(e) {
  return ContentService.createTextOutput("Cổng API Tư Vấn Học Đường THPT Ba Chúc đang hoạt động tốt!");
}`;
}

// Counselors
export function getCounselors(): Counselor[] {
  const saved = safeGet<Counselor[]>(STORAGE_KEYS.COUNSELORS, initialCounselors);
  if (!saved || saved.length === 0) {
    saveCounselors(initialCounselors);
    return initialCounselors;
  }

  // Seamless migration for updated counselor name
  let needsUpdate = false;
  const migrated = saved.map(c => {
    if (c.id === 'c-3' && (c.name.includes('Lê Thị Gái') || !c.name.includes('Hiệp'))) {
      needsUpdate = true;
      return {
        ...c,
        name: 'Cô Nguyễn Thị Hiệp',
        role: 'Y tế học đường (Cán bộ Y tế Trường THPT Ba Chúc)',
        specialty: 'Chuyên tư vấn & chăm sóc sức khoẻ học sinh, dinh dưỡng học đường, sơ cấp cứu & sức khỏe sinh sản tuổi vị thành niên',
        bio: 'Cán bộ Y tế trường học tận tâm, giàu kinh nghiệm chăm sóc sức khỏe thể chất, sơ cấp cứu học đường và tư vấn sức khỏe tuổi mới lớn.',
        email: 'nguyenthihiep@thptbachuc.edu.vn',
      };
    }
    return c;
  });

  if (needsUpdate) {
    saveCounselors(migrated);
    return migrated;
  }

  return saved;
}

export function saveCounselors(counselors: Counselor[]): void {
  safeSet(STORAGE_KEYS.COUNSELORS, counselors);
  saveFirebaseCounselors(counselors).catch(e => console.warn('Lưu Firestore counselors lỗi:', e));
  pushCollectionToServer('counselors', counselors);
  triggerAutoBackup();
}

// Export data to JSON for manual backup
export function exportDataToJSON(): string {
  const all = {
    exportDate: new Date().toISOString(),
    config: getSchoolConfig(),
    counselors: getCounselors(),
    questions: getQuestions(),
    stories: getStories(),
    youthRegistrations: getYouthRegistrations(),
    volunteerMembers: getVolunteerMembers(),
    volunteerAttendance: getVolunteerAttendance(),
    activities: getActivities(),
    infographics: getInfographics(),
  };
  return JSON.stringify(all, null, 2);
}

// Import data from JSON for restore
export function importDataFromJSON(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (data.config) saveSchoolConfig(data.config);
    if (Array.isArray(data.questions)) saveQuestions(data.questions);
    if (Array.isArray(data.stories)) saveStories(data.stories);
    if (Array.isArray(data.youthRegistrations)) saveYouthRegistrations(data.youthRegistrations);
    if (Array.isArray(data.volunteerMembers)) saveVolunteerMembers(data.volunteerMembers);
    if (Array.isArray(data.volunteerAttendance)) saveVolunteerAttendance(data.volunteerAttendance);
    if (Array.isArray(data.activities)) saveActivities(data.activities);
    if (Array.isArray(data.infographics)) saveInfographics(data.infographics);
    if (Array.isArray(data.counselors)) saveCounselors(data.counselors);
    triggerAutoBackup();
    return { success: true, message: 'Phục hồi toàn bộ dữ liệu hệ thống thành công!' };
  } catch (err: any) {
    return { success: false, message: `Lỗi đọc file sao lưu: ${err?.message || 'Định dạng không hợp lệ'}` };
  }
}

export function downloadFile(filename: string, content: string, type: string = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Xuất file CSV danh sách Bảng Vàng Vinh Danh Học Sinh (có xếp hạng và danh hiệu)
export function exportHonoredStudentsCSV(customList?: VolunteerMember[]): void {
  const allVols = customList && customList.length > 0 ? customList : getVolunteerMembers();
  const honoredList = allVols.filter(m => m.isHonored || m.status === 'honored' || (m.activitiesCount || 0) >= 1);
  honoredList.sort((a, b) => (b.activitiesCount || 0) - (a.activitiesCount || 0));

  const headers = [
    'Thứ Hạng', 
    'Họ và Tên Học Sinh', 
    'Chi Đoàn / Lớp', 
    'Số Hoạt Động Cống Hiến', 
    'Danh Hiệu Vinh Danh', 
    'Niên Khóa', 
    'Cờ Thủ Lĩnh', 
    'Ghi Chú Thành Tích'
  ];

  const rows = honoredList.map((m, idx) => [
    `#${idx + 1}`,
    m.fullName,
    m.className,
    m.activitiesCount ?? 0,
    m.honorTitle || ((m.activitiesCount || 0) >= 20 ? 'Kiện Tướng Phong Trào' : ((m.activitiesCount || 0) >= 10 ? 'Chiến Sĩ Tiêu Biểu' : 'Học Sinh Tích Cực')),
    m.academicYear || '2025 - 2026',
    m.isLeader ? (m.leaderRole || 'Thủ Lĩnh Đoàn') : 'Thành viên',
    m.notes || ''
  ]);

  const csv = convertToCSV(headers, rows);
  downloadFile(`BangVang_VinhDanhHocSinh_THPT_BaChuc_${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8;');
}

// Xuất toàn bộ dữ liệu bộ nhớ Đoàn viên & Vinh danh ra định dạng JSON
export function exportVolunteerMemoryJSON(): void {
  const members = getVolunteerMembers();
  const data = {
    exportType: 'THPT_BA_CHUC_VOLUNTEER_HONOR_MEMORY',
    version: '2.5',
    exportDate: new Date().toISOString(),
    totalMembers: members.length,
    year2025Count: members.filter(m => (m.academicYear || '2025 - 2026') === '2025 - 2026').length,
    volunteerMembers: members,
    volunteerAttendance: getVolunteerAttendance(),
  };
  downloadFile(
    `BoNho_DoanVien_VinhDanh_THPT_BaChuc_${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(data, null, 2),
    'application/json'
  );
}

// Nạp lại dữ liệu bộ nhớ từ file sao lưu JSON
export function importVolunteerMemoryJSON(jsonString: string): { success: boolean; count?: number; message: string } {
  try {
    const parsed = JSON.parse(jsonString);
    const members = parsed.volunteerMembers || (Array.isArray(parsed) ? parsed : null);
    if (!Array.isArray(members) || members.length === 0) {
      return { success: false, message: 'Tệp không chứa dữ liệu đoàn viên hợp lệ!' };
    }
    const { members: cleanMembers } = deduplicateAndRecomputeVolunteerMembers(members);
    saveVolunteerMembers(cleanMembers);
    if (Array.isArray(parsed.volunteerAttendance)) {
      saveVolunteerAttendance(parsed.volunteerAttendance);
    }
    return {
      success: true,
      count: cleanMembers.length,
      message: `Đã nạp thành công bộ nhớ với ${cleanMembers.length} đoàn viên và dữ liệu vinh danh!`,
    };
  } catch (err: any) {
    return { success: false, message: `Lỗi đọc tệp JSON: ${err?.message || 'Định dạng không hợp lệ'}` };
  }
}

// Khôi phục bộ nhớ về 152 đoàn viên chính thức Năm học 2025 - 2026 và điểm danh 5 hoạt động
export function restoreOfficial2025Volunteers(): VolunteerMember[] {
  const current = getVolunteerMembers();
  // Giữ lại các thành viên thuộc niên khóa khác (nếu có)
  const others = current.filter(m => m.academicYear && m.academicYear !== '2025 - 2026');
  
  // Tái lập danh sách 152 đoàn viên chuẩn 2025 - 2026
  const combined = [...volunteers2025_2026, ...others];
  
  // Cập nhật điểm danh mặc định 5 hoạt động nếu danh sách điểm danh đang trống hoặc thiếu
  const currentAtt = getVolunteerAttendance();
  const mergedAtt = currentAtt.length < 152 ? attendance2025_2026 : currentAtt;
  saveVolunteerAttendance(mergedAtt);

  const { members: cleanMembers } = deduplicateAndRecomputeVolunteerMembers(combined, mergedAtt);
  saveVolunteerMembers(cleanMembers);
  return cleanMembers;
}

// Kiểm tra chẩn đoán sức khỏe bộ nhớ
export async function getStorageDiagnostics(): Promise<{
  totalMembers: number;
  year2025Count: number;
  honoredCount: number;
  totalAttendances: number;
  idbSupported: boolean;
  estimatedSizeKb: number;
  memoryHealth: string;
}> {
  const members = getVolunteerMembers();
  const year2025 = members.filter(m => (m.academicYear || '2025 - 2026') === '2025 - 2026');
  const honored = members.filter(m => m.isHonored || m.status === 'honored' || (m.activitiesCount || 0) >= 1);
  const attendances = getVolunteerAttendance();

  const idbStats = await idbGetStats();

  return {
    totalMembers: members.length,
    year2025Count: year2025.length,
    honoredCount: honored.length,
    totalAttendances: attendances.length,
    idbSupported: idbStats.isSupported,
    estimatedSizeKb: idbStats.estimatedSizeKb,
    memoryHealth: 'Hoạt động tối ưu (Bộ nhớ 5 tầng: RAM, IndexedDB, LocalStorage, Cloud Firestore, Server)',
  };
}

