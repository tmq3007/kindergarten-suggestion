'use client';
import React, {useState} from 'react';
import {Card, Carousel, Button, Rate, Tabs, Checkbox} from 'antd';
import TabPane from "antd/es/tabs/TabPane";
import {
    BookOutlined, CalendarOutlined, CameraOutlined, CarOutlined, CoffeeOutlined, CustomerServiceOutlined,
    DollarOutlined, DotChartOutlined, EnvironmentOutlined,
    ExperimentOutlined,
    GlobalOutlined, HomeOutlined,
    MailOutlined, MedicineBoxOutlined,
    PhoneOutlined,
    PlayCircleOutlined, ReadOutlined, SmileOutlined, TeamOutlined, TrophyOutlined,
    UserOutlined
} from "@ant-design/icons";
import {FaBottleWater, FaPersonSwimming} from "react-icons/fa6";

const ContentPage = () => {
    const images = [
        'https://kame.asia/wp-content/uploads/2023/12/2-1-2048x1024.jpg', // Main city skyline
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR9pCuW7pkzximPDu2ofUf3O_fZtoYUw5vcg&s', // City at sunset
        'https://kame.asia/wp-content/uploads/2023/12/2-1-2048x1024.jpg', // Mountain landscape 1
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR9pCuW7pkzximPDu2ofUf3O_fZtoYUw5vcg&s', // Mountain landscape 2
    ];

    const [mainImage, setMainImage] = useState(images[0]);

    const handleThumbnailClick = (index: number) => {
        setMainImage(images[index]);
    };

    // @ts-ignore
    return (
        <div className="container mx-auto   p-4 max-w-6xl">

            {/* Main Image */}
            <div className="mb-6">
                <img
                    src={mainImage}
                    alt="Main Display"
                    className="w-full h-96 object-cover rounded-lg shadow-md transition-all duration-500"
                />
            </div>

            {/* Thumbnail Carousel */}
            <Carousel
                afterChange={handleThumbnailClick}
                autoplay={true}
                slidesToShow={3}
                slidesToScroll={1}
                className="mb-6 custom-carousel"
                arrows={true}
                draggable={true}
                responsive={[
                    {
                        breakpoint: 768, // Adjust for smaller screens
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
                {images.map((src, index) => (
                    <div
                        key={index}

                        onClick={() => handleThumbnailClick(index)}
                        className=" cursor-pointer"
                    >
                        <img
                            src={src}
                            alt={`Thumbnail ${index + 1}`}
                            className={`w-full h-32 object-cover rounded-lg transition-all duration-500 `}
                        />
                    </div>
                ))}
            </Carousel>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-7">
                {/* Address */}
                <div className="flex items-start space-x-3">
                    <HomeOutlined className="text-gray-600 text-xl mt-1" />

                        <span className="text-gray-600 font-medium">Address:</span>
                        <p className="text-gray-800">24 Fordham Avenue CAMBERWELL VIC 3124</p>

                </div>

                {/* Email */}
                <div className="flex items-start space-x-3">
                    <MailOutlined className="text-gray-600 text-xl mt-1" />

                        <span className="text-gray-600 font-medium">Email:</span>
                        <p>
                            <a
                                href="mailto:FortStreet@school.com"
                                className="text-blue-500 hover:underline"
                            >
                                FortStreet@school.com
                            </a>
                        </p>

                </div>

                {/* Contact */}
                <div className="flex items-start space-x-3">
                    <PhoneOutlined className="text-gray-600 text-xl mt-1" />

                        <span className="text-gray-600 font-medium">Contact:</span>
                        <p className="text-gray-800">01234567899</p>

                </div>

                {/* Website */}
                <div className="flex items-start space-x-3">
                    <GlobalOutlined className="text-gray-600 text-xl mt-1" />

                        <span className="text-gray-600 font-medium">Website:</span>
                        <p>
                            <a
                                href="http://FortStreet.schooledu"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                FortStreet.schooledu
                            </a>
                        </p>

                </div>

                {/* Tuition Fee */}
                <div className="flex items-start space-x-3">
                    <DollarOutlined className="text-gray-600 text-xl mt-1" />

                        <span className="text-gray-600 font-medium">Tuition Fee:</span>
                        <p className="text-gray-800">From 4,000,000 VND/month</p>

                </div>

                {/* Admission Age */}
                <div className="flex items-start space-x-3">
                    <UserOutlined className="text-gray-600 text-xl mt-1" />

                        <span className="text-gray-600 font-medium">Admission Age:</span>
                        <p className="text-gray-800">From 6 months to 5 years</p>

                </div>

                {/* School Type */}
                <div className="flex items-start space-x-3">
                    <BookOutlined className="text-gray-600 text-xl mt-1" />

                        <span className="text-gray-600 font-medium">School Type:</span>
                        <p className="text-gray-800">Public</p>

                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold">School Introduction</h3>
                <p>
                    A tradition of excellence. Fort Street Public School, situated in a rich geographical location,
                    surrounded by significant natural and historical features, in the urban area of Sydney’s CBD, enjoys
                    a unique environment atop Observatory Hill.
                </p>
                <p>
                    The school of Rio students, K to 6, serves a culturally diverse and educationally aware community
                    and continues to experience rapid growth in line with the expansion of family home city living.
                    Established in 1962 as the Model School for exemplary education, the School has a proud tradition of
                    providing rich diversified educational programs.
                </p>
                <p>
                    The school pursues both academic excellence and the nurturing of the critical, creative communicator
                    by providing high interest programs through the arts, sport public speaking & debating, chess and
                    languages. The school offers a rich, innovative STEM program that incorporates a diverse level of
                    technology to nurture the development of critical & creative thinking skills in every student.
                    Strong partnerships with Sydney’s libraries and cultural centres and the schools proactive
                    engagement with its diverse and multicultural community add to the school’s ability to support the
                    highest levels of learning for its students.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {/* Facilities */}
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-3">Facilities</h3>
                    <ul className="space-y-2">
                        <li className="flex items-center space-x-3">
                            <PlayCircleOutlined className="text-gray-600 text-lg" />
                            <span className="text-gray-800">Outdoor playground</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <EnvironmentOutlined className="text-gray-600 text-lg" />
                            <span className="text-gray-800">California</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <ExperimentOutlined className="text-gray-600 text-lg" />
                            <span className="text-gray-800">STEM room</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <DotChartOutlined className="text-blue-500 text-lg" />
                            <span className="text-gray-800">Swimming pool</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <CustomerServiceOutlined className="text-gray-600 text-lg" />
                            <span className="text-gray-800">Musical room</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <CameraOutlined className="text-gray-600 text-lg" />
                            <span className="text-gray-800">Camera</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <ReadOutlined className="text-gray-600 text-lg" />
                            <span className="text-gray-800">Library</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <TrophyOutlined className="text-gray-600 text-lg" />
                            <span className="text-gray-800">PE room</span>
                        </li>
                    </ul>
                </div>

                {/* Utilities */}
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-3">Utilities</h3>
                    <ul className="space-y-2">
                        <li className="flex items-center space-x-3">
                            <CarOutlined className="text-gray-600 text-lg" />
                            <span className="text-gray-800">School bus</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <CoffeeOutlined className="text-gray-600 text-lg" />
                            <span className="text-gray-800">Breakfast</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <MailOutlined className="text-gray-600 text-lg" />
                            <span className="text-gray-800">E-Contact book</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <TeamOutlined className="text-gray-600 text-lg" />
                            <span className="text-gray-800">After school care</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <CalendarOutlined className="text-gray-600 text-lg" />
                            <span className="text-gray-800">Saturday class</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <MedicineBoxOutlined className="text-gray-600 text-lg" />
                            <span className="text-gray-800">Health check</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <SmileOutlined className="text-gray-600 text-lg" />
                            <span className="text-gray-800">Picnic activities</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mt-4 flex space-x-4">
                <Button type="primary" className="bg-blue-500 text-white">
                    Request Counseling
                </Button>
                <Button type="default" className="border-gray-300">
                    Visit School
                </Button>
            </div>
        </div>
    );
};

export default ContentPage;