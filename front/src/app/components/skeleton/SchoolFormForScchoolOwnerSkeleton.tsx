"use client";
import React, { useEffect, useRef, useState } from "react";
import {Checkbox, Form, Carousel, UploadFile} from "antd";
import {
    ExpectedSchool,
    useLazySearchSchoolOwnersForAddSchoolQuery,
    useSearchExpectedSchoolQuery,
} from "@/redux/services/schoolApi";
import {
    CHILD_RECEIVING_AGE_OPTIONS,
    EDUCATION_METHOD_OPTIONS,
    FACILITY_OPTIONS,
    SCHOOL_TYPE_OPTIONS,
    UTILITY_OPTIONS,
} from "@/lib/constants";
import SchoolFormButton from "@/app/components/school/SchoolFormButton";
import clsx from "clsx";
import {
    MailOutlined,
    PhoneOutlined,
    GlobalOutlined,
    DollarOutlined,
    CalendarOutlined,
    BankOutlined,
    EnvironmentOutlined,
    BookOutlined, ToolOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { SchoolOwnerVO } from "@/redux/services/schoolOwnerApi";
import { Card, Row, Col } from "antd";

const SchoolFormForSchoolOwnerSkeleton: React.FC  = () => {

    return (
        <div className="mx-auto  rounded-lg  ">
            <Form size="middle"  className="space-y-6 h-auto">
                <Row  gutter={[16, 16]}>
                    {/* Section 1: Ảnh minh họa */}
                    <Col span={24}>
                        <Card title="School Images" bordered={false}>
                            {/* Main Image */}
                            <div className="mb-6 justify-center flex">
                                <img

                                    className="w-auto h-[500px] items-center object-cover rounded-lg transition-all duration-500"
                                />
                            </div>

                            <style jsx global>{`
                            .custom-carousel .slick-track {
                            width: 0px !important;
                          display: flex;
                          justify-content: center;
                          align-items: center;
                          }
                            .custom-carousel .slick-list {
                              display: flex !important;
                              justify-content: center !important;
                            }

                            .custom-carousel .slick-track {
                              display: flex !important;
                              justify-content: center !important;
                              align-items: center !important;
                            }

                            .custom-carousel .slick-slide {
                              display: flex !important;
                              justify-content: center !important;
                            }

                `}</style>
                            {/* Thumbnail Carousel */}
                            <Carousel
                                dots={true}

                                className={clsx("mb-4 max-h-20 custom-carousel flex justify-center custom-carousel")} // Thêm flex và justify-center để căn giữa carousel

                                responsive={[
                                    {
                                        breakpoint: 768,
                                        settings: {
                                            slidesToShow: 2,
                                        },
                                    },
                                    {
                                        breakpoint: 480,
                                        settings: {
                                            slidesToShow: 1,
                                        },
                                    },
                                ]}
                            >

                                        <div

                                            className="cursor-pointer px-1 inline-block flex justify-center" // Đảm bảo ảnh được căn giữa trong slide
                                        >
                                            <img

                                                className="h-12 object-cover rounded-lg transition-all duration-500 max-w-[100px]"
                                            />
                                        </div>


                            </Carousel>
                        </Card>
                    </Col>

                    {/* Section 2: Thông tin cơ bản và Facilities & Utilities */}
                    <Col span={24}>
                        <Row gutter={[16, 16]}>
                            {/* Cột trái: Basic Information */}
                            <Col span={12}>
                                <Card title="Basic Information"    style={{ height: "430px" }}>
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-bold"> </h2>
                                        <div className="flex items-center">
                                            <EnvironmentOutlined className="mr-2 text-gray-500" />
                                            <span className="font-medium">Address:</span>
                                            <span className="ml-2">

                      </span>
                                        </div>
                                        <div className="flex items-center">
                                            <MailOutlined className="mr-2 text-gray-500" />
                                            <span className="font-medium">Email:</span>
                                            <span className="ml-2"> </span>
                                        </div>
                                        <div className="flex items-center">
                                            <PhoneOutlined className="mr-2 text-gray-500" />
                                            <span className="font-medium">Contact:</span>
                                            <span className="ml-2"> </span>
                                        </div>
                                        <div className="flex items-center">
                                            <GlobalOutlined className="mr-2 text-gray-500" />
                                            <span className="font-medium">Website:</span>
                                            <span className="ml-2 text-blue-500">
                        <a   target="_blank" rel="noopener noreferrer">

                        </a>
                      </span>
                                        </div>
                                        <div className="flex items-center">
                                            <DollarOutlined className="mr-2 text-gray-500" />
                                            <span className="font-medium">Tuition fee:</span>
                                            <span className="ml-2">

                      </span>
                                        </div>
                                        <div className="flex items-center">
                                            <CalendarOutlined className="mr-2 text-gray-500" />
                                            <span className="font-medium">Admission age:</span>
                                            <span className="ml-2">
                       </span>
                                        </div>
                                        <div className="flex items-center">
                                            <BankOutlined className="mr-2 text-gray-500" />
                                            <span className="font-medium">School type:</span>
                                            <span className="ml-2">
                       </span>
                                        </div>
                                        <div className="flex items-center">
                                            <BookOutlined className="mr-2 text-gray-500" />
                                            <span className="font-medium">Education method:</span>
                                            <span className="ml-2">
                       </span>
                                        </div>
                                    </div>
                                </Card>
                            </Col>

                            {/* Cột phải: Facilities & Utilities */}
                            <Col span={12}>
                                <Card title="Facilities & Utilities"   style={{ height: "430px" }}>
                                    <div className="space-y-6">
                                        <Form.Item label={
                                            <span>
                            <BookOutlined style={{ marginRight: 8 }} />
                            Facilities
                        </span>
                                        }  name="facilities" labelCol={{ style: { fontSize: "28px", fontWeight: "bold" } }}>
                                            <ul className="grid grid-cols-3 gap-2 custom-add-school-select">
                                                {FACILITY_OPTIONS.map((option) => (
                                                    <li key={option.value} className="flex items-center">
                                                        {option.label}
                                                    </li>
                                                ))}
                                            </ul>
                                        </Form.Item>

                                        <Form.Item label={
                                            <span>
                            <ToolOutlined style={{ marginRight: 8 }} />
                            Utilities
                        </span>
                                        } name="utilities" labelCol={{ style: { fontSize: "28px", fontWeight: "bold" } }}>
                                            <ul className="grid grid-cols-3 gap-2 custom-add-school-select">
                                                {UTILITY_OPTIONS.map((option) => (
                                                    <li key={option.value} className="flex items-center">
                                                        {option.label}
                                                    </li>
                                                ))}
                                            </ul>
                                        </Form.Item>
                                    </div>
                                    <style>{`
      .custom-add-school-select li {
        display: flex;
        align-items: center;
        margin-bottom: 5px;
        margin-top: 17px;
        margin-left: 10px;
      }
    `}</style>
                                </Card>
                            </Col>
                        </Row>
                    </Col>

                    {/* Section 3: Mô tả giới thiệu */}
                    <Col span={24}>
                        <Card title="School Introduction"  >
                         </Card>
                    </Col>

                    {/* Section 4: Buttons */}
                    <Col span={24} style={{ textAlign: "center", marginTop: "16px" }}>
                        <div>


                        </div>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default SchoolFormForSchoolOwnerSkeleton;