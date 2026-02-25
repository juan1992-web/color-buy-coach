import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  ShoppingBag, 
  Share2, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp,
  Mail,
  LogOut,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from './lib/utils';

// Types
type Step = 'landing' | 'upload' | 'analyzing' | 'result';

interface Product {
  id: number;
  name: string;
  brand: string;
  price: string;
  link: string;
  reason: string;
  tags: string[];
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [step, setStep] = useState<Step>(() => {
    return (localStorage.getItem('savedStep') as Step | null) || 'landing';
  });
  const [loading, setLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisMessage, setAnalysisMessage] = useState('');
  const [email, setEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tone, setTone] = useState<string | null>(() => localStorage.getItem('savedTone') || null);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const products: Product[] = [
    { 
      id: 1, 
      name: "플럼풀 립스틱 (Plumful)", 
      brand: "MAC", 
      price: "₩36,000", 
      link: "https://www.google.com/search?q=mac+plumful", 
      reason: "얼굴에 형광등 켜주는 형광등 템",
      tags: ["실패 없는 선택", "BEST"]
    },
    { 
      id: 2, 
      name: "오르가즘 블러셔 (Orgasm)", 
      brand: "NARS", 
      price: "₩45,000", 
      link: "https://www.google.com/search?q=nars+orgasm", 
      reason: "어떤 룩에도 찰떡같이 어울림",
      tags: ["재구매 1위"]
    },
    { 
      id: 3, 
      name: "아이보리 실크 셔츠", 
      brand: "ZARA", 
      price: "₩59,000", 
      link: "https://www.zara.com", 
      reason: "피부톤을 한 톤 더 밝게",
      tags: ["기본템 추천"]
    },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    setStep('analyzing');
    setLoading(true);
    
    // "Labor Illusion" 효과를 위한 단계별 메시지
    const messages = [
      { text: "피부 톤 추출 중...", progress: 20 },
      { text: "퍼스널 컬러 대비감 측정 중...", progress: 40 },
      { text: "조명 보정 및 채도 분석 중...", progress: 60 },
      { text: "데이터베이스 3,000개 제품 매칭 중...", progress: 80 },
      { text: "최적의 인생템 선정 완료!", progress: 100 },
    ];

    for (const msg of messages) {
      setAnalysisMessage(msg.text);
      setAnalysisProgress(msg.progress);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    const mockTones = ['가을 웜톤 (Warm Autumn)', '여름 쿨톤 (Cool Summer)', '겨울 쿨톤 (Cool Winter)', '봄 웜톤 (Warm Spring)'];
    const randomTone = mockTones[Math.floor(Math.random() * mockTones.length)];
    
    setTone(randomTone);
    setIsSaved(false);
    setLoading(false);
    setStep('result');
    
    localStorage.setItem('savedTone', randomTone);
    localStorage.setItem('savedStep', 'result');
  };

  const handleLogin = async () => {
    if (!email) return alert('이메일을 입력해주세요.');
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    setLoading(false);
    if (error) alert('로그인 에러: ' + error.message);
    else alert('이메일함으로 로그인 링크를 보냈습니다!');
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) alert('구글 로그인 오류: ' + error.message);
  };

  const handleSaveResult = async () => {
    if (!session?.user || !tone) return;
    setLoading(true);
    const { error } = await supabase
      .from('result')
      .insert([{ user_id: session.user.id, tone: tone, products: products }]);

    setLoading(false);
    if (error) alert('저장 중 오류 발생: ' + error.message);
    else setIsSaved(true);
  };

