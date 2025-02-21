"use client"
import React, { useState } from "react";
import Image from "next/image";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
            <div className="container mx-auto flex justify-between items-center p-4">
                {/* Logo */}
                <div className="flex items-center">
                    <Image src="/logo.png" alt="Logo" width={40} height={25} />
                </div>

                {/* Nav Menu */}
                <nav className="hidden md:flex space-x-6 text-blue-600 font-medium">
                    <a href="#" className="hover:underline">School Search</a>
                    <a href="#" className="hover:underline">Community</a>
                    <a href="#" className="hover:underline">About Us</a>
                </nav>

                {/* User Section */}
                <div className="relative">
                    <button
                        className="flex items-center text-blue-600 font-medium space-x-2"
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                    >
                        {/* User Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 14a4 4 0 01-8 0m8-2a4 4 0 01-8 0m4-12a4 4 0 110 8 4 4 0 010-8z" />
                        </svg>
                        <span>Welcome! Tran Hoai Thu</span>
                        {/* Chevron Down Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {userMenuOpen && (
                        <div className="absolute right-0 mt-2 bg-white shadow-md rounded-md w-48 py-2 border border-blue-300">
                            <a href="#" className="block px-4 py-2 hover:bg-blue-50 text-blue-600">My Schools</a>
                            <a href="#" className="block px-4 py-2 hover:bg-blue-50 text-blue-600">My Requests</a>
                            <a href="#" className="block px-4 py-2 hover:bg-blue-50 text-blue-600 font-bold">My Profile</a>
                            <hr className="border-t border-blue-300 my-2" />
                            <a href="#" className="block px-4 py-2 text-gray-400 cursor-not-allowed">Log out</a>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-blue-600"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {/* Mobile Menu Icon */}
                    {menuOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <nav className="md:hidden flex flex-col bg-white shadow-md">
                    <a href="#" className="py-2 px-4 text-blue-600 hover:bg-gray-100">School Search</a>
                    <a href="#" className="py-2 px-4 text-blue-600 hover:bg-gray-100">Community</a>
                    <a href="#" className="py-2 px-4 text-blue-600 hover:bg-gray-100">About Us</a>
                </nav>
            )}
        </header>
    );
};

export default Header;
