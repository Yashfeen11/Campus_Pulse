'use client';

import React, { useRef } from 'react';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { CompressedImageResult } from '@/lib/imageCompress';

/**
 * Props for ComposerDock component
 */
export interface ComposerDockProps {
  inputText: string;
  setInputText: (text: string) => void;
  compressedImage: CompressedImageResult | null;
  imageFileName: string;
  isCompressing: boolean;
  isLoading: boolean;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onSubmit: (e?: React.FormEvent) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

/**
 * Multimodal input dock for notice text and poster image uploads
 */
export const ComposerDock: React.FC<ComposerDockProps> = ({
  inputText,
  setInputText,
  compressedImage,
  imageFileName,
  isCompressing,
  isLoading,
  onImageSelect,
  onClearImage,
  onSubmit,
  textareaRef,
}): React.JSX.Element => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-3.5 border-t border-stone-100 bg-white">
      {/* Compressed image preview pill */}
      {compressedImage && (
        <div className="mb-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs text-stone-700 shadow-2xs">
          <div className="flex items-center gap-2.5 truncate">
            <img
              src={compressedImage.base64}
              alt="Selected poster"
              className="w-8 h-8 object-cover rounded-lg border border-stone-200 shrink-0"
            />
            <div className="truncate">
              <p className="truncate font-semibold text-stone-900 text-xs">
                {imageFileName || 'Event Poster'}
              </p>
              <span className="text-[11px] text-stone-500 font-medium">
                Sharp OCR ready ({(compressedImage.compressedSizeBytes / 1024).toFixed(0)} KB)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearImage}
            aria-label="Remove image"
            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onImageSelect}
          className="hidden"
          aria-label="Upload event poster image"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isCompressing || isLoading}
          aria-label="Upload event poster image"
          title="Upload event poster image"
          className="p-2.5 rounded-xl text-stone-600 hover:text-orange-700 hover:bg-stone-50 border border-stone-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-600 disabled:opacity-50 shrink-0"
        >
          {isCompressing ? (
            <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
          ) : (
            <ImageIcon className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            rows={2}
            maxLength={4000}
            placeholder="Paste notice text or forward..."
            aria-label="Paste notice text or forward"
            className="w-full text-sm text-stone-900 placeholder:text-stone-400 bg-stone-50 border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:bg-white resize-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isCompressing || (!inputText.trim() && !compressedImage)}
          aria-label="Extract notice into cue card"
          title="Extract notice into cue card"
          className="p-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-sm shadow-orange-600/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-600 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};
