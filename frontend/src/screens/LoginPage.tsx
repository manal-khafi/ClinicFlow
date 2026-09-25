import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, AlertCircle, Activity, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await login(email, password);
      // No redirect needed here — once login() succeeds, AuthContext's
      // isAuthenticated flips to true and App.tsx renders the dashboard.
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputBase = "w-full border rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none transition-all bg-white";

  function inputStyle(field: 'email' | 'password') {
    const hasErr = submitted && fieldErrors[field];
    return {
      borderColor: hasErr ? '#FCA5A5' : '#E7F0EA',
      boxShadow: hasErr ? '0 0 0 3px rgba(220,38,38,0.08)' : undefined,
    };
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Error alert */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl border" style={{ background: '#FEF2F2', borderColor: '#FCA5A5' }}>
          <AlertCircle size={15} color="#DC2626" className="flex-shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-[#DC2626]">{error}</p>
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-[#374151] mb-1.5">Email address</label>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); if (submitted) setFieldErrors(v => ({ ...v, email: undefined })); }}
          placeholder="you@clinicflow.app"
          className={inputBase}
          style={inputStyle('email')}
          autoComplete="email"
        />
        {submitted && fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-[#374151]">Password</label>
          <button type="button" className="text-xs font-medium" style={{ color: '#16A34A' }}>Forgot password?</button>
        </div>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); if (submitted) setFieldErrors(v => ({ ...v, password: undefined })); }}
            placeholder="••••••••"
            className={`${inputBase} pr-11`}
            style={inputStyle('password')}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {submitted && fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
      </div>

      {/* Remember me */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <div
          onClick={() => setRemember(v => !v)}
          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all"
          style={{ background: remember ? '#16A34A' : '#fff', borderColor: remember ? '#16A34A' : '#D1D5DB' }}
        >
          {remember && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <span className="text-sm text-[#374151]">Remember me</span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 mt-1"
        style={{ background: loading ? '#86EFAC' : 'linear-gradient(135deg,#16A34A,#10B981)', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? <><Loader2 size={16} className="animate-spin" />Signing in…</> : 'Sign in'}
      </button>

      {/* Admin note */}
      <p className="text-center text-xs text-[#9CA3AF] pt-1">
        Don't have an account?{' '}
        <span className="font-medium" style={{ color: '#16A34A' }}>Contact your administrator.</span>
      </p>

      {/* Demo hint */}
      <div className="rounded-xl p-3 text-center" style={{ background: '#ECFDF5' }}>
        <p className="text-[11px] text-[#6B7280]">Demo — use any email to sign in as <strong className="text-[#16A34A]">Admin</strong>, or <code className="bg-[#D1FAE5] px-1 rounded text-[10px]">staff@clinicflow.app</code> for Staff.</p>
      </div>
    </form>
  );

  return (
    <>
      {/* Desktop: split layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left panel */}
        <div
          className="flex flex-col items-center justify-center w-2/5 min-w-[400px] relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#14532D 0%,#16A34A 45%,#10B981 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-10" style={{ background: '#fff' }} />
          <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full opacity-10" style={{ background: '#fff' }} />
          <div className="absolute top-1/3 right-0 w-40 h-40 rounded-full opacity-5" style={{ background: '#fff' }} />

          <div className="relative z-10 flex flex-col items-center px-12 text-center">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                <Activity size={24} color="#fff" strokeWidth={2.5} />
              </div>
              <span className="text-3xl font-bold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>ClinicFlow</span>
            </div>

            {/* Tagline */}
            <h2 className="text-2xl font-semibold text-white mb-3 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Manage your clinic<br />with ease
            </h2>
            <p className="text-sm text-white/70 leading-relaxed max-w-xs">
              Streamline appointments, patient records, and your clinic operations — all in one place.
            </p>

            {/* Medical illustration */}
            <div className="mt-10">
              <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Clipboard */}
                <rect x="40" y="30" width="140" height="130" rx="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                <rect x="75" y="22" width="70" height="20" rx="10" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
                {/* Lines */}
                <rect x="60" y="68" width="100" height="8" rx="4" fill="rgba(255,255,255,0.25)"/>
                <rect x="60" y="84" width="80" height="8" rx="4" fill="rgba(255,255,255,0.18)"/>
                <rect x="60" y="100" width="90" height="8" rx="4" fill="rgba(255,255,255,0.18)"/>
                <rect x="60" y="116" width="70" height="8" rx="4" fill="rgba(255,255,255,0.18)"/>
                {/* Cross */}
                <rect x="95" y="44" width="30" height="8" rx="4" fill="rgba(255,255,255,0.5)"/>
                <rect x="107" y="32" width="8" height="32" rx="4" fill="rgba(255,255,255,0.5)"/>
                {/* Check badge */}
                <circle cx="172" cy="136" r="22" fill="#10B981"/>
                <path d="M163 136l7 7 12-14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Feature pills */}
            <div className="flex flex-col gap-2.5 mt-4 w-full max-w-xs">
              {['Patient records & CIN lookup', 'Smart appointment scheduling', 'Role-based access control'].map(f => (
                <div key={f} className="flex items-center gap-2.5 rounded-xl px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
                  <span className="text-xs font-medium text-white/80">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center bg-[#F3F7F5] p-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E7F0EA] p-8" style={{ boxShadow: '0 4px 24px rgba(22,163,74,0.08)' }}>
              <div className="mb-7">
                <h1 className="text-2xl font-semibold text-[#14532D] mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Welcome back</h1>
                <p className="text-sm text-[#9CA3AF]">Sign in to your ClinicFlow account</p>
              </div>
              {formContent}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: single centered card */}
      <div className="flex lg:hidden min-h-screen flex-col items-center justify-center p-5" style={{ background: '#F3F7F5' }}>
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }}>
            <Activity size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-[#14532D]" style={{ fontFamily: "'Poppins', sans-serif" }}>ClinicFlow</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7F0EA] p-7 w-full max-w-sm" style={{ boxShadow: '0 4px 24px rgba(22,163,74,0.10)' }}>
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[#14532D] mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Welcome back</h1>
            <p className="text-sm text-[#9CA3AF]">Sign in to your account</p>
          </div>
          {formContent}
        </div>
      </div>
    </>
  );
}
