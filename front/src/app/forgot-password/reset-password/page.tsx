'use client'

import {useResetPasswordMutation} from "@/redux/services/authApi";
import React from "react";
import ResetPasswordForm from "@/app/components/user/ResetPasswordForm";
import {motion} from 'framer-motion'
import background from '@public/bg5.jpg'

export default function Page() {

    const [resetPassword, {data, isLoading, error}] = useResetPasswordMutation();

    return (
        <div className="relative overflow-hidden min-h-screen bg-cover bg-center" style={{backgroundImage: `url(${background.src})`}}>
            <div className="absolute inset-0 bg-white opacity-30 mix-blend-overlay"></div>
            {/* Chỉ thêm backdrop-blur khi loading là true */}
            <div className={`${isLoading ?
                'fixed inset-0 bg-opacity-0 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-700 ease-in-out'
                : ''}`}
            >
            </div>
            <motion.div
                initial={{opacity: 0, scale: 0}}
                animate={{opacity: 1, scale: [0, 1.4, 1]}} // Keyframes: 0 -> 1.2 -> 1
                transition={{duration: 1.1, ease: "easeInOut"}} // Thời gian và kiểu chuyển động
                className="flex items-center justify-center min-h-screen w-100">
                <ResetPasswordForm resetPassword={resetPassword} data={data} isLoading={isLoading} error={error}/>
            </motion.div>
        </div>
    )
        ;
}