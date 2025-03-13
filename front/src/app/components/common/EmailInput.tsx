import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {Form, Input} from "antd";
import {useCheckEditSchoolEmailMutation} from "@/redux/services/schoolApi";
import {FormInstance} from "antd/es/form";

interface EmailInputProps {
    form: FormInstance;
    isReadOnly?: boolean;
    triggerCheckEmail: any; // Check email query for new school
    schoolId?: number; // Truyền vào schoolId khi chỉnh sửa trường
}

const EmailInput = forwardRef(({
                                   form,
                                   isReadOnly,
                                   triggerCheckEmail,
                                   schoolId
                               }: EmailInputProps, ref) => {
    const [email, setEmail] = useState<string>(form.getFieldValue('email') || '');

    useEffect(() => {
        setEmail(form.getFieldValue('email') || '');
    }, [form, form.getFieldValue('email')]);
    const [emailStatus, setEmailStatus] = useState<'' | 'validating' | 'success' | 'error'>('');
    const [emailHelp, setEmailHelp] = useState<string | null>(null);

    // API kiểm tra email khi chỉnh sửa (chỉ check email khác với trường hiện tại)
    const [triggerCheckEditEmail] = useCheckEditSchoolEmailMutation();

    const validateEmail = async (): Promise<boolean> => {
        if (!email) {
            console.log('email rong')
            setEmailStatus('error');
            setEmailHelp('Vui lòng nhập email!');
            return false;
        }
        console.log('email: ', email)
        if (email.length > 50) {
            setEmailStatus('error');
            setEmailHelp('Email không được vượt quá 50 ký tự!');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailStatus('error');
            setEmailHelp('Vui lòng nhập email hợp lệ!');
            return false;
        }

        setEmailStatus('validating');
        setEmailHelp('Đang kiểm tra email...');

        try {
            let response;
            if (schoolId) {
                // Trường hợp EDIT school, chỉ kiểm tra email khác với trường hiện tại
                response = await triggerCheckEditEmail({email, schoolId}).unwrap();
            } else {
                // Trường hợp ADD school, kiểm tra toàn bộ hệ thống
                response = await triggerCheckEmail(email).unwrap();
            }

            if (response && response.data === "true") {
                setEmailStatus('error');
                setEmailHelp('Email này đã được sử dụng!');
                return false;
            } else {
                setEmailStatus('success');
                setEmailHelp(null);
                return true;
            }
        } catch (error) {
            console.error("Lỗi API kiểm tra email:", error);
            setEmailStatus('error');
            setEmailHelp('Không thể kiểm tra email. Vui lòng thử lại sau.');
            return false;
        }
    };


    useImperativeHandle(ref, () => ({
        validateEmail,
    }));

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setEmailStatus('');
        setEmailHelp(null);
    };

    const handleEmailBlur = async () => {
        await validateEmail();
    };

    return (
        <Form.Item
            name="email"
            label="Email"
            hasFeedback
            validateStatus={emailStatus}
            help={emailHelp}
            rules={[{required: true, message: 'Vui lòng nhập email!'}]}
        >
            <Input
                placeholder="Nhập email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                readOnly={isReadOnly}
            />
        </Form.Item>
    );
});

EmailInput.displayName = 'EmailInput';

export default EmailInput;
