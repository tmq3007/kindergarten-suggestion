export const ROLES = {
    ADMIN: "ROLE_ADMIN",
    SCHOOL_OWNER: "ROLE_SCHOOL_OWNER",
    PARENT: "ROLE_PARENT",
} as const;

//School Options
export const FACILITY_OPTIONS = [
    {label: "Outdoor playground", value: "0"},
    {label: "Camera", value: "1"},
    {label: "Swimming pool", value: "2"},
    {label: "Library", value: "3"},
    {label: "Cafeteria", value: "4"},
    {label: "Musical room", value: "5"},
    {label: "PE room", value: "6"},
    {label: "STEM room", value: "7"}
];

export const UTILITY_OPTIONS = [
    {label: "School bus", value: "0"},
    {label: "Breakfast", value: "1"},
    {label: "Afterschool care", value: "2"},
    {label: "Saturday class", value: "3"},
    {label: "Health check", value: "4"},
    {label: "Picnic activities", value: "5"},
    {label: "E-Contact book", value: "6"}
];

export const SCHOOL_STATUS_OPTIONS = [
    {label: "Saved", value: "0"},
    {label: "Submitted", value: "1"},
    {label: "Approved", value: "2"},
    {label: "Rejected", value: "3"},
    {label: "Published", value: "4"},
    {label: "Unpublished", value: "5"},
    {label: "Deleted", value: "6"}
];

export const SCHOOL_STATUS = {
    Saved: 0,
    Submitted: 1,
    Approved: 2,
    Rejected: 3,
    Published: 4,
    Unpublished: 5,
    Deleted: 6
};


export const EDUCATION_METHOD_OPTIONS = [
    {label: "Montessori", value: "0"},
    {label: "STEM", value: "1"},
    {label: "Steiner", value: "2"},
    {label: "Reggio Emilia", value: "3"},
    {label: "High Scope", value: "4"},
    {label: "Shichida", value: "5"},
    {label: "Glenn Doman", value: "6"}
];

export const SCHOOL_TYPE_OPTIONS = [
    {label: "Public", value: "0"},
    {label: "International", value: "1"},
    {label: "Private", value: "2"},
    {label: "Semi-public", value: "3"},
    {label: "International Bilingual", value: "4"}
];

export const CHILD_RECEIVING_AGE_OPTIONS = [
    {label: "6m - 1y", value: "0"},
    {label: "1y - 3y", value: "1"},
    {label: "3y - 6y", value: "2"}
];

export const REVIEW_STATUS = {
    APPROVED: 0,
    REJECTED: 1,
    PENDING: 2
};
