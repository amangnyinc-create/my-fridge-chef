import { useTranslation, Trans } from 'react-i18next';
import Logo from '../components/Logo';

const Welcome = () => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen relative flex flex-col justify-end items-center px-6 pb-20 overflow-hidden text-center">
            {/* Background Image with Gradient Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop')", // Classic dark food photography
                }}
            >
                {/* Gradient from transparent to dark at bottom */}
                <div className="absolute inset-0 bg-[#0F172A]/70"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F172A]/20 to-[#0F172A]"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">

                {/* New Logo */}
                <div className="mb-10 transform hover:scale-105 transition-duration-500 cursor-pointer drop-shadow-2xl">
                    <Logo />
                </div>

                {/* Title */}
                <h1 className="text-4xl font-serif font-medium text-white mb-2 tracking-tight drop-shadow-lg leading-tight">
                    <span className="block text-2xl font-sans font-light opacity-90 mb-1">{t('welcome.your_fridge')}</span>
                    <span className="italic text-[#d4af37]">{t('welcome.our_chef')}</span>
                </h1>
                <p className="text-gray-200 mb-12 text-sm font-sans font-light tracking-wide leading-relaxed px-4 drop-shadow-md">
                    <Trans i18nKey="welcome.description" />
                </p>

                {/* Buttons - Premium Style */}
                <div className="w-full space-y-4">
                    <Link to="/login" className="block w-full">
                        <button className="w-full bg-[#C5A059] text-[#1B263B] py-4 rounded-xl font-serif font-bold text-lg shadow-lg hover:bg-[#D4AF37] hover:scale-[1.02] transition-all tracking-wide">
                            {t('welcome.login')}
                        </button>
                    </Link>
                    <Link to="/signup" className="block w-full">
                        <button className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/20 py-4 rounded-xl font-sans font-medium hover:bg-white/10 hover:border-white/40 active:scale-95 transition-all tracking-wide">
                            {t('welcome.create_account')}
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Welcome;
