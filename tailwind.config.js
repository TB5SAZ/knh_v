const gluestackPlugin = require('@gluestack-ui/nativewind-utils/tailwind-plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
      "./app/**/*.{tsx,jsx,ts,js}",
      "./components/**/*.{tsx,jsx,ts,js}",
      "./src/**/*.{tsx,jsx,ts,js}",
  ],
  presets: [require("nativewind/preset")],
  safelist: [
    {
      pattern: /gluestack-/,
    },
  ],
  theme: {
    extend: {
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      fontFamily: {
        sans: ['DMSans_400Regular', 'sans-serif'],
      },
      fontSize: {
        /* HEADING STYLES */
        'heading-40-bold': ['40px', { lineHeight: '1.2' }],
        'heading-28-bold': ['28px', { lineHeight: '1.2' }],
        'heading-24-bold': ['24px', { lineHeight: '1.2' }],
        'heading-24-semibold': ['24px', { lineHeight: '1.2' }],
        'heading-20-bold': ['20px', { lineHeight: '1.2' }],
        'heading-18-bold': ['18px', { lineHeight: '1.2' }],
        'heading-18-semibold': ['18px', { lineHeight: '1.2' }],
        'heading-16-semibold': ['16px', { lineHeight: '1.2' }],
        'heading-14-semibold': ['14px', { lineHeight: '1.2' }],
        'heading-12-semibold': ['12px', { lineHeight: '1.2' }],

        /* BODY STYLES */
        'body-18-regular': ['18px', { lineHeight: '1.35' }],
        'body-16-regular': ['16px', { lineHeight: '1.35' }],
        'body-14-medium': ['14px', { lineHeight: '1.3' }],
        'body-14-regular': ['14px', { lineHeight: '1.3' }],
        'body-12-bold': ['12px', { lineHeight: '1.3' }],
        'body-12-medium': ['12px', { lineHeight: '1.3' }],
        'body-12-regular': ['12px', { lineHeight: '1.3' }],
        'body-11-bold': ['11px', { lineHeight: '1.3' }],
        'body-11-medium': ['11px', { lineHeight: '1.3' }],
        'body-11-regular': ['11px', { lineHeight: '1.3' }],
        'body-10-semibold': ['10px', { lineHeight: '1.3' }],
        'body-10-regular': ['10px', { lineHeight: '1.3' }],
        'body-9-medium': ['9px', { lineHeight: '1.3' }],
        'body-9-regular': ['9px', { lineHeight: '1.3' }],
        'body-8-regular': ['8px', { lineHeight: '1.3' }],

        /* BTN STYLES */
        'btn-16-semibold': ['16px', { lineHeight: '1' }],
        'btn-14-medium': ['14px', { lineHeight: '1' }],
        'btn-12-medium': ['12px', { lineHeight: '1' }],
        'btn-11-medium': ['11px', { lineHeight: '1' }],
      },
      colors: {
        brand: {
          primary: "#35BFA3",
          dark: "#0E4D41",
          light: "#E4F2D3",
          bg: "#F8FCF3",
        },
        bg: {
          main: "#FFFFFF",
          surface: "#F7F7F7",
        },
        text: {
          primary: "#203430",
          secondary: "#63716E",
        },
        border: {
          default: "#E5E6E6",
          focus: "#A4ACAB",
        },
        status: {
          success: {
            text: "#35BFA3",
            bg: "#F8FCF3",
          },
          error: {
            text: "#E63D4B",
            bg: "#FAEFF0",
          },
          warning: {
            text: "#F8C947",
            bg: "#FDF5DF",
          },
          disabled: {
            text: "#203430",
            bg: "#A4ACAB",
          }
        }
      }
    },
  },
  plugins: [gluestackPlugin],
}
