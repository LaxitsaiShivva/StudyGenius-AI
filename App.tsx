import React, { useState, useEffect, useRef } from 'react';
import { View, Note, ChatMessage, TutorPersona, User, QuizQuestion, SavedItem, FormulaItem, SubjectProgress } from './types';
import { TUTORS, MOTIVATIONAL_QUOTES } from './constants';
import * as GeminiService from './services/geminiService';
import * as StorageService from './services/storageService';
import { supabase } from './services/supabaseClient';

// --- Icons (Inline SVG) ---
const Icons = {
  Home: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Brain: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  Book: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Lightning: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Clock: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Calendar: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Quiz: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Mic: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
  Save: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>,
  Send: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Upload: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  X: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Sun: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Moon: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Pen: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  Table: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7-8v8m14-8v8M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Code: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  Child: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Refresh: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Magic: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Math: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  Sparkles: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Camera: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Chart: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
  Formula: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>, // Reusing Code icon for Formula slightly
  Quote: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>,
  Pencil: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
};

// --- Shared Components ---

const Header = ({ title, toggleTheme, isDark, user, onLogout }: { title: string, toggleTheme: () => void, isDark: boolean, user: User | null, onLogout: () => void }) => (
  <div className="sticky top-0 z-40 glass-panel border-b border-gray-200/50 dark:border-gray-800/50 px-6 py-4 flex justify-between items-center shadow-sm backdrop-blur-md">
    <div className="flex items-center gap-3">
      <div className="bg-primary/10 p-2 rounded-lg text-primary">
        <Icons.Brain />
      </div>
      <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
        {title}
      </h1>
    </div>
    <div className="flex items-center gap-2">
      <button 
        onClick={toggleTheme} 
        className="p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300 transition-colors"
      >
        {isDark ? <Icons.Sun /> : <Icons.Moon />}
      </button>
      {user && (
        <button 
          onClick={onLogout}
          className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
          title="Logout"
        >
          <Icons.Logout />
        </button>
      )}
    </div>
  </div>
);

const NavButton = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center py-2 px-6 rounded-2xl transition-all duration-300 ${active ? 'text-primary bg-indigo-50 dark:bg-indigo-900/30 scale-105 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
  >
    <Icon />
    <span className="text-[10px] mt-1 font-medium">{label}</span>
  </button>
);

const Card = ({ title, icon: Icon, color, onClick, desc }: { title: string, icon: any, color: string, onClick: () => void, desc: string }) => (
  <div 
    onClick={onClick}
    className={`bg-white dark:bg-cardDark rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700/50 flex flex-col items-start gap-2 hover:-translate-y-1 group relative overflow-hidden`}
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity`}></div>
    <div className={`p-2.5 rounded-2xl ${color} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
      <Icon />
    </div>
    <div className="w-full">
      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">{title}</h3>
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium truncate">{desc}</p>
    </div>
  </div>
);

// A reusable result card for all features with Save and Retry functionality
const FeatureResult = ({ children, onSave, onRetry, title }: { children: React.ReactNode, onSave: () => void, onRetry: () => void, title?: string }) => {
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await onSave();
        setSaved(true);
        setSaving(false);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <div className="bg-white dark:bg-cardDark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in relative group">
             {title && <h3 className="font-bold text-lg mb-4 text-primary flex items-center gap-2">{title}</h3>}
             <div className="mb-6">{children}</div>
             <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                <button 
                    onClick={onRetry} 
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                >
                    <Icons.Refresh /> Retry
                </button>
                <button 
                    onClick={handleSave} 
                    disabled={saved || saving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${saved ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                >
                    {saving ? 'Saving...' : saved ? <><Icons.Check /> Saved</> : <><Icons.Save /> Save</>}
                </button>
             </div>
        </div>
    )
}

// --- Auth Views ---

const AuthView = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        if (isSignUp) {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;
            if (data.user) {
                onLogin({ name: email.split('@')[0], email: email });
            } else {
                 setError('Check email for confirmation.');
            }
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
             if (data.user) {
                onLogin({ name: email.split('@')[0], email: email });
            }
        }
    } catch (err: any) {
        setError(err.message || 'Authentication failed');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in mesh-gradient relative">
      <div className="glass-panel p-8 rounded-3xl shadow-2xl w-full max-w-sm backdrop-blur-xl border-white/40">
        <div className="flex justify-center mb-6 text-primary">
          <div className="bg-white p-4 rounded-2xl shadow-lg">
             <Icons.Brain />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 dark:text-white">StudyGenius AI</h2>
        <p className="text-center text-gray-500 dark:text-gray-300 text-sm mb-8">
          {isSignUp ? "Create an account to start learning." : "Welcome back, genius."}
        </p>
        
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder-gray-400 dark:text-white"
            required
          />
           <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder-gray-400 dark:text-white"
            required
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isSignUp ? "Sign Up" : "Log In")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary font-medium"
          >
            {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- New Features ---

const HomeworkSolver = () => {
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    }

    const solve = async () => {
        if(!image) return;
        setLoading(true);
        const base64 = image.split(',')[1];
        const mime = image.split(';')[0].split(':')[1];
        const res = await GeminiService.analyzeHomework(base64, mime);
        setResult(res);
        setLoading(false);
    }

    const save = async () => {
        const item: SavedItem = {
            id: Date.now().toString(),
            type: 'homework_solution',
            title: 'Homework Analysis',
            content: result,
            timestamp: Date.now()
        };
        await StorageService.saveItemToLibrary(item);
    }

    return (
        <div className="p-4 pb-28 space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold dark:text-white mb-2">Homework Solver</h2>
            <div className="glass-panel p-6 rounded-3xl border-dashed border-2 border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => fileRef.current?.click()}>
                 {image ? (
                     <img src={image} alt="Homework" className="max-h-64 rounded-xl shadow-md" />
                 ) : (
                     <>
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-3 text-blue-600 dark:text-blue-300">
                            <Icons.Camera />
                        </div>
                        <p className="font-bold text-gray-600 dark:text-gray-300">Upload Homework Page</p>
                        <p className="text-xs text-gray-400 mt-1">Supports Math, Physics, Bio, etc.</p>
                     </>
                 )}
                 <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleUpload} />
            </div>

            {image && !result && (
                <button onClick={solve} disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg">
                    {loading ? 'Solving Questions...' : 'Solve All'}
                </button>
            )}

            {result && (
                <FeatureResult onSave={save} onRetry={() => { setResult(''); setImage(null); }} title="Solutions">
                    <div className="prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-cardDark p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                        {result}
                    </div>
                </FeatureResult>
            )}
        </div>
    )
}

