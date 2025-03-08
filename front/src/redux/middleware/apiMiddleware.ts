// Tổng hợp các middlewares của api
import {authApi} from "@/redux/services/authApi";
import {userListApi} from "@/redux/services/userListApi";
import {registerApi} from "@/redux/services/registerApi";
import {addressApi} from "@/redux/services/addressApi";
import {parentApi} from "@/redux/services/parentApi";
import {userApi} from "@/redux/services/userApi";
import {reviewApi} from "@/redux/services/reviewApi";
import {schoolApi} from "@/redux/services/schoolApi";
import {schoolListApi} from "@/redux/services/schoolListApi";

const apiMiddlewares = [
    authApi.middleware,
    userListApi.middleware,
    registerApi.middleware,
    parentApi.middleware,
    addressApi.middleware,
    userApi.middleware,
    reviewApi.middleware,
    schoolApi.middleware,
    schoolListApi.middleware
];

export default apiMiddlewares;