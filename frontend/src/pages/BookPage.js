import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Calendar, Clock, Check, ChevronLeft, ChevronRight, Loader2, MessageCircle, ArrowLeft } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { SeoHead } from "../components/SeoHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const PHONE = "504-264-4919";

/**
 * BookPage — self-serve calendar. Three-step flow:
 *   1. Pick appointment type
 *   2. Pick date + time slot
 *   3. Enter contact info + confirm
 *
 * All availability data comes from GET /api/schedule/availability (60 days).
 * Slots the server has already reserved come back with available:false.
 */
export default function BookPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0);
  const [apptType, setApptType] = useState("walkthrough");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    let alive = true;
    axios
      .get(`${API}/schedule/availability?days=60`)
      .then((r) => alive && (setData(r.data), setLoading(false)))
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // Group days by (year, month) for the paginated calendar view
  const monthsView = useMemo(() => {
    if (!data?.days) return [];
    const byMonth = {};
    for (const d of data.days) {
      const dt = new Date(d.date + "T00:00:00");
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      if (!byMonth[key]) {
        byMonth[key] = {
          year: dt.getFullYear(),
          month: dt.getMonth(),
          label: dt.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          days: [],
        };
      }
      byMonth[key].days.push(d);
    }
    return Object.values(byMonth);
  }, [data]);

  const currentMonth = monthsView[monthOffset];

  const selectedDayObj = useMemo(() => {
    if (!data || !selectedDate) return null;
    return data.days.find((d) => d.date === selectedDate) || null;
  }, [data, selectedDate]);

  const submit = async (e) => {
    e?.preventDefault();
    setError("");
    if (!selectedSlot || !name.trim() || !phone.trim()) {
      setError("Pick a slot and add your name + phone.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/bookings`, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        slot_iso: selectedSlot.iso,
        appointment_type: apptType,
        project_type: "",
        notes: notes.trim(),
        zip_code: "",
        session_id: "",
      }, { timeout: 15000 });
      setConfirmation(res.data);
    } catch (err) {
      const msg = err?.response?.data?.detail ||
        "Something went wrong. Text me directly at 504-264-4919.";
      setError(msg);
      // If slot was just taken, refetch availability so it shows unavailable
      if (err?.response?.status === 409) {
        try {
          const fresh = await axios.get(`${API}/schedule/availability?days=60`);
          setData(fresh.data);
          setSelectedSlot(null);
        } catch { /* noop */ }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const apptTypes = data?.appointment_types || [];

  return (
    <>
      <SeoHead
        path="/book"
        title="Book an Appointment | The Shirtless Handyman — New Orleans"
        description="Pick your own time. Free in-home walkthroughs, phone consults, and project starts — book direct with Ryan. Mon–Sat, 8am–5pm CT."
        noindex={false}
      />
      <Navbar />
      <div className="min-h-screen bg-[#FAFAF9] text-foreground pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-5 md:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
            data-testid="book-back-link"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> back to home
          </Link>

          <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757] mb-3">
            Direct booking · No call center
          </p>
          <h1
            className="text-4xl md:text-5xl font-light tracking-tight leading-tight mb-3"
            style={{ fontFamily: "'Fraunces', serif" }}
            data-testid="book-page-h1"
          >
            Pick your time with Ryan.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
            Real calendar, real availability. Mon–Sat, 8am–5pm Central. What you see open, you can book.
          </p>

          {confirmation ? (
            <ConfirmationCard confirmation={confirmation} name={name} phone={phone} onDone={() => navigate("/")} />
          ) : (
            <div className="mt-10 space-y-8">
              {/* Step 1 — Appointment type */}
              <Section step={1} title="What are we meeting about?">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5" data-testid="book-appt-type-list">
                  {apptTypes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setApptType(t.id)}
                      className={`text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                        apptType === t.id
                          ? "border-[#D97757] bg-[#D97757]/5"
                          : "border-border/40 hover:border-[#D97757]/40"
                      }`}
                      data-testid={`book-appt-type-${t.id}`}
                    >
                      <div className="text-sm font-semibold">{t.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{t.duration} min · free</div>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Step 2 — Date + time */}
              <Section step={2} title="Pick a day + time">
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading Ryan&rsquo;s calendar…
                  </div>
                ) : !currentMonth ? (
                  <p className="text-sm text-muted-foreground py-8">No availability data.</p>
                ) : (
                  <>
                    {/* Month header */}
                    <div className="flex items-center justify-between mb-3">
                      <button
                        type="button"
                        onClick={() => setMonthOffset((m) => Math.max(0, m - 1))}
                        disabled={monthOffset === 0}
                        className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center disabled:opacity-30 hover:bg-white"
                        data-testid="book-month-prev"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="text-sm font-semibold" data-testid="book-month-label">
                        {currentMonth.label}
                      </div>
                      <button
                        type="button"
                        onClick={() => setMonthOffset((m) => Math.min(monthsView.length - 1, m + 1))}
                        disabled={monthOffset >= monthsView.length - 1}
                        className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center disabled:opacity-30 hover:bg-white"
                        data-testid="book-month-next"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <CalendarGrid
                      monthData={currentMonth}
                      selectedDate={selectedDate}
                      onSelect={(iso) => { setSelectedDate(iso); setSelectedSlot(null); }}
                    />
                  </>
                )}

                {/* Time slots for selected day */}
                {selectedDayObj && (
                  <div className="mt-6" data-testid="book-slot-list">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Available slots on{" "}
                      {new Date(selectedDayObj.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long", month: "long", day: "numeric",
                      })}
                    </div>
                    {selectedDayObj.slots.filter((s) => s.available).length === 0 ? (
                      <p className="text-sm text-muted-foreground py-3">No open slots on this day. Try another.</p>
                    ) : (
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {selectedDayObj.slots.map((s) => (
                          <button
                            key={s.iso}
                            type="button"
                            disabled={!s.available}
                            onClick={() => setSelectedSlot(s)}
                            className={`text-sm py-2 rounded-lg border-2 transition-colors ${
                              selectedSlot?.iso === s.iso
                                ? "border-[#D97757] bg-[#D97757] text-white font-semibold"
                                : s.available
                                  ? "border-border/40 hover:border-[#D97757]/60"
                                  : "border-border/20 bg-muted/40 text-muted-foreground/60 line-through cursor-not-allowed"
                            }`}
                            data-testid={`book-slot-${s.iso}`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Section>

              {/* Step 3 — Contact info */}
              <Section step={3} title="Your details">
                <form onSubmit={submit} className="space-y-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full h-11 px-4 rounded-xl border border-border/50 bg-white outline-none focus:border-[#D97757]/60 text-sm"
                    data-testid="book-name-input"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone"
                      inputMode="tel"
                      className="w-full h-11 px-4 rounded-xl border border-border/50 bg-white outline-none focus:border-[#D97757]/60 text-sm"
                      data-testid="book-phone-input"
                    />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email (for confirmation)"
                      type="email"
                      className="w-full h-11 px-4 rounded-xl border border-border/50 bg-white outline-none focus:border-[#D97757]/60 text-sm"
                      data-testid="book-email-input"
                    />
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything to know before we meet? (Optional — project type, budget range, questions)"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border/50 bg-white outline-none focus:border-[#D97757]/60 text-sm resize-none"
                    data-testid="book-notes-input"
                  />

                  {error && (
                    <p className="text-sm text-red-600" data-testid="book-error">{error}</p>
                  )}

                  <div className="pt-2 flex flex-col md:flex-row md:items-center gap-3">
                    <button
                      type="submit"
                      disabled={submitting || !selectedSlot}
                      className="h-12 px-6 rounded-full bg-[#D97757] hover:bg-[#C56545] text-white font-semibold disabled:bg-muted-foreground/30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                      data-testid="book-submit"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Booking…
                        </>
                      ) : selectedSlot ? (
                        <>
                          Confirm {new Date(selectedSlot.iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {selectedSlot.label}
                        </>
                      ) : (
                        "Pick a slot to continue"
                      )}
                    </button>
                    <a
                      href={`sms:${PHONE.replace(/-/g, "")}?body=Hey%20Ryan%2C%20I%27m%20trying%20to%20book%20but%20nothing%20fits%20my%20schedule.`}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                      data-testid="book-text-fallback"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Nothing fits? Text me
                    </a>
                  </div>
                </form>
              </Section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Section({ step, title, children }) {
  return (
    <section className="bg-white rounded-2xl border border-border/40 p-5 md:p-7 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-[#0E0E0E] text-white text-xs font-bold flex items-center justify-center">
          {step}
        </div>
        <h2 className="text-base md:text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function CalendarGrid({ monthData, selectedDate, onSelect }) {
  // Build a 7-column grid starting on Sunday
  const first = new Date(monthData.year, monthData.month, 1);
  const leadingBlanks = first.getDay();
  const daysInMonth = new Date(monthData.year, monthData.month + 1, 0).getDate();

  const daysByDate = Object.fromEntries(monthData.days.map((d) => [d.date, d]));

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push({ blank: true, key: `b${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = new Date(monthData.year, monthData.month, d).toLocaleDateString("en-CA");
    cells.push({ blank: false, key: iso, day: d, data: daysByDate[iso] });
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c) =>
          c.blank ? (
            <div key={c.key} />
          ) : (
            <button
              key={c.key}
              type="button"
              disabled={!c.data || !c.data.is_open || c.data.slots.filter((s) => s.available).length === 0}
              onClick={() => onSelect(c.key)}
              className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                selectedDate === c.key
                  ? "bg-[#D97757] text-white font-bold"
                  : c.data && c.data.is_open && c.data.slots.filter((s) => s.available).length > 0
                    ? "bg-white hover:bg-[#D97757]/10 border border-border/30 text-foreground"
                    : "text-muted-foreground/40 cursor-not-allowed"
              }`}
              data-testid={`book-day-${c.key}`}
            >
              {c.day}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

function ConfirmationCard({ confirmation, name, phone, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-10 bg-[#0E0E0E] text-white rounded-2xl p-8 md:p-10"
      data-testid="book-confirmation"
    >
      <div className="w-14 h-14 rounded-full bg-[#D97757] flex items-center justify-center mb-5">
        <Check className="w-6 h-6 text-white" />
      </div>
      <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#D97757] mb-2">
        Booked
      </p>
      <h2
        className="text-3xl md:text-4xl font-light tracking-tight mb-4"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        You&rsquo;re on the calendar, {name.split(" ")[0]}.
      </h2>
      <p className="text-white/70 mb-2">{confirmation?.message}</p>
      <p className="text-sm text-white/50 mb-8">
        I'll text {phone} 10–15 min before to confirm. Check your email for a copy.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onDone}
          className="h-11 px-6 rounded-full bg-white text-[#0E0E0E] font-semibold hover:bg-white/90"
          data-testid="book-confirmation-done"
        >
          Back to home
        </button>
        <a
          href="/upload"
          className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-white/25 text-white font-semibold hover:bg-white/5"
        >
          Try the Seamless Studio
        </a>
      </div>
    </motion.div>
  );
}
