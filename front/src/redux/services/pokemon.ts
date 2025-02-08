import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import type {Pokemon} from "@/redux/services/types";

// Tạo service API hay API slice
export const pokemonApi = createApi({
    // Tên mà Redux sử dụng để  lưu trữ và truy xuất state của API này trong store
    reducerPath: 'pokemonApi',
    // fetchBaseQuery: phương thức cơ bản để gửi request đến API
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://pokeapi.co/api/v2/',
    }),
    // Các endpoints mà service sẽ gọi
    endpoints: (build) => ({
        // Pokemon là kiểu dữ liệu trả về, string là kiểu dữ liệu tham số truyền vào
        getPokemonByName: build.query<Pokemon, string>({
            query: (name) => `pokemon/${name}`,
        }),
    }),
});
// useGetPokemonByNameQuery là hook tự động mà RTK Query tạo từ endpoint
export const {useGetPokemonByNameQuery} = pokemonApi;