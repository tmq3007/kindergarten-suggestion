import {Card, Col, Row, Skeleton} from "antd";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import React from "react";

interface DetailPageSkeletonProps {
    paths: { label: string; href?: string }[];
}

export default function DetailPageSkeleton({paths}: DetailPageSkeletonProps) {
    return (
        <>
            <div className="pt-2">
                <MyBreadcrumb
                    paths={paths}
                />
                <SchoolManageTitle title={"School details"}/>
            </div>
            <div className="mx-auto container px-4 sm:px-6 lg:px-8">
                <Row gutter={[16, 16]}>
                    {/* Section 1: Ảnh minh họa */}
                    <Col span={24}>
                        <Card>
                            <Skeleton.Image active className={'!w-full !h-[500px]'}/>
                        </Card>
                    </Col>

                    {/* Section 2: Thông tin cơ bản và Facilities & Utilities */}
                    <Col span={24}>
                        <Row gutter={[16, 16]}>
                            {/* Cột trái: Basic Information */}
                            <Col span={12}>
                                <Card>
                                    <Skeleton active paragraph={{rows: 8}}/>
                                </Card>
                            </Col>

                            {/* Cột phải: Facilities & Utilities */}
                            <Col span={12}>
                                <Card>
                                    <Skeleton active paragraph={{rows: 8}}/>
                                </Card>
                            </Col>
                        </Row>
                    </Col>

                    {/* Section 3: Mô tả giới thiệu */}
                    <Col span={24}>
                        <Card>
                            <Skeleton active paragraph={{rows: 4}}/>
                        </Card>
                    </Col>

                    {/* Section 4: Buttons */}
                    <Col span={24} style={{textAlign: 'center', marginTop: '16px'}}>
                        <Skeleton.Button active size="large" style={{width: '200px'}}/>
                    </Col>
                </Row>
            </div>
        </>
    );
}