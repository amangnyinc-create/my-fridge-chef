import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, Flame, ChevronRight, Loader2, PlayCircle, ArrowLeft, CheckCircle2, Pause, Play, RotateCcw, X, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePantry } from '../context/PantryContext';
import { useAuth } from '../context/AuthContext';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Timer Component
const TimerButton = ({ initialMinutes, user }) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState((initialMinutes || 0) * 60);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        setTimeLeft((initialMinutes || 0) * 60);
        setIsActive(false);
        setIsFinished(false);
    }, [initialMinutes]);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsFinished(true);
            setIsActive(false);

            // Notification Logic
            if (user?.notifications !== false) {
                // Try playing a simple beep sound using AudioContext or Speech
                if ('speechSynthesis' in window) {
                    const msg = new SpeechSynthesisUtterance(t('recipes.timer_finished') || "Timer Finished!");
                    window.speechSynthesis.speak(msg);
                }

                // Also trigger browser notification if permission granted
                if (Notification.permission === "granted") {
                    new Notification("My Fridge Chef", { body: t('recipes.timer_finished') || "Your timer is done!" });
                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            new Notification("My Fridge Chef", { body: t('recipes.timer_finished') || "Your timer is done!" });
                        }
                    });
                }
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, user, t]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setIsFinished(false);
        setTimeLeft(initialMinutes * 60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (isFinished) {
        return (
            <button onClick={resetTimer} className="bg-[#C5A059] text-[#1B263B] py-3 rounded-xl flex items-center justify-center gap-3 w-full animate-bounce shadow-lg font-bold">
                <CheckCircle2 size={24} />
                {t('recipes.timer_done')}
            </button>
        );
    }

    return (
        <div className="flex gap-2 w-full">
            <button
                onClick={toggleTimer}
                className={`flex-1 border border-[#C5A059]/50 py-3 rounded-xl flex items-center justify-center gap-3 transition-all group
                    ${isActive ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'bg-[#2C3E50] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#1B263B]'}`}
            >
                {isActive ? <Pause size={20} /> : <Play size={20} />}
                <span className="font-bold uppercase tracking-wide font-mono text-lg">
                    {formatTime(timeLeft)}
                </span>
            </button>
            <button
                onClick={resetTimer}
                className="bg-[#2C3E50] border border-[#C5A059]/30 text-[#C5A059]/70 hover:text-[#C5A059] px-4 rounded-xl flex items-center justify-center transition-colors"
                title="Reset Timer"
            >
                <RotateCcw size={18} />
            </button>
        </div>
    );
};

