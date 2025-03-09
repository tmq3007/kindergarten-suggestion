'use client';
import React, { useState } from 'react';
import { Card, Carousel, Button, Rate, Tabs, Checkbox } from 'antd';
import TabPane from "antd/es/tabs/TabPane";

const App = () => {
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

    return (
        <div className="container mx-auto mt-20 p-4 max-w-6xl">
            {/* Main Image */}
            <div className="mb-6">
                <img
                    src={mainImage}
                    alt="Main Display"
                    className="w-full h-96 object-cover rounded-lg shadow-md transition-all duration-300"
                />
            </div>

            {/* Thumbnail Carousel */}
            <Carousel
                dots={true}
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
                        className="px-2 cursor-pointer"
                    >
                        <img
                            src={src}
                            alt={`Thumbnail ${index + 1}`}
                            className={`w-full h-32 object-cover rounded-lg transition-all duration-200 `}
                        />
                    </div>
                ))}
            </Carousel>

            {/* School Details Card */}
            <Card
                title="Fort Street Public School"
                extra={<a href="#">More Details</a>}
                className="shadow-lg rounded-lg mb-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-gray-600">Address:</span>
                        <p>24 Fordham Avenue CAMBERWELL VIC 3124</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Email:</span>
                        <p>
                            <a href="mailto:FortStreet@school.com">FortStreet@school.com</a>
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-600">Contact:</span>
                        <p>01234567899</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Website:</span>
                        <p>
                            <a
                                href="http://FortStreet.schooledu"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                FortStreet.schooledu
                            </a>
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-600">Tuition Fee:</span>
                        <p>From 4,000,000 VND/month</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Admission Age:</span>
                        <p>From 6 months to 5 years</p>
                    </div>
                    <div>
                        <span className="text-gray-600">School Type:</span>
                        <p>Public</p>
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

                <div className="mt-4 flex items-center">
                    <Rate disabled defaultValue={5} className="text-yellow-400" />
                    <span className="ml-2 text-gray-600">5.0 (20 ratings)</span>
                </div>
            </Card>

            <Card
                title="Fort Street Public School"
                extra={<a href="#">More Details</a>}
                className="shadow-lg rounded-lg"
            >
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Overview " key="1">
                        <div>
                            <h3 className="text-lg font-semibold">School Introduction</h3>
                            <p>
                                A tradition of excellence. Fort Street Public School, situated in a rich geographical location, surrounded by significant natural and historical features, in the urban area of Sydney’s CBD, enjoys a unique environment atop Observatory Hill.
                            </p>
                            <p>
                                The school of Rio students, K to 6, serves a culturally diverse and educationally aware community and continues to experience rapid growth in line with the expansion of family home city living. Established in 1962 as the Model School for exemplary education, the School has a proud tradition of providing rich diversified educational programs.
                            </p>
                            <p>
                                The school pursues both academic excellence and the nurturing of the critical, creative communicator by providing high interest programs through the arts, sport public speaking & debating, chess and languages. The school offers a rich, innovative STEM program that incorporates a diverse level of technology to nurture the development of critical & creative thinking skills in every student. Strong partnerships with Sydney’s libraries and cultural centres and the schools proactive engagement with its diverse and multicultural community add to the school’s ability to support the highest levels of learning for its students.
                            </p>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold">Facilities</h3>
                            <ul>
                                <li><Checkbox>Outdoor playground</Checkbox></li>
                                <li><Checkbox>California</Checkbox></li>
                                <li><Checkbox>STEM room</Checkbox></li>
                                <li><Checkbox>Swimming pool</Checkbox></li>
                                <li><Checkbox>Musical room</Checkbox></li>
                                <li><Checkbox>Camera</Checkbox></li>
                                <li><Checkbox>Library</Checkbox></li>
                                <li><Checkbox>PE room</Checkbox></li>
                            </ul>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold">Utilities</h3>
                            <ul>
                                <li><Checkbox>School bus</Checkbox></li>
                                <li><Checkbox>Breakfast</Checkbox></li>
                                <li><Checkbox>E-Contact book</Checkbox></li>
                                <li><Checkbox>After school care</Checkbox></li>
                                <li><Checkbox>Saturday class</Checkbox></li>
                                <li><Checkbox>Health check</Checkbox></li>
                                <li><Checkbox>Picnic activities</Checkbox></li>
                            </ul>
                        </div>
                    </TabPane>
                    <TabPane tab="Ratings" key="2">
                        <div className="mt-4">
                            <Rate disabled defaultValue={4.5} allowHalf className="text-yellow-400" />
                            <span className="ml-2 text-gray-600">4.5 Stars (120 Ratings)</span>
                        </div>
                        <div className="mt-4">
                            <p><strong>Learning program:</strong> (5/5)</p>
                            <p><strong>Facilities and Utilities:</strong> (4/5)</p>
                            <p><strong>Extracurricular Activities:</strong> (4/5)</p>
                            <p><strong>Teachers and Staff:</strong> (5/5)</p>
                            <p><strong>Hygiene and Nutrition:</strong> (4/5)</p>
                        </div>
                        <div className="mt-4">
                            <p><strong>Will Kenny</strong> - Oct 10th, 2022 11:20AM</p>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex commodo consequat.</p>
                        </div>
                    </TabPane>
                </Tabs>

                <div className="mt-4 flex space-x-4">
                    <Button type="primary" className="bg-blue-500 text-white">
                        Request Counseling
                    </Button>
                    <Button type="default" className="border-gray-300">
                        Visit School
                    </Button>
                </div>

            </Card>
        </div>
    );
};

export default App;