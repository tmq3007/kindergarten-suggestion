import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    experimental:{
        authInterrupts: true, // Bật tính năng thử nghiệm unauthorized
    },
    images: {
        domains: ["flagcdn.com","upload.wikimedia.org"], // Allow external flag images
      },
};

export default nextConfig;
