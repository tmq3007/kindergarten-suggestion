// Tổng hợp các middleware của api
import {pokemonApi} from "@/redux/services/pokemon";
import {postApi} from "@/redux/services/post";

const apiMiddlewares = [
    pokemonApi.middleware,
    postApi.middleware,
];

export default apiMiddlewares;