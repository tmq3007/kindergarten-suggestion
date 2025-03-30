'use client'
import {Button, Col, Drawer, Empty, Input, Pagination, Row, Select, Space} from "antd";
import React, {useCallback, useEffect, useState} from "react";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolSearchHelper from "@/app/components/school/SchoolSearchHelper";
import SchoolInfo from "@/app/components/school/SchoolInfo";
import {useGetDistrictsQuery, useGetProvincesQuery} from "@/redux/services/addressApi";
import {Page, SchoolSearchDTO, SchoolVO} from "@/redux/services/schoolApi";
import {FunnelIcon, MagnifyingGlassIcon} from "@heroicons/react/16/solid";
import SchoolSearchSkeleton from "@/app/components/skeleton/SchoolSearchSkeleton";
import {ApiResponse} from "@/redux/services/config/baseQuery";
import {useRouter, useSearchParams} from "next/navigation";

const sortOptions = [
    {value: 'postedDate', label: 'Latest'},
    {value: 'rating', label: 'By Rating'},
    {value: 'fee', label: 'By Price'},
    {value: 'name', label: 'Alphabetically'},
];

export default function SchoolSearch({
                                         initialSearchResult,
                                         initialParams,
                                     }: {
    initialSearchResult: ApiResponse<Page<SchoolVO>>;
    initialParams: SchoolSearchDTO;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    const [searchParamsState, setSearchParamsState] = useState<SchoolSearchDTO>(initialParams);
    const [name, setName] = useState(initialParams.name || '');
    const [provinceName, setProvinceName] = useState(initialParams.province || '');
    const [districtName, setDistrictName] = useState(initialParams.district || '');
    const [open, setOpen] = useState(false);

    const {data: provinces} = useGetProvincesQuery();
    const [provinceCode, setProvinceCode] = useState<number>(-1);
    const {data: districts} = useGetDistrictsQuery(provinceCode, {skip: provinceCode === -1});

    // Update URL when searchParamsState changes
    useEffect(() => {
        const updateURL = (params: SchoolSearchDTO) => {
            setIsLoading(true);
            const urlParams = new URLSearchParams();

            if (params.name) urlParams.set('name', params.name);
            if (params.province) urlParams.set('province', params.province);
            if (params.district) urlParams.set('district', params.district);
            if (params.type) urlParams.set('type', params.type.toString());
            if (params.age) urlParams.set('age', params.age.toString());
            if (params.minFee) urlParams.set('minFee', params.minFee.toString());
            if (params.maxFee) urlParams.set('maxFee', params.maxFee.toString());
            if (params.facilityIds?.length) urlParams.set('facilityIds', params.facilityIds.join(','));
            if (params.utilityIds?.length) urlParams.set('utilityIds', params.utilityIds.join(','));
            urlParams.set('page', (params.page + 1).toString());
            urlParams.set('size', params.size.toString());
            urlParams.set('sortBy', params.sortBy);

            router.replace(`?${urlParams.toString()}`, {scroll: false});
        };

        updateURL(searchParamsState);
    }, [searchParamsState, router]);

    // Reset loading state after navigation completes
    useEffect(() => {
        setIsLoading(false);
    }, [searchParams]);

    const handleSelectProvince = (value: string) => {
        const selectedProvince = provinces?.find(p => p.name === value);
        setSearchParamsState(prev => ({
            ...prev,
            province: value || undefined,
            district: undefined,
            page: 0,
        }));
        setProvinceName(value);
        setDistrictName('');
        setProvinceCode(selectedProvince ? selectedProvince.code : -1);
    };

    const handleSelectDistrict = (value: string) => {
        setSearchParamsState(prev => ({
            ...prev,
            district: value || undefined,
            page: 0,
        }));
        setDistrictName(value);
    };

    const handleSearch = () => {
        setSearchParamsState(prev => ({
            ...prev,
            name: name.trim() || undefined,
            page: 0,
        }));
    };

    const handlePageChange = (page: number) => {
        setSearchParamsState(prev => ({
            ...prev,
            page: page - 1,
        }));
    };

    const handleSortChange = (value: string) => {
        setSearchParamsState(prev => ({
            ...prev,
            sortBy: value,
            page: 0,
        }));
    };

    const applyFiltersAction = useCallback((filters: SchoolSearchDTO) => {
        setSearchParamsState(prev => ({
            ...prev,
            ...filters,
            page: 0,
        }));
        setOpen(false);
    }, []);

    const provinceOptions = provinces?.map((province) => ({
        value: province.name,
        label: province.name,
    })) || [];

    const districtOptions = districts?.map((district) => ({
        value: district.name,
        label: district.name,
    })) || [];

    return (
        <div className="pt-24 px-3 md:px-10">
            <div className="mb-3">
                <Space.Compact className="w-full md:w-[70%] mx-auto flex">
                    <Input
                        placeholder="Enter school name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onPressEnter={handleSearch}
                    />
                    <Select
                        value={provinceName || 'Province/City'}
                        className="w-1/2 h-[42px]"
                        options={provinceOptions}
                        onSelect={handleSelectProvince}
                        allowClear
                        onClear={() => handleSelectProvince('')}
                    />
                    <Select
                        value={districtName || 'District'}
                        className="w-1/2 h-[42px] bg-white"
                        options={districtOptions}
                        disabled={provinceCode === -1}
                        onSelect={handleSelectDistrict}
                        allowClear
                        onClear={() => handleSelectDistrict('')}
                    />
                    <Button
                        className="w-1/6 h-[42px] bg-custom hover:!bg-custom-700 text-white hover:!text-white rounded-lg"
                        icon={<MagnifyingGlassIcon className="h-4 w-4"/>}
                        onClick={handleSearch}
                    >
                        <span className="hidden md:inline">Search</span>
                    </Button>
                </Space.Compact>
            </div>

            <MyBreadcrumb
                paths={[
                    {label: "Home", href: "/public"},
                    {label: "School Search"},
                ]}
            />

            {initialSearchResult?.data?.page.totalElements > 0 && (
                <p className="text-center">
                    Found {initialSearchResult.data.page.totalElements} matching schools
                </p>
            )}

            <div className="flex justify-between lg:block">
                <Button
                    className="lg:hidden"
                    type="primary"
                    onClick={() => setOpen(true)}
                    icon={<FunnelIcon className="h-4 w-4"/>}
                >
                    Filter
                </Button>

                <div className="text-right mb-4">
                    <Select
                        value={searchParamsState.sortBy}
                        style={{width: 120}}
                        options={sortOptions}
                        onChange={handleSortChange}
                    />
                </div>
            </div>

            <Drawer
                title="Filters"
                placement="left"
                onClose={() => setOpen(false)}
                open={open}
                width={300}
            >
                <SchoolSearchHelper
                    searchParams={searchParamsState}
                    onApplyFiltersAction={applyFiltersAction}
                />
            </Drawer>

            <Row gutter={32}>
                <Col className="hidden lg:block" lg={4}>
                    <div className="bg-gray-50 p-4 rounded-lg mb-5">
                        <SchoolSearchHelper
                            searchParams={searchParamsState}
                            onApplyFiltersAction={applyFiltersAction}
                        />
                    </div>
                </Col>

                <Col xs={24} lg={20}>
                    {isLoading ? (
                        <SchoolSearchSkeleton/>
                    ) : (
                        <>
                            {initialSearchResult?.data?.content?.length ? (
                                <>
                                    {initialSearchResult.data.content.map((school) => (
                                        <div
                                            key={school.id}
                                            className="w-full p-5 border rounded mb-4 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <SchoolInfo school={school}/>
                                        </div>
                                    ))}

                                    <div className="mt-6 text-center">
                                        <Pagination
                                            current={searchParamsState.page + 1}
                                            pageSize={searchParamsState.size}
                                            total={initialSearchResult.data.page.totalElements}
                                            onChange={handlePageChange}
                                            showSizeChanger
                                            pageSizeOptions={['10', '20', '50']}
                                            align="center"
                                            className={'mb-5'}
                                        />
                                    </div>
                                </>
                            ) : (
                                <Empty className="mt-10" description="No schools found"/>
                            )}
                        </>
                    )}
                </Col>

            </Row>
        </div>
    );
}