import React, { createContext, useState, useContext, useEffect } from 'react';
import i18n from '../i18n';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile as updateFirebaseProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial Auth State Observer
    // Initial Auth State Observer
    useEffect(() => {
        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
                if (authUser) {
                    // 1. FAST PATH: Set basic user immediately to unblock UI
                    setUser(prev => ({
                        ...prev, // Keep existing if any
                        ...authUser,
                        name: authUser.displayName || authUser.email.split('@')[0],
                        id: authUser.uid
                    }));
                    setLoading(false); // <--- UNBLOCK UI HERE!

                    // 2. SLOW PATH: Fetch extended profile in background
                    if (db) {
                        try {
                            const userDoc = await getDoc(doc(db, "users", authUser.uid));
                            if (userDoc.exists()) {
                                // Update state with extended data (silently)
                                setUser(prev => ({
                                    ...prev,
                                    ...userDoc.data()
                                }));
                            }
                        } catch (e) { console.error("Error fetching background profile:", e); }
                    }
                } else {
                    setUser(null);
                    setLoading(false);
                }
            });
            return () => unsubscribe();
        } else {
            // Local Mock Mode Fallback
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (!parsed.id) parsed.id = `local_${Date.now()}`;
                setUser(parsed);
            }
            setLoading(false);
        }
    }, []);

    const signup = async (name, email, password) => {
        if (auth) {
            try {
                console.log("🔥 Starting Firebase Signup...");
                const result = await createUserWithEmailAndPassword(auth, email, password);
                console.log("✅ User Created:", result.user.uid);

                try {
                    await updateFirebaseProfile(result.user, { displayName: name });
                    console.log("✅ Profile Updated");
                } catch (e) {
                    console.error("⚠️ Profile Update Failed (Non-critical):", e);
                }

                if (db) {
                    try {
                        console.log("⏳ Writing to Firestore...");
                        await setDoc(doc(db, "users", result.user.uid), {
                            name,
                            email,
                            joinedAt: new Date(),
                            preferences: {},
                            dietaryPreferences: [],
                            notifications: true
                        });
                        console.log("✅ Firestore Write Success");
                    } catch (dbError) {
                        console.error("❌ Firestore Write Failed (Database might not be created):", dbError);
                        // Continue anyway
                    }
                } else {
                    console.warn("⚠️ Firestore (db) not initialized.");
                }

                return result.user;
            } catch (error) {
                console.error("❌ Signup Global Error:", error);
                throw error;
            }
        } else {
            // Local Mock Signup
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    if (users.find(u => u.email === email)) return reject(new Error('Email already registered (Local)'));

                    const newUser = {
                        id: `local_${Date.now()}`,
                        name,
                        email,
                        password,
                        language: i18n?.language || 'en',
                        dietaryPreferences: [],
                        notifications: true
                    };

                    users.push(newUser);
                    localStorage.setItem('users', JSON.stringify(users));

                    const { password: _, ...session } = newUser;
                    localStorage.setItem('currentUser', JSON.stringify(session));
                    setUser(session);
                    resolve(session);
                }, 800);
            });
        }
    };

    const login = async (email, password) => {
        if (auth) {
            try {
                const result = await signInWithEmailAndPassword(auth, email, password);
                return result.user;
            } catch (error) {
                console.error("Login Error:", error);
                throw error;
            }
        } else {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    const found = users.find(u => u.email === email && u.password === password);
                    if (found) {
                        const { password, ...session } = found;
                        if (!session.id) session.id = `local_${Date.now()}`;
                        localStorage.setItem('currentUser', JSON.stringify(session));
                        setUser(session);
                        resolve(session);
                    } else reject(new Error('Invalid credentials (Local)'));
                }, 800);
            });
        }
    };

    const logout = async () => {
        if (auth) {
            await signOut(auth);
            setUser(null);
        } else {
            localStorage.removeItem('currentUser');
            setUser(null);
        }
    };

    const resetPassword = async (email) => {
        if (auth) {
            await sendPasswordResetEmail(auth, email);
            return "Email Sent";
        } else {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    const found = users.find(u => u.email === email);
                    if (found) {
                        const newPass = "password123";
                        const newUsers = users.map(u => u.email === email ? { ...u, password: newPass } : u);
                        localStorage.setItem('users', JSON.stringify(newUsers));
                        resolve(newPass);
                    } else reject(new Error("Email not found"));
                }, 500);
            });
        }
    };

    const updateProfile = async (updates) => {
        if (auth && user) {
            try {
                // 1. OPTIMISTIC UPDATE: Update UI Immediately!
                setUser(prev => ({ ...prev, ...updates }));

                // 2. Update Display Name in Auth (if changed)
                if (updates.name && updates.name !== user.name) {
                    await updateFirebaseProfile(auth.currentUser, { displayName: updates.name });
                }

                // 3. Update Firestore (Background)
                if (db) {
                    const userRef = doc(db, 'users', user.uid);
                    // setDoc with merge handles updates safely even if doc missing
                    await setDoc(userRef, updates, { merge: true });
                }

            } catch (e) {
                console.error("Profile Update Failed:", e);
                throw e;
            }
        } else if (user) {
            // Local Mode
            const updated = { ...user, ...updates };
            setUser(updated);
            localStorage.setItem('currentUser', JSON.stringify(updated));
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const newUsers = users.map(u => u.email === user.email ? { ...u, ...updates } : u);
            localStorage.setItem('users', JSON.stringify(newUsers));
        }
    };

    const changePassword = async (newPassword) => {
        if (auth) {
            const { updatePassword } = await import('firebase/auth');
            if (auth.currentUser) await updatePassword(auth.currentUser, newPassword);
        } else if (user) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const newUsers = users.map(u => u.email === user.email ? { ...u, password: newPassword } : u);
            localStorage.setItem('users', JSON.stringify(newUsers));
        }
    };

    const value = {
        user,
        signup,
        login,
        logout,
        resetPassword,
        updateProfile,
        changePassword,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
