"use client";
import React, { useState } from "react";

const Profile = () => {
    const [dob, setDob] = useState("");
    const [tab, setTab] = useState("info");

    return (
        <div className="max-w-4xl mt-14 mx-auto p-6">
            {/* Breadcrumb */}
            <nav className="text-gray-500 text-sm mb-4">
                Home &gt; <span className="text-black font-semibold">My Profile</span>
            </nav>

            {/* Header Tabs */}
            <div className="border-b flex space-x-4">
                <button
                    className={`px-4 py-2 font-semibold ${tab === "info" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                    onClick={() => setTab("info")}
                >
                    My Information
                </button>
                <button
                    className={`px-4 py-2 font-semibold ${tab === "password" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
                    onClick={() => setTab("password")}
                >
                    Change Password
                </button>
            </div>

            {/* Form */}
            <div className="mt-6 bg-blue-50 shadow-md p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4 text-blue-600">Account Info</h2>
                <div className="grid grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                        <label className="text-blue-700 font-medium">Full Name *</label>
                        <input
                            type="text"
                            className="w-full border border-blue-400 p-2 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            defaultValue="Nguyễn Hoàng Anh"
                        />
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="text-blue-700 font-medium">D.O.B</label>
                        <input
                            type="date"
                            className="w-full border border-blue-400 p-2 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-blue-700 font-medium">Email Address *</label>
                        <input
                            type="email"
                            className="w-full border border-blue-400 p-2 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            defaultValue="info@xyz.com"
                        />
                    </div>

                    {/* Mobile Number */}
                    <div>
                        <label className="text-blue-700 font-medium">Mobile No. *</label>
                        <input
                            type="tel"
                            className="w-full border border-blue-400 p-2 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            defaultValue="+91 - 98596 58000"
                        />
                    </div>
                </div>

                {/* Address Section */}
                <h2 className="text-lg font-semibold mt-6 mb-4 text-blue-600">Address</h2>
                <div className="grid grid-cols-2 gap-4">
                    <select className="w-full border border-blue-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
                        <option>City/Province</option>
                    </select>
                    <select className="w-full border border-blue-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
                        <option>District</option>
                    </select>
                    <select className="w-full border border-blue-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
                        <option>Ward</option>
                    </select>
                    <input
                        type="text"
                        className="w-full border border-blue-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="House Number, Street"
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-6">
                    <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-100">
                        Cancel
                    </button>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
