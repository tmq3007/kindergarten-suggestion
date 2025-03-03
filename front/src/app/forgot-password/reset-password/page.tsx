'use client'

import {useResetPasswordMutation} from "@/redux/services/authApi";
import React from "react";
import ResetPasswordForm from "@/app/components/ResetPasswordForm";

export default function Page() {

    const [resetPassword, {data, isLoading, error}] = useResetPasswordMutation();

    return (
        <div className="relative min-h-screen bg-cyan-700 bg-opacity-50">
            {/* Chỉ thêm backdrop-blur khi loading là true */}
            <div className={`${isLoading ?
                'fixed inset-0 bg-opacity-0 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-700 ease-in-out'
                : ''}`}
            >
            </div>

            <div className="flex items-center justify-center min-h-screen w-100">
                <ResetPasswordForm resetPassword={resetPassword} data={data} isLoading={isLoading} error={error}/>
            </div>
        </div>
    );
}