'use client'
import React, {useEffect, useRef, useState} from 'react';
import {Card, Carousel, Checkbox, Col, Collapse, Form, Input, InputNumber, Row, Select, UploadFile} from 'antd';
import MyEditor from "@/app/components/common/MyEditor";
import {
    ExpectedSchool,
    useLazySearchSchoolOwnersForAddSchoolQuery,
    useSearchExpectedSchoolQuery
} from '@/redux/services/schoolApi';
import {
    CHILD_RECEIVING_AGE_OPTIONS,
    EDUCATION_METHOD_OPTIONS,
    FACILITY_OPTIONS,
    SCHOOL_TYPE_OPTIONS,
    UTILITY_OPTIONS
} from "@/lib/constants";
import SchoolFormButton from "@/app/components/school/SchoolFormButton";
import PhoneInput from '../common/PhoneInput';
import AddressInput from '../common/AddressInput';
import EmailInput from '../common/EmailInput';
import {ImageUpload} from '../common/ImageUploader';
import clsx from "clsx";
import {
    BankOutlined,
    BookOutlined,
    CalendarOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    GlobalOutlined,
    MailOutlined,
    PhoneOutlined,
    ToolOutlined,
    UserOutlined
} from "@ant-design/icons";
import {useSelector} from 'react-redux';
import {RootState} from '@/redux/store';
import {SchoolOwnerVO} from '@/redux/services/schoolOwnerApi';
import school1 from '@public/school1.jpg'
import school2 from '@public/school2.jpg'
import school3 from '@public/school3.jpg'
import school4 from '@public/school4.jpg'
import school5 from '@public/school5.jpg'
import {AnimatePresence} from "framer-motion";
import {motion} from "framer-motion";

const {Option} = Select;
const {Panel} = Collapse;

interface SchoolFieldType {
    name: string;
    schoolType: number;
    website?: string;
    status: number;
    // Address Fields
    province: string;
    district: string;
    ward: string;
    street?: string;
    email: string;
    phone: string;
    receivingAge: number;
    educationMethod: number;
    // Fee Range
    feeFrom: number;
    feeTo: number;
    // Facilities and Utilities (Checkbox Groups)
    facilities?: number[];
    utilities?: number[];
    // School introduction
    description?: string;
    // File Upload
    image?: UploadFile[];
    schoolOwners?: string[]; // Changed to string[] to match Select values
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
    isDetailPage?: boolean;
}

