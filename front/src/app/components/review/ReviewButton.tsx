import React from 'react';
import {EyeOutlined, FlagFilled} from "@ant-design/icons";

// Props cho ViewReportLink
interface ViewReportLinkProps {
    onClick?: () => void,
    disabled?: boolean,
    onFetching?: boolean
}

const ViewReportLink: React.FC<ViewReportLinkProps> = ({
                                                           onClick,
                                                           disabled = false,
                                                           onFetching = false
                                                       }) => {
    const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
        if (disabled || onFetching) {
            e.preventDefault();
            return;
        }
        if (onClick) {
            onClick();
        }
    };

    return (
        <span
            onClick={handleClick}
            className={`
                ${onFetching ? 'cursor-wait text-xs text-blue-500' : disabled ? 'cursor-not-allowed text-xs text-blue-500' : 'text-xs text-blue-500 cursor-default hover:underline'}
                text-sm font-medium
                transition-all duration-200
            `}
        >
            {onFetching ? 'Loading...' : <>View Report <EyeOutlined /> </>}
        </span>
    );
};

// Props cho MakeReportLink
interface MakeReportLinkProps {
    onClick?: () => void,
    disabled?: boolean,
    onFetching?: boolean
}

const MakeReportLink: React.FC<MakeReportLinkProps> = ({
                                                           onClick,
                                                           disabled = false,
                                                           onFetching = false
                                                       }) => {
    const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
        if (disabled || onFetching) {
            e.preventDefault();
            return;
        }
        if (onClick) {
            onClick();
        }
    };

    return (
        <span
            onClick={handleClick}
            className={`
                ${onFetching ? 'cursor-wait text-xs text-blue-500' : disabled ? 'cursor-not-allowed text-xs text-blue-500' : 'text-xs text-blue-500 cursor-default hover:underline'}
                text-sm font-medium
                transition-all duration-200
            `}
        >
{onFetching ? 'Loading...' : <>Report <FlagFilled /> </>}
        </span>
    );
};

export { ViewReportLink, MakeReportLink };