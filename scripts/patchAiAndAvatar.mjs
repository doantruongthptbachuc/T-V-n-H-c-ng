import fs from 'node:fs';

const storagePath = 'src/utils/storage.ts';
const avatarPath = 'src/components/CounselingHome.tsx';

function read(path) { return fs.readFileSync(path, 'utf8'); }
function write(path, text) { fs.writeFileSync(path, text, 'utf8'); }
function replaceOrFail(text, pattern, replacement, label) {
  if (!pattern.test(text)) throw new Error(`Patch target not found: ${label}`);
  return text.replace(pattern, replacement);
}

// AI knowledge edited by administrators must be durable in Firestore, not only local/server cache.
let storage = read(storagePath);
storage = replaceOrFail(
  storage,
  /export function saveAIPromptQuestions\(prompts: AIPromptQuestion\[\]\): void \{[\s\S]*?\n}\n\n\/\/ AI Chat Logs/,
  `export function saveAIPromptQuestions(prompts: AIPromptQuestion[]): void {\n  // Keep the browser cache fast, but make Firestore the durable source of truth.\n  safeSet(STORAGE_KEYS.AI_PROMPTS, prompts);\n  saveFirebaseCollectionBatch('aiPrompts', prompts).catch(e => console.warn('Lỗi lưu AI prompts vào Firestore:', e));\n  // Also push to the server/realtime layer for existing installations.\n  pushCollectionToServer('aiPrompts', prompts);\n  triggerAutoBackup();\n}\n\n// AI Chat Logs`,
  'saveAIPromptQuestions'
);
write(storagePath, storage);

// Counselor avatar: crop to a square before compression/upload so portrait faces fit the circular avatar frame.
let avatar = read(avatarPath);
avatar = replaceOrFail(
  avatar,
  /const compressed = await compressImageFile\(file, 400, 400, 0\.88\);\n        setEditAvatar\(compressed\);/,
  `const cropped = await new Promise<Blob>((resolve, reject) => {\n          const reader = new FileReader();\n          reader.onload = () => {\n            const img = new Image();\n            img.onload = () => {\n              const size = Math.min(img.width, img.height);\n              const sx = Math.round((img.width - size) / 2);\n              const sy = Math.round((img.height - size) / 2);\n              const canvas = document.createElement('canvas');\n              canvas.width = 800;\n              canvas.height = 800;\n              const ctx = canvas.getContext('2d');\n              if (!ctx) return reject(new Error('Không tạo được canvas xén ảnh'));\n              ctx.imageSmoothingEnabled = true;\n              ctx.imageSmoothingQuality = 'high';\n              ctx.drawImage(img, sx, sy, size, size, 0, 0, 800, 800);\n              canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Không xuất được ảnh đã xén')), 'image/jpeg', 0.9);\n            };\n            img.onerror = () => reject(new Error('Không đọc được ảnh'));\n            img.src = String(reader.result);\n          };\n          reader.onerror = () => reject(new Error('Không đọc được file ảnh'));\n          reader.readAsDataURL(file);\n        });\n        const croppedFile = new File([cropped], file.name.replace(/\\.[^/.]+$/, '') + '-avatar.jpg', { type: 'image/jpeg' });\n        const compressed = await compressImageFile(croppedFile, 400, 400, 0.88, 'images/counselors');\n        setEditAvatar(compressed);`,
  'counselor avatar crop'
);
write(avatarPath, avatar);

console.log('AI knowledge persistence and counselor avatar square crop patch applied.');
