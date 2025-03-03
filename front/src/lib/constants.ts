export const ROLES = {
    ADMIN: "ROLE_ADMIN",
    SCHOOL_OWNER: "ROLE_SCHOOL_OWNER",
    PARENT: "ROLE_PARENT",
} as const;

export const FACILITIES = {
    OUTDOOR_PLAYGROUND: { code: 1, name: 'Outdoor playground' },
    CAFETERIA: { code: 2, name: 'Cafeteria' },
    LIBRARY: { code: 3, name: 'Library' },
    PE_ROOM: { code: 4, name: 'PE room' },
    ART_ROOM: { code: 5, name: 'Art room' },
    SWIMMING_POOL: { code: 6, name: 'Swimming pool' },
    MONTESSORI_ROOM: { code: 7, name: 'Montessori room' },
    STEM_ROOM: { code: 8, name: 'STEM room' },
    MUSICAL_ROOM: { code: 9, name: 'Musical room' },
    CAMERA: { code: 10, name: 'Camera' },
} as const;



export const UTILITIES = {
    SCHOOL_BUS: { code: 11, name: 'School bus' },
    BREAKFAST: { code: 12, name: 'Breakfast' },
    AFTER_SCHOOL_CARE: { code: 13, name: 'After school care' },
    SATURDAY_CLASS: { code: 14, name: 'Saturday class' },
    HEALTH_CHECK: { code: 15, name: 'Health check' },
    PICNIC_ACTIVITIES: { code: 16, name: 'Picnic activities' },
    E_CONTACT_BOOK: { code: 17, name: 'E-contact book' },
} as const;
