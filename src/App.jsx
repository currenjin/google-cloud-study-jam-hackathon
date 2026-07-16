import { useState, useEffect } from 'react'
import './App.css'
import mockData from '../demo-assets/mock-scenes.json'
import { generateStoryBible, generateNextScene, generateImage } from './gemini'

const LOCAL_STORAGE_VERSION = 'v1'

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

  // M2 추가 상태
  const [userTwist, setUserTwist] = useState('')
  const [showOverlay, setShowOverlay] = useState(false)

  // 1. localStorage 로드 및 복구
  useEffect(() => {
    try {
      const saved = localStorage.getItem('reels_drama_state')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.version === LOCAL_STORAGE_VERSION && parsed.bible && parsed.scenes && parsed.scenes.length > 0) {
          setBible(parsed.bible)
          setScenes(parsed.scenes)
          setCurrentSceneIndex(parsed.scenes.length - 1)
          setIsDemoMode(parsed.isDemoMode || false)
          setStage('SCENE')
        }
      }
    } catch (e) {
      console.error('Failed to restore state from localStorage', e)
    }
  }, [])

  // 2. localStorage 저장 헬퍼
  const saveStateToStorage = (currentBible, currentScenes, demoMode) => {
    try {
      // base64/blob data URL은 제거하여 텍스트 데이터만 가볍게 백업
      const sanitizedScenes = currentScenes.map(scene => ({
        ...scene,
        cuts: scene.cuts.map(cut => ({
          ...cut,
          image_url: cut.image_url && cut.image_url.startsWith('data:') ? null : cut.image_url
        }))
      }))
      const payload = {
        version: LOCAL_STORAGE_VERSION,
        bible: currentBible,
        scenes: sanitizedScenes,
        isDemoMode: demoMode
      }
      localStorage.setItem('reels_drama_state', JSON.stringify(payload))
    } catch (e) {
      console.error('Failed to save state to localStorage', e)
    }
  }

  // 3. 드라마 킥오프 (목업 데이터 기반)
  const startDramaWithMock = (demoMode = false) => {
    setIsLoading(true)
    setLoadingText(demoMode ? '데모 모드 준비 중...' : '바이블 제작 중...')
    
    setTimeout(() => {
      const initialBible = mockData.bible
      const initialScenes = [mockData.scenes[0]]
      setIsDemoMode(demoMode)
      setBible(initialBible)
      setScenes(initialScenes)
      setCurrentSceneIndex(0)
      setIsLoading(false)
      setStage('SCENE')
      saveStateToStorage(initialBible, initialScenes, demoMode)
    }, 1200)
  }

  // 4. 드라마 킥오프 (실제 API 기반)
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
          sceneData.cuts[0].image_url = null;
        }
      }

      setBible(bibleData);
      setScenes([sceneData]);
      setCurrentSceneIndex(0);
      setIsDemoMode(false);
      setStage('SCENE');
      saveStateToStorage(bibleData, [sceneData], false)
    } catch (error) {
      console.error('Failed to start drama via API', error);
      if (confirm('드라마 생성 중 오류가 발생했습니다. 데모 모드로 시작하시겠습니까?')) {
        startDramaWithMock(true);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // 5. 다음 화 만들기 (릴레이 턴 생성)
  const handleNextTurn = async () => {
    if (!userTwist.trim()) {
      alert('다음 이야기를 한 줄 입력해 주세요!');
      return;
    }

    setIsLoading(true);
    setLoadingText('다음 화 대본 구성 중...');

    // A. 데모 모드일 때
    if (isDemoMode) {
      setTimeout(() => {
        const nextIndex = scenes.length;
        if (nextIndex >= mockData.scenes.length) {
          alert('데모 모드 준비 분량(4화)이 완료되었습니다. 완성된 릴을 확인하거나 새 드라마를 시작하세요!');
          setIsLoading(false);
          return;
        }
        
        const nextMockScene = {
          ...mockData.scenes[nextIndex],
          user_twist: userTwist
        };
        const updatedScenes = [...scenes, nextMockScene];
        
        setScenes(updatedScenes);
        setCurrentSceneIndex(updatedScenes.length - 1);
        setUserTwist('');
        setIsLoading(false);
        setShowOverlay(true); // 📱 넘겨주기 오버레이 활성
        saveStateToStorage(bible, updatedScenes, true);
      }, 1200);
      return;
    }

    // B. 실제 API 모드일 때
    try {
      const currentStorySummary = scenes[scenes.length - 1].updated_story_summary || bible.story_summary;
      
      // Step 1: 씬 생성
      setLoadingText('대본 수정 중... (씬 대본 작성)');
      const nextSceneData = await generateNextScene(bible, currentStorySummary, userTwist);
      nextSceneData.user_twist = userTwist;
      nextSceneData.image_url = null;

      // Step 2: 이미지 생성
      if (nextSceneData.cuts && nextSceneData.cuts.length > 0 && nextSceneData.cuts[0].image_prompt) {
        setLoadingText('스튜디오 촬영 중... (이미지 생성)');
        try {
          const imageUrl = await generateImage(nextSceneData.cuts[0].image_prompt);
          nextSceneData.cuts[0].image_url = imageUrl;
        } catch (imgError) {
          console.error('Image generation failed, falling back to text card', imgError);
          nextSceneData.cuts[0].image_url = null;
        }
      }

      // 새 인물 추가 반영
      let updatedCharacters = [...bible.characters];
      if (nextSceneData.new_characters && nextSceneData.new_characters.length > 0) {
        const existingIds = new Set(bible.characters.map(c => c.id));
        nextSceneData.new_characters.forEach(char => {
          if (!existingIds.has(char.id)) {
            updatedCharacters.push(char);
          }
        });
      }

      const updatedBible = {
        ...bible,
        characters: updatedCharacters,
        story_summary: nextSceneData.updated_story_summary
      };

      const updatedScenes = [...scenes, nextSceneData];

      setBible(updatedBible);
      setScenes(updatedScenes);
      setCurrentSceneIndex(updatedScenes.length - 1);
      setUserTwist('');
      setShowOverlay(true); // 📱 넘겨주기 오버레이 활성
      saveStateToStorage(updatedBible, updatedScenes, false);
    } catch (error) {
      console.error('Failed to generate next scene', error);
      alert('이야기를 잇는 중 통신 오류가 발생했습니다. 입력하신 전개는 보존되니 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  }

  // 6. 새 드라마로 초기화 (SEED 단계로 리셋 및 localStorage 청소)
  const resetDrama = () => {
    if (confirm('현재 제작 중인 드라마를 종료하고 새 드라마를 시작하시겠습니까?')) {
      setStage('SEED')
      setBible(null)
      setScenes([])
      setCurrentSceneIndex(0)
      setIsDemoMode(false)
      setUserTwist('')
      localStorage.removeItem('reels_drama_state')
    }
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
      {/* 📱 핫시트 릴레이 전달 오버레이 */}
      {showOverlay && (
        <div className="pass-overlay" onClick={() => setShowOverlay(false)}>
          <div className="pass-content">
            <span className="overlay-icon">📱</span>
            <h2>다음 사람에게 기기를 넘겨주세요!</h2>
            <p className="overlay-sub">화면을 탭하면 대본과 다음 이야기를 이어갑니다.</p>
          </div>
        </div>
      )}

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
            <button className="btn-back" onClick={resetDrama}>🎬 새 드라마</button>
            <div className="header-meta">
              <h2 className="drama-title">{bible.title}</h2>
              {isDemoMode && <span className="badge-demo">DEMO</span>}
            </div>
          </header>

          <div className="scene-body">
            {/* 화수 네비게이션 */}
            <div className="scene-nav">
              <button 
                disabled={currentSceneIndex === 0} 
                onClick={() => setCurrentSceneIndex(currentSceneIndex - 1)}
                className="nav-arrow"
              >
                ◀ 이전 화
              </button>
              <span className="current-episode">{currentSceneIndex + 1} / {scenes.length}화</span>
              <button 
                disabled={currentSceneIndex === scenes.length - 1} 
                onClick={() => setCurrentSceneIndex(currentSceneIndex + 1)}
                className="nav-arrow"
              >
                다음 화 ▶
              </button>
            </div>

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
          
          {/* 컨트롤 및 릴레이 입력 영역 */}
          <footer className="scene-footer">
            <div className="relay-input-area">
              <textarea 
                className="relay-textarea"
                placeholder="인형들의 다음 행보를 한 줄로 개입하세요..."
                value={userTwist}
                onChange={(e) => setUserTwist(e.target.value)}
              />
              <button 
                type="button"
                className="btn btn-primary btn-relay"
                onClick={handleNextTurn}
              >
                🎬 다음 화 촬영 시작
              </button>
            </div>
          </footer>
        </section>
      )}
    </div>
  )
}

export default App
