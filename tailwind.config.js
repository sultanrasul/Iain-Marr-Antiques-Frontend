import { fontFamily } from 'tailwindcss/defaultTheme';
import flowbitePlugin from 'flowbite/plugin'
const plugin = require('tailwindcss/plugin');




/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ['class'],
	content: [
		'./node_modules/preline/preline.js',
		'./node_modules/preline/dist/*.js',
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite/**/*.js',
		'./node_modules/flowbite-svelte-blocks/**/*.{html,js,svelte,ts}',
		"./node_modules/flowbite/**/*.js",
		"./node_modules/flyonui/dist/js/*.js"
	],
	safelist: ['dark'],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			animation: {
				orbit: "orbit calc(var(--duration)*1s) linear infinite",
				wave: 'wave-animation 2.5s infinite',
				shine: "shine 4s linear infinite",
				"border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
				'pulse-custom': 'pulse 1.5s infinite',
				flash: 'flashBorder 0.5s ease-in-out 2', // Flash twice

				
			  },
			  keyframes: {
				flashBorder: {
					'0%, 100%': { borderColor: 'transparent' },
					'50%': { borderColor: '#C09A5B' }, // Use your accent color
                },
				'wave-animation': {
					'0%': { transform: 'rotate(0deg)' },
					'10%': { transform: 'rotate(14deg)' },
					'20%': { transform: 'rotate(-8deg)' },
					'30%': { transform: 'rotate(14deg)' },
					'40%': { transform: 'rotate(-4deg)' },
					'50%': { transform: 'rotate(10deg)' },
					'60%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(0deg)' },
				  },
				"border-beam": {
					"100%": {
						"offset-distance": "100%",
					},
				},
				orbit: {
				  "0%": {
					transform:
					  "rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)",
				  },
				  "100%": {
					transform:
					  "rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)",
				  },
				},
				shine: {
					from: { backgroundPosition: "0 0" },
					to: { backgroundPosition: "-200% 0" },
				  },
			  },
			colors: {
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',
				primary: {"50":"#ecfeff","100":"#cffafe","200":"#a5f3fc","300":"#67e8f9","400":"#22d3ee","500":"#06b6d4","600":"#0891b2","700":"#0e7490","800":"#155e75","900":"#164e63"}
,
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
				},
				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: ['Inter var', ...fontFamily.sans]
			}
		}
	},
	plugins: [
		require('@tailwindcss/typography'),
		flowbitePlugin,
		require('flowbite/plugin'),
		require('preline/plugin'),
		plugin(function({ addUtilities }) {
            addUtilities({
                '.flash': {
                    animation: 'flashBorder 0.5s ease-in-out 2',
                },
            });
        }),
		// require('@preline/carousel'),
		// require('@tailwindcss/forms'),
	]
};

export default config;
