import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase'; // supabase.ts 파일이 있어야 함
import type { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [step, setStep] = useState<'landing' | 'upload' | 'result'>('landing');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  // 분석 결과 상태 (초기값 null)
  const [tone, setTone] = useState<string | null>(null); 

  // 로그인 세션 관리
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 1. 분석 함수 (가짜 AI 로직 - 오류 방지용)
  const handleAnalyze = () => {
    if (!selectedFile) return alert('사진을 올려주세요!');
    setLoading(true);

    // 백엔드 호출 없이, 2.5초 뒤에 결과 화면으로 이동 (Mocking)
    setTimeout(() => {
      // 랜덤으로 톤 결정 (테스트용)
      const mockTones = ['가을 웜톤 (Warm Autumn)', '여름 쿨톤 (Cool Summer)'];
      const randomTone = mockTones[Math.floor(Math.random() * mockTones.length)];
      
      setTone(randomTone);
      setLoading(false);
      setStep('result'); // 결과 화면으로 강제 이동
    }, 2500);
  };

  // 2. 로그인 함수 (이메일 매직링크)
  const handleLogin = async () => {
    if (!email) return alert('이메일을 입력해주세요.');
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // 현재 브라우저 주소를 자동으로 인식해서 리다이렉트
        emailRedirectTo: window.location.origin, 
      },
    });

    setLoading(false);
    if (error) {
      alert('로그인 에러: ' + error.message);
    } else {
      alert('이메일함으로 로그인 링크를 보냈습니다! 확인해주세요.');
    }
  };

  // 3. 왓츠앱 공유 함수
  const handleShare = () => {
    const message = `나의 퍼스널컬러는 ${tone || '비밀'}! 너도 한번 해봐:`;
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`, '_blank');
  };

  // 4. 제품 데이터 (구매 링크 포함)
  const products = [
    { id: 1, name: "플럼풀 립스틱", brand: "MAC", price: "$24", link: "https://www.google.com/search?q=mac+plumful", reason: "쿨톤 착붙템" },
    { id: 2, name: "피치 블러셔", brand: "NARS", price: "$30", link: "https://www.google.com/search?q=nars+orgasm", reason: "얼굴에 형광등 켜줌" },
    { id: 3, name: "아이보리 셔츠", brand: "ZARA", price: "$45", link: "https://www.zara.com", reason: "기본템으로 딱" },
  ];

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center p-4 font-sans text-gray-800">
      
      {/* 1. 랜딩 페이지 */}
      {step === 'landing' && (
        <div className="text-center max-w-md mt-20 space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">오늘 뭐 바르지?<br/><span className="text-rose-500">3초 만에 결정</span></h1>
          <p className="text-gray-600">AI가 당신의 톤을 분석하고<br/>지금 당장 살 인생템을 골라드려요.</p>
          <button onClick={() => setStep('upload')} className="w-full bg-rose-500 text-white py-4 rounded-xl text-xl font-bold shadow-lg hover:bg-rose-600 transition">
            무료 진단 시작하기
          </button>
        </div>
      )}

      {/* 2. 업로드 페이지 */}
      {step === 'upload' && (
        <div className="w-full max-w-md mt-10 space-y-6 bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold text-center">사진을 올려주세요</h2>
          
          <div className="border-2 border-dashed border-rose-200 rounded-xl p-8 text-center cursor-pointer hover:bg-rose-50 transition relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  setPreview(URL.createObjectURL(file));
                }
              }} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-60 mx-auto rounded-lg" />
            ) : (
              <p className="text-gray-400">터치해서 사진 선택하기</p>
            )}
          </div>

          <button 
            onClick={handleAnalyze} 
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl text-lg font-bold disabled:bg-gray-400"
          >
            {loading ? 'AI가 분석 중입니다...' : '내 컬러 & 추천템 보기'}
          </button>
        </div>
      )}

      {/* 3. 결과 페이지 */}
      {step === 'result' && (
        <div className="w-full max-w-md space-y-6 animate-fade-in-up">
          <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
            <p className="text-gray-500 text-sm">분석 결과</p>
            <h2 className="text-3xl font-bold text-rose-500 mt-2">{tone}</h2>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold ml-2">오늘의 쇼핑 리스트 Top 3</h3>
            {products.map((p) => (
              <div key={p.id} onClick={() => window.open(p.link, '_blank')} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div> 
                <div>
                  <h4 className="font-bold text-lg">{p.name}</h4>
                  <p className="text-sm text-gray-500">{p.brand} • {p.price}</p>
                  <p className="text-xs text-rose-500 font-medium mt-1">💡 {p.reason}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 로그인 & 저장 섹션 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
            {!session ? (
              <>
                <p className="text-center font-medium">결과를 잃어버리지 않으려면?</p>
                <input 
                  type="email" 
                  placeholder="이메일 입력 (예: name@gmail.com)" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border p-3 rounded-lg"
                />
                <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">
                  {loading ? '전송 중...' : '이메일로 결과 저장하기'}
                </button>
              </>
            ) : (
              <div className="text-center">
                <p className="text-green-600 font-bold">✅ 로그인 되었습니다.</p>
                <p className="text-xs text-gray-400">결과가 계정에 저장됩니다.</p>
              </div>
            )}
          </div>

          <button onClick={handleShare} className="w-full bg-green-500 text-white py-4 rounded-xl font-bold shadow-lg">
            친구에게 물어보기 (WhatsApp)
          </button>
          
          <button onClick={() => window.location.reload()} className="w-full text-gray-400 py-4 underline">
            다시하기
          </button>
        </div>
      )}
    </div>
  );
}

export default App;2