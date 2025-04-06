import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {SerializedError} from "@reduxjs/toolkit";
import {useRouter} from "next/navigation";
import {useEffect, useRef} from "react";
import {CustomFetchBaseQueryError} from "@/redux/services/config/baseQuery";
import {useDispatch} from "react-redux";
import {updateUser} from "@/redux/features/userSlice";
import {jwtDecode} from "jwt-decode";

interface JwtPayload {
    sub: string;
    id: string;
    role: string;
    exp: number;
    iat: number;
}

const setClientCookie = (name: string, value: string, maxAgeSeconds: number) => {
    document.cookie = `${name}=${value}; Max-Age=${maxAgeSeconds}; Path=/; Secure; SameSite=None`;
};

const useAuthRedirect = (
    data: any,
    error: FetchBaseQueryError | SerializedError | undefined,
    messageApi: any,
    redirectUrl: string,
    isParentLogin: boolean,  // param to check type of login form
    onSuccess?: () => void  // Callback to close modal when login successfully
) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const processed = useRef(false);
    useEffect(() => {
        if (data?.data && !processed.current) {
            processed.current = true;

            const accessToken = data.data.accessToken;
            const csrfToken = data.data.csrfToken;
            const hasSchool = data.data.hasSchool;
            const hasDraft = data.data.hasDraft;

            try {
                const decoded = jwtDecode<JwtPayload>(accessToken);
                dispatch(updateUser({
                    username: decoded.sub,
                    id: decoded.id,
                    role: decoded.role,
                    hasSchool,
                    hasDraft
                }));

                const now = Math.floor(Date.now() / 1000);
                const ttl = decoded.exp - now + 86400;
                setClientCookie("CSRF_TOKEN", csrfToken, ttl);
            } catch (e) {
                messageApi.error("Failed to decode token.", 1);
            }

            messageApi.success('Login successful.', 1).then(() => {
                if (isParentLogin && onSuccess) {
                    onSuccess();
                } else if (!isParentLogin) {
                    router.push(redirectUrl); // Redirect admin
                }
            });
        }

        if (error && 'data' in error) {
            const code = (error as CustomFetchBaseQueryError).data?.code;
            if (code == 1000) {
                messageApi.error('Email or password is wrong.', 1);
            } else if (code == 1200) {
                messageApi.error('Access Denied.', 1);
            } else if (code == 1003) {
                messageApi.error('User not found.', 1);
            } else {
                messageApi.error('Something went wrong. Try again later!', 1);
            }
        }
    }, [data, error, redirectUrl, isParentLogin, messageApi, router, onSuccess]);
};

export default useAuthRedirect;
