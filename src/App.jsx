import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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

// Error Boundary for debugging
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center bg-white min-h-screen flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
                    <p className="mb-4 text-gray-600">Something went wrong. Here is the error:</p>
                    <pre className="text-left bg-gray-100 p-4 rounded text-xs overflow-auto max-w-full mb-6 border border-red-200">
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg"
                    >
                        Reload App
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

function App() {
    return (
        <ErrorBoundary>
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
        </ErrorBoundary>
    );
}

export default App;
