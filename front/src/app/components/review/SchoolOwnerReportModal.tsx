// SchoolOwnerReportModal.tsx
import React, { useState } from 'react';
import { Button, Modal, Input, message } from 'antd';
import { useReportReviewMutation } from '@/redux/services/reviewApi';

const { TextArea } = Input;

interface SchoolOwnerReportModalProps {
    open: boolean;
    onSubmit: (reportContent: string, reviewId: number | null) => Promise<void>;
    onCancel: () => void;
    reviewId: number | null;
    onReporting: boolean
}

const SchoolOwnerReportModal: React.FC<SchoolOwnerReportModalProps> = ({
                                                                           open,
                                                                           onSubmit,
                                                                           onCancel,
                                                                           reviewId,
    onReporting
                                                                       }) => {
    const [reportContent, setReportContent] = useState<string>('');
    const [reportReview, { isLoading: loading }] = useReportReviewMutation();

    const handleSubmit = async () => {
        if (reportContent.trim() && reviewId) {
            try {
                await onSubmit(reportContent, reviewId);
                setReportContent('');
            } catch (error) {
                message.error('Failed to submit report');
            }
        }
    };

    const handleCancel = () => {
        setReportContent('');
        onCancel();
    };

    return (
        <Modal
            getContainer={false}
            title={`Create Report for Review #${reviewId || 'Unknown'}`}
            open={open}
            footer={[
                <Button key="cancel" onClick={handleCancel} disabled={loading}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleSubmit}
                    loading={onReporting}
                    disabled={onReporting || !reportContent.trim() || !reviewId}
                >
                    Submit
                </Button>,
            ]}
            onCancel={handleCancel}
        >
            <div className="mb-4">
                <TextArea
                    rows={4}
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                    placeholder="Enter your report content here..."
                    disabled={loading}
                    className="w-full"
                />
            </div>
        </Modal>
    );
};

export default SchoolOwnerReportModal;