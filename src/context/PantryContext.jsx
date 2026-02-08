import React, { createContext, useState, useContext } from 'react';

const PantryContext = createContext();

export const PantryProvider = ({ children }) => {
    const [ingredients, setIngredients] = useState([
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
    ]);

    const [deletedIngredients, setDeletedIngredients] = useState([]);

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

    return (
        <PantryContext.Provider value={{
            ingredients,
            deletedIngredients,
            addIngredient,
            removeIngredient,
            restoreIngredient,
            permanentlyDeleteIngredient,
            clearTrash
        }}>
            {children}
        </PantryContext.Provider>
    );
};

export const usePantry = () => useContext(PantryContext);
