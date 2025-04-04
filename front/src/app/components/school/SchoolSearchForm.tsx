import React, {useState} from 'react';
import {Button, FormProps, Input, Select} from 'antd';
import Search, {SearchProps} from "antd/es/input/Search";
import Title from "antd/lib/typography/Title";
import {nunito} from "@/lib/fonts";
import Compact from "antd/es/space/Compact";
import {useGetDistrictsQuery, useGetProvincesQuery} from "@/redux/services/addressApi";
import {useRouter} from "next/navigation";

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
    const {data: provinces} = useGetProvincesQuery();
    const [provinceCode, setProvinceCode] = useState<number>(-1);
    const {data: districts} = useGetDistrictsQuery(provinceCode, {skip: provinceCode === -1});
    const [schoolName, setSchoolName] = useState('');
    const [districtName, setDistrictName] = useState('');
    const router = useRouter();

    const handleProvinceSelect = (value: string) => {
        const selectedProvince = provinces?.find((p) => p.name === value);
        setProvinceCode(selectedProvince ? selectedProvince.code : -1);
    };

    const handleDistrictSelect = (value: string) => {
        setDistrictName(value);
    };

    const handleSchoolNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSchoolName(e.target.value);
    };

    const handleSearch = () => {
        const queryParams = new URLSearchParams({
            page: "1",
            size: "10",
            sortBy: "postedDate",
            sortDirection: "Descending",
        });

        if (schoolName) queryParams.append("name", schoolName);
        if (provinceCode !== -1) {
            const province = provinces?.find((p) => p.code === provinceCode);
            if (province) queryParams.append("province", province.name);
        }
        if (districtName) queryParams.append("district", districtName);

        router.push(`/public/search-school?${queryParams.toString()}`);
    };

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
        <div>
            <Title className={`${nunito.className} !font-bold text-center`}>Find the ideal school</Title>
            <label
                className={'block text-center text-xl my-3'}
                htmlFor={'name-search'}>Search by school name</label>
            <Compact className="w-full flex">
                <Input
                    placeholder="Enter a school name"
                    value={schoolName}
                    onChange={handleSchoolNameChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearch();
                        }
                    }}
                />
                <Button
                    className="w-1/6 h-[42px] bg-custom text-[16px] text-white rounded-lg"
                    onClick={handleSearch}
                >
                    Search
                </Button>
            </Compact>
            <div className={`${nunito.className} text-center text-2xl font-bold mt-6`}>OR</div>
            <label
                className={'block text-center text-xl my-3'}
                htmlFor={'local-search'}>Browse by location</label>

            <Compact className="w-full flex">
                <Select
                    defaultValue="City/Province"
                    className="w-1/2 h-[42px]"
                    options={provinceOptions}
                    onSelect={handleProvinceSelect}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                    }}
                />
                <Select
                    defaultValue="District"
                    className="w-1/2 h-[42px]"
                    options={districtOptions}
                    disabled={provinceCode === -1}
                    onSelect={handleDistrictSelect}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                    }}
                />
                <Button
                    className="w-1/6 h-[42px] bg-custom text-[16px] text-white rounded-lg"
                    onClick={handleSearch}
                >
                    Search
                </Button>
            </Compact>


            <p className={'italic mt-10'}>NOTE: The inclusion of a school in this search does NOT constitute an
                endorsement of the school and
                should NOT be used to infer the accreditation status of the school.</p>
        </div>
    );
}

