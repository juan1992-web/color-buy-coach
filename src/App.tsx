import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import './App.css';

type Step = 'landing' | 'upload' | 'analyzing' | 'result';
type Tone = 'warm' | 'cool' | 'Spring' | 'Summer' | 'Autumn' | 'Winter';

interface Product {
  id: number;
  tone: Tone | string;
  name: string;
  brand: string;
  price: string;
  reason: string;
  image: string;
}

interface AIResult {
  tone: Tone | string;
  reason: string;
  bestColors: string[];
}

const products: Product[] = [
  {
    id: 1,
    tone: 'warm',
    name: '루비 우 (Ruby Woo)',
    brand: 'MAC',
    price: '$24.00',
    reason: '얼굴에 형광등을 켜주는 정석 레드',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 2,
    tone: 'warm',
    name: '벨벳 테디 (Velvet Teddy)',
    brand: 'MAC',
    price: '$24.00',
    reason: '우아한 분위기의 딥 베이지 누드',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 3,
    tone: 'warm',
    name: '칠리 (Chili)',
    brand: 'MAC',
    price: '$24.00',
    reason: '가을 웜톤의 인생템, 브릭 레드',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 4,
    tone: 'cool',
    name: '플럼풀 (Plumful)',
    brand: 'MAC',
    price: '$24.00',
    reason: '여름 뮤트 찰떡, 차분한 로즈 플럼',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 5,
    tone: 'cool',
    name: '릴렌트리슬리 레드 (Relentlessly Red)',
    brand: 'MAC',
    price: '$24.00',
    reason: '안색을 밝혀주는 브라이트 핑크 코랄',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 6,
    tone: 'cool',
    name: '캔디 얌얌 (Candy Yum-Yum)',
    brand: 'MAC',
    price: '$24.00',
    reason: '시선을 사로잡는 네온 핑크',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200&h=200'
  }
];

