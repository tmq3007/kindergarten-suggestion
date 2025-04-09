"use client";
import React, {FunctionComponent} from "react";
import {Card, Col, Row, Descriptions, Tabs, Alert, Spin, Button} from "antd";
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
import {
    CHILD_RECEIVING_AGE_OPTIONS,
    EDUCATION_METHOD_OPTIONS,
    FACILITY_OPTIONS,
    SCHOOL_TYPE_OPTIONS,
    UTILITY_OPTIONS
} from "@/lib/constants";
import SchoolImageCarousel from "@/app/components/common/SchoolImageCarousel";
import CommentSection from "@/app/components/review/CommentSection";
import {ReviewVO, useGetReviewBySchoolForPublicQuery} from "@/redux/services/reviewApi";
import AddRequestModal from "@/app/components/user/AddRequestModal";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";

interface SchoolDetailsProps {
    schoolData: SchoolDetailVO;
}
const SchoolDetails: FunctionComponent<SchoolDetailsProps> = ({
                                                                  schoolData
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
    const {data, error, isLoading} = useGetReviewBySchoolForPublicQuery({
        schoolId: id,
        page: 1,
        size: 15,
    });

    const reviews: ReviewVO[] = data?.data?.content || [];

    // Map facility and utility IDs from schoolData to their options
    const facilityIds = facilities.map((f) => String(f.fid));
    const utilityIds = utilities.map((u) => String(u.uid));

    const userRole = useSelector((state: RootState) => state.user?.role);

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
                <Card className="w-full sha dow-lg border border-cyan-500 bg-white lg:p-6 md:p-0">
                    {isLoading ? (
                        <Spin tip="Loading reviews..."/>
                    ) : error ? (
                        <Alert
                            message="Error"
                            description="Failed to load reviews. Please try again later."
                            type="error"
                            showIcon
                        />
                    ) : (
                        <CommentSection reviews={reviews} schoolId={id}/>
                    )}
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
                                        className="w-full shadow-lg border border-cyan-500 bg-white p-6" styles={{
                                        body: { padding: 0 }
                                    }}
                                    >
                                        <div className="flex mt-5 items-center justify-between mb-6">
                                            <h2 className="text-3xl font-bold">{name || "Unknown School"}</h2>
                                            <div className="flex flex-col gap-4">
                                                <AddRequestModal schoolId={id} schoolName={name} />
                                                <Button>Rate School</Button>
                                            </div>

                                        </div>

                                        <Descriptions bordered className="w-full text-xl"
                                                      styles={{content: {fontSize: '16px'}}} size={"middle"}
                                                        >
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
                                                {CHILD_RECEIVING_AGE_OPTIONS.find((opt) => opt.value === String(receivingAge))?.label || "N/A"}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <span className="text-base">
                                                        <BankOutlined className="mr-2"/>
                                                        School Type
                                                    </span>
                                                }
                                            >
                                                {SCHOOL_TYPE_OPTIONS.find((opt) => opt.value === String(schoolType))?.label || "N/A"}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <span className="text-base">
                                                        <BookOutlined className="mr-2"/>
                                                        Education Method
                                                    </span>
                                                }
                                            >
                                                {EDUCATION_METHOD_OPTIONS.find((opt) => opt.value === String(educationMethod))?.label || "N/A"}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Card>
                                </Col>

                                {/* Right Column: Facilities & Utilities */}
                                <Col xs={24} lg={8} className="flex">
                                    <Card
                                        title="Facilities & Utilities"
                                        className="w-full shadow-lg border border-cyan-500 bg-white p-6" styles={{
                                        body: { padding: 0 }
                                    }}
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
                                                                className={`facility-item ${isPresent ? "facility-present" : "facility-absent"} ml-4 md:ml-0`}
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
                                                                className={`utility-item ${isPresent ? "utility-present" : "utility-absent"} ml-4 md:ml-0`}
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