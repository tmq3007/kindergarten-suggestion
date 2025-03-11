import type {Config} from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                custom: {
                    DEFAULT: '#002F77',
                    50: '#E6EFFA',
                    100: '#BFD6F3',
                    200: '#99BDEA',
                    300: '#739EE0',
                    400: '#4D7FD7',
                    500: '#2661CD',
                    600: '#004BB3',
                    700: '#003B8C',
                    800: '#002C66',
                    900: '#001E40',
                },
            },
        },

    },
    plugins: [],
} satisfies Config;