function App() {
  const [step, setStep] = useState<Step>('landing');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [accessory, setAccessory] = useState('');
  const [budget, setBudget] = useState('');
  
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStart = () => {
    setStep('upload');
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file); // Convert image to Base64
    }
  };

  const handleAnalyze = async () => {
    setStep('analyzing');
    
    try {
      // 1. Cloudflare Pages Function으로 POST 요청
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imagePreview,
          preferences: { accessory, budget }
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result: AIResult = await response.json();
      setAiResult(result);

      // 2. 결과에 따른 제품 추천 로직 (간단한 매핑)
      const toneLower = result.tone.toLowerCase();
      const isWarm = toneLower.includes('spring') || toneLower.includes('autumn') || toneLower.includes('warm');
      const mappedTone: Tone = isWarm ? 'warm' : 'cool';
      
      setRecommendedProducts(products.filter(p => p.tone === mappedTone));
      setStep('result');

    } catch (error) {
      console.error(error);
      alert('AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      setStep('upload');
    }
  };

  const handleReset = () => {
    setStep('landing');
    setImagePreview(null);
    setAccessory('');
    setBudget('');
    setAiResult(null);
    setRecommendedProducts([]);
  };

  const isFormValid = imagePreview !== null && accessory !== '' && budget !== '';

  return (
    <div className="app-container">
      {/* 1. 랜딩 페이지 */}
      {step === 'landing' && (
        <div className="main-container animate-fade-in-up">
          <div className="badge">
            <span className="badge-text">✨ 퍼스널컬러, 진단만 하고 끝인가요?</span>
          </div>

          <div className="space-y-4">
            <h1 className="title">
              진단 말고 <span className="title-highlight">쇼핑!</span><br />
              오늘 살 립스틱<br />
              <span className="title-underline">정해드려요</span>
            </h1>
            
            <p className="subtitle">
              사진 1장으로 퍼스널컬러 분석부터<br />
              추천 제품까지 <b>단 30초면 충분합니다.</b>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full max-w-sm mt-4">
            <div className="bg-white/40 p-3 rounded-2xl flex flex-col items-center shadow-sm">
              <span className="text-2xl mb-1">💸</span>
              <span className="text-xs text-gray-600 font-medium text-center">불필요한<br/>지출 방지</span>
            </div>
            <div className="bg-white/40 p-3 rounded-2xl flex flex-col items-center shadow-sm">
              <span className="text-2xl mb-1">⚡️</span>
              <span className="text-xs text-gray-600 font-medium text-center">30초<br/>빠른 분석</span>
            </div>
            <div className="bg-white/40 p-3 rounded-2xl flex flex-col items-center shadow-sm">
              <span className="text-2xl mb-1">💄</span>
              <span className="text-xs text-gray-600 font-medium text-center">나만의<br/>인생템 발견</span>
            </div>
          </div>

          <div className="w-full mt-6">
            <button 
              onClick={handleStart}
              className="cta-button"
            >
              무료 진단 시작하기
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
            <div className="social-proof mt-4 text-center">
              <p className="text-gray-600 text-sm font-medium">매달 나가는 화장품 값, 이제 실패 없는 쇼핑으로 아껴보세요.</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. 사진 업로드 및 질문 페이지 */}
      {step === 'upload' && (
        <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in-up">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-gray-800">
              당신의 진짜 컬러를<br/>찾아볼까요?
            </h2>
            <p className="text-sm text-gray-500">정확한 분석을 위해 아래 정보를 입력해주세요.</p>
          </div>
          
          <div 
            className="bg-white/60 backdrop-blur-md border-2 border-dashed border-pink-300 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/80 transition-all shadow-sm aspect-square overflow-hidden relative group"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full">사진 변경하기</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center">
                <span className="text-5xl mb-3">📸</span>
                <span className="text-base text-gray-700 font-bold mb-1">터치해서 얼굴 사진 업로드</span>
                <span className="text-xs text-gray-500">자연광에서 찍은 민낯 사진이 가장 정확해요!</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
            />
          </div>

          <div className="space-y-4">
            <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-pink-100/50">
              <p className="font-bold text-gray-800 mb-3 text-sm">Q1. 평소 잘 어울리는 액세서리 컬러는?</p>
              <div className="flex gap-2">
                {['골드', '실버', '모름'].map((opt) => (
                  <button 
                    key={opt}
                    onClick={() => setAccessory(opt)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      accessory === opt 
                        ? 'bg-pink-500 text-white shadow-md transform scale-105' 
                        : 'bg-white text-gray-600 hover:bg-pink-50 border border-gray-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-pink-100/50">
              <p className="font-bold text-gray-800 mb-3 text-sm">Q2. 오늘 립스틱 쇼핑 예산은?</p>
              <div className="flex flex-col gap-2">
                {['$10 미만', '$10 ~ $25', '$25 이상'].map((opt) => (
                  <button 
                    key={opt}
                    onClick={() => setBudget(opt)}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                      budget === opt 
                        ? 'bg-pink-500 text-white shadow-md transform scale-[1.02]' 
                        : 'bg-white text-gray-600 hover:bg-pink-50 border border-gray-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={!isFormValid}
            className={`w-full py-4 rounded-2xl font-extrabold text-lg transition-all flex items-center justify-center gap-2 mt-2 ${
              isFormValid 
                ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            내 컬러 & 추천템 분석하기
            {isFormValid && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* 3. 분석 중 로딩 화면 */}
      {step === 'analyzing' && (
        <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in-up">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 bg-pink-200 rounded-full animate-ping opacity-70"></div>
            <div className="absolute inset-2 border-4 border-pink-100 rounded-full"></div>
            <div className="absolute inset-2 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
            <span className="text-4xl relative z-10 animate-bounce">✨</span>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-gray-800 animate-pulse">AI가 퍼스널컬러를 분석 중입니다...</h2>
            <p className="text-sm text-gray-600 font-medium">수만 개의 컬러 데이터와 비교하고 있어요</p>
          </div>
        </div>
      )}

      {/* 4. 결과 화면 (Result) */}
      {step === 'result' && aiResult && (
        <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in-up pb-8">
          
          {/* 분석 완료 헤더 */}
          <div className="text-center space-y-2 pt-4">
            <div className="inline-block bg-white/80 px-4 py-1.5 rounded-full shadow-sm border border-pink-100 mb-2">
              <span className="text-sm font-bold text-gray-700">
                분석 완료! 고객님은 <span className="text-pink-500">{aiResult.tone}</span> 입니다.
              </span>
            </div>
            
            <div className="bg-white/60 p-4 rounded-xl shadow-sm border border-pink-100 mt-2 text-left">
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                <span className="text-pink-400 mr-1">🤖</span> {aiResult.reason}
              </p>
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 mt-4">
              오늘의 쇼핑 리스트<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">Top 3</span>
            </h2>
          </div>

          {/* 추천 제품 리스트 */}
          <div className="space-y-4">
            {recommendedProducts.map((product, index) => (
              <div key={product.id} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-pink-100/50 flex gap-4 items-center relative overflow-hidden group hover:shadow-md transition-shadow">
                
                <div className="absolute top-0 left-0 bg-gradient-to-br from-pink-400 to-rose-500 text-white w-8 h-8 flex items-center justify-center font-bold text-sm rounded-br-xl z-10">
                  {index + 1}
                </div>

                <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-xl shadow-inner border border-gray-100" />
                
                <div className="flex flex-col flex-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{product.brand}</span>
                  <h3 className="text-lg font-extrabold text-gray-900 leading-tight mb-1">{product.name}</h3>
                  <p className="text-sm font-medium text-pink-600 mb-2">{product.price}</p>
                  
                  <div className="bg-pink-50 rounded-lg p-2 border border-pink-100">
                    <p className="text-xs font-bold text-gray-700 flex items-start gap-1">
                      <span className="text-pink-400 mt-0.5">💡</span>
                      {product.reason}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 액션 버튼 */}
          <div className="flex flex-col gap-3 mt-4">
            <button className="w-full bg-[#25D366] hover:bg-[#1EBE5C] text-white font-bold py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
              </svg>
              친구에게 물어보기 (WhatsApp)
            </button>
            <button 
              onClick={handleReset}
              className="w-full bg-white text-gray-600 hover:text-gray-900 font-bold py-4 rounded-2xl border border-gray-200 transition-all shadow-sm"
            >
              다시하기
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default App;