// Tổng hợp các middlewares của api
import {pokemonApi} from "@/redux/services/pokemonApi";
import {postApi} from "@/redux/services/postApi";
import {authApi} from "@/redux/services/authApi";
import { userListApi } from "@/redux/services/userListApi";
import { registerApi } from "@/redux/services/registerApi";

const apiMiddlewares = [
    pokemonApi.middleware,
    postApi.middleware,
    authApi.middleware,
    userListApi.middleware,
    registerApi.middleware,
];

export default apiMiddlewares;