const DiagramGenerator = () => {
    const [topic, setTopic] = useState('');
    const [type, setType] = useState('flowchart');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        if(!topic) return;
        setLoading(true);
        const res = await GeminiService.generateDiagramCode(topic, type);
        setCode(res);
        setLoading(false);
    }

    const save = async () => {
        const item: SavedItem = {
            id: Date.now().toString(),
            type: 'diagram',
            title: `${type}: ${topic}`,
            content: code,
            timestamp: Date.now()
        };
        await StorageService.saveItemToLibrary(item);
    }

    // Using mermaid.ink to render base64 encoded mermaid syntax
    const imageUrl = code ? `https://mermaid.ink/img/${btoa(code)}` : '';

    return (
        <div className="p-4 pb-28 space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold dark:text-white mb-2">AI Diagram Generator</h2>
            <div className="glass-panel p-4 rounded-3xl space-y-4">
                <input 
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Topic (e.g. Photosynthesis)" 
                    className="w-full p-3 bg-white/50 dark:bg-black/20 rounded-xl outline-none dark:text-white"
                />
                <select 
                    value={type} 
                    onChange={e => setType(e.target.value)}
                    className="w-full p-3 bg-white/50 dark:bg-black/20 rounded-xl outline-none dark:text-white"
                >
                    <option value="flowchart">Flowchart</option>
                    <option value="mindmap">Mind Map</option>
                    <option value="pie chart">Pie Chart</option>
                    <option value="sequence diagram">Sequence Diagram</option>
                </select>
                <button onClick={generate} disabled={loading} className="w-full bg-secondary text-white py-3 rounded-xl font-bold">
                    {loading ? 'Drawing...' : 'Generate Diagram'}
                </button>
            </div>

            {code && (
                <FeatureResult onSave={save} onRetry={() => setCode('')} title="Generated Diagram">
                     <div className="bg-white p-4 rounded-xl flex justify-center overflow-x-auto">
                        <img src={imageUrl} alt="Diagram" className="max-w-full" onError={(e) => (e.currentTarget.style.display = 'none')} />
                     </div>
                     <details className="mt-4">
                         <summary className="text-xs text-gray-400 cursor-pointer">View Mermaid Code</summary>
                         <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-x-auto">{code}</pre>
                     </details>
                </FeatureResult>
            )}
        </div>
    )
}

const FormulaSheet = () => {
    const [subject, setSubject] = useState('Physics');
    const [formulas, setFormulas] = useState<FormulaItem[]>([]);
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        const res = await GeminiService.generateFormulas(subject);
        setFormulas(res);
        setLoading(false);
    }

    const save = async () => {
        const item: SavedItem = {
            id: Date.now().toString(),
            type: 'formula_sheet',
            title: `${subject} Formulas`,
            content: formulas,
            timestamp: Date.now()
        };
        await StorageService.saveItemToLibrary(item);
    }

    return (
        <div className="p-4 pb-28 space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold dark:text-white mb-2">Formula Sheet</h2>
            <div className="flex gap-2">
                 <select 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)}
                    className="flex-1 p-3 bg-white/50 dark:bg-cardDark rounded-xl outline-none dark:text-white border border-gray-200 dark:border-gray-700"
                >
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Economics">Economics</option>
                    <option value="Computer Science">Computer Science</option>
                </select>
                <button onClick={generate} disabled={loading} className="bg-primary text-white px-6 rounded-xl font-bold">
                    {loading ? '...' : 'Get'}
                </button>
            </div>

            {formulas.length > 0 && (
                <FeatureResult onSave={save} onRetry={() => setFormulas([])}>
                    <div className="space-y-3">
                        {formulas.map((f, i) => (
                            <div key={i} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm text-gray-700 dark:text-gray-200">{f.name}</span>
                                    <code className="bg-indigo-50 dark:bg-indigo-900/40 text-primary px-2 py-0.5 rounded text-xs font-mono">{f.formula}</code>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{f.explanation}</p>
                            </div>
                        ))}
                    </div>
                </FeatureResult>
            )}
        </div>
    )
}

