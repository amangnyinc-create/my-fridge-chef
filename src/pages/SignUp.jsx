import React, { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';

const SignUp = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate('/fridge');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] p-6 flex flex-col justify-center">
            <Link to="/" className="absolute top-8 left-6 text-[#1B263B]/60 hover:text-[#1B263B] transition-colors font-serif italic">
                {t('common.return_to_kitchen')}
            </Link>

            <div className="mb-8 text-center">
                <div className="flex justify-center mb-6">
                    <Logo dark={true} />
                </div>
                <h1 className="text-3xl font-serif font-medium text-[#1B263B] mb-2">{t('signup.begin_journey')}</h1>
                <p className="text-[#1B263B]/60 font-sans text-sm tracking-wide">{t('signup.subtitle')}</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4 max-w-sm mx-auto w-full">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1B263B] ml-1">{t('signup.full_name')}</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#C5A059] transition-colors" size={20} />
                        <input
                            type="text"
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-gray-200 focus:border-[#C5A059] focus:ring-0 outline-none transition-all shadow-sm text-[#1B263B]"
                            placeholder="Gordon Ramsay"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1B263B] ml-1">{t('signup.email')}</label>
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
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1B263B] ml-1">{t('signup.password')}</label>
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
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className={`w-full bg-[#1B263B] text-white py-4 rounded-xl font-serif font-bold text-lg shadow-xl shadow-[#1B263B]/20 hover:bg-[#171717] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-90 cursor-wait' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            t('signup.join_brigade')
                        )}
                    </button>
                </div>
            </form>

            <p className="mt-8 text-center text-[#1B263B]/60 text-sm">
                {t('signup.already_chef')} <Link to="/login" className="text-[#C5A059] font-bold hover:text-[#1B263B] transition-colors">{t('signup.enter_kitchen')}</Link>
            </p>
        </div>
    );
};

export default SignUp;
