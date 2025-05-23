import {BaseQueryApi, FetchArgs, fetchBaseQuery, FetchBaseQueryMeta} from "@reduxjs/toolkit/query/react";
import Cookies from 'js-cookie';
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {router} from "next/client";
import {resetUser} from "@/redux/features/userSlice";
import {jwtDecode, JwtPayload} from "jwt-decode";
import setClientCookie from "@/lib/util/setClientCookie";

// BASE_URL của server
export const BASE_URL = 'http://localhost:8080/api';

export const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    // Đảm bảo cookie được gửi kèm request
    credentials: 'include',
    // Chỉnh sử header để gắn CSRF token vào request trước khi được gửi đi
    prepareHeaders: (headers) => {
        // Lấy CSRF token từ Cookie
        const csrfToken = Cookies.get('CSRF_TOKEN');
        // Gắn CSRF token vào Header
        if (csrfToken) {
            headers.set('X-Csrf-Token', csrfToken);
        }
        headers.set('Accept', 'application/json');
        return headers;
    },
});

export const baseQueryWithReauth = async (
    args: FetchArgs,
    api: BaseQueryApi,
    extraOptions: FetchBaseQueryMeta | any
) => {
    let result = await baseQuery(args, api, extraOptions);
    // Nếu lỗi 403 Unauthorized thì gửi lại request bằng PUT method
    if (
        result.error &&
        result.error.status === 403 &&
        (result.error as CustomFetchBaseQueryError).data?.code !== 1200 &&
        (result.error as CustomFetchBaseQueryError).data?.message !== "You don't have permission to manage this request"
    ) {
        interface RefreshResponse {
            code: number;
            data: {
                accessToken: string;
                csrfToken: string;
            };
            message: string;
        }

        const refreshResult = await baseQuery(
            {
                // refresh token API
                url: '/auth/refresh-token',
                method: 'PUT',
            },
            api,
            extraOptions,
        ) as { data: RefreshResponse };

        if (refreshResult.data) {
            const {accessToken, csrfToken} = refreshResult.data.data;
            // Save csrfToken in client Cookie
            const decoded = jwtDecode<JwtPayload>(accessToken);
            const now = Math.floor(Date.now() / 1000);
            const ttl = decoded.exp as number - now + 86400;
            setClientCookie("CSRF_TOKEN", csrfToken, ttl);

            // Gửi lại request với Cookie đã được cập nhật token mới
            result = await baseQuery(
                {
                    ...args,
                    headers: {
                        ...args.headers,
                    },
                },
                api,
                extraOptions,
            );
        } else {
            // Nếu không thể refresh token thì đăng xuất người dùng
            await fetch('/api/logout', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            localStorage.clear();
            // Sử dụng api.dispatch thay vì useDispatch
            api.dispatch(resetUser());  // Dùng api.dispatch thay vì useDispatch
            await router.push("/public");
        }
    }
    return result;
};

export type ApiResponse<T> = {
    code: number;
    message: string;
    data: T;
};

export type CustomFetchBaseQueryError = FetchBaseQueryError & {
    data?: {
        code: number;
        message: string;
    };
};
