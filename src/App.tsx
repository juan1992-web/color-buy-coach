import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { 
  Camera, 
  ArrowRight, 
  ShoppingBag, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck, 
  Heart,
  LogOut,
  Loader2,
  Info,
  Download,
  Image as ImageIcon,
  Copy
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

declare global {
  interface Window {
    Kakao: any;
  }
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [step, setStep] = useState<Step>(() => {
    return (localStorage.getItem('savedStep') as Step | null) || 'landing';
  });
  const [loading, setLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisMessage, setAnalysisMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tone, setTone] = useState<string | null>(() => localStorage.getItem('savedTone') || null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  // 카카오 JavaScript 키 (환경변수 또는 직접 입력)
  const KAKAO_KEY = import.meta.env.VITE_KAKAO_JS_KEY || ""; 

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

    // Kakao SDK 초기화 로직 보완
    if (window.Kakao) {
      if (!window.Kakao.isInitialized() && KAKAO_KEY) {
        try {
          window.Kakao.init(KAKAO_KEY);
          console.log('Kakao SDK Initialized');
        } catch (e) {
          console.error('Kakao Init Error:', e);
        }
      }
    }

    return () => subscription.unsubscribe();
  }, [KAKAO_KEY]);

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
    setLoading(false);
    setStep('result');
    
    localStorage.setItem('savedTone', randomTone);
    localStorage.setItem('savedStep', 'result');
  };

  const handleSaveAsImage = async () => {
    if (resultCardRef.current === null) return;
    
    setLoading(true);
    try {
      const dataUrl = await toPng(resultCardRef.current, { 
        cacheBust: true, 
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `my-personal-color-${tone}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('사진 저장 실패:', err);
      alert('사진 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoShare = () => {
    const shareUrl = window.location.origin; // 공유될 주소
    const title = `나의 퍼스널 컬러는 [${tone}]!`;
    const description = "컬러코치에서 나만의 인생 컬러와 아이템을 확인해보세요.";

    // 1. Kakao SDK가 정상적으로 초기화된 경우
    if (window.Kakao && window.Kakao.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: title,
          description: description,
          imageUrl: 'https://cdn.pixabay.com/photo/2016/03/23/04/01/woman-1274056_1280.jpg',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: '나도 테스트하기',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    } 
    // 2. 키가 없거나 SDK 초기화 실패 시 (에러 4011 방지)
    else {
      const fallbackMsg = `${title}\n${description}\n${shareUrl}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(fallbackMsg).then(() => {
          alert("카카오 앱 키가 설정되지 않아 결과 링크를 복사했습니다. 친구에게 전달해보세요!");
        });
      } else {
        alert("분석 결과: " + title + "\n링크를 복사해서 공유해주세요!");
      }
    }
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
              className="flex flex-col gap-10 mt-6 pb-20"
            >
              {/* 이미지로 캡처될 영역 시작 */}
              <div ref={resultCardRef} className="bg-white p-6 rounded-[3rem] border border-beauty-light shadow-sm">
                <div className="bg-gradient-beauty text-white p-10 rounded-[2.5rem] shadow-2xl shadow-beauty-purple/30 relative overflow-hidden text-center">
                  <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
                    <Heart className="w-48 h-48 fill-current" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/30">
                      My Personal Color
                    </div>
                    <h2 className="text-white/80 text-lg font-medium italic">나의 분석 결과는</h2>
                    <h3 className="text-4xl font-extrabold tracking-tight drop-shadow-md">{tone}</h3>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                   <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Recommended Items</p>
                   <div className="grid grid-cols-3 gap-3">
                      {products.map(p => (
                        <div key={p.id} className="flex flex-col items-center text-center gap-1.5">
                           <div className="w-full aspect-square bg-beauty-light rounded-2xl flex items-center justify-center border border-beauty-pink/5">
                              <ShoppingBag className="w-8 h-8 text-beauty-pink/30" />
                           </div>
                           <p className="text-[10px] font-bold text-gray-700 leading-tight line-clamp-1">{p.name}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-beauty-light flex justify-between items-center px-2">
                   <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-beauty-pink fill-current" />
                      <span className="text-xs font-bold text-beauty-pink">ColorCoach</span>
                   </div>
                   <span className="text-[10px] text-gray-300">AI Personal Beauty Analysis</span>
                </div>
              </div>

              {/* 저장 섹션 - 사진으로 저장하기 */}
              <div className="bg-beauty-purple/[0.03] p-10 rounded-[3.5rem] shadow-inner border border-beauty-purple/10 space-y-8">
                <div className="space-y-3 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-beauty-purple/10 text-beauty-purple rounded-full text-xs font-bold mb-2">
                    <ImageIcon className="w-3 h-3" /> Result Photo
                  </div>
                  <h4 className="text-2xl font-bold text-beauty-purple">분석 결과 사진으로 저장</h4>
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">분석된 나의 컬러와 아이템 리스트를<br/>갤러리에 사진 파일로 저장하세요.</p>
                </div>
                
                <button 
                  onClick={handleSaveAsImage} 
                  disabled={loading}
                  className="w-full bg-beauty-purple text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl shadow-beauty-purple/20 transition-all flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                  내 분석 결과 사진으로 저장
                </button>

                <p className="text-center text-[11px] text-gray-400 font-medium">
                  * 사진 저장은 개인 기기의 저장 공간에 즉시 이루어집니다.
                </p>
              </div>

              {/* Action Buttons - KakaoTalk Sharing */}
              <div className="flex flex-col gap-5 pt-4">
                <button 
                  onClick={handleKakaoShare} 
                  className="w-full bg-[#FEE500] text-[#191919] py-6 rounded-[2.5rem] font-bold text-xl shadow-xl shadow-yellow-500/10 flex items-center justify-center gap-3 hover:bg-[#FADA0A] active:scale-[0.98] transition-all"
                >
                  {window.Kakao && window.Kakao.isInitialized() ? <MessageCircle className="w-6 h-6 fill-current" /> : <Copy className="w-6 h-6" />}
                  {window.Kakao && window.Kakao.isInitialized() ? "카카오톡으로 결과 공유" : "결과 링크 복사하기"}
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
