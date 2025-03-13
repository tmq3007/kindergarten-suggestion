import Title from "antd/lib/typography/Title";
import {nunito} from "@/lib/fonts";
import {motion} from "framer-motion";
import Card from "antd/es/card/Card";
import Avatar from "antd/es/avatar/Avatar";
import {AntDesignOutlined} from "@ant-design/icons";
import {Rate} from "antd";
import {useGetTop4ReviewsQuery} from "@/redux/services/reviewApi";
import _ from 'lodash';

export default function Testimonial() {
    const {data} = useGetTop4ReviewsQuery();
    const reviews = data?.data ?? [];
    return (
        <>
            <Title className={`${nunito.className} text-center pt-10`}>Our testimonials</Title>
            <div className="w-full flex flex-wrap justify-center gap-6 mt-10">
                {reviews.map((r, index) => {
                    const rateOptions = [
                        r.extracurricularActivities,
                        r.facilitiesAndUtilities,
                        r.hygieneAndNutrition,
                        r.learningProgram,
                        r.teacherAndStaff
                    ]
                    const rate = _.mean(rateOptions);
                    return (
                        <motion.div
                            key={index}
                            initial={{opacity: 0, x: index % 2 === 0 ? -100 : 100}}
                            whileInView={{opacity: 1, x: 0}}
                            transition={{duration: 0.8, delay: index * 0.25}}
                            viewport={{once: true}}
                            className="w-[100%] md:w-[45%]"
                        >
                            <Card>
                                <div className="flex"> {/* Căn giữa */}
                                    <Avatar
                                        size={{xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100}}
                                        icon={<AntDesignOutlined/>}
                                        src={r.parentImage}
                                        className="mb-4"
                                    />
                                    <div className={'flex flex-col w-5/6 ml-5'}>
                                        <div className={'flex justify-between'}>
                                            <p className={`${nunito.className} text-xl font-bold`}>{r.parentName}</p>
                                            <Rate disabled allowHalf value={rate}/>
                                        </div>
                                        <p className={'text-left mt-2'}>{r.feedback}</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
        </>
    )
}