const ProgressTracker = () => {
    const [stats, setStats] = useState<SubjectProgress[]>([]);
    const [newSubject, setNewSubject] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const data = await StorageService.fetchUserStats();
        setStats(data);
    }

    const addSubject = async () => {
        if(!newSubject) return;
        const newStats = [...stats, { subject: newSubject, totalHours: 0, chaptersCompleted: 0, totalChapters: 10, weakAreas: [] }];
        setStats(newStats);
        await StorageService.saveUserStats(newStats);
        setNewSubject('');
    }

    const updateStat = async (idx: number, field: keyof SubjectProgress, value: any) => {
        const newStats = [...stats];
        (newStats[idx] as any)[field] = value;
        setStats(newStats);
        await StorageService.saveUserStats(newStats);
    }

    const removeSubject = async (idx: number) => {
        const n = stats.filter((_, i) => i !== idx);
        setStats(n);
        await StorageService.saveUserStats(n);
    }

    const getAdvice = async () => {
        setLoading(true);
        const res = await GeminiService.analyzeProgress(stats);
        setAnalysis(res);
        setLoading(false);
    }

    return (
        <div className="p-4 pb-28 space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold dark:text-white mb-2">Study Progress</h2>
            
            <div className="flex gap-2 mb-4">
                <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Add Subject" className="flex-1 p-2 rounded-xl border dark:bg-cardDark dark:border-gray-700 dark:text-white" />
                <button onClick={addSubject} className="bg-emerald-500 text-white px-4 rounded-xl">+</button>
            </div>

            <div className="space-y-4">
                {stats.map((s, idx) => (
                    <div key={idx} className="bg-white dark:bg-cardDark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between mb-3">
                            <h3 className="font-bold dark:text-white">{s.subject}</h3>
                            <button onClick={() => removeSubject(idx)} className="text-red-400 text-xs">Remove</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="block text-gray-500 text-[10px] uppercase">Hours Studied</label>
                                <input type="number" value={s.totalHours} onChange={e => updateStat(idx, 'totalHours', parseInt(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-800 rounded p-1" />
                            </div>
                            <div>
                                <label className="block text-gray-500 text-[10px] uppercase">Chapters Done</label>
                                <input type="number" value={s.chaptersCompleted} onChange={e => updateStat(idx, 'chaptersCompleted', parseInt(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-800 rounded p-1" />
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mt-3 dark:bg-gray-800">
                            <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (s.chaptersCompleted/s.totalChapters)*100)}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>

            {stats.length > 0 && (
                <div className="pt-4">
                     <button onClick={getAdvice} disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg">
                        {loading ? 'Analyzing...' : 'Get AI Improvement Tips'}
                     </button>
                </div>
            )}

            {analysis && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-sm dark:text-gray-200">
                    <h4 className="font-bold text-indigo-700 dark:text-indigo-300 mb-2">Coach Says:</h4>
                    {analysis}
                </div>
            )}
        </div>
    )
}

const Whiteboard = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if(canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            const ctx = canvas.getContext('2d');
            if(ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#000000';
            }
        }
    }, []);

    const startDraw = (e: any) => {
        const canvas = canvasRef.current;
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        if(!ctx) return;
        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    const draw = (e: any) => {
        if(!isDrawing || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if(!ctx) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    const stopDraw = () => setIsDrawing(false);

    const clear = () => {
         const canvas = canvasRef.current;
         if(!canvas) return;
         const ctx = canvas.getContext('2d');
         if(ctx) {
             ctx.fillStyle = '#ffffff';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
         }
         setResult('');
    }

    const solve = async () => {
        const canvas = canvasRef.current;
        if(!canvas) return;
        setLoading(true);
        const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
        const res = await GeminiService.generateImageResponse("Recognize the handwriting and solve/explain it.", base64, 'image/jpeg');
        setResult(res);
        setLoading(false);
    }

    const save = async () => {
        const item: SavedItem = {
            id: Date.now().toString(),
            type: 'whiteboard_analysis',
            title: 'Whiteboard Note',
            content: result,
            timestamp: Date.now()
        };
        await StorageService.saveItemToLibrary(item);
    }

    return (
        <div className="p-4 pb-28 space-y-4 animate-slide-up h-[85vh] flex flex-col">
            <h2 className="text-2xl font-bold dark:text-white">Whiteboard Mode</h2>
            <div className="flex-1 bg-white rounded-3xl shadow-lg overflow-hidden relative border-2 border-gray-200">
                <canvas 
                    ref={canvasRef}
                    className="w-full h-full touch-none cursor-crosshair"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                />
                <button onClick={clear} className="absolute top-2 right-2 bg-gray-200 text-gray-700 p-2 rounded-lg text-xs font-bold shadow-sm">Clear</button>
            </div>
            
            {!result && (
                <button onClick={solve} disabled={loading} className="bg-primary text-white py-4 rounded-xl font-bold shadow-lg">
                    {loading ? 'Analyzing Handwriting...' : 'Analyze & Solve'}
                </button>
            )}

            {result && (
                 <FeatureResult onSave={save} onRetry={() => setResult('')}>
                     <p className="whitespace-pre-wrap">{result}</p>
                 </FeatureResult>
            )}
        </div>
    )
}

const OCRNotes = () => {
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    }

    const convert = async () => {
        if(!image) return;
        setLoading(true);
        const base64 = image.split(',')[1];
        const res = await GeminiService.generateImageResponse("Transcribe this text and then create a summary with bullet points.", base64, 'image/jpeg');
        setResult(res);
        setLoading(false);
    }

    const save = async () => {
        const item: SavedItem = {
            id: Date.now().toString(),
            type: 'ocr_note',
            title: 'OCR Notes',
            content: result,
            timestamp: Date.now()
        };
        await StorageService.saveItemToLibrary(item);
    }

    return (
        <div className="p-4 pb-28 space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold dark:text-white mb-2">OCR & Auto Notes</h2>
             <div className="glass-panel p-6 rounded-3xl border-dashed border-2 border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center cursor-pointer" onClick={() => fileRef.current?.click()}>
                 {image ? (
                     <img src={image} alt="Textbook" className="max-h-64 rounded-xl shadow-md" />
                 ) : (
                     <>
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-full mb-3 text-yellow-600 dark:text-yellow-300">
                            <Icons.Book />
                        </div>
                        <p className="font-bold text-gray-600 dark:text-gray-300">Photo of Textbook/Notes</p>
                     </>
                 )}
                 <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleUpload} />
            </div>

            {image && !result && (
                <button onClick={convert} disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg">
                    {loading ? 'Converting...' : 'Generate Notes'}
                </button>
            )}

            {result && (
                <FeatureResult onSave={save} onRetry={() => { setResult(''); setImage(null); }}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        {result}
                    </div>
                </FeatureResult>
            )}
        </div>
    )
}

const CitationGenerator = () => {
    const [text, setText] = useState('');
    const [style, setStyle] = useState('APA');
    const [citation, setCitation] = useState('');
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        const res = await GeminiService.generateCitation(text, style);
        setCitation(res);
        setLoading(false);
    }

    const save = async () => {
        const item: SavedItem = {
             id: Date.now().toString(),
            type: 'citation',
            title: `Citation (${style})`,
            content: citation,
            timestamp: Date.now()
        };
         await StorageService.saveItemToLibrary(item);
    }

    return (
        <div className="p-4 pb-28 space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold dark:text-white mb-2">Auto Citation</h2>
            <div className="glass-panel p-4 rounded-3xl space-y-4">
                <input 
                    value={text} 
                    onChange={e => setText(e.target.value)} 
                    placeholder="Paste URL, Title, or raw text source..." 
                    className="w-full p-3 bg-white/50 dark:bg-black/20 rounded-xl outline-none dark:text-white"
                />
                <div className="flex gap-2">
                    {['APA', 'MLA', 'IEEE', 'Harvard'].map(s => (
                        <button key={s} onClick={() => setStyle(s)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${style === s ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}>
                            {s}
                        </button>
                    ))}
                </div>
                <button onClick={generate} disabled={loading} className="w-full bg-secondary text-white py-3 rounded-xl font-bold">
                    {loading ? '...' : 'Generate Citation'}
                </button>
            </div>

            {citation && (
                <FeatureResult onSave={save} onRetry={() => setCitation('')}>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl font-mono text-sm break-all select-all">
                        {citation}
                    </div>
                </FeatureResult>
            )}
        </div>
    )
}

// --- Home & Main Layout Updates ---

const HomeView = ({ setView, user }: { setView: (v: View) => void, user: User | null }) => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <div className="p-4 space-y-6 pb-28 animate-fade-in">
      <div className="mesh-gradient rounded-3xl p-8 text-slate-800 dark:text-slate-100 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Hello, {user?.name || "Student"}!</h2>
          <p className="opacity-90 font-medium">Ready to boost your productivity?</p>
        </div>
      </div>
      
      {/* Daily Motivation Banner */}
      <div className="bg-white dark:bg-cardDark p-4 rounded-2xl shadow-sm border-l-4 border-accent flex items-start gap-3">
          <div className="text-accent mt-1"><Icons.Sparkles /></div>
          <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Daily Motivation</h3>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 italic">"{quote}"</p>
          </div>
      </div>

      {/* Primary Tools */}
      <h3 className="font-bold text-gray-500 text-sm uppercase px-2">Core Tools</h3>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Homework Solver" icon={Icons.Camera} color="from-blue-500 to-indigo-600 bg-gradient-to-br" desc="Photo Solutions" onClick={() => setView('homework')} />
        <Card title="Doubt Solver" icon={Icons.Brain} color="from-orange-400 to-red-500 bg-gradient-to-br" desc="Instant Solutions" onClick={() => setView('doubt')} />
        <Card title="Math Blackboard" icon={Icons.Math} color="from-green-400 to-emerald-600 bg-gradient-to-br" desc="Step-by-step" onClick={() => setView('math')} />
        <Card title="Whiteboard" icon={Icons.Pencil} color="from-gray-700 to-black bg-gradient-to-br" desc="Draw & Solve" onClick={() => setView('whiteboard')} />
      </div>

      {/* Creation Tools */}
      <h3 className="font-bold text-gray-500 text-sm uppercase px-2 mt-4">Create</h3>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Diagram Gen" icon={Icons.Chart} color="from-purple-400 to-violet-600 bg-gradient-to-br" desc="Flowcharts & Mindmaps" onClick={() => setView('diagram')} />
        <Card title="Note Gen" icon={Icons.Book} color="from-blue-400 to-cyan-500 bg-gradient-to-br" desc="Create Notes" onClick={() => setView('notes')} />
        <Card title="Formula Sheet" icon={Icons.Formula} color="from-pink-500 to-rose-500 bg-gradient-to-br" desc="Physics/Math" onClick={() => setView('formula')} />
        <Card title="OCR Notes" icon={Icons.Book} color="from-yellow-400 to-orange-500 bg-gradient-to-br" desc="Image to Text" onClick={() => setView('ocr')} />
      </div>

      {/* Study & Track */}
      <h3 className="font-bold text-gray-500 text-sm uppercase px-2 mt-4">Study & Track</h3>
      <div className="grid grid-cols-2 gap-4">
         <Card title="Past Paper" icon={Icons.Upload} color="from-teal-400 to-green-500 bg-gradient-to-br" desc="Exam Practice" onClick={() => setView('homework')} />
         <Card title="Progress" icon={Icons.Chart} color="from-indigo-400 to-blue-500 bg-gradient-to-br" desc="Track Stats" onClick={() => setView('tracker')} />
         <Card title="Citations" icon={Icons.Quote} color="from-gray-400 to-slate-500 bg-gradient-to-br" desc="Auto Reference" onClick={() => setView('citation')} />
         <Card title="AI Quiz" icon={Icons.Quiz} color="from-red-400 to-orange-500 bg-gradient-to-br" desc="Flashcard Mode" onClick={() => setView('flashcards')} />
      </div>
    </div>
  );
};

const MathSolver = () => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<{q: string, a: string}[]>([]);
    const [loading, setLoading] = useState(false);

    const solve = async () => {
        if (!input) return;
        setLoading(true);
        const prompt = `Solve this math problem step-by-step. Use clear, simple language. Format mathematical expressions clearly. Problem: ${input}`;
        const answer = await GeminiService.generateTextResponse(prompt, "You are an expert Math Tutor. Break down complex problems into small, understandable steps. Use bolding for key results.");
        setHistory(prev => [{q: input, a: answer}, ...prev]);
        setInput('');
        setLoading(false);
    }

    const save = async (q: string, a: string) => {
        const item: SavedItem = {
            id: Date.now().toString(),
            type: 'math_solution',
            title: `Math: ${q}`,
            content: { question: q, answer: a },
            timestamp: Date.now()
        };
        await StorageService.saveItemToLibrary(item);
    }

    return (
        <div className="p-4 pb-28 space-y-6 animate-slide-up bg-gray-900 min-h-screen text-white rounded-3xl mx-2 my-2 shadow-inner border border-gray-700">
            <div className="border-b border-gray-700 pb-4 mb-4 flex items-center gap-3">
                <div className="bg-emerald-600 p-2 rounded-lg"><Icons.Math /></div>
                <div>
                    <h2 className="text-xl font-mono font-bold text-emerald-400">Math Blackboard</h2>
                    <p className="text-xs text-gray-400 font-mono">Step-by-step solutions</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex gap-2">
                    <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && solve()}
                        placeholder="Enter equation (e.g. 2x + 5 = 15)" 
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-4 font-mono text-sm outline-none focus:border-emerald-500 transition-colors placeholder-gray-600"
                    />
                    <button onClick={solve} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl font-bold transition-colors disabled:opacity-50">
                        {loading ? '...' : <Icons.Send />}
                    </button>
                </div>
            </div>

            <div className="space-y-6 mt-6">
                {history.map((item, idx) => (
                    <div key={idx} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 font-mono text-sm relative group">
                        <div className="text-gray-400 mb-2 border-b border-gray-700 pb-2">Q: {item.q}</div>
                        <div className="text-emerald-300 whitespace-pre-wrap leading-relaxed">{item.a}</div>
                        <button 
                            onClick={() => save(item.q, item.a)}
                            className="absolute top-2 right-2 p-2 bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
                            title="Save Solution"
                        >
                            <Icons.Save />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

const GlobalGenie = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(isOpen && bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const send = async () => {
        if(!input) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const prompt = input;
        const systemPrompt = "You are the 'Genie', an omniscient AI assistant. You can solve any problem, answer any question, and provide help on any topic in the world. Be helpful, concise, and extremely intelligent.";
        const reply = await GeminiService.generateTextResponse(prompt, systemPrompt, 'gemini-2.5-flash');

        const botMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'model', text: reply, timestamp: Date.now() };
        setMessages(prev => [...prev, botMsg]);
        setLoading(false);
    }

    const saveChat = async (text: string) => {
         const item: SavedItem = {
            id: Date.now().toString(),
            type: 'genie_chat',
            title: `Genie: ${text.slice(0, 20)}...`,
            content: text,
            timestamp: Date.now()
        };
        await StorageService.saveItemToLibrary(item);
    }

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-24 right-4 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center ${isOpen ? 'bg-gray-800 rotate-45' : 'bg-gradient-to-r from-violet-600 to-indigo-600 animate-pulse-slow'}`}
            >
                {isOpen ? <span className="text-white"><Icons.X /></span> : <span className="text-white"><Icons.Sparkles /></span>}
            </button>

            {isOpen && (
                <div className="fixed bottom-40 right-4 w-[90vw] max-w-sm h-[50vh] bg-white dark:bg-cardDark rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden z-40 animate-slide-up">
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Icons.Magic />
                            <h3 className="font-bold">Genie AI</h3>
                        </div>
                        <span className="text-xs opacity-80 bg-white/20 px-2 py-1 rounded-full">World Solver</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/20">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 text-sm mt-10">
                                <p>I can solve any problem.</p>
                                <p>Try me.</p>
                            </div>
                        )}
                        {messages.map(m => (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 dark:text-gray-200 shadow-sm rounded-bl-none'}`}>
                                    {m.text}
                                    {m.role === 'model' && (
                                        <button onClick={() => saveChat(m.text)} className="block mt-2 text-[10px] opacity-50 hover:opacity-100 uppercase tracking-wide font-bold">Save</button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="text-xs text-gray-400 ml-4">Genie is thinking...</div>}
                        <div ref={bottomRef}></div>
                    </div>

                    <div className="p-3 bg-white dark:bg-cardDark border-t border-gray-100 dark:border-gray-700 flex gap-2">
                        <input 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && send()}
                            placeholder="Ask anything..." 
                            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2 text-sm outline-none dark:text-white"
                            autoFocus
                        />
                        <button onClick={send} className="bg-violet-600 text-white p-2 rounded-xl">
                            <Icons.Send />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

const QuizGenerator = () => {
    const [topic, setTopic] = useState('');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState<{[key: number]: number}>({}); // qIndex -> optionIndex
    const [submitted, setSubmitted] = useState(false);

    const generate = async () => {
        if (!topic) return;
        setLoading(true);
        setQuestions([]);
        setAnswers({});
        setSubmitted(false);
        const qs = await GeminiService.generateQuiz(topic);
        setQuestions(qs);
        setLoading(false);
    };

    const handleAnswer = (qIdx: number, oIdx: number) => {
        if (submitted) return;
        setAnswers(prev => ({...prev, [qIdx]: oIdx}));
    }

    const calculateScore = () => {
        let score = 0;
        questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) score++;
        });
        return score;
    }

    const saveResult = async () => {
        const item: SavedItem = {
            id: Date.now().toString(),
            type: 'quiz',
            title: `Quiz: ${topic}`,
            content: { questions, score: calculateScore() },
            timestamp: Date.now()
        };
        await StorageService.saveItemToLibrary(item);
    }

    return (
        <div className="p-4 pb-28 space-y-6 animate-slide-up">
            <div className="glass-panel p-4 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-bold text-lg dark:text-white">AI Quiz Generator</h3>
                <div className="flex gap-3">
                    <input 
                        type="text" 
                        placeholder="Enter topic (e.g., Photosynthesis)" 
                        className="flex-1 p-3 bg-white/50 dark:bg-black/20 rounded-xl outline-none dark:text-white"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                    <button onClick={generate} disabled={loading} className="bg-primary text-white px-6 rounded-xl font-bold hover:bg-indigo-600 transition-colors">
                        {loading ? '...' : 'Start'}
                    </button>
                </div>
            </div>

            {questions.length > 0 && (
                <div className="space-y-6">
                    {questions.map((q, qIdx) => (
                        <div key={qIdx} className="bg-white dark:bg-cardDark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h4 className="font-bold text-gray-800 dark:text-white mb-4 text-lg">{qIdx + 1}. {q.question}</h4>
                            <div className="space-y-3">
                                {q.options.map((opt, oIdx) => {
                                    const isSelected = answers[qIdx] === oIdx;
                                    const isCorrect = q.correctAnswer === oIdx;
                                    let btnClass = "w-full p-4 rounded-xl text-left transition-all border ";
                                    
                                    if (submitted) {
                                        if (isCorrect) btnClass += "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-300 ";
                                        else if (isSelected && !isCorrect) btnClass += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-300 ";
                                        else btnClass += "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 opacity-60 ";
                                    } else {
                                        if (isSelected) btnClass += "bg-indigo-50 border-primary text-primary dark:bg-indigo-900/30 ";
                                        else btnClass += "bg-gray-50 border-transparent hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 ";
                                    }

                                    return (
                                        <button 
                                            key={oIdx}
                                            onClick={() => handleAnswer(qIdx, oIdx)}
                                            className={btnClass}
                                        >
                                            {opt}
                                        </button>
                                    )
                                })}
                            </div>
                            {submitted && (
                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-800 dark:text-blue-200">
                                    <strong>Explanation:</strong> {q.explanation}
                                </div>
                            )}
                        </div>
                    ))}

                    {!submitted ? (
                         <button 
                            onClick={() => setSubmitted(true)}
                            disabled={Object.keys(answers).length !== questions.length}
                            className="w-full bg-secondary text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
                         >
                            Submit Quiz
                         </button>
                    ) : (
                        <FeatureResult 
                            title={`Score: ${calculateScore()} / ${questions.length}`}
                            onRetry={() => { setQuestions([]); setTopic(''); setSubmitted(false); }}
                            onSave={saveResult}
                        >
                            <p className="text-gray-600 dark:text-gray-300">Great job practicing! Save this quiz to review later.</p>
                        </FeatureResult>
                    )}
                </div>
            )}
        </div>
    )
}

