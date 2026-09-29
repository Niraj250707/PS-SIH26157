import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PRESET_USERS } from '../data/dummyData';
import { UserAccount } from '../types';
import { offlineDb } from '../services/indexedDbService';
import {
  ShieldAlert,
  Lock,
  Key,
  CreditCard,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Shield,
  Building2,
  Terminal,
  AlertTriangle,
  Fingerprint,
  Radio,
  FileCheck2,
  Database,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Check,
  LogOut,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const {
    currentUser,
    entities,
    findings,
    unlockStation,
    lockStation,
    setActivePage,
    addToast,
    logAuditEvent,
    isStationLocked,
  } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'cac' | 'signup' | 'presets'>('signin');
  const [emailOrBadge, setEmailOrBadge] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState('TER-SOV-04-AUTH');

  // Sign up / Provisioning state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState('National Cyber Inspector');
  const [signupClearance, setSignupClearance] = useState<UserAccount['clearanceLevel']>(
    'LEVEL 3 - SENIOR INSPECTOR'
  );
  const [signupDutyStation, setSignupDutyStation] = useState(
    'Critical Infrastructure Cyber Watch Floor'
  );
  const [signupPassword, setSignupPassword] = useState('InspectorPass2026!');

  // Cac state
  const [cacStep, setCacStep] = useState<number>(0);
  const [cacProgressText, setCacProgressText] = useState<string>('');

  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSelectPreset = (user: UserAccount) => {
    setAuthError(null);
    unlockStation(user);
    logAuditEvent({
      action: 'STATUS_UPDATE',
      category: 'Compliance & Security',
      targetType: 'Entity',
      targetId: user.id,
      targetName: user.name,
      details: `Inspector authenticated via terminal ${user.terminalId}. Clearance: ${user.clearanceLevel}. IndexedDB session persistent.`,
    });
    addToast('success', 'Station Authorization Granted', `Authenticated as ${user.name} (${user.clearanceLevel}).`);
    setActivePage('overview');
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const cleaned = emailOrBadge.trim().toLowerCase();

      // Find matching user or fallback to Dir Vance
      if (!password || password.length < 4) {
        setAuthError('Cryptographic passcode must be at least 4 characters.');
        return;
      }

      const matched = PRESET_USERS.find(
        (user) => user.email.toLowerCase() === cleaned || user.badgeNumber.toLowerCase() === cleaned
      );

      if (!matched) {
        setAuthError('No local inspector profile matches that email or badge number. Try a quick profile or check your entry.');
        return;
      }

      handleSelectPreset({
        ...matched,
        terminalId: selectedTerminal,
        lastLogin: 'Just now (Air-Gapped Session)',
      });
    }, 650);
  };

  const handleCacAuth = () => {
    setIsVerifying(true);
    setCacStep(1);
    setCacProgressText('Accessing Secure Enclave & hardware card reader...');

    setTimeout(() => {
      setCacStep(2);
      setCacProgressText('Extracting X.509 v3 Sovereign PKI Digital Certificate...');
    }, 700);

    setTimeout(() => {
      setCacStep(3);
      setCacProgressText('Cryptographic challenge response verified against Trust Anchor...');
    }, 1400);

    setTimeout(() => {
      setIsVerifying(false);
      setCacStep(4);
      handleSelectPreset(PRESET_USERS[0]);
    }, 2000);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim()) {
      addToast('warning', 'Incomplete Form', 'Please enter your full name and official agency email.');
      return;
    }

    setIsVerifying(true);

    const newUser: UserAccount = {
      id: 'usr-' + Math.floor(1000 + Math.random() * 9000),
      name: signupName.trim(),
      email: signupEmail.trim(),
      role: signupRole,
      clearanceLevel: signupClearance,
      dutyStation: signupDutyStation,
      badgeNumber: 'NCSC-REQ-' + Math.floor(1000 + Math.random() * 9000),
      terminalId: selectedTerminal,
      avatarInitials: signupName
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      lastLogin: 'Just now (New Inspector Enrolled)',
      isLoggedIn: true,
    };

    // Save to IndexedDB
    try {
      await offlineDb.put('user_accounts', newUser);
    } catch (err) {
      console.warn('Failed saving user account to IndexedDB:', err);
    }

    setTimeout(() => {
      setIsVerifying(false);
      handleSelectPreset(newUser);
    }, 700);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 grid lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] gap-6 lg:gap-10 items-start">
      <section className="hidden lg:flex lg:sticky lg:top-10 flex-col justify-between min-h-155 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-slate-100 shadow-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-950/50">
              <ShieldAlert size={23} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide">SAT-SA</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Supervisory Analytics</p>
            </div>
          </div>

          <div className="mt-16 max-w-md">
            <p className="text-[11px] font-mono uppercase tracking-widest text-blue-300">Portfolio monitoring</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white">A clearer view of critical-sector risk.</h1>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Assess security posture, investigate evidence, and coordinate remediation from one supervisory workspace.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Building2 size={14} />
                <span className="text-[10px] font-mono uppercase">Monitored entities</span>
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums text-white">{entities.length}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <AlertTriangle size={14} />
                <span className="text-[10px] font-mono uppercase">Open findings</span>
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums text-amber-300">{findings.length}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-5 text-[11px] text-slate-500">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-mono uppercase">Local workspace available</span>
          </div>
          <p className="mt-2 leading-5">Assessment data is stored in this browser. Identity checks are simulated for this demo.</p>
        </div>
      </section>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Sovereign Security Header Banner */}
        <div className="bg-slate-950 text-white p-6 border-b border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40 shrink-0">
                <ShieldAlert size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 uppercase font-bold">
                    SUPERVISORY SOC WORKSPACE
                  </span>
                  <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    LOCAL DEMO ENVIRONMENT
                  </span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white mt-1">
                  SAT-SA Supervisory Access Terminal
                </h1>
                <p className="text-xs text-slate-400 font-mono">
                  Supervisory SOC assessment workspace
                </p>
              </div>
            </div>

            {/* Local workspace status */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300">
                <Database size={11} className="text-emerald-400" />
                Browser workspace
              </span>
              <span className="text-[9px] text-slate-500 font-mono mt-1">
                Local sample data
              </span>
            </div>
          </div>
        </div>

        {/* If already authenticated, show Station Lock Status Card */}
        {currentUser?.isLoggedIn && !isStationLocked && (
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {currentUser.avatarInitials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Station Active: {currentUser.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px] font-mono font-semibold">
                    {currentUser.clearanceLevel.split(' - ')[0]}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Duty Station: {currentUser.dutyStation} · Terminal: {currentUser.terminalId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActivePage('overview')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Enter Dashboard</span>
                <ArrowRight size={13} />
              </button>
              <button
                type="button"
                onClick={lockStation}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Lock this terminal session"
              >
                <Lock size={12} />
                <span>Lock Station</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold bg-slate-50 dark:bg-slate-800/40">
          <button
            onClick={() => setAuthMode('signin')}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              authMode === 'signin'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Inspector Login
          </button>
          <button
            onClick={() => setAuthMode('cac')}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              authMode === 'cac'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            CAC / Smart Card Tap
          </button>
          <button
            onClick={() => setAuthMode('signup')}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Enrol Inspector
          </button>
          <button
            onClick={() => setAuthMode('presets')}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              authMode === 'presets'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Quick Profiles (1-Click)
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mode 1: Inspector Credentials Sign In */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              {authError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle size={15} />
                  <span>{authError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Official Agency Email or Inspector Badge Number:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={emailOrBadge}
                    onChange={(e) => setEmailOrBadge(e.target.value)}
                    placeholder="name@agency.gov or NCSC-DIR-4091"
                    className="w-full pl-3 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Demo passcode:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 text-[11px]"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Security Terminal Node:
                  </label>
                  <select
                    value={selectedTerminal}
                    onChange={(e) => setSelectedTerminal(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-xs"
                  >
                    <option value="TER-SOV-04-AUTH">Workstation 04 · General Oversight</option>
                    <option value="TER-ENERGY-02-SEC">Workstation 02 · Energy Sector</option>
                    <option value="TER-FIN-09-VERIFY">Workstation 09 · Financial Sector</option>
                    <option value="TER-TELECOM-07-AIR">Workstation 07 · Telecom Sector</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Offline Security Clearance:
                  </label>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono flex items-center gap-2">
                    <Shield size={14} className="text-blue-500" />
                    <span>Local demo profile</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Cryptographic Credentials...</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Authenticate Station Session</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode 2: Common Access Card (CAC) / Hardware Token Tap */}
          {authMode === 'cac' && (
            <div className="text-center py-6 space-y-5">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/50 border-2 border-dashed border-blue-400 dark:border-blue-700 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Fingerprint
                  size={50}
                  className={isVerifying ? 'animate-pulse text-blue-500' : ''}
                />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Insert Sovereign Common Access Card (CAC) or Touch FIDO2 Token
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Insert your physical sovereign smart card or touch your cryptographic hardware security key for mutual TLS verification.
                </p>
              </div>

              {isVerifying && (
                <div className="max-w-md mx-auto p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs font-mono text-blue-700 dark:text-blue-300 space-y-1">
                  <div className="flex items-center justify-center gap-2 font-bold">
                    <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>{cacProgressText}</span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 transition-all duration-300"
                      style={{ width: `${cacStep * 25}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleCacAuth}
                  disabled={isVerifying}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <CreditCard size={16} />
                  <span>Simulate CAC / Smart Card Insertion</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode 3: Request Credentials (Sign Up / Enrolment) */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Full Name & Supervisory Rank:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inspector Jordan Blake"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Official Agency Email:
                </label>
                <input
                  type="email"
                  placeholder="j.blake@cyber.gov.national"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Clearance Level:
                  </label>
                  <select
                    value={signupClearance}
                    onChange={(e) => setSignupClearance(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  >
                    <option value="LEVEL 4 - DIRECTORATE">LEVEL 4 - DIRECTORATE</option>
                    <option value="LEVEL 3 - SENIOR INSPECTOR">LEVEL 3 - SENIOR INSPECTOR</option>
                    <option value="LEVEL 2 - AUDITOR">LEVEL 2 - AUDITOR</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Assigned Duty Station:
                  </label>
                  <input
                    type="text"
                    value={signupDutyStation}
                    onChange={(e) => setSignupDutyStation(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Assigned Cryptographic Passcode:
                </label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <UserCheck size={15} />
                <span>Enrol Inspector & Issue Credentials</span>
              </button>
            </form>
          )}

          {/* Mode 4: 1-Click Simulated Preset Profiles */}
          {authMode === 'presets' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-500 text-xs">
                Select an official designated inspector profile to immediately test role-based access, supervisory views, and risk controls:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_USERS.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectPreset(user)}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-sm transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {user.avatarInitials}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors block">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {user.badgeNumber}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 font-bold">
                        {user.clearanceLevel.split(' - ')[0]}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      {user.role}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1 truncate">
                      {user.dutyStation}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Demo environment notice */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono space-y-1">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <AlertTriangle size={12} />
              <span>DEMO WORKSPACE</span>
            </div>
            <p>
              Sign-in is simulated and sample assessment data is stored locally. Connect an approved identity provider before production use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
