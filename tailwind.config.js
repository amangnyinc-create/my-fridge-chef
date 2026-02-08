export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#FAF9F6', // Soft off-white/beige
                // Premium Palette
                premium: {
                    dark: '#1A3C34',   // Deep Forest Green
                    primary: '#206050', // Rich Emerald
                    light: '#E8F5E9',   // Very light green tint
                    gold: '#C5A059',    // Muted Gold/Bronze
                    accent: '#D4AF37',  // Highlight Gold
                    text: '#2D3436',    // Dark Charcoal
                },
                // Legacy (keeping for safety, but overriding conceptually)
                primary: {
                    light: '#befadc',
                    DEFAULT: '#206050', // Updated default to Emerald
                    dark: '#1A3C34',
                },
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'Noto Serif', 'serif'], // Elegant Serif
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            boxShadow: {
                'premium': '0 10px 40px -10px rgba(0,0,0,0.15)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            }
        },
    },
    plugins: [],
}
