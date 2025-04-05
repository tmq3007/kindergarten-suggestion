// File: app/components/parent/ParentRequestInfo.tsx

import React, {useState, useRef, useEffect} from 'react';
import {Row, Col, Card, Tag, Typography, Rate} from 'antd';
import {ParentRequestListVO} from '@/redux/services/requestCounsellingApi';
import {EnvironmentOutlined, GlobalOutlined, DollarOutlined, UserOutlined} from '@ant-design/icons';

const {Title, Text, Paragraph} = Typography;

interface ParentRequestInfoProps {
    request: ParentRequestListVO;
}

const ParentRequestInfo: React.FC<ParentRequestInfoProps> = ({request}) => {
    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const inquiryRef = useRef<HTMLDivElement>(null);

    const statusLabel = request.status === 1 ? 'Open' : 'Closed';
    const statusColor = request.status === 1 ? 'green' : 'default';

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

    // Kiểm tra xem nội dung Inquiry có vượt quá 3 dòng không
    useEffect(() => {
        const element = inquiryRef.current;
        if (element) {
            // Kiểm tra xem nội dung có bị overflow không
            const lineHeight = parseInt(getComputedStyle(element).lineHeight);
            const maxHeight = lineHeight * 3; // 3 dòng
            const actualHeight = element.scrollHeight;

            setIsOverflowing(actualHeight > maxHeight);
        }
    }, [request.inquiry]);

    return (
        <div className="mx-auto mt-1 px-4 py-5">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-start">
                {/* Request Card - Chiếm 3/6 cột */}
                <div
                    className="md:col-span-3 bg-white border-2 border-blue-300 rounded-lg shadow-md p-4 min-h-[300px] h-auto">
                    {/* Nội dung Request */}
                    <div className="flex justify-between items-center mb-2">
                        <Text className='text-lg'><span className='text-blue-500 underline'>Request Number:</span> <span
                            className='text-blue-500 font-bold'> #{request.id}</span></Text>
                        <Text className='text-xs'>{dueDate}</Text>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <Text className='text-lg text-blue-500 underline'>Request Information:</Text>
                        <Tag color={statusColor}>{statusLabel}</Tag>
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
                            <div style={{position: 'relative'}}>
                                <div
                                    ref={inquiryRef}
                                    style={{
                                        lineHeight: '1.5',
                                        maxHeight: expanded ? 'none' : '4.5em', // 3 dòng (1.5 * 3)
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitBoxOrient: 'vertical',
                                        WebkitLineClamp: expanded ? 'unset' : 3,
                                        whiteSpace: 'pre-line',
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    {request.inquiry || 'N/A'}
                                </div>
                                {isOverflowing && !expanded && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            right: 0,
                                            bottom: 0,
                                            background: 'linear-gradient(to right, transparent, white 50%)',
                                            paddingLeft: '70px'
                                        }}
                                    >
                                        <Text
                                            className="text-blue-500 underline cursor-pointer"
                                            onClick={() => setExpanded(true)}
                                        >
                                            See more...
                                        </Text>
                                    </div>
                                )}
                            </div>
                        </Paragraph>
                        <Paragraph className="mt-2 text-xs text-gray-500">
                            Our staff will contact with you within 24 hrs. If you need urgent assistance, please contact
                            us via our hotline{' '}
                            <Text strong underline={true} className="text-blue-600">09123456888</Text>
                        </Paragraph>
                    </div>
                </div>

                {/* School Section Card */}

                {(isOverflowing && !expanded) ? (
                    <div
                        className="md:col-span-2 bg-white rounded-lg border-2 border-blue-300 shadow-md p-4 md:h-[349px] sm:h-auto">
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
                ) : (
                    <div
                        className="md:col-span-2 bg-white rounded-lg border-2 border-blue-300 shadow-md p-4 md:h-[307px] sm:h-auto">
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
                )}

                {/* Response Section Card */}
                {(isOverflowing && !expanded) ? (
                    <div
                        className="md:col-span-1 bg-white rounded-lg border-2 border-blue-300 shadow-md p-4 md:h-[349px] sm:h-auto">
                        <Text className='text-lg text-blue-500'>Response</Text>
                        <div
                            className="text-gray-800"
                            dangerouslySetInnerHTML={{__html: request.response || "N/A"}}
                        />
                    </div>
                ) : (
                    <div
                        className="md:col-span-1 bg-white rounded-lg border-2 border-blue-300 shadow-md p-4 md:h-[307px] sm:h-auto">
                        <Text className='text-lg text-blue-500'>Response</Text>
                        <div
                            className="text-gray-800"
                            dangerouslySetInnerHTML={{__html: request.response || "N/A"}}
                        />
                    </div>
                )}

            </div>
        </div>
    );
};

export default ParentRequestInfo;