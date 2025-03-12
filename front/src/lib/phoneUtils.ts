// Format phone number function
export const formatPhoneNumber = (phone: string | undefined): string => {
    if (!phone) return "";
    if (phone.startsWith("+84")) {
        return phone.substring(3);
    }
    if (phone.startsWith("0")) {
        return phone.substring(1);
    }
    return phone;
};