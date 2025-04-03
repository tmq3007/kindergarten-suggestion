import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    experimental:{
        authInterrupts: true, // Bật tính năng thử nghiệm unauthorized
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "flagcdn.com",
            },
            {
                protocol: "https",
                hostname: "upload.wikimedia.org",
            },
            {
                protocol: "https",
                hostname: "storage.googleapis.com",
            },
        ],
    },
};

export default nextConfig;
