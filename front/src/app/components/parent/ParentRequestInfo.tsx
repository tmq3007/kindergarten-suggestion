// File: app/components/parent/ParentRequestInfo.tsx

import React, {useState, useRef, useEffect} from 'react';
import {Row, Col, Card, Tag, Typography, Rate, Badge, Modal, Button} from 'antd';
import {ParentRequestListVO} from '@/redux/services/requestCounsellingApi';
import {EnvironmentOutlined, GlobalOutlined, DollarOutlined, UserOutlined} from '@ant-design/icons';
import {REQUEST_COUNSELLING_STATUS_OPTIONS} from "@/lib/constants";
import clsx from "clsx";

const {Title, Text, Paragraph} = Typography;

interface ParentRequestInfoProps {
    request: ParentRequestListVO;
}

const ParentRequestInfo: React.FC<ParentRequestInfoProps> = ({request}) => {

    const [isModalOpen, setIsModalOpen] = useState(false)
    const MAX_INQUIRY_LENGTH = 300

    const shouldTruncate = request.inquiry && request.inquiry.length > MAX_INQUIRY_LENGTH
    const displayInquiry = shouldTruncate
        ? `${request.inquiry?.substring(0, MAX_INQUIRY_LENGTH)}...`
        : request.inquiry

    const requestCounsellingStatus =
        REQUEST_COUNSELLING_STATUS_OPTIONS.find(
            (option) => option.value === String(request?.status))?.label || undefined;

    const statusColors: Record<string, string> = {
        "Closed": "bg-gray-200 text-gray-8",
        "Overdue": "bg-yellow-200 text-yellow-800",
        "Opened": "bg-green-200 text-green-800",
    };

    const dueDate = new Date(request.dueDate).toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    const tuitionFee = request.school?.feeFrom
        ? `From ${request.school.feeFrom.toLocaleString('vi-VN')} VND/month`
        : 'N/A';

    const admissionAge = request.school?.receivingAge
        ? `From ${request.school.receivingAge} months to 5 years`
        : 'N/A';

    return (
        <>
        <div className="mx-auto mt-1 px-4 py-5">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 items-start max-sm:border-2 max-sm:border-blue-300 max-sm:rounded-lg max-sm:shadow-md p-2 max-sm:bg-gray-50">
                {/* Request Card - Chiếm 3/6 cột */}
                <div
                    className="md:col-span-3 bg-white border-2 border-blue-300 rounded-lg shadow-md p-4 min-h-[300px] h-auto">
                    {/* Nội dung Request */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
                        <Text className='text-lg'><span className='text-blue-500 underline'>Request Number:</span> <span
                            className='text-blue-500 font-bold'> #{request.id}</span></Text>
                        <Text className='text-xs'>{dueDate}</Text>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <Text className='text-lg text-blue-500 underline'>Request Information:</Text>
                        {requestCounsellingStatus && (
                            <Badge className={clsx("h-1/2 py-2 px-5 rounded-xl font-medium", statusColors[requestCounsellingStatus])}>
                                {requestCounsellingStatus}
                            </Badge>
                        )}
                    </div>
                    <div className="mt-2">
                        <Paragraph>
                            <Text>Full Name: </Text>
                            {request.name || 'N/A'}
                        </Paragraph>
                        <Paragraph>
                            <Text>Email address: </Text>
                            {request.email || 'N/A'}
                        </Paragraph>
                        <Paragraph>
                            <Text>Phone number: </Text>
                            {request.phone || 'N/A'}
                        </Paragraph>
                        <Paragraph className="w-full">
                            <Text>Inquiry: </Text>
                            {request.inquiry && (
                                <div className="col-span-full">
                                    <span className="font-medium">Inquiry:</span>
                                    <div className="mt-1">
                                        {displayInquiry}
                                        {shouldTruncate && (
                                            <Button
                                                type="link"
                                                onClick={() => setIsModalOpen(true)}
                                                className="p-0 ml-1 h-auto"
                                            >
                                                See more
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Paragraph>
                        <Paragraph className="mt-2 text-xs text-gray-500">
                            Our staff will contact with you within 24 hrs. If you need urgent assistance, please contact
                            us via our hotline{' '}
                            <Text strong underline={true} className="text-blue-600">09123456888</Text>
                        </Paragraph>
                    </div>
                </div>

                {/* School Section Card */}
                    <div
                        className="md:col-span-2 bg-white rounded-lg border-2 border-blue-300 shadow-md p-4 md:h-full sm:h-auto">
                        <Text className='text-lg text-blue-500'>School Summary</Text>
                        <br/>
                        <Title level={2} underline={true}
                               style={{color: '#3C82F6'}}>{request.school?.name || 'N/A'}</Title>
                        <Paragraph>
                            <EnvironmentOutlined className="mr-2"/>
                            <Text>Address: </Text>
                            {request.school?.ward + ', ' + request.school?.street + ', ' + request.school?.district + ', ' + request.school?.province || 'N/A'}
                        </Paragraph>
                        <Paragraph>
                            <GlobalOutlined className="mr-2"/>
                            <Text>Website: </Text>
                            {request.school?.website || 'N/A'}
                        </Paragraph>
                        <Paragraph>
                            <DollarOutlined className="mr-2"/>
                            <Text>Tuition fee: </Text>
                            {tuitionFee}
                        </Paragraph>
                        <Paragraph>
                            <UserOutlined className="mr-2"/>
                            <Text>Admission age: </Text>
                            {admissionAge}
                        </Paragraph>
                        <div className="flex md:flex-row flex-col items-center">
                            <Rate disabled value={request.averageSchoolRating || 0} allowHalf/>
                            <Text className="ml-1">
                                {request.averageSchoolRating || 0}/5 ({request.totalSchoolReview || 0} ratings)
                            </Text>
                        </div>
                    </div>

                {/* Response Section Card */}
                    <div
                        className="md:col-span-1 bg-white rounded-lg border-2 border-blue-300 shadow-md p-4 md:h-full sm:h-auto">
                        <Text className='text-lg text-blue-500'>Response</Text>
                        <div
                            className="text-gray-800"
                            dangerouslySetInnerHTML={{__html: request.response || "N/A"}}
                        />
                    </div>

            </div>
        </div>

    <Modal
        title="Inquiry Details"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
            <Button key="close" type="primary" onClick={() => setIsModalOpen(false)}>
                Close
            </Button>,
        ]}
        width={800}
    >
        <div
            className="max-h-[60vh] overflow-y-auto p-2 whitespace-pre-wrap"
            style={{ wordBreak: 'break-word' }}
        >
            {request.inquiry || '' || 'No inquiry content'}
        </div>
    </Modal>
        </>
    );
};

export default ParentRequestInfo;