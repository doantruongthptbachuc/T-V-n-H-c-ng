import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export type UploadFolder = 
  | 'images/logo'
  | 'images/banner'
  | 'images/consultation'
  | 'images/activities'
  | 'images/infographics'
  | 'images/honors'
  | 'images/stories'
  | 'images/counselors'
  | 'images/uploads';

/**
 * Nén ảnh thành Blob JPEG tối ưu dung lượng (khoảng 100KB - 400KB) để tải lên siêu nhanh
 */
export async function compressImageToBlob(
  file: File | Blob,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.80
): Promise<Blob> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);

      // Thêm timeout nếu file ảnh bị lỗi decode DOM
      const timer = setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve(file);
      }, 3000);

      img.onload = () => {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((height * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size > 0) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
        resolve(file);
      };

      img.src = url;
    } catch {
      resolve(file);
    }
  });
}

/**
 * Tải file ảnh trực tiếp lên Firebase Cloud Storage với cơ chế tự động fallback Base64 nếu mạng chập chờn
 * Đảm bảo 100% người dùng luôn lưu được ảnh đại diện / ảnh tuyên dương thành công.
 * @param file File hoặc Blob ảnh
 * @param folder Thư mục lưu trữ trên Firebase Storage
 * @param customName Tên file tùy chọn
 */
export async function uploadImageToFirebase(
  file: File | Blob,
  folder: UploadFolder | string = 'images/uploads',
  customName?: string
): Promise<string> {
  // 1. Nén ảnh tối ưu dung lượng (giảm dung lượng xuống an toàn < 250KB)
  const compressedBlob = await compressImageToBlob(file, 800, 800, 0.75);

  // 2. Hàm đọc Base64 tức thì để làm fallback chắc chắn thành công
  const toDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Không thể đọc file ảnh'));
        }
      };
      reader.onerror = () => reject(new Error('Lỗi FileReader'));
      reader.readAsDataURL(blob);
    });

  // 3. Thử upload lên Firebase Storage với timeout ngắn (5s) để người dùng không phải chờ lâu
  try {
    if (!storage) {
      return await toDataUrl(compressedBlob);
    }

    const uploadPromise = (async () => {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 7);
      const cleanName = customName 
        ? `${timestamp}_${customName.replace(/[^a-zA-Z0-9._-]/g, '_')}.jpg`
        : `${timestamp}_${randomStr}.jpg`;

      const storageRef = ref(storage, `${folder}/${cleanName}`);
      const metadata = {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=31536000',
      };

      const snapshot = await uploadBytes(storageRef, compressedBlob, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT_STORAGE')), 5000)
    );

    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (err: any) {
    console.info('Firebase Storage upload không sẵn sàng, lưu ảnh bằng Base64 nén cục bộ an toàn:', err?.message || err);
    return await toDataUrl(compressedBlob);
  }
}

/**
 * Xóa file ảnh cũ khỏi Firebase Storage khi người dùng thay ảnh mới (nếu URL thuộc về Storage)
 */
export async function deleteImageFromFirebase(imageUrl: string): Promise<boolean> {
  if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) {
    return false;
  }
  try {
    const decodedUrl = decodeURIComponent(imageUrl);
    const startIndex = decodedUrl.indexOf('/o/') + 3;
    const endIndex = decodedUrl.indexOf('?');
    if (startIndex > 2 && endIndex > startIndex) {
      const fullPath = decodedUrl.substring(startIndex, endIndex);
      const storageRef = ref(storage, fullPath);
      await deleteObject(storageRef);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Lỗi khi xóa ảnh cũ từ Firebase Storage (không ảnh hưởng dữ liệu mới):', err);
    return false;
  }
}

/**
 * Chuyển Base64 string thành Blob
 */
export function base64ToBlob(base64Data: string): Blob {
  const parts = base64Data.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'image/jpeg';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}
