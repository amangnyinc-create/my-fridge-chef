import React, { useState } from 'react';
import { Plus, Search, Filter, X, Globe, Trash2, RotateCcw, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { usePantry } from '../context/PantryContext';

const Fridge = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const {
        ingredients,
        deletedIngredients,
        addIngredient,
        removeIngredient,
        restoreIngredient,
        permanentlyDeleteIngredient,
        clearTrash
    } = usePantry();

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);

    // New Item State
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('Veggies');

    const formatKey = (str) => str.toLowerCase().replace(/\s+/g, '_');

    const translateIngredient = (name) => {
        const key = `ingredients.${formatKey(name)}`;
        const translated = t(key);
        return translated === key ? name : translated;
    };

    const translateExpiry = (expiry) => {
        if (!expiry) return '';
        const lower = expiry.toLowerCase();
        if (lower.includes('day')) {
            const count = parseInt(expiry);
            return t('fridge.status.days', { count: isNaN(count) ? expiry : count });
        }
        const keyMap = {
            'expiring soon': 'expiring_soon',
            'perfect': 'perfect',
            'expired': 'expired',
            'fresh': 'fresh',
            'long term': 'long_term'
        };
        const key = keyMap[lower];
        return key ? t(`fridge.status.${key}`) : expiry;
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItemName) return;

        const newItem = {
            id: Date.now(),
            name: newItemName,
            category: newItemCategory,
            expiry: 'Fresh',
            status: 'fresh'
        };

        addIngredient(newItem);
        setNewItemName('');
        setIsAddModalOpen(false);
    };

    const filteredIngredients = ingredients.filter(item =>
        (activeCategory === 'All' || item.category === activeCategory) &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'fresh': return 'text-[#0D47A1] bg-[#E3F2FD] border border-[#BBDEFB]';
            case 'warning': return 'text-[#B45309] bg-[#FFFBEB] border border-[#FEF3C7]';
            case 'expired': return 'text-[#7F1D1D] bg-[#FEF2F2] border border-[#FEE2E2]';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="p-6 pb-24 min-h-screen bg-[#FAF9F6] font-sans relative">
            {/* Add Item Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in p-4">
                    <div className="bg-[#FAF9F6] w-full max-w-sm rounded-3xl p-6 shadow-2xl transform transition-all animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-serif font-medium text-[#1B263B]">{t('fridge.addIngredient')}</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                <X size={20} className="text-[#1B263B]" />
                            </button>
                        </div>

                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-[#1B263B] ml-1 mb-1 block">{t('fridge.itemName')}</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full px-4 py-4 rounded-xl bg-white border border-gray-200 focus:border-[#C5A059] focus:ring-0 outline-none text-[#1B263B] font-serif placeholder-gray-300"
                                    placeholder={t('fridge.itemNamePlaceholder')}
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                />
                            </div>

                            <div>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Bakery', 'Dairy', 'Frozen', 'Fruit', 'Grains', 'Meat', 'Pantry', 'Seafood', 'Veggies'].map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setNewItemCategory(cat)}
                                            className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${newItemCategory === cat
                                                ? 'bg-[#1B263B] text-[#C5A059] shadow-md border border-[#1B263B]'
                                                : 'bg-white border border-[#C5A059]/20 text-[#C5A059] hover:bg-[#C5A059]/5'
                                                }`}
                                        >
                                            {t(`fridge.categories.${cat}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#C5A059] text-[#1B263B] py-4 rounded-xl font-bold shadow-lg shadow-[#C5A059]/30 hover:bg-[#D4AF37] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                <Plus size={20} /> {t('fridge.addToPantry')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Trash Modal */}
            {isTrashModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in p-4">
                    <div className="bg-[#FAF9F6] w-full max-w-md rounded-3xl p-6 shadow-2xl transform transition-all animate-slide-up flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-2xl font-serif font-medium text-[#1B263B]">{t('fridge.trash.title')}</h2>
                                <p className="text-xs text-[#C5A059] uppercase tracking-widest font-bold">{t('fridge.trash.subtitle')}</p>
                            </div>
                            <button onClick={() => setIsTrashModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                <X size={20} className="text-[#1B263B]" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                            {deletedIngredients.length === 0 ? (
                                <div className="py-20 text-center">
                                    <Trash size={48} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-gray-400 font-serif italic">{t('fridge.trash.empty')}</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {deletedIngredients.map((item) => (
                                        <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">
                                                    {item.category === 'Dairy' ? '🥛' :
                                                        item.category === 'Veggies' ? '🥬' :
                                                            item.category === 'Fruit' ? '🍎' :
                                                                item.category === 'Meat' ? '🥩' :
                                                                    item.category === 'Seafood' ? '🐟' :
                                                                        item.category === 'Pantry' ? '🥫' :
                                                                            item.category === 'Bakery' ? '🥖' :
                                                                                item.category === 'Grains' ? '🍝' :
                                                                                    item.category === 'Frozen' ? '❄️' : '📦'}
                                                </span>
                                                <span className="font-serif font-medium text-[#1B263B]">{translateIngredient(item.name)}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => restoreIngredient(item.id)}
                                                    className="p-2 bg-[#E3F2FD] text-[#0D47A1] rounded-lg hover:bg-[#BBDEFB] transition-colors"
                                                    title={t('fridge.trash.restore')}
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                                <button
                                                    onClick={() => permanentlyDeleteIngredient(item.id)}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    title={t('fridge.trash.delete_permanently')}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {deletedIngredients.length > 0 && (
                            <button
                                onClick={clearTrash}
                                className="w-full mt-6 py-3 border border-red-200 text-red-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-colors"
                            >
                                {t('fridge.trash.clear_all')}
                            </button>
                        )}
                    </div>
                </div>
            )}

            <header className="mb-8 flex justify-between items-center pt-2">
                <div>
                    <h1 className="text-3xl font-serif font-semibold text-[#1B263B] mb-1">{t('fridge.title')}</h1>
                    <p className="text-[#C5A059] text-xs font-medium tracking-widest uppercase">{t('fridge.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[#1B263B]/5 p-1 rounded-xl items-center gap-1 border border-[#1B263B]/10">
                        <button
                            onClick={() => changeLanguage('ko')}
                            className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${i18n.language.startsWith('ko') ? 'bg-[#1B263B] text-[#C5A059] shadow-sm' : 'text-[#1B263B]/40 hover:text-[#1B263B]'}`}
                        >
                            KO
                        </button>
                        <button
                            onClick={() => changeLanguage('en')}
                            className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${i18n.language.startsWith('en') ? 'bg-[#1B263B] text-[#C5A059] shadow-sm' : 'text-[#1B263B]/40 hover:text-[#1B263B]'}`}
                        >
                            EN
                        </button>
                    </div>
                    <Link to="/profile">
                        <div className="w-10 h-10 rounded-full bg-[#1B263B] text-[#C5A059] flex items-center justify-center font-serif font-bold shadow-md hover:scale-105 transition-transform cursor-pointer border border-[#C5A059]/20">
                            P
                        </div>
                    </Link>
                </div>
            </header>

            <div className="flex gap-3 mb-8">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C5A059] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder={t('fridge.searchPlaceholder')}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 focus:border-[#C5A059] focus:ring-0 outline-none transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`w-14 rounded-xl shadow-lg flex items-center justify-center transition-colors ${showFilters ? 'bg-[#C5A059] text-[#1B263B]' : 'bg-[#1B263B] text-[#C5A059] hover:bg-[#171717]'}`}
                >
                    <Filter size={20} />
                </button>
            </div>

            {/* Collapsible Category Filters */}
            <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-20 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
                <div className="flex gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar">
                    {['All', 'Veggies', 'Fruit', 'Meat', 'Seafood', 'Dairy', 'Bakery', 'Grains', 'Frozen', 'Pantry'].map((cat) => {
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap ${activeCategory === cat
                                    ? 'bg-[#C5A059] text-[#1B263B] shadow-md transform -translate-y-0.5 border border-[#C5A059]'
                                    : 'bg-white text-[#C5A059] border border-[#C5A059]/30 hover:bg-[#C5A059]/10'
                                    }`}
                            >
                                {t(`fridge.categories.${cat}`)}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-4">
                {filteredIngredients.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center justify-between hover:border-[#E3F2FD] transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#F9F7F2] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                {item.category === 'Dairy' ? '🥛' :
                                    item.category === 'Veggies' ? '🥬' :
                                        item.category === 'Fruit' ? '🍎' :
                                            item.category === 'Meat' ? '🥩' :
                                                item.category === 'Seafood' ? '🐟' :
                                                    item.category === 'Pantry' ? '🥫' :
                                                        item.category === 'Bakery' ? '🥖' :
                                                            item.category === 'Grains' ? '🍝' :
                                                                item.category === 'Frozen' ? '❄️' : '📦'}
                            </div>
                            <div>
                                <h3 className="font-serif font-medium text-[#1B263B] text-base">{translateIngredient(item.name)}</h3>
                                <div className="flex items-center mt-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getStatusColor(item.status)}`}>
                                        {translateExpiry(item.expiry)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => removeIngredient(item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            title={t('fridge.deleteItem') || "Delete Item"}
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Floating Action Buttons */}
            <div className="fixed bottom-24 left-6 right-6 z-40">
                <Link to="/recipes" className="block w-full">
                    <button className="w-full bg-[#1B263B] text-white py-4 rounded-xl font-medium shadow-xl shadow-[#1B263B]/30 hover:bg-[#171717] hover:shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                        <span className="text-[#C5A059]">✨</span>
                        <span className="font-serif tracking-wide">{t('fridge.recommendRecipe')}</span>
                    </button>
                </Link>
            </div>

            {/* Buttons - Swapped Positions */}
            <div className="fixed bottom-40 right-6 z-50 flex flex-col gap-4">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-14 h-14 bg-[#C5A059] rounded-full shadow-lg flex items-center justify-center text-[#1B263B] hover:bg-[#b08d4b] transition-all hover:scale-110 active:scale-95"
                >
                    <Plus size={24} />
                </button>
                <button
                    onClick={() => setIsTrashModalOpen(true)}
                    className="w-14 h-14 bg-[#1B263B] border border-[#C5A059]/30 rounded-full shadow-lg flex items-center justify-center text-[#C5A059] hover:bg-[#171717] transition-all hover:scale-110 active:scale-95 relative"
                >
                    <Trash size={24} />
                    {deletedIngredients.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#FAF9F6] animate-pulse">
                            {deletedIngredients.length}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Fridge;
