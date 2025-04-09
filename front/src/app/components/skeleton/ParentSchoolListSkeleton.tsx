import React from "react";
import {Button, Col, Form, Rate, Row, Skeleton} from "antd";
import MyEditor from "@/app/components/common/MyEditor";
import Image from "next/image";
import image from "@public/school3.jpg";
import Link from "next/link";
import {
    BuildingLibraryIcon,
    CurrencyDollarIcon,
    GlobeAmericasIcon, LightBulbIcon,
    MapPinIcon,
    UserCircleIcon
} from "@heroicons/react/16/solid";
import {SCHOOL_TYPE_OPTIONS} from "@/lib/constants";


const ParentSchoolListSkeleton: React.FC = () => {
    return (
        <div
            className="grid grid-cols-1 lg:grid-cols-6 items-start border-2 rounded-lg shadow-md p-2 mt-10 bg-custom-700">
            {/*School Section*/}
            <div
                className={'col-span-5 border-2 bg-white rounded-lg shadow-md p-4 h-full flex flex-col md:flex-row'}>
                <div className={'h-full w-full md:w-1/2 lg:w-1/3'}>
                    <Skeleton.Image/>
                    <Skeleton.Input active className={'!w-full'}/>
                </div>
                <div className={'h-full w-full md:w-1/2 lg:w-2/3 md:pl-5'}>
                    <Skeleton.Input active className={'!w-full'}/>
                    <Row gutter={16} className={'mt-2'}>
                        <Col className="gutter-row" md={10} lg={6}>
                            <Skeleton.Input active className={'!w-full'}/>
                        </Col>
                        <Col className="gutter-row" md={12} lg={16}>
                            <Skeleton.Input active className={'!w-full'}/>
                        </Col>
                    </Row>

                    <Row gutter={16} className={'mt-2'}>
                        <Col className="gutter-row" md={10} lg={6}>
                            <Skeleton.Input active className={'!w-full'}/>
                        </Col>
                        <Col className="gutter-row break-all" md={12} lg={16}>
                            <Skeleton.Input active className={'!w-full'}/>
                        </Col>
                    </Row>

                    <Row gutter={16} className={'mt-2'}>
                        <Col className="gutter-row" md={10} lg={6}>
                            <Skeleton.Input active className={'!w-full'}/>
                        </Col>
                        <Col className="gutter-row" md={12} lg={16}>
                            <Skeleton.Input active className={'!w-full'}/>
                        </Col>
                    </Row>

                    <Row gutter={16} className={'mt-2'}>
                        <Col className="gutter-row" md={10} lg={6}>
                            <Skeleton.Input active className={'!w-full'}/>
                        </Col>
                        <Col className="gutter-row" md={12} lg={16}>
                            <Skeleton.Input active className={'!w-full'}/>
                        </Col>
                    </Row>

                    <Row gutter={16} className={'mt-2'}>
                        <Col className="gutter-row" md={10} lg={6}>
                            <Skeleton.Input active className={'!w-full'}/>
                        </Col>
                        <Col className="gutter-row" md={12} lg={16}>
                            <Skeleton.Input active className={'!w-full'}/>                        </Col>
                    </Row>

                    <Row gutter={16} className={'mt-2'}>
                        <Col className="gutter-row" md={10} lg={6}>
                            <Skeleton.Input active className={'!w-full'}/>

                        </Col>
                    </Row>
                </div>
            </div>
            {/*Rate Section*/}
            <div className={'col-span-1 border-2 bg-white rounded-lg shadow-md ml-2 p-4 h-full'}>
            </div>
        </div>
    );
}

export default ParentSchoolListSkeleton;