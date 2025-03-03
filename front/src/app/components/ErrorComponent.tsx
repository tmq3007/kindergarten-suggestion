import { Result, Button, Typography } from "antd";
import { ReloadOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";


const { Paragraph, Text } = Typography;

// Define valid AntD statuses
const validAntdStatuses = ["success", "info", "warning", "error", "404", "403", "500"] as const;

// Define a type for valid AntD statuses
type AntdStatus = (typeof validAntdStatuses)[number];

// Define an interface for the error response
interface GlobalError {
    code: string;
    message: string;
}

interface ApiError {
    status?: number | string; // Can be HTTP status or a custom error code
    code?: string;
    message?: string;
    globalErrors?: GlobalError[];
}

// Function to determine the status for Ant Design's <Result> component
const getErrorStatus = (error: ApiError): AntdStatus => {
    const status = String(error?.status);

    return validAntdStatuses.includes(status as AntdStatus) ? (status as AntdStatus) : "error";
};

// Function to get error message
const getErrorMessage = (error: ApiError): string => {
    console.log("Error received:", JSON.stringify(error, null, 2)); // Debugging

    if (error?.globalErrors) {
        // Ensure globalErrors is treated as an array
        const errors = Array.isArray(error.globalErrors) ? error.globalErrors : [error.globalErrors];
        return errors.map((err) => err.message).join(", ");
    }

    if (error?.message) {
        return error.message;
    }

    return "An unexpected error occurred.";
};
const ErrorComponent: React.FC<{ error: ApiError }> = ({ error }) => {
    const role = useSelector((state: RootState) => state.user?.role);
    const router = useRouter();
    return (
        <Result
            status={getErrorStatus(error)}
            title={`Error ${error?.status ?? "Unknown"}`}
            subTitle="Sorry, something went wrong."
            extra={
                error.status === 403 ? (
                    role === "ROLE_ADMIN" ? (
                        <Button type="primary" onClick={() => router.push("/admin")}>
                            Go to Login
                        </Button>
                    ) : (
                        <Button type="primary" onClick={() => router.push("/public")}>
                            Go to Login
                        </Button>
                    )
                ) : (
                    <Button type="primary" icon={<ReloadOutlined />} onClick={() => router.refresh()}>
                        Reload
                    </Button>
                )
            }
        >
            <div className="desc">
                <Paragraph>
                    <Text strong style={{ fontSize: 16 }}>
                        The following validation errors occurred:
                    </Text>
                </Paragraph>
                <Paragraph>
                    <CloseCircleOutlined className="site-result-demo-error-icon" /> {getErrorMessage(error)}
                </Paragraph>
            </div>
        </Result>
    );
};

export default ErrorComponent;
