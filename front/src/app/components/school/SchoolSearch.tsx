'use client'
import { Button, Col, Drawer, Input, message, Pagination, Row, Select, Space } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { debounce } from 'lodash';
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolSearchHelper from "@/app/components/school/SchoolSearchHelper";
import SchoolInfo from "@/app/components/school/SchoolInfo";
import { useGetDistrictsQuery, useGetProvincesQuery } from "@/redux/services/addressApi";
import { Page, SchoolSearchDTO, SchoolVO, useSearchByCriteriaQuery } from "@/redux/services/schoolApi";
import { FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import SchoolSearchSkeleton from "@/app/components/skeleton/SchoolSearchSkeleton";
import { ApiResponse } from "@/redux/services/config/baseQuery";
import { useRouter, useSearchParams } from "next/navigation";

// Define sorting options for the dropdown
const sortOptions = [
    { value: 'postedDate', label: 'Latest' },
    { value: 'rating', label: 'By Rating' },
    { value: 'fee', label: 'By Price' },
    { value: 'name', label: 'Alphabetically' },
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

    // State for managing search parameters and UI inputs
    const [searchParamsState, setSearchParamsState] = useState<SchoolSearchDTO>(initialParams);
    const [name, setName] = useState(initialParams.name || '');
    const [provinceName, setProvinceName] = useState(initialParams.province || '');
    const [districtName, setDistrictName] = useState(initialParams.district || '');
    const [open, setOpen] = useState(false); // Controls the filter drawer visibility
    // const [isParamsSynced, setIsParamsSynced] = useState(false); // Ensures query runs only after params are synced
    // Fetch search results using RTK Query, skipping until params are synced
    // const { data: searchResult = initialSearchResult, isLoading, isFetching, isError } =
    //     useSearchByCriteriaQuery(searchParamsState, {
    //         refetchOnMountOrArgChange: true,
    //         skip: isParamsSynced,
    //     });
    const [searchResult, setSearchResult] = useState(initialSearchResult);
    // const searchResult = initialSearchResult;
    useEffect(() => {
        // This ensures client-side updates after initial load
        if (initialSearchResult) {
            setSearchResult(initialSearchResult);
        }
    }, [initialSearchResult]);
    // console.log("isLoading: ", isLoading);
    // console.log("isFetching: ", isFetching);
    // Fetch provinces and districts for dropdowns
    const { data: provinces } = useGetProvincesQuery();
    const [provinceCode, setProvinceCode] = useState<number>(-1);
    const { data: districts } = useGetDistrictsQuery(provinceCode, { skip: provinceCode === -1 });

    // Sync searchParamsState with URL query parameters on mount or when searchParams change
    useEffect(() => {
        console.log("initialSearchResult: ", initialSearchResult);
        const params = new URLSearchParams(window.location.search);
        const newParams: SchoolSearchDTO = {
            ...searchParamsState,
            name: params.get('name') || undefined,
            province: params.get('province') || undefined,
            district: params.get('district') || undefined,
            type: params.get('type') ? Number(params.get('type')) : undefined,
            age: params.get('age') ? Number(params.get('age')) : undefined,
            minFee: params.get('minFee') ? Number(params.get('minFee')) : undefined,
            maxFee: params.get('maxFee') ? Number(params.get('maxFee')) : undefined,
            facilityIds: params.get('facilityIds') ? params.get('facilityIds')!.split(',').map(Number) : undefined,
            utilityIds: params.get('utilityIds') ? params.get('utilityIds')!.split(',').map(Number) : undefined,
            page: params.get('page') ? Number(params.get('page')) - 1 : 0,
            size: params.get('size') ? Number(params.get('size')) : 10,
            sortBy: params.get('sortBy') || 'postedDate',
        };
        setSearchParamsState(newParams);
        setName(newParams.name || '');
        setProvinceName(newParams.province || '');
        setDistrictName(newParams.district || '');
        // setIsParamsSynced(true); // Mark params as synced to trigger the query
    }, [searchParams]);

    // Update the URL with the current search parameters
    const updateURL = (params: SchoolSearchDTO) => {
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

        const newUrl = `?${urlParams.toString()}`;
        window.history.pushState({}, '', newUrl);
        router.replace(newUrl, { scroll: false });
    };

    // Debounced version of updateURL to prevent excessive URL updates
    const debouncedUpdateURL = debounce((params: SchoolSearchDTO) => {
        updateURL(params);
    }, 300);

    // Handle province selection and reset district
    const handleSelectProvince = (value: string) => {
        const selectedProvince = provinces?.find(p => p.name === value);
        const updatedParams = {
            ...searchParamsState,
            province: value || undefined,
            district: undefined,
            page: 0,
        };
        setProvinceName(value);
        setDistrictName('');
        setProvinceCode(selectedProvince ? selectedProvince.code : -1);
        setSearchParamsState(updatedParams);
        updateURL(updatedParams);
    };

    // Handle district selection
    const handleSelectDistrict = (value: string) => {
        const updatedParams = {
            ...searchParamsState,
            district: value || undefined,
            page: 0,
        };
        setDistrictName(value);
        setSearchParamsState(updatedParams);
        updateURL(updatedParams);
    };

    // Handle search by school name
    const handleSearch = () => {
        const updatedParams = {
            ...searchParamsState,
            name: name.trim() || undefined,
            page: 0,
        };
        setSearchParamsState(updatedParams);
        updateURL(updatedParams);
    };

    // Handle pagination changes
    const handlePageChange = (page: number) => {
        const updatedParams = { ...searchParamsState, page: page - 1 };
        setSearchParamsState(updatedParams);
        updateURL(updatedParams);
    };

    // Handle sorting changes
    const handleSortChange = (value: string) => {
        const updatedParams = { ...searchParamsState, sortBy: value, page: 0 };
        setSearchParamsState(updatedParams);
        updateURL(updatedParams);
    };

    // Apply filters from SchoolSearchHelper
    const applyFiltersAction = useCallback((filters: SchoolSearchDTO) => {
        const updatedParams = { ...searchParamsState, ...filters, page: 0 };
        setSearchParamsState(updatedParams);
        updateURL(updatedParams);
    }, [searchParamsState]);

    // Prepare options for province and district dropdowns
    const provinceOptions = provinces?.map((province) => ({
        value: province.name,
        label: province.name,
    })) || [];

    const districtOptions = districts?.map((district) => ({
        value: district.name,
        label: district.name,
    })) || [];

    // Handle error state
    // if (isError) {
    //     message.error('Failed to load school list');
    //     return <div>Error loading schools</div>;
    // }

    return (
        <div className="pt-24 px-3 md:px-10">
            {/* Search input and filters */}
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
                        icon={<MagnifyingGlassIcon className="h-4 w-4" />}
                        onClick={handleSearch}
                        // loading={isLoading}
                    >
                        <span className="hidden md:inline">Search</span>
                    </Button>
                </Space.Compact>
            </div>

            {/* Breadcrumb navigation */}
            <MyBreadcrumb
                paths={[
                    { label: "Home", href: "/public" },
                    { label: "School Search" },
                ]}
            />

            {/* Display search result summary */}
            <p className="text-center">
                {searchResult?.data?.page.totalElements
                    ? `Found ${searchResult.data.page.totalElements} matching schools`
                    : 'No schools found matching your criteria'}
            </p>

            {/* Filter button and sort dropdown */}
            <div className="flex justify-between lg:block">
                <Button
                    className="lg:hidden"
                    type="primary"
                    onClick={() => setOpen(true)}
                    icon={<FunnelIcon className="h-4 w-4" />}
                >
                    Filter
                </Button>

                <div className="text-right mb-4">
                    <Select
                        value={searchParamsState.sortBy}
                        style={{ width: 120 }}
                        options={sortOptions}
                        onChange={handleSortChange}
                    />
                </div>
            </div>

            {/* Filter drawer for mobile view */}
            <Drawer
                title="Filters"
                placement="left"
                onClose={() => setOpen(false)}
                open={open}
                width={300}
            >
                <SchoolSearchHelper searchParams={searchParamsState} onApplyFiltersAction={applyFiltersAction} />
            </Drawer>

            {/* Main layout with filters and school list */}
            <Row gutter={32}>
                <Col className="hidden lg:block" lg={4}>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <SchoolSearchHelper searchParams={searchParamsState} onApplyFiltersAction={applyFiltersAction} />
                    </div>
                </Col>

                <Col xs={24} lg={20}>
                    {!searchResult  ? (
                        <SchoolSearchSkeleton />
                    ) : (
                        <>
                            {/* Render school list */}
                            {searchResult?.data?.content?.map((school) => (
                                <div
                                    key={school.id}
                                    className="w-full p-5 border rounded mb-4 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <SchoolInfo school={school} />
                                </div>
                            ))}

                            {/* Pagination for search results */}
                            {searchResult?.data?.page.totalElements && searchResult?.data?.page.totalElements > 0 && (
                                <div className="mt-6 text-center">
                                    <Pagination
                                        current={searchParamsState.page + 1}
                                        pageSize={searchParamsState.size}
                                        total={searchResult.data.page.totalElements}
                                        onChange={handlePageChange}
                                        showSizeChanger
                                        pageSizeOptions={['10', '20', '50']}
                                        align={'center'}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </Col>
            </Row>
        </div>
    );
}