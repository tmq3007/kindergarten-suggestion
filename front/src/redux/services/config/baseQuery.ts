import {BaseQueryApi, FetchArgs, fetchBaseQuery, FetchBaseQueryMeta} from "@reduxjs/toolkit/query/react";
import Cookies from 'js-cookie';
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {router} from "next/client";
import {resetUser} from "@/redux/features/userSlice";

// BASE_URL của server
export const BASE_URL = 'https://kindergartenshop.online/api';

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
            console.log("csrf", csrfToken)
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
    console.log("Response status:", result.error ? result.error.status : result.meta);
    // Nếu lỗi 403 Unauthorized thì gửi lại request bằng PUT method
    if (
        result.error &&
        result.error.status === 403 &&
        (result.error as CustomFetchBaseQueryError).data?.code !== 1200
    ) {
        console.log("Error 403 detected, attempting refresh...");
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
        console.log("Refresh result:", refreshResult.data ? "Success" : "Failed");
        if (refreshResult.data) {
            const {accessToken, csrfToken} = refreshResult.data.data;
            // Gọi API của Next.js để lưu token mới vào cookie
            // await fetch('/api/auth', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         accessToken,
            //         csrfToken: csrfToken,
            //     }),
            // });

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
            console.log("Refresh failed, triggering logout...");
            console.log("Loi ne" )
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
