'use server'
import SchoolSearch from "@/app/components/school/SchoolSearch";
import {SchoolSearchDTO} from "@/redux/services/schoolApi";

type SearchSchoolPageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function fetchSchools(params: SchoolSearchDTO) {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    queryParams.set(key, value.join(","));
                }
            } else {
                queryParams.set(key, value.toString());
            }
        }
    });

    console.log("Final API query:", queryParams.toString());

    const response = await fetch(
        `http://localhost:8080/api/school/search-by-criteria?${queryParams.toString()}`,
        {cache: "no-store"}
    );

    if (!response.ok) throw new Error("Failed to fetch schools");
    return response.json();
}

function parseArrayParam(param: string | string[] | undefined): number[] | undefined {
    if (!param) return undefined;
    const paramStr = Array.isArray(param) ? param[0] : param;
    return paramStr.split(",").map(Number).filter((n) => !isNaN(n));
}

export default async function SearchSchool({searchParams}: SearchSchoolPageProps) {

    const resolvedSearchParams = await searchParams;

    const initialParams: SchoolSearchDTO = {
        page: resolvedSearchParams.page ? Number(resolvedSearchParams.page) - 1 : 0,
        size: resolvedSearchParams.size ? Number(resolvedSearchParams.size) : 10,
        sortBy: (resolvedSearchParams.sortBy as string) || "postedDate",
        sortDirection: (resolvedSearchParams.sortDirection as string) || "Descending",
        name: (resolvedSearchParams.name as string) || "",
        province: (resolvedSearchParams.province as string) || undefined,
        district: (resolvedSearchParams.district as string) || undefined,
        type: resolvedSearchParams.type ? Number(resolvedSearchParams.type) : undefined,
        age: resolvedSearchParams.age ? Number(resolvedSearchParams.age) : undefined,
        minFee: resolvedSearchParams.minFee ? Number(resolvedSearchParams.minFee) : undefined,
        maxFee: resolvedSearchParams.maxFee ? Number(resolvedSearchParams.maxFee) : undefined,
        facilityIds: parseArrayParam(resolvedSearchParams.facilityIds),
        utilityIds: parseArrayParam(resolvedSearchParams.utilityIds),
    };

    console.log("Initial params:", initialParams);

    try {
        const initialSearchResult = await fetchSchools(initialParams);
        console.log("response:", initialSearchResult);
        return (
            <div className="min-h-screen">
                <SchoolSearch
                    initialSearchResult={initialSearchResult}
                    initialParams={initialParams}
                />
            </div>
        );
    } catch (error) {
        console.error("Error fetching data:", error);
        return <div>Error loading schools: {(error as Error).message}</div>;
    }
}
