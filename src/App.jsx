import { useState } from 'react'
import './App.css'
import mockData from '../demo-assets/mock-scenes.json'
import { generateStoryBible, generateNextScene, generateImage } from './gemini'

function App() {
  // stage: 'SEED' (시드 입력) | 'SCENE' (씬 턴 화면)
  const [stage, setStage] = useState('SEED')
  const [seed, setSeed] = useState('재벌집 막내인형과 편의점 알바인형의 계약연애')
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  
  // 드라마 전체 상태
  const [bible, setBible] = useState(null)
  const [scenes, setScenes] = useState([])
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)

  // 1. 드라마 킥오프 (목업 데이터 기반)
  const startDramaWithMock = (demoMode = false) => {
    setIsLoading(true)
    setLoadingText(demoMode ? '데모 모드 준비 중...' : '바이블 제작 중...')
    
    setTimeout(() => {
      setIsDemoMode(demoMode)
      setBible(mockData.bible)
      setScenes([mockData.scenes[0]]) // 첫 씬만 세팅
      setCurrentSceneIndex(0)
      setIsLoading(false)
      setStage('SCENE')
    }, 1200)
  }

  // 2. 드라마 킥오프 (실제 API 기반)
  const startDrama = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === '여기에붙여넣기' || apiKey.trim() === '') {
      alert("Gemini API Key가 누락되었습니다. 데모 모드로 체험을 시작합니다.");
      startDramaWithMock(true);
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: 바이블 생성
      setLoadingText('대본 작가 섭외 중... (바이블 구성)');
      const bibleData = await generateStoryBible(seed);
      
      // Step 2: 첫 번째 씬 생성 ( user_twist 는 '이야기를 시작한다' 고정 )
      setLoadingText('첫 번째 씬 촬영 중... (씬 대본 작성)');
      const sceneData = await generateNextScene(bibleData, '이야기를 시작한다', '이야기를 시작한다');
      sceneData.user_twist = '이야기를 시작한다';
      sceneData.image_url = null;
      
      // Step 3: 이미지 생성
      if (sceneData.cuts && sceneData.cuts.length > 0 && sceneData.cuts[0].image_prompt) {
        setLoadingText('디렉터 컷 인화 중... (이미지 생성)');
        try {
          const imageUrl = await generateImage(sceneData.cuts[0].image_prompt);
          sceneData.cuts[0].image_url = imageUrl;
        } catch (imgError) {
          console.error('Image generation failed, falling back to text card', imgError);
          // 1회 실패 시 텍스트 카드로 대체하기 위해 image_url을 null로 둠
          sceneData.cuts[0].image_url = null;
        }
      }

      setBible(bibleData);
      setScenes([sceneData]);
      setCurrentSceneIndex(0);
      setIsDemoMode(false);
      setStage('SCENE');
    } catch (error) {
      console.error('Failed to start drama via API', error);
      if (confirm('드라마 생성 중 오류가 발생했습니다. 데모 모드로 시작하시겠습니까?')) {
        startDramaWithMock(true);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // 3. 새 드라마로 초기화 (SEED 단계로 리셋)
  const resetDrama = () => {
    setStage('SEED')
    setBible(null)
    setScenes([])
    setCurrentSceneIndex(0)
    setIsDemoMode(false)
  }

  if (isLoading) {
    return (
      <div className="app-container loading-container">
        <div className="spinner"></div>
        <p className="loading-text">{loadingText}</p>
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* 1. SEED 입력 화면 */}
      {stage === 'SEED' && (
        <section className="stage-seed">
          <div className="poster-wrapper">
            <h1 className="poster-title">릴드</h1>
            <p className="poster-subtitle">Reels Drama</p>
            <div className="poster-badge">MANNEQUIN DIORAMA</div>
          </div>
          
          <div className="input-group">
            <label className="input-label">드라마 시작 시드 (Seed)</label>
            <textarea
              className="seed-textarea"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="드라마의 시작이 될 한 줄 시드를 입력하세요..."
            />
          </div>

          <div className="button-group">
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={startDrama}
            >
              🎬 드라마 제작 시작 (API)
            </button>
            
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => startDramaWithMock(true)}
            >
              💡 데모 모드로 체험
            </button>
          </div>
        </section>
      )}

      {/* 2. 씬 화면 */}
      {stage === 'SCENE' && bible && scenes.length > 0 && (
        <section className="stage-scene">
          <header className="scene-header">
            <button className="btn-back" onClick={resetDrama}>← 처음으로</button>
            <div className="header-meta">
              <h2 className="drama-title">{bible.title}</h2>
              {isDemoMode && <span className="badge-demo">DEMO</span>}
            </div>
          </header>

          <div className="scene-body">
            {/* 9:16 디바이스 비주얼 박스 */}
            <div className="visual-viewport">
              {scenes[currentSceneIndex].cuts[0].image_url ? (
                <img 
                  className="cut-image" 
                  src={scenes[currentSceneIndex].cuts[0].image_url} 
                  alt={scenes[currentSceneIndex].cuts[0].image_prompt} 
                />
              ) : (
                <div className="text-fallback-card">
                  <p className="fallback-narration">{scenes[currentSceneIndex].narration}</p>
                </div>
              )}
              
              {/* 대사 자막 오버레이 */}
              <div className="subtitle-overlay">
                {scenes[currentSceneIndex].dialogues.length > 0 ? (
                  <div className="dialogue-subtitle">
                    <span className="char-name">
                      {bible.characters.find(c => c.id === scenes[currentSceneIndex].dialogues[0].character_id)?.name || '인물'}
                    </span>
                    <p className="line-content">"{scenes[currentSceneIndex].dialogues[0].line}"</p>
                  </div>
                ) : (
                  <p className="narration-subtitle">{scenes[currentSceneIndex].narration}</p>
                )}
              </div>
            </div>

            {/* 대본 및 스토리 연출 텍스트 리스트 */}
            <div className="script-container">
              <div className="script-scene-title">{scenes[currentSceneIndex].scene_title}</div>
              <p className="script-narration">{scenes[currentSceneIndex].narration}</p>
              
              <div className="dialogues-list">
                {scenes[currentSceneIndex].dialogues.map((d, i) => {
                  const char = bible.characters.find(c => c.id === d.character_id)
                  return (
                    <div key={i} className={`dialogue-bubble ${char ? char.id : ''}`}>
                      <span className="speaker">{char ? char.name : d.character_id}</span>
                      <span className="speech-line">{d.line}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          
          {/* 컨트롤 및 릴레이 입력 영역 (M2에서 구현) */}
          <footer className="scene-footer">
            <div className="rel-placeholder">
              <p>M2: 턴 릴레이 입력 영역이 들어설 자리입니다.</p>
            </div>
          </footer>
        </section>
      )}
    </div>
  )
}

export default App
