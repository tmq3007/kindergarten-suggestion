"use client";

import { useState } from "react";
import RatingsPopupWrapper from "@/app/components/review/ReviewPopupWrapper";
import { Button } from "antd";

export default function Home() {
    const [selectedSchool, setSelectedSchool] = useState<{
        parentId:number,
        schoolId: number;
        schoolName: string;
        isUpdate: boolean;
    } | null>(null);

    const schools = [
        { schoolId: 1,parentId:4, schoolName: "Example School 1", isUpdate: true },
        { schoolId: 2,parentId:4, schoolName: "Example School 2", isUpdate: true },
        { schoolId: 91,parentId:4, schoolName: "Example School 3", isUpdate: true },
    ];

    const handleOpenModal = (parentId: number,schoolId: number, schoolName: string, isUpdate: boolean) => {
        setSelectedSchool({parentId, schoolId, schoolName, isUpdate });
    };

    const handleCloseModal = () => {
        setSelectedSchool(null);
    };

    return (
        <div className="p-80">
            <div className="space-y-4">
                {schools.map((school) => (
                    <Button
                        key={school.schoolId}
                        type="primary"
                        onClick={() => handleOpenModal(school.parentId,school.schoolId, school.schoolName, school.isUpdate)}
                        className="text-lg px-6 py-2 h-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-none shadow-lg"
                        size="large"
                    >
                        {school.isUpdate ? "Update" : "Rate"} {school.schoolName}
                    </Button>
                ))}
            </div>

            {selectedSchool && (
                <RatingsPopupWrapper
                    parentId={selectedSchool.parentId}
                    schoolId={selectedSchool.schoolId}
                    schoolName={selectedSchool.schoolName}
                    isUpdate={selectedSchool.isUpdate}
                    isOpen={!!selectedSchool}
                    onCloseAction={handleCloseModal}
                />
            )}
        </div>
    );
}