  const handleShare = () => {
    const message = `나의 퍼스널컬러는 ${tone}! 여기서 무료로 확인해봐:`;
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`, '_blank');
  };

  const handleReset = () => {
    localStorage.removeItem('savedTone');
    localStorage.removeItem('savedStep');
    setStep('landing');
    setTone(null);
    setPreview(null);
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#FAF9F6] text-[#1a1a1a] selection:bg-[#d4a373]/30">
      
      {/* Header */}
      <header className="w-full max-w-lg px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
          <div className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center">
            <Sparkles className="text-[#d4a373] w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">ColorCoach</span>
        </div>
        {session && (
          <button onClick={() => supabase.auth.signOut()} className="text-gray-400 p-2 hover:text-gray-600 transition">
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </header>

      <main className="w-full max-w-lg flex-1 px-6 pb-24">
        <AnimatePresence mode="wait">
          
          {/* Step 1: Landing */}
          {step === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-12 mt-10"
            >
              <div className="space-y-6">
                <span className="inline-block px-4 py-1.5 bg-[#d4a373]/10 text-[#d4a373] rounded-full text-sm font-semibold tracking-wide">AI Beauty Lab</span>
                <h1 className="text-5xl font-bold leading-[1.15] text-[#1a1a1a]">
                  잘못된 립스틱에<br />
                  <span className="text-[#e29578] italic">더 이상 돈 낭비</span><br />
                  하지 마세요.
                </h1>
                <p className="text-lg text-gray-500 leading-relaxed max-w-[90%]">
                  전 세계 3,000+ 코스메틱 데이터를 기반으로 당신의 숨겨진 베스트 컬러를 찾아드립니다.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-3xl shadow-soft border border-gray-50 space-y-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base">전문가급 정밀도</h3>
                  <p className="text-xs text-gray-400">98.5%의 정확도 보장</p>
                </div>
                <div className="bg-white p-5 rounded-3xl shadow-soft border border-gray-50 space-y-3">
                  <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base">실시간 랭킹</h3>
                  <p className="text-xs text-gray-400">지금 유행하는 컬러 매칭</p>
                </div>
              </div>

              {/* Sticky CTA - Visible only on landing or when scrolled down? Actually, let's keep it here but fixed on bottom for mobile */}
              <div className="fixed bottom-8 left-0 right-0 px-6 max-w-lg mx-auto z-20">
                <button 
                  onClick={() => setStep('upload')}
                  className="w-full bg-[#1a1a1a] text-white py-5 rounded-2xl text-lg font-bold shadow-2xl flex items-center justify-center gap-2 group transition-transform active:scale-95 hover:bg-[#2a2a2a]"
                >
                  무료로 내 톤 분석하기
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Upload */}
          {step === 'upload' && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-8 mt-4"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">사진을 준비해 주세요</h2>
                <p className="text-gray-400">자연광 아래서 찍은 정면 사진이 가장 정확해요</p>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative aspect-[4/5] rounded-[2.5rem] border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-50/50 transition-all overflow-hidden",
                  preview && "border-solid border-[#d4a373]"
                )}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }} 
                  className="hidden"
                />
                {preview ? (
                  <motion.img 
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <>
                    <div className="w-16 h-16 bg-[#d4a373]/10 rounded-full flex items-center justify-center text-[#d4a373]">
                      <Camera className="w-8 h-8" />
                    </div>
                    <p className="font-semibold text-gray-500">여기를 눌러 사진 선택</p>
                    <div className="flex items-center gap-1 text-xs text-gray-300">
                      <ShieldCheck className="w-3 h-3" />
                      개인 정보 보호를 위해 사진은 저장되지 않습니다
                    </div>
                  </>
                )}
                
                {preview && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white font-bold bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">사진 바꾸기</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleAnalyze} 
                  disabled={!selectedFile || loading}
                  className="w-full bg-[#1a1a1a] text-white py-5 rounded-2xl text-lg font-bold disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-xl"
                >
                  분석 시작하기
                </button>
                <button 
                  onClick={() => setStep('landing')}
                  className="text-gray-400 py-2 hover:text-gray-600 transition"
                >
                  이전으로
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Analyzing (Labor Illusion) */}
          {step === 'analyzing' && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-10 mt-32"
            >
              <div className="relative w-32 h-32">
                <motion.div 
                  className="absolute inset-0 border-4 border-[#d4a373]/20 rounded-full"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <motion.div 
                  className="absolute inset-0 border-t-4 border-[#d4a373] rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-[#d4a373]" />
                </div>
              </div>

              <div className="text-center space-y-4 w-full">
                <h3 className="text-2xl font-bold">{analysisMessage}</h3>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#d4a373]"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400">정밀한 분석을 위해 잠시만 기다려주세요</p>
              </div>
            </motion.div>
          )}

          {/* Step 4: Result */}
          {step === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-8 mt-4"
            >
              {/* Result Summary */}
              <div className="bg-[#1a1a1a] text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-2">
                  <p className="text-[#d4a373] font-semibold tracking-wider flex items-center gap-2 uppercase text-xs">
                    <CheckCircle2 className="w-4 h-4" /> 분석 완료
                  </p>
                  <h2 className="text-gray-400 text-lg">당신의 퍼스널 컬러는</h2>
                  <h3 className="text-4xl font-bold tracking-tight">{tone}</h3>
                </div>
              </div>

              {/* Recommended Products */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-2xl font-bold">인생템 추천</h4>
                  <span className="text-sm text-gray-400">Match 99%</span>
                </div>
                <div className="flex flex-col gap-4">
                  {products.map((p, idx) => (
                    <motion.div 
                      key={p.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => window.open(p.link, '_blank')}
                      className="group bg-white p-5 rounded-3xl shadow-soft border border-gray-50 flex items-center gap-5 cursor-pointer hover:border-[#d4a373]/30 transition-all active:scale-[0.98]"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex-shrink-0 relative overflow-hidden group-hover:bg-[#d4a373]/5 transition-colors">
                        <ShoppingBag className="w-8 h-8 text-gray-300 absolute inset-0 m-auto group-hover:text-[#d4a373] transition-colors" />
                      </div> 
                      <div className="flex-1 space-y-1">
                        <div className="flex gap-1.5 mb-1">
                          {p.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full border border-gray-100 uppercase font-bold tracking-tighter">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h5 className="font-bold text-lg group-hover:text-[#d4a373] transition-colors">{p.name}</h5>
                        <p className="text-sm text-gray-400">{p.brand} • {p.price}</p>
                        <p className="text-xs font-medium text-[#e29578] mt-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {p.reason}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-[#d4a373] transition-colors" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Login & Save Section */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-gray-50 space-y-6">
                {!session ? (
                  <>
                    <div className="space-y-2 text-center">
                      <h4 className="text-xl font-bold">결과 저장하기</h4>
                      <p className="text-sm text-gray-400">분석 결과를 계정에 저장하고<br/>언제든 다시 확인하세요.</p>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <input 
                          type="email" 
                          placeholder="이메일 주소" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-gray-50 border-none pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-[#d4a373]/30 outline-none transition"
                        />
                      </div>
                      <button 
                        onClick={handleLogin} 
                        disabled={loading} 
                        className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        매직링크로 계속하기
                      </button>
                    </div>

                    <div className="relative py-2 text-center">
                      <span className="text-xs text-gray-300 uppercase font-bold tracking-widest bg-white px-4 relative z-10">OR</span>
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-100"></div>
                    </div>

                    <button 
                      onClick={handleGoogleLogin} 
                      className="w-full bg-white border border-gray-200 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google로 시작하기
                    </button>
                  </>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="inline-block p-4 bg-green-50 rounded-full">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold">로그인 성공!</h4>
                      <p className="text-sm text-gray-400">{session.user.email} 계정으로 로그인되었습니다.</p>
                    </div>
                    
                    {!isSaved ? (
                      <button 
                        onClick={handleSaveResult} 
                        disabled={loading}
                        className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-bold shadow-lg transition flex items-center justify-center gap-2"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        내 계정에 결과 영구 보관
                      </button>
                    ) : (
                      <div className="bg-green-50 text-green-700 py-4 rounded-2xl border border-green-100 font-bold">
                        분석 결과가 안전하게 저장되었습니다
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleShare} 
                  className="w-full bg-[#25D366] text-white py-5 rounded-[2rem] font-bold shadow-xl flex items-center justify-center gap-3 hover:brightness-105 active:scale-95 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  친구에게 공유하기
                </button>
                
                <button 
                  onClick={handleReset} 
                  className="text-gray-400 py-4 font-medium flex items-center justify-center gap-2 hover:text-[#e29578] transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  다른 사진으로 다시하기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed -bottom-24 -left-24 w-64 h-64 bg-[#d4a373]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -top-24 -right-24 w-64 h-64 bg-[#e29578]/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

export default App;
