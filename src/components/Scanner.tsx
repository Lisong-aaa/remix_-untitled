import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Check, Loader2, Info, Upload } from 'lucide-react';
import { analyzeFoodImage } from '../api';

const MAX_IMAGE_DIMENSION = 768;

function compressImage(source: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    image.onerror = () => reject(new Error('Unable to read image'));
    image.src = source;
  });
}

export function Scanner({ onAddFood }: { onAddFood: (food: any) => void }) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setImage = async (source: string) => {
    try {
      setImgSrc(await compressImage(source));
      setResult(null);
      setError(null);
    } catch {
      setError('Unable to prepare this image for analysis');
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) void setImage(imageSrc);
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') void setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const retake = () => {
    setImgSrc(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyze = async () => {
    if (!imgSrc) return;
    setAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeFoodImage(imgSrc);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  const confirmAdd = () => {
    if (result) {
      onAddFood({
        foodName: result.foodName,
        caloriesPer100g: result.caloriesPer100g || result.calories || 0,
        proteinPer100g: result.proteinPer100g || result.protein || 0,
        carbsPer100g: result.carbsPer100g || result.carbs || 0,
        fatPer100g: result.fatPer100g || result.fat || 0,
        weightGrams: 0, // 0 so it's not automatically added to the overview until user inputs weight
        description: result.description,
      });
      retake(); // Reset for next scan
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-serif font-medium text-[#1A2016]">识别食物</h2>
        <p className="text-[#A3AD91] text-sm mt-1">拍照或上传图片，智算卡路里和营养素。</p>
      </div>

      <div className="relative w-full aspect-square bg-[#F3F5EF] rounded-[32px] overflow-hidden shadow-sm border border-[#E2E8D8]">
        {!imgSrc ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            height="100%"
            videoConstraints={{ facingMode: "environment" }}
            className="object-cover w-full h-full"
          />
        ) : (
          <img src={imgSrc} alt="Captured food" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="w-full">
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
        />
        {!imgSrc ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={capture}
              className="py-4 bg-[#7C9070] hover:bg-[#5D6B54] text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-[#7C907033]"
            >
              <Camera className="w-6 h-6" />
              <span>拍照识别</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-4 bg-[#F3F5EF] hover:bg-[#E2E8D8] text-[#5D6B54] rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>上传图片</span>
            </button>
          </div>
        ) : !result ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={retake}
              disabled={analyzing}
              className="py-4 bg-[#F3F5EF] hover:bg-[#E2E8D8] text-[#5D6B54] rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-5 h-5" />
              <span>重拍/重新选择</span>
            </button>
            <button
              onClick={analyze}
              disabled={analyzing}
              className="py-4 bg-[#7C9070] hover:bg-[#5D6B54] text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 shadow-lg shadow-[#7C907033]"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>分析中...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>开始分析</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[#E2E8D8]">
              <h3 className="text-xl font-serif font-medium text-[#1A2016] capitalize">{result.foodName}</h3>
              <p className="text-sm text-[#A3AD91] mt-1">{result.description}</p>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-[#E8EDE0] rounded-xl p-4">
                  <div className="text-[10px] text-[#A3AD91] tracking-widest uppercase mb-1">卡路里/100g</div>
                  <div className="text-2xl font-bold text-[#7C9070]">{result.caloriesPer100g} <span className="text-sm font-normal">kcal</span></div>
                </div>
                <div className="grid grid-rows-3 gap-2 py-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#A3AD91]">蛋白质/100g</span>
                    <span className="font-semibold text-[#2D3325]">{result.proteinPer100g}g</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#A3AD91]">碳水/100g</span>
                    <span className="font-semibold text-[#2D3325]">{result.carbsPer100g}g</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#A3AD91]">脂肪/100g</span>
                    <span className="font-semibold text-[#2D3325]">{result.fatPer100g}g</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={retake}
                className="py-4 border border-[#E2E8D8] text-[#5D6B54] rounded-xl font-bold flex items-center justify-center transition-colors hover:bg-[#F3F5EF]"
              >
                放弃
              </button>
              <button
                onClick={confirmAdd}
                className="py-4 bg-[#7C9070] hover:bg-[#5D6B54] text-white rounded-xl font-bold flex items-center justify-center transition-colors shadow-lg shadow-[#7C907033]"
              >
                添加到饮食记录
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-start space-x-2 text-sm">
            <Info className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
