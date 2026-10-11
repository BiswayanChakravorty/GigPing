import React, { useState } from 'react';
import { X, Send, CheckCircle2, Mail, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';
import { generateResendEmailHtml } from '../lib/resend';
import { ResendEmailPayload } from '../types';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: ResendEmailPayload | null;
  onConfirmSend?: (payload: ResendEmailPayload) => Promise<void>;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  payload,
  onConfirmSend,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen || !payload) return null;

  const htmlContent = generateResendEmailHtml(payload);

  const handleSend = async () => {
    setIsSending(true);
    try {
      if (onConfirmSend) {
        await onConfirmSend(payload);
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1200);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-indigo-500/30 bg-[#0f172a] shadow-2xl shadow-indigo-950/80 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0b1120] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Resend Transactional Email Simulator</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  Ready to Dispatch
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                To: <strong className="text-slate-200 font-mono">{payload.to}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Meta Info */}
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 font-mono flex items-center justify-between">
          <span className="truncate pr-4">Subject: <strong className="text-white">{payload.subject}</strong></span>
          <span className="text-slate-500 shrink-0">Provider: Resend API</span>
        </div>

        {/* Rendered HTML Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#020617]">
          <div
            className="bg-transparent"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#0b1120] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Powered by <code className="text-cyan-400">resend.emails.send()</code>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleSend}
              disabled={isSending || sentSuccess}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:brightness-110 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {sentSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Dispatched to Inbox!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Sending via Resend...' : 'Send Live Alert to Inbox'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
