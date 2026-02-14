import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Check, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { usePantry } from '../context/PantryContext';

const FridgeScanner = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { addIngredient } = usePantry();
    const [scanned, setScanned] = useState(false);

    // AI Integration
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

    const formatKey = (str) => str.toLowerCase().replace(/\s+/g, '_');

    const translateIngredient = (name) => {
        const key = `ingredients.${formatKey(name)}`;
        const translated = t(key);
        return translated === key ? name : translated;
    };

    const translateConfidence = (level) => {
        return t('scan.confidence', { level: level === 'High' ? '높음' : level === 'Medium' ? '보통' : '낮음' });
    };

    const [detectedItems, setDetectedItems] = useState([
        { id: 1, name: 'Free Range Eggs', quantity: 6, confidence: 'High' },
        { id: 2, name: 'Tuscan Kale', quantity: 1, confidence: 'Medium' },
    ]);

    const handleMockScan = () => {
        // Simulate scanning delay
        setTimeout(() => {
            setScanned(true);
        }, 800);
    };

    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const [stream, setStream] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [facingMode, setFacingMode] = useState('environment');

    React.useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [facingMode]);

    const startCamera = async () => {
        stopCamera();
        try {
            // Explicitly request the specific camera (Back/Environment first)
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { exact: facingMode }
                }
            });
            setStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.log("Specific facingMode failed, trying loose constraint...");
            try {
                // Return to loose constraint if exact fails
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: facingMode }
                });
                setStream(stream);
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (e2) {
                console.error("Loose constraint failed, trying default...", e2);
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    setStream(stream);
                    if (videoRef.current) videoRef.current.srcObject = stream;
                } catch (e3) {
                    alert(t('scan.camera_error') || "Camera access denied. Please check permissions.");
                }
            }
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    };

    const analyzeImageWithGemini = async (imageBase64) => {
        setIsAnalyzing(true);
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = "Analyze this image and list the food ingredients visible. Return ONLY a valid JSON array where each object has 'id' (number), 'name' (string), 'quantity' (number), and 'confidence' ('High', 'Medium', 'Low'). Example: [{\"id\": 1, \"name\": \"Apple\", \"quantity\": 3, \"confidence\": \"High\"}]";

            const imagePart = {
                inlineData: {
                    data: imageBase64.split(',')[1],
                    mimeType: "image/jpeg",
                },
            };

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            // Clean markdown code blocks if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const items = JSON.parse(jsonStr);

            setDetectedItems(items);
            setScanned(true);
            stopCamera();

        } catch (error) {
            console.error("AI Analysis Failed:", error);
            alert("Failed to analyze image. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            const { videoWidth, videoHeight } = videoRef.current;

            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;
            context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

            const imageBase64 = canvasRef.current.toDataURL('image/jpeg');
            analyzeImageWithGemini(imageBase64);
        }
    };

    const updateQuantity = (id, delta) => {
        setDetectedItems(prev => prev.map(item =>
            item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        ));
    };

    const handleConfirm = () => {
        const itemsToAdd = detectedItems.filter(i => i.quantity > 0);

        if (itemsToAdd.length > 0) {
            const addedNames = [];
            itemsToAdd.forEach(item => {
                const translatedName = translateIngredient(item.name);
                addedNames.push(translatedName);

                // Create a pantry item with metadata
                const newItem = {
                    id: Date.now() + Math.random(), // Unique ID
                    name: translatedName,
                    category: 'Scanned', // Default category for now
                    expiry: '7 days',    // Default expiry
                    status: 'good',      // Default status
                    quantity: item.quantity,
                    dateAdded: new Date().toISOString()
                };
                addIngredient(newItem);
            });

            alert(`${t('fridge.addToPantry')}: ${addedNames.join(', ')}`);
            navigate('/fridge');
        } else {
            alert(t('scan.no_items_selected') || "No items selected.");
        }
    };

    return (
        <div className="p-6 pb-24 min-h-screen bg-[#FAF9F6] font-sans">
            <header className="mb-4 pt-2">
                <h1 className="text-3xl font-serif font-semibold text-[#1B263B] mb-1">{t('scan.title')}</h1>
                <p className="text-[#C5A059] text-xs font-medium tracking-widest uppercase">{t('scan.subtitle')}</p>
            </header>

            {!scanned ? (
                <div className="relative w-full h-[60vh] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center">
                    {/* Real Camera Feed */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Overlay Guides */}
                    <div className="absolute inset-0 border-2 border-white/20 m-6 rounded-2xl pointer-events-none">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#C5A059]"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#C5A059]"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#C5A059]"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#C5A059]"></div>
                    </div>

                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                            <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-white font-serif tracking-wider animate-pulse">Analyzing Ingredients...</p>
                        </div>
                    )}

                    <div className="absolute top-4 right-4 z-10">
                        <button
                            onClick={toggleCamera}
                            className="bg-black/40 backdrop-blur-sm p-3 rounded-full text-white hover:bg-black/60 transition-colors"
                        >
                            <RotateCcw size={20} />
                        </button>
                    </div>

                    <p className="absolute top-10 text-white/80 font-serif italic text-sm bg-black/30 px-4 py-1 rounded-full backdrop-blur-sm">
                        {t('scan.align_frame')}
                    </p>

                    <button
                        onClick={captureImage}
                        disabled={isAnalyzing}
                        className={`absolute bottom-10 w-20 h-20 rounded-full border-4 border-white/50 flex items-center justify-center transition-all group ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                    >
                        <div className="w-16 h-16 bg-[#C5A059] rounded-full shadow-inner group-hover:bg-[#d4b06d] transition-colors"></div>
                    </button>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#C5A059]/20">
                        {/* Display captured image from canvas if needed, or placeholder for now */}
                        <div className="bg-gray-200 w-full h-56 flex items-center justify-center text-gray-500">
                            captured image
                        </div>
                        <div className="absolute top-4 left-4 right-4 flex justify-between">
                            <span className="bg-[#1B263B]/80 text-[#C5A059] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">{t('scan.analysis_complete')}</span>
                            <button onClick={() => { setScanned(false); startCamera(); }} className="bg-white/20 p-2 rounded-full backdrop-blur-sm hover:bg-white/40 text-white transition-colors">
                                <RotateCcw size={16} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-serif font-medium text-[#1B263B] mb-4 flex items-center gap-2">
                            {t('scan.detected_items')}
                            <span className="h-px bg-[#C5A059]/30 flex-1 ml-2"></span>
                        </h3>
                        <div className="space-y-3">
                            {detectedItems.map(item => (
                                <div key={item.id} className="bg-white p-4 rounded-xl shadow-[0_2px_10px_-5px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full border border-[#C5A059] flex items-center justify-center text-[#1B263B] font-serif font-bold text-sm bg-[#F9F7F2]">
                                            {item.quantity}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-serif text-lg text-[#1B263B]">{translateIngredient(item.name)}</span>
                                            <span className="text-[10px] text-[#0D47A1] font-bold uppercase tracking-wider opacity-60">{translateConfidence(item.confidence)}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="w-8 h-8 rounded-full bg-[#FAF9F6] text-[#1B263B] hover:bg-[#1B263B] hover:text-[#C5A059] border border-transparent hover:border-[#C5A059] transition-all flex items-center justify-center"
                                        >-</button>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-8 h-8 rounded-full bg-[#FAF9F6] text-[#1B263B] hover:bg-[#1B263B] hover:text-[#C5A059] border border-transparent hover:border-[#C5A059] transition-all flex items-center justify-center"
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full bg-[#1B263B] text-white py-4 rounded-xl font-medium shadow-xl shadow-[#1B263B]/30 hover:bg-[#171717] hover:shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <Check size={20} className="text-[#C5A059]" />
                        <span className="font-serif tracking-wide">{t('scan.confirm_add')}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default FridgeScanner;
