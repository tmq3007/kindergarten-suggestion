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

const useAuthRedirect = (
    data: any,
    error: FetchBaseQueryError | SerializedError | undefined,
    messageApi: any,
    redirectUrl: string,
    isParentLogin: boolean,  // Thêm tham số để kiểm tra loại form
    onSuccess?: () => void  // Callback để đóng modal khi đăng nhập thành công
) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const processed = useRef(false);
    useEffect(() => {
            if (data?.data && !processed.current) {
                processed.current = true;
                fetch('/api/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data.data),
                })
                    .then(() => {
                        const accessToken = data.data.accessToken;
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
                        } catch (e) {
                            messageApi.error("Failed to decode token.", 1);
                        }
                        messageApi.success('Login successful.', 1).then(() => {
                            if (isParentLogin && onSuccess) {
                                // Nếu là ParentLoginForm, đóng modal
                                onSuccess();
                            } else if (!isParentLogin) {
                                // Nếu là AdminLoginForm, thực hiện redirect
                                router.push(redirectUrl);
                            }
                        });
                    })
                    .catch((err) => {
                        messageApi.error('Authentication failed.', 1);
                        console.log(err);
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
        }
        ,
        [data, error, redirectUrl, isParentLogin, messageApi, router, onSuccess]
    )
    ;
};

export default useAuthRedirect;
