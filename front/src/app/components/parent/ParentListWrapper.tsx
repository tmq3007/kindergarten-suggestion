import React, { useEffect, useState} from 'react';
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SearchByComponent from "@/app/components/common/SearchByComponent";
import ParentList from "@/app/components/parent/ParentList";
import {Card} from "antd";

interface ParentListWraperProps {
    useQueryTrigger: any;
    searchOptions: {label: string, value: string}[];
    title?: string;
    isEnrollPage?: boolean;
}

const ParentListWrapper: React.FC<ParentListWraperProps> = ({useQueryTrigger, searchOptions,isEnrollPage=false,title=""}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSize, setCurrentPageSize] = useState(15);
    const [searchCriteria, setSearchCriteria] = useState({
        searchBy: searchOptions[0].value,
        keyword: undefined as string | undefined,
    });
    const {
        data,
        isLoading,
        isFetching,
        error
    } = useQueryTrigger({
        page: currentPage,
        size: currentPageSize,
        ...searchCriteria,
    });

    const fetchPage = (page: number, size: number) => {
        setCurrentPage(page);
        setCurrentPageSize(size);
    };

    const handleSearch = (criteria: { searchBy: string; keyword: string | undefined }) => {
        setSearchCriteria(criteria);
        setCurrentPage(1);
    };
  return (
      <Card
          title={
              <div className="flex flex-col md:flex-row items-start md:items-center text-wrap justify-between">
                  <SchoolManageTitle title={title}/>
                  <div
                      className="w-full md:w-auto flex flex-col md:flex-row items-end md:items-center gap-4">
                      <div className="w-full">
                          <SearchByComponent
                              onSearch={handleSearch}
                              options={searchOptions}
                              initialSearchBy={searchOptions[0].value}
                          />
                      </div>
                  </div>
              </div>
          }
      >
          <div className="mt-4">
              <ParentList
                  isEnrollPage={isEnrollPage}
                  fetchPage={fetchPage}
                  data={data}
                  error={error}
                  isLoading={isLoading}
                  isFetching={isFetching}
              />
          </div>
      </Card>
  );
};

export default ParentListWrapper;
