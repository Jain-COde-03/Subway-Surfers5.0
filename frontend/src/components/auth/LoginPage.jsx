import React, { useState, useEffect } from 'react';
import {
  Train,
  Shield,
  Layers,
  Activity,
  Zap,
  Lock,
  User,
  Eye,
  EyeOff,
  RotateCw,
  ArrowRight,
  Sparkles,
  Settings,
  TrendingUp,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

import vandeBharatBg from '../../assets/vande_bharat_bg.png';
import samayLogoSymbol from '../../assets/samay_logo_symbol.png';

export const ROLES_CONFIG = [
  {
    id: 'admin',
    username: 'admin_control',
    password: 'ir_password_2026',
    name: 'Shri Vikramaditya Sen',
    designation: 'Chief Corridor Controller & Joint Director (Planning)',
    department: 'Central Control & Operations',
    deptShort: 'Admin / Control',
    icon: Shield,
    badgeClass: 'bg-slate-100 text-slate-900 border-slate-300',
    description: 'Full cross-department corridor block optimization, CP-SAT solver dispatch & bundling gazette.',
  },
  {
    id: 'tms',
    username: 'tms_engineer',
    password: 'ir_password_2026',
    name: 'Er. Rajesh Kumar Sharma',
    designation: 'Sr. Divisional Engineer (Track / P-Way)',
    department: 'Track Management System (TMS)',
    deptShort: 'TMS (P-Way)',
    icon: Layers,
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-700',
    description: 'Track Geometry Index (TGI), Rail Flaw / USFD, Ballast Deep Screening & BCM machine allocation.',
  },
  {
    id: 'smms',
    username: 'smms_dste',
    password: 'ir_password_2026',
    name: 'Dr. Ananya Mukherjee',
    designation: 'Sr. Div. Signal & Telecom Engineer (S&T)',
    department: 'Signaling Maintenance Management System',
    deptShort: 'SMMS (S&T)',
    icon: Activity,
    badgeClass: 'bg-slate-100 text-slate-900 border-slate-300',
    description: 'Point machine stalling, Track Circuit / Axle Counter drops & joint interlocking blocks.',
  },
  {
    id: 'tdms',
    username: 'tdms_dee',
    password: 'ir_password_2026',
    name: 'Er. Gurpreet Singh',
    designation: 'Sr. Divisional Electrical Engineer (TRD)',
    department: 'Traction Distribution Management System',
    deptShort: 'TDMS (TRD)',
    icon: Zap,
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-700',
    description: '25kV OHE catenary wear, Power Block isolation windows, Tower Wagon fleet deployment.',
  },
];

/**
 * Rebuilt <LoginPage /> Component
 *
 * Full-Bleed Cinematic Architecture:
 * - Layer 0: Absolute Full-Screen Background Image (100vw, 100vh) with subtle overlay
 * - Layer 1: Floating Global Header (absolute top-0 left-0 w-full z-50 bg-slate-900/95 border-b border-slate-700 backdrop-blur-sm)
 * - Layer 2 (Left): Absolute Hero Text & 3 Frosted Glass Cards (absolute top-[25%] left-12 z-20 max-w-xl)
 * - Layer 2 (Right): Floating Sharp Industrial Login Card (absolute top-1/2 right-12 -translate-y-1/2 z-20 w-[420px])
 *   (Completely removed white split-screen panel and SVG curve)
 */
export default function LoginPage({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState(ROLES_CONFIG[0]);
  const [username, setUsername] = useState(ROLES_CONFIG[0].username);
  const [password, setPassword] = useState(ROLES_CONFIG[0].password);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Generate randomized alphanumeric CAPTCHA
  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput(result); // Pre-fill for convenience
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setUsername(role.username);
    setPassword(role.password);
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMsg('Invalid Security CAPTCHA code. Please re-enter.');
      generateCaptcha();
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching role by username or fallback to selected role
      const matched =
        ROLES_CONFIG.find(
          (r) => r.username.toLowerCase() === username.trim().toLowerCase()
        ) || selectedRole;

      setIsLoading(false);
      if (onLogin) {
        onLogin(matched);
      }
    }, 600);
  };

  const IconComponent = selectedRole.icon;

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans antialiased select-none text-slate-800 bg-slate-900">
      
      {/* ---------------------------------------------------------------- */}
      {/* LAYER 0: ABSOLUTE FULL-SCREEN BACKGROUND IMAGE                   */}
      {/* Covers 100% of viewport width and height (100vw, 100vh)          */}
      {/* ---------------------------------------------------------------- */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat w-full h-full pointer-events-none"
        style={{
          backgroundImage: `url(${vandeBharatBg})`,
        }}
      ></div>

      {/* ---------------------------------------------------------------- */}
      {/* LAYER 1: FLOATING GLOBAL TOP HEADER                              */}
      {/* absolute top-0 left-0 w-full z-50 px-8 py-4 bg-slate-900/95      */}
      {/* border-b border-slate-700 backdrop-blur-sm                      */}
      {/* ---------------------------------------------------------------- */}
      <header className="absolute top-0 left-0 w-full z-50 flex justify-between items-center px-6 sm:px-8 py-4 bg-slate-900/95 border-b border-slate-700 backdrop-blur-sm shadow-md">
        
        {/* Left Side: Ministry Details + Emblem */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-sm bg-slate-950 border border-slate-700 p-1 flex items-center justify-center flex-shrink-0 shadow-sm">
            <img
              src={samayLogoSymbol}
              alt="S.A.M.A.Y Seal"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-sm sm:text-base font-black text-white tracking-wider uppercase leading-none">
                Ministry of Railways
              </span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-sm bg-amber-600 text-white tracking-wider shadow-xs">
                Govt. of India
              </span>
            </div>
            <span className="text-[11px] text-slate-300 font-mono tracking-tight mt-0.5 truncate">
              Center for Railway Information Systems (CRIS) • S.A.M.A.Y Smart Automation
            </span>
          </div>
        </div>

        {/* Right Side: Network Telemetry & Security Shield */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-slate-300 border-r border-slate-700 pr-4">
            <span className="text-amber-500 font-bold">NR-DLI</span>
            <span>•</span>
            <span>Northern Railway Zone</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950/90 border border-slate-700 px-3.5 py-1.5 rounded-sm shadow-inner text-xs font-semibold text-white">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">RailNet SSO Encrypted</span>
            <span className="sm:hidden">SSO Active</span>
            <span className="w-2 h-2 rounded-xs bg-emerald-400 animate-pulse ml-1"></span>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* LAYER 2: LEFT CONTENT (Hero Text & 3 Frosted Glass Cards)        */}
      {/* absolute top-[25%] left-12 z-20 max-w-xl                         */}
      {/* ---------------------------------------------------------------- */}
      <div className="hidden lg:flex absolute top-[38%] left-8 lg:left-12 z-20 max-w-xl xl:max-w-2xl flex-col space-y-6">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight drop-shadow-md">
              Welcome to
            </span>
            <span className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-wider drop-shadow-lg">
              S.A.M.A.Y
            </span>
          </div>
          <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest mt-2 drop-shadow-md">
            Smart Automation for Maintenance Activity Yield
          </p>
          {/* Subtle amber accent bar */}
          <div className="h-1.5 w-24 bg-amber-600 rounded-sm mt-3 shadow-xs"></div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* LAYER 2: THE FLOATING LOGIN CARD (Right Side)                    */}
      {/* absolute top-1/2 right-12 -translate-y-1/2 z-20 w-[420px]        */}
      {/* ---------------------------------------------------------------- */}
      <div className="absolute top-1/2 right-6 lg:right-12 -translate-y-1/2 z-20 w-[92%] sm:w-[420px] max-w-[420px]">
        
        {/* The Sharp Industrial Login Card (bg-white shadow-2xl rounded-md border border-slate-200 p-8) */}
        <div className="w-full bg-white shadow-2xl shadow-black/30 rounded-md border border-slate-200 p-7 sm:p-8 flex flex-col space-y-4">
          
          {/* Card Top Title & Emblem */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Sign In to Portal
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-amber-50 text-amber-700 border border-amber-300 shadow-xs">
                  SSO
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Authorized RailNet personnel authentication
              </p>
            </div>

            <div className="w-10 h-10 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs flex-shrink-0">
              <Train className="w-5 h-5 text-amber-600" />
            </div>
          </div>

          {/* Department Persona Selector: Strict Bordered Tabs */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Select Department Persona:
              </span>
              <span className="font-mono font-bold text-amber-600 text-[11px]">
                {selectedRole.deptShort}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-sm">
              {ROLES_CONFIG.map((role) => {
                const isSelected = selectedRole.id === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`py-1.5 px-1 rounded-sm text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border border-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    {role.id.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Persona Officer Snippet: Almost Sharp Box */}
          <div className="p-2.5 rounded-sm bg-slate-50 border border-slate-200 shadow-inner flex items-center space-x-2.5 text-xs">
            <div className="w-8 h-8 rounded-sm bg-slate-900 text-amber-500 flex items-center justify-center flex-shrink-0 shadow-xs">
              <IconComponent className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900 truncate text-xs">
                {selectedRole.name}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">
                {selectedRole.designation}
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-2.5 rounded-sm bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-700" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Fields: Indented Sharp Physical Inputs */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            
            {/* Username / RailNet ID */}
            <div>
              <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">
                Username / RailNet ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter RailNet ID"
                  className="w-full pl-9 pr-3 py-2.5 rounded-sm bg-slate-50 border border-slate-300 shadow-inner font-medium text-slate-900 placeholder-slate-400 text-xs transition-all focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div>
              <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">
                Security Password / PIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-sm bg-slate-50 border border-slate-300 shadow-inner font-medium text-slate-900 placeholder-slate-400 text-xs transition-all focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* CAPTCHA: Indented Input & Code Box */}
            <div>
              <label className="block font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">
                Security Verification (CAPTCHA)
              </label>
              <div className="grid grid-cols-2 gap-2.5 items-center">
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                  placeholder="Enter Code"
                  className="w-full py-2.5 px-3 rounded-sm bg-slate-50 border border-slate-300 shadow-inner font-mono font-bold text-center tracking-widest text-slate-900 transition-all focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 focus:bg-white uppercase text-xs"
                />

                <div className="flex items-center justify-between bg-slate-100 border border-slate-200 rounded-sm px-3 py-2 select-none">
                  <div className="font-mono font-black text-slate-900 tracking-widest text-sm italic line-through decoration-amber-600 decoration-2 pl-1">
                    {captchaCode}
                  </div>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    title="Regenerate CAPTCHA"
                    className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-sm transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Terminal & Forgot PIN */}
            <div className="flex items-center justify-between text-slate-700 pt-0.5 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-xs border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <span className="font-medium text-[11px] text-slate-600">Remember terminal</span>
              </label>
              <span className="text-amber-600 hover:underline font-bold text-[11px] cursor-pointer">
                Forgot PIN?
              </span>
            </div>

            {/* Rigid Mechanical "Sign In" Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold tracking-wider uppercase rounded-sm py-3 transition-all text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-slate-900/20 mt-3 disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Verifying RailNet Gateway...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Small Bottom Disclaimer Under Card */}
        <div className="text-center text-[10px] text-slate-300 font-mono mt-3 drop-shadow-sm">
          Ministry of Railways • Center for Railway Information Systems (CRIS) • RailNet SSO 2026
        </div>
      </div>

    </div>
  );
}
