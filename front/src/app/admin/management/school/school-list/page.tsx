"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Card, Modal, notification } from "antd";
import {
  useGetActiveSchoolsWithoutRefIdQuery,
  useGetSchoolListQuery,
  useUpdateSchoolStatusByAdminMutation
} from "@/redux/services/schoolApi";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import SchoolManageTitle from "@/app/components/school/SchoolManageTitle";
import SearchByComponent from "@/app/components/common/SearchByComponent";
import SchoolListForm from "@/app/components/school/SchoolListForm";
import MyEditor from "@/app/components/common/MyEditor";

const searchOptions = [
  { value: "name", label: "School Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "district", label: "District"}
];

export default function SchoolListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(15);
  const [searchCriteria, setSearchCriteria] = useState({
    searchBy: searchOptions[0].value,
    keyword: undefined as string | undefined,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [responseContent, setResponseContent] = useState<string>("");
  const [schoolId, setSchoolId] = useState<number>(0);

  const [notificationApi, contextHolder] = notification.useNotification();
  const [updateSchoolStatusByAdmin, { isLoading: isUpdatingStatus }] = useUpdateSchoolStatusByAdminMutation();

  const { data, isLoading, isFetching, error } = useGetActiveSchoolsWithoutRefIdQuery({
    page: currentPage,
    size: currentPageSize,
    [searchCriteria.searchBy]: searchCriteria.keyword || undefined,
  });

  const fetchPage = (page: number, size: number) => {
    setCurrentPage(page);
    setCurrentPageSize(size);
  };

  const handleSearch = (criteria: { searchBy: string; keyword: string | undefined }) => {
    setSearchCriteria(criteria);
    setCurrentPage(1);
  };

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
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <SchoolManageTitle title={"School List"} />
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
                onDelete={handleOpenModalDelete}
            />
          </div>
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