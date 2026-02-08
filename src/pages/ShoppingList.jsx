import React, { useState } from 'react';
import { ShoppingCart, Plus, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePantry } from '../context/PantryContext';

const ShoppingList = () => {
    const { t } = useTranslation();
    const { addIngredient } = usePantry();
    // Standard categories matching Fridge.jsx
    const CATEGORIES = ['Veggies', 'Fruit', 'Meat', 'Seafood', 'Dairy', 'Bakery', 'Grains', 'Frozen', 'Pantry', 'Unsorted'];

    const formatKey = (str) => str.toLowerCase().replace(/\s+/g, '_');

    const translateIngredient = (name) => {
        const key = `ingredients.${formatKey(name)}`;
        const translated = t(key);
        return translated === key ? name : translated;
    };

    const [items, setItems] = useState([
        { id: 1, name: 'Parmigiano Reggiano', category: 'Dairy', checked: false },
        { id: 2, name: 'Fresh Basil', category: 'Veggies', checked: false },
        { id: 3, name: 'Extra Virgin Olive Oil', category: 'Pantry', checked: false },
        { id: 4, name: 'Shallots', category: 'Veggies', checked: true },
        { id: 5, name: 'Wagyu Beef', category: 'Meat', checked: false },
    ]);

    const [newItemText, setNewItemText] = useState('');

    const toggleCheck = (id) => {
        setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    };

    const deleteItem = (id) => {
        setItems(items.filter(i => i.id !== id));
    };

    const addItem = () => {
        const name = newItemText.trim();
        if (!name) return;

        let category = 'Unsorted';
        const lowerName = name.toLowerCase();

        if (['milk', 'cheese', 'yogurt', 'cream', 'butter', 'egg'].some(k => lowerName.includes(k))) category = 'Dairy';
        else if (['beef', 'chicken', 'pork', 'steak', 'lamb', 'bacon'].some(k => lowerName.includes(k))) category = 'Meat';
        else if (['fish', 'salmon', 'tuna', 'shrimp', 'crab', 'clam'].some(k => lowerName.includes(k))) category = 'Seafood';
        else if (['bread', 'toast', 'bagel', 'croissant', 'muffin'].some(k => lowerName.includes(k))) category = 'Bakery';
        else if (['rice', 'pasta', 'noodle', 'oat', 'quinoa'].some(k => lowerName.includes(k))) category = 'Grains';
        else if (['apple', 'banana', 'orange', 'grape', 'berry', 'lemon'].some(k => lowerName.includes(k))) category = 'Fruit';
        else if (['lettuce', 'kale', 'spinach', 'carrot', 'onion', 'garlic', 'potato', 'tomato', 'basil'].some(k => lowerName.includes(k))) category = 'Veggies';
        else if (['ice cream', 'pizza', 'frozen'].some(k => lowerName.includes(k))) category = 'Frozen';
        else if (['oil', 'sauce', 'spice', 'salt', 'sugar', 'flour', 'can'].some(k => lowerName.includes(k))) category = 'Pantry';

        setItems([...items, { id: Date.now(), name, category, checked: false }]);
        setNewItemText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            addItem();
        }
    };

    const stockFridge = () => {
        const checkedItems = items.filter(item => item.checked);
        if (checkedItems.length === 0) return;

        checkedItems.forEach(item => {
            addIngredient({
                id: Date.now() + Math.random(),
                name: item.name,
                category: item.category === 'Unsorted' ? 'Pantry' : item.category,
                expiry: 'Fresh',
                status: 'fresh'
            });
        });

        // Remove stocked items from shopping list
        setItems(items.filter(item => !item.checked));
    };

    return (
        <div className="p-6 pb-32 min-h-screen bg-[#FAF9F6] font-sans">
            <header className="mb-8 pt-2">
                <h1 className="text-3xl font-serif font-semibold text-[#1B263B] mb-1">{t('shopping.title')}</h1>
                <p className="text-[#C5A059] text-xs font-medium tracking-widest uppercase">{t('shopping.subtitle')}</p>
            </header>

            <div className="bg-white rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-4 mb-8 flex items-center gap-4 border border-gray-50 focus-within:border-[#C5A059] focus-within:shadow-md transition-all">
                <button
                    onClick={addItem}
                    className="bg-[#FAF9F6] p-2 rounded-full hover:bg-[#C5A059]/10 transition-colors active:scale-90"
                >
                    <Plus size={20} className="text-[#C5A059]" />
                </button>
                <input
                    type="text"
                    placeholder={t('shopping.placeholder')}
                    className="flex-1 bg-transparent border-none outline-none text-[#1B263B] placeholder-gray-400 font-serif text-lg"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            <div className="space-y-8">
                {CATEGORIES.map(category => {
                    const categoryItems = items.filter(item => item.category === category);
                    if (categoryItems.length === 0) return null;

                    return (
                        <div key={category} className="animate-fade-in">
                            <h2 className="text-xs font-bold uppercase text-[#C5A059] mb-4 ml-1 tracking-widest border-b border-[#C5A059]/20 pb-2 inline-block pr-8">
                                {category === 'Veggies' ? 'Vegetables & Herbs' : category}
                            </h2>
                            <div className="space-y-3">
                                {categoryItems.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleCheck(item.id)}
                                        className={`p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer group border border-transparent
                                            ${item.checked
                                                ? 'bg-gray-50 opacity-50'
                                                : 'bg-white shadow-[0_2px_10px_-5px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-[#E3F2FD]'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                                                    ${item.checked
                                                        ? 'bg-[#1B263B] border-[#1B263B] scale-100'
                                                        : 'border-[#C5A059]/50 group-hover:border-[#C5A059] scale-90'}`}
                                            >
                                                {item.checked && <span className="text-white text-[10px] font-bold">✓</span>}
                                            </div>
                                            <span className={`font-serif text-lg transition-all ${item.checked ? 'text-gray-400 line-through decoration-[#C5A059]/50' : 'text-[#1B263B]'}`}>
                                                {translateIngredient(item.name)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={stockFridge}
                className="fixed bottom-24 left-6 right-6 bg-[#C5A059] text-[#1B263B] py-4 rounded-xl font-bold shadow-xl shadow-[#C5A059]/30 hover:bg-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 z-50 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                disabled={items.filter(i => i.checked).length === 0}
            >
                <ShoppingCart size={20} />
                <span className="font-serif tracking-wide">{t('shopping.stockFridge')}</span>
            </button>
        </div>
    );
};

export default ShoppingList;
