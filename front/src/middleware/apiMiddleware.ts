// Tổng hợp các middlewares của api
import {pokemonApi} from "@/redux/services/pokemonApi";
import {postApi} from "@/redux/services/postApi";
import {authApi} from "@/redux/services/authApi";
import { userListApi } from "@/redux/services/userListAppi";

const apiMiddlewares = [
    pokemonApi.middleware,
    postApi.middleware,
    authApi.middleware,
    userListApi.middleware,
];

export default apiMiddlewares;