import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store.ts';
import { loginUser } from '../redux/authSlice.ts';
import { Mail, Lock, Eye, EyeOff, Zap, Users, Shield, BarChart2, ArrowRight } from 'lucide-react';

/* Contact Admin Modal Dialog */
const ContactAdminModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative text-slate-800">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
          ✕
        </button>
        <h3 className="text-lg font-bold text-slate-900">Contact Workspace Admin</h3>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          Velozity Global Solutions accounts are provisioned by your organization's IT Admin.
        </p>
        <div className="mt-3.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 font-mono text-slate-700">
          <div>Email: <span className="font-bold text-blue-600">admin@velozity.com</span></div>
          <div className="text-[10px] text-slate-400 font-sans">SLA: Under 15 minutes during business hours</div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* Vector Desk & Monitor Illustration matching mockup */
const HeroIllustration: React.FC = () => (
  <div className="relative w-full max-w-[420px] mx-auto select-none pointer-events-none">
    <svg viewBox="0 0 520 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-2xl">
      {/* Desk */}
      <path d="M40 250 H480 L450 262 H70 Z" fill="#0c2347" opacity="0.9" />
      <rect x="50" y="250" width="420" height="3" fill="#3b82f6" opacity="0.5" />
      <rect x="90" y="262" width="8" height="48" fill="#071731" />
      <rect x="420" y="262" width="8" height="48" fill="#071731" />

      {/* Main Monitor */}
      <rect x="120" y="40" width="280" height="175" rx="10" fill="#071833" stroke="#1d4ed8" strokeWidth="2" />
      <rect x="126" y="46" width="268" height="163" rx="8" fill="#040e21" />

      {/* Top Application Header */}
      <rect x="126" y="46" width="268" height="16" fill="#091b3a" />
      <circle cx="137" cy="54" r="2.5" fill="#ef4444" />
      <circle cx="145" cy="54" r="2.5" fill="#f59e0b" />
      <circle cx="153" cy="54" r="2.5" fill="#10b981" />

      {/* Monitor Screen Dashboard Graphics */}
      {/* Sidebar */}
      <rect x="132" y="68" width="22" height="135" rx="3" fill="#082247" />
      <circle cx="143" cy="78" r="3.5" fill="#38bdf8" />
      <rect x="136" y="90" width="14" height="2.5" rx="1" fill="#1d4ed8" />
      <rect x="136" y="98" width="14" height="2.5" rx="1" fill="#1d4ed8" />
      <rect x="136" y="106" width="14" height="2.5" rx="1" fill="#1d4ed8" />

      {/* Top Stat Cards */}
      <rect x="160" y="68" width="65" height="22" rx="4" fill="#0a2854" stroke="#1d4ed8" strokeWidth="0.6" />
      <rect x="166" y="74" width="28" height="3" rx="1" fill="#93c5fd" />
      <rect x="166" y="81" width="42" height="4" rx="1" fill="#38bdf8" />

      <rect x="230" y="68" width="65" height="22" rx="4" fill="#0a2854" stroke="#1d4ed8" strokeWidth="0.6" />
      <path d="M236 82 L248 76 L260 79 L272 72 L284 75" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      <rect x="300" y="68" width="88" height="22" rx="4" fill="#0a2854" stroke="#1d4ed8" strokeWidth="0.6" />
      <rect x="306" y="74" width="24" height="3" rx="1" fill="#93c5fd" />
      <rect x="306" y="81" width="70" height="4" rx="2" fill="#102d57" />
      <rect x="306" y="81" width="52" height="4" rx="2" fill="#2563eb" />

      {/* Bar Chart Area */}
      <rect x="160" y="96" width="135" height="107" rx="5" fill="#061938" stroke="#16407d" strokeWidth="0.8" />
      <text x="168" y="110" fill="#93c5fd" fontSize="7 font-sans" fontWeight="600">Sprint Throughput</text>
      <rect x="168" y="165" width="8" height="30" rx="1.5" fill="#1d4ed8" />
      <rect x="182" y="145" width="8" height="50" rx="1.5" fill="#2563eb" />
      <rect x="196" y="130" width="8" height="65" rx="1.5" fill="#38bdf8" />
      <rect x="210" y="150" width="8" height="45" rx="1.5" fill="#1d4ed8" />
      <rect x="224" y="125" width="8" height="70" rx="1.5" fill="#60a5fa" />
      <rect x="238" y="140" width="8" height="55" rx="1.5" fill="#2563eb" />
      <rect x="252" y="118" width="8" height="77" rx="1.5" fill="#38bdf8" />
      <rect x="266" y="135" width="8" height="60" rx="1.5" fill="#2563eb" />

      {/* Donut Chart Area */}
      <rect x="300" y="96" width="88" height="107" rx="5" fill="#061938" stroke="#16407d" strokeWidth="0.8" />
      <circle cx="344" cy="145" r="24" stroke="#102d57" strokeWidth="6" fill="none" />
      <circle cx="344" cy="145" r="24" stroke="#38bdf8" strokeWidth="6" strokeDasharray="100 50" strokeLinecap="round" fill="none" transform="rotate(-90 344 145)" />
      <circle cx="344" cy="145" r="24" stroke="#2563eb" strokeWidth="6" strokeDasharray="45 100" strokeDashoffset="-75" strokeLinecap="round" fill="none" transform="rotate(-90 344 145)" />

      {/* Monitor Stand */}
      <path d="M250 215 L270 215 L275 250 L245 250 Z" fill="#0b2347" />
      <rect x="220" y="248" width="80" height="3" rx="1.5" fill="#1d4ed8" />

      {/* Floating "Projects" Badge (Left) */}
      <g transform="translate(65, 145)">
        <rect width="80" height="46" rx="8" fill="#0c254a" stroke="#3b82f6" strokeWidth="1.2" />
        <path d="M12 14 H22 L26 18 H38 V32 H12 Z" fill="#2563eb" />
        <text x="43" y="22" fill="#ffffff" fontSize="8" fontFamily="sans-serif" fontWeight="bold">Projects</text>
        <rect x="43" y="26" width="28" height="3" rx="1" fill="#38bdf8" />
      </g>

      {/* Floating "Team" Stack Badge (Right) */}
      <g transform="translate(365, 130)">
        <rect width="82" height="46" rx="8" fill="#0c254a" stroke="#3b82f6" strokeWidth="1.2" />
        <text x="12" y="16" fill="#93c5fd" fontSize="8" fontFamily="sans-serif" fontWeight="bold">Team</text>
        <circle cx="20" cy="30" r="7" fill="#3b82f6" stroke="#0c254a" strokeWidth="1.5" />
        <circle cx="32" cy="30" r="7" fill="#06b6d4" stroke="#0c254a" strokeWidth="1.5" />
        <circle cx="44" cy="30" r="7" fill="#6366f1" stroke="#0c254a" strokeWidth="1.5" />
        <text x="58" y="33" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="sans-serif">+14</text>
      </g>

      {/* Seated Developer */}
      <circle cx="165" cy="180" r="11" fill="#fed7aa" />
      <path d="M152 200 C152 192 158 188 168 188 C176 188 178 193 177 200 Z" fill="#1e293b" />
      <path d="M148 200 C153 194 161 192 170 192 C178 192 186 195 190 200 L196 230 L142 230 Z" fill="#2563eb" />
      <path d="M110 215 C110 195 120 188 138 188 L146 188 L146 270 L110 270 Z" fill="#081a36" />
      <rect x="122" y="270" width="8" height="30" fill="#051226" />

      {/* Laptop on desk */}
      <polygon points="190,225 240,225 236,248 194,248" fill="#162e50" stroke="#38bdf8" strokeWidth="0.8" />
      <rect x="197" y="228" width="36" height="17" rx="1" fill="#091424" />
      <polygon points="184,248 246,248 242,251 188,251" fill="#334155" />

      {/* Plant on Desk */}
      <g transform="translate(420, 215)">
        <path d="M10 28 L18 28 L20 40 L8 40 Z" fill="#2563eb" />
        <path d="M14 28 C7 19 5 6 14 0 C21 6 19 19 14 28 Z" fill="#10b981" />
        <path d="M12 22 C0 18 -3 11 1 4 C7 9 10 15 12 22 Z" fill="#34d399" />
        <path d="M16 22 C26 18 29 11 27 4 C21 9 18 15 16 22 Z" fill="#059669" />
      </g>
    </svg>
  </div>
);

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);



  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();
    if (!email || !password) return;

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate('/dashboard');
    } catch {
      // Error handled in redux state
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-white font-sans antialiased text-slate-900 overflow-hidden select-none">
      <ContactAdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />

      {/* LEFT COLUMN - Deep Blue Brand Showcase */}
      <div className="lg:w-1/2 w-full bg-[#051532] text-white p-6 lg:p-10 flex flex-col justify-between relative overflow-hidden h-full">
        {/* Glow Effects */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/25 text-white tracking-tight border border-white/20">
            V
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight leading-none text-white">Velozity</div>
            <div className="text-[11px] font-medium text-blue-300 tracking-wider uppercase mt-0.5">Global Solutions</div>
          </div>
        </div>

        {/* Hero Title & Bullets */}
        <div className="my-auto py-2 relative z-10 space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Build. Manage. <span className="text-[#3b82f6]">Grow.</span>
            </h1>
            <p className="text-slate-300 text-xs lg:text-sm">
              Real-time project management for your team and clients.
            </p>
          </div>

          {/* 4 Feature Items */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-[#0a2353] border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Track Progress</div>
                <div className="text-[11px] text-slate-400">Stay on top of every task</div>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-[#0a2353] border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Collaborate</div>
                <div className="text-[11px] text-slate-400">Work together in real time</div>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-[#0a2353] border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Secure</div>
                <div className="text-[11px] text-slate-400">Enterprise-grade security</div>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-[#0a2353] border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Grow Faster</div>
                <div className="text-[11px] text-slate-400">Better tools. Greater results.</div>
              </div>
            </div>
          </div>

          {/* Desk Scene Illustration */}
          <div className="pt-2">
            <HeroIllustration />
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-slate-400 font-medium relative z-10 shrink-0">
          Velozity Global Solution &nbsp;&bull;&nbsp; Smarter Projects, Stronger Teams.
        </div>
      </div>

      {/* RIGHT COLUMN - Sign In Form */}
      <div className="lg:w-1/2 w-full flex flex-col justify-between p-6 lg:p-10 bg-white h-full overflow-y-auto">
        {/* Top Right Contact Admin Link */}
        <div className="flex justify-end text-xs text-slate-500 font-medium shrink-0">
          Don't have an account?&nbsp;
          <button onClick={() => setIsAdminModalOpen(true)} className="text-blue-600 font-semibold hover:underline cursor-pointer">
            Contact Admin
          </button>
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-sm mx-auto my-auto py-2 space-y-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Sign in to your account</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password recovery link sent."); }} className="text-blue-600 hover:underline font-medium">
                Forgot password?
              </a>
            </div>

            {/* Main Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>


        {/* Bottom space filler */}
        <div className="text-[11px] text-slate-400 shrink-0 text-center lg:text-left">
          Protected by Velozity Cloud Shield. Standard 256-bit SSL encryption.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
