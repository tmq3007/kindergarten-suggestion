import { Timeline, Tag, Rate, Typography } from "antd";
import { ParentInSchoolVO } from "@/redux/services/parentApi";
import { useGetAcademicHistoryByParentQuery } from "@/redux/services/parentApi";
import { useEffect, useState } from "react";
import { ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface SchoolHistoryProps {
    parentId: number;
}

export const SchoolHistory = ({ parentId }: SchoolHistoryProps) => {
    const {
        data: historyData,
        isLoading,
        isFetching,
        isError,
        error,
        refetch
    } = useGetAcademicHistoryByParentQuery(
        { parentId },
        { skip: !parentId || parentId <= 0 }
    );

    const [history, setHistory] = useState<ParentInSchoolVO[]>([]);

    useEffect(() => {
        setHistory([]);
        if (parentId > 0) {
            refetch();
        }
    }, [parentId, refetch]);

    useEffect(() => {
        if (historyData?.data) {
            const sortedHistory = [...historyData.data].sort((a, b) => {
                if (a.status === 1 && b.status !== 1) return -1;
                if (a.status !== 1 && b.status === 1) return 1;
                return new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime();
            });
            setHistory(sortedHistory);
        }
    }, [historyData]);

    if (isError) {
        console.error("Error fetching academic history:", error);
        return <Text type="danger">Failed to load school history</Text>;
    }

    const timelineItems = history.map((item: ParentInSchoolVO) => ({
        key: item.id,
        dot: <ClockCircleOutlined className="text-base" />,
        color: item.status === 1 ? "green" : "gray",
        children: (
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Text strong className="font-semibold">
                        {item.school?.name || "Unknown School"}
                    </Text>
                    <Tag
                        color={item.status === 1 ? "green" : "red"}
                        className="text-xs"
                    >
                        {item.status === 1 ? "Active" : "Inactive"}
                    </Tag>
                </div>
                <Text className="text-gray-500 text-sm">
                    {new Date(item.fromDate).toLocaleDateString()} -{" "}
                    {item.toDate ? new Date(item.toDate).toLocaleDateString() : "Present"}
                </Text>
                <div className="flex items-center gap-2">
                    <Text className="text-gray-500 text-xs">
                        Rating:
                    </Text>
                    {item.providedRating ? (
                        <Rate
                            disabled
                            value={item.providedRating}
                            className="[&_.ant-rate-star]:mr-0.5 text-xs"
                        />
                    ) : (
                        <Text className="text-gray-500 text-xs">
                            Not rated
                        </Text>
                    )}
                </div>
            </div>
        ),
    }));

    return (
        <div className="flex flex-col max-h-full">
            <h5 className="text-gray-600 mb-4">School History</h5>
            {isLoading || isFetching ? (
                <Text className="text-gray-500">Loading academic history...</Text>
            ) : history.length > 0 ? (
                <div className="flex overflow-y-auto p-4">
                        <Timeline mode="left" items={timelineItems}/>
                </div>
            ) : (
                <Text className="text-gray-500">No school history available</Text>
            )}
        </div>
    );
};