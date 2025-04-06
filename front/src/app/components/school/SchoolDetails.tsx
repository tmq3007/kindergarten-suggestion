"use client";
import React, {FunctionComponent} from "react";
import {Card, Col, Row, Descriptions, Tabs, Alert, Spin} from "antd";
import {
    EnvironmentOutlined,
    MailOutlined,
    PhoneOutlined,
    GlobalOutlined,
    DollarOutlined,
    CalendarOutlined,
    BankOutlined,
    BookOutlined,
    ToolOutlined, CommentOutlined, PaperClipOutlined,
} from "@ant-design/icons";
import {SchoolDetailVO} from "@/redux/services/schoolApi";
import {FACILITY_OPTIONS, UTILITY_OPTIONS} from "@/lib/constants";
import SchoolImageCarousel from "@/app/components/common/SchoolImageCarousel";
import CommentSection from "@/app/components/school/CommentSection";
import {ReviewVO, useGetReviewBySchoolIdQuery} from "@/redux/services/reviewApi";

interface SchoolDetailsProps {
    schoolData: SchoolDetailVO;
    CHILD_RECEIVING_AGE_OPTIONS?: { value: number; label: string }[];
    SCHOOL_TYPE_OPTIONS?: { value: number; label: string }[];
    EDUCATION_METHOD_OPTIONS?: { value: number; label: string }[];
}
const mockReviews: ReviewVO[] = [
    {
        id: 1,
        schoolId: 1,
        schoolName: "Sunshine International School",
        parentId: 101,
        parentName: "Emily Tran",
        parentImage: "https://via.placeholder.com/48?text=Emily",
        learningProgram: 5,
        facilitiesAndUtilities: 4,
        extracurricularActivities: 4,
        teacherAndStaff: 5,
        hygieneAndNutrition: 4,
        feedback: "My child loves the learning program here! The teachers are amazing, and the facilities are top-notch. I only wish there were more extracurricular activities.",
        average: 4.4,
        receiveDate: "2023-10-15 09:30:00",
        report: undefined,
        status: 1, // Approved
    },
    {
        id: 2,
        schoolId: 1,
        schoolName: "Sunshine International School",
        parentId: 102,
        parentName: "Michael Nguyen",
        parentImage: "https://via.placeholder.com/48?text=Michael",
        learningProgram: 4,
        facilitiesAndUtilities: 5,
        extracurricularActivities: 3,
        teacherAndStaff: 4,
        hygieneAndNutrition: 5,
        feedback: "Great school with excellent facilities and a focus on hygiene. The extracurricular activities could be improved, but overall, we’re very happy.",
        average: 4.2,
        receiveDate: "2023-09-20 14:20:00",
        report: undefined,
        status: 1, // Approved
    },
    {
        id: 3,
        schoolId: 1,
        schoolName: "Sunshine International School",
        parentId: 103,
        parentName: "Sarah Le",
        parentImage: "https://via.placeholder.com/48?text=Sarah",
        learningProgram: 5,
        facilitiesAndUtilities: 5,
        extracurricularActivities: 5,
        teacherAndStaff: 5,
        hygieneAndNutrition: 5,
        feedback: "An outstanding school! Everything is perfect, from the curriculum to the staff. My child is thriving here.",
        average: 5.0,
        receiveDate: "2023-08-10 11:00:00",
        report: undefined,
        status: 1, // Approved
    },
];
const SchoolDetails: FunctionComponent<SchoolDetailsProps> = ({
                                                                  schoolData,
                                                                  CHILD_RECEIVING_AGE_OPTIONS = [],
                                                                  SCHOOL_TYPE_OPTIONS = [],
                                                                  EDUCATION_METHOD_OPTIONS = [],
                                                              }) => {
    const {
        id,
        name,
        street,
        ward,
        district,
        province,
        email,
        phone,
        website,
        feeFrom,
        feeTo,
        receivingAge,
        schoolType,
        educationMethod,
        facilities,
        utilities,
        description,
        imageList,
    } = schoolData;

    // Custom CSS for facilities/utilities and Descriptions
    const styles = `
        /* Facilities and Utilities */
        .facility-item, .utility-item {
            display: flex;
            align-items: center;
            padding: 4px 0;
        }
        .facility-present, .utility-present {
            color: #00bcd4; /* Cyan to match your theme */
            font-weight: bold;
        }
        .facility-absent, .utility-absent {
            color: #d9d9d9; /* Light gray for absent items */
        }
    `;
    // Fetch reviews using the API query
    const {data, error, isLoading} = useGetReviewBySchoolIdQuery({
        schoolId: id,
        fromDate: undefined,
        toDate: undefined,
        status: "0",
    });

    const reviews: ReviewVO[] = data?.data || [];

    // Map facility and utility IDs from schoolData to their options
    const facilityIds = facilities.map((f) => String(f.fid));
    const utilityIds = utilities.map((u) => String(u.uid));

    // Define tab items
    const tabItems = [
        {
            key: "1",
            label: "School Introduction",
            icon: <PaperClipOutlined/>,
            children: (
                <Card className="w-full shadow-lg border border-cyan-500 bg-white p-6">
                    <div
                        className="text-gray-800 text-lg"
                        dangerouslySetInnerHTML={{__html: description || "N/A"}}
                    />
                </Card>
            ),
        },
        {
            key: "2",
            label: "Comments",
            icon: <CommentOutlined/>,
            children: (
                <Card className="w-full sha dow-lg border border-cyan-500 bg-white lg:p-6 md:p-0"  styles={{
                    body: { padding: 0 }
                }} >
                    {/*{isLoading ? (*/}
                    {/*    <Spin tip="Loading reviews..."/>*/}
                    {/*) : error ? (*/}
                    {/*    <Alert*/}
                    {/*        message="Error"*/}
                    {/*        description="Failed to load reviews. Please try again later."*/}
                    {/*        type="error"*/}
                    {/*        showIcon*/}
                    {/*    />*/}
                    {/*) : (*/}
                    {/*    <CommentSection reviews={mockReviews}/>*/}
                    {/*)}*/}
                    <CommentSection reviews={mockReviews}/>

                </Card>
            ),
        },
    ];

    return (
        <div className="w-full flex justify-center mb-8">
            <Row gutter={[24, 24]} justify="center">
                {/* Section 1: School Images */}
                <style>{styles}</style>
                <Col xs={24}>
                    <SchoolImageCarousel imageList={imageList}/>
                </Col>

                <Col xs={24} className="flex justify-center">
                    <Row gutter={[24, 24]} justify="center" className="w-full">
                        {/* Section 2: Basic Information and Facilities & Utilities */}
                        <Col xs={24}>
                            <Row gutter={[24, 24]} justify="space-between">
                                {/* Left Column: Basic Information */}
                                <Col xs={24} lg={16} className="flex">
                                    <Card
                                        title="Basic Information"
                                        className="w-full shadow-lg border border-cyan-500 bg-white p-6"
                                    >
                                        <h2 className="text-3xl font-bold mb-6">{name || "Unknown School"}</h2>
                                        <Descriptions column={1} bordered className="w-full text-xl"
                                                      styles={{content: {fontSize: '16px'}}} size={"middle"}>
                                            <Descriptions.Item
                                                label={
                                                    <span className="text-base">
                                                        <EnvironmentOutlined className="mr-2"/>
                                                        Address
                                                    </span>
                                                }
                                            >
                                                {[street, ward, district, province].filter(Boolean).join(", ") || "N/A"}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <span className="text-base">
                                                        <MailOutlined className="mr-2"/>
                                                        Email
                                                    </span>
                                                }
                                            >
                                                {email || "N/A"}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <span className="text-base">
                                                        <PhoneOutlined className="mr-2"/>
                                                        Contact
                                                    </span>
                                                }
                                            >
                                                {phone || "N/A"}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <span className="text-base">
                                                        <GlobalOutlined className="mr-2"/>
                                                        Website
                                                    </span>
                                                }
                                            >
                                                <a
                                                    href={website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500"
                                                    style={{wordBreak: "break-all"}}
                                                >
                                                    {website || "N/A"}
                                                </a>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <span className="text-base">
                                                        <DollarOutlined className="mr-2"/>
                                                        Tuition Fee
                                                    </span>
                                                }
                                            >
                                                From {feeFrom?.toLocaleString() || "N/A"} VND/month
                                                {feeTo ? ` to ${feeTo?.toLocaleString()} VND/month` : ""}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <span className="text-base">
                                                        <CalendarOutlined className="mr-2"/>
                                                        Admission Age
                                                    </span>
                                                }
                                            >
                                                {CHILD_RECEIVING_AGE_OPTIONS.find((opt) => opt.value === receivingAge)?.label || "N/A"}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <span className="text-base">
                                                        <BankOutlined className="mr-2"/>
                                                        School Type
                                                    </span>
                                                }
                                            >
                                                {SCHOOL_TYPE_OPTIONS.find((opt) => opt.value === schoolType)?.label || "N/A"}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <span className="text-base">
                                                        <BookOutlined className="mr-2"/>
                                                        Education Method
                                                    </span>
                                                }
                                            >
                                                {EDUCATION_METHOD_OPTIONS.find((opt) => opt.value === educationMethod)?.label || "N/A"}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Card>
                                </Col>

                                {/* Right Column: Facilities & Utilities */}
                                <Col xs={24} lg={8} className="flex">
                                    <Card
                                        title="Facilities & Utilities"
                                        className="w-full shadow-lg border border-cyan-500 bg-white p-6"
                                    >
                                        <div className="space-y-8">
                                            <div>
                                                <span className="flex items-center text-2xl font-bold mb-4">
                                                    <BookOutlined className="mr-2"/>
                                                    Facilities
                                                </span>
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 text-lg">
                                                    {FACILITY_OPTIONS.map((option, index) => {
                                                        const isPresent = facilityIds.includes(option.value);
                                                        return (
                                                            <li
                                                                key={index}
                                                                className={`facility-item ${isPresent ? "facility-present" : "facility-absent"}`}
                                                            >
                                                                <span className="mr-2">{option.icon}</span>
                                                                {option.label}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                            <div>
                                                <span className="flex items-center text-2xl font-bold mb-4">
                                                    <ToolOutlined className="mr-2"/>
                                                    Utilities
                                                </span>
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 text-lg">
                                                    {UTILITY_OPTIONS.map((option, index) => {
                                                        const isPresent = utilityIds.includes(option.value);
                                                        return (
                                                            <li
                                                                key={index}
                                                                className={`utility-item ${isPresent ? "utility-present" : "utility-absent"}`}
                                                            >
                                                                <span className="mr-2">{option.icon}</span>
                                                                {option.label}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>

                        {/* Section 3: School Introduction and Comments with Tabs outside Card */}
                        <Col xs={24}>
                            <Tabs defaultActiveKey="1" type="card" rootClassName="border-cyan-500" items={tabItems}
                                  size="large" animated={{inkBar: true, tabPane: true}}/>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    );
};

export default SchoolDetails;