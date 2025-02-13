import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    experimental:{
        authInterrupts: true, // Bật tính năng thử nghiệm unauthorized
    }
};

export default nextConfig;
