import React from 'react';
import type {FormProps} from 'antd';
import Search, {SearchProps} from "antd/es/input/Search";
import Title from "antd/lib/typography/Title";
import {nunito} from "@/lib/fonts";

type FieldType = {
    username?: string;
    password?: string;
    remember?: string;
};



const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('Success:', values);
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
};

const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);

export default function SchoolSearchForm() {
    return (
        <div>
            <Title className={`${nunito.className} !font-bold text-center`}>Find the ideal school</Title>
            <label
                className={'block text-center text-xl my-3'}
                htmlFor={'name-search'}>Search by school name</label>
            <Search
                id={'name-search'}
                placeholder="Enter a school name"
                allowClear
                enterButton="Search"
                size="large"
                onSearch={onSearch}
            />
            <div className={`${nunito.className} text-center text-2xl font-bold my-3`}>OR</div>
            <label
                className={'block text-center text-xl my-3'}
                htmlFor={'local-search'}>Browse by location</label>
            <Search
                id={'local-search'}
                placeholder="Enter a school name"
                allowClear
                enterButton="Search"
                size="large"
                onSearch={onSearch}
            />
            <p className={'italic mt-6'}>NOTE: The inclusion of a school in this search does NOT constitute an endorsement of the school and
                should NOT be used to infer the accreditation status of the school.</p>


        </div>
    );
}

