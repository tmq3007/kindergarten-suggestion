'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Button } from 'antd';

export default function LogoutPage() {
    const [open, setOpen] = useState(true);
    const router = useRouter();

    const handleLogout = () => {
        // Gọi API logout ở đây nếu cần
        // Ví dụ: fetch('/api/logout', { method: 'POST' })

        setOpen(false);
        router.push('/'); // Điều hướng về trang chủ sau khi logout
    };

    const handleCancel = () => {
        setOpen(false);
        router.back(); // Quay lại trang trước đó
    };

    useEffect(() => {
        setOpen(true);
    }, []);

    return (
        <Modal
            title="Are you leaving?"
            open={open}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel}>Cancel</Button>,
                <Button key="logout" type="primary" onClick={handleLogout}>Yes</Button>
            ]}
        >
            <p>Are you sure you want to logout? All your unsaved data will be lost.</p>
        </Modal>
    );
}