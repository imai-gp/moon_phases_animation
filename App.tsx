import React, { useState, useEffect, useRef, useCallback } from 'react';
import { OrbitVisualizer } from './components/OrbitVisualizer';
import { MoonView } from './components/MoonView';
import { Controls } from './components/Controls';
import { getPhaseInfo } from './utils/moonMath';
import { Star } from './types';
import { Download, MessageCircle, Loader2 } from 'lucide-react';
import { exportSVG, generateGIF, svgToCanvas } from './services/exportService';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [angle, setAngle] = useState<number>(0); // 0 to 360
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(0.5);
  const [stars, setStars] = useState<Star[]>([]);
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  
  // Gemini Integration State
  const [geminiExplanation, setGeminiExplanation] = useState<string | null>(null);
  const [loadingGemini, setLoadingGemini] = useState(false);

  // Generate stars once
  useEffect(() => {
    const newStars = Array.from({ length: 50 }, () => ({
      x: Math.random() * 400,
      y: Math.random() * 400,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.2
    }));
    setStars(newStars);
  }, []);

  // Animation Loop
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      setAngle(prevAngle => (prevAngle + (speed * deltaTime * 0.05)) % 360);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [speed]);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = undefined;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, animate]);

  const handleAngleChange = (newAngle: number) => {
    setIsPlaying(false);
    setAngle(newAngle);
    setGeminiExplanation(null); // Clear custom explanation on change
  };

  // Current Phase Info
  const phaseInfo = getPhaseInfo(angle);

  // Download Handlers
  const handleDownloadSVG = () => {
    const orbitSvg = document.getElementById('orbit-svg') as unknown as SVGSVGElement;
    const phaseSvg = document.getElementById('phase-svg') as unknown as SVGSVGElement;
    
    if (orbitSvg) exportSVG(orbitSvg, 'orbit-view.svg');
    if (phaseSvg) setTimeout(() => exportSVG(phaseSvg, 'moon-view.svg'), 200);
  };

  const handleDownloadGIF = async () => {
    setIsPlaying(false);
    setIsGeneratingGif(true);
    try {
      // We will combine both SVGs into one canvas for the GIF
      await generateGIF(
        () => angle,
        setAngle,
        async () => {
          const orbitSvg = document.getElementById('orbit-svg') as unknown as SVGSVGElement;
          const phaseSvg = document.getElementById('phase-svg') as unknown as SVGSVGElement;
          
          const canvas = document.createElement('canvas');
          canvas.width = 800;
          canvas.height = 400;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("No context");

          const c1 = await svgToCanvas(orbitSvg, 400, 400);
          const c2 = await svgToCanvas(phaseSvg, 400, 400);
          
          ctx.drawImage(c1, 0, 0);
          ctx.drawImage(c2, 400, 0);
          
          // Add watermark text
          ctx.fillStyle = "white";
          ctx.font = "20px Zen Maru Gothic";
          ctx.fillText(`Phase: ${phaseInfo.type}`, 20, 380);

          return canvas;
        }
      );
    } catch (error) {
      console.error(error);
      alert("Failed to generate GIF. Please try again.");
    } finally {
      setIsGeneratingGif(false);
      setIsPlaying(true);
    }
  };

  // Gemini Handler
  const askDrMoon = async () => {
    if (!process.env.API_KEY) {
        alert("Dr. Moon is sleeping (No API Key configured).");
        return;
    }
    
    setLoadingGemini(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
            あなたは「月博士」です。小学生に向けて、今の月の形「${phaseInfo.type}」について、
            面白くてわかりやすい豆知識を1つ教えてください。
            100文字以内で、絵文字を使って楽しく話してください。
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        setGeminiExplanation(response.text);
    } catch (e) {
        console.error(e);
        setGeminiExplanation("ごめんね、ちょっと通信の調子が悪いみたい。");
    } finally {
        setLoadingGemini(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 sm:p-8 font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-300 mb-2 tracking-wider">
            月の満ち欠け (Moon Phases)
        </h1>
        <p className="text-slate-400">
            地球、月、太陽の位置と見え方を学ぼう！
        </p>
      </header>

      {/* Main Display Area */}
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Left: Orbit View */}
        <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-emerald-400 flex items-center">
                <span className="bg-emerald-900/50 px-3 py-1 rounded-full mr-2 text-sm">1</span> 
                宇宙から見たようす
            </h2>
            <div className="w-full aspect-square max-w-md relative group">
                <OrbitVisualizer angle={angle} stars={stars} />
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-500">
                    Orbit View
                </div>
            </div>
        </div>

        {/* Right: Phase View */}
        <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-indigo-400 flex items-center">
                <span className="bg-indigo-900/50 px-3 py-1 rounded-full mr-2 text-sm">2</span> 
                地球から見たようす
            </h2>
            <div className="w-full aspect-square max-w-md relative group">
                <MoonView angle={angle} stars={stars} />
                 <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-500">
                    Earth View
                </div>
            </div>
        </div>
      </main>

      {/* Info Panel */}
      <section className="w-full max-w-2xl bg-slate-900/50 backdrop-blur rounded-2xl p-6 mb-8 border border-slate-800">
        <div className="text-center">
            <h3 className="text-3xl font-bold text-yellow-200 mb-2">{phaseInfo.type}</h3>
            <p className="text-lg text-slate-300 mb-4">{phaseInfo.kidDescription}</p>
            
            {/* AI Explanation Area */}
            {geminiExplanation && (
                <div className="mt-4 bg-indigo-950/50 border border-indigo-500/30 p-4 rounded-xl animate-fade-in">
                    <h4 className="text-sm font-bold text-indigo-300 mb-1">🌙 月博士の一言メモ:</h4>
                    <p className="text-indigo-100 text-sm leading-relaxed">{geminiExplanation}</p>
                </div>
            )}

            <button 
                onClick={askDrMoon}
                disabled={loadingGemini}
                className="mt-4 text-sm flex items-center justify-center gap-2 mx-auto text-indigo-400 hover:text-indigo-300 transition-colors"
            >
                {loadingGemini ? <Loader2 className="animate-spin" size={16}/> : <MessageCircle size={16}/>}
                <span>もっと詳しく聞く (Ask Dr. Moon)</span>
            </button>
        </div>
      </section>

      {/* Controls */}
      <div className="w-full mb-8">
        <Controls 
            isPlaying={isPlaying} 
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            speed={speed}
            onSpeedChange={setSpeed}
            angle={angle}
            onAngleChange={handleAngleChange}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button 
            onClick={handleDownloadSVG}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-all border border-slate-600"
        >
            <Download size={20} />
            SVGを保存
        </button>
        <button 
            onClick={handleDownloadGIF}
            disabled={isGeneratingGif}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isGeneratingGif ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            アニメGIFを保存
        </button>
      </div>

      <footer className="mt-12 text-slate-600 text-sm text-center">
        <p>© 2024 Moon Phase Explorer. Educational Tool.</p>
      </footer>
    </div>
  );
};

export default App;