const RecipeAssistant = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { ingredients } = usePantry();
    const [cravings, setCravings] = useState('');
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recipes, setRecipes] = useState(null);
    const [activeRecipe, setActiveRecipe] = useState(null);
    const [cookingMode, setCookingMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const formatKey = (str) => str.toLowerCase().replace(/\s+/g, '_');

    const translateIngredient = (name) => {
        const key = `ingredients.${formatKey(name)}`;
        const translated = t(key);
        return translated === key ? name : translated;
    };

    const handleSelectIngredient = (ingredient) => {
        setSelectedIngredients(prev =>
            prev.includes(ingredient) ? prev.filter(i => i !== ingredient) : [...prev, ingredient]
        );
    };

    // AI Integration
    // AI Integration
    // Moved initialization inside the function to prevent render crashes

    useEffect(() => {
        console.log("RecipeAssistant Component Mounted");
    }, []);

    const generateRecipesWithGemini = async (selected, userCravings) => {
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                alert("API Key is missing. Please check .env file.");
                return [];
            }
            const currentLang = i18n?.language || 'en';
            const lang = currentLang.startsWith('ko') ? 'Korean' : 'English';
            const dietary = user?.dietaryPreferences?.join(', ') || 'None';
            const unitSystem = user?.unitSystem === 'imperial' ? 'Imperial (oz/lb/Fahrenheit)' : 'Metric (g/ml/Celsius)';

            const prompt = `
                You are a world-class chef. Create 3 distinct recipes based on these ingredients: ${selected.join(', ')}.
                User cravings/notes: "${userCravings}".
                Dietary Restrictions/Allergies: "${dietary}".
                Preferred Measurement System: ${unitSystem}.
                Target Language: ${lang}.

                Return a JSON array of 3 objects. Each object MUST match this structure exactly:
                {
                    "id": number,
                    ...
                    "ingredients": [{"name": "string", "available": boolean}] 
                    // IMPORTANT: Set 'available' to true ONLY if the ingredient is in the provided list: ${selected.join(', ')}. Otherwise false.
                }
                ENSURE JSON IS VALID. NO MARKDOWN CODE BLOCKS.
            `;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || 'AI Request Failed');
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const generatedRecipes = JSON.parse(jsonStr);
            console.log("AI Recipes:", generatedRecipes);

            return generatedRecipes;

        } catch (error) {
            console.error("Recipe Generation Failed:", error);
            alert("Failed to generate recipes. Please try again.");
            return [];
        }
    };

    const handleCurate = async () => {
        if (!selectedIngredients || selectedIngredients.length === 0) {
            alert(t('recipes.select_ingredients_warning') || "Please select at least one ingredient.");
            return;
        }

        setIsLoading(true);
        const generated = await generateRecipesWithGemini(selectedIngredients, cravings);
        setRecipes(generated);
        setIsLoading(false);
    };

    if (cookingMode && activeRecipe) {
        if (!activeRecipe.steps || activeRecipe.steps.length === 0) {
            console.error("Invalid recipe steps", activeRecipe);
            setCookingMode(false);
            return null;
        }

        const isLastStep = currentStep === activeRecipe.steps.length - 1;
        const currentTimer = activeRecipe.stepTimers?.[currentStep] || 0;

        return (
            <div className="min-h-screen bg-[#FDFBF7] text-[#1B263B] p-6 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center mb-8 relative z-10">
                    <button onClick={() => setCookingMode(false)} className="p-3 bg-white/80 rounded-full border border-[#1B263B]/10">
                        <X size={24} />
                    </button>
                    <div className="text-center">
                        <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block mb-1">{t('recipes.cooking_mode')}</span>
                        <h2 className="text-lg font-serif font-bold max-w-xs truncate mx-auto">{activeRecipe.title}</h2>
                    </div>
                    <div className="w-12"></div>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center text-center animate-fade-in relative z-10 w-full max-w-4xl mx-auto">
                    <div className="mb-6 w-16 h-16 rounded-full border-2 border-[#C5A059] flex items-center justify-center text-2xl font-serif font-bold text-[#C5A059] bg-[#FAF9F6] shadow-md mx-auto">
                        {currentStep + 1}
                    </div>
                    <h2 className="text-lg md:text-xl font-serif leading-relaxed mb-8 font-medium max-w-3xl px-6 text-[#1B263B]/90">
                        {activeRecipe.steps[currentStep]}
                    </h2>

                    <div className="w-full max-w-lg space-y-6">
                        {currentTimer > 0 && (
                            <div className="px-6 animate-slide-up">
                                <TimerButton key={currentStep} initialMinutes={currentTimer} user={user} />
                            </div>
                        )}

                        <div className="bg-[#FAF9F6] p-6 rounded-xl border-l-4 border-[#C5A059] text-left shadow-sm">
                            <h4 className="flex items-center gap-2 text-[#C5A059] font-bold text-xs uppercase tracking-widest mb-2">
                                <Flame size={14} /> {t('recipes.chef_tip')}
                            </h4>
                            <p className="text-[#4A5568] text-sm italic leading-relaxed">
                                {activeRecipe.stepTips?.[currentStep] || t('recipes.chef_tip_desc')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full mb-8 overflow-hidden mt-6">
                    <div className="bg-[#C5A059] h-full transition-all duration-500" style={{ width: `${((currentStep + 1) / activeRecipe.steps.length) * 100}%` }}></div>
                </div>

                <div className="flex justify-between gap-4 pb-4">
                    <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} className="px-8 py-4 rounded-xl font-bold border border-[#1B263B]/20 transition-all font-serif italic text-sm">
                        {t('recipes.prev')}
                    </button>
                    <button onClick={() => isLastStep ? setCookingMode(false) : setCurrentStep(currentStep + 1)} className="flex-1 py-4 rounded-xl font-bold bg-[#C5A059] text-[#1B263B] shadow-lg hover:bg-[#D4AF37] transition-all font-serif text-lg">
                        {isLastStep ? t('recipes.finish') : t('recipes.next')}
                    </button>
                </div>
            </div>
        );
    }

    if (activeRecipe) {
        return (
            <div className="min-h-screen bg-[#FAF9F6] font-sans pb-24">
                <div className="relative h-80 w-full overflow-hidden">
                    <img src={activeRecipe.image} alt={activeRecipe.title} className="w-full h-full object-cover" />
                    <button onClick={() => setActiveRecipe(null)} className="absolute top-6 left-6 bg-black/20 backdrop-blur-md p-2 rounded-full text-white">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1B263B] p-6">
                        <h1 className="text-3xl font-serif font-bold text-white mb-2 leading-tight">{activeRecipe.title}</h1>
                        <div className="flex items-center gap-4 text-[#C5A059] text-xs font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Clock size={16} /> {activeRecipe.time}</span>
                            <span className="flex items-center gap-1"><Flame size={16} /> {activeRecipe.difficulty}</span>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <p className="text-[#1B263B]/80 font-serif italic text-lg mb-8">"{activeRecipe.description}"</p>
                    <div className="mb-8">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#C5A059] mb-4 border-b border-[#C5A059]/20 pb-2">{t('recipes.ingredients')}</h3>
                        <ul className="space-y-3">
                            {activeRecipe.ingredients.map((ing, idx) => (
                                <li key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-50 shadow-sm">
                                    <span className={`font-medium ${ing.available ? 'text-[#1B263B]' : 'text-gray-400'}`}>{translateIngredient(ing.name)}</span>
                                    {ing.available ? (
                                        <span className="text-xs font-bold text-[#0D47A1] bg-[#E3F2FD] px-2 py-1 rounded flex items-center gap-1">
                                            <CheckCircle2 size={10} /> {t('recipes.in_fridge')}
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                            Missing
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button onClick={() => setCookingMode(true)} className="w-full bg-[#1B263B] text-white py-4 rounded-xl font-medium shadow-xl hover:bg-[#171717] transition-all flex items-center justify-center gap-3">
                        <PlayCircle size={22} className="text-[#C5A059]" />
                        <span className="font-serif tracking-wide text-lg">{t('recipes.start_cooking')}</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 pb-24 min-h-screen bg-[#FAF9F6] font-sans">
            <header className="mb-8 pt-2">
                <h1 className="text-3xl font-serif font-semibold text-[#1B263B] mb-1">{t('recipes.title')}</h1>
                <p className="text-[#C5A059] text-xs font-medium tracking-widest uppercase">{t('recipes.subtitle')}</p>
            </header>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 mb-6 font-serif">
                <h2 className="text-lg font-medium mb-4 text-[#1B263B] flex items-center gap-2">
                    <span className="text-[#C5A059]">✦</span> {t('recipes.available_ingredients')}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {ingredients.map((item) => (
                        <button key={item.id} onClick={() => handleSelectIngredient(item.name)} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${selectedIngredients.includes(item.name) ? 'bg-[#1B263B] text-[#C5A059]' : 'bg-[#F9F7F2] text-gray-600'}`}>
                            <span className="font-medium text-sm">{translateIngredient(item.name)}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 mb-8">
                <h2 className="text-lg font-serif font-medium mb-4 text-[#1B263B]">{t('recipes.cravings')}</h2>
                <input type="text" placeholder={t('recipes.cravings_placeholder')} className="w-full px-4 py-4 rounded-xl bg-[#F9F7F2] border-none outline-none text-[#1B263B] font-serif" value={cravings} onChange={(e) => setCravings(e.target.value)} />
            </div>

            <button onClick={handleCurate} disabled={isLoading} className="w-full bg-[#1B263B] text-white py-4 rounded-xl font-medium shadow-xl hover:bg-[#171717] transition-all flex items-center justify-center gap-3">
                {isLoading ? (
                    <><Loader2 size={22} className="animate-spin text-[#C5A059]" /> {t('recipes.consulting')}</>
                ) : (
                    <><ChefHat size={22} className="text-[#C5A059]" /> {t('recipes.curate_menu')}</>
                )}
            </button>

            {recipes && (
                <div className="mt-10 space-y-6">
                    <h3 className="text-xl font-serif font-medium text-[#1B263B]">{t('recipes.recommendations')}</h3>
                    <div className="grid grid-cols-1 gap-6">
                        {recipes.map((recipe) => (
                            <div key={recipe.id} onClick={() => { setActiveRecipe(recipe); setCurrentStep(0); }} className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer group relative border border-gray-100">
                                <div className="bg-[#1B263B] p-6">
                                    <div className="bg-[#C5A059] text-[10px] font-bold px-2 py-1 rounded absolute top-4 right-4 text-[#1B263B] uppercase tracking-wider">{t('recipes.match', { percent: recipe.match })}</div>
                                    <h3 className="text-xl font-serif font-bold text-[#F9F7F2] mb-2 pr-16 leading-tight group-hover:text-[#C5A059] transition-colors">{recipe.title}</h3>
                                    <div className="flex gap-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                        <span><Clock size={14} className="inline mr-1" /> {recipe.time}</span>
                                        <span><Flame size={14} className="inline mr-1" /> {recipe.difficulty}</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-600 text-sm italic mb-4 leading-relaxed line-clamp-2">"{recipe.description}"</p>
                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50">
                                        {recipe.ingredients.slice(0, 3).map((ing, i) => (
                                            <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{translateIngredient(ing.name)}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeAssistant;
