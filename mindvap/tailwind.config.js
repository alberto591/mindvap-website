/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				// Background & Surfaces
				background: {
					primary: '#F0F4F0',
					surface: '#ffffff',
					accent: '#E8F0ED',
				},
				// Borders
				border: {
					light: '#D5E3D8',
					medium: '#B8CFC0',
				},
				// Text
				text: {
					primary: '#1A2E1F',
					secondary: '#2D4A3A',
					tertiary: '#6B8376',
				},
				// Brand Colors (Forest Green)
				brand: {
					primary: '#2D5F4F',
					hover: '#1F4438',
					light: '#E8F0ED',
				},
				// CTA (Purple Accent)
				cta: {
					primary: '#7C3AED',
					hover: '#6D28D9',
					text: '#ffffff',
				},
				// Semantic Colors
				semantic: {
					success: '#2D5F4F',
					warning: '#D97706',
					info: '#7C3AED',
				},
			},
			fontFamily: {
				headline: ['Freight Display Pro', 'Charter', 'Georgia', 'serif'],
				sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
			},
			fontSize: {
				'hero-headline': ['72px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
				'section-header': ['48px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
				'product-title': ['32px', { lineHeight: '1.3' }],
				'card-title': ['18px', { lineHeight: '1.4' }],
				'price-large': ['36px', { lineHeight: '1.2' }],
				'price-card': ['20px', { lineHeight: '1.3' }],
				'body-large': ['18px', { lineHeight: '1.6' }],
				'body': ['16px', { lineHeight: '1.6' }],
				'body-small': ['14px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
				'button': ['16px', { lineHeight: '1.4', letterSpacing: '0.03em' }],
				'badge': ['12px', { lineHeight: '1.3', letterSpacing: '0.05em' }],
			},
			spacing: {
				'xs': '4px',
				'sm': '8px',
				'md': '16px',
				'lg': '24px',
				'xl': '32px',
				'2xl': '48px',
				'3xl': '64px',
				'4xl': '96px',
				'5xl': '128px',
			},
			borderRadius: {
				'sm': '8px',
				'md': '12px',
				'lg': '16px',
				'pill': '999px',
			},
			boxShadow: {
				'sm': '0 1px 3px rgba(26, 46, 31, 0.06)',
				'card': '0 2px 8px rgba(26, 46, 31, 0.08)',
				'card-hover': '0 4px 16px rgba(26, 46, 31, 0.12)',
				'modal': '0 12px 32px rgba(26, 46, 31, 0.16)',
				'cta': '0 2px 8px rgba(124, 58, 237, 0.24)',
			},
			transitionDuration: {
				'fast': '150ms',
				'standard': '250ms',
				'slow': '400ms',
				'luxe': '600ms',
			},
			transitionTimingFunction: {
				'luxury': 'cubic-bezier(0.33, 1, 0.68, 1)',
			},
			keyframes: {
				'cart-success': {
					'0%, 100%': { transform: 'scale(1)', backgroundColor: '#7C3AED' },
					'50%': { transform: 'scale(1.05)', backgroundColor: '#2D5F4F' },
				},
			},
			animation: {
				'cart-success': 'cart-success 600ms cubic-bezier(0.33, 1, 0.68, 1)',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
