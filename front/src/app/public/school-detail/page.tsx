import React, {FunctionComponent} from 'react';
import SchoolDetails from "@/app/components/school/SchoolDetails";
import {SchoolDetailVO} from "@/redux/services/schoolApi";
import MyBreadcrumb from "@/app/components/common/MyBreadcrumb";

const schoolData: SchoolDetailVO = {
    id: 1,
    fileList: null,
    status: 1,
    name: "Example School",
    schoolType: 1,
    district: "District 1",
    ward: "Ward 1",
    province: "HCMC",
    street: "123 Main St",
    email: "info@school.com",
    phone: "123-456-7890",
    receivingAge: 3,
    educationMethod: 2,
    feeFrom: 5000000,
    feeTo: 7000000,
    description: "<p>This is a great school!</p>",
    website: "https://school.com",
    facilities: [{fid: 1, name: "Library"}, {fid: 2, name: "Playground"}],
    utilities: [{uid: 1, name: "Bus Service"}],
    posted_date: new Date(),
    imageList: [
        {
            cloudId: "1", url: "https://storage.googleapis.com/kss-file-storage/SO_Images/school1.jpg",
            filename: ''
        }, {
            cloudId: "2", url: "https://storage.googleapis.com/kss-file-storage/SO_Images/school2.jpg",
            filename: ''
        }, {
            cloudId: "3", url: "https://storage.googleapis.com/kss-file-storage/SO_Images/school3.jpg",
            filename: ''
        }, {
            cloudId: "4", url: "https://storage.googleapis.com/kss-file-storage/SO_Images/school4.jpg",
            filename: ''
        }],
    schoolOwners: [{
        id: 1, fullname: "John Doe",
        userId: 0,
        username: 'JD1',
        email: '',
        phone: ''
    }],
};

const ageOptions = [
    {value: 3, label: "3 years"},
    {value: 4, label: "4 years"},
];
const typeOptions = [
    {value: 1, label: "Public"},
    {value: 2, label: "Private"},
];
const methodOptions = [
    {value: 1, label: "Traditional"},
    {value: 2, label: "Montessori"},
];
const SchoolDetailPage: FunctionComponent = () => {

    return (
        <div className="w-full mt-20">
            <MyBreadcrumb
                paths={[
                    {label: "School Search", href: "/public/search-school"},
                    {label: "School Details"},
                ]}
            />

            <SchoolDetails schoolData={schoolData}
                           CHILD_RECEIVING_AGE_OPTIONS={ageOptions}
                           SCHOOL_TYPE_OPTIONS={typeOptions}
                           EDUCATION_METHOD_OPTIONS={methodOptions}/>
        </div>
    );
};

export default SchoolDetailPage;
