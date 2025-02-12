// Tổng hợp các middleware của api
import {pokemonApi} from "@/redux/services/pokemonApi";
import {postApi} from "@/redux/services/postApi";

const apiMiddlewares = [
    pokemonApi.middleware,
    postApi.middleware,
];

export default apiMiddlewares;