"use client";

import React, {FunctionComponent} from "react";
import {SchoolDetailVO, useLoadSchoolDetailsQuery} from "@/redux/services/schoolApi";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import {useParams} from "next/navigation";
import ErrorComponent from "@/app/components/common/ErrorComponent";
import {Col, Row, Skeleton} from "antd";
import SchoolDetails from "@/app/components/school/SchoolDetails";

const SchoolDetailPage: FunctionComponent = () => {
    const params = useParams();
    const schoolId = params?.id;
    const {
        data: schoolResponse,
        isLoading,
        error,
    } = useLoadSchoolDetailsQuery(Number(schoolId), {
        skip: !schoolId,
    });

    // Extract the school data from the response
    const schoolData: SchoolDetailVO | undefined = schoolResponse?.data;

    // Loading state with Skeleton
    if (isLoading) {
        return (
            <div className="w-full mt-20 px-10">
                <MyBreadcrumb
                    paths={[
                        {label: "School Search", href: "/public/search-school"},
                        {label: "School Details"},
                    ]}
                />
                <Row gutter={[24, 24]} justify="center">
                    <Col xs={24}>
                        <Skeleton.Image active className={'!w-full !h-[500px]'}/> {/* Image carousel */}
                    </Col>

                    <Col xs={24}>
                        <Skeleton.Image active className={'!w-full !h-[200px]'}/> {/* Image carousel */}
                    </Col>
                    <Col xs={24}>
                        <Skeleton active paragraph={{rows: 8}} title={{width: "30%"}}/> {/* Basic info */}
                    </Col>
                    <Col xs={24}>
                        <Skeleton active paragraph={{rows: 10}}/> {/* Tabs */}
                    </Col>
                </Row>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="w-full min-h-screen content-center mt-20">
                <ErrorComponent error={error}/>
            </div>
        );
    }

    // Handle case when no data is returned (but not loading)
    if (!schoolData) {
        return (
            <div className="w-full h-screen mt-20">
                <div className="text-center">
                    <p>No school data found</p>
                </div>
            </div>
        );
    }

    // Main content
    return (
        <div className="w-full mt-20 px-10">
            <MyBreadcrumb
                paths={[
                    {label: "School Search", href: "/public/search-school"},
                    {label: "School Details"},
                ]}
            />
            <SchoolDetails schoolData={schoolData}/>
        </div>
    );
};

export default SchoolDetailPage;