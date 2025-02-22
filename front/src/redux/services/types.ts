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
    gender: boolean;
    fullName: string;
    phone: string;
    dob: string; // Vì TypeScript không có LocalDate, dùng string để nhận dạng ISO date
    district: string;
    ward: string;
    province: string;
    street: string;
    role: "ROLE_PARENT"; // Định nghĩa cố định giá trị của role
};
