import React from 'react';
import {Skeleton, Typography, Upload} from 'antd';
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import {lato} from "@/lib/fonts";
import {motion} from "framer-motion";


const {Title} = Typography;




const ProfileSidebarSkeleton: React.FC = () => {
   return (
       <div className="h-full p-6 rounded-xl flex flex-col items-center space-y-6">
           <div className="w-full">
               <MyBreadcrumb paths={[
                   {label: 'Home', href: '/public'},
                   {label: 'My Profile'}
               ]}/>
           </div>


           <motion.h1
               initial={{ color: "#019376" }}
               animate={{ color: ["#3f51b5", "#019376"] }}
               transition={{ duration: 3, repeat: Infinity }}
               className={`text-lg mt-0 !font-bold ${lato.className}`}
           >
               My Profile
           </motion.h1>


           <div className="flex flex-col items-center space-y-3">
               <Upload
                   showUploadList={false}
                   beforeUpload={() => false}
                   className="text-center"
               >
                   <Skeleton.Avatar active={true}
                                    size={150}
                                    className="cursor-pointer border-4 border-white mx-auto"
                   />
               </Upload>
           </div>


           <div className="text-center space-y-2 w-full max-w-xs">
               <Title level={2}>
                   <Skeleton.Input active={true} className={'!w-4/5'}/>
               </Title>
           </div>


           <div className="w-full text-left max-w-xs flex flex-col items-start space-y-4">
               <Skeleton.Input active={true} className={'!w-full'}/>
               <Skeleton.Input active={true} className={'!w-full'}/>
               <Skeleton.Input active={true} className={'!w-full'}/>
           </div>
       </div>
   );
};


export default ProfileSidebarSkeleton;



