'use client'
import React from 'react';
import {useLoginByAdminMutation} from "@/redux/services/authApi";
import AdminLoginForm from "@/app/components/AdminLoginForm";
import {motion} from 'framer-motion'


export default function Page() {
    const [login, {data, isLoading, error}] = useLoginByAdminMutation();

    return (
        <div className="overflow-hidden relative min-h-screen bg-cyan-700 bg-opacity-50">
            {/* Chỉ thêm backdrop-blur khi loading là true */}
            <div className={`${isLoading ?
                'fixed inset-0 bg-opacity-0 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-700 ease-in-out'
                : ''}`}
            >
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: [0, 1.4, 1] }} // Keyframes: 0 -> 1.2 -> 1
                transition={{ duration: 0.8, ease: "easeInOut" }} // Thời gian và kiểu chuyển động
                className="flex items-center justify-center min-h-screen w-100">
                <AdminLoginForm
                    login={login}
                    data={data}
                    isLoading={isLoading}
                    error={error}
                />
            </motion.div>
        </div>
    );
}
