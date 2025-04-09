import Image from "next/image";
import image from '@public/school3.jpg'
import {Badge, Button, Col, Rate, Row} from "antd";
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
import {FACILITY_OPTIONS, SCHOOL_TYPE_OPTIONS, UTILITY_OPTIONS} from "@/lib/constants";
import {ParentInSchoolDetailVO} from "@/redux/services/parentApi";

interface AgeMapping {
    [key: number]: string;
}

const ageMapping: AgeMapping = {
    0: "From 6 months to 1 year",
    1: "From 1 to 3 years",
    2: "From 3 to 6 years",
};
interface ParentSchoolInfoProps {
    pis: ParentInSchoolDetailVO;
    isCurrent: boolean;
    onCloseModalAction: () => void;
    onOpenModalAction: (schoolId: number, schoolName: string, isUpdate: boolean) => void;
}

export default function ParentSchoolInfo({
                                             pis,
                                             isCurrent,
                                             onCloseModalAction,
                                             onOpenModalAction,
                                         }: ParentSchoolInfoProps) {

    const getFacilityLabel = (fid: number | { fid: number }) => {
        const id = typeof fid === 'number' ? fid : fid.fid;
        return FACILITY_OPTIONS.find(option => option.value === id.toString())?.label || "Unknown";
    };

    const getUtilityLabel = (uid: number | { uid: number }) => {
        const id = typeof uid === 'number' ? uid : uid.uid;
        return UTILITY_OPTIONS.find(option => option.value === id.toString())?.label || "Unknown";
    };

    return (

        <div
            className="grid grid-cols-1 lg:grid-cols-6 items-start border-2 border-blue-300 rounded-lg shadow-md p-2 mt-10 bg-gray-50">
            {/*School Section*/}
            <div
                className={'col-span-5 border-2 bg-white rounded-lg border-blue-300 shadow-md p-4 h-full flex flex-col md:flex-row'}>
                <div className={'h-full w-full md:w-1/2 lg:w-1/3'}>
                    <Image
                        src={pis.school.imageList?.[0] ? pis.school.imageList?.[0].url : image}
                        alt={'School Image'}
                        className={'object-cover rounded !h-[300px]'}
                        width={500}
                        height={300}
                    />
                    <div className={'mt-2'}>
                        <Rate allowHalf disabled value={pis.averageSchoolRating}/>
                        <span
                            className={'ml-2'}>{`${pis.averageSchoolRating}/5 (${pis.totalSchoolReview} ratings)`}</span>
                    </div>

                </div>
                <div className={'h-full w-full md:w-1/2 lg:w-2/3 md:pl-5'}>
                    <Link
                        className={'text-3xl text-custom-600 underline hover:underline block mb-3'}
                        href={'/'}>
                        {pis.school.name}
                    </Link>
                    <Row gutter={16} className={'mt-2'}>
                        <Col className="gutter-row" md={10} lg={6}>
                            <div className={'flex'}>
                                <MapPinIcon className={'h-4 w-4 mt-0.5 mr-1'}/>
                                <span>Address:</span>
                            </div>
                        </Col>
                        <Col className="gutter-row" md={12} lg={16}>
                            {`${pis.school.street}, ${pis.school.ward}, ${pis.school.district}, ${pis.school.province}`}
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
                            {pis.school.website}
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
                            {`From ${pis.school.feeFrom?.toLocaleString('vi-VN')} VND/month`}
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
                            {ageMapping[pis.school.receivingAge]}
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
                            {SCHOOL_TYPE_OPTIONS.find(option => option.value === pis.school.schoolType.toString())?.label || pis.school.schoolType}
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
                            {pis.school.facilities?.map((facility: number | { fid: number }) => (
                                <span
                                    className={'bg-custom-300 rounded mr-2 px-2 py-1 text-white'}
                                    key={typeof facility === 'number' ? facility : facility.fid}
                                >
                             {getFacilityLabel(facility)}
                            </span>
                            ))}

                            {/* Utilities */}
                            {pis.school.utilities?.map((utility: number | { uid: number }) => (
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
            {/*Rate Section*/}
            <div className={'col-span-1 border-2 border-blue-300 bg-white rounded-lg shadow-md ml-2 p-4 h-full'}>
                {/*Case 1: You haven't rated the school yet and status is Active*/}
                {(isCurrent && pis.providedRating === null) && (
                    <div className={'flex flex-col items-center justify-center h-full'}>
                        <span className={'text-lg font-bold text-custom-600'}>You haven't rated the school yet. Please share with us your feedback.</span>
                        {/*Rate Button*/}
                        <Button
                            key={pis.school.id}
                            type="primary"
                            onClick={() => onOpenModalAction(pis.school.id, pis.school.name, false)}
                            className="text-lg px-6 py-2 h-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-none shadow-lg"
                            size="large"
                        >
                            Rate
                        </Button>
                    </div>)}

                {/*Case 2: You rated the school yet and status is Active*/}
                {(isCurrent && pis.providedRating !== null) && (
                    <div className={'flex flex-col items-center justify-center h-full'}>
                        <span className={'text-lg font-bold text-custom-600'}>Your Average Rating:</span>
                        <span className={'ml-2'}>{`${pis.providedRating}/5`}</span>
                        <Rate allowHalf disabled value={pis.providedRating}/>

                        <Button
                            key={pis.school.id}
                            type="primary"
                            onClick={() => onOpenModalAction(pis.school.id, pis.school.name, true)}
                            className="text-lg px-6 py-2 h-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-none shadow-lg"
                            size="large"
                        >
                            Update
                        </Button>
                    </div>)}

                {/*Case 3: You haven't rated the x`school yet and status is Inactive*/}
                {(!isCurrent && pis.providedRating === null && !pis.hasEditCommentPermission ) && (
                    <div className={'flex flex-col items-center justify-center h-full'}>
                        <span className={'text-lg font-bold text-custom-600'}>There's no rating of yours for this school. You can only rate the school you're currently enrolled in.</span>
                    </div>)}

                {/*Case 4: You rated the school yet and status is Inactive*/}
                {(!isCurrent && pis.providedRating !== null && pis.hasEditCommentPermission) && (
                    <div className={'flex flex-col items-center justify-center h-full'}>
                        <span className={'text-lg font-bold text-custom-600'}>Your Average Rating:</span>
                        <span className={'ml-2'}>{`${pis.providedRating}/5`}</span>
                        <Rate allowHalf disabled value={pis.providedRating}/>
                        <Button htmlType="button"
                                className={'mt-7 w-1/2 p-4 font-bold whitespace-normal text-xs bg-white-600 hover:!bg-custom-700 text-custom-600 hover:!text-white hover:!border-white hover:!shadow-none border-2 border-custom-700 shadow-md'}>
                            View Rating Details
                        </Button>

                    </div>)}
            </div>
        </div>
    )
}