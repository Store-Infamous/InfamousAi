import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore, PLANS } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Zap, User } from 'lucide-react';
import { marked } from 'marked';
import hljs from 'highlight.js';

function renderMarkdown(text: string): string {
  marked.setOptions({
    highlight: (code: string, lang: string) => {
      try {
        return lang ? hljs.highlight(code, { language: lang }).value : hljs.highlightAuto(code).value;
      } catch { return code; }
    },
    breaks: true,
  });
  return marked.parse(text) as string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-white/10 text-gray-400 text-[10px] font-semibold hover:bg-purple-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function MessageBubble({ role, content, index }: { role: string; content: string; index: number }) {
  const isUser = role === 'user';
  const parsed = isUser ? content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>') : renderMarkdown(content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex gap-3 max-w-[800px] mx-auto mb-6 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isUser
          ? 'bg-gradient-to-br from-purple-500 to-violet-600'
          : 'bg-gradient-to-br from-emerald-500 to-teal-600'
      }`}>
        {isUser ? <User size={14} className="text-white" /> : <Zap size={14} className="text-white" />}
      </div>
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        <p className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
          {isUser ? 'You' : 'Infamous AI'}
        </p>
        <div className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-purple-500/15 border border-purple-500/20 text-gray-200 rounded-tr-md'
            : 'bg-white/[0.03] border border-white/5 text-gray-300 rounded-tl-md'
        }`}>
          {isUser ? (
            <span dangerouslySetInnerHTML={{ __html: parsed }} />
          ) : (
            <div
              className="prose prose-invert prose-sm max-w-none prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-code:text-purple-300 prose-a:text-purple-400"
              dangerouslySetInnerHTML={{ __html: parsed }}
            />
          )}
          {!isUser && content.includes('```') && (
            <CopyButton text={content} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const {
    currentUser, currentChatId, isSending, setActiveTab, sendMessage, getMsgRemaining, getUserPlan,
  } = useStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chat = currentUser?.chats?.[currentChatId || ''];
  const plan = getUserPlan();
  const remaining = getMsgRemaining();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [chat?.messages, scrollToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;
    if (remaining <= 0) { alert('Daily message limit reached! Upgrade your plan.'); return; }
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  if (!currentUser || !chat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>No chat selected. Start a new one!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-white/5 bg-[#0d0d1a]/80 backdrop-blur-md">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-medium hover:bg-white/10 hover:text-white transition-all"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <span className="text-sm font-semibold text-gray-200 truncate">{chat.title}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        {chat.messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} index={i} />
        ))}

        {/* Typing indicator */}
        {isSending && chat.messages[chat.messages.length - 1]?.role === 'user' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 max-w-[800px] mx-auto"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <Zap size={14} className="text-white" />
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-md px-5 py-4">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-gray-500"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 md:px-6 py-4 border-t border-white/5 bg-[#0d0d1a]/80 backdrop-blur-md">
        <div className="max-w-[800px] mx-auto">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); autoGrow(e.target); }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Infamous AI anything..."
              rows={1}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 resize-none max-h-[160px] min-h-[44px] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={isSending || !input.trim()}
              className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-600/20 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-purple-600/30 transition-all"
            >
              <Send size={16} />
            </motion.button>
          </div>
          <p className="text-center text-[11px] text-gray-500 mt-2">
            {plan.icon} {plan.name} Plan • {remaining} of {plan.msgs} messages remaining today
          </p>
        </div>
      </div>
    </div>
  );
}
