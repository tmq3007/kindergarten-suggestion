import React, {useState, useImperativeHandle, forwardRef} from 'react';
import {Form, Input} from 'antd';
import {useLazyCheckSchoolEmailQuery} from '@/redux/services/schoolApi';

interface EmailInputProps {
    isReadOnly?: boolean;
    initialEmail?: string;
    triggerCheckEmail: any;    // Check email query
}

// Use forwardRef to allow parent to call validateEmail
const EmailInput = forwardRef(({isReadOnly, initialEmail = '', triggerCheckEmail}: EmailInputProps, ref) => {
    const [email, setEmail] = useState(initialEmail);
    const [emailStatus, setEmailStatus] = useState<'' | 'validating' | 'success' | 'error'>('');
    const [emailHelp, setEmailHelp] = useState<string | null>(null);

    const validateEmail = async (): Promise<boolean> => {
        if (isReadOnly) return true;
        if (!email) {
            setEmailStatus('error');
            setEmailHelp('Please input your email!');
            return false;
        }
        if (email.length > 50) {
            setEmailStatus('error');
            setEmailHelp('Email cannot exceed 50 characters!');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailStatus('error');
            setEmailHelp('Please enter a valid email address!');
            return false;
        }

        setEmailStatus('validating');
        setEmailHelp('Checking email availability...');
        try {
            const response = await triggerCheckEmail(email).unwrap();
            if (response.data === 'true') {
                setEmailStatus('error');
                setEmailHelp('This email is already registered!');
                return false;
            } else {
                setEmailStatus('success');
                setEmailHelp(null);
                return true;
            }
        } catch (error) {
            setEmailStatus('error');
            setEmailHelp('Failed to validate email.');
            return false;
        }
    };

    // Expose validateEmail to parent via ref
    useImperativeHandle(ref, () => ({
        validateEmail,
    }));

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setEmailStatus(''); // Reset status on change
        setEmailHelp(null);
    };

    const handleEmailBlur = async () => {
        await validateEmail();
    };

    return (
        <Form.Item
            name="email"
            label="Email Address"
            hasFeedback
            validateStatus={emailStatus}
            help={emailHelp}
            rules={[
                {required: true, message: 'Please input your email!'},
                // Validation is handled internally, so no need for additional rules here
            ]}
        >
            <Input
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                readOnly={isReadOnly}
            />
        </Form.Item>
    );
});

EmailInput.displayName = 'EmailInput'; // Added for debugging with forwardRef

export default EmailInput;