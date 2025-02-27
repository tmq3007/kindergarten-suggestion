// Tổng hợp các middlewares của api
import {authApi} from "@/redux/services/authApi";
import {userListApi} from "@/redux/services/userListApi";
import {registerApi} from "@/redux/services/registerApi";
import {addressApi} from "@/redux/services/addressApi";
import {parentApi} from "@/redux/services/parentApi";
import {userApi} from "@/redux/services/userApi";

const apiMiddlewares = [
    authApi.middleware,
    userListApi.middleware,
    registerApi.middleware,
    parentApi.middleware,
    addressApi.middleware,
    userApi.middleware
];

export default apiMiddlewares;