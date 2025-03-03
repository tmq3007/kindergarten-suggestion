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



export type Country = {
    code: string;
    label: string;
    dialCode: string;
    flag: string;
}

export type SchoolDTO = {
    schoolName: string;
    schoolType: string;
    
    // Address Fields
    province: string;
    district: string;
    ward: string;
    street?: string;
    
    email: string;
    phone: string;
    countryCode: string;
    
    childAge: string;
    educationMethod: string;
    
    // Fee Range
    feeFrom: number;
    feeTo: number;
    
    // Facilities and Utilities (Checkbox Groups)
    facilities?: string[];
    utilities?: string[];
    
    description?: string; // School introduction
    
    // File Upload
    schoolImage?: File;
}


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



