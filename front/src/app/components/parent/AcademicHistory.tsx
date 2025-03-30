
import { List, Tag, Rate, Typography } from "antd";
import { ParentInSchoolVO } from "@/redux/services/parentApi";
import { useGetAcademicHistoryByParentQuery } from "@/redux/services/parentApi";
import { useEffect, useState } from "react";

const { Text } = Typography;

interface SchoolHistoryProps {
    parentId: number;
}

export const SchoolHistory = ({ parentId }: SchoolHistoryProps) => {
    const { data: historyData, isLoading, isFetching, isError, error, refetch } = useGetAcademicHistoryByParentQuery(
        {parentId},
        { skip: !parentId || parentId <= 0 } // Skip if parentId is invalid
    );

    const [history, setHistory] = useState<ParentInSchoolVO[]>([]);

    // Reset history and refetch when parentId changes
    useEffect(() => {
        setHistory([]); // Empty the list immediately on parentId change
        if (parentId > 0) {
            refetch(); // Force a refetch for the new parentId
        }
    }, [parentId, refetch]);

    // Update history when new data is fetched
    useEffect(() => {
        if (historyData?.data) {
            setHistory(historyData.data);
        }
    }, [historyData]);

    if (isError) {
        console.error("Error fetching academic history:", error);
        return <Text type="danger">Failed to load school history</Text>;
    }

    return (
        <div>
            <h5 style={{ color: "#595959", marginBottom: 8 }}>School History</h5>
            <List
                size="small"
                loading={isLoading || isFetching}
                dataSource={history}
                bordered
                style={{ maxHeight: "200px", overflowY: "auto" }}
                renderItem={(item: ParentInSchoolVO) => (
                    <List.Item style={{ padding: "8px 16px" }}>
                        <div className="flex flex-col gap-1">
                            <Text strong>
                                {item.school?.name || "Unknown School"}
                                <Tag className="mx-2" color={item.status === 1 ? "green" : "red"}>
                                    {item.status === 1 ? "Active" : "Inactive"}
                                </Tag>
                            </Text>
                            <Text>
                                <Text type="secondary" style={{ fontSize: "15px" }}>
                                    {new Date(item.fromDate).toLocaleDateString()} ~{" "}
                                    {item.toDate ? new Date(item.toDate).toLocaleDateString() : "Present"}
                                </Text>
                            </Text>
                            <div className="flex items-center gap-2">
                                <span>Provided Rating:</span>
                                {item.providedRating ? (
                                    <Rate
                                        disabled
                                        value={item.providedRating}
                                        style={{ fontSize: 12, marginLeft: 4 }}
                                        className="compact-rate"
                                    />
                                ) : (
                                    <Text type="secondary" style={{ fontSize: "12px" }}>
                                        Not rated
                                    </Text>
                                )}
                            </div>
                        </div>
                    </List.Item>
                )}
                locale={{ emptyText: <Text type="secondary">No school history available</Text> }}
            />
        </div>
    );
};