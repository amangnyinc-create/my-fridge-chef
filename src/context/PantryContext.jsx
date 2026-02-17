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
    orderBy,
    setDoc
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
    const [deletedIngredients, setDeletedIngredients] = useState([]); // Trash Bin
    const [loading, setLoading] = useState(true);

    // Migration Logic (Exposed)
    const migrateLocalData = async () => {
        if (!user || !db) return;

        // Check for local data to migrate
        let localPantry = JSON.parse(localStorage.getItem('myPantryIngredients') || '[]');
        let localTrash = JSON.parse(localStorage.getItem('myPantryTrash') || '[]');

        // 1. Migrate Pantry Items
        if (localPantry.length > 0) {
            console.log("🚚 Migrating local pantry to Firestore...");
            const remainingPantry = [];

            for (let i = 0; i < localPantry.length; i++) {
                const item = localPantry[i];
                try {
                    const { id, ...data } = item;
                    await addDoc(collection(db, 'users', user.uid, 'pantry'), {
                        ...data,
                        dateAdded: item.dateAdded || new Date().toISOString()
                    });
                    // Success! Item is successfully moved to Cloud, so we drop it from Local.
                } catch (e) {
                    console.error("Migration Error (Item):", e);
                    remainingPantry.push(item); // Keep failed item

                    if (e.code === 'permission-denied') {
                        // Critical Auth Error: Stop trying, and preserve ALL remaining items locally.
                        console.warn("Permission Denied. Stopping migration.");
                        for (let j = i + 1; j < localPantry.length; j++) {
                            remainingPantry.push(localPantry[j]);
                        }
                        break;
                    }
                }
            }

            // Update Local Storage with only failed/remaining items
            if (remainingPantry.length === 0) {
                localStorage.removeItem('myPantryIngredients');
                console.log("✅ Pantry Migration Complete (All Success)");
            } else {
                localStorage.setItem('myPantryIngredients', JSON.stringify(remainingPantry));
                console.warn("⚠️ Pantry Migration Partial. Remaining:", remainingPantry.length);
            }
        }

        // 2. Migrate Trash Items
        if (localTrash.length > 0) {
            console.log("🚚 Migrating local trash to Firestore...");
            const remainingTrash = [];

            for (const item of localTrash) {
                try {
                    const { id, ...data } = item;
                    await setDoc(doc(db, 'users', user.uid, 'trash', String(id)), {
                        ...data,
                        dateDeleted: item.dateDeleted || new Date().toISOString()
                    });
                } catch (e) {
                    console.error("Migration Trash Error:", e);
                    remainingTrash.push(item);
                }
            }

            if (remainingTrash.length === 0) {
                localStorage.removeItem('myPantryTrash');
                console.log("✅ Trash Migration Complete");
            } else {
                localStorage.setItem('myPantryTrash', JSON.stringify(remainingTrash));
            }
        }
    };

    // Sync Logic
    useEffect(() => {
        setLoading(true); // Prevent flickering (show loading while switching modes)
        let unsubscribePantry = () => { };
        let unsubscribeTrash = () => { };

        if (user && db) {
            // Firestore Mode (Real Cloud Sync)

            // Try Migration first
            migrateLocalData();

            // 1. Pantry Subscription
            const pantryRef = collection(db, 'users', user.uid, 'pantry');
            const qPantry = query(pantryRef, orderBy('dateAdded', 'desc'));
            unsubscribePantry = onSnapshot(qPantry, (snapshot) => {
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setIngredients(items);
                setLoading(false);
            }, (error) => {
                console.error("Firestore Pantry Error:", error);
                setLoading(false);
            });

            // 2. Trash Subscription
            const trashRef = collection(db, 'users', user.uid, 'trash');
            const qTrash = query(trashRef, orderBy('dateDeleted', 'desc'));
            unsubscribeTrash = onSnapshot(qTrash, (snapshot) => {
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setDeletedIngredients(items);
            }, (error) => console.error("Firestore Trash Error:", error));

        } else {
            // Local Storage Mode (Guest / Offline)
            const savedPantry = localStorage.getItem('myPantryIngredients');
            const savedTrash = localStorage.getItem('myPantryTrash');

            if (savedPantry) setIngredients(JSON.parse(savedPantry));
            else setIngredients([]); // Don't use mock data to avoid confusion

            if (savedTrash) setDeletedIngredients(JSON.parse(savedTrash));
            else setDeletedIngredients([]);

            setLoading(false);
        }

        return () => {
            unsubscribePantry();
            unsubscribeTrash();
        };
    }, [user]);

    // Save helpers
    const saveLocalPantry = (items) => {
        localStorage.setItem('myPantryIngredients', JSON.stringify(items));
        setIngredients(items);
    };
    const saveLocalTrash = (items) => {
        localStorage.setItem('myPantryTrash', JSON.stringify(items));
        setDeletedIngredients(items);
    };

    const addIngredient = async (item) => {
        if (user && db) {
            try {
                const { id, ...data } = item;
                await addDoc(collection(db, 'users', user.uid, 'pantry'), {
                    ...data,
                    dateAdded: new Date().toISOString()
                });
            } catch (e) {
                console.error("Error adding doc:", e);
            }
        } else {
            const newItem = { ...item, id: Date.now() };
            saveLocalPantry([newItem, ...ingredients]);
        }
    };

    const removeIngredient = async (id) => {
        const itemToRemove = ingredients.find(i => i.id === id);
        if (!itemToRemove) return;

        if (user && db) {
            try {
                // 1. Delete from Pantry
                await deleteDoc(doc(db, 'users', user.uid, 'pantry', String(id)));
                // 2. Add to Trash
                try {
                    await setDoc(doc(db, 'users', user.uid, 'trash', String(id)), {
                        ...itemToRemove,
                        dateDeleted: new Date().toISOString()
                    });
                } catch (e) { console.error("Error moving to trash:", e); }
            } catch (e) { console.error("Error deleting doc:", e); }
        } else {
            // Local
            const filtered = ingredients.filter(item => item.id !== id);
            saveLocalPantry(filtered);
            const trashItem = { ...itemToRemove, dateDeleted: new Date().toISOString() };
            saveLocalTrash([trashItem, ...deletedIngredients]);
        }
    };

    const restoreIngredient = async (id) => {
        const itemToRestore = deletedIngredients.find(i => i.id === id);
        if (!itemToRestore) return;

        if (user && db) {
            try {
                // 1. Delete from Trash
                await deleteDoc(doc(db, 'users', user.uid, 'trash', String(id)));
                // 2. Add to Pantry
                const { dateDeleted, ...rest } = itemToRestore;
                await setDoc(doc(db, 'users', user.uid, 'pantry', String(id)), {
                    ...rest,
                    dateAdded: new Date().toISOString()
                });
            } catch (e) { console.error("Error restoring:", e); }
        } else {
            // Local
            const filteredTrash = deletedIngredients.filter(i => i.id !== id);
            saveLocalTrash(filteredTrash);
            const { dateDeleted, ...rest } = itemToRestore;
            // re-add with original ID if possible, or new ID to avoid conflict? 
            // Local logic simplified:
            saveLocalPantry([{ ...rest, dateAdded: new Date().toISOString() }, ...ingredients]);
        }
    };

    const permanentlyDeleteIngredient = async (id) => {
        if (user && db) {
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'trash', String(id)));
            } catch (e) { console.error("Error perm delete:", e); }
        } else {
            const filteredTrash = deletedIngredients.filter(i => i.id !== id);
            saveLocalTrash(filteredTrash);
        }
    };

    const clearTrash = async () => {
        if (user && db) {
            // Batch delete not implemented for brevity, just loop
            deletedIngredients.forEach(async (item) => {
                try {
                    await deleteDoc(doc(db, 'users', user.uid, 'trash', String(item.id)));
                } catch (e) { console.error("Error clearing trash item:", e); }
            });
        } else {
            saveLocalTrash([]);
        }
    };

    const updateIngredient = async (id, updates) => {
        if (user && db) {
            try {
                const docRef = doc(db, 'users', user.uid, 'pantry', String(id));
                await updateDoc(docRef, updates);
            } catch (e) { console.error("Error updating doc:", e); }
        } else {
            const updated = ingredients.map(item => item.id === id ? { ...item, ...updates } : item);
            saveLocalPantry(updated);
        }
    };

    const value = {
        ingredients,
        deletedIngredients,
        addIngredient,
        removeIngredient,
        restoreIngredient,
        permanentlyDeleteIngredient,
        clearTrash,
        updateIngredient,
        migrateLocalData, // Exposed for manual sync
        loading
    };

    return (
        <PantryContext.Provider value={value}>
            {children}
        </PantryContext.Provider>
    );
};
