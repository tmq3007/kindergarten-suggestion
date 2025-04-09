import Image from "next/image";
import image from '@public/school3.jpg'
import {Badge, Col, Rate, Row} from "antd";
import Link from "next/link";
import React from "react";
import {
    BuildingLibraryIcon,
    CurrencyDollarIcon,
    GlobeAmericasIcon,
    LightBulbIcon,
    MapPinIcon,
    UserCircleIcon
} from "@heroicons/react/16/solid";
import {SchoolVO} from "@/redux/services/schoolApi";
import {FACILITY_OPTIONS, SCHOOL_TYPE_OPTIONS, UTILITY_OPTIONS} from "@/lib/constants";

interface AgeMapping {
    [key: number]: string;
}

const ageMapping: AgeMapping = {
    0: "From 6 months to 1 year",
    1: "From 1 to 3 years",
    2: "From 3 to 6 years",
};


export default function SchoolInfo({school}: { school: SchoolVO }) {

    const getFacilityLabel = (fid: number | { fid: number }) => {
        const id = typeof fid === 'number' ? fid : fid.fid;
        return FACILITY_OPTIONS.find(option => option.value === id.toString())?.label || "Unknown";
    };

    const getUtilityLabel = (uid: number | { uid: number }) => {
        const id = typeof uid === 'number' ? uid : uid.uid;
        return UTILITY_OPTIONS.find(option => option.value === id.toString())?.label || "Unknown";
    };

    return (
        <div className={'h-full flex flex-col md:flex-row'}>
            <div className={'h-full w-full md:w-1/2 lg:w-1/3'}>
                <Image
                    src={school.imageList?.[0] ? school.imageList?.[0].url : image}
                    alt={'School Image'}
                    className={'object-cover rounded !h-[300px]'}
                    width={500}
                    height={300}
                />
                <div className={'mt-2'}>
                    <Rate allowHalf disabled value={school.rating}/>
                    <span className={'ml-2'}>{`${school.rating}/5`}</span>
                </div>

            </div>
            <div className={'h-full w-full md:w-1/2 lg:w-2/3 md:pl-5'}>
                <Link
                    className={'text-3xl text-custom-600 underline hover:underline block mb-3'}
                    href={`/public/school-detail/${school.id}`}>
                    {school.name}
                </Link>
                <Row gutter={16} className={'mt-2'}>
                    <Col className="gutter-row" md={10} lg={6}>
                        <div className={'flex'}>
                            <MapPinIcon className={'h-4 w-4 mt-0.5 mr-1'}/>
                            <span>Address:</span>
                        </div>
                    </Col>
                    <Col className="gutter-row" md={12} lg={16}>
                        {`${school.street}, ${school.ward}, ${school.district}, ${school.province}`}
                    </Col>
                </Row>

                <Row gutter={16} className={'mt-2'}>
                    <Col className="gutter-row" md={10} lg={6}>
                        <div className={'flex'}>
                            <div className={'flex'}>
                                <GlobeAmericasIcon className={'h-4 w-4 mt-0.5 mr-1'}/>
                                <span>Website:</span>
                            </div>
                        </div>
                    </Col>
                    <Col className="gutter-row break-all" md={12} lg={16}>
                        <Link className={'underline'} href={school.website}>{school.website}</Link>
                    </Col>
                </Row>

                <Row gutter={16} className={'mt-2'}>
                    <Col className="gutter-row" md={10} lg={6}>
                        <div className={'flex'}>
                            <div className={'flex'}>
                                <CurrencyDollarIcon className={'h-4 w-4 mt-0.5 mr-1'}/>
                                <span>Tuition fee:</span>
                            </div>
                        </div>
                    </Col>
                    <Col className="gutter-row" md={12} lg={16}>
                        {`From ${school.feeFrom?.toLocaleString('vi-VN')} VND/month`}
                    </Col>
                </Row>

                <Row gutter={16} className={'mt-2'}>
                    <Col className="gutter-row" md={10} lg={6}>
                        <div className={'flex'}>
                            <div className={'flex'}>
                                <UserCircleIcon className={'h-4 w-4 mt-0.5 mr-1'}/>
                                <span>Admission age:</span>
                            </div>
                        </div>
                    </Col>
                    <Col className="gutter-row" md={12} lg={16}>
                        {ageMapping[school.receivingAge]}
                    </Col>
                </Row>

                <Row gutter={16} className={'mt-2'}>
                    <Col className="gutter-row" md={10} lg={6}>
                        <div className={'flex'}>
                            <div className={'flex'}>
                                <BuildingLibraryIcon className={'h-4 w-4 mt-0.5 mr-1'}/>
                                <span>School type:</span>
                            </div>
                        </div>
                    </Col>
                    <Col className="gutter-row" md={12} lg={16}>
                        {SCHOOL_TYPE_OPTIONS.find(option => option.value === school.schoolType.toString())?.label || school.schoolType}
                    </Col>
                </Row>

                <Row gutter={16} className={'mt-2'}>
                    <Col className="gutter-row" md={10} lg={6}>
                        <div className={'flex'}>
                            <div className={'flex'}>
                                <LightBulbIcon className={'h-4 w-4 mt-0.5 mr-1'}/>
                                <span>Facilities and Utilities:</span>
                            </div>
                        </div>

                    </Col>
                    <Col className="flex flex-wrap gap-2" md={12} lg={16}>
                        {/* Facilities */}
                        {school.facilities?.map((facility: number | { fid: number }) => (
                            <span
                                className={'bg-custom-300 rounded mr-2 px-2 py-1 text-white'}
                                key={typeof facility === 'number' ? facility : facility.fid}
                            >
                             {getFacilityLabel(facility)}
                            </span>
                        ))}

                        {/* Utilities */}
                        {school.utilities?.map((utility: number | { uid: number }) => (
                            <span
                                className={'bg-custom-300 rounded mr-2 px-2 py-1 text-white'}
                                key={typeof utility === 'number' ? utility : utility.uid}
                            >
                             {getUtilityLabel(utility)}
                            </span>
                        ))}
                    </Col>
                </Row>
            </div>
        </div>
    )
}