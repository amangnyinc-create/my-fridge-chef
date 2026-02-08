import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, Flame, ChevronRight, Loader2, PlayCircle, ArrowLeft, CheckCircle2, Pause, Play, RotateCcw, X, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePantry } from '../context/PantryContext';

// Timer Component
const TimerButton = ({ initialMinutes }) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsFinished(true);
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

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

    const INGREDIENT_TYPES = {
        protein: ['Chicken Thighs', 'Wagyu Beef', 'Wild Salmon', 'Eggs', 'Truffle Eggs', 'Pork belly', 'Tofu'],
        carb: ['Sourdough Bread', 'Artisanal Linguine', 'Spaghetti', 'Arborio Rice', 'Potato'],
        veggie: ['Fresh Kale', 'Organic Kale', 'Avocado', 'Avocados', 'Mushrooms', 'Asparagus', 'Shallots', 'Garlic', 'Onion', 'Carrots'],
        fat: ['Butter', 'Olive Oil', 'Truffle Oil', 'Sesame Oil', 'Cheese', 'Cream', 'Milk', 'Whole Milk', 'Pecorino', 'Parmesan'],
        spice: ['Salt', 'Pepper', 'Black Pepper', 'Chili Flakes', 'Soy Sauce', 'Lemon', 'Herbs', 'Chives', 'Rosemary']
    };

    const getIngredientType = (name) => {
        for (const [type, list] of Object.entries(INGREDIENT_TYPES)) {
            if (list.some(i => name.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(name.toLowerCase()))) {
                return type;
            }
        }
        return 'other';
    };

    const generateRecipeFromIngredients = (selected) => {
        if (!selected || selected.length === 0) return null;

        const classified = {
            protein: [], carb: [], veggie: [], fat: [], spice: [], other: []
        };

        selected.forEach(ing => {
            const type = getIngredientType(ing);
            classified[type].push(ing);
        });

        const isKo = i18n.language.startsWith('ko');

        if (classified.carb.some(c => c.includes('Pasta') || c.includes('Linguine') || c.includes('Spaghetti'))) {
            const pasta = classified.carb.find(c => c.includes('Pasta') || c.includes('Linguine') || c.includes('Spaghetti'));
            const protein = classified.protein[0] || 'Fried Garlic';
            const sauce = classified.fat[0] || 'Olive Oil';

            return {
                title: isKo ? `${translateIngredient(protein)}를 곁들인 수제 ${translateIngredient(pasta)}` : `Hand-Tossed ${protein} ${pasta}`,
                time: '20m',
                difficulty: t('recipes.medium'),
                match: '100%',
                image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                description: isKo ? `${translateIngredient(pasta)}를 베이스로 ${translateIngredient(sauce)}의 풍미와 ${translateIngredient(protein)}의 식감을 살린 요리입니다.` : `A generated masterclass using your ${pasta} as the base, enriched with rich ${sauce} and savory ${protein}.`,
                steps: [
                    isKo ? `먼저 큰 냄비에 물을 넉넉히 붓고 소금을 한 큰술 정도 넉넉히 넣어 끓여주세요. 물이 팔팔 끓기 시작하면 ${translateIngredient(pasta)}를 넣고 봉지에 적힌 시간보다 1분 정도 덜 삶아 완벽한 알단테 상태를 만들어줍니다.` : `Start by bringing a large pot of water to a rolling boil. Season heavily with salt until it tastes like the sea. Add the ${pasta} and cook for 1 minute less than the package instructions to achieve a perfect al dente bite.`,
                    isKo ? `면이 삶아지는 동안 옆 화구에서 팬을 중불로 예열하세요. ${translateIngredient(sauce)}를 넉넉히 두르고, 풍미를 위해 ${translateIngredient(protein)}를 넣어 노릇노릇하고 고소한 향이 올라올 때까지 충분히 저어가며 볶아줍니다.` : `While the pasta cooks, preheat a large skillet over medium heat. Add a generous swirl of ${sauce} and toss in the ${protein}. Sauté, stirring occasionally, until it develops a beautiful golden-brown crust and fills the kitchen with a savory aroma.`,
                    isKo ? `이제 채소들을 넣어줄 차례입니다. 준비된 재료들이 있다면 팬에 넣고 소금 한 꼬집으로 밑간을 해준 뒤, 채소의 숨이 살짝 죽고 향이 입혀질 정도로만 2분간 가볍게 더 볶아 전체적인 조화를 맞춰주세요.` : `Time for the aromatics! If you have fresh veggies, add them to the pan now. Season with a tiny pinch of salt and toss for about 2 minutes. We want the vegetables to soften slightly while retaining their vibrant color and fresh texture.`,
                    isKo ? `삶아진 면을 체로 건져 바로 팬으로 옮깁니다. 이때 면수를 반 컵 정도 함께 넣어 소스와 면이 겉돌지 않게 잘 섞어주세요. 강불로 올려 면수가 소스와 합쳐져 크리미한 유화 상태가 될 때까지 약 1분간 힘차게 흔들며 볶아줍니다.` : `Using tongs, transfer the cooked pasta directly into the skillet. Ladle in about half a cup of the starchy pasta water. Increase the heat to high and vigorously toss the pasta for about a minute. The starchy water will emulsify with the oils to create a luxurious, silky sauce that clings to every strand.`,
                    isKo ? `불을 끄고 마지막으로 신선한 후추를 넉넉히 갈아 넣어 마무리를 합니다. 잘 섞인 파스타를 아담하고 따뜻한 접시에 예쁘게 담아내어, 정성이 가득 담긴 한 그릇을 즐겁게 맛보시길 바랍니다.` : `Turn off the heat and finish with a fresh crack of black pepper. Twirl the pasta into a warm bowl, ensuring all the golden bits of ${protein} are served on top. Take a moment to appreciate the craft, then enjoy your masterpiece immediately while perfectly hot.`
                ],
                stepTimers: [8, 0, 2, 1, 0],
                stepTips: [
                    isKo ? "소금을 넉넉히 넣으세요. 면 자체에 간이 배이게 하는 유일한 기회입니다." : "Salt the water heavily—it's your only chance to season the pasta inside out.",
                    isKo ? "소스를 볶을 때 너무 바짝 마르지 않게 불 조절을 잘 하세요." : "Control the heat to prevent the sauce from drying out too quickly.",
                    isKo ? "채소의 아삭한 식감을 살리려면 마지막에 살짝만 볶는 것이 좋습니다." : "Quickly toss the veggies at the end to maintain their fresh, crunchy texture.",
                    isKo ? "면수가 소스를 유화시켜 크리미하게 만들어주는 '비법'입니다." : "Pasta water is the secret weapon that emulsifies the sauce into a creamy coating.",
                    isKo ? "따뜻하게 데워진 접시에 담으면 소스의 실키함이 더 오래 유지됩니다." : "Serving on a warm plate keeps the sauce silky and prevents it from setting too soon."
                ],
                ingredients: selected.map(name => ({ name, available: true }))
            };
        }

        if (classified.protein.length > 0) {
            const main = classified.protein[0];
            const side = classified.veggie[0] || 'Rice';
            const fat = classified.fat[0] || 'Oil';

            return {
                title: isKo ? `${translateIngredient(side)}를 곁들인 ${translateIngredient(main)} 구이` : `Pan-Seared ${main} with ${side}`,
                time: '25m',
                difficulty: t('recipes.medium'),
                match: '98%',
                image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                description: isKo ? `${translateIngredient(main)}의 겉바속촉함을 극대화하고 ${translateIngredient(side)}로 균형을 맞춘 고단백 요리입니다.` : `A high-protein dish maximizing the flavor of ${main} with a crispy sear, balanced by fresh ${side}.`,
                steps: [
                    isKo ? `${translateIngredient(main)}의 겉면에 묻은 수분을 키친타월로 완벽하게 제거해주세요. 그 다음 소금과 후추를 앞뒤로 넉넉히 뿌려 밑간을 합니다. 수분이 없어야 팬에서 구울 때 완벽한 갈색빛의 바삭한 층이 생깁니다.` : `Start by patting the ${main} completely dry with paper towels—moisture is the enemy of a good sear. Season generously with salt and pepper on all sides to build layers of flavor from the beginning.`,
                    isKo ? `팬에 ${translateIngredient(fat)}을 넉넉히 두르고 강불에서 기름이 물처럼 찰랑거릴 때까지 충분히 예열합니다. 팬에서 연기가 살짝 올라오기 시작하면 고기를 올릴 준비가 된 것입니다. 뜨거운 온도 유지가 가장 중요합니다.` : `Heat a heavy-bottomed skillet over high heat and add a healthy splash of ${translateIngredient(fat)}. Wait until the oil is shimmering and just starting to haze with smoke. A hot pan ensures the meat sears instantly without sticking or boiling in its own juices.`,
                    isKo ? `팬에 ${translateIngredient(main)}을 조심스럽게 올리고, 약 4분 동안 건드리지 말고 그대로 두어 두꺼운 크러스트가 생기게 하세요. 뒤집어서 반대편도 원하는 굽기 정도가 될 때까지 구워주며, 고기의 고소한 향을 충분히 즐겨보세요.` : `Carefully place the ${main} in the pan, laying it away from you to avoid splashes. Let it sear undisturbed for 4 minutes to develop a deep, savory crust. Flip only once and continue cooking until your preferred level of doneness is reached.`,
                    isKo ? `고기를 꺼내 접시에서 5분 정도 휴식(레스팅) 시켜주는 동안, 같은 팬에 남은 맛있는 육즙을 활용해 ${translateIngredient(side)}를 볶아줍니다. 고소한 기름기가 채소에 스며들어 풍부한 풍미를 더해줄 것입니다.` : `Remove the meat and let it rest on a warm plate for at least 5 minutes—this allows the juices to redistribute. In the same pan, toss in the ${side} to soak up all that flavorful fond left behind. Sauté until the veggies are tender-crisp and aromatic.`,
                    isKo ? `충분히 휴지된 ${translateIngredient(main)}을 먹기 좋은 크기로 결 반대 방향으로 썰어주세요. 볶은 ${translateIngredient(side)} 위에 고기를 얹고 접시에 흘러나온 육즙까지 모두 끼얹어 마무리하여 근사하게 서빙합니다.` : `Slice the rested ${main} against the grain for maximum tenderness. Arrange it beautifully atop the ${side}, drizzling any resting juices over the top as the final touch of pure flavor. Serve proudly.`
                ],
                stepTimers: [0, 0, 4, 5, 0],
                stepTips: [
                    isKo ? "겉면의 물기를 완벽히 제거해야 마이야르 반응이 잘 일어나 바삭합니다." : "Moisture prevents browning—drying the meat is crucial for a perfect crust.",
                    isKo ? "팬이 충분히 뜨거워져야 고기가 달라붙지 않고 즉시 시어링됩니다." : "Ensure the pan is shimmering hot to prevent sticking and achieve an instant sear.",
                    isKo ? "팬을 너무 가득 채우지 마세요. 열기가 갇혀 고기가 구워지지 않고 삶아질 수 있습니다." : "Don't crowd the pan, or the meat will steam instead of sear.",
                    isKo ? "레스팅은 육즙이 고루 퍼지게 하여 고기를 훨씬 촉촉하게 만듭니다." : "Resting allows juices to redistribute, making the meat incredibly succulent.",
                    isKo ? "팬에 남은 갈색 침전물(fond)은 최고의 천연 조미료입니다." : "The brown bits stuck to the pan (fond) are pure, concentrated flavor."
                ],
                ingredients: selected.map(name => ({ name, available: true }))
            };
        }

        return {
            title: isKo ? `셰프 특제 ${translateIngredient(selected[0])} 볼` : `Chef's Special Bowl`,
            time: '15m',
            difficulty: t('recipes.easy'),
            match: '90%',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            description: isKo ? `${selected.map(translateIngredient).join(', ')}을 조화롭게 담아낸 커스텀 볼 요리입니다.` : `A customized bowl bringing together ${selected.join(', ')} in perfect harmony.`,
            steps: [
                isKo ? `가장 먼저 모든 식재료를 깨끗이 씻고 용도에 맞게 손질합니다. 채소는 한 입 크기로 썰고 단백질류는 조리 시 균일하게 익을 수 있도록 일정한 크기로 잘라 준비해두는 것이 정갈한 요리의 기본입니다.` : `Begin by washing and preparing all your ingredients. Focus on uniform cuts—chopping vegetables into bite-sized pieces and slicing proteins into even portions—to ensure everything cooks at the same rate and looks professional on the plate.`,
                isKo ? `팬에 불을 올리고 오일을 살짝 두른 뒤, 익는 시간이 가장 오래 걸리는 단백질이나 딱딱한 뿌리 채소부터 먼저 넣어 5분간 볶기 시작합니다. 재료 본연의 색이 살아있도록 중불에서 정성스럽게 저어가며 조리하세요.` : `Preheat your pan with a light drizzle of oil. Start by sautéing the items that take longest to cook, such as proteins or dense root vegetables. Use medium heat and stir gently but regularly for 5 minutes, allowing the natural aromas and colors to deepen without burning.`,
                isKo ? `주재료가 어느 정도 익으면 팬의 불을 끄고 남은 열로 연약한 잎채소들을 살짝 익혀줍니다. 이제 큰 서빙 볼을 준비해 ${selected.map(translateIngredient).join('와(과) ')} 등 모든 재료를 색감이 고루 섞이도록 보기 좋게 담아냅니다.` : `Once the main components are ready, turn off the heat and let the residual warmth wilts any delicate greens. Prepare a beautiful serving bowl and arrange all the ingredients carefully, creating a colorful and inviting canvas of nutrition.`,
                isKo ? `준비된 드레싱이나 엑스트라 버진 올리브유를 요리 전체에 고루 한 바퀴 둘러줍니다. 위아래로 가볍게 들어 올리듯이 버무려주어 재료들이 뭉치지 않고 소스가 골고루 묻어날 수 있도록 부드럽게 섞어주세요.` : `Drizzle your choice of dressing or a splash of vibrant extra virgin olive oil over the top. Use a light folding motion to toss the bowl, ensuring every ingredient is gently kissed by the dressing without becoming heavy or bruised.`,
                isKo ? `마지막으로 소금이나 후추로 최종 간을 맞춘 뒤, 허브나 견과류가 있다면 살짝 뿌려 장색해주면 품위 있는 한 그릇이 완성됩니다. 직접 만든 건강하고 맛있는 볼 요리를 천천히 음미하며 즐겨보세요.` : `Finish with a final sprinkle of sea salt and freshly cracked pepper. If you have herbs or toasted seeds, scatter them on top for added texture and visual flair. Sit back, take a breath, and savor the healthful and delicious bowl you've crafted yourself.`
            ],
            stepTimers: [0, 5, 0, 0, 0],
            stepTips: [
                isKo ? "모든 재료를 비슷한 크기로 썰어야 한 입 마다 균형 잡힌 맛을 느낄 수 있습니다." : "Uniform chopping ensures every bite has a perfectly balanced flavor profile.",
                isKo ? "간은 마지막에만 하는 것이 아니라 층층이 조금씩 해주는 것이 좋습니다." : "Season every layer as you go, not just at the very end.",
                isKo ? "연약한 채소가 상하지 않도록 가볍게 버무리듯 섞어주세요." : "Toss gently with a folding motion to avoid bruising delicate ingredients.",
                isKo ? "오일을 마지막에 살짝 두르면 요리에 먹음직스러운 윤기가 돕니다." : "A final drizzle of oil adds a professional, mouthwatering sheen to the dish.",
                isKo ? "서빙 직전에 산미(레몬즙 등)를 살짝 더하면 맛이 더 선명해집니다." : "Add a squeeze of citrus right before serving to brighten and lift all the flavors."
            ],
            ingredients: selected.map(name => ({ name, available: true }))
        };
    };

    const handleCurate = () => {
        setIsLoading(true);
        setTimeout(() => {
            let generatedRecipes = [];
            if (selectedIngredients.length > 0) {
                const primaryRecipe = generateRecipeFromIngredients(selectedIngredients);
                generatedRecipes.push({ ...primaryRecipe, id: 1 });
            }
            setRecipes(generatedRecipes);
            setIsLoading(false);
        }, 1000);
    };

    if (cookingMode && activeRecipe) {
        const isLastStep = currentStep === activeRecipe.steps.length - 1;
        const currentTimer = activeRecipe.stepTimers?.[currentStep];

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
                                <TimerButton initialMinutes={currentTimer} />
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
                                    <span className="font-medium text-[#1B263B]">{translateIngredient(ing.name)}</span>
                                    <span className="text-xs font-bold text-[#0D47A1] bg-[#E3F2FD] px-2 py-1 rounded">{t('recipes.in_fridge')}</span>
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
