import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase'; // supabase.ts 파일이 있어야 함
import type { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [step, setStep] = useState<'landing' | 'upload' | 'result'>(() => {
    return (localStorage.getItem('savedStep') as 'result' | null) || 'landing';
  });
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tone, setTone] = useState<string | null>(() => localStorage.getItem('savedTone') || null); 
  const [isSaved, setIsSaved] = useState(false);

  // 제품 데이터 (상단으로 이동)
  const products = [
    { id: 1, name: "플럼풀 립스틱", brand: "MAC", price: "$24", link: "https://www.google.com/search?q=mac+plumful", reason: "쿨톤 착붙템" },
    { id: 2, name: "피치 블러셔", brand: "NARS", price: "$30", link: "https://www.google.com/search?q=nars+orgasm", reason: "얼굴에 형광등 켜줌" },
    { id: 3, name: "아이보리 셔츠", brand: "ZARA", price: "$45", link: "https://www.zara.com", reason: "기본템으로 딱" },
  ];

  // 로그인 세션 관리 및 리다이렉트 후 상태 복구
  useEffect(() => {
    // OAuth 및 매직링크 리다이렉트 후 상태 복구 (결과 화면 유지)
    localStorage.removeItem('savedTone');
    localStorage.removeItem('savedStep');

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 1. 분석 함수
  const handleAnalyze = () => {
    if (!selectedFile) return alert('사진을 올려주세요!');
    setLoading(true);

    setTimeout(() => {
      const mockTones = ['가을 웜톤 (Warm Autumn)', '여름 쿨톤 (Cool Summer)'];
      const randomTone = mockTones[Math.floor(Math.random() * mockTones.length)];
      
      setTone(randomTone);
      setIsSaved(false); // 분석할 때마다 저장 상태 초기화
      setLoading(false);
      setStep('result');
    }, 2500);
  };

  // 상태를 로컬 스토리지에 저장하는 헬퍼 함수
  const saveStateToStorage = () => {
    if (tone) {
      localStorage.setItem('savedTone', tone);
      localStorage.setItem('savedStep', 'result');
    }
  };

  // 2. 로그인 함수 (이메일 매직링크)
  const handleLogin = async () => {
    if (!email) return alert('이메일을 입력해주세요.');
    setLoading(true);
    saveStateToStorage();
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
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

  // 3. 구글 로그인 함수
  const handleGoogleLogin = async () => {
    saveStateToStorage();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
    if (error) {
      alert('구글 로그인 오류: ' + error.message);
    }
  };

  // 4. Supabase DB에 결과 저장 함수
  const handleSaveResult = async () => {
    if (!session?.user) return alert('로그인이 필요합니다.');
    if (!tone) return alert('저장할 분석 결과가 없습니다.');

    setLoading(true);
    const { error } = await supabase
      .from('result') // 'result' 테이블에 저장
      .insert([
        {
          user_id: session.user.id,
          tone: tone,
          products: products, // 추천된 제품 리스트도 함께 저장 (JSON)
        }
      ]);

    setLoading(false);
    if (error) {
      console.error('저장 에러:', error);
      alert('결과 저장 중 오류가 발생했습니다: ' + error.message);
    } else {
      setIsSaved(true);
      alert('결과가 성공적으로 저장되었습니다!');
    }
  };

  // 5. 왓츠앱 공유 함수
  const handleShare = () => {
    const message = `나의 퍼스널컬러는 ${tone || '비밀'}! 너도 한번 해봐:`;
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`, '_blank');
  };

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
        <div className="w-full max-w-md space-y-6 animate-fade-in-up pb-10">
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
                
                {/* 이메일 로그인 */}
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="이메일 입력 (예: name@gmail.com)" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button onClick={handleLogin} disabled={loading} className="bg-gray-800 hover:bg-black text-white px-4 py-3 rounded-lg font-bold whitespace-nowrap transition">
                    {loading ? '전송...' : '링크 받기'}
                  </button>
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">또는</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* 구글 로그인 */}
                <button 
                  onClick={handleGoogleLogin} 
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  Google로 3초 만에 시작하기
                </button>
              </>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-green-600 font-bold">✅ 로그인 되었습니다.</p>
                
                {!isSaved ? (
                  <button 
                    onClick={handleSaveResult} 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-md transition disabled:bg-gray-400"
                  >
                    {loading ? '저장 중...' : '내 계정에 분석 결과 저장하기'}
                  </button>
                ) : (
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200">
                    🎉 결과가 'result' 테이블에 저장되었습니다!
                  </div>
                )}
                
                <button 
                  onClick={() => supabase.auth.signOut()} 
                  className="text-xs text-gray-400 underline mt-2"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>

          <button onClick={handleShare} className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg transition">
            친구에게 물어보기 (WhatsApp)
          </button>
          
          <button onClick={() => window.location.reload()} className="w-full text-gray-400 py-4 underline hover:text-gray-600 transition">
            처음부터 다시하기
          </button>
        </div>
      )}
    </div>
  );
}

export default App;