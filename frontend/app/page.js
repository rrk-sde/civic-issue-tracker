'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomSelect from '@/components/CustomSelect';
import SuccessAnimation from '@/components/SuccessAnimation';
import {
  Send, MapPin, Camera, Search, CheckCircle, AlertCircle,
  FileText, Zap, Clock, Locate, X, ImageIcon, LogOut, Sparkles
} from 'lucide-react';

const STATUS_STEPS = ['Open', 'In Progress', 'Resolved', 'Closed'];
const STATUS_MAP = {
  'Open': { cls: 'status-open', i: 0 },
  'In Progress': { cls: 'status-progress', i: 1 },
  'Resolved': { cls: 'status-resolved', i: 2 },
  'Closed': { cls: 'status-closed', i: 3 },
};

const WARDS = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Unspecified'];

function HowItWorks() {
  return (
    <div className="card" style={{ padding: 28 }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>// HOW IT WORKS</p>
      {[
        { n: '01', title: 'Submit Issue', desc: 'Fill form, attach photo, geo-tag location.' },
        { n: '02', title: 'Get Tracking ID', desc: 'Receive unique ID like W-AB12CD instantly.' },
        { n: '03', title: 'Officer Acts', desc: 'Assigned officer updates progress & SLA.' },
        { n: '04', title: 'Issue Resolved', desc: 'Complaint lifecycle closed with history.' },
      ].map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < 3 ? 18 : 0, alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: i === 0 ? 'var(--amber)' : 'transparent', border: i === 0 ? 'none' : '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: i === 0 ? '#0d0b14' : 'var(--text-3)' }}>{s.n}</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-0)', marginBottom: 3 }}>{s.title}</p>
            <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsTicker() {
  const [data, setData] = useState({ total: 0, pending: 0, resolved: 0 });
  useEffect(() => {
    fetch('/api/complaints/analytics').then(r => r.json()).then(setData).catch(() => { });
  }, []);
  const stats = [
    { n: data.total, label: 'Filed', color: 'var(--amber)' },
    { n: data.resolved, label: 'Resolved', color: '#6EE7B7' },
    { n: data.pending, label: 'Pending', color: '#93C5FD' },
    { n: '3 days', label: 'SLA window', color: 'var(--text-2)' },
  ];
  return (
    <div className="card" style={{ padding: 28 }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>// WARD STATS</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {stats.map((s, i) => (
          <div key={i}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.n}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('submit');
  const [form, setForm] = useState({ title: '', description: '', address: '', ward: 'Unspecified', severity: 'Medium', category: 'General' });
  const [geo, setGeo] = useState(null);  // { lat, lng }
  const [geoLoading, setGeoLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trackId, setTrackId] = useState('');
  const [trackData, setTrackData] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);
  const fileRef = useRef();
  const mainRef = useRef(null);

  const handleTabClick = (t) => {
    setTab(t);
    setResult(null);
    setTrackData(null);
    if (window.innerWidth <= 900) {
      setTimeout(() => {
        if (mainRef.current) {
          const y = mainRef.current.getBoundingClientRect().top + window.scrollY - 120;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('civic_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Geolocation
  const getLocation = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setForm(f => ({ ...f, address: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` }));
        setGeoLoading(false);
      },
      () => { alert('Location permission denied.'); setGeoLoading(false); }
    );
  };

  // Photo select
  const onPhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));

    // Start AI Analysis automatically
    setAiAnalyzing(true);
    setAiSuccess(false);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];

        const res = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64data, mimeType: file.type })
        });

        if (res.ok) {
          const aiData = await res.json();
          // Populate the active form with the Gemini AI generated contextual data
          setForm(f => ({ ...f, title: aiData.title || f.title, description: aiData.description || f.description, severity: aiData.severity || f.severity, category: aiData.category || f.category }));
          setAiSuccess(true);
        }
        setAiAnalyzing(false);
      };
    } catch (err) {
      console.error(err);
      setAiAnalyzing(false);
    }
  };

  // Upload to Cloudinary via our secure server-side API route
  const uploadToCloudinary = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      let photoUrl = null;
      if (photoFile) {
        setUploading(true);
        photoUrl = await uploadToCloudinary(photoFile);
        setUploading(false);
        if (!photoUrl && photoFile) photoUrl = 'local-photo-pending'; // fallback if Cloudinary not configured
      }

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          severity: form.severity,
          category: form.category,
          photoUrl,
          location: { address: form.address, lat: geo?.lat, lng: geo?.lng, ward: form.ward },
          submittedBy: user?.name || 'Citizen',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, id: data.complaintId });
        setForm({ title: '', description: '', address: '', ward: 'Unspecified', severity: 'Medium', category: 'General' });
        setGeo(null); setPhotoFile(null); setPhotoPreview(null);
      } else setResult({ ok: false });
    } catch { setResult({ ok: false }); }
    setLoading(false);
  };

  const handleTrack = async (e) => {
    e.preventDefault(); setTrackLoading(true); setTrackData(null);
    try {
      const res = await fetch(`/api/complaints/track/${trackId.trim().toUpperCase()}`);
      const data = await res.json();
      setTrackData(res.ok ? data : { error: true });
    } catch { setTrackData({ error: true }); }
    setTrackLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('civic_user');
    router.push('/login');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar user={user} onLogout={logout} />

        <main className="sys-container">

          {/* HERO BENTO */}
          <div className="grid-bento" style={{ gap: 16, marginBottom: 16 }}>
            <div className="card card-glow animate-up card-bento">
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid var(--border-1)', borderRadius: 'var(--r-pill)', padding: '5px 12px', marginBottom: 18 }}>
                  <span style={{ width: 6, height: 6, background: 'var(--amber)', borderRadius: '50%', boxShadow: '0 0 8px var(--amber)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)', letterSpacing: '0.06em' }}>PANCHAYAT / WARD — CIVIC MANAGEMENT</span>
                </div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,3.5vw,50px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em' }}>
                  Your Voice.<br /><span className="gradient-text">Your City.</span>
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 12, maxWidth: 420, lineHeight: 1.7 }}>
                  Report civic issues, track resolution in real-time with a unique ID, and hold your ward accountable.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
                {['submit', 'track'].map(t => (
                  <button key={t} onClick={() => handleTabClick(t)}
                    className={t === tab ? 'btn btn-amber' : 'btn btn-ghost'}
                    style={{ padding: '9px 20px', fontSize: 13 }}>
                    {t === 'submit' ? '📋 Report Issue' : '🔍 Track Complaint'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <StatsTicker />
              <div className="card" style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p style={{ fontSize: 16, color: 'var(--text-1)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 14 }}>
                  "The strength of a democracy lies not in the halls of power, but in the voice of every citizen."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 24, height: 1, background: 'var(--amber)', borderRadius: 1 }} />
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.04em' }}>— CivicTrack Initiative</p>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN GRID */}
          <div ref={mainRef} className={`grid-main ${tab === 'submit' && !result ? 'sidebar-open' : ''}`} style={{ gap: 16 }}>

            {/* ===== SUBMIT FORM ===== */}
            {tab === 'submit' && !result && (
              <div className="card card-glow animate-up" style={{ padding: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>// NEW COMPLAINT</span>
                  <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--border-1), transparent)' }} />
                  {user && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>Filing as: <span style={{ color: 'var(--amber)' }}>{user.name}</span></span>}
                </div>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    {/* Cloudinary Photo Upload (Moved to Top) */}
                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                        Photo Proof {uploading && <span style={{ color: 'var(--amber)' }}>Uploading...</span>}
                      </label>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPhotoSelect} />
                      {!photoPreview ? (
                        <div onClick={() => fileRef.current.click()}
                          className="card card-dashed"
                          style={{
                            padding: '20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            borderRadius: 'var(--r-md)',
                            transition: 'all 0.3s',
                            border: '1px dashed var(--amber)',
                            background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.02) 0%, transparent 100%)',
                            boxShadow: '0 0 15px rgba(245, 158, 11, 0.05)'
                          }}
                          onMouseEnter={el => {
                            el.currentTarget.style.borderColor = 'var(--amber-d)';
                            el.currentTarget.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.15)';
                          }}
                          onMouseLeave={el => {
                            el.currentTarget.style.borderColor = 'var(--amber)';
                            el.currentTarget.style.boxShadow = '0 0 15px rgba(245, 158, 11, 0.05)';
                          }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                            <Camera size={22} color="var(--amber)" />
                            <Sparkles size={16} color="var(--amber)" style={{ animation: 'pulse 2s infinite' }} />
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>Upload Photo for Auto-Fill</p>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>Gemini AI will analyze issue & severity</p>
                        </div>
                      ) : (
                        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                          <img src={photoPreview} alt="Preview" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 'var(--r-md)', border: '1px solid var(--border-1)' }} />
                          <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); setAiSuccess(false); }}
                            style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <X size={13} />
                          </button>
                        </div>
                      )}

                      {aiAnalyzing && (
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 14, height: 14, border: '2px solid rgba(59, 130, 246, 0.3)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#93C5FD' }}><b>Gemini AI</b> is analyzing issue...</p>
                        </div>
                      )}

                      {aiSuccess && !aiAnalyzing && (
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ fontSize: 16 }}>✨</span>
                          <div>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6EE7B7', fontWeight: 700, marginBottom: 2 }}>AI classification complete</p>
                            <p style={{ fontSize: 12, color: 'var(--text-2)' }}>Title and description have been auto-filled based on the photo. Please review and adjust if needed.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Issue Title *</span>
                        {aiSuccess && <span style={{ color: '#6EE7B7', fontSize: 9, display: 'flex', alignItems: 'center', gap: 4 }}>✨ AI Autofilled</span>}
                      </label>
                      <input required placeholder="e.g., Open manhole near Bus Stop, Sector 4" className="field"
                        value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                        style={aiSuccess ? { borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.03)' } : {}} />
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Description *</span>
                        {aiSuccess && <span style={{ color: '#6EE7B7', fontSize: 9, display: 'flex', alignItems: 'center', gap: 4 }}>✨ AI Autofilled</span>}
                      </label>
                      <textarea required placeholder="Describe clearly — exact spot, severity, duration, any safety hazard..." className="field"
                        value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                        style={aiSuccess ? { borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.03)', minHeight: 100 } : { minHeight: 100 }} />
                    </div>

                    {/* Ward */}
                    <div>
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Ward</label>
                      <CustomSelect
                        options={WARDS.map(w => ({ value: w, label: w }))}
                        value={form.ward}
                        onChange={v => setForm({ ...form, ward: v })}
                        placeholder="Select Ward"
                        width={'100%'}
                        icon={MapPin}
                      />
                    </div>

                    {/* Location with Geo-Tag */}
                    <div>
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        Location *
                        {geoLoading && <span style={{ color: 'var(--amber)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, border: '2px solid rgba(245, 158, 11, 0.3)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Geo-tagging...</span>}
                        {(!geoLoading && geo) && <span style={{ color: '#6EE7B7' }}>✓ Geo-tagged</span>}
                      </label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <MapPin size={13} color="#EF4444" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                          <input required placeholder="Address or tap geo-tag" className="field" style={{ paddingLeft: 34, fontSize: 13 }}
                            value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                        </div>
                        <button type="button" className="btn btn-ghost" style={{ padding: '0 12px', flexShrink: 0 }} onClick={getLocation} title="Geo-tag my location">
                          {geoLoading
                            ? <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            : <Locate size={14} color={geo ? '#6EE7B7' : 'var(--text-2)'} />}
                        </button>
                      </div>
                      {geo && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#6EE7B7', marginTop: 5 }}>📍 {geo.lat.toFixed(5)}, {geo.lng.toFixed(5)}</p>}
                    </div>

                  </div>

                  <button type="submit" className="btn btn-amber" disabled={loading || uploading} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                    {loading
                      ? <span style={{ width: 16, height: 16, border: '2px solid rgba(13,11,20,0.3)', borderTopColor: '#0d0b14', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      : <><Send size={15} /> Submit Complaint</>}
                  </button>
                </form>
              </div>
            )}

            {/* ===== SUCCESS ===== */}
            {tab === 'submit' && result?.ok && (
              <div className="card animate-up" style={{ padding: 40 }}>
                <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flexShrink: 0, marginTop: -20, marginLeft: -10 }}>
                    <SuccessAnimation />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#6EE7B7', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>// COMPLAINT REGISTERED</p>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-0)', marginBottom: 6 }}>You're in the system.</h2>
                    <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.6 }}>Filed with the ward office. SLA: 3 days to resolution.</p>
                    <div style={{ background: 'rgba(13,11,20,0.9)', border: '1px dashed var(--amber-d)', borderRadius: 'var(--r-lg)', padding: '18px 24px', marginBottom: 24, display: 'inline-block' }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>YOUR TRACKING ID</p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 34, fontWeight: 700, letterSpacing: '0.1em' }} className="gradient-text">{result.id}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button className="btn btn-amber" style={{ padding: '10px 18px', fontSize: 13 }} onClick={() => setResult(null)}><Send size={14} /> File Another</button>
                      <button className="btn btn-outline-amber" style={{ padding: '10px 18px', fontSize: 13 }} onClick={() => { setTab('track'); setTrackId(result.id); setResult(null); }}><Search size={14} /> Track This</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== SUBMIT ERROR ===== */}
            {tab === 'submit' && result?.ok === false && (
              <div className="card" style={{ padding: 28, textAlign: 'center' }}>
                <AlertCircle size={28} color="#FCA5A5" style={{ margin: '0 auto 10px' }} />
                <p style={{ color: '#FCA5A5', fontSize: 14, marginBottom: 14 }}>Submission failed. Please try again.</p>
                <button className="btn btn-ghost" onClick={() => setResult(null)}>Try Again</button>
              </div>
            )}

            {/* ===== TRACK ===== */}
            {tab === 'track' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="card animate-up" style={{ padding: 28 }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>// TRACK COMPLAINT STATUS</p>
                  <form onSubmit={handleTrack} style={{ display: 'flex', gap: 10 }}>
                    <input required placeholder="Enter Tracking ID — e.g. W-AB12CD" className="field mono"
                      style={{ textTransform: 'uppercase', flex: 1 }} value={trackId} onChange={e => setTrackId(e.target.value)} />
                    <button type="submit" className="btn btn-amber" disabled={trackLoading} style={{ padding: '12px 22px', whiteSpace: 'nowrap' }}>
                      {trackLoading
                        ? <span style={{ width: 14, height: 14, border: '2px solid rgba(13,11,20,0.3)', borderTopColor: '#0d0b14', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        : <><Search size={14} /> Track</>}
                    </button>
                  </form>
                </div>

                {trackData && !trackData.error && (
                  <div className="card animate-up" style={{ padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12 }}>
                      <div>
                        <p className="mono" style={{ fontSize: 11, color: 'var(--amber)', marginBottom: 4 }}>{trackData.complaintId}</p>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-0)', marginBottom: 4 }}>{trackData.title}</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          {trackData.location?.address && (
                            <p style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={11} /> {trackData.location.address}
                            </p>
                          )}
                          {trackData.location?.ward && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', background: 'rgba(245,158,11,0.08)', border: '1px solid var(--border-1)', padding: '2px 8px', borderRadius: 4 }}>{trackData.location.ward}</span>
                          )}
                          {trackData.severity && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: trackData.severity === 'High' ? '#EF4444' : trackData.severity === 'Medium' ? 'var(--amber)' : '#93C5FD', background: 'transparent', border: `1px solid ${trackData.severity === 'High' ? 'rgba(239,68,68,0.3)' : trackData.severity === 'Medium' ? 'rgba(245,158,11,0.3)' : 'rgba(147,197,253,0.3)'}`, padding: '2px 8px', borderRadius: 4 }}>
                              {trackData.severity} Severity
                            </span>
                          )}
                          {trackData.category && trackData.category !== 'General' && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-1)', background: 'var(--bg-1)', border: '1px solid var(--border-1)', padding: '2px 8px', borderRadius: 4 }}>
                              {trackData.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`badge ${STATUS_MAP[trackData.status]?.cls || 'status-open'}`}>{trackData.status}</span>
                    </div>

                    {/* Photo if available */}
                    {trackData.photoUrl && trackData.photoUrl !== 'local-photo-pending' && (
                      <img src={trackData.photoUrl} alt="Complaint photo" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--r-md)', marginBottom: 18, border: '1px solid var(--border-0)' }} />
                    )}

                    {/* Escalation indicator */}
                    {trackData.escalationLevel > 0 && (
                      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--r-md)', padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13 }}>⚠️</span>
                        <p style={{ fontSize: 13, color: '#FCA5A5', fontWeight: 500 }}>Escalated to Level {trackData.escalationLevel}</p>
                      </div>
                    )}


                    {/* Horizontal progress */}
                    <div style={{ background: 'var(--bg-1)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-0)', padding: '18px', marginBottom: 20 }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>COMPLAINT PROGRESS</p>
                      <div className="step-tracker">
                        {STATUS_STEPS.map((step, i) => {
                          const curr = STATUS_MAP[trackData.status]?.i ?? 0;
                          const done = i < curr; const active = i === curr;
                          return (
                            <div key={step} style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 26, height: 26, borderRadius: '50%', background: done ? 'var(--green)' : active ? 'var(--amber)' : 'transparent', border: (done || active) ? 'none' : '1px dashed var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: (done || active) ? 'var(--bg-0)' : 'var(--text-3)' }}>
                                  {done ? '✓' : i + 1}
                                </div>
                                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: active ? 'var(--amber)' : done ? 'var(--green)' : 'var(--text-3)', whiteSpace: 'nowrap', fontWeight: active ? 700 : 400 }}>{step}</span>
                              </div>
                              {i < STATUS_STEPS.length - 1 && <div className="step-connector" style={{ flex: 1, height: 1, background: done ? 'var(--green)' : 'var(--border-0)', margin: '0 8px', marginBottom: 22 }} />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16 }}>{trackData.description}</p>

                    <div style={{ borderTop: '1px solid var(--border-0)', paddingTop: 14 }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>ACTIVITY LOG</p>
                      {trackData.history?.map((h, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? 'var(--amber)' : 'var(--border-1)', marginTop: 5, flexShrink: 0, border: i === 0 ? 'none' : '1px solid var(--border-1)' }} />
                          <div>
                            <p style={{ fontSize: 13, color: 'var(--text-0)', fontWeight: 500 }}>{h.action}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                              {new Date(h.timestamp).toLocaleString('en-IN')} · {h.by}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {trackData?.error && (
                  <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                    <AlertCircle size={26} color="#FCA5A5" style={{ margin: '0 auto 10px' }} />
                    <p style={{ color: '#FCA5A5', fontSize: 14 }}>No complaint found with that ID.</p>
                  </div>
                )}
              </div>
            )}

            {/* How it works column */}
            {tab === 'submit' && !result && <div className="animate-up d2"><HowItWorks /></div>}
          </div>
        </main>
      </div>
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
