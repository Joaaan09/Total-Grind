/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                slate: {
                    950: '#121212', // Fondo oscuro óptimo OLED (evita negro puro)
                    900: '#1A1A1A', // Superficie base secundaria
                    800: '#262626', // Tarjetas y contenedores elevados
                    700: '#333333', // Bordes
                    600: '#525252',
                    500: '#A3A3A3', // Textos secundarios
                    400: '#D4D4D4', // Iconos y notas
                    300: '#E5E5E5',
                    200: '#F5F5F5',
                    100: '#FAFAFA',
                    50: '#FFFFFF',  // Textos principales blanco puro
                },
                brandRed: {
                    400: '#DC2626', // red-600
                    500: '#B91C1C', // red-700 (Muy apagado / Ladrillo oscuro)
                    600: '#991B1B', // red-800 (Hover)
                    700: '#7F1D1D', // red-900
                    900: '#450a0a', // red-950
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        }
    },
    plugins: [],
}
