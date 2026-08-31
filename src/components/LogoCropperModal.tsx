import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Move, 
  Check, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Upload, 
  RefreshCw,
  Crop
} from 'lucide-react';

interface LogoCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage: string;
  onSaveLogo: (croppedDataUrl: string) => void;
  schoolName?: string;
}

export const LogoCropperModal: React.FC<LogoCropperModalProps> = ({
  isOpen,
  onClose,
  initialImage,
  onSaveLogo,
  schoolName = 'TRƯỜNG THPT BA CHÚC',
}) => {
  const [imageSrc, setImageSrc] = useState<string>(initialImage);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [shape, setShape] = useState<'circle' | 'square'>('circle');
  const [previewTab, setPreviewTab] = useState<'desktop' | 'mobile'>('desktop');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setImageSrc(initialImage);
    setZoom(1);
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);
  }, [initialImage, isOpen]);

  // Load image object whenever source changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      renderCanvas();
    };
    img.src = imageSrc;
  }, [imageSrc, zoom, rotation, offsetX, offsetY, shape]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageSrc(reader.result);
          setZoom(1);
          setRotation(0);
          setOffsetX(0);
          setOffsetY(0);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - offsetX, y: e.touches[0].clientY - offsetY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffsetX(e.touches[0].clientX - dragStart.x);
    setOffsetY(e.touches[0].clientY - dragStart.y);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Render on hidden canvas to export clean 512x512 PNG
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 512;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Save state
    ctx.save();

    // Clip according to shape if requested
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
    }

    // Move to center
    ctx.translate(size / 2 + offsetX * (size / 240), size / 2 + offsetY * (size / 240));
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw image centered
    const aspect = img.width / img.height;
    let drawWidth = size;
    let drawHeight = size;
    if (aspect > 1) {
      drawWidth = size * aspect;
    } else {
      drawHeight = size / aspect;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderCanvas();
    const croppedDataUrl = canvas.toDataURL('image/png', 0.95);
    onSaveLogo(croppedDataUrl);
    onClose();
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 my-6 border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer hover:bg-slate-100 transition"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 pr-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase">
            <Crop className="w-3.5 h-3.5 text-amber-600" />
            <span>CÔNG CỤ XÉN & CĂN CHỈNH LOGO ĐỒNG BỘ</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            ĐIỀU CHỈNH LOGO & ẢNH ĐẠI DIỆN TRƯỜNG
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Kéo thả, phóng to/thu nhỏ và xoay để logo hiển thị chuẩn đẹp, sắc nét trên cả Máy tính (Desktop) và Điện thoại (Mobile).
          </p>
        </div>

        {/* Workspace: Interactive Cropper Canvas + Live Mockup Previews */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Interactive Crop Frame */}
          <div className="md:col-span-6 flex flex-col items-center justify-center p-4 bg-slate-900 rounded-3xl shadow-inner relative select-none">
            <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center space-x-1">
              <Move className="w-3.5 h-3.5 text-amber-400" />
              <span>Nhấp giữ & Kéo để dịch chuyển vị trí Logo</span>
            </div>

            {/* Interactive Viewport Box */}
            <div 
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`w-60 h-60 relative overflow-hidden bg-slate-950 border-2 border-amber-400 shadow-2xl cursor-grab active:cursor-grabbing flex items-center justify-center ${
                shape === 'circle' ? 'rounded-full ring-4 ring-amber-400/30' : 'rounded-2xl ring-4 ring-amber-400/30'
              }`}
            >
              {imageSrc ? (
                <div
                  style={{
                    transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${zoom})`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    transformOrigin: 'center center',
                  }}
                  className="w-full h-full flex items-center justify-center pointer-events-none"
                >
                  <img
                    src={imageSrc}
                    alt="Logo Crop Source"
                    className="max-w-none max-h-none object-contain w-full h-full select-none"
                    draggable={false}
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-400">Chưa có ảnh logo</p>
              )}

              {/* Grid Guidelines Overlay */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/20 opacity-30">
                <div className="border-r border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-b border-white/20"></div>
                <div className="border-r border-white/20"></div>
                <div className="border-r border-white/20"></div>
                <div></div>
              </div>
            </div>

            {/* Shape Toggles */}
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShape('circle')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition cursor-pointer ${
                  shape === 'circle' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Tròn (Chuẩn Web & App)
              </button>
              <button
                type="button"
                onClick={() => setShape('square')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition cursor-pointer ${
                  shape === 'square' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Vuông Bo Góc
              </button>
            </div>
          </div>

          {/* Controls & Mockup Previews */}
          <div className="md:col-span-6 space-y-4">
            {/* Zoom Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center space-x-1">
                  <ZoomIn className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Kích thước phóng to / thu nhỏ:</span>
                </span>
                <span className="font-mono text-indigo-600 font-black">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="0.4"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.min(3, Number((z + 0.1).toFixed(2))))}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                  title="Phóng to"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rotation Controls */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center space-x-1">
                  <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Xoay góc logo:</span>
                </span>
                <span className="font-mono text-indigo-600 font-black">{rotation}°</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRotation(r => (r - 90 + 360) % 360)}
                  className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  ↺ Xoay trái 90°
                </button>
                <button
                  type="button"
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  ↻ Xoay phải 90°
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-1"
                  title="Đặt lại vị trí gốc"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Đặt lại</span>
                </button>
              </div>
            </div>

            {/* Change File Trigger */}
            <div className="pt-1">
              <label className="inline-flex items-center justify-center space-x-2 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer transition border border-slate-200">
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tải ảnh khác từ máy tính lên để xén...</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Live Synchronized Previews Tab */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>XEM TRƯỚC ĐỒNG BỘ:</span>
                </span>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('desktop')}
                    className={`px-2 py-1 text-[11px] font-bold rounded-md transition cursor-pointer flex items-center space-x-1 ${
                      previewTab === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>Máy tính</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('mobile')}
                    className={`px-2 py-1 text-[11px] font-bold rounded-md transition cursor-pointer flex items-center space-x-1 ${
                      previewTab === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Điện thoại</span>
                  </button>
                </div>
              </div>

              {/* Desktop Mockup */}
              {previewTab === 'desktop' ? (
                <div className="bg-slate-900 text-white p-3 rounded-xl flex items-center space-x-3 shadow-md">
                  <div className="w-11 h-11 rounded-full bg-white p-0.5 shadow-md ring-2 ring-amber-400 flex items-center justify-center shrink-0 overflow-hidden">
                    <div 
                      style={{
                        transform: `translate(${offsetX * 0.18}px, ${offsetY * 0.18}px) rotate(${rotation}deg) scale(${zoom})`,
                      }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <img src={imageSrc} alt="Preview Desktop" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-amber-300 leading-tight">TƯ VẤN HỌC ĐƯỜNG</div>
                    <div className="text-[10px] text-slate-300 font-semibold">{schoolName}</div>
                  </div>
                </div>
              ) : (
                /* Mobile Mockup */
                <div className="bg-slate-900 text-white p-2.5 rounded-xl flex items-center justify-between shadow-md max-w-xs mx-auto">
                  <div className="flex items-center space-x-2">
                    <div className="w-9 h-9 rounded-full bg-white p-0.5 ring-2 ring-amber-400 flex items-center justify-center shrink-0 overflow-hidden">
                      <div 
                        style={{
                          transform: `translate(${offsetX * 0.15}px, ${offsetY * 0.15}px) rotate(${rotation}deg) scale(${zoom})`,
                        }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <img src={imageSrc} alt="Preview Mobile" className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <div className="text-[11px] font-black text-amber-300">TƯ VẤN HỌC ĐƯỜNG</div>
                  </div>
                  <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-400 text-xs">☰</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden Canvas used for high-res cropping export */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Modal Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl text-xs shadow-lg transition cursor-pointer flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>ÁP DỤNG & ĐỒNG BỘ LOGO MỚI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
