import { useState } from "react";
import axios from "axios";
import { Calendar, Clock, Check, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TIME_SLOTS = [
  { value: "morning",   label: "Morning",   sub: "8am – 12pm" },
  { value: "afternoon", label: "Afternoon", sub: "12pm – 5pm" },
  { value: "evening",   label: "Evening",   sub: "5pm – 7pm" },
];

function nextNDays(n) {
  const out = [];
  const today = new Date();
  for (let i = 1; i <= n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    // skip Sundays
    if (d.getDay() === 0) continue;
    out.push(d);
  }
  return out.slice(0, n);
}

const fmtIso = (d) => d.toISOString().slice(0, 10);
const fmtHuman = (d) =>
  d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

/**
 * BookingPanel — inline date+time+contact form rendered inside the ChatWidget.
 * On submit, POSTs /api/bookings which texts Ryan + emails the customer.
 * Stays compact: 1 column on mobile, single submit button at bottom.
 */
export function BookingPanel({ sessionId, onBooked }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const days = nextNDays(8);

  const submit = async (e) => {
    e?.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim() || !date || !time) {
      setError("Pick a day, time, and add your name + phone.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${API}/bookings`,
        {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          preferred_date: date,
          preferred_time: time,
          project_type: "Chat booking",
          notes: notes.trim(),
          zip_code: "",
          session_id: sessionId || "",
        },
        { timeout: 15000 },
      );
      setSuccess(true);
      onBooked?.(res.data);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "Couldn't reach the server. Text me at 504-264-4919.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div
        className="bg-[#1A3C34]/60 border border-[#D97757]/40 rounded-xl p-4 my-2"
        data-testid="chat-booking-success"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D97757]/25 flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-[#D97757]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white mb-1">You&apos;re on the calendar.</p>
            <p className="text-xs text-white/65 leading-relaxed">
              Ryan got the booking request and will text {phone} to confirm. Check your email
              for a copy.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white/5 border border-white/10 rounded-xl p-3 my-2 space-y-3"
      data-testid="chat-booking-panel"
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#D97757]">
          Book a free consult
        </p>
        <a
          href="/book"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-white/60 hover:text-white underline underline-offset-2"
          data-testid="chat-booking-open-fullpage"
        >
          See full calendar →
        </a>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider text-white/50 font-semibold flex items-center gap-1 mb-1.5">
          <Calendar className="w-3 h-3" /> Pick a day
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {days.map((d) => {
            const iso = fmtIso(d);
            const selected = date === iso;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setDate(iso)}
                className={`text-[11px] px-1.5 py-2 rounded-md border transition-colors ${
                  selected
                    ? "bg-[#D97757] border-[#D97757] text-white"
                    : "bg-white/0 border-white/15 text-white/75 hover:border-[#D97757]/60"
                }`}
                data-testid={`chat-booking-day-${iso}`}
              >
                {fmtHuman(d)}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider text-white/50 font-semibold flex items-center gap-1 mb-1.5">
          <Clock className="w-3 h-3" /> Pick a time
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {TIME_SLOTS.map((t) => {
            const selected = time === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTime(t.value)}
                className={`text-[11px] px-2 py-2 rounded-md border transition-colors ${
                  selected
                    ? "bg-[#D97757] border-[#D97757] text-white"
                    : "bg-white/0 border-white/15 text-white/75 hover:border-[#D97757]/60"
                }`}
                data-testid={`chat-booking-time-${t.value}`}
              >
                <div className="font-semibold">{t.label}</div>
                <div className="text-[9px] opacity-70 mt-0.5">{t.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#D97757]/60"
          data-testid="chat-booking-name"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          inputMode="tel"
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#D97757]/60"
          data-testid="chat-booking-phone"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional — for confirmation)"
          type="email"
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#D97757]/60"
          data-testid="chat-booking-email"
        />
      </div>

      {error && (
        <p className="text-[11px] text-[#FCA5A5]" data-testid="chat-booking-error">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full h-10 rounded-md bg-[#D97757] hover:bg-[#C56545] disabled:bg-white/10 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        data-testid="chat-booking-submit"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Booking…
          </>
        ) : (
          "Confirm booking"
        )}
      </button>
    </form>
  );
}
