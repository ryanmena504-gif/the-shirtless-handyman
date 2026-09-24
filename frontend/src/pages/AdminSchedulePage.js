import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../lib/AuthContext";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import {
  Shield, Lock, ArrowLeft, CalendarX, Repeat, Plus, Trash2,
  Pencil, X, AlertTriangle, Check, Calendar as CalendarIcon,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CATEGORIES = ["personal", "project", "vacation", "unavailable", "other"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CAT_STYLES = {
  personal:    "bg-blue-100 text-blue-800 border-blue-200",
  project:     "bg-amber-100 text-amber-900 border-amber-200",
  vacation:    "bg-emerald-100 text-emerald-800 border-emerald-200",
  unavailable: "bg-neutral-200 text-neutral-800 border-neutral-300",
  other:       "bg-purple-100 text-purple-900 border-purple-200",
};

function fmtLocal(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-US", {
      timeZone: "America/Chicago",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}
function fmtDate(dateLocal) {
  if (!dateLocal) return "";
  const [y, m, d] = dateLocal.split("-").map(Number);
  // Build in local (browser) so formatting works even if browser tz != Chicago
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export default function AdminSchedulePage() {
  const { adminAuth, loginAdmin, logoutAdmin, checkAdminAuth } = useAuth();
  const navigate = useNavigate();

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState("blocks"); // "blocks" | "rules" | "calendar"
  const [blocks, setBlocks] = useState([]);
  const [rules, setRules] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState(null); // { kind:'block'|'rule', data:{...} } | null
  const [conflicts, setConflicts] = useState(null); // { count, conflicts, pendingPayload, pendingKind } | null

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const opts = { withCredentials: true };
      const [blocksRes, rulesRes, availRes] = await Promise.all([
        axios.get(`${API}/admin/schedule/blocks`, opts),
        axios.get(`${API}/admin/schedule/rules`, opts),
        axios.get(`${API}/schedule/availability?days=30`, opts),
      ]);
      setBlocks(blocksRes.data.blocks || []);
      setRules(rulesRes.data.rules || []);
      setAvailability(availRes.data);
    } catch (e) {
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        toast.error("Session expired");
        await logoutAdmin();
        setAuthenticated(false);
      } else {
        toast.error("Couldn't load schedule data");
      }
    } finally {
      setLoading(false);
    }
  }, [logoutAdmin]);

  useEffect(() => {
    const init = async () => {
      const ok = await checkAdminAuth();
      if (ok) { setAuthenticated(true); fetchAll(); }
    };
    if (adminAuth) { setAuthenticated(true); fetchAll(); } else { init(); }
  }, [adminAuth, checkAdminAuth, fetchAll]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      await loginAdmin(password);
      setAuthenticated(true);
      toast.success("Signed in");
      fetchAll();
    } catch { toast.error("Invalid admin password"); }
    finally { setLoggingIn(false); }
  };

  // ---- Block CRUD ----
  const saveBlock = async (payload, acknowledgeConflicts = false) => {
    const opts = { withCredentials: true };
    const body = { ...payload, acknowledge_conflicts: acknowledgeConflicts };
    try {
      if (payload.id) {
        await axios.patch(`${API}/admin/schedule/blocks/${payload.id}`, body, opts);
      } else {
        const res = await axios.post(`${API}/admin/schedule/blocks`, body, opts);
        // 409 handled below via catch
        if (res.status === 409) {
          setConflicts({
            count: res.data.count,
            conflicts: res.data.conflicts,
            pendingPayload: payload,
            pendingKind: "block",
          });
          return;
        }
      }
      toast.success(payload.id ? "Block updated" : "Block created");
      setEditing(null); setConflicts(null); fetchAll();
    } catch (e) {
      if (e?.response?.status === 409) {
        setConflicts({
          count: e.response.data.count,
          conflicts: e.response.data.conflicts,
          pendingPayload: payload,
          pendingKind: "block",
        });
      } else {
        toast.error(e?.response?.data?.detail || "Save failed");
      }
    }
  };
  const deleteBlock = async (id) => {
    if (!window.confirm("Delete this block? Existing bookings on the affected days remain untouched.")) return;
    try {
      await axios.delete(`${API}/admin/schedule/blocks/${id}`, { withCredentials: true });
      toast.success("Block deleted");
      fetchAll();
    } catch { toast.error("Delete failed"); }
  };

  // ---- Rule CRUD ----
  const saveRule = async (payload, acknowledgeConflicts = false) => {
    const opts = { withCredentials: true };
    const body = { ...payload, acknowledge_conflicts: acknowledgeConflicts };
    try {
      if (payload.id) {
        await axios.patch(`${API}/admin/schedule/rules/${payload.id}`, body, opts);
      } else {
        await axios.post(`${API}/admin/schedule/rules`, body, opts);
      }
      toast.success(payload.id ? "Rule updated" : "Rule created");
      setEditing(null); setConflicts(null); fetchAll();
    } catch (e) {
      if (e?.response?.status === 409) {
        setConflicts({
          count: e.response.data.count,
          conflicts: e.response.data.conflicts,
          pendingPayload: payload,
          pendingKind: "rule",
        });
      } else {
        toast.error(e?.response?.data?.detail || "Save failed");
      }
    }
  };
  const deleteRule = async (id) => {
    if (!window.confirm("Delete this recurring rule? Existing bookings remain untouched.")) return;
    try {
      await axios.delete(`${API}/admin/schedule/rules/${id}`, { withCredentials: true });
      toast.success("Rule deleted");
      fetchAll();
    } catch { toast.error("Delete failed"); }
  };

  // ---- Login gate ----
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background" data-testid="admin-schedule-login">
        <Navbar />
        <div className="pt-24 pb-16 px-6 md:px-12 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-light tracking-tight text-foreground mb-2"
                  style={{ fontFamily: "'Fraunces', serif" }}>
                Schedule Blocker
              </h1>
              <p className="text-sm text-muted-foreground">Admin sign-in required.</p>
            </div>
            <div className="bg-white border border-border/40 rounded-2xl p-8 shadow-sm">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="admin-pw">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="admin-pw" data-testid="admin-schedule-password-input"
                      type="password" placeholder="Admin password"
                      value={password} onChange={(e)=>setPassword(e.target.value)}
                      className="h-12 pl-10 rounded-lg" />
                  </div>
                </div>
                <Button type="submit" disabled={loggingIn}
                  className="w-full h-12 rounded-full bg-primary text-primary-foreground btn-pill shadow-lg shadow-primary/20"
                  data-testid="admin-schedule-login-btn">
                  {loggingIn ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="admin-schedule-page">
      <Navbar />

      <div className="pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <Button variant="ghost" size="sm" onClick={()=>navigate("/admin")}
                className="text-xs text-muted-foreground mb-2 -ml-2">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Admin
              </Button>
              <div className="flex items-center gap-2 mb-1">
                <CalendarIcon className="w-5 h-5 text-[#D97757]" />
                <p className="text-sm uppercase tracking-widest font-semibold text-[#D97757]">
                  Schedule Blocker
                </p>
              </div>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground"
                  style={{ fontFamily: "'Fraunces', serif" }}>
                Block dates &amp; recurring times
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                All times shown in <strong>America/Chicago</strong>. Blocks remove availability from{" "}
                <button onClick={()=>navigate("/book")} className="underline underline-offset-2 hover:text-[#D97757]">/book</button>{" "}
                immediately. Existing bookings are never modified.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button variant={tab==="blocks"?"default":"ghost"}
              className={`rounded-full text-sm ${tab==="blocks"?"bg-primary text-primary-foreground":""}`}
              onClick={()=>setTab("blocks")} data-testid="tab-blocks">
              <CalendarX className="w-4 h-4 mr-1.5" /> One-time blocks ({blocks.length})
            </Button>
            <Button variant={tab==="rules"?"default":"ghost"}
              className={`rounded-full text-sm ${tab==="rules"?"bg-primary text-primary-foreground":""}`}
              onClick={()=>setTab("rules")} data-testid="tab-rules">
              <Repeat className="w-4 h-4 mr-1.5" /> Weekly rules ({rules.length})
            </Button>
            <Button variant={tab==="calendar"?"default":"ghost"}
              className={`rounded-full text-sm ${tab==="calendar"?"bg-primary text-primary-foreground":""}`}
              onClick={()=>setTab("calendar")} data-testid="tab-calendar">
              <CalendarIcon className="w-4 h-4 mr-1.5" /> Calendar (30 days)
            </Button>
          </div>

          <Separator className="mb-6" />

          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {!loading && tab === "blocks" && (
            <BlocksTab blocks={blocks} onNew={()=>setEditing({kind:"block", data:{}})}
              onEdit={(b)=>setEditing({kind:"block", data:b})} onDelete={deleteBlock} />
          )}
          {!loading && tab === "rules" && (
            <RulesTab rules={rules} onNew={()=>setEditing({kind:"rule", data:{}})}
              onEdit={(r)=>setEditing({kind:"rule", data:r})} onDelete={deleteRule} />
          )}
          {!loading && tab === "calendar" && availability && (
            <CalendarTab availability={availability} />
          )}
        </div>
      </div>

      {editing && (
        <EditModal editing={editing}
          onCancel={()=>setEditing(null)}
          onSaveBlock={(p)=>saveBlock(p)}
          onSaveRule={(p)=>saveRule(p)} />
      )}
      {conflicts && (
        <ConflictModal
          info={conflicts}
          onCancel={()=>setConflicts(null)}
          onConfirm={()=>{
            const kind = conflicts.pendingKind;
            const payload = conflicts.pendingPayload;
            if (kind === "block") saveBlock(payload, true);
            else saveRule(payload, true);
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// Blocks tab
// ============================================================
function BlocksTab({ blocks, onNew, onEdit, onDelete }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          Full-day or partial-day blocks for specific dates. Deleting a block restores availability.
        </p>
        <Button onClick={onNew} className="rounded-full bg-primary text-primary-foreground"
          data-testid="new-block-btn">
          <Plus className="w-4 h-4 mr-1.5" /> New block
        </Button>
      </div>

      {blocks.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl text-muted-foreground">
          No active one-time blocks. Create one to hold time off, project work, or personal days.
        </div>
      ) : (
        <div className="space-y-3" data-testid="blocks-list">
          {blocks.map((b)=>(
            <div key={b.id} data-testid={`block-row-${b.id}`}
              className="bg-white border border-border/40 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className={`shrink-0 px-2 py-1 rounded text-[10px] uppercase tracking-wider font-semibold border ${CAT_STYLES[b.category] || CAT_STYLES.other}`}>
                  {b.category}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {fmtDate(b.date_local)}{" "}
                    {b.full_day
                      ? <span className="text-muted-foreground">— all day</span>
                      : <span className="text-muted-foreground">— {b.start_time_local} to {b.end_time_local}</span>}
                  </p>
                  {b.note && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{b.note}</p>}
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    Created {fmtLocal(b.created_at)} by {b.created_by}
                    {b.updated_at && b.updated_at !== b.created_at && <> · Updated {fmtLocal(b.updated_at)}</>}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={()=>onEdit(b)}
                  data-testid={`edit-block-${b.id}`}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={()=>onDelete(b.id)}
                  className="text-red-600 hover:text-red-800"
                  data-testid={`delete-block-${b.id}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Rules tab
// ============================================================
function RulesTab({ rules, onNew, onEdit, onDelete }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          Recurring weekly rules. Example: never allow bookings on Sundays; block Wednesday afternoons every week.
        </p>
        <Button onClick={onNew} className="rounded-full bg-primary text-primary-foreground"
          data-testid="new-rule-btn">
          <Plus className="w-4 h-4 mr-1.5" /> New weekly rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl text-muted-foreground">
          No weekly rules yet. Add one to close a weekday or a recurring time range.
        </div>
      ) : (
        <div className="space-y-3" data-testid="rules-list">
          {rules.map((r)=>(
            <div key={r.id} data-testid={`rule-row-${r.id}`}
              className="bg-white border border-border/40 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className={`shrink-0 px-2 py-1 rounded text-[10px] uppercase tracking-wider font-semibold border ${CAT_STYLES[r.category] || CAT_STYLES.other}`}>
                  {r.category}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Every <strong>{WEEKDAYS[r.weekday]}</strong>{" "}
                    {r.full_day
                      ? <span className="text-muted-foreground">— all day</span>
                      : <span className="text-muted-foreground">— {r.start_time_local} to {r.end_time_local}</span>}
                    {!r.active && <span className="ml-2 text-red-600 text-xs">(inactive)</span>}
                  </p>
                  {r.note && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.note}</p>}
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    Created {fmtLocal(r.created_at)} by {r.created_by}
                    {r.updated_at && r.updated_at !== r.created_at && <> · Updated {fmtLocal(r.updated_at)}</>}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={()=>onEdit(r)}
                  data-testid={`edit-rule-${r.id}`}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={()=>onDelete(r.id)}
                  className="text-red-600 hover:text-red-800"
                  data-testid={`delete-rule-${r.id}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Calendar (next 30 days)
// ============================================================
function CalendarTab({ availability }) {
  const days = availability?.days || [];
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Live availability preview from <code>/api/schedule/availability</code>. All times America/Chicago.
        Grey = closed. Orange dot = unavailable slot (booked or blocked).
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" data-testid="calendar-grid">
        {days.map((d)=>{
          const totalSlots = d.slots.length;
          const openSlots = d.slots.filter(s=>s.available).length;
          const closed = !d.is_open;
          return (
            <div key={d.date}
              className={`border rounded-xl p-3 ${closed ? "bg-neutral-100 border-neutral-200" : "bg-white border-border/40"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">{d.weekday}</span>
                <span className="text-xs text-muted-foreground">{d.date.slice(5)}</span>
              </div>
              {closed ? (
                <p className="text-xs text-muted-foreground italic">Closed</p>
              ) : (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">{openSlots} of {totalSlots} slots open</p>
                  <div className="flex flex-wrap gap-1">
                    {d.slots.map((s)=>(
                      <span key={s.iso}
                        className={`w-2 h-2 rounded-full ${s.available ? "bg-emerald-500" : "bg-[#D97757]/70"}`}
                        title={`${s.label} — ${s.available ? "open" : "blocked/booked"}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Edit / Create modal
// ============================================================
function EditModal({ editing, onCancel, onSaveBlock, onSaveRule }) {
  const isRule = editing.kind === "rule";
  const [form, setForm] = useState(() => {
    if (isRule) return {
      id: editing.data?.id,
      weekday: editing.data?.weekday ?? 6, // default Sun
      full_day: editing.data?.full_day ?? true,
      start_time_local: editing.data?.start_time_local || "",
      end_time_local:   editing.data?.end_time_local || "",
      category: editing.data?.category || "unavailable",
      note: editing.data?.note || "",
    };
    return {
      id: editing.data?.id,
      date_local: editing.data?.date_local || "",
      full_day: editing.data?.full_day ?? true,
      start_time_local: editing.data?.start_time_local || "",
      end_time_local:   editing.data?.end_time_local || "",
      category: editing.data?.category || "personal",
      note: editing.data?.note || "",
    };
  });
  const update = (k,v)=>setForm(f=>({...f, [k]:v}));

  const submit = (e)=>{
    e.preventDefault();
    if (isRule) {
      if (!form.full_day && (!form.start_time_local || !form.end_time_local)) {
        toast.error("Partial-day rule needs start and end times."); return;
      }
      onSaveRule(form);
    } else {
      if (!form.date_local) { toast.error("Pick a date."); return; }
      if (!form.full_day && (!form.start_time_local || !form.end_time_local)) {
        toast.error("Partial-day block needs start and end times."); return;
      }
      onSaveBlock(form);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" data-testid="edit-modal">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-medium text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
            {form.id ? "Edit" : "New"} {isRule ? "weekly rule" : "one-time block"}
          </h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"
            data-testid="close-edit-modal"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {isRule ? (
            <div className="space-y-2">
              <Label>Weekday</Label>
              <select
                value={form.weekday}
                onChange={(e)=>update("weekday", Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-border/60 bg-white px-3 text-sm"
                data-testid="edit-weekday">
                {WEEKDAYS.map((w,i)=>(<option key={w} value={i}>{w}</option>))}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="date_local">Date</Label>
              <Input id="date_local" type="date" value={form.date_local}
                onChange={(e)=>update("date_local", e.target.value)}
                data-testid="edit-date" className="h-10" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input id="full_day" type="checkbox" checked={form.full_day}
              onChange={(e)=>update("full_day", e.target.checked)}
              data-testid="edit-full-day" />
            <Label htmlFor="full_day" className="!mt-0">Full day</Label>
          </div>

          {!form.full_day && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start time</Label>
                <Input type="time" value={form.start_time_local}
                  onChange={(e)=>update("start_time_local", e.target.value)}
                  data-testid="edit-start-time" className="h-10" />
              </div>
              <div>
                <Label>End time</Label>
                <Input type="time" value={form.end_time_local}
                  onChange={(e)=>update("end_time_local", e.target.value)}
                  data-testid="edit-end-time" className="h-10" />
              </div>
            </div>
          )}

          <div>
            <Label>Category</Label>
            <select value={form.category}
              onChange={(e)=>update("category", e.target.value)}
              className="w-full h-10 rounded-lg border border-border/60 bg-white px-3 text-sm"
              data-testid="edit-category">
              {CATEGORIES.map((c)=>(<option key={c} value={c}>{c[0].toUpperCase()+c.slice(1)}</option>))}
            </select>
          </div>

          <div>
            <Label>Note (optional)</Label>
            <Textarea rows={2} value={form.note} maxLength={280}
              onChange={(e)=>update("note", e.target.value)}
              placeholder="Internal reason — never shown publicly"
              data-testid="edit-note" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground rounded-full px-6"
              data-testid="edit-save-btn">
              <Check className="w-3.5 h-3.5 mr-1.5" /> Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Conflict warning modal — admin must acknowledge before saving
// ============================================================
function ConflictModal({ info, onCancel, onConfirm }) {
  const list = info?.conflicts || [];
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" data-testid="conflict-modal">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
          <h2 className="text-xl font-medium text-foreground" style={{ fontFamily: "'Fraunces', serif" }}>
            Conflicts with existing bookings
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          This block conflicts with <strong>{info.count}</strong> already-confirmed appointment{info.count===1?"":"s"}.
          These bookings will <strong>not</strong> be cancelled or changed — they stay on your calendar as-is.
          Only new bookings will be prevented going forward.
        </p>
        <div className="max-h-56 overflow-y-auto border rounded-lg divide-y" data-testid="conflicts-list">
          {list.slice(0, 20).map((c, i)=>(
            <div key={c.id || i} className="p-3 text-sm">
              <p className="font-medium text-foreground">{c.slot_start_local_display}</p>
              <p className="text-xs text-muted-foreground">
                {c.name || "Unnamed lead"} · {c.type_label || "Appointment"}
                {c.phone ? ` · ${c.phone}` : ""}
              </p>
            </div>
          ))}
          {list.length > 20 && <p className="p-3 text-xs text-muted-foreground text-center">
            …and {list.length - 20} more
          </p>}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button type="button" variant="ghost" onClick={onCancel}
            data-testid="conflict-cancel">Cancel</Button>
          <Button type="button" onClick={onConfirm}
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-6"
            data-testid="conflict-acknowledge">
            I understand — save block anyway
          </Button>
        </div>
      </div>
    </div>
  );
}
