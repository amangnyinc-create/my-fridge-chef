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
    setDoc,
    getDocs,
    where
} from 'firebase/firestore';

const PantryContext = createContext();

export const usePantry = () => useContext(PantryContext);

export const PantryProvider = ({ children }) => {
    const { user } = useAuth();

    // Core State
    const [ingredients, setIngredients] = useState([]);
    const [deletedIngredients, setDeletedIngredients] = useState([]);
    const [loading, setLoading] = useState(true);

    // =========================================================================
    // 1. FUNDAMENTAL SYNC LOGIC (The "Engine")
    // =========================================================================
    useEffect(() => {
        let unsubscribePantry = () => { };
        let unsubscribeTrash = () => { };

        const initializePantry = async () => {
            setLoading(true);

            if (user && db) {
                // --- FIRESTORE MODE (Authenticated) ---
                console.log("� Authenticated! Connecting to Firestore...");

                // A. Migration Check (Run ONCE on mount/login - Background)
                performMigration(user).catch(e => console.error("Migration Error:", e));

                // B. Pantry Subscription (Real-time)
                const pantryRef = collection(db, 'users', user.uid, 'pantry');
                // Simple query to avoid index issues initially
                const qPantry = query(pantryRef);

                unsubscribePantry = onSnapshot(qPantry, (snapshot) => {
                    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    console.log("📦 Firestore Pantry Updated:", items.length, "items");
                    setIngredients(items);
                    setLoading(false);
                }, (error) => {
                    console.error("❌ Firestore Pantry Error:", error);
                    alert("Error connecting to pantry server. Check connection.");
                    setLoading(false);
                });

                // C. Trash Subscription (Real-time)
                const trashRef = collection(db, 'users', user.uid, 'trash');
                const qTrash = query(trashRef);

                unsubscribeTrash = onSnapshot(qTrash, (snapshot) => {
                    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    console.log("🗑️ Firestore Trash Updated:", items.length, "items");
                    setDeletedIngredients(items);
                }, (error) => {
                    console.error("❌ Firestore Trash Error:", error);
                });

            } else {
                // --- LOCAL STORAGE MODE (Guest) ---
                console.log("💾 Quest Mode! Using LocalStorage.");

                const localData = localStorage.getItem('myPantryIngredients');
                const localTrash = localStorage.getItem('myPantryTrash');

                if (localData) setIngredients(JSON.parse(localData));
                else setIngredients([]); // Start empty, no mocks to confuse user

                if (localTrash) setDeletedIngredients(JSON.parse(localTrash));
                else setDeletedIngredients([]);

                setLoading(false);
            }
        };

        initializePantry();

        return () => {
            unsubscribePantry();
            unsubscribeTrash();
        };
    }, [user]); // Re-run whenever User changes

    // =========================================================================
    // 2. MIGRATION LOGIC (Clean & Explicit)
    // =========================================================================
    const performMigration = async (currentUser) => {
        if (!currentUser) return;

        const localPantry = JSON.parse(localStorage.getItem('myPantryIngredients') || '[]');
        const localTrash = JSON.parse(localStorage.getItem('myPantryTrash') || '[]');

        if (localPantry.length === 0 && localTrash.length === 0) return; // Nothing to do

        console.log("🚚 Detected Local Data. Starting Migration...");

        // 1. Fetch Existing Firestore Items (To prevent duplicates)
        let existingNames = new Set();
        try {
            const snapshot = await getDocs(collection(db, 'users', currentUser.uid, 'pantry'));
            snapshot.docs.forEach(doc => existingNames.add(doc.data().name));
        } catch (e) {
            console.error("⚠️ Failed to check duplicates:", e);
        }

        // 2. Migrate Pantry
        const failedPantry = [];
        for (const item of localPantry) {
            if (existingNames.has(item.name)) {
                console.log(`⏩ Skipping duplicate: ${item.name}`);
                continue; // Skip without error
            }
            try {
                const { id, ...data } = item;
                await addDoc(collection(db, 'users', currentUser.uid, 'pantry'), {
                    ...data,
                    dateAdded: new Date().toISOString()
                });
                console.log(`✅ Migrated: ${item.name}`);
            } catch (e) {
                console.error(`❌ Failed to migrate ${item.name}:`, e);
                failedPantry.push(item);
                if (String(e).includes("permission-denied")) {
                    alert("Migration Stopped: Permission Denied.");
                    break;
                }
            }
        }

        // 3. Migrate Trash
        const failedTrash = [];
        for (const item of localTrash) {
            try {
                const { id, ...data } = item;
                // Use addDoc for trash to avoid ID conflict
                await addDoc(collection(db, 'users', currentUser.uid, 'trash'), {
                    ...data,
                    dateDeleted: new Date().toISOString()
                });
            } catch (e) {
                console.error("❌ Failed to migrate trash item:", e);
                failedTrash.push(item);
            }
        }

        // 4. Cleanup Local Storage
        if (failedPantry.length === 0) {
            localStorage.removeItem('myPantryIngredients');
        } else {
            localStorage.setItem('myPantryIngredients', JSON.stringify(failedPantry));
            alert(`Migration incomplete. ${failedPantry.length} items remain locally.`);
        }

        if (failedTrash.length === 0) {
            localStorage.removeItem('myPantryTrash');
        } else {
            localStorage.setItem('myPantryTrash', JSON.stringify(failedTrash));
        }
    };


    // =========================================================================
    // 3. CORE ACTIONS (CRUD) - Robust & Transactional-like
    // =========================================================================

    const addIngredient = async (item) => {
        // Validation
        if (!item.name) return;

        if (user && db) {
            try {
                // A. Check Duplicate
                const q = query(collection(db, 'users', user.uid, 'pantry'), where("name", "==", item.name));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    alert(`'${item.name}' is already in your pantry!`);
                    return;
                }

                // B. Add
                const { id, ...data } = item;
                await addDoc(collection(db, 'users', user.uid, 'pantry'), {
                    ...data,
                    dateAdded: new Date().toISOString()
                });
                // Success! (onSnapshot will update UI)
            } catch (e) {
                console.error("Error adding ingredient:", e);
                alert("Failed to save. Check internet connection.");
            }
        } else {
            // Local
            if (ingredients.some(i => i.name === item.name)) return;
            const newItem = { ...item, id: Date.now() };
            const newStats = [newItem, ...ingredients];
            setIngredients(newStats);
            localStorage.setItem('myPantryIngredients', JSON.stringify(newStats));
        }
    };

    const removeIngredient = async (id) => {
        // Robust ID Find
        const item = ingredients.find(i => String(i.id) === String(id));
        if (!item) return;

        if (user && db) {
            try {
                // A. Add to Trash FIRST
                await addDoc(collection(db, 'users', user.uid, 'trash'), {
                    ...item,
                    originalId: id, // Keep reference if needed
                    dateDeleted: new Date().toISOString()
                });

                // B. Delete from Pantry
                await deleteDoc(doc(db, 'users', user.uid, 'pantry', String(id)));

                console.log("✅ Moved to trash & deleted.");
            } catch (e) {
                console.error("Error deleting ingredient:", e);
                alert("Failed to delete. Try again.");
            }
        } else {
            // Local
            const newIngredients = ingredients.filter(i => String(i.id) !== String(id));
            setIngredients(newIngredients);
            localStorage.setItem('myPantryIngredients', JSON.stringify(newIngredients));

            const newTrash = [{ ...item, dateDeleted: new Date().toISOString() }, ...deletedIngredients];
            setDeletedIngredients(newTrash);
            localStorage.setItem('myPantryTrash', JSON.stringify(newTrash));
        }
    };

    const restoreIngredient = async (id) => {
        // Note: id here is the TRASH doc id
        const item = deletedIngredients.find(i => String(i.id) === String(id));
        if (!item) return;

        if (user && db) {
            try {
                // A. Check Duplicate in Pantry before restoring
                const q = query(collection(db, 'users', user.uid, 'pantry'), where("name", "==", item.name));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    if (!confirm(`'${item.name}' is already in pantry. Restore anyway?`)) return;
                }

                // B. Add to Pantry
                const { dateDeleted, originalId, id: trashId, ...itemData } = item;
                await addDoc(collection(db, 'users', user.uid, 'pantry'), {
                    ...itemData,
                    dateAdded: new Date().toISOString()
                });

                // C. Remove from Trash
                await deleteDoc(doc(db, 'users', user.uid, 'trash', String(trashId)));

                console.log("✅ Restored successfully.");
            } catch (e) {
                console.error("Error restoring ingredient:", e);
                alert("Failed to restore. Try again.");
            }
        } else {
            // Local
            const newTrash = deletedIngredients.filter(i => String(i.id) !== String(id));
            setDeletedIngredients(newTrash);
            localStorage.setItem('myPantryTrash', JSON.stringify(newTrash));

            const { dateDeleted, ...rest } = item;
            const newPantry = [{ ...rest, dateAdded: new Date().toISOString() }, ...ingredients];
            setIngredients(newPantry);
            localStorage.setItem('myPantryIngredients', JSON.stringify(newPantry));
        }
    };

    const permanentlyDeleteIngredient = async (id) => {
        if (user && db) {
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'trash', String(id)));
            } catch (e) {
                console.error("Error permanently deleting:", e);
                alert("Failed to delete permanently.");
            }
        } else {
            const newTrash = deletedIngredients.filter(i => String(i.id) !== String(id));
            setDeletedIngredients(newTrash);
            localStorage.setItem('myPantryTrash', JSON.stringify(newTrash));
        }
    };

    const clearTrash = async () => {
        if (user && db) {
            if (!confirm("Empty Trash? This cannot be undone.")) return;
            try {
                // Batch delete manually since client SDK has no deleteCollection
                const snapshot = await getDocs(collection(db, 'users', user.uid, 'trash'));
                const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
                await Promise.all(deletePromises);
            } catch (e) {
                console.error("Error clearing trash:", e);
                alert("Failed to clear trash.");
            }
        } else {
            setDeletedIngredients([]);
            localStorage.removeItem('myPantryTrash');
        }
    };

    const updateIngredient = async (id, updates) => {
        if (user && db) {
            try {
                const docRef = doc(db, 'users', user.uid, 'pantry', String(id));
                await updateDoc(docRef, updates);
            } catch (e) {
                console.error("Error updating:", e);
            }
        } else {
            const updated = ingredients.map(item => item.id === id ? { ...item, ...updates } : item);
            setIngredients(updated);
            localStorage.setItem('myPantryIngredients', JSON.stringify(updated));
        }
    };

    // Legacy helper kept for compatibility if needed (can be removed if unused)
    const restoreDefaultIngredients = async () => {
        // Placeholder
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
        loading,
        migrateLocalData: () => performMigration(user),
        restoreDefaultIngredients
    };

    return (
        <PantryContext.Provider value={value}>
            {children}
        </PantryContext.Provider>
    );
};
