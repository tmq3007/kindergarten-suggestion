"use client";

import Link from "next/link";
import React, {useState, useCallback, useMemo} from "react";
import { Card, Modal, notification, Segmented, Tabs, Badge } from "antd";
import {
  useCountActiveSchoolsWithoutRefIdQuery, useCountAllDraftsQuery,
  useGetActiveSchoolsWithoutRefIdQuery, useGetAllDraftsQuery,
  useGetSchoolListQuery,
  useUpdateSchoolStatusByAdminMutation,
} from "@/redux/services/schoolApi";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SearchByComponent from "@/app/components/common/SearchByComponent";
import SchoolListForm from "@/app/components/school/SchoolListForm";
import MyEditor from "@/app/components/common/MyEditor";
import { SegmentedValue } from "antd/es/segmented";
import type { TabsProps } from 'antd';
import useIsMobile from "@/lib/hook/useIsMobile";
import { ClockCircleOutlined, FileTextOutlined, HomeOutlined } from "@ant-design/icons";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";

const searchOptions = [
  { value: "name", label: "School Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "district", label: "District" },

];


const TAB_KEYS = {
  ALL_SCHOOLS: "1",
  NEW_SCHOOL_REQUESTS: "2",
  CHANGE_REQUESTS: "3",
} as const;

export default function SchoolListPage() {
  const [activeTabKey, setActiveTabKey] = useState<string>(TAB_KEYS.ALL_SCHOOLS);
  const [modalVisible, setModalVisible] = useState(false);
  const [responseContent, setResponseContent] = useState<string>("");
  const [schoolId, setSchoolId] = useState<number>(0);
  const isMobile = useIsMobile();

  const [notificationApi, contextHolder] = notification.useNotification();
  const [updateSchoolStatusByAdmin, { isLoading: isUpdatingStatus }] = useUpdateSchoolStatusByAdminMutation();

  // Lấy số lượng từ API
  const { data: activeCountData } = useCountActiveSchoolsWithoutRefIdQuery();
  const { data: draftCountData } = useCountAllDraftsQuery();
  const activeCount = activeCountData?.data || 0;
  const draftCount = draftCountData?.data || 0;

  const handleTabChange = useCallback((value: SegmentedValue) => {
    setActiveTabKey(value.toString());
  }, []);

  const segmentOptions = useMemo(() => [
    {
      label: isMobile ? (
          <HomeOutlined className="text-xl" />
      ) : (
          <span className="font-bold text-lg flex items-center justify-center gap-2">
                    <HomeOutlined /> All Schools
                </span>
      ),
      value: TAB_KEYS.ALL_SCHOOLS,
    },
    {
      label: isMobile ? (
          <Badge count={activeCount} overflowCount={99} offset={[10, 0]}>
            <FileTextOutlined className="text-xl" />
          </Badge>
      ) : (
          <span className="font-bold text-lg flex items-center justify-center gap-2">
                    <FileTextOutlined /> New School Requests
                    <Badge count={activeCount} overflowCount={99} offset={[10, 0]} />
                </span>
      ),
      value: TAB_KEYS.NEW_SCHOOL_REQUESTS,
    },
    {
      label: isMobile ? (
          <Badge count={draftCount} overflowCount={99} offset={[10, 0]}>
            <ClockCircleOutlined className="text-xl" />
          </Badge>
      ) : (
          <span className="font-bold text-lg flex items-center justify-center gap-2">
                    <ClockCircleOutlined /> Change Requests
                    <Badge count={draftCount} overflowCount={99} offset={[10, 0]} />
                </span>
      ),
      value: TAB_KEYS.CHANGE_REQUESTS,
    },
  ], [isMobile, activeCount, draftCount]);

  const tabItems: TabsProps['items'] = [
    {
      key: TAB_KEYS.ALL_SCHOOLS,
      label: "All Schools",
      children: (
          <SchoolListWrapper
              title="All Schools"
              useQueryTrigger={useGetSchoolListQuery}
              searchOptions={searchOptions}
          />
      ),
    },
    {
      key: TAB_KEYS.NEW_SCHOOL_REQUESTS,
      label: "New School Requests",
      children: (
          <SchoolListWrapper
              title="New School Requests"
              useQueryTrigger={useGetActiveSchoolsWithoutRefIdQuery}
              searchOptions={searchOptions}
          />
      ),
    },
    {
      key: TAB_KEYS.CHANGE_REQUESTS,
      label: "Change Requests",
      children: (
          <SchoolListWrapper
              title="Change Requests"
              useQueryTrigger={useGetAllDraftsQuery}
              searchOptions={searchOptions}
          />
      ),
    },
  ];

  const openNotificationWithIcon = (type: "success" | "error", message: string, description: string) => {
    notificationApi[type]({
      message,
      description,
      placement: "topRight",
    });
  };

  const handleOpenModalDelete = (id: number) => {
    setModalVisible(true);
    setSchoolId(id);
  };

  const handleResponseChange = (response: string) => {
    setResponseContent(response);
  };

  const handleDelete = async () => {
    try {
      await updateSchoolStatusByAdmin({ schoolId, status: 6, response: responseContent }).unwrap();
      setModalVisible(false);
      openNotificationWithIcon(
          "success",
          "School deleted successfully!",
          "The school has been deleted successfully!"
      );
    } catch (error) {
      openNotificationWithIcon("error", "Error", "Failed to delete school.");
    }
  };

  return (
      <div>
        {contextHolder}
        <MyBreadcrumb
            paths={[
              { label: "School Management", href: "/admin/management/school/school-list" },
              { label: "School List" },
            ]}
        />
        <Card
            title={
              <Segmented
                  className="p-1"
                  options={segmentOptions}
                  value={activeTabKey}
                  onChange={handleTabChange}
                  block
              />
            }
        >
          <Tabs
              activeKey={activeTabKey}
              tabBarStyle={{ display: "none" }}
              size="large"
              destroyInactiveTabPane
              items={tabItems}
          />
        </Card>

        <Modal
            title={<p className="font-bold text-3xl text-start">{"Delete School"}</p>}
            open={modalVisible}
            onOk={handleDelete}
            onCancel={() => setModalVisible(false)}
            okText="Yes"
            cancelText="No, Take me back!"
            confirmLoading={isUpdatingStatus}
            getContainer={false}
        >
          <p className="text-lg text-start">
            {"Are you sure you want to delete this school? If yes, briefly describe the reason:"}
          </p>
          <MyEditor description={responseContent} onChange={handleResponseChange} />
        </Modal>
      </div>
  );
}
// Component wrapper mới để tái sử dụng logic hiển thị danh sách
interface SchoolListWrapperProps {
  useQueryTrigger: any;
  searchOptions: { label: string; value: string }[];
  title?: string;
}

const SchoolListWrapper: React.FC<SchoolListWrapperProps> = ({ useQueryTrigger, searchOptions, title = "" }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(15);
  const [searchCriteria, setSearchCriteria] = useState({
    searchBy: searchOptions[0].value,
    keyword: undefined as string | undefined,
  });

  const { data, isLoading, isFetching, error } = useQueryTrigger({
    page: currentPage,
    size: currentPageSize,
    [searchCriteria.searchBy]: searchCriteria.keyword || undefined,
  });

  const fetchPage = useCallback((page: number, size: number) => {
    setCurrentPage(page);
    setCurrentPageSize(size);
  }, []);

  const handleSearch = useCallback(
      (criteria: { searchBy: string; keyword: string | undefined }) => {
        setSearchCriteria(criteria);
        setCurrentPage(1);
      },
      []
  );

  return (
      <Card
          title={
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <SchoolManageTitle title={title} />
              <div className="w-full md:w-auto flex flex-col md:flex-row items-end md:items-center gap-4">
                <div className="w-full md:w-80">
                  <SearchByComponent
                      onSearch={handleSearch}
                      options={searchOptions}
                      initialSearchBy="name"
                  />
                </div>
                <Link
                    href="/admin/management/school/add-school"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 text-center"
                >
                  Add School
                </Link>
              </div>
            </div>
          }
      >
        <div className="mt-4">
          <SchoolListForm
              fetchPage={fetchPage}
              data={data}
              error={error}
              isLoading={isLoading}
              isFetching={isFetching}
              onDelete={(id: number) => (document.getElementById("delete-modal") as any)?.setModalVisible(true, id)}
          />
        </div>
      </Card>
  );
};