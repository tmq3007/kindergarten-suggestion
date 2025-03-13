'use client';
import { useParams } from 'next/navigation';
import { Form } from 'antd';
import { useGetSchoolQuery } from '@/redux/services/schoolApi';
import React, { useEffect, useState } from 'react';
import SchoolFormSkeleton from '@/app/components/skeleton/SchoolFormSkeleton';
import SchoolForm from '@/app/components/school/SchoolForm';
import MyBreadcrumb from '@/app/components/common/MyBreadcrumb';
import { SCHOOL_STATUS_OPTIONS } from '@/lib/constants';
import SchoolManageTitle from '@/app/components/school/SchoolManageTitle';
import { formatPhoneNumber } from '@/lib/phoneUtils';

export default function EditSchool() {
  const params = useParams();
  const schoolId = params.id;
  const { data, isLoading } = useGetSchoolQuery(Number(schoolId));
  const school = data?.data;
  const schoolStatus = SCHOOL_STATUS_OPTIONS.find((s) => s.value === String(school?.status))?.label || undefined;
  const [form] = Form.useForm();
  const [formLoaded, setFormLoaded] = useState(false); // Track when form is loaded

  useEffect(() => {
    if (school) {
      console.log('1. Loaded school data:', school);
      console.log('2. Raw imageList:', school.imageList);

      form.setFieldsValue({
        name: school.name || '',
        schoolType: String(school.schoolType),
        province: school.province || '',
        district: school.district || '',
        ward: school.ward || '',
        street: school.street || '',
        email: school.email || '',
        phone: formatPhoneNumber(school.phone),
        countryCode: formatPhoneNumber(school.phone, 0),
        receivingAge: String(school.receivingAge),
        educationMethod: String(school.educationMethod),
        feeFrom: school.feeFrom || 0,
        feeTo: school.feeTo || 0,
        facilities: school.facilities?.map((f) => String(f.fid)) || [],
        utilities: school.utilities?.map((u) => String(u.uid)) || [],
        description: school.description || '',
        website: school.website || '',
        image: school.imageList || [],
      });
      console.log('3. Form updated with image:', form.getFieldValue('image'));
      setFormLoaded(true); // Mark form as loaded
    }
  }, [school, form, schoolStatus]);

  if (isLoading || !school) {
    return (
      <>
        <MyBreadcrumb paths={[{ label: 'School Management' }, { label: 'Edit school' }]} />
        <SchoolManageTitle title={'Edit School'} schoolStatus={schoolStatus || 'Loading...'} />
        <SchoolFormSkeleton />
      </>
    );
  }

  return (
    <>
      <MyBreadcrumb
        paths={[
          { label: 'School Management', href: '/admin/management/school/school-list' },
          { label: 'Edit school' },
        ]}
      />
      <SchoolManageTitle title={'Edit School'} schoolStatus={schoolStatus!} />
      <SchoolForm
        form={form}
        hasCancelButton={true}
        hasUpdateSubmitButton={true}
        isEdit={true}
        triggerCheckEmail={null}
        schoolId={Number(schoolId)}
        formLoaded={formLoaded} // Pass to SchoolForm
      />
    </>
  );
}