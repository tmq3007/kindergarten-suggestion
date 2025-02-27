// Tổng hợp các middlewares của api
import {authApi} from "@/redux/services/authApi";
import {userListApi} from "@/redux/services/userListApi";
import {registerApi} from "@/redux/services/registerApi";
import {parentApi} from "@/redux/services/User/parentApi";
import {addressApi} from "@/redux/services/addressApi";
import {userApi} from "@/redux/services/User/userApi";

const apiMiddlewares = [
    authApi.middleware,
    userListApi.middleware,
    registerApi.middleware,
    parentApi.middleware,
    addressApi.middleware,
    userApi.middleware
];

export default apiMiddlewares;