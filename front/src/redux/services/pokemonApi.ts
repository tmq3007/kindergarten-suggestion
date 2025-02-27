import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import type {Pokemon} from "@/redux/services/types";

// Create API service or API slice.
export const pokemonApi = createApi({
    // The name that Redux uses to store and access the state of this API in the store.
    reducerPath: 'pokemonApi',
    // fetchBaseQuery: the basic method to send requests to the API.
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://pokeapi.co/api/v2/'
    }),
    tagTypes: [],
    // The endpoints that the service will call.
    endpoints: (build) => ({
        // Pokemon is the return data type, string is the type of the input parameter.
        getPokemonByName: build.query<Pokemon, string>({
            query: (name) => `pokemon/${name}`,
        }),
    }),
});
// useGetPokemonByNameQuery is the auto-generated hook created by RTK Query from the endpoint.
export const {
    useGetPokemonByNameQuery
} = pokemonApi;