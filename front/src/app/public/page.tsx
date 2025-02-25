'use client'
import Image from "next/image";
import { motion } from "framer-motion";
import background from "@public/background.jpg";

export default function Page() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.8, ease: "easeInOut" }} // 1.5s fade-in
            className="w-full"
        >
            <Image
                src={background}
                alt="background"
                className="block w-full h-auto"
                priority
            />
        </motion.div>
    );
}
