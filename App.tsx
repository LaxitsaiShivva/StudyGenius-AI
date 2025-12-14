import React, { useState, useEffect, useRef } from 'react';
import { View, SavedItem, ChatMessage, TutorPersona, User, QuizQuestion, SubjectProgress } from './types';
import { TUTORS, MOTIVATIONAL_QUOTES } from './constants';
import * as GeminiService from './services/geminiService';
import * as StorageService from './services/storageService';
import { supabase } from './services/supabaseClient';

// --- Icons ---
const Icons = {
  Home: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Chat: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  Note: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Card: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  Quiz: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Tutor: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Save: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>,
  Menu: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  Close: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Send: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Refresh: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
};

// --- Helper Components ---
const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false, type = 'button' }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30",
    secondary: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30",
    outline: "border-2 border-indigo-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800",
    ghost: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
    danger: "bg-rose-500 text-white hover:bg-rose-600"
  };
  
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, onKeyDown, className = '', type = 'text', disabled=false }: any) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    onKeyDown={onKeyDown}
    disabled={disabled}
    className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${className}`}
  />
);

const Loader = () => (
  <div className="flex justify-center p-4">
    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// --- Auth Component ---
const AuthView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        else alert('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mesh-gradient">
      <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">StudyGenius AI</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Your intelligent study companion</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg text-sm">{error}</div>}
        
        <form onSubmit={handleAuth} className="space-y-4">
          <Input 
            type="email" 
            placeholder="Email address" 
            value={email} 
            onChange={(e: any) => setEmail(e.target.value)} 
          />
          <Input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e: any) => setPassword(e.target.value)} 
          />
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader /> : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Feature Views ---

const HomeView = ({ onChangeView }: { onChangeView: (v: View) => void }) => {
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
          <p className="opacity-90 italic">"{quote}"</p>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { id: 'doubt', label: 'Ask Doubt', icon: <Icons.Chat />, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
          { id: 'notes', label: 'Create Notes', icon: <Icons.Note />, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
          { id: 'flashcards', label: 'Flashcards', icon: <Icons.Card />, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
          { id: 'quiz', label: 'Take Quiz', icon: <Icons.Quiz />, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
          { id: 'tutor', label: 'AI Tutor', icon: <Icons.Tutor />, color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
          { id: 'saved', label: 'Library', icon: <Icons.Save />, color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id as View)}
            className={`${item.color} p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-sm`}
          >
            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-full">{item.icon}</div>
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const ChatView = ({ mode, persona }: { mode: 'doubt' | 'tutor', persona?: TutorPersona }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'tutor' && persona) {
      setMessages([{
        id: 'init', role: 'model', timestamp: Date.now(),
        text: `Hello! I'm ${persona.name}. ${persona.systemInstruction.split('.')[1] || 'How can I help you today?'}`
      }]);
    }
  }, [mode, persona]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const context = mode === 'tutor' ? persona?.systemInstruction : "You are a helpful study assistant.";
    const response = await GeminiService.generateTextResponse(input, context);

    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: response, timestamp: Date.now() };
    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-bl-none shadow-sm'}`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none shadow-sm"><Loader /></div></div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t dark:border-slate-800">
        <div className="flex gap-2">
          <Input 
            value={input} 
            onChange={(e: any) => setInput(e.target.value)} 
            placeholder="Type your question..." 
            onKeyDown={(e: any) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} disabled={loading} className="rounded-xl aspect-square p-0 w-12"><Icons.Send /></Button>
        </div>
      </div>
    </div>
  );
};

