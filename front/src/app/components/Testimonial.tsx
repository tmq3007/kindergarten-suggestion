import Title from "antd/lib/typography/Title";
import {nunito} from "@/lib/fonts";
import {motion} from "framer-motion";
import Card from "antd/es/card/Card";
import Avatar from "antd/es/avatar/Avatar";
import {AntDesignOutlined} from "@ant-design/icons";
import {Rate} from "antd";

export default function Testimonial() {
    return (
        <>
            <Title className={`${nunito.className} text-center pt-10`}>Our testimonials</Title>
            <div className="w-full flex flex-wrap justify-center gap-6 mt-10">
                {[...Array(4)].map((_, index) => (
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
                                    className="mb-4"
                                />
                                <div className={'flex flex-col w-5/6 ml-5'}>
                                    <div className={'flex justify-between'}>
                                        <p className={`${nunito.className} text-xl font-bold`}>Will Kenny</p>
                                        <Rate disabled defaultValue={2}/>
                                    </div>
                                    <p className={'text-left mt-2'}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                                        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                                        nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                                        fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                                        culpa qui officia deserunt mollit anim id est laborum.</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </>
    )
}