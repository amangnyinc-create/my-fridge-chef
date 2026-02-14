import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Fridge from './pages/Fridge';
import RecipeAssistant from './pages/RecipeAssistant';
import ShoppingList from './pages/ShoppingList';
import FridgeScanner from './pages/FridgeScanner';
import Profile from './pages/Profile';

import { PantryProvider } from './context/PantryContext';
import { AuthProvider, useAuth } from './context/AuthContext'; // Import Auth

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Create a layout component to conditionally render Navbar
const Layout = ({ children }) => {
    const location = useLocation();
    // Hide navbar on welcome, login, and signup pages
    const hideNavbar = ['/', '/login', '/signup'].includes(location.pathname);

    return (
        <>
            {children}
            {!hideNavbar && <Navbar />}
        </>
    );
};

function App() {
    return (
        <AuthProvider>
            <PantryProvider>
                <Router>
                    <div className="min-h-screen bg-[#F5F5DC] text-gray-800 font-sans pb-20">
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Welcome />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<SignUp />} />

                                {/* Protected Routes */}
                                <Route path="/fridge" element={<ProtectedRoute><Fridge /></ProtectedRoute>} />
                                <Route path="/recipes" element={<ProtectedRoute><RecipeAssistant /></ProtectedRoute>} />
                                <Route path="/shopping" element={<ProtectedRoute><ShoppingList /></ProtectedRoute>} />
                                <Route path="/scan" element={<ProtectedRoute><FridgeScanner /></ProtectedRoute>} />
                                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                            </Routes>
                        </Layout>
                    </div>
                </Router>
            </PantryProvider>
        </AuthProvider>
    );
}

export default App;
