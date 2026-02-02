/**
 * @file Tailwind CSS 설정 파일
 */

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				background: 'var(--color-background)',
				surface: 'var(--color-surface)',
				'surface-elevated': 'var(--color-surface-elevated)',
				primary: 'var(--color-primary)',
				secondary: 'var(--color-secondary)',
				muted: 'var(--color-muted)',
				accent: 'var(--color-accent)',
				'accent-hover': 'var(--color-accent-hover)',
				border: 'var(--color-border)',
				'border-hover': 'var(--color-border-hover)'
			},
			fontFamily: {
				heading: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
				body: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'Fira Code', 'monospace']
			},
			fontSize: {
				xs: ['0.75rem', { lineHeight: '1.5' }],
				sm: ['0.875rem', { lineHeight: '1.5' }],
				base: ['1rem', { lineHeight: '1.6' }],
				lg: ['1.125rem', { lineHeight: '1.6' }],
				xl: ['1.25rem', { lineHeight: '1.5' }],
				'2xl': ['1.5rem', { lineHeight: '1.4' }],
				'3xl': ['1.875rem', { lineHeight: '1.3' }],
				'4xl': ['2.25rem', { lineHeight: '1.2' }],
				'5xl': ['3rem', { lineHeight: '1.1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
				'7xl': ['4.5rem', { lineHeight: '1' }],
				hero: ['clamp(2.5rem, 8vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }]
			},
			spacing: {
				section: 'clamp(5rem, 12vh, 8rem)',
				'section-sm': 'clamp(3rem, 8vh, 5rem)'
			},
			maxWidth: {
				content: '720px',
				wide: '900px'
			},
			borderRadius: {
				DEFAULT: '0.5rem',
				lg: '0.75rem',
				xl: '1rem',
				'2xl': '1.25rem'
			},
			boxShadow: {
				subtle: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
				soft: '0 2px 8px -2px rgb(0 0 0 / 0.08)',
				medium: '0 4px 16px -4px rgb(0 0 0 / 0.1)',
				glow: '0 0 20px -5px var(--color-accent)'
			},
			transitionDuration: {
				fast: '150ms',
				base: '200ms',
				slow: '300ms',
				slower: '500ms'
			},
			transitionTimingFunction: {
				smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
				bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
			},
			animation: {
				'fade-up': 'fadeUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
				'fade-in': 'fadeIn 0.4s ease-out forwards',
				'slide-up': 'slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
			},
			keyframes: {
				fadeUp: {
					'0%': { opacity: '0', transform: 'translateY(24px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				slideUp: {
					'0%': { opacity: '0', transform: 'translateY(16px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				}
			}
		}
	},
	plugins: []
};
