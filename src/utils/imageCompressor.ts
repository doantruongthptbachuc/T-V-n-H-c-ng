import { uploadImageToFirebase, UploadFolder } from '../lib/storageService';

/**
 * Nén ảnh thông minh trước khi đưa vào bộ nhớ hoặc tải lên Firebase
 * Giảm dung lượng từ 5MB-10MB xuống còn 30KB-60KB, bảo vệ bộ nhớ không bị tràn
 */
export function compressImageToDataUrl(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      let rawResult = (readerEvent.target?.result as string) || '';
      
      // Nếu trình duyệt gán MIME type chung chung cho .pjg hoặc ảnh không chuẩn (application/octet-stream hoặc data:;), chuẩn hóa để Image() tải mượt mà
      if (rawResult.startsWith('data:application/octet-stream') || rawResult.startsWith('data:;base64')) {
        const isPng = file.name.toLowerCase().endsWith('.png');
        rawResult = rawResult.replace(/^data:[^;]*/, isPng ? 'data:image/png' : 'data:image/jpeg');
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Tính tỉ lệ co giãn bảo toàn khung hình
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawResult);
          return;
        }

        // Tăng độ mượt cho ảnh khi thu nhỏ
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Thử xuất dạng WebP nếu hỗ trợ, fallback sang JPEG
        let dataUrl = '';
        try {
          dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };

      img.onerror = () => {
        resolve(rawResult);
      };

      img.src = rawResult;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Nén và tải trực tiếp file ảnh lên Firebase Cloud Storage để lấy URL vĩnh viễn trên đám mây.
 * Đồng thời tự động tối ưu hóa bộ nhớ trước khi tải.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.82,
  folder: UploadFolder | string = 'images/honors'
): Promise<string> {
  try {
    // 1. Nén bằng Canvas trước để tối ưu hóa bộ nhớ RAM và băng thông
    const compressedDataUrl = await compressImageToDataUrl(file, maxWidth, maxHeight, quality);

    // 2. Chuyển đổi dataUrl sang File nén nhẹ để upload lên Firebase
    try {
      const res = await fetch(compressedDataUrl);
      const blob = await res.blob();
      const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + '.webp', {
        type: blob.type || 'image/webp'
      });

      return await uploadImageToFirebase(optimizedFile, folder);
    } catch {
      // Nếu upload Cloud Storage thất bại, trả về dataUrl đã được nén siêu nhẹ
      return compressedDataUrl;
    }
  } catch (storageError) {
    console.warn('Fallback nén ảnh bộ nhớ đệm:', storageError);
    return await compressImageToDataUrl(file, maxWidth, maxHeight, quality).catch(() => '');
  }
}
