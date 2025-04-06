import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {Form, Input} from "antd";
import {FormInstance} from "antd/es/form";

interface EmailInputProps {
    form: FormInstance;
    isReadOnly?: boolean;
    triggerCheckEmail: any; // Check email query for new school
    id?: number; // Inject schoolId when editing school
    fieldName?: string;
}

const EmailInput = forwardRef(({
                                   form,
                                   isReadOnly,
                                   triggerCheckEmail,
                                   id,
                                   fieldName = "email"
                               }: EmailInputProps, ref) => {
    const [email, setEmail] = useState<string>(form.getFieldValue('email') || '');

    useEffect(() => {
        setEmail(form.getFieldValue('email') || '');
    }, [form, form.getFieldValue('email')]);
    const [emailStatus, setEmailStatus] = useState<'' | 'validating' | 'success' | 'error'>('');
    const [emailHelp, setEmailHelp] = useState<string | null>(null);

    // API checking email when editing

    const validateEmail = async (): Promise<boolean> => {
        if (!email) {
            setEmailStatus('error');
            setEmailHelp('Please enter your email!');
            return false;
        }
        console.log('email: ', email)
        if (email.length > 50) {
            setEmailStatus('error');
            setEmailHelp('Email don’t exceed 50 characters!');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailStatus('error');
            setEmailHelp('Please enter a valid email!');
            return false;
        }
        console.log("1")

        setEmailStatus('validating');
        setEmailHelp('Checking email...');

        try {


            console.log("2")
            let response
            if (id) {
                console.log("3")
                console.log('Checking email with ID:', {email, id});

                response = await triggerCheckEmail({email: email, id:id}).unwrap();
            } else {
                // In case of ADD school, check all emails
                response = await triggerCheckEmail(email).unwrap();
            }


            console.log(response)

            if (response && response.data === true) {
                setEmailStatus('error');
                setEmailHelp('This email is already in use!');
                return false;
            } else {
                setEmailStatus('success');
                setEmailHelp(null);
                return true;
            }
        } catch (error) {
            console.log('error {}', error);
            setEmailStatus('error');
            setEmailHelp('Cannot check email. Try again later!');
            return false;
        }
    };


    useImperativeHandle(ref, () => ({
        validateEmail,
        setEmailStatus,
        setEmailHelp,
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
            name={fieldName}
            label="Email"
            hasFeedback
            validateStatus={emailStatus}
            help={emailHelp}
            rules={[{required: true, message: 'Please enter your email!'}]}
        >
            <Input
                placeholder="Enter email"
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