const images = [
    school1.src,
    school2.src,
    school3.src,
    school4.src,
    school5.src,
];

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
                                                    isDetailPage,
                                                }) => {
    const [form] = Form.useForm(externalForm);
    const emailInputRef = useRef<any>(null);
    const phoneInputRef = useRef<any>(null);
    const user = useSelector((state: RootState) => state.user);

    const [mainImage, setMainImage] = useState(imageList[0]?.url || images[0]); // Default to first image
    const handleThumbnailClick = (index: number) => {
        const displayImages = [...imageList.map(img => img.url)];
        if (displayImages.length < 5) {
            const remainingCount = 5 - displayImages.length;
            displayImages.push(...images.slice(0, remainingCount));
        }
        setMainImage(displayImages[index]);
    };
    const [facilities, setFacilities] = useState<string[]>([]);
    const [utilities, setUtilities] = useState<string[]>([]);
    const [schoolOptions, setSchoolOptions] = useState<{ label: string; value: string }[]>([]);
    const [ownerOptions, setOwnerOptions] = useState<{
        label: React.ReactNode;
        value: string;
        owner: SchoolOwnerVO
    }[]>([]);

    const {
        data: expectedSchoolData,
        error: expectedSchoolError,
        isLoading: isLoadingExpectedSchool
    } = useSearchExpectedSchoolQuery({id: Number(user.id)});
    const [triggerSearchSchoolOwners, searchSchoolOwnersResult] = useLazySearchSchoolOwnersForAddSchoolQuery();
    const schoolNameValue = Form.useWatch('name', form);

    // Custom render for owner options
    const renderOwnerOption = (owner: SchoolOwnerVO) => (
        <div className="py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center text-sm">
                <UserOutlined className="mr-2 text-blue-500"/>
                <span className="font-medium text-gray-800">{owner.fullname}</span>
                <span className="ml-2 text-gray-500">(@{owner.username})</span>
            </div>
            <div className="flex items-center text-xs text-gray-600 mt-1 ml-6">
                <MailOutlined className="mr-2 text-gray-400"/>
                {owner.email}
            </div>
            <div className="flex items-center text-xs text-gray-600 mt-1 ml-6">
                <PhoneOutlined className="mr-2 text-gray-400"/>
                {owner.phone}
            </div>
        </div>
    );
    // Custom render for selected tags (disable close for logged-in user)
    const renderOwnerTag = (props: any) => {
        const {label, value, closable, onClose} = props;
        const owner = ownerOptions.find((opt) => opt.value === value)?.owner;
        const isCurrentUser = owner?.userId === Number(user.id); // Compare with userId

        return (
            <div className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1">
                <UserOutlined className="text-blue-500 mr-1"/>
                <span>{owner?.username || 'Unknown'} {isCurrentUser && '(You)'}</span>
                {!isCurrentUser && closable && (
                    <span
                        className="ml-1 cursor-pointer text-gray-500 hover:text-red-500"
                        onClick={onClose}
                    >
                        ×
                    </span>
                )}
            </div>
        );
    };

    // Handle school name change and fetch owners
    const handleSchoolNameChange = async (schoolName: string) => {
        if (!schoolName || isReadOnly) {
            setOwnerOptions([]);
            return;
        }

        try {
            const result = await triggerSearchSchoolOwners(schoolName).unwrap();
            const owners = result?.data?.map((owner: SchoolOwnerVO) => ({
                label: renderOwnerOption(owner),
                value: String(owner.id), // Use owner.id as string
                owner: owner,
            })) || [];
            setOwnerOptions(owners);

            // Auto-select logged-in user if in list
            const currentOwners = form.getFieldValue('schoolOwners') || [];
            const userOwnerId = owners.find(owner => owner.owner.userId === Number(user.id))?.value;
            if (userOwnerId && !currentOwners.includes(userOwnerId)) {
                form.setFieldsValue({schoolOwners: [...currentOwners, userOwnerId]});
            }
        } catch (error) {
            console.error('Error fetching school owners:', error);
            setOwnerOptions([]);
        }
    };

    const handleOwnersChange = (selectedOwners: string[]) => {
        const userOwnerId = ownerOptions.find(opt => opt.owner.userId === Number(user.id))?.value;
        if (userOwnerId && !selectedOwners.includes(userOwnerId) && ownerOptions.some(opt => opt.owner.userId === Number(user.id))) {
            // Prevent deselection of logged-in user
            form.setFieldsValue({schoolOwners: [...selectedOwners, userOwnerId]});
        } else {
            form.setFieldsValue({schoolOwners: selectedOwners});
        }
    };
    useEffect(() => {
        handleSchoolNameChange(schoolNameValue).then(r => {
        });
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
    }, [expectedSchoolData])


    if (isDetailPage) {
        return (
            <div className="mx-auto container px-4 sm:px-6 lg:px-8">
                <Form<SchoolFieldType> size="middle" form={form} className="space-y-6">
                    <Row gutter={[16, 16]}>
                        {/* Section 1: School Images */}
                        <Col xs={24}>
                            <Card title="School Images" className="w-full">
                                {/* Large main image */}
                                <div
                                    className="px-1 md:px-10 mb-6 flex justify-center items-center w-full h-[150px] xs:h-[200px] sm:h-[250px] md:h-[350px] lg:h-[450px]">
                                    <AnimatePresence mode='wait'>
                                        <motion.img
                                            key={mainImage}
                                            src={mainImage}
                                            alt="Main Display"
                                            className="object-cover w-full h-full rounded-lg"
                                            initial={{opacity: 0}}
                                            animate={{opacity: 1}}
                                            exit={{opacity: 0}}
                                            transition={{duration: 0.3, ease: "circInOut"}}
                                        />
                                    </AnimatePresence>
                                </div>

                                {/* Small thumbnail carousel */}
                                <Carousel
                                    dots={false}
                                    autoplaySpeed={3000}
                                    autoplay={true}
                                    afterChange={handleThumbnailClick}
                                    infinite={true}
                                    slidesToShow={5}
                                    slidesToScroll={1}
                                    className="px-1 md:px-10 mb-4 flex justify-center items-center text-center"
                                    draggable={true}
                                    responsive={[
                                        {
                                            breakpoint: 1024,
                                            settings: {
                                                slidesToShow: 4,
                                                centerMode: true,
                                                centerPadding: "30px",
                                            },
                                        },
                                        {
                                            breakpoint: 768,
                                            settings: {
                                                slidesToShow: 3,
                                                centerMode: true,
                                                centerPadding: "20px",
                                            },
                                        },
                                        {
                                            breakpoint: 480,
                                            settings: {
                                                slidesToShow: 2,
                                                centerMode: true,
                                                centerPadding: "10px",
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
                                    {(() => {
                                        const displayImages = [...imageList.map(img => img.url)];
                                        if (displayImages.length < 5) {
                                            const remainingCount = 5 - displayImages.length;
                                            displayImages.push(...images.slice(0, remainingCount));
                                        }

                                        return displayImages.map((src, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleThumbnailClick(index)}
                                                className="cursor-pointer flex justify-center items-center h-full w-full"
                                            >
                                                <img
                                                    src={src}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className="!scale-90 hover:!scale-100 h-20 lg:h-40 object-cover rounded-lg transition-all duration-500"
                                                />
                                            </div>
                                        ));
                                    })()}
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
                                                <EnvironmentOutlined className="mr-2 text-gray-500"/>
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
                                                <MailOutlined className="mr-2 text-gray-500"/>
                                                <span className="font-medium">Email:</span>
                                                <span className="ml-2">{form.getFieldValue("email") || "N/A"}</span>
                                            </div>
                                            <div className="flex items-center flex-wrap">
                                                <PhoneOutlined className="mr-2 text-gray-500"/>
                                                <span className="font-medium">Contact:</span>
                                                <span className="ml-2">{form.getFieldValue("phone") || "N/A"}</span>
                                            </div>
                                            <div className="flex items-center flex-wrap">
                                                <GlobalOutlined className="mr-2 text-gray-500"/>
                                                <span className="font-medium break-words">Website:</span>
                                                <span className="ml-2 text-blue-500 !break-words"
                                                      style={{wordBreak: "break-all"}}>
 <a href={form.getFieldValue("website")} target="_blank" rel="noopener noreferrer">
   {form.getFieldValue("website") || "N/A"}
 </a>
</span>
                                            </div>
                                            <div className="flex items-center flex-wrap">
                                                <DollarOutlined className="mr-2 text-gray-500"/>
                                                <span className="font-medium">Tuition fee:</span>
                                                <span className="ml-2">
      From {form.getFieldValue("feeFrom")?.toLocaleString() || "N/A"} VND/month
                                                    {form.getFieldValue("feeTo") ? ` to ${form.getFieldValue("feeTo")?.toLocaleString()} VND/month` : ""}
    </span>
                                            </div>
                                            <div className="flex items-center flex-wrap">
                                                <CalendarOutlined className="mr-2 text-gray-500"/>
                                                <span className="font-medium">Admission age:</span>
                                                <span className="ml-2">
      {CHILD_RECEIVING_AGE_OPTIONS.find((opt) => opt.value === form.getFieldValue("receivingAge"))?.label ||
          "N/A"}
    </span>
                                            </div>
                                            <div className="flex items-center flex-wrap">
                                                <BankOutlined className="mr-2 text-gray-500"/>
                                                <span className="font-medium">School type:</span>
                                                <span className="ml-2">
      {SCHOOL_TYPE_OPTIONS.find((opt) => opt.value === form.getFieldValue("schoolType"))?.label || "N/A"}
    </span>
                                            </div>
                                            <div className="flex items-center flex-wrap">
                                                <BookOutlined className="mr-2 text-gray-500"/>
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
        <BookOutlined className="mr-2"/>
        Facilities
      </span>
                                                }
                                                name="facilities"
                                                labelCol={{className: "text-2xl font-bold"}}
                                            >
                                                {form.getFieldValue("facilities")?.length > 0 ? (
                                                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                                                        {FACILITY_OPTIONS.filter((option) => form.getFieldValue("facilities")?.includes(option.value)).map(
                                                            (option) => (
                                                                <li key={option.value}
                                                                    className="flex items-center mt-2 mb-1 ml-2">
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
        <ToolOutlined className="mr-2"/>
        Utilities
      </span>
                                                }
                                                name="utilities"
                                                labelCol={{className: "text-2xl font-bold"}}
                                            >
                                                {form.getFieldValue("utilities")?.length > 0 ? (
                                                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                                                        {UTILITY_OPTIONS.filter((option) => form.getFieldValue("utilities")?.includes(option.value)).map(
                                                            (option) => (
                                                                <li key={option.value}
                                                                    className="flex items-center mt-2 mb-1 ml-2">
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
                                    dangerouslySetInnerHTML={{__html: form.getFieldValue("description") || "N/A"}}
                                />
                                <div className={'py-1'}>
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
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </div>
        );
    }

    return (

        <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
            <Form<SchoolFieldType>
                size='middle'
                form={form}
                labelCol={{span: 6, className: 'font-bold'}}
                labelAlign='left'
                labelWrap
                layout="horizontal"
                className="space-y-6 h-auto"
            >
                <div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-16'>
                    <div>
                        <Form.Item
                            tooltip="This must match the expected school when creating School Owner account"
                            name="name"
                            label="School Name"
                            rules={[{required: true, message: 'Please enter school name'}]}
                        >
                            {isEdit ? (
                                <Input
                                    placeholder="Enter school name..."
                                    readOnly={isReadOnly}
                                />
                            ) : (
                                <Select
                                    showSearch
                                    placeholder="Search and select a school..."
                                    options={schoolOptions}
                                    loading={isLoadingExpectedSchool}
                                    filterOption={(input, option) =>
                                        !!(option && option.label.toLowerCase().includes(input.toLowerCase()))
                                    }
                                    disabled={isReadOnly}
                                />
                            )}
                        </Form.Item>

                        <Form.Item
                            name="schoolType"
                            label="School Type"
                            rules={[{required: true, message: 'Please select school type'}]}
                        >
                            <Select
                                placeholder="Select a type..."
                                options={SCHOOL_TYPE_OPTIONS}
                                className={isReadOnly ? "pointer-events-none" : ""}
                                suffixIcon={!isReadOnly}
                            />
                        </Form.Item>

                        <AddressInput
                            isReadOnly={isReadOnly}
                            form={form}
                        />

                        <EmailInput
                            form={form}
                            isReadOnly={isReadOnly}
                            ref={emailInputRef}
                            triggerCheckEmail={triggerCheckEmail}
                            schoolId={schoolId}
                        />
                        <PhoneInput
                            onPhoneChange={(phone) => form.setFieldsValue({phone})}
                            form={form}
                            isReadOnly={isReadOnly}
                            ref={phoneInputRef}
                            formLoaded={formLoaded}
                        />

                        <Form.Item
                            name="receivingAge"
                            label="Child receiving age"
                            rules={[{required: true, message: 'Please select age range'}]}
                        >
                            <Select
                                placeholder="Select a category..."
                                options={CHILD_RECEIVING_AGE_OPTIONS}
                                className={isReadOnly ? "pointer-events-none" : ""}
                                suffixIcon={!isReadOnly}
                            />
                        </Form.Item>

                        <Form.Item
                            name="educationMethod"
                            label="Education method"
                            rules={[{required: true, message: 'Please select education method'}]}
                        >
                            <Select
                                placeholder="Select a category..."
                                options={EDUCATION_METHOD_OPTIONS}
                                className={isReadOnly ? "pointer-events-none" : ""}
                                suffixIcon={!isReadOnly}
                            />
                        </Form.Item>

                        <Form.Item label="Fee/Month (VND)" required className='mb-0'>
                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item
                                    name="feeFrom"
                                    label="From"
                                    rules={[{required: true, message: "Please select fee from"}]}
                                >
                                    <InputNumber
                                        placeholder="From"
                                        className="w-full"
                                        min={0}
                                        step={100000}
                                        onChange={(value) => {
                                            const feeTo = form.getFieldValue("feeTo");
                                            if (feeTo !== undefined && value !== null && value > feeTo) {
                                                form.setFieldsValue({feeTo: value});
                                            }
                                            form.setFieldsValue({feeFrom: value});
                                        }}
                                        readOnly={isReadOnly}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="feeTo"
                                    label="To"
                                    dependencies={["feeFrom"]}
                                    rules={[
                                        {required: true, message: "Please select fee to"},
                                        ({getFieldValue}) => ({
                                            validator(_, value) {
                                                const feeFrom = getFieldValue("feeFrom");
                                                if (!value || feeFrom <= value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error("To amount must be greater than or equal to From amount"));
                                            },
                                        }),
                                    ]}
                                >
                                    <InputNumber
                                        placeholder="To"
                                        className="w-full"
                                        min={form.getFieldValue("feeFrom") || 0}
                                        step={100000}
                                        onChange={(value) => form.setFieldsValue({feeTo: value})}
                                        readOnly={isReadOnly}
                                    />
                                </Form.Item>
                            </div>
                        </Form.Item>

                        <Form.Item
                            name="schoolOwners"
                            label="School Owners"
                            // rules={[{required: true, message: 'Please select a school owner'}]}
                        >
                            <Select
                                showSearch
                                mode='multiple'
                                placeholder="Select school owners..."
                                options={ownerOptions}
                                onChange={handleOwnersChange}
                                loading={searchSchoolOwnersResult.isFetching}
                                disabled={isReadOnly || !schoolNameValue}
                                tagRender={renderOwnerTag}
                                filterOption={(input, option) => {
                                    const owner = (option as any)?.owner as SchoolOwnerVO;
                                    return (
                                        owner && (
                                            owner.fullname.toLowerCase().includes(input.toLowerCase()) ||
                                            owner.username.toLowerCase().includes(input.toLowerCase()) ||
                                            owner.email.toLowerCase().includes(input.toLowerCase()) ||
                                            owner.phone.toLowerCase().includes(input.toLowerCase())
                                        )
                                    );
                                }}
                                dropdownStyle={{minWidth: 300}}
                                notFoundContent={
                                    searchSchoolOwnersResult.isFetching
                                        ? "Loading..."
                                        : schoolNameValue
                                            ? "No owners found"
                                            : "Please select a school first"
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            name="website"
                            label="School Website"
                        >
                            <Input placeholder="Enter School Website here..." readOnly={isReadOnly}/>
                        </Form.Item>
                    </div>
                    <div>
                        <Form.Item label="Facilities" name="facilities">
                            <Checkbox.Group
                                options={FACILITY_OPTIONS}
                                value={facilities}
                                className={clsx(
                                    "grid grid-cols-3 gap-2 custom-add-school-select",
                                    {"pointer-events-none": isReadOnly}
                                )}
                            />
                        </Form.Item>

                        <Form.Item label="Utilities" name="utilities">
                            <Checkbox.Group
                                options={UTILITY_OPTIONS}
                                value={utilities}
                                className={clsx(
                                    "grid grid-cols-3 gap-2 custom-add-school-select",
                                    {"pointer-events-none": isReadOnly}
                                )}
                            />
                        </Form.Item>
                        <style>{`
                            .custom-add-school-select .ant-checkbox-wrapper {
                                display: flex;
                                align-items: center;
                            }

                            .custom-add-school-select .ant-checkbox-inner {
                                width: 24px !important;
                                height: 24px !important;
                            }

                            .custom-add-school-select .ant-checkbox-input {
                                transform: scale(2);
                            }
                        `}</style>

                        <Form.Item
                            name="description"
                            label="School introduction"
                        >
                            <MyEditor
                                description={form.getFieldValue("description") || undefined}
                                onChange={(value) => form.setFieldsValue({description: value})}
                            />
                        </Form.Item>
                        <Form.Item label="School image" name="image" valuePropName="fileList"
                                   getValueFromEvent={(e) => e?.fileList || []}>
                            <ImageUpload
                                form={form}
                                fieldName="image"
                                maxCount={10}
                                accept={["image/png","image/jpg","image/jpeg"]}
                                maxSizeMB={5}
                                hideImageUpload={hideImageUpload}
                                imageList={imageList}
                                formLoaded={formLoaded}
                            />
                        </Form.Item>
                    </div>
                </div>

                {/* Thêm Form.Item cho các nút ở đáy form */}
                <Form.Item style={{textAlign: 'center', marginTop: '16px'}}>
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
                </Form.Item>
            </Form>
        </div>
    );
};

export default SchoolForm;