'use client';

import { useState, useEffect } from 'react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!isOpen || !hasMounted) return null; // Prevents SSR mismatches

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-96 relative">
        <button className="absolute top-4 right-4" onClick={onClose}>
        </button>
        <h2 className="text-xl font-bold text-center mb-4">Create a new user</h2>
        <form className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full p-2 border rounded-lg" required />
          <input type="email" placeholder="Email Address" className="w-full p-2 border rounded-lg" required />
          <input type="tel" placeholder="Mobile No." className="w-full p-2 border rounded-lg" required />
          <input type="password" placeholder="Password" className="w-full p-2 border rounded-lg" required />
          <p className="text-xs text-gray-500">Use at least one letter, one number, and seven characters</p>
          <div className="flex justify-between">
            <button type="button" className="px-4 py-2 border rounded-lg text-gray-700" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Sign Up</button>
          </div>
        </form>
      </div>
    </div>
  );
}
