import React from 'react';

const Logo = ({ className = "", dark = false }) => {
    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className="relative flex items-center justify-center w-20 h-20 mb-4">
                {/* Luxury Monogram Logo */}
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
                    {/* Elegant Serif 'M' base */}
                    <path
                        d="M20 80 V 30 L 50 60 L 80 30 V 80"
                        stroke={dark ? "#1B263B" : "white"}
                        strokeWidth="2.5"
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                        fill="none"
                    />

                    {/* The 'Chef' Accent - A golden curve representing a garnish/aroma */}
                    <path
                        d="M15 35 Q 35 15, 50 25 T 85 35"
                        stroke={dark ? "#C5A059" : "#D4AF37"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="opacity-90"
                    />

                    {/* Subtle thin frame for containment (Optional, luxury crest style) */}
                    <rect
                        x="10" y="10" width="80" height="80"
                        stroke={dark ? "#1B263B" : "white"}
                        strokeWidth="0.5"
                        className="opacity-30"
                    />
                </svg>
            </div>

            {/* Brand Name - High End Typography */}
            <div className={`text-center tracking-[0.3em] uppercase text-xs font-serif ${dark ? "text-[#1B263B]" : "text-white"}`}>
                MyFridge<span className={dark ? "text-[#C5A059]" : "text-[#D4AF37] font-light"}>Chef</span>
            </div>
        </div>
    );
};

export default Logo;
