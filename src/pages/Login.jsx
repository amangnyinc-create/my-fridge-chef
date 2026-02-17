import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';

import { auth } from '../firebase'; // Added for connection check

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login } = useAuth(); // Use Auth Context
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isCloudConnected = !!auth;

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/fridge');
        } catch (err) {
            setError(t('login.error') || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        alert(t('login.reset_alert') || "Password reset is not available in this demo. Please Create a New Account for this device.");
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] p-6 flex flex-col justify-center">

            <Link to="/" className="absolute top-8 left-6 text-[#1B263B]/60 hover:text-[#1B263B] transition-colors font-serif italic">
                {t('common.return_to_kitchen')}
            </Link>

            <div className="mb-10 text-center">
                <div className="flex justify-center mb-6">
                    <Logo dark={true} />
                </div>
                <h1 className="text-3xl font-serif font-medium text-[#1B263B] mb-2">{t('login.welcome_back')}</h1>
                <p className="text-[#1B263B]/60 font-sans text-sm tracking-wide">{t('login.subtitle')}</p>

                {/* Cloud Connection Status Indicator */}
                {!isCloudConnected && (
                    <div className="mt-4 bg-yellow-50 text-yellow-800 text-xs p-2 rounded-lg border border-yellow-200">
                        ⚠️ <b>Cloud Disconnected (Offline Mode)</b><br />
                        Running locally. Accounts will NOT sync between phone & web.<br />
                        (Please set Vercel Environment Variables)
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center mb-6 font-medium animate-fade-in">
                    {error}
                    <div className="text-[10px] text-gray-500 mt-2 border-t border-red-100 pt-1">
                        Accounts are saved on THIS device only.<br />
                        New phone? Please <b>Sign Up</b> again!
                    </div>
                </div>
            )}
            <form onSubmit={handleLogin} className="space-y-6 max-w-sm mx-auto w-full">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1B263B] ml-1">{t('login.email')}</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C5A059] transition-colors" size={20} />
                        <input
                            type="email"
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-gray-200 focus:border-[#C5A059] focus:ring-0 outline-none transition-all shadow-sm text-[#1B263B]"
                            placeholder="chef@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1B263B] ml-1">{t('login.password')}</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C5A059] transition-colors" size={20} />
                        <input
                            type="password"
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-gray-200 focus:border-[#C5A059] focus:ring-0 outline-none transition-all shadow-sm text-[#1B263B]"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-xs text-[#C5A059] font-medium hover:text-[#1B263B] transition-colors"
                        >
                            {t('login.forgot_password')}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    className={`w-full bg-[#1B263B] text-white py-4 rounded-xl font-serif font-bold text-lg shadow-xl shadow-[#1B263B]/20 hover:bg-[#171717] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-90 cursor-wait' : ''}`}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        t('login.enter_kitchen')
                    )}
                </button>
            </form>

            <p className="mt-10 text-center text-[#1B263B]/60 text-sm">
                {t('login.new_chef')} <Link to="/signup" className="text-[#C5A059] font-bold hover:text-[#1B263B] transition-colors">{t('login.join_brigade')}</Link>
            </p>
        </div>
    );
};

export default Login;
