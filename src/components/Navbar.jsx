import { Link, useLocation } from 'react-router-dom';
import { Home, ChefHat, ShoppingCart, Camera, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const path = location.pathname;

    const NavItem = ({ to, icon: Icon, label, active }) => (
        <Link to={to} className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${active ? 'translate-y-[-4px]' : ''}`}>
            <div className={`
          flex items-center justify-center p-2 rounded-xl transition-all
          ${active ? 'text-[#1B263B]' : 'text-gray-300'}
      `}>
                <Icon size={22} strokeWidth={active ? 2 : 1.5} />
            </div>
            <span className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${active ? 'text-[#1B263B] opacity-100' : 'text-gray-300 opacity-0'}`}>
                {label}
            </span>
        </Link>
    );

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FAF9F6]/95 backdrop-blur-lg border-t border-gray-100 h-20 flex items-center justify-around z-50 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] pb-2 rounded-t-3xl">
            <NavItem to="/fridge" icon={Home} label={t('navbar.home')} active={path === '/fridge'} />
            <NavItem to="/recipes" icon={ChefHat} label={t('navbar.chef')} active={path === '/recipes'} />
            <NavItem to="/scan" icon={Camera} label={t('navbar.scan')} active={path === '/scan'} />
            <NavItem to="/shopping" icon={ShoppingCart} label={t('navbar.list')} active={path === '/shopping'} />
            <NavItem to="/profile" icon={User} label={t('profile.title') || "Profile"} active={path === '/profile'} />
        </div>
    );
};

export default Navbar;
