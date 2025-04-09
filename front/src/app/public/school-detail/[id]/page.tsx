'use client'

import React, { FunctionComponent } from 'react';
import SchoolDetails from "@/app/components/school/SchoolDetails";
import { SchoolDetailVO, useLoadSchoolDetailsQuery } from "@/redux/services/schoolApi";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import { useParams } from "next/navigation";
import ErrorComponent from "@/app/components/common/ErrorComponent";

const SchoolDetailPage: FunctionComponent = () => {
    const params = useParams();
    const schoolId = params?.id;
    const {
        data: schoolResponse,
        isLoading,
        error
    } = useLoadSchoolDetailsQuery(Number(schoolId), {
        skip: !schoolId,
    });

    // Extract the school data from the response
    const schoolData: SchoolDetailVO | undefined = schoolResponse?.data;

    // Loading state
    if (isLoading) {
        return (
            <div className="w-full mt-20">
                <div className="flex justify-center items-center h-64">
                    <p>Loading school details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="w-full min-h-screen content-center mt-20">
               <ErrorComponent  error={error} />
            </div>
        );
    }

    // Handle case when no data is returned
    if (!schoolData) {
        return (
            <div className="w-full min-h-screen mt-20">
                <div className="text-center">
                    <p>No school data found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mt-20 px-10">
            <MyBreadcrumb
                paths={[
                    { label: "School Search", href: "/public/search-school" },
                    { label: "School Details" },
                ]}
            />
            <SchoolDetails schoolData={schoolData} />
        </div>
    );
};

export default SchoolDetailPage;