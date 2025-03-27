import { useEffect, useState } from "react";

export default function useIsMobile(width?: number) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const breakpoint = width ?? 768; // Default to 768 if width is undefined
        const handleResize = () => {
            setIsMobile(window.innerWidth <= breakpoint); // Set boolean based on comparison
        };

        handleResize(); // Initial check
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [width]); // Include width in dependency array

    return isMobile;
}