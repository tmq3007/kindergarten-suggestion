import { nunito } from "@/lib/fonts";
import { Badge } from "antd";
import clsx from "clsx";

interface SchoolManageTitleProps {
    title: string;
    schoolStatus?: string;
}

export default function SchoolManageTitle({ title, schoolStatus }: SchoolManageTitleProps) {
    const statusColors: Record<string, string> = {
        "Saved": "bg-blue-200 text-blue-800",
        "Submitted": "bg-gray-200 text-gray-8",
        "Approved": "bg-yellow-200 text-yellow-800",
        "Rejected": "bg-red-200 text-red-800",
        "Published": "bg-green-200 text-green-800",
        "Unpublished": "bg-purple-200 text-purple-800",
        "Deleted": "bg-black text-white"
    };

    return (
        <div className={'flex items-center m-5'}>
            <span className={`${nunito.className} text-3xl font-bold mr-6`}>{title}</span>
            {schoolStatus && (
                <Badge className={clsx("h-1/2 py-2 px-5 rounded-xl font-medium", statusColors[schoolStatus])}>
                    {schoolStatus}
                </Badge>
            )}
        </div>
    );
}
