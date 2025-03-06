import React from "react";
import Link from "next/link";

interface BreadcrumbProps {
    paths: { label: string; href?: string }[];
}

const MyBreadcrumb: React.FC<BreadcrumbProps> = ({paths}) => {
    return (
        <nav className="text-sm mb-6">
            {paths.map((path, index) => (
                <span key={index}>
                    {path.href ? (
                        <Link href={path.href} className="text-blue-600 hover:text-blue-600 cursor-pointer">
                            {path.label}
                        </Link>
                    ) : (
                        <span className="text-blue-600 hover:text-blue-600 cursor-pointer">{path.label}</span>
                    )}
                    {index < paths.length - 1 && " > "}
                </span>
            ))}
        </nav>
    );
};

export default MyBreadcrumb;