const EssayGrader = () => {
    const [essay, setEssay] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const grade = async () => {
        if(!essay) return;
        setLoading(true);
        const res = await GeminiService.generateEssayFeedback(essay);
        setResult(res);
        setLoading(false);
    }

    const save = async () => {
        const item: SavedItem = {
            id: Date.now().toString(),
            type: 'essay_feedback',
            title: `Essay Feedback: ${essay.slice(0, 20)}...`,
            content: { original: essay, ...result },
            timestamp: Date.now()
        };
        await StorageService.saveItemToLibrary(item);
    }

    return (
        <div className="p-4 pb-28 space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold dark:text-white mb-4">Essay Grader & Improver</h2>
            {!result && (
                <>
                <div className="glass-panel p-2 rounded-3xl shadow-lg">
                    <textarea 
                        value={essay}
                        onChange={(e) => setEssay(e.target.value)}
                        placeholder="Paste your essay here for feedback..." 
                        className="w-full h-48 bg-transparent p-4 rounded-2xl outline-none resize-none dark:text-white text-sm" 
                    />
                </div>
                <button onClick={grade} disabled={loading} className="bg-primary text-white px-8 py-3 rounded-xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform font-bold w-full">
                    {loading ? 'Grading...' : 'Get Feedback'}
                </button>
                </>
            )}

            {result && (
                <FeatureResult onSave={save} onRetry={() => { setResult(null); }}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-white dark:bg-cardDark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">Estimated Grade</span>
                            <span className="text-4xl font-extrabold text-primary">{result.grade}</span>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/50">
                            <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wide text-xs">Feedback</h4>
                            <p className="text-sm dark:text-gray-200 leading-relaxed">{result.feedback}</p>
                        </div>

                        <div className="bg-white dark:bg-cardDark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Key Improvements</h4>
                            <ul className="space-y-2">
                                {result.improvements?.map((imp: string, i: number) => (
                                    <li key={i} className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="text-secondary shrink-0">•</span>
                                        {imp}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </FeatureResult>
            )}
        </div>
    )
}

const CodeExplainer = () => {
    const [code, setCode] = useState('');
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(false);

    const explain = async () => {
        if(!code) return;
        setLoading(true);
        const res = await GeminiService.generateCodeExplanation(code);
        setExplanation(res);
        setLoading(false);
    }

    const save = async () => {
         const item: SavedItem = {
            id: Date.now().toString(),
            type: 'code_explanation',
            title: `Code Check: ${code.slice(0, 15)}...`,
            content: { code, explanation },
            timestamp: Date.now()
        };
        await StorageService.saveItemToLibrary(item);
    }

    return (
        <div className="p-4 pb-28 space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold dark:text-white mb-4">Code Mentor</h2>
            {!explanation && (
                <>
                <div className="glass-panel p-2 rounded-3xl shadow-lg bg-slate-900 text-white">
                    <textarea 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Paste code here (Python, JS, C++)..." 
                        className="w-full h-48 bg-transparent p-4 rounded-2xl outline-none resize-none font-mono text-xs" 
                    />
                </div>
                <button onClick={explain} disabled={loading} className="bg-slate-800 text-white px-8 py-3 rounded-xl shadow-xl hover:scale-105 transition-transform font-bold w-full">
                    {loading ? 'Analyzing Bug...' : 'Explain & Fix'}
                </button>
                </>
            )}
            
            {explanation && (
                 <FeatureResult onSave={save} onRetry={() => setExplanation('')} title="Code Analysis">
                     <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-xs bg-gray-50 dark:bg-black/20 p-4 rounded-xl">
                        {explanation}
                     </div>
                 </FeatureResult>
            )}
        </div>
    )
}

const ELI5 = () => {
    const [topic, setTopic] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        if(!topic) return;
        setLoading(true);
        const res = await GeminiService.generateSimplification(topic);
        setResult(res);
        setLoading(false);
    }

    const save = async () => {
        const item: SavedItem = {
            id: Date.now().toString(),
            type: 'eli5',
            title: `ELI5: ${topic}`,
            content: result,
            timestamp: Date.now()
        };
        await StorageService.saveItemToLibrary(item);
    }

    return (
         <div className="p-4 pb-28 space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold dark:text-white mb-4">Explain Like I'm 5</h2>
             <div className="flex gap-3 glass-panel p-2 rounded-2xl shadow-sm">
                <input 
                type="text" 
                placeholder="Concept (e.g., Black Holes)" 
                className="flex-1 p-3 bg-transparent outline-none dark:text-white font-medium"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                />
                <button onClick={generate} disabled={loading} className="bg-orange-400 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-500 transition-colors">
                {loading ? '...' : 'Simplify'}
                </button>
            </div>
            
            {result && (
                <FeatureResult onSave={save} onRetry={() => setResult('')}>
                     <div className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-3xl border border-orange-100 dark:border-orange-800/30">
                        <p className="text-sm dark:text-gray-200 leading-relaxed font-medium">{result}</p>
                     </div>
                </FeatureResult>
            )}
         </div>
    )
}

const StudyPlanner = () => {
    const [subjects, setSubjects] = useState('');
    const [hours, setHours] = useState('3');
    const [plan, setPlan] = useState('');
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        if(!subjects) return;
        setLoading(true);
        const res = await GeminiService.generateStudyPlan(subjects, hours);
        setPlan(res);
        setLoading(false);
    }

    const save = async () => {
        const item: SavedItem = {
            id: Date.now().toString(),
            type: 'plan',
            title: `Plan: ${subjects}`,
            content: plan,
            timestamp: Date.now()
        };
        await StorageService.saveItemToLibrary(item);
    }

    return (
        <div className="p-4 pb-28 space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold dark:text-white mb-4">Weekly Study Planner</h2>
            {!plan && (
            <div className="glass-panel p-6 rounded-3xl shadow-lg space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subjects (comma separated)</label>
                    <input 
                        type="text" 
                        value={subjects}
                        onChange={(e) => setSubjects(e.target.value)}
                        placeholder="Math, History, Biology" 
                        className="w-full p-3 bg-white/50 dark:bg-black/20 rounded-xl outline-none dark:text-white"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Daily Hours Available</label>
                    <input 
                        type="number" 
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        placeholder="3" 
                        className="w-full p-3 bg-white/50 dark:bg-black/20 rounded-xl outline-none dark:text-white"
                    />
                 </div>
                 <button onClick={generate} disabled={loading} className="bg-secondary text-white w-full py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all">
                    {loading ? 'Generating Schedule...' : 'Create Plan'}
                 </button>
            </div>
            )}

            {plan && (
                <FeatureResult onSave={save} onRetry={() => setPlan('')} title="Your Custom Schedule">
                    <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {plan}
                    </div>
                </FeatureResult>
            )}
        </div>
    )
}

const DoubtSolver = () => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const solve = async () => {
    if (!input && !image) return;
    setLoading(true);
    let res = '';
    
    // Check for API Key presence
    if (!process.env.API_KEY && window.location.hostname !== 'localhost') {
        res = "Note: API Key is missing. In a real deployment, please set process.env.API_KEY.";
    } else {
        if (image) {
           const base64Data = image.split(',')[1];
           const mimeType = image.split(';')[0].split(':')[1];
           res = await GeminiService.generateImageResponse(input || "Explain this image step by step.", base64Data, mimeType);
        } else {
           res = await GeminiService.generateTextResponse(input, "You are a helpful academic tutor. Solve the student's doubt step-by-step with clear formatting.");
        }
    }
    setResponse(res);
    setLoading(false);
  };

  const save = async () => {
      const item: SavedItem = {
          id: Date.now().toString(),
          type: 'doubt_solution',
          title: `Doubt: ${input ? input.slice(0, 20) : 'Image Upload'}...`,
          content: response,
          timestamp: Date.now()
      };
      await StorageService.saveItemToLibrary(item);
  }

  return (
    <div className="p-4 pb-28 space-y-6 animate-slide-up">
      {!response && (
      <div className="glass-panel p-4 rounded-3xl shadow-lg">
        <textarea 
          className="w-full bg-transparent outline-none resize-none dark:text-white placeholder-gray-400 text-lg" 
          placeholder="What's your question today?"
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        {image && (
          <div className="relative mt-4 w-full h-48 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-600 group">
            <img src={image} alt="Upload" className="w-full h-full object-contain bg-gray-50 dark:bg-gray-800" />
            <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"><Icons.X /></button>
          </div>
        )}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
          <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <Icons.Upload />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          
          <button 
            onClick={solve}
            disabled={loading}
            className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-indigo-600 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
          >
            {loading ? 'Thinking...' : 'Solve'} <Icons.Send />
          </button>
        </div>
      </div>
      )}

      {response && (
        <FeatureResult onSave={save} onRetry={() => setResponse('')}>
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{response}</div>
        </FeatureResult>
      )}
    </div>
  );
};

