import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Check, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FridgeScanner = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [scanned, setScanned] = useState(false);

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

    const updateQuantity = (id, delta) => {
        setDetectedItems(prev => prev.map(item =>
            item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        ));
    };

    const handleConfirm = () => {
        const itemNames = detectedItems.filter(i => i.quantity > 0).map(i => translateIngredient(i.name)).join(', ');
        if (itemNames) {
            alert(`${t('fridge.addToPantry')}: ${itemNames}`);
            navigate('/fridge');
        }
    };

    return (
        <div className="p-6 pb-24 min-h-screen bg-[#FAF9F6] font-sans">
            <header className="mb-8 pt-2">
                <h1 className="text-3xl font-serif font-semibold text-[#1B263B] mb-1">{t('scan.title')}</h1>
                <p className="text-[#C5A059] text-xs font-medium tracking-widest uppercase">{t('scan.subtitle')}</p>
            </header>

            {!scanned ? (
                <div className="bg-[#1B263B] rounded-3xl w-full h-[450px] flex items-center justify-center relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <p className="text-[#C5A059]/80 absolute top-8 font-serif italic tracking-wider text-center w-full px-4 text-sm animate-pulse">{t('scan.align_frame')}</p>

                    {/* Viewfinder Corners */}
                    <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-[#C5A059]"></div>
                    <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-[#C5A059]"></div>
                    <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-[#C5A059]"></div>
                    <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-[#C5A059]"></div>

                    <button
                        onClick={handleMockScan}
                        className="bg-[#C5A059] text-[#1B263B] w-20 h-20 rounded-full shadow-lg shadow-[#C5A059]/40 hover:scale-110 transition-transform active:scale-95 z-10 flex items-center justify-center"
                    >
                        <Camera size={32} />
                    </button>
                    <p className="text-white/30 text-xs absolute bottom-24 tracking-widest uppercase">{t('scan.tap_to_scan')}</p>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#C5A059]/20">
                        <img
                            src="https://images.unsplash.com/photo-1584269600465-385038f4a034?q=80&w=1000&auto=format&fit=crop"
                            alt="Scanned Fridge"
                            className="w-full h-56 object-cover"
                        />
                        <div className="absolute top-4 left-4 right-4 flex justify-between">
                            <span className="bg-[#1B263B]/80 text-[#C5A059] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">{t('scan.analysis_complete')}</span>
                            <button onClick={() => setScanned(false)} className="bg-white/20 p-2 rounded-full backdrop-blur-sm hover:bg-white/40 text-white transition-colors">
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
