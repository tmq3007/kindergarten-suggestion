import React, {memo} from "react";
import Link from "next/link";
import {Breadcrumb} from "antd";
import {HomeOutlined} from "@ant-design/icons";

interface BreadcrumbProps {
    paths: { label: string; href?: string }[];
}

const MyBreadcrumb: React.FC<BreadcrumbProps> = ({paths}) => {
    // Transform paths into items array for AntD Breadcrumb
    const breadcrumbItems = [
        {
            title: (
                <Link
                    href="/public"
                    className="text-gray-600 hover:text-gray-800 cursor-pointer flex items-center justify-center"
                >
                    <HomeOutlined className="text-gray-600"/>
                </Link>
            ),
        },
        ...paths.map((path, index) => ({
            title: path.href ? (
                <Link
                    href={path.href}
                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                    {path.label}
                </Link>
            ) : (
                <span
                    className={
                        index === paths.length - 1
                            ? "text-blue-600 font-semibold"
                            : "text-gray-600"
                    }
                >
                    {path.label}
                </span>
            ),
        })),
    ];

    return (
        <div className="mb-2 bg-white flex shadow-sm rounded-lg p-2 inline-block">
            <Breadcrumb
                className="text-sm"
                separator={<span className="text-gray-600 mx-2">{">"}</span>}
                items={breadcrumbItems}
            />
        </div>
    );
};

export default memo(MyBreadcrumb);