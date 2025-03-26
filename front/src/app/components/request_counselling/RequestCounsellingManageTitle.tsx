import { nunito } from "@/lib/fonts";
import { Badge } from "antd";
import clsx from "clsx";

interface RequestCounsellingManageTitleProps {
    title: string;
    requestCounsellingStatus?: string;
}

export default function RequestCounsellingManageTitle({ title, requestCounsellingStatus }: RequestCounsellingManageTitleProps) {
    const statusColors: Record<string, string> = {
        "Closed": "bg-gray-200 text-gray-8",
        "Expired": "bg-yellow-200 text-yellow-800",
        "Opened": "bg-green-200 text-green-800",
    };

    return (
        <div className={'flex items-center m-5'}>
            <span className={`${nunito.className} text-3xl font-bold mr-6`}>{title}</span>
            {requestCounsellingStatus && (
                <Badge className={clsx("h-1/2 py-2 px-5 rounded-xl font-medium", statusColors[requestCounsellingStatus])}>
                    {requestCounsellingStatus}
                </Badge>
            )}
        </div>
    );
}
