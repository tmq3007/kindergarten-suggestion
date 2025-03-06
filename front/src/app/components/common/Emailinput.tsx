import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Form, Input } from 'antd';
import { useLazyCheckSchoolEmailQuery } from '@/redux/services/schoolApi';

interface EmailInputProps {
    initialEmail?: string;
    onEmailStatusChange?: (status: '' | 'validating' | 'success' | 'error', help: string | null) => void;
}

// Use forwardRef to allow parent to call validateEmail
const EmailInput = forwardRef(({ initialEmail = '', onEmailStatusChange }: EmailInputProps, ref) => {
    const [email, setEmail] = useState(initialEmail);
    const [emailStatus, setEmailStatus] = useState<'' | 'validating' | 'success' | 'error'>('');
    const [emailHelp, setEmailHelp] = useState<string | null>(null);
    const [triggerCheckEmail] = useLazyCheckSchoolEmailQuery();
    const validateEmail = async () => {
        if (!email) {
            setEmailStatus('error');
            setEmailHelp('Please input your email!');
            if (onEmailStatusChange) onEmailStatusChange('error', 'Please input your email!');
            return false;
        }
        if (email.length > 50) {
            setEmailStatus('error');
            setEmailHelp('Email cannot exceed 50 characters!');
            if (onEmailStatusChange) onEmailStatusChange('error', 'Email cannot exceed 50 characters!');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailStatus('error');
            setEmailHelp('Please enter a valid email address!');
            if (onEmailStatusChange) onEmailStatusChange('error', 'Please enter a valid email address!');
            return false;
        }
        setEmailStatus('validating');
        setEmailHelp('Checking email availability...');
        if (onEmailStatusChange) onEmailStatusChange('validating', 'Checking email availability...');
        try {
            const response = await triggerCheckEmail(email).unwrap();
            if (response.data === 'true') {
                setEmailStatus('error');
                setEmailHelp('This email is already registered!');
                if (onEmailStatusChange) onEmailStatusChange('error', 'This email is already registered!');
                return false;
            } else {
                setEmailStatus('success');
                setEmailHelp(null);
                if (onEmailStatusChange) onEmailStatusChange('success', null);
                return true;
            }
        } catch (error) {
            setEmailStatus('error');
            setEmailHelp('Failed to validate email.');
            if (onEmailStatusChange) onEmailStatusChange('error', 'Failed to validate email.');
            return false;
        }
    };
    // Expose validateEmail to parent via ref
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
            label="Email Address"
            hasFeedback
            validateTrigger="onFinish"
            validateStatus={emailStatus}
            help={emailHelp}
            required
        >
            <Input placeholder="Enter your email" value={email} onChange={handleEmailChange} onBlur={handleEmailBlur} />
        </Form.Item>
    );
});

export default EmailInput;