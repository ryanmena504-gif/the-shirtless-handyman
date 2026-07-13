import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Calendar } from "lucide-react";
import { BookingPanel } from "./BookingPanel";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const PHONE = "504-264-4919";
const SMS_LINK = `sms:5042644919?body=Hey%20Ryan%2C%20I%27m%20interested%20in%20a%20seamless%20surface%20project.`;
const SESSION_STORAGE_KEY = "shh_chat_session_v1";

// Whitelist of site paths the AI is allowed to link to. Anything else stays as
// plain text — the AI cannot fabricate a route into a live link.
const KNOWN_PATHS = ["/book", "/upload", "/faq", "/portfolio", "/about", "/blog"];

/**
 * Render a chat message string as React nodes, converting known site paths,
 * phone numbers, absolute URLs, and any residual markdown-style [label](url)
 * into real anchor tags. The backend prompt tells the AI to emit plain paths
 * (e.g. `/book`, `504-264-4919`) — this helper is the safety net that also
 * catches markdown links, tel:/sms:/https URLs, and stray "#" hrefs.
 */
function renderChatMessage(text) {
  if (!text) return null;
  // Tokenize on: markdown links, absolute URLs, tel/sms schemes, phone
  // number 504-264-4919 (with or without hyphens), and whitelisted paths.
  const pattern = new RegExp(
    [
      "\\[([^\\]]+)\\]\\(([^)]+)\\)",                    // [label](url)
      "https?:\\/\\/[^\\s<)]+",                          // absolute URL
      "(?:tel|sms|mailto):[^\\s<)]+",                    // tel:/sms:/mailto:
      "\\b504[-.\\s]?264[-.\\s]?4919\\b",                // Ryan's phone
      `(?<![A-Za-z0-9])(${KNOWN_PATHS.map((p) => p.replace("/", "\\/")).join("|")})(?![A-Za-z0-9/])`, // /book etc.
    ].join("|"),
    "g",
  );
  const parts = [];
  let last = 0;
  let m;
  let idx = 0;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const [full, mdLabel, mdHref] = m;
    let href = null;
    let label = full;
    if (mdLabel !== undefined) {
      // [label](url) form. If the AI wrote "#" or an obviously broken href,
      // try to derive a real one from the label text.
      label = mdLabel;
      const cleanedHref = (mdHref || "").trim();
      if (cleanedHref && cleanedHref !== "#") {
        href = cleanedHref;
      } else {
        // Derive from the label — look for a known path or phone.
        const knownInLabel = KNOWN_PATHS.find((p) => mdLabel.includes(p));
        if (knownInLabel) href = knownInLabel;
        else if (/504[-.\s]?264[-.\s]?4919/.test(mdLabel)) href = `tel:5042644919`;
      }
    } else if (/^https?:/.test(full)) {
      href = full;
    } else if (/^(tel|sms|mailto):/.test(full)) {
      href = full;
    } else if (/^504/.test(full.replace(/[^0-9]/g, ""))) {
      href = `tel:5042644919`;
    } else {
      // Whitelisted path
      href = full;
    }
    if (href) {
      const isExternal = /^https?:/.test(href);
      parts.push(
        <a
          key={`lnk-${idx++}`}
          href={href}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-[#D97757] hover:text-[#E8916F] underline underline-offset-2 font-medium"
          data-testid="chat-link"
        >
          {label}
        </a>,
      );
    } else {
      parts.push(full);
    }
    last = m.index + full.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

const QUICK_REPLIES = [
  "Bathroom remodel",
  "Microcement floors",
  "Rockscape wall",
  "How much does it cost?",
];

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hey — I'm Ryan. Tell me about your space — what room, what surface, anything you're trying to fix — and I'll give you a real ballpark and steer you toward the right finish. What are you thinking?",
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
  const [bookingOpen, setBookingOpen] = useState(false);
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

  // Focus the input when widget opens; expose open state globally so other
  // overlays (ExitIntentModal) can step out of our way.
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__SHH_CHAT_OPEN__ = open;
    }
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
            content: `My circuits got tangled — text me directly at ${PHONE} and I'll respond fast.`,
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
        aria-label={open ? "Close chat with Ryan" : "Chat with Ryan"}
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
            aria-label="Chat with Ryan"
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
                  Ryan Mena
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                  <p className="text-[11px] text-white/50 tracking-wide">AI-assisted • replies instantly • text me at 504-264-4919 for the human</p>
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
                    {m.role === "assistant" ? renderChatMessage(m.content) : m.content}
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

              {/* Inline booking panel */}
              {bookingOpen && (
                <BookingPanel
                  sessionId={sessionId}
                  onBooked={(b) => {
                    setMessages((m) => [
                      ...m,
                      {
                        role: "assistant",
                        content: `You're booked for ${b?.message ? b.message.replace("You're booked for ", "") : "your slot"}. I'll text you 10–15 min before to confirm.`,
                      },
                    ]);
                  }}
                />
              )}

              {/* Book-a-visit button — shown once chat has at least a few turns and not while booking is open */}
              {messages.length >= 3 && !bookingOpen && !loading && (
                <div className="flex justify-start" data-testid="chat-book-cta-wrap">
                  <button
                    onClick={() => setBookingOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#1A3C34] hover:bg-[#0E2A24] text-white text-xs font-semibold border border-[#D97757]/30 transition-colors"
                    data-testid="chat-open-booking"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Book a walkthrough with me
                  </button>
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
                  text me at {PHONE}
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
