"use client";
import React, {FunctionComponent, useState} from "react";
import {
    Card,
    Col,
    Row,
    Descriptions,
    Tabs,
    Alert,
    Spin,
    ConfigProvider,
    Button,
    Modal,
    Space,
    notification,
    message,
} from "antd";
import {
    EnvironmentOutlined,
    MailOutlined,
    PhoneOutlined,
    GlobalOutlined,
    DollarOutlined,
    CalendarOutlined,
    BankOutlined,
    BookOutlined,
    ToolOutlined,
    CommentOutlined,
    PaperClipOutlined,
} from "@ant-design/icons";
import {SchoolDetailVO} from "@/redux/services/schoolApi";
import {
    CHILD_RECEIVING_AGE_OPTIONS,
    EDUCATION_METHOD_OPTIONS,
    FACILITY_OPTIONS,
    SCHOOL_TYPE_OPTIONS,
    UTILITY_OPTIONS,
} from "@/lib/constants";
import SchoolImageCarousel from "@/app/components/common/SchoolImageCarousel";
import CommentSection from "@/app/components/review/CommentSection";
import {ReviewVO, useGetReviewBySchoolForPublicQuery} from "@/redux/services/reviewApi";
import AddRequestModal from "@/app/components/user/AddRequestModal";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import useIsMobile from "@/lib/hook/useIsMobile";
import {useRequestEnrollingSchoolMutation} from "@/redux/services/parentApi";
import useNotification from "antd/es/notification/useNotification";
import ParentLoginForm from "@/app/components/user/ParentLoginForm";
import RegisterForm from "@/app/components/user/RegisterForm";
import RateButton from "@/app/components/review/RateButton";

interface SchoolDetailsProps {
    schoolData: SchoolDetailVO;
}

