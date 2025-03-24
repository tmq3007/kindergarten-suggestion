// Tổng hợp các middlewares của api
import {authApi} from "@/redux/services/authApi";
import {registerApi} from "@/redux/services/registerApi";
import {addressApi} from "@/redux/services/addressApi";
import {parentApi} from "@/redux/services/parentApi";
import {userApi} from "@/redux/services/userApi";
import {reviewApi} from "@/redux/services/reviewApi";
import {schoolApi} from "@/redux/services/schoolApi";
import { testApi } from "../services/testApi";
import {schoolOwnerApi} from "@/redux/services/schoolOwnerApi";
import {requestCounsellingApi} from "@/redux/services/requestCounsellingApi";


const apiMiddlewares = [
    authApi.middleware,
    registerApi.middleware,
    parentApi.middleware,
    addressApi.middleware,
    userApi.middleware,
    reviewApi.middleware,
    schoolApi.middleware,
    testApi.middleware,
    schoolOwnerApi.middleware,
    requestCounsellingApi.middleware,
];

export default apiMiddlewares;