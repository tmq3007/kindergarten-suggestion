import {BaseQueryApi, FetchArgs, fetchBaseQuery, FetchBaseQueryMeta} from "@reduxjs/toolkit/query/react";
import Cookies from 'js-cookie'
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
    // Nếu lỗi 401 Unauthorized thì gửi lại request bằng PUT method
    if (result.error && result.error.status === 401) {
        interface RefreshResponse {
            accessToken: string;
            refreshToken: string;
        }

        const refreshResult = await baseQuery(
            {
                // refresh token API
                url: '/refreshToken',
                method: 'PUT',
                body: {
                    // =========================================================================
                    // Đính kèm Refresh Token được lưu trong local storage trong body của request
                    // ** Để bảo mật thì không nên lưu token trong local  **
                    // refreshToken: localStorage.getItem('refresh_token'),
                    // =========================================================================
                },
            },
            api,
            extraOptions,
        ) as { data: RefreshResponse };

        if (refreshResult.data) {
            // Lưu token mới vào local storage
            // localStorage.setItem('access_token', refreshResult.data.accessToken);
            // localStorage.setItem('access_token', refreshResult.data.refreshToken);

            // Cập nhật token mới vào Redux state nếu cần

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

        }
    }
    return result;
};