const SchoolDetails: FunctionComponent<SchoolDetailsProps> = ({schoolData}) => {
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requestEnrollingSchool, {isLoading: isRequestEnrollingSchoolLoading}] = useRequestEnrollingSchoolMutation();
    const [notificationApi, contextHolder] = useNotification();

    const userRole = useSelector((state: RootState) => state.user?.role);
    const isParent = userRole === "ROLE_PARENT";
    const isAdminOrSo = userRole === "ROLE_ADMIN" || userRole === "ROLE_SCHOOL_OWNER";

    const [isSignupModalOpen, setIsSignupModalOpen] = useState<boolean>(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

    const showModal = () => {
        if (isParent) {
            setIsModalOpen(true);
        } else if (isAdminOrSo) {
            notificationApi.error({
                message: "Access Denied",
                description: "You have to be a parent to enroll to school! Please login or sign up to continue.",
            });
        } else {
            notificationApi.error({
                message: "Access Denied",
                description: "You have to be a parent to enroll to school! Please login or sign up to continue.",
            });
            setIsLoginModalOpen(true);
            setIsModalOpen(false);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleOk = async () => {
        try {
            const requestEnrollingSchoolData = await requestEnrollingSchool(id).unwrap();
            if (requestEnrollingSchoolData.data) {
                notificationApi.success({
                    message: "Enrollment Successfully",
                    description: `Enrollment requested to ${name} successfully!`,
                    duration: 1.5,
                    placement: 'topRight',
                });
            } else {
                notificationApi.error({
                    message: "Enrollment Failed",
                    description: "An error occurred while requesting enrollment. Please try again later.",
                    duration: 1.5,
                    placement: 'topRight',
                });
            }
            setIsModalOpen(false);
        } catch (err) {
            notificationApi.error({
                message: "Enrollment Failed",
                description: "An error occurred while requesting enrollment. Please try again later.",
                duration: 1.5,
                placement: 'topRight',
            });
        }
    };

    const styles = `
    /* Facilities and Utilities */
    .facility-item, .utility-item {
        display: flex;
        align-items: center;
        padding: 4px 0;
    }
    .facility-present, .utility-present {
        color: #4D7FD7; 
        font-weight: bold;
    }
    .facility-absent, .utility-absent {
        color: #d9d9d9; /* Light gray for absent items */
    }
    
    /* Custom Tabs styles */
    .ant-tabs {
        margin-top: -16px; /* Reduce space above tabs */
    }
    .ant-tabs-nav {
        margin-bottom: 0 !important; /* Remove space between tabs and content */
    }
    .ant-tabs-nav::before {
        border-bottom: none !important; /* Remove bottom border */
    }
    .ant-tabs-tab {
        border-radius: 8px 8px 0 0 !important;
        border: 1px solid #002F77 !important;
        border-bottom: none !important;
        margin-right: 4px !important;
    }
    .ant-tabs-tab-active {
        border-bottom: none !important;
        z-index: 2;
    }

    .ant-tabs-content-holder {
        border: 1px solid #002F77;
        border-top: none;
        border-radius: 0 0 8px 8px;
        padding: 16px;
    }
    .ant-tabs-nav::before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background-color: #002F77;
        z-index: 1;
    }
    /* Button Group */
    .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: flex-end;
    }
    @media (max-width: 767px) {
        .button-group {
            flex-direction: column;
            align-items: stretch;
        }
    }
    `;

    const {data, error, isLoading} = useGetReviewBySchoolForPublicQuery({
        schoolId: id,
        page: 1,
        size: 15,
    });

    const reviews: ReviewVO[] = data?.data?.content || [];
    const facilityIds = facilities.map((f) => String(f.fid));
    const utilityIds = utilities.map((u) => String(u.uid));
    const isMobile = useIsMobile();

    const tabItems = [
        {
            key: "1",
            label: "School Introduction",
            icon: <PaperClipOutlined/>,
            children: (
                <Col xs={24} className="!p-0">
                    <Row gutter={[0, 0]} justify="space-between">
                        <Col xs={24} lg={16} className="flex">
                            <Card className="w-full border-0 bg-white">
                                <div
                                    className="text-gray-800"
                                    dangerouslySetInnerHTML={{__html: description || "N/A"}}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} lg={8} className="flex">
                            <Card
                                className="w-full border-l-0 lg:border-l border-t-1 lg:border-t-0 border-r-0 border-b-0 rounded-t-none rounded-bl-none bg-white p-6"
                            >
                                <div className="space-y-8">
                                    <div>
                                        <span className="flex items-center text-2xl font-bold mb-4">
                                            <BookOutlined className="mr-2"/>
                                            Facilities
                                        </span>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
            ),
        },
        {
            key: "2",
            label: "Comments",
            icon: <CommentOutlined/>,
            children: (
                <Card styles={{body: {padding: 0}}} className="w-full border-none bg-white p-0">
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
        <>
            {contextHolder}
            <div className="w-full flex justify-center mb-8">
                <Row gutter={[24, 24]} justify="center">
                    <style>{styles}</style>
                    <Col xs={24}>
                        <SchoolImageCarousel imageList={imageList}/>
                    </Col>

                    <Col xs={24} className="flex justify-center">
                        <Row gutter={[24, 24]} justify="center" className="w-full">
                            <Card className="w-full border-custom-700 bg-white px-4 py-0 rounded-lg">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <h2 className="text-4xl font-bold text-black">{name || "Unknown School"}</h2>
                                    <div className="button-group flex flex-col">
                                        <AddRequestModal schoolId={id} schoolName={name}/>
                                        <RateButton schoolId={id}/>
                                        <Button
                                            type={'primary'}
                                            className="bg-red-500 hover:!bg-red-400 w-[81%] md:w-[73%] mx-auto"
                                            onClick={showModal}
                                            size="large">
                                            Enroll
                                        </Button>
                                    </div>
                                </div>

                                <Row gutter={[16, 16]} className="">
                                    <Col span={24}>
                                        <Row>
                                            <Col xs={24} md={6}
                                                 className="font-semibold flex items-center gap-2 text-lg">
                                                <EnvironmentOutlined/>
                                                Address:
                                            </Col>
                                            <Col xs={24} md={18} className="text-gray-700 text-lg">
                                                {[street, ward, district, province].filter(Boolean).join(", ") || "N/A"}
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={24}>
                                        <Row>
                                            <Col xs={24} md={6}
                                                 className="font-semibold flex items-center gap-2 text-lg">
                                                <MailOutlined/>
                                                Email:
                                            </Col>
                                            <Col xs={24} md={18}
                                                 className="text-gray-700 text-lg">{email || "N/A"}</Col>
                                        </Row>
                                    </Col>
                                    <Col span={24}>
                                        <Row>
                                            <Col xs={24} md={6}
                                                 className="font-semibold flex items-center gap-2 text-lg">
                                                <PhoneOutlined/>
                                                Contact:
                                            </Col>
                                            <Col xs={24} md={18}
                                                 className="text-gray-700 text-lg">{phone || "N/A"}</Col>
                                        </Row>
                                    </Col>
                                    <Col span={24}>
                                        <Row>
                                            <Col xs={24} md={6}
                                                 className="font-semibold flex items-center gap-2 text-lg">
                                                <GlobalOutlined/>
                                                Website:
                                            </Col>
                                            <Col xs={24} md={18}>
                                                <a
                                                    href={website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 break-all hover:underline text-lg"
                                                >
                                                    {website || "N/A"}
                                                </a>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={24}>
                                        <Row>
                                            <Col xs={24} md={6}
                                                 className="font-semibold flex items-center gap-2 text-lg">
                                                <DollarOutlined/>
                                                Tuition Fee:
                                            </Col>
                                            <Col xs={24} md={18} className="text-gray-700 text-lg">
                                                From {feeFrom?.toLocaleString() || "N/A"} VND/month
                                                {feeTo ? ` to ${feeTo?.toLocaleString()} VND/month` : ""}
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={24}>
                                        <Row>
                                            <Col xs={24} md={6}
                                                 className="font-semibold flex items-center gap-2 text-lg">
                                                <CalendarOutlined/>
                                                Admission Age:
                                            </Col>
                                            <Col xs={24} md={18} className="text-gray-700 text-lg">
                                                {CHILD_RECEIVING_AGE_OPTIONS.find((opt) => opt.value === String(receivingAge))?.label || "N/A"}
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={24}>
                                        <Row>
                                            <Col xs={24} md={6}
                                                 className="font-semibold flex items-center gap-2 text-lg">
                                                <BankOutlined/>
                                                School Type:
                                            </Col>
                                            <Col xs={24} md={18} className="text-gray-700 text-lg">
                                                {SCHOOL_TYPE_OPTIONS.find((opt) => opt.value === String(schoolType))?.label || "N/A"}
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={24}>
                                        <Row>
                                            <Col xs={24} md={6}
                                                 className="font-semibold flex items-center gap-2 text-lg">
                                                <BookOutlined/>
                                                Education Method:
                                            </Col>
                                            <Col xs={24} md={18} className="text-gray-700 text-xl">
                                                {EDUCATION_METHOD_OPTIONS.find((opt) => opt.value === String(educationMethod))?.label || "N/A"}
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Card>

                            <Col xs={24} className="!p-0 mt-5">
                                <ConfigProvider
                                    theme={{
                                        token: {
                                            colorBorderSecondary: "#002F77",
                                        },
                                    }}
                                >
                                    <Tabs
                                        defaultActiveKey="1"
                                        type="card"
                                        size="large"
                                        animated={{inkBar: true, tabPane: true}}
                                        items={tabItems}
                                    />
                                </ConfigProvider>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>

            <Modal
                title={<span className="text-2xl">Do you want to enroll into this school</span>}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                confirmLoading={isRequestEnrollingSchoolLoading}
                getContainer={false}
            >
                <Space>
                    <span className="font-medium">School name:</span>
                    <span>{name}</span>
                </Space>
                <Space>
                    <span className="font-medium">School address:</span>
                    <span>{[street, ward, district, province].filter(Boolean).join(", ") || "N/A"}</span>
                </Space>
            </Modal>
            <Modal
                title={<div className="text-center text-2xl">Login into your account</div>}
                open={isLoginModalOpen}
                onOk={() => setIsLoginModalOpen(false)}
                onCancel={() => setIsLoginModalOpen(false)}
                centered
                footer={null}
                destroyOnClose={true}
                getContainer={false}
            >
                <ParentLoginForm
                    onSuccess={() => setIsLoginModalOpen(false)}
                    onCancel={() => {
                        setIsLoginModalOpen(false);
                        setIsSignupModalOpen(true);
                    }}
                />
            </Modal>
            <Modal
                title={<div className="text-center text-2xl">Create a new user</div>}
                open={isSignupModalOpen}
                onOk={() => setIsSignupModalOpen(false)}
                onCancel={() => setIsSignupModalOpen(false)}
                centered
                footer={null}
                destroyOnClose={true}
                getContainer={false}
            >
                <RegisterForm
                    onSuccess={() => {
                        setIsLoginModalOpen(true);
                        setIsSignupModalOpen(false);
                    }}
                    onCancel={() => setIsSignupModalOpen(false)}
                />
            </Modal>
        </>
    );
};

export default SchoolDetails;