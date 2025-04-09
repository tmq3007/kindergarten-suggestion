'use client'
import SchoolDiffViewer from "@/app/components/school/SchoolDiffViewer";
import {useParams, useRouter} from "next/navigation";
import {useGetSchoolByIdQuery} from "@/redux/services/schoolApi";
import {
    CHILD_RECEIVING_AGE_OPTIONS,
    EDUCATION_METHOD_OPTIONS,
    FACILITY_OPTIONS,
    SCHOOL_TYPE_OPTIONS, UTILITY_OPTIONS
} from "@/lib/constants";
import {Spin} from "antd";
import {useGetSchoolOwnersFromDraftQuery} from "@/redux/services/schoolOwnerApi";

function getSchoolTypeLabel(value?: number): string {
    const option = SCHOOL_TYPE_OPTIONS.find(opt => Number(opt.value) === value);
    return option?.label || "Unknown";
}

function getChildReceivingAgeLabel(value?: number): string {
    const option = CHILD_RECEIVING_AGE_OPTIONS.find(opt => Number(opt.value) === value);
    return option?.label || "Unknown";
}

function getEducationMethodLabel(value?: number): string {
    const option = EDUCATION_METHOD_OPTIONS.find(opt => Number(opt.value) === value);
    return option?.label || "Unknown";
}

function formatVND(value?: number): string {
    if (typeof value !== 'number') return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(value);
}

function mapIdListToLabelList(
    ids: { fid?: number; uid?: number }[] = [],
    options: { label: string; value: string }[],
    key: 'fid' | 'uid'
): string {
    if (!ids || ids.length === 0) return 'Không có';

    const labels = ids
        .map(idObj => {
            const id = idObj[key];
            const option = options.find(opt => Number(opt.value) === id);
            return option?.label || `#${id}`;
        })
        .sort((a, b) => a.localeCompare(b));

    return labels.map(label => `${label}`).join('\n');
}

function stripHtml(html?: string): string {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

function mapSchoolOwnersToString(owners?: { fullname: string; email: string }[]): string {
    if (!owners || owners.length === 0) return 'Không có';

    return owners
        .map((owner, index) => `${owner.fullname} (${owner.email})`)
        .join('\n');
}

export default function ShowDiff() {
    const router = useRouter();
    const params = useParams();
    const schoolId = Number(params.id as string);
    const {data: getDraftData, isLoading: isGetDraftLoading} = useGetSchoolByIdQuery(schoolId);
    const draft = getDraftData?.data;
    const {data: getSchoolData, isLoading: isGetSchoolLoading} = useGetSchoolByIdQuery(draft?.refId as number, {
        skip: !draft,
    });
    const school = getSchoolData?.data;
    const {data: getSchoolOwnersFromDraftData} = useGetSchoolOwnersFromDraftQuery(schoolId);
    const schoolOwnersFromDraft = getSchoolOwnersFromDraftData?.data;
    console.log('draft: {}', draft)
    console.log('school: {}', school)
    console.log('getSchoolOwnersFromDraftData: {}', schoolOwnersFromDraft)
    if (isGetDraftLoading || isGetSchoolLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large"/>
            </div>
        );
    }
    return (
        <div className={'px-5 text-xl'}>
            <div
                className={'underline text-custom-500 hover:cursor-pointer'}
                onClick={() => router.back()}
            >
                Back
            </div>

            <SchoolDiffViewer
                original={school?.name}
                draft={draft?.name}
                title={'School Name:'}
            />

            <SchoolDiffViewer
                original={getSchoolTypeLabel(school?.schoolType)}
                draft={getSchoolTypeLabel(draft?.schoolType)}
                title={'School Type:'}
                disableWordDiff={true}
            />

            <SchoolDiffViewer original={school?.province} draft={draft?.province} title={'Address:'}/>
            <SchoolDiffViewer original={school?.ward} draft={draft?.ward} disableWordDiff={true}/>
            <SchoolDiffViewer original={school?.district} draft={draft?.district} disableWordDiff={true}/>
            <SchoolDiffViewer original={school?.street} draft={draft?.street} disableWordDiff={true}/>

            <SchoolDiffViewer
                original={school?.email}
                draft={draft?.email}
                title={'Email:'}
                disableWordDiff={true}
            />

            <SchoolDiffViewer
                original={school?.phone}
                draft={draft?.phone}
                title={'Phone Number:'}
                disableWordDiff={true}
            />

            <SchoolDiffViewer
                original={getChildReceivingAgeLabel(school?.receivingAge)}
                draft={getChildReceivingAgeLabel(draft?.receivingAge)}
                title={'Child Receiving Age:'}
                disableWordDiff={true}
            />

            <SchoolDiffViewer
                original={getEducationMethodLabel(school?.educationMethod)}
                draft={getEducationMethodLabel(draft?.educationMethod)}
                title={'Education Method:'}
                disableWordDiff={true}
            />

            <SchoolDiffViewer
                original={`${formatVND(school?.feeFrom)} - ${formatVND(school?.feeTo)}`}
                draft={`${formatVND(draft?.feeFrom)} - ${formatVND(draft?.feeTo)}`}
                title={'Fee:'}
                disableWordDiff={true}
            />

            <SchoolDiffViewer
                original={mapIdListToLabelList(school?.facilities, FACILITY_OPTIONS, 'fid')}
                draft={mapIdListToLabelList(draft?.facilities, FACILITY_OPTIONS, 'fid')}
                title="Facilities:"
            />

            <SchoolDiffViewer
                original={mapIdListToLabelList(school?.utilities, UTILITY_OPTIONS, 'uid')}
                draft={mapIdListToLabelList(draft?.utilities, UTILITY_OPTIONS, 'uid')}
                title="Utilities:"
            />

            <SchoolDiffViewer
                original={stripHtml(school?.description)}
                draft={stripHtml(draft?.description)}
                title="School Description:"
            />

            <SchoolDiffViewer
                original={mapSchoolOwnersToString(school?.schoolOwners)}
                draft={mapSchoolOwnersToString(schoolOwnersFromDraft)}
                title="School Owner:"
            />

        </div>
    );
}