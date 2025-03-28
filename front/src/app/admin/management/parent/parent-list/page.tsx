'use client'

import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";
import ParentListWrapper from "@/app/components/parent/ParentListWrapper";
import {useListAllParentWithFilterQuery} from "@/redux/services/parentApi";


const searchOptions = [
    {value: "username", label: "Username"},
    {value: "fullname", label: "Fullname"},
    {value: "email", label: "Email"},
    {value: "phone", label: "Phone"},
];

export default function Page() {

    return (
        <>

            <div>
                <MyBreadcrumb
                    paths={[
                        {label: "Parent Management", href: "/admin/management/parent/parent-list"},
                        {label: "Parent List"},
                    ]}
                />
                <ParentListWrapper
                                   isAdminPage={true}
                                   useQueryTrigger={useListAllParentWithFilterQuery}
                                   title={"Parent List"}
                                   searchOptions={searchOptions}

                />
            </div>
        </>
    );
}