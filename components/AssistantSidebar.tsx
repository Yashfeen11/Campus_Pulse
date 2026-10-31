'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { NoticeItem } from '@/types/notice';
import { compressImageFile, CompressedImageResult } from '@/lib/imageCompress';
import { getRandomSampleNotice } from '@/lib/sampleNotices';
import { extractNoticeApi, fetchWeeklySummaryApi } from '@/lib/api';
import { AssistantHeader } from './AssistantHeader';
import { ChatMessageItem, ChatMessage } from './ChatMessageItem';
import { ComposerDock } from './ComposerDock';

/**
 * Props for AssistantSidebar component
 */
export interface AssistantSidebarProps {
  todayStr: string;
  notices: NoticeItem[];
  onNoticeCreated: (notice: NoticeItem) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [{
  id: 'welcome', sender: 'assistant', type: 'text',
  text: 'Hello! I am your Campus Pulse Assistant. Paste unstructured WhatsApp forwards, emails, or upload event poster images below to generate clean cue cards.',
  timestamp: 'Just now',
}];

/**
 * AI Assistant sidebar coordinating chat stream, poster OCR, and weekly campus digest
 */
export const AssistantSidebar: React.FC<AssistantSidebarProps> = ({
  todayStr, notices, onNoticeCreated,
}): React.JSX.Element => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [compressedImage, setCompressedImage] = useState<CompressedImageResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);

  const streamEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isGeneratingWeekly]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    setImageFileName(file.name);
    try {
      const result = await compressImageFile(file, 1400, 0.88);
      setCompressedImage(result);
    } catch (err: unknown) {
      addErrorMessage(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsCompressing(false);
    }
  };

  const clearImage = (): void => { setCompressedImage(null); setImageFileName(''); };
  const addErrorMessage = (text: string, retryAction?: () => void): void => {
    setMessages((prev) => [...prev, { id: `err-${Date.now()}`, sender: 'assistant', type: 'error', text, retryAction, timestamp: 'Just now' }]);
  };

  const handleSampleNotice = (): void => {
    setInputText(getRandomSampleNotice());
    textareaRef.current?.focus();
  };

  const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !compressedImage?.base64) return;

    const submittedText = inputText.trim();
    const imagePayload = compressedImage;
    const attachedName = imageFileName;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`, sender: 'user', type: 'text',
        text: submittedText || (attachedName ? `📷 Attached event poster: ${attachedName}` : 'Uploaded an event poster image'),
        timestamp: 'Just now',
      },
    ]);

    setInputText('');
    clearImage();
    setIsLoading(true);

    try {
      const notice = await extractNoticeApi({
        text: submittedText || undefined,
        imageBase64: imagePayload?.base64 || undefined,
        mimeType: imagePayload?.mimeType || undefined,
        currentDate: todayStr,
      });

      if (typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)')?.matches) {
        try { confetti?.({ particleCount: 50, spread: 50, origin: { y: 0.8 }, colors: ['#ea580c', '#f97316', '#1c1917'] }); } catch {}
      }

      onNoticeCreated(notice);
      setMessages((prev) => [
        ...prev,
        { id: `confirm-${Date.now()}`, sender: 'assistant', type: 'confirmation', notice, timestamp: 'Just now' },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during extraction';
      addErrorMessage(msg, () => {
        setInputText(submittedText);
        if (imagePayload) setCompressedImage(imagePayload);
        handleSubmit();
      });
    } finally {
      setIsLoading(false);
    }
  };

  // EXACTLY REQUIRED BUTTON HANDLER: "What do I need to know this week?"
  const handleWeeklySummary = async (): Promise<void> => {
    if (isGeneratingWeekly) return;
    setMessages((prev) => [
      ...prev,
      { id: `user-summary-${Date.now()}`, sender: 'user', type: 'text', text: 'What do I need to know this week?', timestamp: 'Just now' },
    ]);
    setIsGeneratingWeekly(true);
    try {
      const summary = await fetchWeeklySummaryApi({ notices, currentDate: todayStr });
      setMessages((prev) => [
        ...prev,
        { id: `summary-${Date.now()}`, sender: 'assistant', type: 'summary', summary, timestamp: 'Just now' },
      ]);
    } catch (err: unknown) {
      addErrorMessage(err instanceof Error ? err.message : 'Failed to generate weekly summary.', handleWeeklySummary);
    } finally {
      setIsGeneratingWeekly(false);
    }
  };

  return (
    <aside aria-label="Campus Pulse AI Assistant" className="bg-white rounded-2xl border border-stone-200/90 shadow-sm flex flex-col h-[calc(100vh-3rem)] sticky top-6 overflow-hidden">
      <AssistantHeader onWeeklySummary={handleWeeklySummary} isGeneratingWeekly={isGeneratingWeekly} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm text-stone-800" tabIndex={0} aria-label="Assistant message stream">
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} msg={msg} onSampleNotice={handleSampleNotice} />
        ))}
        {(isLoading || isGeneratingWeekly) && (
          <div className="flex items-center gap-2.5 text-sm text-stone-600 p-3 bg-stone-50 rounded-xl border border-stone-200 animate-pulse">
            <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
            <span className="font-medium">
              {isGeneratingWeekly ? 'Synthesizing weekly campus digest...' : 'Extracting cue card details with Gemini...'}
            </span>
          </div>
        )}
        <div ref={streamEndRef} />
      </div>
      <ComposerDock
        inputText={inputText} setInputText={setInputText}
        compressedImage={compressedImage} imageFileName={imageFileName}
        isCompressing={isCompressing} isLoading={isLoading}
        onImageSelect={handleImageSelect} onClearImage={clearImage}
        onSubmit={handleSubmit} textareaRef={textareaRef}
      />
    </aside>
  );
};
