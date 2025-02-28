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



export type UserVO = {
    id: string,
    fullname: string,
    email: string,
    phoneNo: string,
    dob: string,
    address: string,
    role: string,
    status: string,
}

export type Pageable = {
    pageNumber: number,
    pageSize: number,
    totalElements: number,
    totalPages: number,
}


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



