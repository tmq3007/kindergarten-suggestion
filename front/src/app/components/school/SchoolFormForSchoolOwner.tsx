"use client";
import React, { useEffect, useRef, useState } from "react";
import { Checkbox, Form, Carousel, UploadFile } from "antd";
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
    BookOutlined,
    ToolOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { SchoolOwnerVO } from "@/redux/services/schoolOwnerApi";
import { Card, Row, Col } from "antd";

const images = [
    "/placeholder1.jpg",
    "/placeholder2.jpg",
    "/placeholder3.jpg",
    "/placeholder4.jpg",
];

interface SchoolFieldType {
    name: string;
    schoolType: number;
    website?: string;
    status: number;
    province: string;
    district: string;
    ward: string;
    street?: string;
    email: string;
    phone: string;
    receivingAge: number;
    educationMethod: number;
    feeFrom: number;
    feeTo: number;
    facilities?: number[];
    utilities?: number[];
    description?: string;
    image?: UploadFile[];
    schoolOwners?: string[];
}

interface SchoolFormFields {
    isReadOnly?: boolean;
    form?: any;
    hasCancelButton?: boolean;
    hasSaveButton?: boolean;
    hasCreateSubmitButton?: boolean;
    hasCreateSaveButton?: boolean;
    hasUpdateSubmitButton?: boolean;
    hasDeleteButton?: boolean;
    hasEditButton?: boolean;
    hasRejectButton?: boolean;
    hasApproveButton?: boolean;
    hasPublishButton?: boolean;
    hasUnpublishButton?: boolean;
    hideImageUpload?: boolean;
    imageList?: { url: string; filename: string }[];
    actionButtons?: React.ReactNode;
    triggerCheckEmail?: any;
    schoolId?: number;
    isEdit?: boolean;
    formLoaded?: boolean;
}

