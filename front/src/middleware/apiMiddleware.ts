// Tổng hợp các middlewares của api
import {pokemonApi} from "@/redux/services/pokemonApi";
import {postApi} from "@/redux/services/postApi";
import {authApi} from "@/redux/services/authApi";

const apiMiddlewares = [
    pokemonApi.middleware,
    postApi.middleware,
    authApi.middleware,
];

export default apiMiddlewares;