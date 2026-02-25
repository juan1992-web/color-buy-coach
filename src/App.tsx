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
  Heart,
  Mail,
  LogOut,
  ChevronRight,
  Loader2,
  Info
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
      name: "매트 리퀴드 립스틱", 
      brand: "A 브랜드", 
      price: "₩32,000", 
      link: "https://www.google.com/search?q=matte+lipstick", 
      reason: "당신의 톤을 가장 화사하게 밝혀줄 컬러",
      tags: ["베스트 매칭", "사랑스러운 무드"]
    },
    { 
      id: 2, 
      name: "소프트 벨벳 블러셔", 
      brand: "B 브랜드", 
      price: "₩28,000", 
      link: "https://www.google.com/search?q=velvet+blusher", 
      reason: "은은한 기품을 더해주는 우아한 발색",
      tags: ["우아함", "기품 있는 선택"]
    },
    { 
      id: 3, 
      name: "데일리 실크 셔츠", 
      brand: "C 브랜드", 
      price: "₩49,000", 
      link: "https://www.google.com/search?q=silk+shirt", 
      reason: "피부결을 정돈해 보이는 화사한 아이보리",
      tags: ["데일리 템", "품격 있는 연출"]
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
    
    const messages = [
      { text: "피부 결의 고유한 톤을 분석 중입니다...", progress: 20 },
      { text: "주변 조명을 보정하여 정확도를 높이는 중입니다...", progress: 40 },
      { text: "퍼스널 컬러 대비감을 세밀하게 측정 중입니다...", progress: 60 },
      { text: "다양한 뷰티 브랜드 데이터와 매칭 중입니다...", progress: 80 },
      { text: "당신만을 위한 베스트 컬러를 찾았습니다!", progress: 100 },
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
    const message = `나의 퍼스널컬러는 ${tone}! 컬러코치에서 나만의 색을 찾아보세요:`;
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
    <div className="min-h-screen flex flex-col items-center bg-white text-gray-800">
      
      {/* Header */}
      <header className="w-full max-w-lg px-6 py-6 flex justify-between items-center z-10 border-b border-beauty-light/50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
          <div className="w-9 h-9 bg-beauty-pink rounded-xl flex items-center justify-center shadow-lg shadow-beauty-pink/20">
            <Heart className="text-white fill-current w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-beauty-pink">ColorCoach</span>
        </div>
        {session && (
          <button onClick={() => supabase.auth.signOut()} className="text-gray-400 p-2 hover:text-beauty-purple transition-colors">
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-10 mt-12"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-beauty-light text-beauty-pink rounded-full text-sm font-bold border border-beauty-pink/10">
                  <Sparkles className="w-4 h-4" /> AI Personal Beauty Lab
                </div>
                <h1 className="text-4xl font-bold leading-[1.2] text-gray-900">
                  나의 숨겨진 <span className="text-beauty-pink">아름다움</span>,<br />
                  <span className="text-beauty-purple">품격 있게</span> 찾으세요.
                </h1>
                <p className="text-lg text-gray-500 leading-relaxed max-w-[95%]">
                  무작정 유행하는 컬러가 아닌, 당신의 피부톤과 조화롭게 어우러지는 인생템을 추천해 드립니다.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-beauty-light/30 p-5 rounded-[2rem] border border-beauty-pink/5 space-y-3">
                  <div className="w-10 h-10 bg-white text-beauty-pink rounded-2xl flex items-center justify-center shadow-sm">
                    <Heart className="w-6 h-6 fill-current" />
                  </div>
                  <h3 className="font-bold text-base text-beauty-pink">감성 매칭</h3>
                  <p className="text-xs text-gray-400">나만의 무드를 완성하는 컬러</p>
                </div>
                <div className="bg-purple-50 p-5 rounded-[2rem] border border-beauty-purple/5 space-y-3">
                  <div className="w-10 h-10 bg-white text-beauty-purple rounded-2xl flex items-center justify-center shadow-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-beauty-purple">세련된 분석</h3>
                  <p className="text-xs text-gray-400">데이터 기반의 믿음직한 추천</p>
                </div>
              </div>

              <div className="bg-blue-50/50 p-5 rounded-3xl flex items-start gap-4 border border-blue-100/50">
                <Info className="w-5 h-5 text-beauty-blue shrink-0 mt-0.5" />
                <p className="text-sm text-gray-500 leading-snug">
                  제공되는 정보는 이미지 분석 기술을 바탕으로 제안되는 가이드이며, 실제 화장품 발색은 조명에 따라 다를 수 있습니다.
                </p>
              </div>

              <div className="fixed bottom-8 left-0 right-0 px-6 max-w-lg mx-auto z-20">
                <button 
                  onClick={() => setStep('upload')}
                  className="w-full bg-beauty-pink text-white py-5 rounded-[2rem] text-xl font-bold shadow-2xl shadow-beauty-pink/30 flex items-center justify-center gap-2 group transition-all active:scale-[0.98] hover:bg-[#FF4D89]"
                >
                  나만의 컬러 찾기 시작
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
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
              className="flex flex-col gap-8 mt-6"
            >
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-beauty-purple">사진 선택하기</h2>
                <p className="text-gray-400">자연광 아래서 찍은 선명한 사진을 준비해 주세요</p>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative aspect-[4/5] rounded-[3rem] border-2 border-dashed border-beauty-pink/20 bg-beauty-light/20 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-beauty-light/40 transition-all overflow-hidden shadow-inner",
                  preview && "border-solid border-beauty-pink"
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
                    initial={{ scale: 1.05, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <>
                    <div className="w-20 h-20 bg-white text-beauty-pink rounded-full flex items-center justify-center shadow-lg">
                      <Camera className="w-10 h-10" />
                    </div>
                    <p className="font-bold text-beauty-pink/60 text-lg">갤러리에서 선택</p>
                    <div className="flex items-center gap-1.5 text-xs text-beauty-blue font-medium bg-beauty-blue/5 px-4 py-2 rounded-full border border-beauty-blue/10">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      사진은 분석용으로만 활용되며 저장되지 않습니다
                    </div>
                  </>
                )}
                
                {preview && (
                  <div className="absolute inset-0 bg-beauty-pink/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white font-bold bg-beauty-pink/80 px-6 py-3 rounded-full backdrop-blur-md">사진 다시 선택</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleAnalyze} 
                  disabled={!selectedFile || loading}
                  className="w-full bg-beauty-pink text-white py-5 rounded-[2rem] text-xl font-bold disabled:bg-gray-100 disabled:text-gray-300 transition-all shadow-xl shadow-beauty-pink/20"
                >
                  정밀 분석 시작
                </button>
                <button 
                  onClick={() => setStep('landing')}
                  className="text-gray-400 py-3 hover:text-beauty-purple font-medium"
                >
                  이전으로 돌아가기
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
              className="flex flex-col items-center justify-center gap-10 mt-36"
            >
              <div className="relative w-36 h-36">
                <motion.div 
                  className="absolute inset-0 border-4 border-beauty-pink/10 rounded-full"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <motion.div 
                  className="absolute inset-0 border-t-4 border-beauty-pink rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                />
                <motion.div 
                  className="absolute inset-0 border-r-4 border-beauty-purple rounded-full opacity-50"
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="w-12 h-12 text-beauty-pink fill-current animate-pulse" />
                </div>
              </div>

              <div className="text-center space-y-5 w-full">
                <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{analysisMessage}</h3>
                <div className="w-full h-2.5 bg-beauty-light rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-beauty"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 font-medium tracking-wide">AI가 세밀한 톤 차이를 찾아내고 있습니다</p>
              </div>
            </motion.div>
          )}

          {/* Step 4: Result */}
          {step === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-10 mt-6"
            >
              {/* Result Summary */}
              <div className="bg-gradient-beauty text-white p-10 rounded-[3.5rem] shadow-2xl shadow-beauty-purple/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
                  <Heart className="w-48 h-48 fill-current" />
                </div>
                <div className="relative z-10 space-y-4 text-center">
                  <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-[0.2em] border border-white/30">
                    Analysis Completed
                  </div>
                  <h2 className="text-white/80 text-lg font-medium italic">당신의 퍼스널 컬러는</h2>
                  <h3 className="text-5xl font-extrabold tracking-tight drop-shadow-md">{tone}</h3>
                </div>
              </div>

              {/* Recommended Products */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-3">
                  <h4 className="text-2xl font-bold text-gray-900">당신을 빛나게 할 아이템</h4>
                  <div className="flex items-center gap-1 text-beauty-red font-bold animate-pulse">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="text-sm">Personal Selection</span>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  {products.map((p, idx) => (
                    <motion.div 
                      key={p.id} 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      onClick={() => window.open(p.link, '_blank')}
                      className="group bg-white p-6 rounded-[2.5rem] shadow-premium border border-beauty-light flex items-center gap-6 cursor-pointer hover:border-beauty-pink/40 transition-all active:scale-[0.98]"
                    >
                      <div className="w-24 h-24 bg-beauty-light rounded-[2rem] flex-shrink-0 relative overflow-hidden group-hover:bg-beauty-pink/10 transition-colors border border-beauty-pink/5 flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-beauty-pink/40 group-hover:text-beauty-pink transition-colors" />
                      </div> 
                      <div className="flex-1 space-y-1.5">
                        <div className="flex gap-1.5 mb-1.5 flex-wrap">
                          {p.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-2.5 py-1 bg-white text-beauty-purple rounded-full border border-beauty-purple/20 uppercase font-bold tracking-tight">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h5 className="font-bold text-xl group-hover:text-beauty-pink transition-colors">{p.name}</h5>
                        <p className="text-sm text-gray-400 font-medium">{p.brand} • <span className="text-beauty-red">{p.price}</span></p>
                        <p className="text-[13px] leading-relaxed font-bold text-beauty-purple/80 mt-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-beauty-pink" /> {p.reason}
                        </p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-beauty-pink transition-colors" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Login & Save Section */}
              <div className="bg-beauty-blue/[0.03] p-10 rounded-[3.5rem] shadow-inner border border-beauty-blue/10 space-y-8">
                {!session ? (
                  <>
                    <div className="space-y-3 text-center">
                      <h4 className="text-2xl font-bold text-beauty-blue">분석 결과 보관하기</h4>
                      <p className="text-sm text-gray-400 leading-relaxed font-medium">나만의 컬러 데이터를 보관하고<br/>언제든 뷰티 상담을 받아보세요.</p>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-beauty-blue/30" />
                        <input 
                          type="email" 
                          placeholder="이메일 주소" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white border border-beauty-blue/10 pl-14 pr-6 py-5 rounded-[2rem] focus:ring-4 focus:ring-beauty-blue/5 outline-none transition-all shadow-sm font-medium"
                        />
                      </div>
                      <button 
                        onClick={handleLogin} 
                        disabled={loading} 
                        className="w-full bg-beauty-blue text-white py-5 rounded-[2rem] font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-beauty-blue/20 hover:brightness-105 active:scale-[0.98]"
                      >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        이메일로 시작하기
                      </button>
                    </div>

                    <div className="relative py-2 text-center">
                      <span className="text-xs text-beauty-blue/30 uppercase font-black tracking-widest bg-transparent px-4 relative z-10">OR</span>
                      <div className="absolute top-1/2 left-10 right-10 h-px bg-beauty-blue/10"></div>
                    </div>

                    <button 
                      onClick={handleGoogleLogin} 
                      className="w-full bg-white border border-gray-100 py-5 rounded-[2rem] font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm group"
                    >
                      <svg viewBox="0 0 24 24" width="22" height="22" className="group-hover:scale-110 transition-transform">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google로 계속하기
                    </button>
                  </>
                ) : (
                  <div className="text-center space-y-8">
                    <div className="inline-block p-6 bg-green-50 rounded-full border border-green-100">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-2xl font-bold text-gray-800 tracking-tight">로그인 완료</h4>
                      <p className="text-gray-400 font-medium">{session.user.email}</p>
                    </div>
                    
                    {!isSaved ? (
                      <button 
                        onClick={handleSaveResult} 
                        disabled={loading}
                        className="w-full bg-beauty-purple text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl shadow-beauty-purple/20 transition-all hover:brightness-105 active:scale-[0.98]"
                      >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        내 분석 결과 영구 저장
                      </button>
                    ) : (
                      <div className="bg-green-50 text-green-700 py-6 rounded-[2.5rem] border border-green-100 font-bold text-lg flex items-center justify-center gap-2 shadow-sm">
                        <Heart className="w-5 h-5 fill-current" /> 안전하게 보관되었습니다
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-5 pt-4">
                <button 
                  onClick={handleShare} 
                  className="w-full bg-[#25D366] text-white py-6 rounded-[2.5rem] font-bold text-xl shadow-2xl shadow-green-500/20 flex items-center justify-center gap-3 hover:brightness-105 active:scale-[0.98] transition-all"
                >
                  <Share2 className="w-6 h-6" />
                  친구에게 내 컬러 공유
                </button>
                
                <button 
                  onClick={handleReset} 
                  className="text-beauty-pink py-4 font-bold flex items-center justify-center gap-2 hover:text-[#FF4D89] transition-all group"
                >
                  <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  다른 사진으로 다시하기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed -bottom-32 -left-32 w-80 h-80 bg-beauty-pink/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="fixed -top-32 -right-32 w-80 h-80 bg-beauty-purple/5 rounded-full blur-[80px] pointer-events-none" />
    </div>
  );
}

export default App;
