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
      const nextSceneData = await generateNextScene(bible, currentStorySummary, userTwist, scenes.length + 1);
      nextSceneData.user_twist = userTwist;
      nextSceneData.image_url = null;

      // Step 2: 이미지 및 비디오(Veo) 생성
      if (nextSceneData.cuts && nextSceneData.cuts.length > 0 && nextSceneData.cuts[0].image_prompt) {
        setLoadingText('스튜디오 촬영 중... (이미지 생성)');
        try {
          const imageUrl = await generateImage(nextSceneData.cuts[0].image_prompt);
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

      // 🌟 실사풍 목각인형 마리오네트 관절 드로잉 유틸리티
      const drawPuppet = (x, y, pose, scale, isSpeaking, name, isMale, colorTheme, hairStyle, outfitType) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        let elapsedOffset = Date.now();
        let breathY = Math.sin(elapsedOffset * 0.003) * 3;
        let breathAngle = Math.sin(elapsedOffset * 0.002) * 0.02;

        let headRot = breathAngle;
        let jawY = 0;
        let leftArmAngle = 0.2;
        let rightArmAngle = -0.2;
        let leftLegAngle = 0;
        let rightLegAngle = 0;
        let bodyY = breathY;
        let rotation = 0;

        // 대본 전개에 따른 움직임 및 포즈 가중치 산출
        if (pose === 'talking') {
          headRot += Math.sin(elapsedOffset * 0.015) * 0.08;
          jawY = Math.abs(Math.sin(elapsedOffset * 0.022)) * 14; // 실시간 턱 움직임 (말하기 싱크)
          // 말할 때 팔을 위아래로 힘차게 지으며 대화 표현
          rightArmAngle = -1.2 + Math.sin(elapsedOffset * 0.012) * 0.4;
          leftArmAngle = 0.3 + Math.cos(elapsedOffset * 0.01) * 0.2;
        } else if (pose === 'walking') {
          bodyY += Math.abs(Math.sin(elapsedOffset * 0.01)) * 12;
          leftLegAngle = Math.sin(elapsedOffset * 0.01) * 0.6;
          rightLegAngle = -Math.sin(elapsedOffset * 0.01) * 0.6;
          leftArmAngle = -Math.sin(elapsedOffset * 0.01) * 0.5;
          rightArmAngle = Math.sin(elapsedOffset * 0.01) * 0.5;
        } else if (pose === 'shocked') {
          bodyY += (Math.random() - 0.5) * 6; // 부들부들 떠는 연출
          headRot = -0.15 + (Math.random() - 0.5) * 0.05;
          leftArmAngle = -2.2 + Math.sin(elapsedOffset * 0.05) * 0.3; // 손을 위로 들고 바르르 떨기
          rightArmAngle = 2.2 + Math.cos(elapsedOffset * 0.05) * 0.3;
        } else if (pose === 'sad') {
          headRot = 0.25; // 고개 떨굼
          leftArmAngle = -1.5; // 손으로 얼굴 가리기
          rightArmAngle = -1.6;
          bodyY += breathY * 1.5;
        } else if (pose === 'fainted') {
          rotation = -Math.PI / 2; // 쓰러짐
          bodyY = 180;
          leftArmAngle = 1.0;
          rightArmAngle = -1.0;
          leftLegAngle = 0.3;
          rightLegAngle = -0.3;
        }

        // 전체 회전 적용 (쓰러질 때 등)
        ctx.rotate(rotation);
        ctx.translate(0, bodyY);

        const drawSegment = (width, height, radius, strokeColor, startCol, endColor) => {
          const grad = ctx.createLinearGradient(-width/2, 0, width/2, 0);
          grad.addColorStop(0, startCol);
          grad.addColorStop(0.4, '#eec891');
          grad.addColorStop(1, endColor);
          ctx.fillStyle = grad;
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1.5;
          
          ctx.beginPath();
          ctx.roundRect(-width/2, 0, width, height, radius);
          ctx.fill();
          ctx.stroke();
        };

        const drawJoint = (cx, cy, radius) => {
          ctx.beginPath();
          const jGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, radius);
          jGrad.addColorStop(0, '#d1985a');
          jGrad.addColorStop(1, '#613b1a');
          ctx.fillStyle = jGrad;
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        };

        // 1. 다리 그리기 (몸통 뒤에 위치하도록 먼저 렌더링)
        // 왼다리
        ctx.save();
        ctx.translate(-24, 75);
        ctx.rotate(leftLegAngle);
        drawSegment(14, 50, 6, '#422812', '#b88555', '#6b431e'); // 허벅지
        drawJoint(0, 50, 6);
        ctx.translate(0, 50);
        ctx.rotate(0.1);
        drawSegment(12, 50, 5, '#422812', '#b88555', '#6b431e'); // 종아리
        ctx.restore();

        // 오른다리
        ctx.save();
        ctx.translate(24, 75);
        ctx.rotate(rightLegAngle);
        drawSegment(14, 50, 6, '#422812', '#b88555', '#6b431e');
        drawJoint(0, 50, 6);
        ctx.translate(0, 50);
        ctx.rotate(-0.1);
        drawSegment(12, 50, 5, '#422812', '#b88555', '#6b431e');
        ctx.restore();

        // 2. 몸통 (Body) - 의상 종류에 따른 커스텀 패브릭/디테일 렌더링
        ctx.save();
        if (outfitType === 'black_suit') {
          // 🕴️ 정장/오피스룩
          ctx.fillStyle = '#1C1C1E';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-35, -70);
          ctx.bezierCurveTo(-38, -20, -32, 40, -28, 75);
          ctx.lineTo(28, 75);
          ctx.bezierCurveTo(32, 40, 38, -20, 35, -70);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 흰 셔츠 깃
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(-12, -70);
          ctx.lineTo(12, -70);
          ctx.lineTo(0, -42);
          ctx.closePath();
          ctx.fill();

          // 빨간 넥타이
          ctx.fillStyle = '#E63946';
          ctx.beginPath();
          ctx.moveTo(-3, -48);
          ctx.lineTo(3, -48);
          ctx.lineTo(5, -15);
          ctx.lineTo(0, -5);
          ctx.lineTo(-5, -15);
          ctx.closePath();
          ctx.fill();

          // 정장 깃 라인
          ctx.strokeStyle = '#3A3A3C';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-12, -70);
          ctx.lineTo(-24, -40);
          ctx.lineTo(0, -10);
          ctx.moveTo(12, -70);
          ctx.lineTo(24, -40);
          ctx.lineTo(0, -10);
          ctx.stroke();

        } else if (outfitType === 'blue_apron') {
          // 👕 편의점 알바 앞치마
          // 배경 티셔츠 (흰색)
          ctx.fillStyle = '#F2F2F7';
          ctx.strokeStyle = '#AEAEB2';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-35, -70);
          ctx.bezierCurveTo(-38, -20, -32, 40, -28, 75);
          ctx.lineTo(28, 75);
          ctx.bezierCurveTo(32, 40, 38, -20, 35, -70);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 파란 앞치마
          ctx.fillStyle = '#007AFF';
          ctx.strokeStyle = '#0056B3';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-20, -60);
          ctx.lineTo(20, -60);
          ctx.lineTo(25, 75);
          ctx.lineTo(-25, 75);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 앞치마 주머니 및 어깨 끈
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-12, 10, 24, 25); // 주머니
          ctx.beginPath();
          ctx.moveTo(-20, -60);
          ctx.lineTo(-30, -70);
          ctx.moveTo(20, -60);
          ctx.lineTo(30, -70);
          ctx.stroke();

        } else if (outfitType === 'red_dress') {
          // 👗 럭셔리 레드 드레스
          const dressGrad = ctx.createLinearGradient(-35, -70, 35, 75);
          dressGrad.addColorStop(0, '#E63946');
          dressGrad.addColorStop(0.5, '#D62828');
          dressGrad.addColorStop(1, '#9B2226');
          ctx.fillStyle = dressGrad;
          ctx.strokeStyle = '#640D14';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-25, -70);
          ctx.bezierCurveTo(-35, -30, -38, 20, -32, 75);
          ctx.lineTo(32, 75);
          ctx.bezierCurveTo(38, 20, 35, -30, 25, -70);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 레이스/데코 라인
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-25, -70);
          ctx.bezierCurveTo(0, -50, 0, -50, 25, -70);
          ctx.stroke();

        } else if (outfitType === 'white_coat') {
          // 🥼 전문 의사 가운
          // 안쪽 옷 (네이비 셔츠)
          ctx.fillStyle = '#1D3557';
          ctx.beginPath();
          ctx.moveTo(-35, -70);
          ctx.bezierCurveTo(-38, -20, -32, 40, -28, 75);
          ctx.lineTo(28, 75);
          ctx.bezierCurveTo(32, 40, 38, -20, 35, -70);
          ctx.closePath();
          ctx.fill();

          // 흰색 의사 가운 외투
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#D1D1D6';
          ctx.lineWidth = 2;
          ctx.beginPath();
          // 왼쪽 외투 절반
          ctx.moveTo(-35, -70);
          ctx.lineTo(-10, -70);
          ctx.lineTo(-5, 75);
          ctx.lineTo(-28, 75);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          // 오른쪽 외투 절반
          ctx.moveTo(35, -70);
          ctx.lineTo(10, -70);
          ctx.lineTo(5, 75);
          ctx.lineTo(28, 75);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // 청진기 목에 걸기
          ctx.strokeStyle = '#4A4A4A';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, -65, 14, 0, Math.PI);
          ctx.stroke();

        } else if (outfitType === 'casual') {
          // 🧥 캐주얼 핑크 후디
          const hoodieGrad = ctx.createLinearGradient(-35, -70, 35, 75);
          hoodieGrad.addColorStop(0, '#FF4D6D');
          hoodieGrad.addColorStop(1, '#C71F37');
          ctx.fillStyle = hoodieGrad;
          ctx.strokeStyle = '#800F2F';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-35, -70, 70, 145, 12);
          ctx.fill();
          ctx.stroke();

          // 후디 주머니
          ctx.fillStyle = '#FF758F';
          ctx.beginPath();
          ctx.roundRect(-18, 20, 36, 30, 6);
          ctx.fill();
          ctx.stroke();
        } else {
          // 기본 원목 피규어 질감
          const bodyGrad = ctx.createLinearGradient(-35, 0, 35, 0);
          bodyGrad.addColorStop(0, '#754b22');
          bodyGrad.addColorStop(0.3, '#d39e62');
          bodyGrad.addColorStop(0.7, '#fcd6a1');
          bodyGrad.addColorStop(1, '#825327');
          ctx.fillStyle = bodyGrad;
          ctx.strokeStyle = '#422812';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-35, -70);
          ctx.bezierCurveTo(-38, -20, -32, 40, -28, 75);
          ctx.lineTo(28, 75);
          ctx.bezierCurveTo(32, 40, 38, -20, 35, -70);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();

        // 가슴팍의 캐릭터 전용 네온 마커 엠블럼 데코레이션
        ctx.fillStyle = colorTheme || '#FF2E93';
        ctx.shadowColor = colorTheme || '#FF2E93';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, -30, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 3. 목 관절 및 머리
        ctx.save();
        ctx.translate(0, -70);
        ctx.rotate(headRot);
        
        // 목 peg
        drawSegment(12, -20, 3, '#422812', '#a07040', '#543618');
        
        // 머리 구체 그리기 전에 뒤로 가는 머리카락 그리기 (포니테일 꼬리, 긴 생머리 뒤쪽)
        if (hairStyle === 'ponytail') {
          // 뒤로 묶은 꽁지머리
          ctx.fillStyle = '#2C1B10';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(25, -30);
          ctx.bezierCurveTo(65, -10, 55, 30, 45, 50);
          ctx.bezierCurveTo(35, 30, 25, 10, 25, -30);
          ctx.fill();
          ctx.stroke();
          
          // 헤어 밴드 (민트색)
          ctx.fillStyle = '#00F0FF';
          ctx.beginPath();
          ctx.arc(28, -24, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (hairStyle === 'long_wavy') {
          // 양옆 찰랑거리는 긴 웨이브
          const wavyGrad = ctx.createLinearGradient(-45, -50, 45, 70);
          wavyGrad.addColorStop(0, '#5C3D24');
          wavyGrad.addColorStop(1, '#2C1B10');
          ctx.fillStyle = wavyGrad;
          ctx.strokeStyle = '#1E1104';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          // 왼쪽 긴머리
          ctx.moveTo(-30, -50);
          ctx.bezierCurveTo(-55, -20, -50, 40, -42, 80);
          ctx.bezierCurveTo(-30, 40, -32, -10, -30, -50);
          // 오른쪽 긴머리
          ctx.moveTo(30, -50);
          ctx.bezierCurveTo(55, -20, 50, 40, 42, 80);
          ctx.bezierCurveTo(30, 40, 32, -10, 30, -50);
          ctx.fill();
          ctx.stroke();
        }

        // 머리 구체 - 둥근 3D 구체 느낌 구형 렌더링
        ctx.translate(0, -20);
        const headGrad = ctx.createRadialGradient(-10, -25, 5, 0, -25, 50);
        headGrad.addColorStop(0, '#fce4be');
        headGrad.addColorStop(0.6, '#cc965e');
        headGrad.addColorStop(1, '#7a4b24');
        ctx.fillStyle = headGrad;
        ctx.strokeStyle = '#422812';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, -25, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 윗머리 & 앞머리 레이어 그리기 (구체 위에 얹음)
        ctx.fillStyle = '#3a2412'; // 기본 다크브라운 헤어
        ctx.strokeStyle = '#1e1104';
        ctx.lineWidth = 1.5;

        if (hairStyle === 'spiky') {
          // ⚡ 스포티 번개 컷 (남자)
          ctx.beginPath();
          ctx.moveTo(-35, -35);
          ctx.lineTo(-40, -60);
          ctx.lineTo(-25, -55);
          ctx.lineTo(-15, -75);
          ctx.lineTo(0, -60);
          ctx.lineTo(15, -75);
          ctx.lineTo(25, -55);
          ctx.lineTo(40, -60);
          ctx.lineTo(35, -35);
          ctx.bezierCurveTo(20, -50, -20, -50, -35, -35);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

        } else if (hairStyle === 'ponytail' || hairStyle === 'short') {
          // 💇 단정한 숏컷 / 포니테일 앞머리
          ctx.beginPath();
          ctx.arc(0, -26, 39, Math.PI, 0); // 윗머리 덮개
          ctx.lineTo(38, -25);
          ctx.lineTo(25, -20); // 잔머리 깃
          ctx.lineTo(10, -32); // 앞머리 갈래
          ctx.lineTo(0, -20);
          ctx.lineTo(-10, -32);
          ctx.lineTo(-25, -20);
          ctx.lineTo(-38, -25);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

        } else if (hairStyle === 'bob_cut') {
          // 💇 귀여운 바가지/단발컷
          ctx.beginPath();
          ctx.arc(0, -24, 40, Math.PI * 1.05, Math.PI * 1.95);
          ctx.lineTo(40, 5); // 단발 귀밑머리 길이 연장
          ctx.lineTo(30, 2);
          ctx.lineTo(15, -20); // 앞머리 뱅 라인
          ctx.lineTo(-15, -20);
          ctx.lineTo(-30, 2);
          ctx.lineTo(-40, 5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

        } else if (hairStyle === 'long_wavy') {
          // 💇 여신 웨이브 앞머리 레이어
          ctx.beginPath();
          ctx.arc(0, -26, 39, Math.PI, 0);
          ctx.lineTo(38, -20);
          ctx.lineTo(15, -15);
          ctx.lineTo(0, -30); // 5:5 가르마
          ctx.lineTo(-15, -15);
          ctx.lineTo(-38, -20);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // 눈
        ctx.fillStyle = '#1e1104';
        ctx.beginPath();
        ctx.arc(-14, -30, 4, 0, Math.PI * 2); // 왼눈
        ctx.arc(14, -30, 4, 0, Math.PI * 2);  // 오른눈
        ctx.fill();
        
        ctx.strokeStyle = '#7a4b24';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(-14, -30, 7, 0, Math.PI * 2);
        ctx.arc(14, -30, 7, 0, Math.PI * 2);
        ctx.stroke();

        // 턱관절 (Jaw) - 대사가 있는 경우 아래위로 열림
        ctx.save();
        ctx.translate(0, jawY);
        const jawGrad = ctx.createLinearGradient(-18, 0, 18, 0);
        jawGrad.addColorStop(0, '#9e6d3f');
        jawGrad.addColorStop(1, '#5e3d1c');
        ctx.fillStyle = jawGrad;
        ctx.strokeStyle = '#422812';
        ctx.beginPath();
        ctx.roundRect(-20, -10, 40, 12, 3);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        if (isSpeaking) {
          ctx.save();
          ctx.shadowColor = '#FF2E93';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#FF2E93';
          ctx.beginPath();
          ctx.moveTo(0, -78);
          ctx.lineTo(-8, -90);
          ctx.lineTo(8, -90);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();
        }
        ctx.restore();

        // 4. 팔 그리기 (몸통 앞으로 렌더링)
        // 왼팔
        ctx.save();
        ctx.translate(-40, -60);
        ctx.rotate(leftArmAngle);
        drawJoint(0, 0, 7);
        drawSegment(12, 45, 5, '#422812', '#d6a06b', '#734620'); // 상완
        drawJoint(0, 45, 5);
        ctx.translate(0, 45);
        ctx.rotate(0.2);
        drawSegment(10, 40, 4, '#422812', '#d6a06b', '#734620'); // 하완 및 손
        ctx.restore();

        // 오른팔
        ctx.save();
        ctx.translate(40, -60);
        ctx.rotate(rightArmAngle);
        drawJoint(0, 0, 7);
        drawSegment(12, 45, 5, '#422812', '#d6a06b', '#734620'); // 상완
        drawJoint(0, 45, 5);
        ctx.translate(0, 45);
        ctx.rotate(-0.2);
        drawSegment(10, 40, 4, '#422812', '#d6a06b', '#734620'); // 하완 및 손
        ctx.restore();

        // 5. 발판 및 이름 장식
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(-60, 85, 120, 20);
        ctx.strokeStyle = '#422812';
        ctx.strokeRect(-60, 85, 120, 20);
        
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name || '목각인형', 0, 99);

        ctx.restore();
      };

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

        // 1. 배경 이미지 그리기
        // 비디오 재생 제어
        Object.keys(loadedVideos).forEach(idx => {
          const video = loadedVideos[idx];
          if (Number(idx) === currentSceneIdx) {
            if (video.paused) {
              video.play().catch(e => console.error("Video play error:", e));
            }
          } else {
            if (!video.paused) {
              video.pause();
              video.currentTime = 0;
            }
          }
        });

        if (loadedVideos[currentSceneIdx]) {
          const video = loadedVideos[currentSceneIdx];
          const w = 720;
          const h = 1280;

          ctx.save();
          ctx.translate(360, 640);
          ctx.drawImage(video, -w / 2, -h / 2, w, h);
          ctx.restore();

          // 무대 느낌의 암전 처리 오버레이 (실사 스타일이면 더 연하게 0.22, 목각인형이면 0.42)
          const isRealStyle = bible && (bible.visual_style.includes('live-action') || bible.visual_style.includes('photorealistic'));
          ctx.fillStyle = isRealStyle ? 'rgba(0, 0, 0, 0.22)' : 'rgba(0, 0, 0, 0.42)';
          ctx.fillRect(0, 0, 720, 1280);
        } else if (loadedImages[currentSceneIdx]) {
          const img = loadedImages[currentSceneIdx];
          
          const scale = 1.0 + progressPct * 0.12; // 12% 줌인
          const w = 720 * scale;
          const h = 1280 * scale;

          ctx.save();
          ctx.translate(360, 640);
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
          ctx.restore();

          // 무대 느낌의 암전 처리 오버레이 (실사 스타일이면 더 연하게 0.22, 목각인형이면 0.42)
          const isRealStyle = bible && (bible.visual_style.includes('live-action') || bible.visual_style.includes('photorealistic'));
          ctx.fillStyle = isRealStyle ? 'rgba(0, 0, 0, 0.22)' : 'rgba(0, 0, 0, 0.42)';
          ctx.fillRect(0, 0, 720, 1280);

          // 2. 실사풍 목각인형 마리오네트 액션 극장 엔진 작동! (대본 전개에 반응)
          let charA = bible.characters[0] || { id: 'char1', name: '인물A', gender: 'M' };
          let charB = bible.characters[1] || { id: 'char2', name: '인물B', gender: 'F' };

          let activeDialogue = scene.dialogues && scene.dialogues[0];
          let speakingCharId = activeDialogue ? activeDialogue.character_id : null;

          // 대사 정보 및 시나리오 텍스트 키워드 기반으로 포즈 결정
          let poseA = 'idle';
          let poseB = 'idle';

          if (speakingCharId === charA.id) {
            poseA = 'talking';
          } else if (speakingCharId === charB.id) {
            poseB = 'talking';
          } else {
            // 대화가 없을 때는 지문의 극적 상황 분석
            let narration = scene.narration || '';
            if (narration.includes('걸어가') || narration.includes('도망') || narration.includes('가다')) {
              poseA = 'walking';
              poseB = 'walking';
            } else if (narration.includes('충격') || narration.includes('깜짝') || narration.includes('비명') || narration.includes('경악') || narration.includes('놀라')) {
              poseA = 'shocked';
              poseB = 'shocked';
            } else if (narration.includes('슬퍼') || narration.includes('우는') || narration.includes('절망')) {
              poseA = 'sad';
              poseB = 'sad';
            }
          }

          // 만약 K-드라마 치트키가 이 장면에 연관되어 있다면 강제 포즈 셋팅
          let twistText = scene.user_twist || '';
          if (twistText.includes('기억상실')) {
            if (speakingCharId === charA.id) poseB = 'shocked';
            else poseA = 'fainted'; // 쓰러짐!
          } else if (twistText.includes('출생')) {
            poseA = 'shocked';
            poseB = 'shocked';
          } else if (twistText.includes('초능력')) {
            poseA = 'shocked';
          }

          // 실사풍 테마가 아닐 때만 2D 목각인형을 캔버스 무대 위에 렌더링
          if (!isRealStyle) {
            // 인형 1 그리기 (좌측)
            drawPuppet(
              200, 
              910, 
              poseA, 
              1.4, 
              speakingCharId === charA.id, 
              charA.name, 
              charA.gender === 'M', 
              '#FF2E93',
              charA.hair_style || 'short',
              charA.outfit_type || 'black_suit'
            );

            // 인형 2 그리기 (우측)
            drawPuppet(
              520, 
              910, 
              poseB, 
              1.4, 
              speakingCharId === charB.id, 
              charB.name, 
              charB.gender === 'M', 
              '#00F0FF',
              charB.hair_style || 'ponytail',
              charB.outfit_type || 'blue_apron'
            );
          }

        } else {
          // 폴백 단색 배경
          ctx.fillStyle = '#0e0e11';
          ctx.fillRect(0, 0, 720, 1280);
          ctx.fillStyle = '#E2E2E8';
          ctx.font = '28px sans-serif';
          ctx.textAlign = 'center';
          wrapText(scene.narration, 360, 640, 640, 44);
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

          {/* 🎭 시각 테마 스타일 선택 카드 */}
          <div className="input-group" style={{ marginTop: '16px' }}>
            <label className="input-label">🎬 비주얼 스타일 테마 선택</label>
            <div className="theme-selectors" style={{
              display: 'flex',
              gap: '12px',
              marginTop: '8px'
            }}>
              <button
                type="button"
                className={`theme-card ${visualStyleType === 'real' ? 'active' : ''}`}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '12px',
                  background: visualStyleType === 'real' ? 'rgba(230, 57, 70, 0.15)' : 'var(--panel-bg)',
                  border: visualStyleType === 'real' ? '2px solid #E63946' : '1px solid var(--border-color)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  setVisualStyleType('real');
                  if (seed === '재벌집 막내인형과 편의점 알바인형의 계약연애' || seed === '기억상실증에 걸린 재벌 3세 목각인형과 사실은 출생의 비밀을 숨긴 편의점 알바인형') {
                    setSeed('재벌집 막내아들과 편의점 알바생의 계약연애');
                  }
                }}
              >
                <span style={{ fontSize: '24px' }}>🎬</span>
                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>초실사 K-드라마</span>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>실사 배우풍 고화질</span>
              </button>
              <button
                type="button"
                className={`theme-card ${visualStyleType === 'mannequin' ? 'active' : ''}`}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '12px',
                  background: visualStyleType === 'mannequin' ? 'rgba(255, 46, 147, 0.15)' : 'var(--panel-bg)',
                  border: visualStyleType === 'mannequin' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  setVisualStyleType('mannequin');
                  if (seed === '재벌집 막내아들과 편의점 알바생의 계약연애' || seed === '기억상실증에 걸린 재벌 3세와 사실은 출생의 비밀을 숨긴 편의점 알바생') {
                    setSeed('재벌집 막내인형과 편의점 알바인형의 계약연애');
                  }
                }}
              >
                <span style={{ fontSize: '24px' }}>🧸</span>
                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>목각인형 극장</span>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>관절 인형 디오라마</span>
              </button>
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
                ▶ 릴 재생
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
