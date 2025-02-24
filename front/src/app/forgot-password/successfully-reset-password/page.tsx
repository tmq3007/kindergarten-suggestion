'use client'

import React from "react";
import Link from "next/link";

export default function Page() {



    return (
        <div className="relative min-h-screen bg-cyan-700 bg-opacity-50">

            <div className="flex items-center justify-center min-h-screen w-100">
                <Link href={"/admin"}>Login</Link>
            </div>
        </div>
    );
}