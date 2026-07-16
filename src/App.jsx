import { useState, useEffect, useRef } from 'react'
import './App.css'
import mockData from '../demo-assets/mock-scenes.json'
import { generateStoryBible, generateNextScene, generateImage, generateHighlightVideo, getArcStage } from './gemini'

const LOCAL_STORAGE_VERSION = 'v1'

function App() {
  // stage: 'SEED' (시드 입력) | 'SCENE' (씬 턴 화면) | 'REELS' (릴레이 완성작 상영)
  const [stage, setStage] = useState('SEED')
  const [visualStyleType, setVisualStyleType] = useState('real') // 'real' | 'mannequin'
  const [seed, setSeed] = useState('재벌집 막내아들과 편의점 알바생의 계약연애')
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

  // M3 추가 상태 (릴레이 재생)
  const [reelsIndex, setReelsIndex] = useState(0)
  const [showEndingCard, setShowEndingCard] = useState(false)
  const [showSceneTitleCard, setShowSceneTitleCard] = useState(true)

  // M4 추가 상태 (실제 비디오 레코딩)
  const [isCompilingVideo, setIsCompilingVideo] = useState(false)
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null)
  const [videoCompilationText, setVideoCompilationText] = useState('')
  const [isGeneratingVeo, setIsGeneratingVeo] = useState(false)
  const [veoVideoUrl, setVeoVideoUrl] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null)

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
      const initialBible = {
        ...mockData.bible,
        visual_style: visualStyleType === 'real'
          ? "photorealistic live-action cinematic Korean drama scene, real actors with emotional expressions, highly detailed faces, stylish clothing, moody studio lighting, shallow depth of field, professional cinematography, 9:16 vertical, photorealistic, 8k"
          : "wooden artist mannequin figures on a miniature diorama stage set, soft studio lighting, shallow depth of field, cinematic color grading, 9:16 vertical"
      };
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

  // Veo 클립은 백그라운드에서 생성 — 릴레이 턴 진행을 절대 막지 않는다.
  // veoRunRef는 리셋/새 드라마 시작 후 도착한 이전 드라마의 클립이 잘못 꽂히는 것을 방지.
  const veoRunRef = useRef(0)
  const startBackgroundVeo = (sceneIndex, imagePrompt, imageUrl) => {
    const runId = veoRunRef.current
    generateHighlightVideo(imagePrompt, imageUrl, getArcStage(sceneIndex + 1).camera)
      .then(videoUrl => {
        if (veoRunRef.current !== runId) return
        setScenes(prev => {
          if (!prev[sceneIndex] || !prev[sceneIndex].cuts || !prev[sceneIndex].cuts[0]) return prev
          const next = [...prev]
          next[sceneIndex] = {
            ...next[sceneIndex],
            cuts: [{ ...next[sceneIndex].cuts[0], video_url: videoUrl }]
          }
          return next
        })
      })
      .catch(err => console.error('Background Veo generation failed', err))
  }

  // 4. 드라마 킥오프 (실제 API 기반)
  const startDrama = async () => {
    veoRunRef.current += 1
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
      const bibleData = await generateStoryBible(seed, uploadedImage, visualStyleType);
      
      // Step 2: 첫 번째 씬 생성 ( user_twist 는 '이야기를 시작한다' 고정 )
      setLoadingText('첫 번째 씬 촬영 중... (씬 대본 작성)');
      const sceneData = await generateNextScene(bibleData, '이야기를 시작한다', '이야기를 시작한다', 1);
      sceneData.user_twist = '이야기를 시작한다';
      sceneData.image_url = null;
      
      // Step 3: 이미지 및 비디오(Veo) 생성
      if (sceneData.cuts && sceneData.cuts.length > 0 && sceneData.cuts[0].image_prompt) {
        setLoadingText('디렉터 컷 인화 중... (이미지 생성)');
        try {
          let imageUrl = '';
          if (uploadedImage) {
            imageUrl = uploadedImage;
            sceneData.cuts[0].image_url = uploadedImage;
          } else {
            imageUrl = await generateImage(sceneData.cuts[0].image_prompt);
            sceneData.cuts[0].image_url = imageUrl;
          }

          // Veo 클립은 백그라운드 생성 — 씬은 이미지로 즉시 진행, 클립이 준비되면 릴에서 자동 교체
          if (imageUrl) {
            sceneData.cuts[0].video_url = null;
            startBackgroundVeo(0, sceneData.cuts[0].image_prompt, imageUrl);
          }
        } catch (imgError) {
          console.error('Image or video generation failed, falling back to text card', imgError);
          sceneData.cuts[0].image_url = null;
          sceneData.cuts[0].video_url = null;
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
      const nextSceneData = await generateNextScene(bible, currentStorySummary, userTwist, scenes.length + 1, scenes[scenes.length - 1]);
      nextSceneData.user_twist = userTwist;
      nextSceneData.image_url = null;

      // Step 2: 이미지 및 비디오(Veo) 생성
      if (nextSceneData.cuts && nextSceneData.cuts.length > 0 && nextSceneData.cuts[0].image_prompt) {
        setLoadingText('스튜디오 촬영 중... (이미지 생성)');
        try {
          const imageUrl = await generateImage(nextSceneData.cuts[0].image_prompt, scenes[scenes.length - 1]?.cuts?.[0]?.image_url);
          nextSceneData.cuts[0].image_url = imageUrl;

          // Veo 클립은 백그라운드 생성 — 릴레이 턴은 이미지로 즉시 진행
          if (imageUrl) {
            nextSceneData.cuts[0].video_url = null;
            startBackgroundVeo(scenes.length, nextSceneData.cuts[0].image_prompt, imageUrl);
          }
        } catch (imgError) {
          console.error('Image or video generation failed, falling back to text card', imgError);
          nextSceneData.cuts[0].image_url = null;
          nextSceneData.cuts[0].video_url = null;
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
      veoRunRef.current += 1
      setStage('SEED')
      setBible(null)
      setScenes([])
      setCurrentSceneIndex(0)
      setIsDemoMode(false)
      setUserTwist('')
      setUploadedImage(null)
      setUploadedImagePreview(null)
      setIsGeneratingVeo(false)
      setVeoVideoUrl(null)
      localStorage.removeItem('reels_drama_state')
    }
  }

  const handleGenerateVeoHighlight = async () => {
    if (scenes.length === 0) return;
    const lastScene = scenes[scenes.length - 1];
    if (!lastScene.cuts || lastScene.cuts.length === 0) return;

    const lastCut = lastScene.cuts[0];
    const imagePrompt = lastCut.image_prompt;
    const imageBase64 = lastCut.image_url;

    setIsGeneratingVeo(true);
    setVeoVideoUrl(null);

    try {
      const videoUrl = await generateHighlightVideo(imagePrompt, imageBase64);
      setVeoVideoUrl(videoUrl);
    } catch (err) {
      console.error('Failed to generate Veo highlight video:', err);
    } finally {
      setIsGeneratingVeo(false);
    }
  };

  // M4: Canvas 비디오 렌더링 및 MediaRecorder 레코딩 로직
  useEffect(() => {
    let animationFrameId;
    let recorder;
    let stream;
    let active = true;
    const loadedVideos = {}; // 씬 인덱스 → 프리로드된 Veo <video> 엘리먼트

    if (stage !== 'REELS') {
      return;
    }

    const canvas = document.getElementById('reels-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 비디오 녹화 시작 함수
    const startCanvasReels = async () => {
      setIsCompilingVideo(true);

      setVideoCompilationText('🎬 비디오 상영용 원본 프레임 인화 중 (이미지 다운로드)...');

      // 1. 모든 에피소드 이미지 프리로드 (CORS 회피용 crossOrigin 적용)
      const loadedImages = {};
      const loadPromises = scenes.map((scene, idx) => {
        return new Promise((resolve) => {
          const cut = scene.cuts[0];
          if (!cut || !cut.image_url) {
            resolve(null);
            return;
          }
          const img = new Image();
          img.crossOrigin = 'anonymous'; // 타락한 캔버스(tainted canvas) 보안 에러 회피용
          img.src = cut.image_url;
          img.onload = () => resolve({ idx, img });
          img.onerror = () => resolve(null);
        });
      });

      const loadedList = await Promise.all(loadPromises);
      loadedList.forEach(item => {
        if (item) {
          loadedImages[item.idx] = item.img;
        }
      });

      // 1-b. Veo 클립 프리로드 (video_url 있는 컷만) — muted/playsInline 없으면 자동재생이 차단됨
      const videoPromises = scenes.map((scene, idx) => {
        return new Promise((resolve) => {
          const cut = scene.cuts && scene.cuts[0];
          if (!cut || !cut.video_url) {
            resolve(null);
            return;
          }
          const video = document.createElement('video');
          video.muted = true;
          video.playsInline = true;
          video.loop = true;
          video.preload = 'auto';
          video.onloadeddata = () => resolve({ idx, video });
          video.onerror = () => resolve(null);
          setTimeout(() => resolve(null), 8000); // 로드 행 방지 — 8초 내 준비 안 되면 이미지로 재생
          video.src = cut.video_url;
        });
      });
      const loadedVideoList = await Promise.all(videoPromises);
      loadedVideoList.forEach(item => {
        if (item) {
          loadedVideos[item.idx] = item.video;
        }
      });

      if (!active) return;
      setIsCompilingVideo(false);

      // 2. MediaRecorder 셋업 (캔버스에서 초당 30프레임 스트림 캡처)
      try {
        stream = canvas.captureStream(30);
        let options = { mimeType: 'video/webm;codecs=vp9' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: 'video/webm' };
        }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: 'video/mp4' };
        }

        const chunks = [];
        recorder = new MediaRecorder(stream, options);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const videoUrl = URL.createObjectURL(blob);
          setRecordedVideoUrl(videoUrl);
          setShowEndingCard(true);
        };

        recorder.start();
      } catch (err) {
        console.error('Failed to start MediaRecorder', err);
      }

      // 3. 애니메이션 그리기 루프
      const totalDuration = scenes.length * 3500; // 화수당 3.5초
      let startTime = null;

      const wrapText = (text, x, y, maxWidth, lineHeight) => {
        const words = text.split(' ');
        let line = '';
        let lines = [];

        for (let n = 0; n < words.length; n++) {
          let testLine = line + words[n] + ' ';
          let metrics = ctx.measureText(testLine);
          let testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        const startY = y - ((lines.length - 1) * lineHeight) / 2;
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i].trim(), x, startY + i * lineHeight);
        }
      };

      const loop = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        if (elapsed >= totalDuration) {
          // 녹화 정지
          if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
          }
          return;
        }

        const currentSceneIdx = Math.floor(elapsed / 3500);
        const sceneElapsed = elapsed % 3500;
        const progressPct = sceneElapsed / 3500;

        // 리액트 사이드 상태 변수 동기화
        setReelsIndex(currentSceneIdx);

        const scene = scenes[currentSceneIdx];

        // 캔버스 초기화
        ctx.clearRect(0, 0, 720, 1280);

        // 1. 배경 그리기 — 씬 마지막 FADE_MS 동안 다음 컷이 겹치며 하나의 흐름처럼 이어진다
        const FADE_MS = 700;
        const fadeActive = sceneElapsed > 3500 - FADE_MS && currentSceneIdx + 1 < scenes.length;

        // 비디오 재생 제어 (크로스페이드 중엔 다음 컷 비디오도 미리 재생)
        Object.keys(loadedVideos).forEach(idx => {
          const n = Number(idx);
          const video = loadedVideos[idx];
          const shouldPlay = n === currentSceneIdx || (fadeActive && n === currentSceneIdx + 1);
          if (shouldPlay) {
            if (video.paused) {
              video.play().catch(e => console.error("Video play error:", e));
            }
          } else if (!video.paused) {
            video.pause();
            video.currentTime = 0;
          }
        });

        const isRealStyle = bible && (bible.visual_style.includes('live-action') || bible.visual_style.includes('photorealistic'));
        const drawCut = (idx, alpha, progress) => {
          const sceneToDraw = scenes[idx];
          if (!sceneToDraw) return;
          ctx.save();
          ctx.globalAlpha = alpha;
          if (loadedVideos[idx]) {
            ctx.translate(360, 640);
            ctx.drawImage(loadedVideos[idx], -360, -640, 720, 1280);
          } else if (loadedImages[idx]) {
            const scale = 1.0 + progress * 0.12; // 12% 줌인
            const w = 720 * scale;
            const h = 1280 * scale;
            ctx.translate(360, 640);
            ctx.drawImage(loadedImages[idx], -w / 2, -h / 2, w, h);
          } else {
            // 폴백 텍스트 카드
            ctx.fillStyle = '#0e0e11';
            ctx.fillRect(0, 0, 720, 1280);
            ctx.fillStyle = '#E2E2E8';
            ctx.font = '28px sans-serif';
            ctx.textAlign = 'center';
            wrapText(sceneToDraw.narration, 360, 640, 640, 44);
          }
          ctx.restore();
          // 암전 오버레이 (알파 동기화)
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = isRealStyle ? 'rgba(0, 0, 0, 0.22)' : 'rgba(0, 0, 0, 0.42)';
          ctx.fillRect(0, 0, 720, 1280);
          ctx.restore();
        };

        drawCut(currentSceneIdx, 1, progressPct);
        if (fadeActive) {
          const t = (sceneElapsed - (3500 - FADE_MS)) / FADE_MS;
          drawCut(currentSceneIdx + 1, Math.min(1, t), 0);
        }

        // 2. 씬 전환 시 에피소드 오버레이 (첫 1초 페이드아웃)
        if (sceneElapsed < 1000) {
          const alpha = 1.0 - (sceneElapsed / 1000);
          ctx.fillStyle = `rgba(0, 0, 0, ${0.85 * alpha})`;
          ctx.fillRect(0, 0, 720, 1280);

          ctx.fillStyle = `rgba(255, 46, 147, ${alpha})`;
          ctx.font = 'bold 36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(scene.scene_title, 360, 600);

          ctx.fillStyle = `rgba(180, 180, 180, ${alpha})`;
          ctx.font = 'italic 24px sans-serif';
          ctx.fillText(`"${scene.user_twist}"`, 360, 660);
        }

        // 3. 인스타그램형 진행바 상단 렌더링
        const segmentWidth = (720 - 32 - (scenes.length - 1) * 6) / scenes.length;
        for (let i = 0; i < scenes.length; i++) {
          const segX = 16 + i * (segmentWidth + 6);
          const segY = 24;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(segX, segY, segmentWidth, 4);

          if (i < currentSceneIdx) {
            ctx.fillStyle = '#FFF';
            ctx.fillRect(segX, segY, segmentWidth, 4);
          } else if (i === currentSceneIdx) {
            ctx.fillStyle = '#FFF';
            ctx.fillRect(segX, segY, segmentWidth * progressPct, 4);
          }
        }

        // 4. 자막 오버레이 하단 렌더링
        const gradient = ctx.createLinearGradient(0, 1280 - 260, 0, 1280);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 1280 - 260, 720, 260);

        if (scene.dialogues && scene.dialogues.length > 0) {
          const d = scene.dialogues[0];
          const char = bible.characters.find(c => c.id === d.character_id);
          const speakerName = char ? char.name : d.character_id;

          ctx.fillStyle = '#FF2E93';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(speakerName, 360, 1280 - 150);

          ctx.fillStyle = '#FFF';
          ctx.font = 'bold 32px sans-serif';
          ctx.fillText(`"${d.line}"`, 360, 1280 - 90);
        } else {
          ctx.fillStyle = '#E2E2E8';
          ctx.font = 'bold 28px sans-serif';
          ctx.textAlign = 'center';
          wrapText(scene.narration, 360, 1280 - 120, 640, 38);
        }

        if (active) {
          animationFrameId = requestAnimationFrame(loop);
        }
      };

      animationFrameId = requestAnimationFrame(loop);
    };

    startCanvasReels();

    return () => {
      active = false;
      cancelAnimationFrame(animationFrameId);
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      // 모든 재생 중인 비디오 정지 및 리소스 클린업
      Object.values(loadedVideos).forEach(video => {
        try {
          video.pause();
          video.src = "";
          video.load();
        } catch (e) {}
      });
    };
    // 의존성은 stage만: 재생 도중 백그라운드 Veo 클립 도착(setScenes)으로
    // 릴/녹화가 처음부터 재시작되는 버그 방지. 재생 시작 시점의 scenes 스냅샷을 사용한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

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
            <div className="poster-badge" style={{ background: visualStyleType === 'real' ? '#E63946' : 'var(--border-color)' }}>
              {visualStyleType === 'real' ? '🎬 ULTRA REALISTIC K-DRAMA' : '🧸 MANNEQUIN DIORAMA'}
            </div>
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
          
          <div className="input-group" style={{ marginTop: '16px' }}>
            <label className="input-label">📸 참고 캐릭터/레퍼런스 이미지 업로드 (선택)</label>
            <div className="image-upload-wrapper" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '16px',
              alignItems: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}>
              {uploadedImagePreview ? (
                <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img 
                    src={uploadedImagePreview} 
                    alt="Upload Preview" 
                    style={{ maxHeight: '180px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)' }} 
                  />
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedImage(null);
                      setUploadedImagePreview(null);
                    }}
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '-10px',
                      background: '#FF2E93',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    ✕
                  </button>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>{
                    visualStyleType === 'real'
                      ? '🤖 이미지 분석 완료! 드라마 주인공 배우의 패션, 복장 및 헤어스타일 정보가 완벽하게 실사풍 드라마에 직접 매핑됩니다.'
                      : '🤖 이미지 분석 완료! 드라마 캐릭터의 복장과 머리스타일이 실제 인형으로 매핑됩니다.'
                  }</span>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                  <span style={{ fontSize: '24px', marginBottom: '6px' }}>📁</span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>이곳을 눌러 이미지를 업로드하세요</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{
                    visualStyleType === 'real'
                      ? 'PNG, JPG 지원 | 이미지 속 주인공 배우의 패션, 복장 및 비주얼이 실사 드라마 화풍에 연동되어 전개됩니다!'
                      : 'PNG, JPG 지원 | 이미지 속 인물의 의상과 머리스타일이 실제 드라마 인형으로 정교하게 구현됩니다!'
                  }</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setUploadedImage(reader.result);
                          setUploadedImagePreview(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
              )}
            </div>
          </div>

          {/* 🍿 추천 마라맛 시연 시나리오 카드 */}
          <div className="preset-seeds">
            <span className="preset-label">🔥 추천 막장 드라마 시나리오</span>
            <div className="preset-cards">
              <button 
                type="button" 
                className="preset-card" 
                onClick={() => setSeed(
                  visualStyleType === 'real'
                    ? '기억상실증에 걸린 재벌 3세와 사실은 출생의 비밀을 숨긴 편의점 알바생의 계약연애'
                    : '기억상실증에 걸린 재벌 3세 목각인형과 사실은 출생의 비밀을 숨긴 편의점 알바인형'
                )}
              >
                <span className="preset-emoji">☕</span>
                <span className="preset-text">막장 오피스 로맨스</span>
              </button>
              <button 
                type="button" 
                className="preset-card" 
                onClick={() => setSeed(
                  visualStyleType === 'real'
                    ? '외계인 비밀요원들이 지구를 정복하기 위해 주막집을 개업하며 벌어지는 코미디'
                    : '외계인 목각인형 비밀요원들이 지구를 정복하기 위해 주막집을 개업하며 벌어지는 일'
                )}
              >
                <span className="preset-emoji">🛸</span>
                <span className="preset-text">SF 개그 요리액션</span>
              </button>
              <button 
                type="button" 
                className="preset-card" 
                onClick={() => setSeed(
                  visualStyleType === 'real'
                    ? '조선시대 주막집의 한량으로 회귀한 천재 요리사의 화려한 복수극'
                    : '조선시대 주막집의 목각 인형으로 회귀한 천재 요리사의 화려한 복수극'
                )}
              >
                <span className="preset-emoji">⚔️</span>
                <span className="preset-text">퓨전 사극 회귀물</span>
              </button>
            </div>
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
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                type="button" 
                className="btn-play-reels"
                onClick={() => {
                  setReelsIndex(0);
                  setShowEndingCard(false);
                  setStage('REELS');
                }}
              >
                {(() => {
                  const totalCuts = scenes.filter(s => s.cuts && s.cuts[0] && s.cuts[0].image_url).length;
                  const readyClips = scenes.filter(s => s.cuts && s.cuts[0] && s.cuts[0].video_url).length;
                  if (totalCuts > 0 && readyClips >= totalCuts) return '🎬 프리미어 상영 (전편 영상 완성)';
                  if (totalCuts > 0) return `▶ 릴 재생 · 영상 ${readyClips}/${totalCuts} 촬영 중`;
                  return '▶ 릴 재생';
                })()}
              </button>
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
              {/* 👥 출연 인물 프로필 태그 */}
              <div className="characters-profile-row">
                <span className="profile-label">👥 인물 관계도</span>
                <div className="profile-tags">
                  {bible.characters.map((c) => (
                    <div key={c.id} className="profile-tag">
                      <span className="profile-tag-name">{c.name}</span>
                      <span className="profile-tag-desc">{c.marker} ({c.personality})</span>
                    </div>
                  ))}
                </div>
              </div>

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
              {/* 🤫 K-드라마 꿀팁 연출 지시카드 */}
              <div className="twist-cheat-sheet">
                <span className="cheat-label">💡 추천 전개 치트키:</span>
                <div className="cheat-items">
                  <button 
                    type="button" 
                    className="cheat-item" 
                    onClick={() => setUserTwist('사실 두 사람의 부모가 예전에 엄청난 은원 관계로 얽힌 남매였다는 사실이 밝혀짐!')}
                  >
                    🤫 출생의 비밀
                  </button>
                  <button 
                    type="button" 
                    className="cheat-item" 
                    onClick={() => {
                      const isRealStyle = bible && (bible.visual_style.includes('live-action') || bible.visual_style.includes('photorealistic'));
                      setUserTwist(`${isRealStyle ? '주인공' : '인형'}이 뒷걸음질 치다 바나나 껍질을 밟고 머리를 다쳐 갑자기 기억상실증에 걸려버림!`);
                    }}
                  >
                    🍌 기억상실증
                  </button>
                  <button 
                    type="button" 
                    className="cheat-item" 
                    onClick={() => {
                      const isRealStyle = bible && (bible.visual_style.includes('live-action') || bible.visual_style.includes('photorealistic'));
                      setUserTwist(`하늘에서 전설의 황금 레이저가 발사되며 ${isRealStyle ? '주인공' : '인형'}에게 특별한 마법 초능력이 각성됨!`);
                    }}
                  >
                    ⚡ 초능력 각성
                  </button>
                  <button 
                    type="button" 
                    className="cheat-item" 
                    onClick={() => {
                      const isRealStyle = bible && (bible.visual_style.includes('live-action') || bible.visual_style.includes('photorealistic'));
                      setUserTwist(`사실 이 모든 일들은 밤중에 졸고 있던 ${isRealStyle ? '드라마 작가' : '인형가게 주인'}의 엉뚱한 꿈이었음이 밝혀짐!`);
                    }}
                  >
                    💤 개꿈 아시발꿈
                  </button>
                </div>
              </div>

              <textarea 
                className="relay-textarea"
                placeholder={bible && (bible.visual_style.includes('live-action') || bible.visual_style.includes('photorealistic')) ? "주인공들의 다음 행보를 한 줄로 개입하세요..." : "인형들의 다음 행보를 한 줄로 개입하세요..."}
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

      {/* 3. 완성 릴 재생 및 비디오 저장 화면 */}
      {stage === 'REELS' && bible && scenes.length > 0 && (
        <section className="stage-reels">
          {/* 재생 닫기 버튼 */}
          <button 
            type="button" 
            className="btn-close-reels"
            onClick={() => {
              setRecordedVideoUrl(null);
              setShowEndingCard(false);
              setStage('SCENE');
            }}
          >
            ✕
          </button>

          {/* 인화 & 렌더링용 실시간 레코딩 캔버스 */}
          <canvas 
            id="reels-canvas" 
            width="720" 
            height="1280" 
            style={{ display: (isCompilingVideo || showEndingCard) ? 'none' : 'block' }}
            className="reels-render-canvas"
          />

          <div className="reels-viewport">
            {isCompilingVideo && (
              <div className="reels-compiling-loader">
                <div className="spinner"></div>
                <p className="compiling-text">{videoCompilationText}</p>
              </div>
            )}

            {showEndingCard && (
              /* 비디오 제작 완결 엔딩 카드 및 실제 MP4/WebM 다운로드 */
              <div className="reels-ending-card">
                <span className="ending-logo">🎬</span>
                <h2 className="ending-title">오늘의 숏폼 영상 제작 완료!</h2>
                <p className="ending-sub">총 {scenes.length}개의 전개가 완벽한 9:16 세로형 동영상 파일로 결합 인화되었습니다.</p>
                
                {recordedVideoUrl ? (
                  <div className="video-preview-box">
                    <p className="preview-label">🎬 실시간 인코딩된 실제 동영상 미리보기:</p>
                    <video 
                      src={recordedVideoUrl} 
                      controls 
                      autoPlay 
                      loop 
                      className="reels-video-preview"
                    />
                    <a 
                      href={recordedVideoUrl} 
                      download={`${bible.title.replace(/\s+/g, '_')}_final.webm`} 
                      className="btn btn-primary btn-download-video"
                    >
                      📥 실제 동영상 파일 다운로드 (.webm)
                    </a>
                  </div>
                ) : (
                  <p className="compiling-text">🎥 동영상 인코딩 중...</p>
                )}

                {isGeneratingVeo && (
                  <div className="veo-generating-loader" style={{ margin: '20px 0', padding: '16px', background: 'rgba(255,46,147,0.1)', borderRadius: '12px', border: '1px dashed #FF2E93', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
                    <div className="spinner" style={{ borderColor: '#FF2E93', borderTopColor: 'transparent', width: '24px', height: '24px', borderWidth: '3px' }}></div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#FF2E93' }}>🎬 Veo가 촬영 중... (1~2분 소요)</p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>마지막 장면 프레임과 물리 벡터 분석 중입니다.</p>
                  </div>
                )}

                {veoVideoUrl && (
                  <div className="veo-video-box" style={{ margin: '20px 0', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', width: '100%', boxSizing: 'border-box' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 'bold', color: '#FF2E93', textAlign: 'left' }}>✨ Veo AI 하이라이트 영상 (움직이는 비디오):</p>
                    <video 
                      src={veoVideoUrl} 
                      controls 
                      autoPlay 
                      loop 
                      style={{ width: '100%', borderRadius: '8px', boxShadow: '0 0 15px rgba(255, 46, 147, 0.4)' }}
                    />
                  </div>
                )}

                {!isGeneratingVeo && !veoVideoUrl && (
                  <button 
                    type="button"
                    style={{
                      background: 'linear-gradient(135deg, #FF2E93 0%, #FF8E53 100%)',
                      boxShadow: '0 0 15px rgba(255, 46, 147, 0.5)',
                      border: 'none',
                      height: '44px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      marginTop: '20px',
                      transition: 'opacity 0.2s'
                    }}
                    onClick={handleGenerateVeoHighlight}
                  >
                    ✨ 하이라이트를 영상으로 (Veo AI)
                  </button>
                )}

                <div className="ending-button-group" style={{ marginTop: '20px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setRecordedVideoUrl(null);
                      setShowEndingCard(false);
                      setStage('SCENE');
                    }}
                  >
                    ✍️ 계속 공동 창작하기
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-back-seed"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', height: '40px', borderRadius: '8px', cursor: 'pointer' }}
                    onClick={resetDrama}
                  >
                    🔁 새 드라마 시작하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default App
