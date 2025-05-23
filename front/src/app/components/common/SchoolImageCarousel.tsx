"use client";
import React, {FunctionComponent, useState} from "react";
import {Card} from "antd";
import ReactImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

interface SchoolImageCarouselProps {
    imageList: { url: string }[];
}

const SchoolImageCarousel: FunctionComponent<SchoolImageCarouselProps> = ({imageList}) => {
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Custom CSS for the gallery
    const styles = `
        /* Slides */
        .image-gallery-slide {
            width: 100%;
            justify-content: center;
            align-items: center;
        }
        .image-gallery-slide .image-gallery-image {
            width: 100%;
            aspect-ratio: 16 / 9;
            object-fit: ${isFullScreen ? "contain" : "cover"};
        }

        /* Navigation buttons */
        .image-gallery-left-nav, .image-gallery-right-nav {
            transform: translateY(-50%);
            z-index: 10;
            padding: 10px;
            box-shadow: none;
        }
        .image-gallery-left-nav {
            left: -10px;
        }
        .image-gallery-right-nav {
            right: -10px;
        }

        /* Thumbnails container */
        .image-gallery-thumbnails-container {
            width: 100%;
            margin-top: 20px;
        }

        /* Thumbnails wrapper */
        .image-gallery-thumbnails-wrapper {
            width: 100%;
            display: flex;
            justify-content: center;
        }

        /* Thumbnails list */
        .image-gallery-thumbnails {
            display: flex;
            justify-content: center;
            width: 100%;
            gap: 20px; /* Add spacing between thumbnails */ 
        }

        /* Individual thumbnail */
        .image-gallery-thumbnail {
            margin: 0 20px 0 0;
            
            ${isFullScreen ? "" : "width: 33%;"}
            border: none !important;
            overflow: hidden;
        }

        .image-gallery-thumbnail .image-gallery-thumbnail-image {
            width: 100%;
            aspect-ratio: 16 / 9;
            object-fit: cover;
            transition: transform 0.4s ease-in-out;
        }

        .image-gallery-thumbnail:hover .image-gallery-thumbnail-image {
            transform: scale(1.1);
        }

        .image-gallery-thumbnail.active {
            border: 0px solid #1890ff; /* Optional: highlight active thumbnail */
        }

        .image-gallery-thumbnail .image-gallery-thumbnail-image {
            width: 100%;
            aspect-ratio: 16 / 9; /* Maintain 16:9 ratio for thumbnails */
            object-fit: cover; /* Crop to fit 16:9 */
        }

        /* Gallery content */
        .image-gallery-content {
            justify-content: center;
        }
    `;

    const galleryImages = imageList.map((image) => ({
        original: image.url,
        thumbnail: image.url,
    }));

    // Handle full-screen change
    const handleScreenChange = (fullScreen: boolean) => {
        setIsFullScreen(fullScreen);
    };

    return (
        <>
            <style>{styles}</style>
            <Card className="w-full border-none " styles={{body: {padding: 6}}}>
                <ReactImageGallery
                    showBullets
                    items={galleryImages}
                    useTranslate3D
                    onScreenChange={handleScreenChange}
                />
            </Card>
        </>
    );
};

export default SchoolImageCarousel;