'use client'
import {motion} from "framer-motion";
import background from "@public/bg4.png";
import SchoolSearchForm from "@/app/components/school/SchoolSearchForm";
import Testimonial from "@/app/components/common/Testimonial";
import Information from "@/app/components/common/Information";

export default function Page() {
    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 1.8, ease: "easeInOut"}}
            className="w-full min-h-[800px] relative"
        >
            {/*Preload image*/}
            <img src={background.src} alt="" style={{display: 'none'}}/>
            <div
                id="school-search"
                style={{
                    backgroundImage: `url(${background.src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
                className="inset-0 flex items-center justify-center pt-60 pb-52">
                <div className="bg-white bg-opacity-70 p-8 md:p-20 rounded-2xl w-full max-w-2xl shadow-2xl">
                    <SchoolSearchForm/>
                </div>
            </div>

            <div id="testimonial" className={'bg-gray-50 pb-20'}>
                <Testimonial/>
            </div>
            <div id="information">
                <Information/>
            </div>
        </motion.div>
    );
}