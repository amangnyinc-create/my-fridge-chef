import React, { useState } from 'react';
import { User, Settings, LogOut, ChevronRight, Heart, Bell, Shield, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { t, i18n } = useTranslation();
    const { user, logout, updateProfile, changePassword } = useAuth();
    const [showDietary, setShowDietary] = useState(false);
    const [showPersonal, setShowPersonal] = useState(false);
    const [showSecurity, setShowSecurity] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        updateProfile({ language: lng });
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] font-sans pb-24 p-6">
            <header className="mb-8 pt-2">
                <h1 className="text-3xl font-serif font-semibold text-[#1B263B] mb-1">{t('profile.title')}</h1>
                <p className="text-[#C5A059] text-xs font-medium tracking-widest uppercase">{t('profile.subtitle')}</p>
            </header>

            {/* Profile Card */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-50 mb-8 flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-[#1B263B] text-[#C5A059] flex items-center justify-center font-serif text-3xl font-bold shadow-lg shadow-[#1B263B]/20">
                    {user?.name?.charAt(0) || 'C'}
                </div>
                <div>
                    <h2 className="text-xl font-serif font-medium text-[#1B263B]">{user?.name || 'Chef'}</h2>
                    <p className="text-gray-400 text-sm mb-2">{user?.email || t('profile.memberRole')}</p>
                    <div className="flex gap-2">
                        <span className="px-2 py-1 bg-[#E3F2FD] text-[#0D47A1] text-[10px] font-bold uppercase tracking-wider rounded-md">Pro Plan</span>
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="space-y-6">
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#1B263B] mb-3 ml-2">{t('profile.preferences')}</h3>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
                        <MenuItem
                            icon={Heart}
                            label={t('profile.dietary')}
                            value={user?.dietaryPreferences?.join(', ') || "None"}
                            onClick={() => setShowDietary(!showDietary)}
                        />
                        {showDietary && (
                            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 grid grid-cols-2 gap-3">
                                {['Vegan', 'Vegetarian', 'Gluten-Free', 'Keto', 'Dairy-Free', 'Nut-Free', 'Paleo', 'Low-Carb'].map(diet => (
                                    <label key={diet} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${user?.dietaryPreferences?.includes(diet) ? 'bg-[#1B263B] border-[#1B263B]' : 'bg-white border-gray-300 group-hover:border-[#C5A059]'}`}>
                                            {user?.dietaryPreferences?.includes(diet) && <div className="w-2 h-2 bg-[#C5A059] rounded-full" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={user?.dietaryPreferences?.includes(diet) || false}
                                            onChange={(e) => {
                                                const current = user?.dietaryPreferences || [];
                                                const newDiets = e.target.checked
                                                    ? [...current, diet]
                                                    : current.filter(d => d !== diet);
                                                updateProfile({ dietaryPreferences: newDiets });
                                            }}
                                        />
                                        <span className={`text-sm font-medium transition-colors ${user?.dietaryPreferences?.includes(diet) ? 'text-[#1B263B]' : 'text-gray-500'}`}>{diet}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        <div className="h-px bg-gray-50 mx-4"></div>
                        <MenuItem
                            icon={Bell}
                            label={t('profile.notifications')}
                            customRight={
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Default to true if undefined
                                        const current = user?.notifications !== false;
                                        updateProfile({ notifications: !current });
                                    }}
                                    className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${user?.notifications !== false ? 'bg-[#1B263B]' : 'bg-gray-200'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${user?.notifications !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            }
                        />
                        <div className="h-px bg-gray-50 mx-4"></div>
                        {/* Language Selector */}
                        <div className="p-4 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#F9F7F2] flex items-center justify-center text-[#1B263B]">
                                    <Globe size={16} />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{t('profile.language')}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => changeLanguage('ko')}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${i18n.language.startsWith('ko') ? 'bg-[#1B263B] text-[#C5A059]' : 'bg-gray-100 text-gray-400'}`}
                                >
                                    KO
                                </button>
                                <button
                                    onClick={() => changeLanguage('en')}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${i18n.language.startsWith('en') ? 'bg-[#1B263B] text-[#C5A059]' : 'bg-gray-100 text-gray-400'}`}
                                >
                                    EN
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#1B263B] mb-3 ml-2">{t('profile.account')}</h3>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
                        <MenuItem icon={User} label={t('profile.personal')} onClick={() => setShowPersonal(!showPersonal)} />
                        {showPersonal && (
                            <div className="p-4 bg-gray-50/50 border-t border-gray-100 space-y-3 animate-fade-in">
                                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider">Display Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:border-[#C5A059] outline-none transition-all"
                                    defaultValue={user?.name}
                                    onBlur={(e) => {
                                        if (e.target.value !== user?.name) {
                                            updateProfile({ name: e.target.value });
                                        }
                                    }}
                                />
                                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mt-2">Email (Read Only)</label>
                                <input
                                    type="email"
                                    className="w-full p-3 rounded-lg border border-gray-200 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                                    value={user?.email || ''}
                                    readOnly
                                />
                            </div>
                        )}
                        <div className="h-px bg-gray-50 mx-4"></div>
                        <MenuItem icon={Shield} label={t('profile.security')} onClick={() => setShowSecurity(!showSecurity)} />
                        {showSecurity && (
                            <div className="p-4 bg-gray-50/50 border-t border-gray-100 space-y-3 animate-fade-in">
                                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider">New Password</label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        className="flex-1 p-3 rounded-lg border border-gray-200 text-sm focus:border-[#C5A059] outline-none transition-all"
                                        placeholder="Min 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button
                                        onClick={() => {
                                            if (newPassword.length >= 6) {
                                                changePassword(newPassword);
                                                alert(t('profile.password_updated') || "Password updated successfully!");
                                                setShowSecurity(false);
                                                setNewPassword('');
                                            } else {
                                                alert("Password becomes safer with 6+ characters!");
                                            }
                                        }}
                                        className="bg-[#1B263B] text-[#C5A059] px-4 rounded-lg font-bold text-xs uppercase disabled:opacity-50 hover:bg-[#111] transition-colors"
                                        disabled={!newPassword}
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="h-px bg-gray-50 mx-4"></div>
                        <MenuItem icon={Settings} label={t('profile.appSettings')} onClick={() => setShowSettings(!showSettings)} />
                        {showSettings && (
                            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center animate-fade-in">
                                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Measurement Unit</span>
                                <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                                    <button
                                        onClick={() => updateProfile({ unitSystem: 'metric' })}
                                        className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${user?.unitSystem !== 'imperial' ? 'bg-[#1B263B] text-[#C5A059] shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                                    >
                                        Metric (g/ml)
                                    </button>
                                    <button
                                        onClick={() => updateProfile({ unitSystem: 'imperial' })}
                                        className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${user?.unitSystem === 'imperial' ? 'bg-[#1B263B] text-[#C5A059] shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                                    >
                                        Imperial (oz/lb)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <button
                    onClick={logout}
                    className="w-full bg-white border border-[#FEE2E2] text-[#7F1D1D] py-4 rounded-xl font-medium shadow-sm hover:bg-[#FEF2F2] transition-colors flex items-center justify-center gap-2 mt-4">
                    <LogOut size={18} />
                    <span>{t('common.logout')}</span>
                </button>
            </div>
        </div>
    );
};

const MenuItem = ({ icon: Icon, label, value, onClick, customRight }) => (
    <button onClick={onClick} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F9F7F2] flex items-center justify-center text-[#1B263B] group-hover:bg-[#1B263B] group-hover:text-[#C5A059] transition-colors">
                <Icon size={16} />
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        {customRight ? customRight : (
            <div className="flex items-center gap-2">
                {value && <span className="text-xs font-medium text-[#C5A059]">{value}</span>}
                <ChevronRight size={16} className="text-gray-300" />
            </div>
        )}
    </button>
);

export default Profile;