const NotesGenerator = () => {
  const [topic, setTopic] = useState('');
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic) return;
    setLoading(true);
    const result = await GeminiService.generateNotes(topic);
    if (result) {
      const newNote: Note = { ...result, id: Date.now().toString(), topic, timestamp: Date.now() };
      setNote(newNote);
    }
    setLoading(false);
  };

  const save = async () => {
      if(!note) return;
      const item: SavedItem = {
          id: note.id,
          type: 'note',
          title: note.topic,
          content: note,
          timestamp: note.timestamp
      };
      await StorageService.saveItemToLibrary(item);
  }

  return (
    <div className="p-4 pb-28 space-y-6 animate-slide-up">
      <div className="flex gap-3 glass-panel p-2 rounded-2xl shadow-sm">
        <input 
          type="text" 
          placeholder="Topic (e.g., Quantum Physics)" 
          className="flex-1 p-3 bg-transparent outline-none dark:text-white font-medium"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button onClick={generate} disabled={loading} className="bg-secondary text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
          {loading ? '...' : 'Generate'}
        </button>
      </div>

      {note && (
        <FeatureResult onSave={save} onRetry={() => setNote(null)}>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/50">
                <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wide text-xs">Summary</h4>
                <p className="text-sm dark:text-gray-200 leading-relaxed">{note.summary}</p>
            </div>
            <div className="bg-white dark:bg-cardDark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide text-xs">Deep Dive</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{note.details}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-3xl border border-green-100 dark:border-green-800/50">
                <h4 className="font-bold text-green-700 dark:text-green-300 mb-2 uppercase tracking-wide text-xs">Examples</h4>
                <p className="text-sm dark:text-gray-200">{note.examples}</p>
            </div>
          </div>
        </FeatureResult>
      )}
    </div>
  );
};