const NotesView = () => {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const result = await GeminiService.generateNotes(topic);
    setNotes(result);
    setLoading(false);
  };

  const save = async () => {
    if (notes) {
      await StorageService.saveItemToLibrary({
        id: Date.now().toString(), type: 'note', title: topic, content: notes, timestamp: Date.now()
      });
      alert('Notes saved!');
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex gap-2">
        <Input value={topic} onChange={(e: any) => setTopic(e.target.value)} placeholder="Enter topic (e.g., Photosynthesis)" />
        <Button onClick={generate} disabled={loading || !topic}>{loading ? <Loader /> : 'Create'}</Button>
      </div>

      {notes && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 animate-slide-up">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-indigo-600">{topic}</h2>
            <Button variant="ghost" onClick={save}><Icons.Save /></Button>
          </div>
          <div className="space-y-4">
            <section>
              <h3 className="font-bold text-lg mb-1">Summary</h3>
              <p className="text-slate-600 dark:text-slate-300">{notes.summary}</p>
            </section>
            <section>
              <h3 className="font-bold text-lg mb-1">Key Details</h3>
              <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">{notes.details}</p>
            </section>
            <section className="bg-indigo-50 dark:bg-slate-700/50 p-4 rounded-xl">
              <h3 className="font-bold text-indigo-700 dark:text-indigo-300 mb-1">Examples</h3>
              <p className="text-slate-600 dark:text-slate-300">{notes.examples}</p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

const FlashcardsView = () => {
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState<number | null>(null);

  const generate = async () => {
    setLoading(true);
    const result = await GeminiService.generateFlashcards(topic);
    setCards(result);
    setLoading(false);
    setFlipped(null);
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex gap-2">
        <Input value={topic} onChange={(e: any) => setTopic(e.target.value)} placeholder="Topic for flashcards..." />
        <Button onClick={generate} disabled={loading || !topic}>{loading ? <Loader /> : 'Generate'}</Button>
      </div>

      <div className="grid gap-4">
        {cards.map((card, idx) => (
          <div 
            key={idx}
            onClick={() => setFlipped(flipped === idx ? null : idx)}
            className="perspective cursor-pointer h-48 group"
          >
            <div className={`relative w-full h-full duration-500 transform-style-3d transition-all ${flipped === idx ? 'rotate-y-180' : ''}`}>
              {/* Front */}
              <div className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border-l-4 border-indigo-500 flex items-center justify-center text-center">
                <p className="font-semibold text-lg">{card.front}</p>
                <span className="absolute bottom-3 right-4 text-xs text-gray-400">Tap to flip</span>
              </div>
              {/* Back */}
              <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-indigo-600 text-white rounded-2xl p-6 shadow-md flex items-center justify-center text-center">
                <p className="font-medium">{card.back}</p>
              </div>
            </div>
          </div>
        ))}
        {cards.length > 0 && (
          <Button onClick={async () => {
            await StorageService.saveItemToLibrary({
               id: Date.now().toString(), type: 'flashcard_set', title: topic, content: cards, timestamp: Date.now()
            });
            alert('Saved!');
          }} variant="outline" className="w-full">Save Set</Button>
        )}
      </div>
    </div>
  );
};

const QuizView = () => {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const generate = async () => {
    setLoading(true);
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    const result = await GeminiService.generateQuiz(topic);
    setQuestions(result);
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex gap-2">
        <Input value={topic} onChange={(e: any) => setTopic(e.target.value)} placeholder="Quiz topic..." />
        <Button onClick={generate} disabled={loading || !topic}>{loading ? <Loader /> : 'Start Quiz'}</Button>
      </div>

      {questions.map((q, idx) => (
        <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="font-bold text-lg mb-4">{idx + 1}. {q.question}</h3>
          <div className="space-y-2">
            {q.options.map((opt, optIdx) => {
              let btnClass = "w-full text-left p-3 rounded-lg border transition-colors ";
              if (submitted) {
                if (optIdx === q.correctAnswer) btnClass += "bg-emerald-100 border-emerald-500 text-emerald-700 ";
                else if (answers[idx] === optIdx) btnClass += "bg-rose-100 border-rose-500 text-rose-700 ";
                else btnClass += "border-gray-200 dark:border-slate-600 opacity-50 ";
              } else {
                btnClass += answers[idx] === optIdx 
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-slate-700 dark:text-indigo-300 " 
                  : "border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 ";
              }
              
              return (
                <button 
                  key={optIdx} 
                  onClick={() => !submitted && setAnswers(prev => ({...prev, [idx]: optIdx}))}
                  className={btnClass}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {submitted && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
              💡 {q.explanation}
            </div>
          )}
        </div>
      ))}

      {questions.length > 0 && !submitted && (
        <Button onClick={() => setSubmitted(true)} className="w-full">Submit Answers</Button>
      )}
    </div>
  );
};

const LibraryView = () => {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StorageService.fetchLibraryItems().then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="p-4 pb-20 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Your Library</h2>
      {items.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No saved items yet.</p>
      ) : (
        items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
             <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">{item.type.replace('_', ' ')}</span>
                <span className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleDateString()}</span>
             </div>
             <h3 className="font-bold text-lg mb-2">{item.title}</h3>
             <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {typeof item.content === 'string' ? item.content : JSON.stringify(item.content)}
             </div>
          </div>
        ))
      )}
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('home');
  const [tutor, setTutor] = useState<TutorPersona | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <Loader />
      </div>
    );
  }

  if (!session) return <AuthView />;

  const renderView = () => {
    switch (view) {
      case 'home': return <HomeView onChangeView={setView} />;
      case 'doubt': return <ChatView mode="doubt" />;
      case 'tutor': 
        if (!tutor) {
           return (
             <div className="p-4 grid grid-cols-1 gap-4">
                <h2 className="text-xl font-bold mb-2">Choose your Tutor</h2>
                {TUTORS.map(t => (
                  <button key={t.id} onClick={() => setTutor(t)} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all text-left">
                    <span className="text-4xl">{t.emoji}</span>
                    <div>
                      <div className="font-bold">{t.name}</div>
                      <div className="text-sm text-gray-500">{t.role}</div>
                    </div>
                  </button>
                ))}
             </div>
           );
        }
        return <ChatView mode="tutor" persona={tutor} />;
      case 'notes': return <NotesView />;
      case 'flashcards': return <FlashcardsView />;
      case 'quiz': return <QuizView />;
      case 'saved': return <LibraryView />;
      default: return <HomeView onChangeView={setView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-800 p-4 fixed h-full z-10">
        <div className="mb-8 px-2 flex items-center gap-2">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
           <span className="font-bold text-xl">StudyGenius</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          {[
            { id: 'home', label: 'Dashboard', icon: <Icons.Home /> },
            { id: 'doubt', label: 'Ask Doubt', icon: <Icons.Chat /> },
            { id: 'notes', label: 'Notes', icon: <Icons.Note /> },
            { id: 'flashcards', label: 'Flashcards', icon: <Icons.Card /> },
            { id: 'quiz', label: 'Quiz', icon: <Icons.Quiz /> },
            { id: 'tutor', label: 'Tutor', icon: <Icons.Tutor /> },
            { id: 'saved', label: 'Library', icon: <Icons.Save /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id as View); setTutor(undefined); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === item.id ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <Button variant="ghost" className="justify-start text-rose-500 hover:bg-rose-50 hover:text-rose-600" onClick={() => supabase.auth.signOut()}>
          <Icons.Logout /> Sign Out
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative w-full">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 border-b dark:border-slate-800">
          <span className="font-bold text-lg">StudyGenius</span>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
            {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-white dark:bg-slate-900 z-50 p-4 animate-fade-in">
             <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-xl">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)}><Icons.Close /></button>
             </div>
             <nav className="space-y-2">
               {['home', 'doubt', 'notes', 'flashcards', 'quiz', 'tutor', 'saved'].map((v) => (
                 <button 
                   key={v}
                   onClick={() => { setView(v as View); setMobileMenuOpen(false); setTutor(undefined); }}
                   className="w-full text-left p-4 rounded-xl bg-gray-50 dark:bg-slate-800 capitalize font-medium"
                 >
                   {v}
                 </button>
               ))}
               <button onClick={() => supabase.auth.signOut()} className="w-full text-left p-4 text-rose-500">Sign Out</button>
             </nav>
          </div>
        )}

        <div className="max-w-4xl mx-auto pt-6 md:pt-10 px-4 md:px-8">
           <div className="mb-6">
             <h1 className="text-3xl font-bold capitalize text-slate-800 dark:text-white">
                {view === 'tutor' && tutor ? `Chat with ${tutor.name}` : view}
             </h1>
           </div>
           {renderView()}
        </div>
      </main>
    </div>
  );
}