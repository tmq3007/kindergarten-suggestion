'use client'
import React from 'react';
import {useForgotPasswordMutation} from "@/redux/services/authApi";
import ForgotPasswordForm from "@/app/components/ForgotPasswordForm";


export default function Page() {

    const [forgotpassword, {data, isLoading, error}] = useForgotPasswordMutation();

    return (
        <div className="relative min-h-screen bg-cyan-700 bg-opacity-50">
            {/* Chỉ thêm backdrop-blur khi loading là true */}
            <div className={`${isLoading ?
                'fixed inset-0 bg-opacity-0 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-700 ease-in-out'
                : ''}`}
            >
            </div>

            <div className="flex items-center justify-center min-h-screen w-100">
                <ForgotPasswordForm forgotpassword={forgotpassword} data={data} isLoading={isLoading} error={error}/>
            </div>
        </div>
    );
}
