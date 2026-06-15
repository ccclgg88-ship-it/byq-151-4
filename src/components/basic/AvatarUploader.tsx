import { useState, useRef, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Camera, X, Check, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { cn } from '@/lib/utils';

interface Point {
  x: number;
  y: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.crossOrigin = 'anonymous';
    image.src = url;
  });

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return canvas.toDataURL('image/jpeg', 0.92);
};

export function AvatarUploader() {
  const avatar = useEmployeeStore((s) => s.profile?.basic.avatar ?? '');
  const name = useEmployeeStore((s) => s.profile?.basic.name ?? '用户');
  const isEditMode = useEmployeeStore((s) => s.isEditMode);
  const updateBasicField = useEmployeeStore((s) => s.updateBasicField);
  const fieldChanges = useEmployeeStore((s) => s.fieldChanges);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const avatarChanged = fieldChanges.some((c) => c.fieldKey === 'basic.avatar');

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmCrop = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      updateBasicField('avatar', croppedImage);
      setShowCropper(false);
      setImageSrc('');
    } catch (e) {
      console.error('裁剪失败:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setImageSrc('');
  };

  const handleTriggerUpload = () => {
    if (!isEditMode) return;
    fileInputRef.current?.click();
  };

  const getInitials = (text: string) => {
    return text.trim().charAt(0);
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="relative group">
          <div
            className={cn(
              'relative w-32 h-32 rounded-full overflow-hidden shadow-lg transition-all duration-300',
              avatarChanged && 'ring-4 ring-amber-400/60'
            )}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1e3a8a] to-[#3b5998] text-white text-4xl font-bold">
                {getInitials(name)}
              </div>
            )}

            {isEditMode && (
              <button
                onClick={handleTriggerUpload}
                className="absolute inset-0 bg-[#1e3a8a]/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer"
              >
                <div className="flex flex-col items-center gap-1">
                  <Camera className="w-8 h-8 text-white" />
                  <span className="text-xs text-white font-medium">更换头像</span>
                </div>
              </button>
            )}
          </div>

          {avatarChanged && (
            <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-md">
              已修改
            </div>
          )}
        </div>

        {isEditMode && (
          <p className="mt-3 text-xs text-slate-500 text-center">
            支持 JPG、PNG 格式，建议尺寸 400×400
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {showCropper && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">裁剪头像</h3>
              <button
                onClick={handleCancelCrop}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative h-[360px] bg-slate-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="px-5 py-4 space-y-3 bg-slate-50">
              <div className="flex items-center gap-3">
                <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#1e3a8a]"
                />
                <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setRotation((r) => (r - 90) % 360)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <RotateCw className="w-4 h-4" style={{ transform: 'scaleX(-1)' }} />
                  左旋90°
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                  右旋90°
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200">
              <button
                onClick={handleCancelCrop}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmCrop}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#3b5998] text-white text-sm font-semibold shadow-lg shadow-[#1e3a8a]/25 hover:shadow-[#1e3a8a]/40 transition-all disabled:opacity-60"
              >
                <Check className="w-4 h-4" />
                {isProcessing ? '处理中...' : '确认裁剪'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
