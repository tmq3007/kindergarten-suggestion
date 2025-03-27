import React, { useState } from 'react';
import { Button, Modal } from 'antd';

// @ts-ignore
const AdminReportModal = ({ open, onAccept, onDeny, reportContent }) => {
    const [loadingAccept, setLoadingAccept] = useState(false);
    const [loadingDeny, setLoadingDeny] = useState(false);

    const handleAccept = async () => {
        setLoadingAccept(true);
        await onAccept();
        setLoadingAccept(false);
    };

    const handleDeny = async () => {
        setLoadingDeny(true);
        await onDeny();
        setLoadingDeny(false);
    };

    return (
        <Modal
            title="Report Details"
            open={open}
            footer={[
                <Button key="deny" loading={loadingDeny} onClick={handleDeny}>
                    Deny
                </Button>,
                <Button key="accept" type="primary" loading={loadingAccept} onClick={handleAccept}>
                    Accept
                </Button>,
            ]}
        >
            <p>{reportContent || "No report content available"}</p>
        </Modal>
    );
};

export default AdminReportModal;
