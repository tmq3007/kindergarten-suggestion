import {
    PlaySquareOutlined,
    CameraOutlined,
    SafetyOutlined,
    ReadOutlined,
    CoffeeOutlined,
    SoundOutlined,
    TeamOutlined,
    ExperimentOutlined,
    CarOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    MedicineBoxOutlined,
    RocketOutlined,
    ContactsOutlined,
} from "@ant-design/icons";
import {MdOutlineBreakfastDining} from "react-icons/md";


export const ROLES = {
    ADMIN: "ROLE_ADMIN",
    SCHOOL_OWNER: "ROLE_SCHOOL_OWNER",
    PARENT: "ROLE_PARENT",
} as const;

// Facility Options
export const FACILITY_OPTIONS = [
    { label: "Outdoor playground", value: "0", icon: <PlaySquareOutlined /> },
    { label: "Camera", value: "1", icon: <CameraOutlined /> },
    { label: "Swimming pool", value: "2", icon: <SafetyOutlined /> },
    { label: "Library", value: "3", icon: <ReadOutlined /> },
    { label: "Cafeteria", value: "4", icon: <CoffeeOutlined /> },
    { label: "Musical room", value: "5", icon: <SoundOutlined /> },
    { label: "PE room", value: "6", icon: <TeamOutlined /> },
    { label: "STEM room", value: "7", icon: <ExperimentOutlined /> },
];

// Utility Options
export const UTILITY_OPTIONS = [
    { label: "School bus", value: "0", icon: <CarOutlined /> },
    { label: "Breakfast", value: "1", icon: <MdOutlineBreakfastDining /> },
    { label: "Afterschool care", value: "2", icon: <ClockCircleOutlined /> },
    { label: "Saturday class", value: "3", icon: <CalendarOutlined /> },
    { label: "Health check", value: "4", icon: <MedicineBoxOutlined /> },
    { label: "Picnic activities", value: "5", icon: <RocketOutlined /> },
    { label: "E-Contact book", value: "6", icon: <ContactsOutlined /> },
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
    {label: "6m - 5y", value: "0"},
    {label: "12m - 5y", value: "1"}
];

export const FACILITIES = {
    OUTDOOR_PLAYGROUND: {code: 1, name: 'Outdoor playground'},
    CAFETERIA: {code: 2, name: 'Cafeteria'},
    LIBRARY: {code: 3, name: 'Library'},
    PE_ROOM: {code: 4, name: 'PE room'},
    ART_ROOM: {code: 5, name: 'Art room'},
    SWIMMING_POOL: {code: 6, name: 'Swimming pool'},
    MONTESSORI_ROOM: {code: 7, name: 'Montessori room'},
    STEM_ROOM: {code: 8, name: 'STEM room'},
    MUSICAL_ROOM: {code: 9, name: 'Musical room'},
    CAMERA: {code: 10, name: 'Camera'},
} as const;


export const UTILITIES = {
    SCHOOL_BUS: {code: 11, name: 'School bus'},
    BREAKFAST: {code: 12, name: 'Breakfast'},
    AFTER_SCHOOL_CARE: {code: 13, name: 'After school care'},
    SATURDAY_CLASS: {code: 14, name: 'Saturday class'},
    HEALTH_CHECK: {code: 15, name: 'Health check'},
    PICNIC_ACTIVITIES: {code: 16, name: 'Picnic activities'},
    E_CONTACT_BOOK: {code: 17, name: 'E-contact book'},
} as const;

export const REQUEST_COUNSELLING_STATUS_OPTIONS = [
  {label: "Opened", value: "0"},
  {label: "Closed", value: "1"},
  {label: "Overdue", value: "2"},
];

export const REVIEW_STATUS = {
  APPROVED: 0,
  REJECTED: 1,
  PENDING: 2
};