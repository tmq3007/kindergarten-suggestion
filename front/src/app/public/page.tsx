'use client'
import {motion} from "framer-motion";
import background from "@public/bg4.png";
import SchoolSearchForm from "@/app/components/school/SchoolSearchForm";
import Testimonial from "@/app/components/common/Testimonial";
import Information from "@/app/components/common/Information";
import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";
import {Alert, Button, notification, Space} from "antd";
import {useAlertReminderQuery} from "@/redux/services/requestCounsellingApi";
import Link from "next/link";
import {useEffect, useState} from "react";

export default function Page() {
    const userRole = useSelector((state: RootState) => state.user?.role);
    const  isSchoolOwner = userRole != null && userRole ==="ROLE_SCHOOL_OWNER"
    const userId =useSelector((state: RootState) => state.user?.id)
    console.log("id",userId)
    console.log("role",userRole)
    console.log("isSchoolOwner",isSchoolOwner)
    const { data, error, isLoading } = useAlertReminderQuery(Number(userId), {
        skip: !isSchoolOwner || !userId,
    });

    const reminderData = data?.data;
    console.log("data alert",reminderData)

    const [api, contextHolder] = notification.useNotification();

    const [hasNotified, setHasNotified] = useState(false);


    if (isSchoolOwner && reminderData && !hasNotified) {
        console.log("in noti");
        api.error({
            message: reminderData.title,
            description: reminderData.description,
            placement: "topRight",
            duration: 0, // not auto close
            btn: (
                <Button type="link" size="small" className="text-blue-500">
                    <Link href="/public/school-owner">Show Details</Link>
                </Button>
            ),
            showProgress: true,
            onClose: () => setHasNotified(true),//set hasNotified when close
        });
        setHasNotified(true);//set hasNotified when open
    }

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 1.8, ease: "easeInOut"}}
            className="w-full min-h-[800px] relative"
        >
            {contextHolder}
            <div
                style={{
                    backgroundImage: `url(${background.src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
                className=" inset-0 flex items-center justify-center pt-60 pb-52">
                <div className="bg-white bg-opacity-70 p-8 md:p-20 rounded-2xl w-full max-w-2xl shadow-2xl">
                    <SchoolSearchForm/>
                </div>
            </div>

            <div className={'bg-gray-50 pb-20'}>
                <Testimonial/>
            </div>
            <Information/>
        </motion.div>
    );
}