const Flashcards = () => {
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState<number | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const generate = async () => {
    if (!topic) return;
    setLoading(true);
    const res = await GeminiService.generateFlashcards(topic);
    setCards(res);
    setLoading(false);
    setQuizMode(false);
    setCurrentQuizIndex(0);
    setScore(0);
    setShowAnswer(false);
  };

  const save = async () => {
      if(cards.length === 0) return;
      const item: SavedItem = {
          id: Date.now().toString(),
          type: 'flashcard_set',
          title: `Flashcards: ${topic}`,
          content: cards,
          timestamp: Date.now()
      };
      await StorageService.saveItemToLibrary(item);
  }

  const handleQuizAnswer = (correct: boolean) => {
      if(correct) setScore(score + 1);
      setShowAnswer(false);
      if(currentQuizIndex < cards.length - 1) {
          setCurrentQuizIndex(currentQuizIndex + 1);
      } else {
          alert(`Quiz Complete! Score: ${correct ? score + 1 : score}/${cards.length}`);
          setQuizMode(false);
      }
  }

  return (
    <div className="p-4 pb-28 space-y-6 animate-slide-up">
      <div className="flex gap-3 glass-panel p-2 rounded-2xl shadow-sm">
         <input 
          type="text" 
          placeholder="Topic for Flashcards" 
          className="flex-1 p-3 bg-transparent outline-none dark:text-white font-medium"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button onClick={generate} disabled={loading} className="bg-secondary text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
          {loading ? '...' : 'Create'}
        </button>
      </div>

      {cards.length > 0 && (
          <>
          <div className="flex justify-end">
              <button onClick={() => setQuizMode(!quizMode)} className="text-xs font-bold text-primary uppercase tracking-wide bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                  {quizMode ? 'View All Cards' : 'Start Quiz Mode'}
              </button>
          </div>

          {!quizMode ? (
            <div className="grid gap-6">
                {cards.map((card, idx) => (
                <div 
                    key={idx} 
                    onClick={() => setFlipped(flipped === idx ? null : idx)}
                    className="perspective cursor-pointer h-56 group"
                >
                    <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flipped === idx ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transform: flipped === idx ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                    <div className="absolute inset-0 backface-hidden bg-white dark:bg-cardDark border-2 border-indigo-50 dark:border-gray-700 rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-sm group-hover:shadow-lg transition-all">
                        <p className="font-bold text-xl text-gray-800 dark:text-white">{card.front}</p>
                        <span className="absolute bottom-6 text-[10px] text-gray-400 uppercase tracking-widest font-semibold bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">Tap to flip</span>
                    </div>
                    <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center p-8 text-center text-white shadow-xl" style={{ transform: 'rotateY(180deg)' }}>
                        <p className="font-medium text-lg leading-relaxed">{card.back}</p>
                    </div>
                    </div>
                </div>
                ))}
            </div>
          ) : (
             <div className="bg-white dark:bg-cardDark p-8 rounded-3xl shadow-lg text-center h-80 flex flex-col items-center justify-center">
                 <div className="mb-4 text-xs text-gray-400 font-bold uppercase">Card {currentQuizIndex + 1} / {cards.length}</div>
                 <h3 className="text-2xl font-bold mb-6 dark:text-white">{cards[currentQuizIndex].front}</h3>
                 
                 {showAnswer ? (
                     <div className="animate-fade-in w-full">
                         <p className="text-lg text-indigo-600 dark:text-indigo-400 mb-8 font-medium">{cards[currentQuizIndex].back}</p>
                         <div className="flex gap-4 justify-center">
                             <button onClick={() => handleQuizAnswer(false)} className="bg-red-100 text-red-600 px-6 py-3 rounded-xl font-bold">Hard</button>
                             <button onClick={() => handleQuizAnswer(true)} className="bg-green-100 text-green-600 px-6 py-3 rounded-xl font-bold">Easy</button>
                         </div>
                     </div>
                 ) : (
                     <button onClick={() => setShowAnswer(true)} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-8 py-3 rounded-xl font-bold">Show Answer</button>
                 )}
             </div>
          )}

          {!quizMode && (
            <FeatureResult onSave={save} onRetry={() => setCards([])} title="">
                <div className="text-center text-sm text-gray-500">Save this set to practice later.</div>
            </FeatureResult>
          )}
          </>
      )}
    </div>
  );
};

