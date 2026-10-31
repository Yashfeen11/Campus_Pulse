'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Image as ImageIcon,
  X,
  Loader2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Dice5,
  RotateCcw,
  Zap,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { NoticeItem, WeeklySummaryResponse } from '@/types/notice';
import { compressImageFile, CompressedImageResult } from '@/lib/imageCompress';
import { getRandomSampleNotice } from '@/lib/sampleNotices';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  type: 'text' | 'confirmation' | 'summary' | 'error';
  text?: string;
  notice?: NoticeItem;
  summary?: WeeklySummaryResponse;
  retryAction?: () => void;
  timestamp: string;
}

interface AssistantSidebarProps {
  todayStr: string;
  notices: NoticeItem[];
  onNoticeCreated: (notice: NoticeItem) => void;
}

export const AssistantSidebar: React.FC<AssistantSidebarProps> = ({
  todayStr,
  notices,
  onNoticeCreated,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      type: 'text',
      text: "Hello! I am your Campus Pulse Assistant. Paste unstructured WhatsApp forwards, emails, or upload event poster images below to generate clean cue cards.",
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [compressedImage, setCompressedImage] = useState<CompressedImageResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll stream to bottom when new messages arrive
  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isGeneratingWeekly]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const result = await compressImageFile(file, 800, 0.7);
      setCompressedImage(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to compress image';
      addErrorMessage(msg);
    } finally {
      setIsCompressing(false);
    }
  };

  const clearImage = () => {
    setCompressedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addErrorMessage = (text: string, retryAction?: () => void) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        type: 'error',
        text,
        retryAction,
        timestamp: 'Just now',
      },
    ]);
  };

  const handleSampleNotice = () => {
    const sample = getRandomSampleNotice();
    setInputText(sample);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const hasText = inputText.trim().length > 0;
    const hasImage = Boolean(compressedImage?.base64);

    if (!hasText && !hasImage) return;

    const submittedText = inputText.trim();
    const imagePayload = compressedImage;

    // Add user message to stream
    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        type: 'text',
        text: submittedText || 'Uploaded an event poster image',
        timestamp: 'Just now',
      },
    ]);

    // Clear composer
    setInputText('');
    clearImage();
    setIsLoading(true);

    const performExtract = async () => {
      try {
        const payload = {
          text: submittedText || undefined,
          imageBase64: imagePayload?.base64 || undefined,
          mimeType: imagePayload?.mimeType || undefined,
          currentDate: todayStr, // Send local browser date strictly
        };

        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to extract notice details');
        }

        // Trigger confetti only if user has not requested reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
          try {
            confetti({
              particleCount: 50,
              spread: 50,
              origin: { y: 0.8 },
              colors: ['#2563eb', '#38bdf8', '#10b981'],
            });
          } catch {
            // Safe fallback
          }
        }

        // Notify parent to add notice
        onNoticeCreated(data.notice);

        // Add assistant confirmation card to stream
        setMessages((prev) => [
          ...prev,
          {
            id: `confirm-${Date.now()}`,
            sender: 'assistant',
            type: 'confirmation',
            notice: data.notice,
            timestamp: 'Just now',
          },
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

    await performExtract();
  };

  // EXACTLY REQUIRED BUTTON HANDLER: "What do I need to know this week?"
  const handleWeeklySummary = async () => {
    if (isGeneratingWeekly) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-summary-${Date.now()}`,
        sender: 'user',
        type: 'text',
        text: 'What do I need to know this week?',
        timestamp: 'Just now',
      },
    ]);

    setIsGeneratingWeekly(true);

    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notices,
          currentDate: todayStr, // Strict local date
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.summary) {
        throw new Error(data.error || 'Failed to generate weekly digest');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `summary-${Date.now()}`,
          sender: 'assistant',
          type: 'summary',
          summary: data.summary,
          timestamp: 'Just now',
        },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate weekly summary.';
      addErrorMessage(msg, handleWeeklySummary);
    } finally {
      setIsGeneratingWeekly(false);
    }
  };

  return (
    <aside
      aria-label="Campus Pulse AI Assistant"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-3rem)] sticky top-6 overflow-hidden"
    >
      {/* ================= Top Header ================= */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-blue-500/20">
            CP
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
              Campus Pulse
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">
              AI Assistant
            </span>
          </div>
        </div>

        {/* EXACTLY REQUIRED BUTTON: "What do I need to know this week?" */}
        <button
          type="button"
          onClick={handleWeeklySummary}
          disabled={isGeneratingWeekly}
          aria-label="Generate weekly campus digest"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20 active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <Sparkles className="w-3 h-3 text-blue-200" />
          <span className="whitespace-nowrap">What do I need to know this week?</span>
        </button>
      </div>

      {/* ================= Middle Message Stream ================= */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-800"
        tabIndex={0}
        aria-label="Assistant message stream"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.sender === 'assistant' && (
              <span className="text-[10px] font-semibold text-slate-400 mb-1 ml-1 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-blue-600" /> Pulse Assistant
              </span>
            )}

            {/* User message bubble */}
            {msg.sender === 'user' && (
              <div className="max-w-[85%] bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm shadow-sm font-normal text-xs whitespace-pre-wrap">
                {msg.text}
              </div>
            )}

            {/* Assistant Text bubble */}
            {msg.sender === 'assistant' && msg.type === 'text' && (
              <div className="max-w-[90%] bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl rounded-tl-sm text-slate-700 leading-relaxed shadow-sm">
                <p>{msg.text}</p>

                {msg.id === 'welcome' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={handleSampleNotice}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <Dice5 className="w-3 h-3 text-blue-600" />
                      Try Sample WhatsApp Notice
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Assistant Confirmation Card */}
            {msg.type === 'confirmation' && msg.notice && (
              <div className="w-full bg-white border border-blue-200/90 rounded-2xl p-3.5 shadow-sm space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Extracted: {msg.notice.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {msg.notice.summary}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                    {msg.notice.category}
                  </span>
                  <span>•</span>
                  <span>{msg.notice.date || 'No date'}</span>
                  <span>•</span>
                  <span>{msg.notice.venue}</span>
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold pt-1 border-t border-slate-100">
                  ✓ Added to your 3D Cue Card Deck
                </div>
              </div>
            )}

            {/* Assistant Weekly Digest Card */}
            {msg.type === 'summary' && msg.summary && (
              <div className="w-full bg-slate-50 border border-blue-200 rounded-2xl p-3.5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-blue-200/60">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-blue-600" />
                    This Week's Campus Digest
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                    Synthesized
                  </span>
                </div>

                {/* Today Priorities */}
                <div>
                  <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-rose-600" /> Immediate Priorities
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {msg.summary.todayPriorities.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Upcoming Deadlines */}
                <div>
                  <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-600" /> Upcoming Deadlines
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {msg.summary.upcomingDeadlines.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Rules */}
                <div>
                  <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-600" /> Rules to Remember
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {msg.summary.keyRulesToRemember.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Motivational Tip */}
                {msg.summary.motivationalAdvice && (
                  <p className="text-[11px] text-blue-800 italic bg-blue-50 p-2 rounded-xl border border-blue-100">
                    "{msg.summary.motivationalAdvice}"
                  </p>
                )}
              </div>
            )}

            {/* Error Message */}
            {msg.type === 'error' && (
              <div
                role="status"
                aria-live="polite"
                className="w-full bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs space-y-2"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{msg.text}</span>
                </div>
                {msg.retryAction && (
                  <button
                    type="button"
                    onClick={msg.retryAction}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 underline focus:outline-none focus:ring-2 focus:ring-rose-500 rounded"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Retry extraction
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {(isLoading || isGeneratingWeekly) && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span>
              {isGeneratingWeekly
                ? 'Synthesizing weekly campus digest...'
                : 'Extracting cue card details with Gemini...'}
            </span>
          </div>
        )}

        <div ref={streamEndRef} />
      </div>

      {/* ================= Bottom Input Dock ================= */}
      <div className="p-3 border-t border-slate-100 bg-white">
        {/* Compressed image preview pill */}
        {compressedImage && (
          <div className="mb-2 p-1.5 pl-2 pr-1 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2 truncate">
              <img
                src={compressedImage.base64}
                alt="Selected poster"
                className="w-6 h-6 object-cover rounded-lg border border-slate-200 shrink-0"
              />
              <span className="truncate text-[11px] text-slate-600">
                Poster ready ({(compressedImage.compressedSizeBytes / 1024).toFixed(0)} KB)
              </span>
            </div>
            <button
              type="button"
              onClick={clearImage}
              aria-label="Remove image"
              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* Hidden Image Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            className="hidden"
            aria-label="Upload event poster image"
          />

          {/* Image Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing || isLoading}
            aria-label="Upload event poster image"
            title="Upload event poster image"
            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 shrink-0"
          >
            {isCompressing ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
          </button>

          {/* Auto-expanding Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={2}
              maxLength={4000}
              placeholder="Paste notice text or forward..."
              aria-label="Paste notice text or forward"
              className="w-full text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white resize-none transition-all"
            />
          </div>

          {/* Send / Extract Button */}
          <button
            type="submit"
            disabled={isLoading || isCompressing || (!inputText.trim() && !compressedImage)}
            aria-label="Extract notice into cue card"
            title="Extract notice into cue card"
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm shadow-blue-600/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-600 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </aside>
  );
};
