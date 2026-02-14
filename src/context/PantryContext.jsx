import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import {
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    orderBy
} from 'firebase/firestore';

const PantryContext = createContext();

export const usePantry = () => useContext(PantryContext);

// Fallback Mock Data for new local users
const initialMockIngredients = [
    { id: 1, name: 'Whole Milk', category: 'Dairy', expiry: '7 days', status: 'fresh' },
    { id: 2, name: 'Truffle Eggs', category: 'Dairy', expiry: '10 days', status: 'fresh' },
];

export const PantryProvider = ({ children }) => {
    const { user } = useAuth();
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sync Logic
    useEffect(() => {
        let unsubscribe = () => { };

        if (user && db) {
            // Firestore Mode (Real Cloud Sync)
            const pantryRef = collection(db, 'users', user.uid, 'pantry');
            const q = query(pantryRef, orderBy('dateAdded', 'desc'));

            unsubscribe = onSnapshot(q, (snapshot) => {
                const items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setIngredients(items);
                setLoading(false);
            }, (error) => {
                console.error("Firestore Error:", error);
                setLoading(false);
            });
        } else {
            // Local Storage Mode
            const saved = localStorage.getItem('myPantryIngredients');
            if (saved) {
                setIngredients(JSON.parse(saved));
            } else {
                setIngredients(initialMockIngredients);
            }
            setLoading(false);
        }

        return () => unsubscribe();
    }, [user]);

    // Save to LocalStorage helper (only for local mode)
    const saveLocal = (items) => {
        localStorage.setItem('myPantryIngredients', JSON.stringify(items));
        setIngredients(items);
    };

    const addIngredient = async (item) => {
        if (user && db) {
            // Firestore Add
            try {
                // Remove id if present, let Firestore generate it? 
                // Or keep it if it's meaningful. Firestore auto-ID is better.
                const { id, ...data } = item;
                await addDoc(collection(db, 'users', user.uid, 'pantry'), {
                    ...data,
                    dateAdded: new Date().toISOString()
                });
            } catch (e) {
                console.error("Error adding doc:", e);
            }
        } else {
            // Local Add
            const newItem = { ...item, id: Date.now() }; // Local ID
            saveLocal([newItem, ...ingredients]);
        }
    };

    const removeIngredient = async (id) => {
        if (user && db) {
            // Firestore Delete
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'pantry', String(id)));
            } catch (e) {
                console.error("Error deleting doc:", e);
                // Fallback: maybe id was local?
            }
        } else {
            // Local Delete
            const filtered = ingredients.filter(item => item.id !== id);
            saveLocal(filtered);
        }
    };

    const updateIngredient = async (id, updates) => {
        if (user && db) {
            try {
                const docRef = doc(db, 'users', user.uid, 'pantry', String(id));
                await updateDoc(docRef, updates);
            } catch (e) {
                console.error("Error updating doc:", e);
            }
        } else {
            const updated = ingredients.map(item => item.id === id ? { ...item, ...updates } : item);
            saveLocal(updated);
        }
    };

    return (
        <PantryContext.Provider value={{ ingredients, addIngredient, removeIngredient, updateIngredient, loading }}>
            {children}
        </PantryContext.Provider>
    );
};
