// Nơi định nghĩa các types được dùng trong API services
// Định nghĩa các VO được trả về từ controller
export type Pokemon = {
    species: {
        name: string,
        front_shiny: string,
    },
};

export type Post = {
    id: string,
    title: string,
    content: string,
};

export type LoginDTO = {
    username: string,
    password: string,
}

export type LoginVO = {
    accessToken: string,
    csrfToken: string,
}

export type ParentDTO = {
    id: number;
    username?: string;
    email?: string;
    status?: boolean;
    fullName: string;
    phone: string;
    dob: string; // Vì TypeScript không có LocalDate, dùng string để nhận dạng ISO date
    district: string;
    ward: string;
    province: string;
    street: string;
    role: "ROLE_PARENT"; // Định nghĩa cố định giá trị của role
};


export type Country = {
    code: string;
    label: string;
    dialCode: string;
    flag: string;
}

export type SchoolDTO = {
    id: number;
    name: string;
    phone: string;
    email: string;
    receivingAge: number | null;
    educationMethod: string | null;
    schoolType: string | null;
    status: boolean | null;
    website: string | null;
    description: string | null;
    feeFrom: number | null;
    feeTo: number | null;
    image: string | null;
    district: string | null;
    ward: string | null;
    province: string | null;
    street: string | null;
};

export type SchoolOwnerDTO  = {
    id: number;
    username: string;
    email: string;
    role: "ROLE_SCHOOL_OWNER";
    status: boolean;
    fullName: string;
    phone: string;
    dob: string; // Sử dụng kiểu string để tương thích với JSON Date
    school: SchoolDTO; // Chứa toàn bộ thông tin của School
};



export enum UserRole {
    ADMIN = 'ROLE_ADMIN',
    SCHOOL_OWNER = 'ROLE_SCHOOL_OWNER',
    PARENT = 'ROLE_PARENT',
}