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
        'heading-40-bold': ['40px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-28-bold': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-24-bold': ['24px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-24-semibold': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-20-bold': ['20px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-18-bold': ['18px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-18-semibold': ['18px', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-16-semibold': ['16px', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-14-semibold': ['14px', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-12-semibold': ['12px', { lineHeight: '1.2', fontWeight: '600' }],

        /* BODY STYLES */
        'body-18-regular': ['18px', { lineHeight: '1.35', fontWeight: '400' }],
        'body-16-regular': ['16px', { lineHeight: '1.35', fontWeight: '400' }],
        'body-14-medium': ['14px', { lineHeight: '1.3', fontWeight: '500' }],
        'body-14-regular': ['14px', { lineHeight: '1.3', fontWeight: '400' }],
        'body-12-bold': ['12px', { lineHeight: '1.3', fontWeight: '700' }],
        'body-12-medium': ['12px', { lineHeight: '1.3', fontWeight: '500' }],
        'body-12-regular': ['12px', { lineHeight: '1.3', fontWeight: '400' }],
        'body-11-bold': ['11px', { lineHeight: '1.3', fontWeight: '700' }],
        'body-11-medium': ['11px', { lineHeight: '1.3', fontWeight: '500' }],
        'body-11-regular': ['11px', { lineHeight: '1.3', fontWeight: '400' }],
        'body-10-semibold': ['10px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-10-regular': ['10px', { lineHeight: '1.3', fontWeight: '400' }],
        'body-9-medium': ['9px', { lineHeight: '1.3', fontWeight: '500' }],
        'body-9-regular': ['9px', { lineHeight: '1.3', fontWeight: '400' }],
        'body-8-regular': ['8px', { lineHeight: '1.3', fontWeight: '400' }],

        /* BTN STYLES */
        'btn-16-semibold': ['16px', { lineHeight: '1', fontWeight: '600' }],
        'btn-14-medium': ['14px', { lineHeight: '1', fontWeight: '500' }],
        'btn-12-medium': ['12px', { lineHeight: '1', fontWeight: '500' }],
        'btn-11-medium': ['11px', { lineHeight: '1', fontWeight: '500' }],
      },
      colors: {
        brand: {
          primary: "var(--brand-primary)",
          dark: "var(--brand-dark)",
          light: "var(--brand-light)",
          bg: "var(--brand-bg)",
        },
        bg: {
          main: "var(--bg-main)",
          surface: "var(--bg-surface)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
        border: {
          default: "var(--border-default)",
          focus: "var(--border-focus)",
        },
        status: {
          success: {
            text: "var(--status-success-text)",
            bg: "var(--status-success-bg)",
          },
          error: {
            text: "var(--status-error-text)",
            bg: "var(--status-error-bg)",
          },
          warning: {
            text: "var(--status-warning-text)",
            bg: "var(--status-warning-bg)",
          },
          disabled: {
            text: "var(--status-disabled-text)",
            bg: "var(--status-disabled-bg)",
          }
        }
      }
    },
  },
  plugins: [gluestackPlugin],
}