const SchoolForm: React.FC<SchoolFormFields> = ({
                                                    isReadOnly,
                                                    form: externalForm,
                                                    hasCancelButton,
                                                    hasSaveButton,
                                                    hasCreateSubmitButton,
                                                    hasCreateSaveButton,
                                                    hasUpdateSubmitButton,
                                                    hasDeleteButton,
                                                    hasEditButton,
                                                    hasRejectButton,
                                                    hasApproveButton,
                                                    hasPublishButton,
                                                    hasUnpublishButton,
                                                    hideImageUpload = false,
                                                    imageList = [],
                                                    actionButtons,
                                                    triggerCheckEmail,
                                                    schoolId,
                                                    isEdit,
                                                    formLoaded = false,
                                                }) => {
    const [form] = Form.useForm(externalForm);
    const emailInputRef = useRef<any>(null);
    const phoneInputRef = useRef<any>(null);
    const user = useSelector((state: RootState) => state.user);

    const [facilities, setFacilities] = useState<string[]>([]);
    const [utilities, setUtilities] = useState<string[]>([]);
    const [schoolOptions, setSchoolOptions] = useState<{ label: string; value: string }[]>([]);
    const [ownerOptions, setOwnerOptions] = useState<
        { label: React.ReactNode; value: string; owner: SchoolOwnerVO }[]
    >([]);
    const [mainImage, setMainImage] = useState(imageList[0]?.url || images[0]);

    const { data: expectedSchoolData } = useSearchExpectedSchoolQuery({ id: Number(user.id) });
    const [triggerSearchSchoolOwners, { data: searchSchoolOwnersResult }] =
        useLazySearchSchoolOwnersForAddSchoolQuery();
    const schoolNameValue = Form.useWatch("name", form);

    const renderOwnerOption = (owner: SchoolOwnerVO) => (
        <div className="py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center text-sm">
                <span className="font-medium text-gray-800">{owner.fullname}</span>
                <span className="ml-2 text-gray-500">(@{owner.username})</span>
            </div>
            <div className="flex items-center text-xs text-gray-600 mt-1 ml-6">
                <MailOutlined className="mr-2 text-gray-400" />
                {owner.email}
            </div>
            <div className="flex items-center text-xs text-gray-600 mt-1 ml-6">
                <PhoneOutlined className="mr-2 text-gray-400" />
                {owner.phone}
            </div>
        </div>
    );

    const renderOwnerTag = (props: any) => {
        const { label, value, closable, onClose } = props;
        const owner = ownerOptions.find((opt) => opt.value === value)?.owner;
        const isCurrentUser = owner?.userId === Number(user.id);

        return (
            <div className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1">
        <span>
          {owner?.username || "Unknown"} {isCurrentUser && "(You)"}
        </span>
                {!isCurrentUser && closable && (
                    <span className="ml-1 cursor-pointer text-gray-500 hover:text-red-500" onClick={onClose}>
            ×
          </span>
                )}
            </div>
        );
    };

    const handleSchoolNameChange = async (schoolName: string) => {
        if (!schoolName) {
            setOwnerOptions([]);
            return;
        }

        try {
            const result = await triggerSearchSchoolOwners(schoolName).unwrap();
            const owners =
                result?.data?.map((owner: SchoolOwnerVO) => ({
                    label: renderOwnerOption(owner),
                    value: String(owner.id),
                    owner: owner,
                })) || [];
            setOwnerOptions(owners);

            const currentOwners = form.getFieldValue("schoolOwners") || [];
            const userOwnerId = owners.find((owner) => owner.owner.userId === Number(user.id))?.value;
            if (userOwnerId && !currentOwners.includes(userOwnerId)) {
                form.setFieldsValue({ schoolOwners: [...currentOwners, userOwnerId] });
            }
        } catch (error) {
            console.error("Error fetching school owners:", error);
            setOwnerOptions([]);
        }
    };

    const handleOwnersChange = (selectedOwners: string[]) => {
        const userOwnerId = ownerOptions.find((opt) => opt.owner.userId === Number(user.id))?.value;
        if (
            userOwnerId &&
            !selectedOwners.includes(userOwnerId) &&
            ownerOptions.some((opt) => opt.owner.userId === Number(user.id))
        ) {
            form.setFieldsValue({ schoolOwners: [...selectedOwners, userOwnerId] });
        } else {
            form.setFieldsValue({ schoolOwners: selectedOwners });
        }
    };

    const handleThumbnailClick = (index: number) => {
        setMainImage(imageList[index]?.url || images[index]);
    };

    useEffect(() => {
        handleSchoolNameChange(schoolNameValue).then((r) => {});
    }, [schoolNameValue]);

    useEffect(() => {
        if (expectedSchoolData?.data) {
            setSchoolOptions(
                expectedSchoolData.data.map((expectedSchool: ExpectedSchool) => ({
                    label: expectedSchool.expectedSchool,
                    value: expectedSchool.expectedSchool,
                }))
            );
        }
    }, [expectedSchoolData]);

    return (
        <div className="mx-auto container px-4 sm:px-6 lg:px-8">
            <Form<SchoolFieldType> size="middle" form={form} className="space-y-6">
                <Row gutter={[16, 16]}>
                    {/* Section 1: School Images */}
                    <Col xs={24}>
                        <Card title="School Images" bordered={false} className="w-full">
                            <div className="mb-6 flex justify-center items-center w-full h-[150px] xs:h-[200px] sm:h-[250px] md:h-[350px] lg:h-[450px]">
                                <img
                                    src={mainImage}
                                    alt="Main Display"
                                    className="w-full h-full object-contain rounded-lg transition-all duration-500"
                                />
                            </div>

                            <Carousel
                                dots={true}
                                autoplaySpeed={2000}
                                autoplay={true}
                                afterChange={handleThumbnailClick}
                                infinite={true}
                                slidesToShow={3}
                                slidesToScroll={1}
                                className={clsx("mb-4 flex justify-center items-center w-full")}
                                draggable={true}
                                centerMode={true}
                                centerPadding="0px"
                                responsive={[
                                    {
                                        breakpoint: 1024,
                                        settings: {
                                            slidesToShow: 3,
                                            centerMode: true,
                                            centerPadding: "0px",
                                        },
                                    },
                                    {
                                        breakpoint: 768,
                                        settings: {
                                            slidesToShow: 2,
                                            centerMode: true,
                                            centerPadding: "0px",
                                        },
                                    },
                                    {
                                        breakpoint: 480,
                                        settings: {
                                            slidesToShow: 1,
                                            centerMode: true,
                                            centerPadding: "0px",
                                        },
                                    },
                                    {
                                        breakpoint: 360,
                                        settings: {
                                            slidesToShow: 1,
                                            centerMode: true,
                                            centerPadding: "0px",
                                        },
                                    },
                                ]}
                            >
                                {imageList.length > 0
                                    ? imageList.map((img, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleThumbnailClick(index)}
                                            className="cursor-pointer px-1 !flex !justify-center !items-center h-full w-full"
                                        >
                                            <img
                                                src={img.url}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="h-12 sm:h-16 md:h-20 lg:h-24 object-cover rounded-lg transition-all duration-500 max-w-[80px] sm:max-w-[100px] md:max-w-[120px] lg:max-w-[150px]"
                                            />
                                        </div>
                                    ))
                                    : images.map((src, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleThumbnailClick(index)}
                                            className="cursor-pointer px-1 flex justify-center items-center h-full w-full"
                                        >
                                            <img
                                                src={src}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="h-12 sm:h-16 md:h-20 lg:h-24 object-cover rounded-lg transition-all duration-500 max-w-[80px] sm:max-w-[100px] md:max-w-[120px] lg:max-w-[150px]"
                                            />
                                        </div>
                                    ))}
                            </Carousel>
                        </Card>
                    </Col>

                    {/* Section 2: Basic Information and Facilities & Utilities */}
                    <Col xs={24}>
                        <Row gutter={[16, 16]}>
                            {/* Left Column: Basic Information */}
                            <Col xs={24} lg={12} className="flex">
                                <Card
                                    title="Basic Information"
                                    className="w-full min-h-[442px] lg:min-h-[527px] xl:min-h-[442px]"
                                >
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-bold">{form.getFieldValue("name") || "Unknown School"}</h2>
                                        <div className="flex items-center flex-wrap">
                                            <EnvironmentOutlined className="mr-2 text-gray-500" />
                                            <span className="font-medium">Address:</span>
                                            <span className="ml-2">
          {[
              form.getFieldValue("street"),
              form.getFieldValue("ward"),
              form.getFieldValue("district"),
              form.getFieldValue("province"),
          ]
              .filter(Boolean)
              .join(", ") || "N/A"}
        </span>
                                        </div>
                                        <div className="flex items-center flex-wrap">
                                            <MailOutlined className="mr-2 text-gray-500" />
                                            <span className="font-medium">Email:</span>
                                            <span className="ml-2">{form.getFieldValue("email") || "N/A"}</span>
                                        </div>
                                        <div className="flex items-center flex-wrap">
                                            <PhoneOutlined className="mr-2 text-gray-500" />
                                            <span className="font-medium">Contact:</span>
                                            <span className="ml-2">{form.getFieldValue("phone") || "N/A"}</span>
                                        </div>
                                        <div className="flex items-center flex-wrap">
                                            <GlobalOutlined className="mr-2 text-gray-500" />
                                            <span className="font-medium">Website:</span>
                                            <span className="ml-2 text-blue-500">
          <a href={form.getFieldValue("website")} target="_blank" rel="noopener noreferrer">
            {form.getFieldValue("website") || "N/A"}
          </a>
        </span>
                                        </div>
                                        <div className="flex items-center flex-wrap">
                                            <DollarOutlined className="mr-2 text-gray-500" />
                                            <span className="font-medium">Tuition fee:</span>
                                            <span className="ml-2">
          From {form.getFieldValue("feeFrom")?.toLocaleString() || "N/A"} VND/month
                                                {form.getFieldValue("feeTo") ? ` to ${form.getFieldValue("feeTo")?.toLocaleString()} VND/month` : ""}
        </span>
                                        </div>
                                        <div className="flex items-center flex-wrap">
                                            <CalendarOutlined className="mr-2 text-gray-500" />
                                            <span className="font-medium">Admission age:</span>
                                            <span className="ml-2">
          {CHILD_RECEIVING_AGE_OPTIONS.find((opt) => opt.value === form.getFieldValue("receivingAge"))?.label ||
              "N/A"}
        </span>
                                        </div>
                                        <div className="flex items-center flex-wrap">
                                            <BankOutlined className="mr-2 text-gray-500" />
                                            <span className="font-medium">School type:</span>
                                            <span className="ml-2">
          {SCHOOL_TYPE_OPTIONS.find((opt) => opt.value === form.getFieldValue("schoolType"))?.label || "N/A"}
        </span>
                                        </div>
                                        <div className="flex items-center flex-wrap">
                                            <BookOutlined className="mr-2 text-gray-500" />
                                            <span className="font-medium">Education method:</span>
                                            <span className="ml-2">
          {EDUCATION_METHOD_OPTIONS.find((opt) => opt.value === form.getFieldValue("educationMethod"))?.label ||
              "N/A"}
        </span>
                                        </div>
                                    </div>
                                </Card>
                            </Col>

                            {/* Right Column: Facilities & Utilities */}
                            <Col xs={24} lg={12} className="flex">
                                <Card title="Facilities & Utilities" className="w-full">
                                    <div className="space-y-6">
                                        <Form.Item
                                            label={
                                                <span className="flex items-center">
            <BookOutlined className="mr-2" />
            Facilities
          </span>
                                            }
                                            name="facilities"
                                            labelCol={{ className: "text-2xl font-bold" }}
                                        >
                                            {form.getFieldValue("facilities")?.length > 0 ? (
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                                                    {FACILITY_OPTIONS.filter((option) => form.getFieldValue("facilities")?.includes(option.value)).map(
                                                        (option) => (
                                                            <li key={option.value} className="flex items-center mt-2 mb-1 ml-2">
                                                                {option.label}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500 mt-1">No data</p>
                                            )}
                                        </Form.Item>

                                        <Form.Item
                                            label={
                                                <span className="flex items-center">
            <ToolOutlined className="mr-2" />
            Utilities
          </span>
                                            }
                                            name="utilities"
                                            labelCol={{ className: "text-2xl font-bold" }}
                                        >
                                            {form.getFieldValue("utilities")?.length > 0 ? (
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                                                    {UTILITY_OPTIONS.filter((option) => form.getFieldValue("utilities")?.includes(option.value)).map(
                                                        (option) => (
                                                            <li key={option.value} className="flex items-center mt-2 mb-1 ml-2">
                                                                {option.label}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500 mt-1">No data</p>
                                            )}
                                        </Form.Item>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </Col>

                    {/* Section 3: School Introduction */}
                    <Col xs={24}>
                        <Card title="School Introduction" className="w-full">
                            <div
                                className="text-gray-800"
                                dangerouslySetInnerHTML={{ __html: form.getFieldValue("description") || "N/A" }}
                            />
                        </Card>
                    </Col>

                    {/* Section 4: Buttons */}
                    <Col xs={24} className="text-center mt-4">
                        <div>
                            {actionButtons}
                            <SchoolFormButton
                                form={form}
                                hasCancelButton={hasCancelButton}
                                hasSaveButton={hasSaveButton}
                                hasCreateSubmitButton={hasCreateSubmitButton}
                                hasUpdateSubmitButton={hasUpdateSubmitButton}
                                hasCreateSaveButton={hasCreateSaveButton}
                                hasDeleteButton={hasDeleteButton}
                                hasEditButton={hasEditButton}
                                hasRejectButton={hasRejectButton}
                                hasApproveButton={hasApproveButton}
                                hasPublishButton={hasPublishButton}
                                hasUnpublishButton={hasUnpublishButton}
                                emailInputRef={emailInputRef}
                                phoneInputRef={phoneInputRef}
                            />
                        </div>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default SchoolForm;