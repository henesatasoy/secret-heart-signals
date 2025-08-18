import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					light: 'hsl(var(--primary-light))',
					dark: 'hsl(var(--primary-dark))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				parchment: {
					DEFAULT: 'hsl(var(--parchment))',
					foreground: 'hsl(var(--parchment-foreground))'
				},
				ink: {
					DEFAULT: 'hsl(var(--ink))',
					foreground: 'hsl(var(--ink-foreground))'
				},
				scroll: {
					DEFAULT: 'hsl(var(--scroll))',
					foreground: 'hsl(var(--scroll-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				}
			},
			backgroundImage: {
				'gradient-parchment': 'var(--gradient-parchment)',
				'gradient-scroll': 'var(--gradient-scroll)',
				'gradient-gold': 'var(--gradient-gold)',
				'gradient-ink': 'var(--gradient-ink)'
			},
			boxShadow: {
				'parchment': 'var(--shadow-parchment)',
				'scroll': 'var(--shadow-scroll)',
				'quill': 'var(--shadow-quill)',
				'dove': 'var(--shadow-dove)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'flutter': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'25%': { transform: 'translateY(-3px) rotate(1deg)' },
					'50%': { transform: 'translateY(-5px) rotate(0deg)' },
					'75%': { transform: 'translateY(-2px) rotate(-1deg)' }
				},
				'quill-write': {
					'0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
					'25%': { transform: 'translateX(2px) rotate(1deg)' },
					'50%': { transform: 'translateX(0) rotate(0deg)' },
					'75%': { transform: 'translateX(-2px) rotate(-1deg)' }
				},
				'scroll-unfurl': {
					'0%': { transform: 'scaleY(0) rotateX(90deg)', opacity: '0' },
					'50%': { transform: 'scaleY(0.5) rotateX(45deg)', opacity: '0.5' },
					'100%': { transform: 'scaleY(1) rotateX(0deg)', opacity: '1' }
				},
				'dove-fly': {
					'0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
					'25%': { transform: 'translateY(-8px) translateX(5px) rotate(2deg)' },
					'50%': { transform: 'translateY(-12px) translateX(0px) rotate(0deg)' },
					'75%': { transform: 'translateY(-8px) translateX(-5px) rotate(-2deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'flutter': 'flutter 2s ease-in-out infinite',
				'quill-write': 'quill-write 3s ease-in-out infinite',
				'scroll-unfurl': 'scroll-unfurl 0.8s ease-out',
				'dove-fly': 'dove-fly 4s ease-in-out infinite'
			},
			fontSize: {
				'manuscript': 'var(--font-size-manuscript)',
				'scroll': 'var(--font-size-scroll)',
				'letter': 'var(--font-size-letter)'
			},
			transitionTimingFunction: {
				'quill': 'var(--transition-quill)',
				'flutter': 'var(--transition-flutter)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
