'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error401() {
    const router = useRouter();

    useEffect(() => {
        router.push('/public');
    }, [router]);

    return null; // Hoặc bạn có thể return một UI nếu muốn hiển thị thông báo trước khi điều hướng
}