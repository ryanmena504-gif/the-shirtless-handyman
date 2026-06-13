import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const PHONE = "504-264-4919";
const SMS_LINK = `sms:5042644919?body=Hey%20Ryan%2C%20I%27m%20interested%20in%20a%20seamless%20surface%20project.`;
const SESSION_STORAGE_KEY = "shh_chat_session_v1";

const QUICK_REPLIES = [
  "Bathroom remodel",
  "Microcement floors",
  "Rockscape wall",
  "How much does it cost?",
];

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hey! I'm Ryan's AI assistant. Tell me about your space — what room, what surface, anything you're trying to fix — and I'll give you a real ballpark and steer you toward the right finish. What are you thinking?",
};

function genSessionId() {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * ChatWidget — floating chat bubble bottom-right. Matches the cinematic UI:
 * dark surfaces, Fraunces serif headings, orange (#D97757) accents.
 * Calls /api/chat. Session persists in sessionStorage across page navigations.
 * Hidden on mobile when the StickyMobileCTA is up to avoid overlap (we hide
 * the chat below md and let mobile users use the sticky CTA instead).
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [unread, setUnread] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Session bootstrap + rehydrate history
  useEffect(() => {
    if (typeof window === "undefined") return;
    let sid = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sid) {
      sid = genSessionId();
      sessionStorage.setItem(SESSION_STORAGE_KEY, sid);
    }
    setSessionId(sid);

    // Load any prior history for this session
    (async () => {
      try {
        const res = await axios.get(`${API}/chat/${sid}/history`, { timeout: 5000 });
        const past = res.data?.messages || [];
        if (past.length > 0) {
          setMessages(
            past.map((m) => ({ role: m.role, content: m.content })),
          );
        }
      } catch {
        /* silent — keep welcome message */
      }
    })();
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus the input when widget opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setUnread(false);
    }
  }, [open]);

  // Lock the body scroll on mobile when the panel is open (it's full-screen on mobile)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (open && isMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text) => {
      const message = (text ?? input).trim();
      if (!message || loading || !sessionId) return;

      setMessages((m) => [...m, { role: "user", content: message }]);
      setInput("");
      setLoading(true);

      try {
        const res = await axios.post(
          `${API}/chat`,
          { session_id: sessionId, message },
          { timeout: 60000 },
        );
        const reply = res.data?.reply || "Hmm, I lost the thread. Try again?";
        setMessages((m) => [...m, { role: "assistant", content: reply }]);
        if (!open) setUnread(true);
      } catch (e) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: `My circuits got tangled — text Ryan directly at ${PHONE} and he'll respond fast.`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, sessionId, open],
  );

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating launcher — bottom-right on desktop, above the sticky mobile CTA on phones */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed right-4 md:right-6 z-[9990] w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#D97757] hover:bg-[#C56545] flex items-center justify-center text-white shadow-2xl shadow-[#D97757]/40 transition-transform hover:scale-105 active:scale-95 ${
          // Hide the launcher when the panel is open on mobile (panel has its own close button) so
          // the panel covers the screen without a floating button overlapping the keyboard.
          open ? "hidden md:flex" : "flex"
        }`}
        style={{ bottom: "calc(5.25rem + env(safe-area-inset-bottom))" }}
        data-testid="chat-widget-launcher"
        aria-label={open ? "Close chat with Ryan's AI" : "Chat with Ryan's AI"}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {unread && !open && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#D97757]" />
        )}
      </button>

      {/* Chat panel — full-screen bottom-sheet on mobile, floating card on desktop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[9990] bg-[#0E0E0E] border border-white/10 shadow-2xl flex flex-col overflow-hidden inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[400px] md:max-w-[calc(100vw-3rem)] md:h-[600px] md:max-h-[calc(100vh-8rem)] md:rounded-2xl"
            data-testid="chat-widget-panel"
            role="dialog"
            aria-label="Chat with Ryan's AI assistant"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-br from-[#1A3C34] to-[#0E0E0E] border-b border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D97757] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="text-white text-sm font-medium tracking-tight"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  Ryan&apos;s AI Assistant
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                  <p className="text-[11px] text-white/50 tracking-wide">Online — usually replies instantly</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                aria-label="Close chat"
                data-testid="chat-widget-close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              data-testid="chat-widget-messages"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-[#D97757] text-white rounded-br-md"
                        : "bg-white/5 text-white/90 border border-white/5 rounded-bl-md"
                    }`}
                    data-testid={`chat-msg-${m.role}`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start" data-testid="chat-typing-indicator">
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97757] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97757] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97757] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* Quick replies — only on the very first turn */}
              {messages.length <= 1 && !loading && (
                <div className="flex flex-wrap gap-1.5 pt-2" data-testid="chat-quick-replies">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#D97757] hover:text-white border border-white/10 text-xs text-white/70 font-medium transition-colors"
                      data-testid={`chat-quick-reply-${q.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div
              className="border-t border-white/5 bg-[#0A0A0A] p-3"
              style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  rows={1}
                  placeholder="Ask about pricing, finishes, your room..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 resize-none outline-none focus:border-[#D97757]/60 max-h-24"
                  disabled={loading}
                  data-testid="chat-widget-input"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#D97757] hover:bg-[#C56545] disabled:bg-white/10 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
                  data-testid="chat-widget-send"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-white/30 mt-2 text-center">
                For a direct line:{" "}
                <a href={SMS_LINK} className="text-[#D97757] hover:underline">
                  text Ryan at {PHONE}
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
