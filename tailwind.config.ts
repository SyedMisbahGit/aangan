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
			fontFamily: {
				sans: ["Urbanist", "ui-sans-serif", "system-ui", "sans-serif"],
				'space-grotesk': ['Space Grotesk', 'sans-serif'],
				'inter': ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
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
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// WhisperVerse 3D Color Palette
				whisper: {
					primary: "rgb(147, 51, 234)",
					secondary: "rgb(59, 130, 246)",
					accent: "rgb(236, 72, 153)",
					muted: "rgb(100, 116, 139)",
					background: "rgb(15, 23, 42)",
					foreground: "rgb(248, 250, 252)",
					glow: {
						primary: "rgba(147, 51, 234, 0.3)",
						secondary: "rgba(59, 130, 246, 0.3)",
						accent: "rgba(236, 72, 153, 0.3)",
						muted: "rgba(100, 116, 139, 0.2)",
					},
					shadow: {
						soft: "0 4px 20px rgba(0, 0, 0, 0.1)",
						medium: "0 8px 30px rgba(0, 0, 0, 0.15)",
						deep: "0 12px 40px rgba(0, 0, 0, 0.2)",
					},
				},
				// Emotion-based colors for auras
				emotion: {
					joy: "rgb(34, 197, 94)",
					nostalgia: "rgb(236, 72, 153)",
					loneliness: "rgb(59, 130, 246)",
					anxiety: "rgb(239, 68, 68)",
					calm: "rgb(34, 197, 94)",
					excitement: "rgb(245, 158, 11)",
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				// WhisperVerse 3D Animations
				'kinetic-float': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'25%': { transform: 'translateY(-3px) rotate(0.5deg)' },
					'50%': { transform: 'translateY(-5px) rotate(0deg)' },
					'75%': { transform: 'translateY(-2px) rotate(-0.5deg)' },
				},
				'floating-orb': {
					'0%, 100%': { 
						transform: 'translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg)' 
					},
					'25%': { 
						transform: 'translateY(-8px) translateZ(10px) rotateX(2deg) rotateY(1deg)' 
					},
					'50%': { 
						transform: 'translateY(-12px) translateZ(20px) rotateX(0deg) rotateY(0deg)' 
					},
					'75%': { 
						transform: 'translateY(-6px) translateZ(5px) rotateX(-1deg) rotateY(-1deg)' 
					},
				},
				'aura-pulse': {
					'0%, 100%': { 
						transform: 'scale(1) rotate(0deg)',
						opacity: '0.6'
					},
					'50%': { 
						transform: 'scale(1.1) rotate(180deg)',
						opacity: '0.8'
					},
				},
				'portal-rotate': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' },
				},
				'constellation-pulse': {
					'0%, 100%': { 
						transform: 'scale(1)',
						opacity: '0.6'
					},
					'50%': { 
						transform: 'scale(1.5)',
						opacity: '1'
					},
				},
				'constellation-flow': {
					'0%, 100%': { 
						opacity: '0.3',
						transform: 'scaleX(0.8)'
					},
					'50%': { 
						opacity: '0.8',
						transform: 'scaleX(1.2)'
					},
				},
				'shrine-glow': {
					'0%': { left: '-100%' },
					'50%': { left: '100%' },
					'100%': { left: '100%' },
				},
				'slow-mode-breath': {
					'0%, 100%': { 
						filter: 'blur(1px) brightness(0.8)',
						transform: 'scale(1)'
					},
					'50%': { 
						filter: 'blur(2px) brightness(0.9)',
						transform: 'scale(1.02)'
					},
				},
				'whisper-spin': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				// WhisperVerse 3D Animation Classes
				'kinetic-float': 'kinetic-float 4s ease-in-out infinite',
				'kinetic-float-slow': 'kinetic-float 6s ease-in-out infinite',
				'kinetic-float-fast': 'kinetic-float 2s ease-in-out infinite',
				'floating-orb': 'floating-orb 4s ease-in-out infinite',
				'floating-orb-slow': 'floating-orb 6s ease-in-out infinite',
				'floating-orb-fast': 'floating-orb 2s ease-in-out infinite',
				'aura-pulse': 'aura-pulse 2s ease-in-out infinite',
				'aura-pulse-slow': 'aura-pulse 3s ease-in-out infinite',
				'aura-pulse-fast': 'aura-pulse 1s ease-in-out infinite',
				'portal-rotate': 'portal-rotate 10s linear infinite',
				'constellation-pulse': 'constellation-pulse 2s ease-in-out infinite',
				'constellation-flow': 'constellation-flow 3s ease-in-out infinite',
				'shrine-glow': 'shrine-glow 4s ease-in-out infinite',
				'slow-mode-breath': 'slow-mode-breath 3s ease-in-out infinite',
				'whisper-spin': 'whisper-spin 1s linear infinite',
			},
			// WhisperVerse 3D Effects
			backdropBlur: {
				'whisper': '20px',
				'whisper-strong': '30px',
			},
			boxShadow: {
				'whisper-soft': '0 4px 20px rgba(0, 0, 0, 0.1)',
				'whisper-medium': '0 8px 30px rgba(0, 0, 0, 0.15)',
				'whisper-deep': '0 12px 40px rgba(0, 0, 0, 0.2)',
				'whisper-glow-primary': '0 0 20px rgba(147, 51, 234, 0.3)',
				'whisper-glow-secondary': '0 0 20px rgba(59, 130, 246, 0.3)',
				'whisper-glow-accent': '0 0 20px rgba(236, 72, 153, 0.3)',
				'whisper-glow-muted': '0 0 15px rgba(100, 116, 139, 0.2)',
				'whisper-neumorphism': `
					8px 8px 16px rgba(0, 0, 0, 0.3),
					-8px -8px 16px rgba(255, 255, 255, 0.05),
					inset 2px 2px 4px rgba(255, 255, 255, 0.1),
					inset -2px -2px 4px rgba(0, 0, 0, 0.2)
				`,
			},
			transformStyle: {
				'preserve-3d': 'preserve-3d',
			},
			perspective: {
				'whisper': '1000px',
				'whisper-close': '500px',
				'whisper-far': '2000px',
			},
			// WhisperVerse Gradients
			backgroundImage: {
				'whisper-orb': 'radial-gradient(circle at 30% 30%, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(15, 23, 42, 0.8) 100%)',
				'whisper-portal': 'conic-gradient(from 0deg at 50% 50%, rgba(147, 51, 234, 0.3) 0deg, rgba(59, 130, 246, 0.2) 120deg, rgba(236, 72, 153, 0.3) 240deg, rgba(147, 51, 234, 0.3) 360deg)',
				'whisper-shrine': 'radial-gradient(ellipse at center, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.05) 40%, rgba(15, 23, 42, 0.9) 100%)',
				'whisper-neumorphism': 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
				'whisper-button': 'linear-gradient(145deg, rgba(147, 51, 234, 0.8) 0%, rgba(59, 130, 246, 0.6) 100%)',
				'whisper-text': 'linear-gradient(135deg, #9333ea 0%, #3b82f6 50%, #ec4899 100%)',
				'whisper-body': 'radial-gradient(ellipse at center, rgba(147, 51, 234, 0.05) 0%, rgba(59, 130, 246, 0.03) 30%, rgba(15, 23, 42, 1) 100%)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
