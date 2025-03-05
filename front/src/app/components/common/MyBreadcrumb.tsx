import React from "react";

interface BreadcrumbProps {
    paths: { label: string; href?: string }[];  // Mảng các đối tượng chứa label và href (tuỳ chọn)
}

const MyBreadcrumb: React.FC<BreadcrumbProps> = ({paths}) => {
    return (
        <nav className="text-sm mb-6">
            {paths.map((path, index) => (
                <span key={index}>
                    {path.href ? (
                        <a href={path.href} className="text-blue-600 hover:text-blue-600 cursor-pointer">
                            {path.label}
                        </a>
                    ) : (
                        <span className="text-blue-600 hover:text-blue-600 cursor-pointer">{path.label}</span> // Không có href thì màu xám
                    )}
                    {index < paths.length - 1 && " > "}
                </span>
            ))}
        </nav>
    );
};

export default MyBreadcrumb;
