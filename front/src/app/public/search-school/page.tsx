'use client'
import Compact from "antd/es/space/Compact";
import {Button, Col, Input, Row, Select} from "antd";
import React, {useState} from "react";
import {useGetDistrictsQuery, useGetProvincesQuery} from "@/redux/services/addressApi";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolSearchHelper from "@/app/components/school/SchoolSearchHelper";

const sortOptions = [
    {value: '1', label: 'By Ratings'},
    {value: '2', label: 'By Price'},
    {value: '3', label: 'By ABC'},
];

const style: React.CSSProperties = {background: '#0092ff', padding: '8px 0'};

export default function SearchSchool() {

    const {data: provinces} = useGetProvincesQuery();
    const [provinceCode, setProvinceCode] = useState<number>(-1);
    const {data: districts} = useGetDistrictsQuery(provinceCode, {skip: provinceCode === -1});

    const handleSelect = (value: string) => {
        const selectedProvince = provinces?.find(p => p.name === value);
        setProvinceCode(selectedProvince ? selectedProvince.code : -1);
    }

    const provinceOptions = provinces?.map((province) => ({
        value: province.name,
        label: province.name,
    })) || [];

    const districtOptions = districts?.map((district) => ({
        value: district.name,
        label: district.name,
    })) || [];

    return (
        <div className={'pt-24 px-10'}>
            <div className={'mb-3'}>
                <Compact className="w-[70%] mx-auto flex">
                    <Input placeholder="Enter a school name"/>
                    <Select
                        defaultValue="City/Province"
                        className="w-1/2 h-[42px]"
                        options={provinceOptions}
                        onSelect={handleSelect}
                    />
                    <Select
                        defaultValue="District"
                        className="w-1/2 h-[42px] bg-white"
                        options={districtOptions}
                        disabled={provinceCode === -1}
                    />
                    <Button className="w-1/6 h-[42px] bg-custom text-[16px] text-white rounded-lg">Search</Button>
                </Compact>
            </div>

            <MyBreadcrumb
                paths={[
                    {label: "Home", href: "/public"},
                    {label: "Search for school"},
                ]}
            />

            <p className={'text-center'}>There are 2 schools that match your search criteria</p>

            {/*Sort criteria*/}
            <div className={'text-right'}>
                <Select
                    defaultValue="1"
                    style={{width: 120}}
                    options={sortOptions}
                />
            </div>

            {/*Main content*/}
            <Row gutter={16}>
                <Col className="gutter-row bg-custom-100" span={4}>
                    <SchoolSearchHelper/>
                </Col>
                <Col className="gutter-row" span={20}>
                    <div style={style}>col-6</div>
                </Col>
            </Row>
        </div>
    )

}