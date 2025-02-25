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
export type RegisterDTO = {
    fullname: string,
    email: string,
    phone: string,
    password: string,
}

export type Country = {
    code: string;
    label: string;
    dialCode: string;
    flag: string;
}