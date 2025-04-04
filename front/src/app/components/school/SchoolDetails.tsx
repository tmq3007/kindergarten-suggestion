"use client";

import React, {FunctionComponent} from 'react';
import {Card, Col, Row, Descriptions} from 'antd';
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
} from '@ant-design/icons';
import ReactImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";

// Custom CSS for fixed container size and thumbnail size
const galleryStyles = `
  .image-gallery-slide {
    width: 100%;
    justify-content: center;
    align-items: center;
  }
  .image-gallery-slide .image-gallery-image {
    aspect-ratio: 16 / 9;
    object-fit: cover; /* Images scale to fit the container without cropping */
  }
  .image-gallery-left-nav, .image-gallery-right-nav {
    transform: translateY(-50%);
    z-index: 10; /* Ensure buttons are above the slide */
    padding: 10px; /* Optional: padding for better visibility */
    shadow: none;
    
  }
  .image-gallery-left-nav {
    left: -110px;
  }
  .image-gallery-right-nav {
    right: -110px;
  }
  .image-gallery-thumbnail .image-gallery-thumbnail-image {
    width: 100px; /* Fixed width for thumbnails */
    height: 100px; /* Fixed height for thumbnails */
    object-fit: cover; /* Ensure thumbnails fit within the fixed size */
  }
  .image-gallery-thumbnails-wrapper {
    display: flex;
    justify-content: center;
  }
  .image-gallery-content {
    justify-content: center;
  }
`;

// Define types based on your SchoolDetailVO
interface Facility {
    id?: number;
    name: string;
}

interface Utility {
    id?: number;
    name: string;
}

interface MediaVO {
    id?: number;
    url: string;

    [key: string]: any;
}

interface SchoolOwnerVO {
    id?: number;
    name?: string;

    [key: string]: any;
}

export interface SchoolDetailVO {
    id: number;
    fileList: any;
    status: number;
    name: string;
    schoolType: number;
    district: string;
    ward: string;
    province: string;
    street: string;
    email: string;
    phone: string;
    receivingAge: number;
    educationMethod: number;
    feeFrom: number;
    feeTo: number;
    description: string;
    website: string;
    facilities: Facility[];
    utilities: Utility[];
    posted_date: Date | null;
    imageList: MediaVO[];
    schoolOwners?: SchoolOwnerVO[];
}

interface SchoolDetailsProps {
    schoolData: SchoolDetailVO;
    CHILD_RECEIVING_AGE_OPTIONS?: { value: number; label: string }[];
    SCHOOL_TYPE_OPTIONS?: { value: number; label: string }[];
    EDUCATION_METHOD_OPTIONS?: { value: number; label: string }[];
}

const SchoolDetails: FunctionComponent<SchoolDetailsProps> = ({
                                                                  schoolData,
                                                                  CHILD_RECEIVING_AGE_OPTIONS = [],
                                                                  SCHOOL_TYPE_OPTIONS = [],
                                                                  EDUCATION_METHOD_OPTIONS = [],
                                                              }) => {
    const {
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

    const galleryImages = imageList.map((image) => ({
        original: image.url,
        thumbnail: image.url,
    }));

    return (
        <div className="w-full flex justify-center mb-8">
            {/* Inject custom styles for the gallery */}
            <Row gutter={[24, 24]}>
                {/* Section 1: School Images */}
                <style>{galleryStyles}</style>
                <Col xs={24}>
                        <ReactImageGallery showBullets items={galleryImages} useTranslate3D/>
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
                                        className="w-full shadow-lg border border-cyan-500 bg-white p-6" // Cyan border
                                    >
                                        <h2 className="text-3xl font-bold mb-6">{name || 'Unknown School'}</h2>
                                        <Descriptions column={1} bordered className="w-full text-lg" size="small">
                                            <Descriptions.Item
                                                label={<span className="text-base"><EnvironmentOutlined
                                                    className="mr-2"/>Address</span>}
                                            >
                                                {[street, ward, district, province].filter(Boolean).join(', ') || 'N/A'}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={<span className="text-base"><MailOutlined className="mr-2"/>Email</span>}
                                            >
                                                {email || 'N/A'}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={<span className="text-base"><PhoneOutlined className="mr-2"/>Contact</span>}
                                            >
                                                {phone || 'N/A'}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={<span className="text-base"><GlobalOutlined className="mr-2"/>Website</span>}
                                            >
                                                <a href={website} target="_blank" rel="noopener noreferrer"
                                                   className="text-blue-500" style={{wordBreak: 'break-all'}}>
                                                    {website || 'N/A'}
                                                </a>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={<span className="text-base"><DollarOutlined className="mr-2"/>Tuition Fee</span>}
                                            >
                                                From {feeFrom?.toLocaleString() || 'N/A'} VND/month
                                                {feeTo ? ` to ${feeTo?.toLocaleString()} VND/month` : ''}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={<span className="text-base"><CalendarOutlined className="mr-2"/>Admission Age</span>}
                                            >
                                                {CHILD_RECEIVING_AGE_OPTIONS.find((opt) => opt.value === receivingAge)?.label || 'N/A'}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={<span className="text-base"><BankOutlined className="mr-2"/>School Type</span>}
                                            >
                                                {SCHOOL_TYPE_OPTIONS.find((opt) => opt.value === schoolType)?.label || 'N/A'}
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={<span className="text-base"><BookOutlined className="mr-2"/>Education Method</span>}
                                            >
                                                {EDUCATION_METHOD_OPTIONS.find((opt) => opt.value === educationMethod)?.label || 'N/A'}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Card>
                                </Col>

                                {/* Right Column: Facilities & Utilities */}
                                <Col xs={24} lg={8} className="flex">
                                    <Card
                                        title="Facilities & Utilities"
                                        className="w-full shadow-lg border border-cyan-500 bg-white p-6" // Cyan border
                                    >
                                        <div className="space-y-8">
                                            <div>
                    <span className="flex items-center text-2xl font-bold mb-4">
                      <BookOutlined className="mr-2"/>
                      Facilities
                    </span>
                                                {facilities.length > 0 ? (
                                                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 text-lg">
                                                        {facilities.map((facility, index) => (
                                                            <li key={index}
                                                                className="flex items-center mt-2 mb-1 ml-2">
                                                                {facility.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-gray-500 mt-1 text-lg">No data</p>
                                                )}
                                            </div>
                                            <div>
                    <span className="flex items-center text-2xl font-bold mb-4">
                      <ToolOutlined className="mr-2"/>
                      Utilities
                    </span>
                                                {utilities.length > 0 ? (
                                                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 text-lg">
                                                        {utilities.map((utility, index) => (
                                                            <li key={index}
                                                                className="flex items-center mt-2 mb-1 ml-2">
                                                                {utility.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-gray-500 mt-1 text-lg">No data</p>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>

                        {/* Section 3: School Introduction */}
                        <Col xs={24}>
                            <Card
                                title="School Introduction"
                                className="w-full shadow-lg border border-cyan-500 bg-white p-6" // Cyan border
                            >
                                <div
                                    className="text-gray-800 text-lg"
                                    dangerouslySetInnerHTML={{__html: description || 'N/A'}}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

        </div>
    );
};

export default SchoolDetails;