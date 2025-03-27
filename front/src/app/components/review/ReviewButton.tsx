import React from 'react';
import {Button} from 'antd';
import {REVIEW_STATUS} from '@/lib/constants';

// Props cho ReviewButton
interface ReviewButtonProps {
    status?: number;
    disabled?: boolean;
    onClick?: () => void;
}

const ReviewButton: React.FC<ReviewButtonProps> = ({
                                                       status,
                                                       disabled = false,
                                                       onClick,
                                                   }) => {
    const getButtonStyles = () => {
        switch (Number(status)) {
            case REVIEW_STATUS.PENDING:
                return "bg-yellow-300 text-yellow-700 border-yellow-300 hover:!bg-yellow-300 hover:!text-yellow-700";
            case REVIEW_STATUS.APPROVED:
                return "bg-green-300 text-green-700 border-green-300 hover:!bg-green-300 hover:!text-green-700";
            case REVIEW_STATUS.REJECTED:
                return "bg-red-300 text-red-700 border-red-300 hover:!bg-red-300 hover:!text-red-700";
            default:
                return "bg-gray-300 text-gray-700 border-gray-300 hover:!bg-gray-300 hover:!text-gray-700";
        }
    };

    const getButtonText = () => {
        switch (Number(status)) {
            case REVIEW_STATUS.PENDING:
                return "Pending";
            case REVIEW_STATUS.APPROVED:
                return "Approved";
            case REVIEW_STATUS.REJECTED:
                return "Rejected";
            default:
                return "Unknown";
        }
    };

    return (
        <Button
            size="small"
            shape="round"
            className={`
                ${getButtonStyles()}
                disabled:opacity-75
                !min-w-[90px]
                h-7
                flex items-center justify-center
                border
                px-4
                transition-all duration-300
             `}
            disabled={disabled}
            onClick={onClick}
        >
            <span className="text-sm font-medium">{getButtonText()}</span>
        </Button>
    );
};

// Props cho ViewReportButton
interface ViewReportButtonProps {
    onClick?: () => void,
    disabled?: boolean,
    onFetching?: boolean
}

const ViewReportButton: React.FC<ViewReportButtonProps> = ({
                                                               onClick,
                                                               disabled = false,
                                                           }) => {
    return (
        <Button
            size="small"
            shape="round"
            className={`
                bg-blue-300 text-blue-700 border-blue-300 hover:!bg-blue-300 hover:!text-blue-700
                disabled:opacity-75
                !min-w-[90px]
                h-7
                flex items-center justify-center
                border
                px-4
                transition-all duration-300
             `}
            disabled={disabled}
            onClick={onClick}
        >
            <span className="text-sm font-medium">View Report</span>
        </Button>
    );
};

const MakeReportButton: React.FC<ViewReportButtonProps> = ({
                                                               onClick,
                                                               onFetching = false,
                                                               disabled = false,

                                                           }) => {
    return (
        <Button
            size="small"
            shape="round"
            className={`
                bg-blue-300 text-blue-700 border-blue-300 hover:!bg-blue-300 hover:!text-blue-700
                disabled:opacity-75
                !min-w-[90px]
                h-7
                flex items-center justify-center
                border
                px-4
                transition-all duration-300
             `}
            disabled={disabled}
            onClick={onClick}
            loading={onFetching}
        >
            <span className="text-sm font-medium">Report</span>
        </Button>
    );
};

export {ReviewButton, ViewReportButton, MakeReportButton};