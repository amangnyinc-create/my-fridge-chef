import React from 'react';
import { User, Settings, LogOut, ChevronRight, Heart, Bell, Shield, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Profile = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
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
                    P
                </div>
                <div>
                    <h2 className="text-xl font-serif font-medium text-[#1B263B]">Park Chef</h2>
                    <p className="text-gray-400 text-sm mb-2">{t('profile.memberRole')}</p>
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
                        <MenuItem icon={Heart} label={t('profile.dietary')} value="Gluten Free" />
                        <div className="h-px bg-gray-50 mx-4"></div>
                        <MenuItem icon={Bell} label={t('profile.notifications')} value="On" />
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
                        <MenuItem icon={User} label={t('profile.personal')} />
                        <div className="h-px bg-gray-50 mx-4"></div>
                        <MenuItem icon={Shield} label={t('profile.security')} />
                        <div className="h-px bg-gray-50 mx-4"></div>
                        <MenuItem icon={Settings} label={t('profile.appSettings')} />
                    </div>
                </section>

                <Link to="/">
                    <button className="w-full bg-white border border-[#FEE2E2] text-[#7F1D1D] py-4 rounded-xl font-medium shadow-sm hover:bg-[#FEF2F2] transition-colors flex items-center justify-center gap-2 mt-4">
                        <LogOut size={18} />
                        <span>{t('common.logout')}</span>
                    </button>
                </Link>
            </div>
        </div>
    );
};

const MenuItem = ({ icon: Icon, label, value }) => (
    <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F9F7F2] flex items-center justify-center text-[#1B263B] group-hover:bg-[#1B263B] group-hover:text-[#C5A059] transition-colors">
                <Icon size={16} />
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {value && <span className="text-xs font-medium text-[#C5A059]">{value}</span>}
            <ChevronRight size={16} className="text-gray-300" />
        </div>
    </button>
);

export default Profile;
