import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Fridge from './pages/Fridge';
import RecipeAssistant from './pages/RecipeAssistant';
import ShoppingList from './pages/ShoppingList';
import FridgeScanner from './pages/FridgeScanner';
import Profile from './pages/Profile';


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

import { PantryProvider } from './context/PantryContext';

function App() {
    return (
        <PantryProvider>
            <Router>
                <div className="min-h-screen bg-[#F5F5DC] text-gray-800 font-sans pb-20">
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Welcome />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<SignUp />} />
                            <Route path="/fridge" element={<Fridge />} />
                            <Route path="/recipes" element={<RecipeAssistant />} />
                            <Route path="/shopping" element={<ShoppingList />} />
                            <Route path="/scan" element={<FridgeScanner />} />
                            <Route path="/profile" element={<Profile />} />
                        </Routes>
                    </Layout>
                </div>
            </Router>
        </PantryProvider>
    );
}

export default App;
