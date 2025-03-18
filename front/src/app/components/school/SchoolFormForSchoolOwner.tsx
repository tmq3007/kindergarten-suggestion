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
  BookOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { SchoolOwnerVO } from "@/redux/services/schoolOwnerApi";
import { Card, Row, Col } from "antd";

// Assuming images are passed or defined somewhere; otherwise, adjust accordingly
const images = [
  "/placeholder1.jpg", // Replace with actual image URLs
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
  const [ownerOptions, setOwnerOptions] = useState<{ label: React.ReactNode; value: string; owner: SchoolOwnerVO }[]>([]);
  const [mainImage, setMainImage] = useState(imageList[0]?.url || images[0]); // Default to first image

  const { data: expectedSchoolData } = useSearchExpectedSchoolQuery({ id: Number(user.id) });
  const [triggerSearchSchoolOwners, { data: searchSchoolOwnersResult }] = useLazySearchSchoolOwnersForAddSchoolQuery();
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
    if (userOwnerId && !selectedOwners.includes(userOwnerId) && ownerOptions.some((opt) => opt.owner.userId === Number(user.id))) {
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
      <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
        <Form<SchoolFieldType> size="middle" form={form} className="space-y-6 h-auto">
          <Row gutter={[16, 16]}>
            {/* Section 1: Ảnh minh họa */}
            <Col span={24}>
              <Card title="School Images" bordered={false}>
                {/* Main Image */}
                <div className="mb-6 justify-center flex">
                  <img
                      src={mainImage}
                      alt="Main Display"
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
                        `}</style>
                {/* Thumbnail Carousel */}
                <Carousel
                    dots={true}
                    afterChange={handleThumbnailClick}
                    infinite={false}
                    slidesToShow={3}
                    slidesToScroll={1}
                    className={clsx("mb-4 max-h-20 custom-carousel flex justify-center custom-carousel")} // Thêm flex và justify-center để căn giữa carousel
                    arrows={true}
                    draggable={true}
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
                  {imageList.length > 0
                      ? imageList.map((img, index) => (
                          <div
                              key={index}
                              onClick={() => handleThumbnailClick(index)}
                              className="cursor-pointer px-1 inline-block flex justify-center" // Đảm bảo ảnh được căn giữa trong slide
                          >
                            <img
                                src={img.url}
                                alt={`Thumbnail ${index + 1}`}
                                className="h-12 object-cover rounded-lg transition-all duration-500 max-w-[100px]"
                            />
                          </div>
                      ))
                      : images.map((src, index) => (
                          <div
                              key={index}
                              onClick={() => handleThumbnailClick(index)}
                              className="cursor-pointer px-1 inline-block flex justify-center" // Đảm bảo ảnh được căn giữa trong slide
                          >
                            <img
                                src={src}
                                alt={`Thumbnail ${index + 1}`}
                                className="h-full object-cover rounded-lg transition-all duration-500 max-w-[100px]"
                            />
                          </div>
                      ))}
                </Carousel>
              </Card>
            </Col>

            {/* Section 2: Thông tin cơ bản và Facilities & Utilities */}
            <Col span={24}>
              <Row gutter={[16, 16]}>
                {/* Cột trái: Basic Information */}
                <Col span={12}>
                  <Card title="Basic Information" bordered={false}>
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold">{form.getFieldValue("name") || "Unknown School"}</h2>
                      <div className="flex items-center">
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
                      <div className="flex items-center">
                        <MailOutlined className="mr-2 text-gray-500" />
                        <span className="font-medium">Email:</span>
                        <span className="ml-2">{form.getFieldValue("email") || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <PhoneOutlined className="mr-2 text-gray-500" />
                        <span className="font-medium">Contact:</span>
                        <span className="ml-2">{form.getFieldValue("phone") || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <GlobalOutlined className="mr-2 text-gray-500" />
                        <span className="font-medium">Website:</span>
                        <span className="ml-2 text-blue-500">
                        <a href={form.getFieldValue("website")} target="_blank" rel="noopener noreferrer">
                          {form.getFieldValue("website") || "N/A"}
                        </a>
                      </span>
                      </div>
                      <div className="flex items-center">
                        <DollarOutlined className="mr-2 text-gray-500" />
                        <span className="font-medium">Tuition fee:</span>
                        <span className="ml-2">
                        From {form.getFieldValue("feeFrom")?.toLocaleString() || "N/A"} VND/month
                          {form.getFieldValue("feeTo") ? ` to ${form.getFieldValue("feeTo")?.toLocaleString()} VND/month` : ""}
                      </span>
                      </div>
                      <div className="flex items-center">
                        <CalendarOutlined className="mr-2 text-gray-500" />
                        <span className="font-medium">Admission age:</span>
                        <span className="ml-2">
                        {CHILD_RECEIVING_AGE_OPTIONS.find((opt) => opt.value === form.getFieldValue("receivingAge"))?.label || "N/A"}
                      </span>
                      </div>
                      <div className="flex items-center">
                        <BankOutlined className="mr-2 text-gray-500" />
                        <span className="font-medium">School type:</span>
                        <span className="ml-2">
                        {SCHOOL_TYPE_OPTIONS.find((opt) => opt.value === form.getFieldValue("schoolType"))?.label || "N/A"}
                      </span>
                      </div>
                      <div className="flex items-center">
                        <BookOutlined className="mr-2 text-gray-500" />
                        <span className="font-medium">Education method:</span>
                        <span className="ml-2">
                        {EDUCATION_METHOD_OPTIONS.find((opt) => opt.value === form.getFieldValue("educationMethod"))?.label || "N/A"}
                      </span>
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Cột phải: Facilities & Utilities */}
                <Col span={12}>
                  <Card title="Facilities & Utilities" bordered={false} style={{ minHeight: "100%" }}>
                    <div className="space-y-6">
                      <Form.Item label="Facilities" name="facilities" labelCol={{ style: { fontSize: "28px", fontWeight: "bold" } }}>
                        <Checkbox.Group
                            options={FACILITY_OPTIONS}
                            value={form.getFieldValue("facilities")?.map(String)}
                            className={clsx("grid grid-cols-3 gap-2 custom-add-school-select", { "pointer-events-none": isReadOnly })}
                        />
                      </Form.Item>

                      <Form.Item label="Utilities" name="utilities" labelCol={{ style: { fontSize: "28px", fontWeight: "bold" } }}>
                        <Checkbox.Group
                            options={UTILITY_OPTIONS}
                            value={form.getFieldValue("utilities")?.map(String)}
                            className={clsx("grid grid-cols-3 gap-2 custom-add-school-select", { "pointer-events-none": isReadOnly })}
                        />
                      </Form.Item>
                    </div>
                    <style>{`
                    .custom-add-school-select .ant-checkbox-wrapper {
                      display: flex;
                      align-items: center;
                      margin-bottom: 5px;
                      margin-top: 7px;
                      margin-left: 10px;
                    }
                    .custom-add-school-select .ant-checkbox-inner {
                      width: 24px !important;
                      height: 24px !important;
                    }
                    .custom-add-school-select .ant-checkbox-input {
                      transform: scale(2);
                    }
                  `}</style>
                  </Card>
                </Col>
              </Row>
            </Col>

            {/* Section 3: Mô tả giới thiệu */}
            <Col span={24}>
              <Card title="School Introduction" bordered={false}>
                <div className="text-gray-800" dangerouslySetInnerHTML={{ __html: form.getFieldValue("description") || "N/A" }} />
              </Card>
            </Col>

            {/* Section 4: Buttons */}
            <Col span={24} style={{ textAlign: "center", marginTop: "16px" }}>
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