"use client";

import { useState } from "react";

export default function AddUserForm() {
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("Active");

    return (
        <div className="  mx-auto mt-1.5 mr-2 ml-2 p-7 bg-white rounded-lg shadow-md">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 mb-4">
                <span className="text-blue-600 cursor-pointer hover:underline">User Management</span> {" > "}
                <span className="text-gray-700">Add new user</span>
            </nav>

            {/* Form Header */}
            <h2 className="text-2xl font-semibold mb-6">Add new user</h2>
            {/* Form */}
            <div className="max-w-xl   items-center">
                <form className="space-y-4">
                    {/* User Name */}
                    <div>
                        <label className="block font-medium text-gray-700">User Name *</label>
                        <input
                            type="text"
                            placeholder="Enter User Name Here..."
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="block font-medium text-gray-700">Full Name *</label>
                        <input
                            type="text"
                            placeholder="Enter Full Name Here..."
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block font-medium text-gray-700">Email *</label>
                        <input
                            type="email"
                            placeholder="Enter User Email here..."
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* DOB */}
                    <div>
                        <label className="block font-medium text-gray-700">DOB *</label>
                        <input
                            type="date"
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Phone No. */}
                    <div>
                        <label className="block font-medium text-gray-700">Phone No. *</label>
                        <input
                            type="tel"
                            placeholder="Enter phone number here..."
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Role Dropdown */}
                    <div>
                        <label className="block font-medium text-gray-700">Role *</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a role...</option>
                            <option value="Admin">Admin</option>
                            <option value="User">User</option>
                            <option value="Manager">Manager</option>
                        </select>
                    </div>

                    {/* Status Dropdown */}
                    <div>
                        <label className="block font-medium text-gray-700">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 mt-4">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>


        </div>
    );
}
