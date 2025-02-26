// Tổng hợp các middlewares của api
import {pokemonApi} from "@/redux/services/pokemonApi";
import {postApi} from "@/redux/services/postApi";
import {authApi} from "@/redux/services/authApi";
import { userListApi } from "@/redux/services/userListApi";
import { registerApi } from "@/redux/services/registerApi";
import {parentApi} from "@/redux/services/User/parentApi";
import {addressApi} from "@/redux/services/addressApi";
import {userApi} from "@/redux/services/User/userApi";

const apiMiddlewares = [
    pokemonApi.middleware,
    postApi.middleware,
    authApi.middleware,
    userListApi.middleware,
    registerApi.middleware,
    parentApi.middleware,
    addressApi.middleware,
    userApi.middleware
];

export default apiMiddlewares;