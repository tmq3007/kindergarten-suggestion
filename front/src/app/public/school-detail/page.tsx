'use client'
import React, { useState } from 'react';
import { Card, Carousel, Button, Rate } from 'antd';

const App = () => {
    // Array of image URLs (replace with actual URLs or local images)
    const images = [
        'https://kame.asia/wp-content/uploads/2023/12/2-1-2048x1024.jpg', // Main city skyline
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR9pCuW7pkzximPDu2ofUf3O_fZtoYUw5vcg&s', // City at sunset
        'https://kame.asia/wp-content/uploads/2023/12/2-1-2048x1024.jpg', // Mountain landscape 1
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR9pCuW7pkzximPDu2ofUf3O_fZtoYUw5vcg&s', // Mountain landscape 2
    ];

    // State to track the currently selected main image
    const [mainImage, setMainImage] = useState(images[0]);

    // Handler for when a thumbnail is clicked
    const handleThumbnailClick = (index: number) => {
        setMainImage(images[index]);
    };

    return (
        <div className="container mx-auto mt-20 p-4 max-w-4xl">
            {/* Main Image */}
            <div className="mb-6">
                <img
                    src={mainImage}
                    alt="Main Display"
                    className="w-[98%] h-96 object-cover rounded-lg"
                />
            </div>

            {/* Thumbnail Carousel */}
            <Carousel
                dots={true}
                slidesToShow={3} // Show 3 thumbnails at a time
                slidesToScroll={1}
                className="mb-6"
            >
                {images.map((src, index) => (
                    <div key={index} onClick={() => handleThumbnailClick(index)} className="px-2 cursor-pointer">
                        <img
                            src={src}
                            alt={`Thumbnail ${index + 1}`}
                            className={`w-full h-32 object-cover rounded-lg ${mainImage === src ? ' border-blue-500' : ''}`}
                        />
                    </div>
                ))}
            </Carousel>

            {/* School Details Card */}
            <Card
                title="Fort Street Public School"
                extra={<a href="#">More Details</a>}
                className="shadow-lg rounded-lg"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Address */}
                    <div>
                        <span className="text-gray-600">Address:</span>
                        <p>24 Fordham Avenue CAMBERWELL VIC 3124</p>
                    </div>
                    {/* Email */}
                    <div>
                        <span className="text-gray-600">Email:</span>
                        <p><a href="mailto:FortStreet@school.com">FortStreet@school.com</a></p>
                    </div>
                    {/* Contact */}
                    <div>
                        <span className="text-gray-600">Contact:</span>
                        <p>01234567899</p>
                    </div>
                    {/* Website */}
                    <div>
                        <span className="text-gray-600">Website:</span>
                        <p><a href="http://FortStreet.schooledu" target="_blank" rel="noopener noreferrer">FortStreet.schooledu</a></p>
                    </div>
                    {/* Tuition Fee */}
                    <div>
                        <span className="text-gray-600">Tuition Fee:</span>
                        <p>From 4,000,000 VND/month</p>
                    </div>
                    {/* Admission Age */}
                    <div>
                        <span className="text-gray-600">Admission Age:</span>
                        <p>From 6 months to 5 years</p>
                    </div>
                    {/* School Type */}
                    <div>
                        <span className="text-gray-600">School Type:</span>
                        <p>Public</p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-4 flex space-x-4">
                    <Button type="primary" className="bg-blue-500 text-white">
                        Request Counseling
                    </Button>
                    <Button type="default" className="border-gray-300">
                        Visit School
                    </Button>
                </div>

                {/* Rating */}
                <div className="mt-4 flex items-center">
                    <Rate disabled defaultValue={5} className="text-yellow-400" />
                    <span className="ml-2 text-gray-600">5.0 (20 ratings)</span>
                </div>
            </Card>
        </div>
    );
};

export default App;