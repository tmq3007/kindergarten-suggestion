"use client"

import RegisterModal from "@/app/(public)/component/RegisterForm";
import { useState } from "react";

export default function RegisterPage() {
    const [isModalOpen, setIsModalOpen] = useState(true);
    return (
        <div>
            <button onClick={()=>setIsModalOpen(true)}>open this</button>
            <RegisterModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)}/>
        </div>
    );
}