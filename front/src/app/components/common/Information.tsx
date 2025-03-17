'use client'
import Title from "antd/lib/typography/Title";
import {nunito} from "@/lib/fonts";
import Card from "antd/es/card/Card";
import {motion} from "framer-motion"
import {
    AliwangwangOutlined,
    BulbOutlined,
    DiscordOutlined,
    GlobalOutlined,
    ReadOutlined,
    TeamOutlined
} from "@ant-design/icons";
import {Space} from "antd";

export default function Information() {
    return (
        <>
            <div className={'py-10 bg-custom'}>
                <Title className={`${nunito.className} text-center !text-white`}>About Us</Title>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 justify-center gap-7 p-4">
                    <div className="hidden lg:block lg:col-span-1"></div>
                    {/* Card 1 */}
                    <motion.div
                        initial={{opacity: 0, y: 50}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.2}}
                        viewport={{once: true}}
                        className="col-span-1"
                    >
                        <Card className={'md:h-[350px]'}>
                            <Space className={'flex justify-center text-xl'}>
                                <GlobalOutlined/>
                                <p className={'font-medium text-lg'}>Our School Networks</p>
                            </Space>
                            <div className={'text-center my-4'}>
                                <p>800 +</p>
                                <p>Preschools and Kindergarten</p>
                            </div>
                            <p className={'text-justify'}>Search for a preschool for your child based on basic criteria as: quality, reviews of
                                other
                                parents, location, tuition fees,...</p>
                        </Card>
                    </motion.div>
                    {/* Card 2 */}
                    <motion.div
                        initial={{opacity: 0, y: 50}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.4}}
                        viewport={{once: true}}
                        className="col-span-1"
                    >
                        <Card className={'md:h-[350px]'}>
                            <Space className={'flex justify-center text-xl'}>
                                <TeamOutlined/>
                                <p className={'font-medium text-lg'}>Parent Community</p>
                            </Space>
                            <div className={'text-center my-4'}>
                                <p>1500 +</p>
                                <p>School profiles of parents and kids</p>
                            </div>
                            <p className={'text-justify'}>Close connection with to parents through multiple channels including email, chat and
                                phone
                                calls. Get feedback from parents to provide a comprehensive view</p>
                        </Card>
                    </motion.div>
                    {/* Card 3 */}
                    <motion.div
                        initial={{opacity: 0, y: 50}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.6}}
                        viewport={{once: true}}
                        className="col-span-1"
                    >
                        <Card className={'md:h-[350px]'}>
                            <Space className={'flex justify-center text-xl'}>
                                <BulbOutlined/>
                                <p className={'font-medium text-lg'}>Special Consultations</p>
                            </Space>
                            <div className={'text-center my-4'}>
                                <p>30 +</p>
                                <p>Consultants with 5-10 years of experience in education</p>
                            </div>
                            <p className={'text-justify'}>Our consultant with deep knowledge on pre-school education will help parents to choose
                                the
                                right school for their children</p>
                        </Card>
                    </motion.div>
                    <div className="hidden lg:block lg:col-span-1"></div>
                </div>
            </div>
            <div className={'md:flex justify-between p-10'}>
                <div className={'w-full md:w-1/2 text-center'}>
                    <h1 className={`${nunito.className} text-center text-2xl font-bold uppercase`}>come visit</h1>
                    <p className={'uppercase w-full lg:w-1/2 m-auto mt-10'}>21th fl, education tower, bach mai ward, hai ba trung dist, hanoi</p>
                    <p>________________</p>
                </div>
                <div className={'w-full md:w-1/2 text-center'}>
                    <h1 className={`${nunito.className} text-center text-2xl font-bold uppercase mt-6 md:mt-0`}>our partners</h1>
                    <div className={'flex justify-evenly w-full lg:w-1/2 m-auto mt-10'}>
                        <div className={'flex flex-col items-center w-1/3'}>
                            <ReadOutlined className={'text-[30px] md:text-[30px]'}/>
                            Ministry of Education
                        </div>
                        <div className={'flex flex-col items-center w-1/3'}>
                            <AliwangwangOutlined className={'text-[30px] md:text-[30px]'}/>
                            Education News
                        </div>
                        <div className={'flex flex-col items-center w-1/3'}>
                            <DiscordOutlined className={'text-[30px] md:text-[30px]'}/>
                            Kids Center
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}