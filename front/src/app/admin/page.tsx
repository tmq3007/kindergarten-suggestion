'use client'
import React from 'react';
import {useLoginByAdminMutation} from "@/redux/services/authApi";
import AdminLoginForm from "@/app/components/user/AdminLoginForm";
import {motion} from 'framer-motion'
import background from '@public/bg5.jpg'
import Image from "next/image";

export default function Page() {
    const [login, { data, isLoading, error }] = useLoginByAdminMutation();

    return (
        <div className="relative overflow-hidden min-h-screen bg-cover bg-center">
            <Image
                src={background}
                alt="Background"
                layout="fill"
                objectFit="cover"
                className="absolute inset-0 -z-10"
            />
            <div className="absolute inset-0 bg-white opacity-30 mix-blend-overlay"></div>
            {isLoading && (
                <div className="fixed inset-0 bg-opacity-0 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-700 ease-in-out"></div>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: [0, 1.4, 1] }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="relative flex items-center justify-center min-h-screen w-full"
            >
                <AdminLoginForm login={login} data={data} isLoading={isLoading} error={error} />
            </motion.div>
        </div>
    );
}
