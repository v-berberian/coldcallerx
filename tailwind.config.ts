import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"template-down": {
					"0%": { 
						opacity: "0",
						height: "0",
						marginTop: "0",
						transform: "scale(0.95)"
					},
					"100%": { 
						opacity: "1",
						height: "var(--radix-collapsible-content-height)",
						marginTop: "0.5rem",
						transform: "scale(1)"
					}
				},
				"template-up": {
					"0%": { 
						opacity: "1",
						height: "var(--radix-collapsible-content-height)",
						marginTop: "0.5rem",
						transform: "scale(1)"
					},
					"100%": { 
						opacity: "0",
						height: "0",
						marginTop: "0",
						transform: "scale(0.95)"
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(-8px) scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(-8px) scale(0.95)'
					}
				},
				'slide-down': {
					'0%': { transform: 'translateY(-8px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				'slide-down-fast': {
					'0%': {
						opacity: '0',
						transform: 'translateY(-10px)',
						maxHeight: '0'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)',
						maxHeight: '240px'
					}
				},
				'slide-up': {
					'0%': { transform: 'translateY(0)', opacity: '1' },
					'100%': { transform: 'translateY(-8px)', opacity: '0' },
				},
				'slide-up-fast': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)',
						maxHeight: '240px'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(-10px)',
						maxHeight: '0'
					}
				},
				'slide-up-fastest': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)',
						maxHeight: '240px'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(-10px)',
						maxHeight: '0'
					}
				},
				'content-change': {
					'0%': {
						opacity: '0.8',
						transform: 'scale(0.98) translateY(2px)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1) translateY(0)'
					}
				},
				'content-change-fast': {
					'0%': {
						opacity: '0.7',
						transform: 'scale(0.96) translateY(4px)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1) translateY(0)'
					}
				},
				'button-switch': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0.7'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'collapsible-down': {
					from: { height: "0", opacity: "0" },
					to: { height: "var(--radix-collapsible-content-height)", opacity: "1" },
				},
				'collapsible-up': {
					from: { height: "var(--radix-collapsible-content-height)", opacity: "1" },
					to: { height: "0", opacity: "0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"template-down": "template-down 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
				"template-up": "template-up 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
				'fade-in': 'fade-in 0.15s ease-out',
				'fade-out': 'fade-out 0.15s ease-out',
				'slide-down': 'slide-down 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
				'slide-down-fast': 'slide-down-fast 0.05s ease-out',
				'slide-up': 'slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
				'slide-up-fast': 'slide-up-fast 0.03s ease-out',
				'slide-up-fastest': 'slide-up-fastest 0.03s ease-out',
				'content-change': 'content-change 0.15s ease-out',
				'content-change-fast': 'content-change-fast 0.08s ease-out',
				'button-switch': 'button-switch 0.1s ease-out',
				'collapsible-down': 'collapsible-down 0.2s ease-out',
				'collapsible-up': 'collapsible-up 0.2s ease-out',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
