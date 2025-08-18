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
				romantic: {
					DEFAULT: 'hsl(var(--romantic))',
					foreground: 'hsl(var(--romantic-foreground))'
				},
				warm: {
					DEFAULT: 'hsl(var(--warm))',
					foreground: 'hsl(var(--warm-foreground))'
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
				'gradient-romantic': 'var(--gradient-romantic)',
				'gradient-warm': 'var(--gradient-warm)',
				'gradient-soft': 'var(--gradient-soft)',
				'gradient-glow': 'var(--gradient-glow)'
			},
			boxShadow: {
				'romantic': 'var(--shadow-romantic)',
				'warm': 'var(--shadow-warm)',
				'soft': 'var(--shadow-soft)',
				'glow': 'var(--shadow-glow)'
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
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-romantic': {
					'0%, 100%': { transform: 'scale(1)', opacity: '1' },
					'50%': { transform: 'scale(1.05)', opacity: '0.9' }
				},
				'bounce-soft': {
					'0%, 20%, 53%, 80%, 100%': { transform: 'translateY(0)' },
					'40%, 43%': { transform: 'translateY(-8px)' },
					'70%': { transform: 'translateY(-4px)' },
					'90%': { transform: 'translateY(-2px)' }
				},
				'heart-beat': {
					'0%, 100%': { transform: 'scale(1)' },
					'25%': { transform: 'scale(1.1)' },
					'50%': { transform: 'scale(1)' },
					'75%': { transform: 'scale(1.05)' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'pulse-romantic': 'pulse-romantic 2s ease-in-out infinite',
				'bounce-soft': 'bounce-soft 0.6s ease-out',
				'heart-beat': 'heart-beat 1.5s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite'
			},
			fontSize: {
				'hero': 'var(--font-size-hero)',
				'title': 'var(--font-size-title)',
				'subtitle': 'var(--font-size-subtitle)'
			},
			transitionTimingFunction: {
				'romantic': 'var(--transition-romantic)',
				'bounce': 'var(--transition-bounce)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