const TutorChat = () => {
  const [selectedPersona, setSelectedPersona] = useState<TutorPersona | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!input || !selectedPersona) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const reply = await GeminiService.generateTextResponse(input, selectedPersona.systemInstruction);
    
    const botMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'model', text: reply, timestamp: Date.now() };
    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  const saveMessage = async (text: string) => {
    const item: SavedItem = {
      id: Date.now().toString(),
      type: 'note',
      title: `${selectedPersona?.name} Advice`,
      content: { summary: text.slice(0, 100) + "...", details: text, examples: "" },
      timestamp: Date.now()
    };
    await StorageService.saveItemToLibrary(item);
  };

  if (!selectedPersona) {
    return (
      <div className="p-4 pb-28 grid grid-cols-1 gap-4 animate-slide-up">
        <h2 className="font-bold text-xl dark:text-white mb-2 px-2">Select a Mentor</h2>
        {TUTORS.map(t => (
          <div key={t.id} onClick={() => setSelectedPersona(t)} className="bg-white dark:bg-cardDark p-5 rounded-3xl flex items-center gap-5 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-800/50 hover:scale-[1.02] transition-all">
            <span className="text-4xl bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl shadow-inner">{t.emoji}</span>
            <div>
              <h3 className="font-bold text-lg dark:text-white">{t.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[85vh] p-4 pb-24 animate-slide-up">
      <div className="flex items-center gap-3 mb-4 bg-white dark:bg-cardDark p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <button onClick={() => setSelectedPersona(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><Icons.X /></button>
        <span className="text-2xl">{selectedPersona.emoji}</span>
        <div>
           <h3 className="font-bold dark:text-white">{selectedPersona.name}</h3>
           <p className="text-xs text-gray-500">{selectedPersona.role}</p>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map(m => (
           <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-cardDark dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-none'}`}>
                 {m.text}
                 {m.role === 'model' && <button onClick={() => saveMessage(m.text)} className="block mt-2 text-[10px] opacity-50 hover:opacity-100 uppercase font-bold tracking-wide">Save Advice</button>}
              </div>
           </div>
        ))}
        {loading && <div className="text-xs text-gray-400 ml-4">{selectedPersona.name} is typing...</div>}
      </div>

      <div className="flex gap-2">
         <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={`Ask ${selectedPersona.name}...`} 
            className="flex-1 bg-white dark:bg-cardDark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 outline-none dark:text-white"
         />
         <button onClick={send} disabled={loading} className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-500/30">
            <Icons.Send />
         </button>
      </div>
    </div>
  );
};

const SavedView = () => {
    const [items, setItems] = useState<SavedItem[]>([]);
    
    useEffect(() => {
        StorageService.fetchLibraryItems().then(setItems);
    }, []);

    const typeIcons: any = {
        'note': Icons.Book,
        'quiz': Icons.Quiz,
        'flashcard_set': Icons.Lightning,
        'homework_solution': Icons.Camera,
        'doubt_solution': Icons.Brain,
        'essay_feedback': Icons.Pen,
        'plan': Icons.Calendar,
        'math_solution': Icons.Math,
        'code_explanation': Icons.Code,
        'diagram': Icons.Chart,
        'ocr_note': Icons.Book,
        'formula_sheet': Icons.Formula,
        'citation': Icons.Quote,
        'whiteboard_analysis': Icons.Pencil
    };

    return (
        <div className="p-4 pb-28 space-y-4 animate-slide-up">
             <h2 className="text-2xl font-bold dark:text-white mb-4">Your Library</h2>
             {items.length === 0 && <div className="text-center text-gray-400 mt-10">Nothing saved yet.</div>}
             {items.map(item => {
                 const Icon = typeIcons[item.type] || Icons.Save;
                 return (
                     <div key={item.id} className="bg-white dark:bg-cardDark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 items-start">
                         <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-gray-500 dark:text-gray-300">
                             <Icon />
                         </div>
                         <div className="flex-1 overflow-hidden">
                             <h3 className="font-bold text-gray-800 dark:text-white truncate">{item.title}</h3>
                             <p className="text-xs text-gray-400 mt-1">{new Date(item.timestamp).toLocaleDateString()}</p>
                             <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">Click to view (Coming Soon)</div>
                         </div>
                     </div>
                 )
             })}
        </div>
    )
}

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('home');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
        if(session?.user) {
             setUser({ name: session.user.email?.split('@')[0] || 'User', email: session.user.email || '' });
        }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
         if(session?.user) {
             setUser({ name: session.user.email?.split('@')[0] || 'User', email: session.user.email || '' });
         } else {
             setUser(null);
         }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const logout = async () => {
      await supabase.auth.signOut();
      setUser(null);
  }

  if (!user) {
      return (
          <div className={isDark ? 'dark' : ''}>
              <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
                <div className="absolute top-4 right-4">
                     <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md">
                        {isDark ? <Icons.Sun /> : <Icons.Moon />}
                     </button>
                </div>
                <AuthView onLogin={setUser} />
              </div>
          </div>
      );
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors text-gray-900 dark:text-gray-100 font-sans">
        <Header title={view.charAt(0).toUpperCase() + view.slice(1)} toggleTheme={toggleTheme} isDark={isDark} user={user} onLogout={logout} />

        <main className="max-w-2xl mx-auto min-h-screen">
          {view === 'home' && <HomeView setView={setView} user={user} />}
          {view === 'homework' && <HomeworkSolver />}
          {view === 'doubt' && <DoubtSolver />}
          {view === 'math' && <MathSolver />}
          {view === 'diagram' && <DiagramGenerator />}
          {view === 'notes' && <NotesGenerator />}
          {view === 'formula' && <FormulaSheet />}
          {view === 'ocr' && <OCRNotes />}
          {view === 'tracker' && <ProgressTracker />}
          {view === 'citation' && <CitationGenerator />}
          {view === 'flashcards' && <Flashcards />}
          {view === 'quiz' && <QuizGenerator />}
          {view === 'essay' && <EssayGrader />}
          {view === 'code' && <CodeExplainer />}
          {view === 'eli5' && <ELI5 />}
          {view === 'planner' && <StudyPlanner />}
          {view === 'tutor' && <TutorChat />}
          {view === 'whiteboard' && <Whiteboard />}
          {view === 'saved' && <SavedView />}
        </main>

        <GlobalGenie />

        <nav className="fixed bottom-0 w-full glass-panel border-t border-gray-200 dark:border-gray-800 p-2 z-30 pb-6">
             <div className="max-w-md mx-auto flex justify-around items-center">
                <NavButton icon={Icons.Home} label="Home" active={view === 'home'} onClick={() => setView('home')} />
                <NavButton icon={Icons.Brain} label="Ask" active={view === 'doubt'} onClick={() => setView('doubt')} />
                <NavButton icon={Icons.User} label="Tutor" active={view === 'tutor'} onClick={() => setView('tutor')} />
                <NavButton icon={Icons.Book} label="Library" active={view === 'saved'} onClick={() => setView('saved')} />
             </div>
          </nav>
      </div>
    </div>
  );
};

export default App;