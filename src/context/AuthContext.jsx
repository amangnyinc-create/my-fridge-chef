import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in (persisted in localStorage)
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const signup = async (name, email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    if (users.find(u => u.email === email)) {
                        throw new Error('Email already registered');
                    }

                    const newUser = { name, email, password };
                    users.push(newUser);
                    localStorage.setItem('users', JSON.stringify(users));

                    // Auto login after signup
                    const userSession = { name, email };
                    localStorage.setItem('currentUser', JSON.stringify(userSession));
                    setUser(userSession);

                    resolve(userSession);
                } catch (error) {
                    reject(error);
                }
            }, 800); // Simulate network delay
        });
    };

    const login = async (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    const foundUser = users.find(u => u.email === email && u.password === password);

                    if (foundUser) {
                        const userSession = { name: foundUser.name, email: foundUser.email };
                        localStorage.setItem('currentUser', JSON.stringify(userSession));
                        setUser(userSession);
                        resolve(userSession);
                    } else {
                        throw new Error('Invalid email or password');
                    }
                } catch (error) {
                    reject(error);
                }
            }, 800);
        });
    };

    const logout = () => {
        localStorage.removeItem('currentUser');
        setUser(null);
    };

    const value = {
        user,
        signup,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
