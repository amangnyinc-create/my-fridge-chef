import React, { createContext, useState, useContext } from 'react';

const PantryContext = createContext();

const initialMockIngredients = [
    { id: 1, name: 'Whole Milk', category: 'Dairy', expiry: '7 days', status: 'fresh' },
    { id: 2, name: 'Truffle Eggs', category: 'Dairy', expiry: '10 days', status: 'fresh' },
    { id: 3, name: 'Organic Kale', category: 'Veggies', expiry: 'Expiring Soon', status: 'warning' },
    { id: 4, name: 'Wagyu Beef', category: 'Meat', expiry: '2 days', status: 'warning' },
    { id: 5, name: 'Avocados', category: 'Veggies', expiry: 'Perfect', status: 'fresh' },
    { id: 6, name: 'Greek Yogurt', category: 'Dairy', expiry: 'Expired', status: 'expired' },
    { id: 7, name: 'Wild Salmon', category: 'Seafood', expiry: '1 day', status: 'warning' },
    { id: 8, name: 'Sourdough Bread', category: 'Bakery', expiry: '3 days', status: 'fresh' },
    { id: 9, name: 'Aged Balsamic', category: 'Pantry', expiry: 'Long term', status: 'fresh' },
    { id: 10, name: 'Pistachio Gelato', category: 'Frozen', expiry: '3 months', status: 'fresh' },
    { id: 11, name: 'Artisanal Linguine', category: 'Grains', expiry: '1 year', status: 'fresh' },
];

export const PantryProvider = ({ children }) => {
    // 1. Initialize ingredients from LocalStorage
    const [ingredients, setIngredients] = useState(() => {
        const saved = localStorage.getItem('myPantryIngredients');
        return saved ? JSON.parse(saved) : initialMockIngredients;
    });

    const [deletedIngredients, setDeletedIngredients] = useState(() => {
        const saved = localStorage.getItem('myPantryTrash');
        return saved ? JSON.parse(saved) : [];
    });

    // 2. Persist to LocalStorage whenever state changes
    React.useEffect(() => {
        localStorage.setItem('myPantryIngredients', JSON.stringify(ingredients));
    }, [ingredients]);

    React.useEffect(() => {
        localStorage.setItem('myPantryTrash', JSON.stringify(deletedIngredients));
    }, [deletedIngredients]);

    const addIngredient = (item) => {
        setIngredients(prev => [item, ...prev]);
    };

    const removeIngredient = (id) => {
        const itemToRemove = ingredients.find(item => item.id === id);
        if (itemToRemove) {
            setIngredients(prev => prev.filter(item => item.id !== id));
            setDeletedIngredients(prev => [itemToRemove, ...prev]);
        }
    };

    const restoreIngredient = (id) => {
        const itemToRestore = deletedIngredients.find(item => item.id === id);
        if (itemToRestore) {
            setDeletedIngredients(prev => prev.filter(item => item.id !== id));
            setIngredients(prev => [itemToRestore, ...prev]);
        }
    };

    const permanentlyDeleteIngredient = (id) => {
        setDeletedIngredients(prev => prev.filter(item => item.id !== id));
    };

    const clearTrash = () => {
        setDeletedIngredients([]);
    };

    const clearPantry = () => {
        if (ingredients.length === 0) return;
        if (window.confirm("Are you sure you want to empty your fridge? All items will be moved to trash.")) {
            setDeletedIngredients(prev => [...prev, ...ingredients]);
            setIngredients([]);
        }
    };

    return (
        <PantryContext.Provider value={{
            ingredients,
            deletedIngredients,
            addIngredient,
            removeIngredient,
            restoreIngredient,
            permanentlyDeleteIngredient,
            clearTrash,
            clearPantry
        }}>
            {children}
        </PantryContext.Provider>
    );
};

export const usePantry = () => useContext(PantryContext);
