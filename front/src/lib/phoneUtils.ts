// Format phone number function
export const formatPhoneNumber = (phone: string | undefined): string => {
    if (!phone) return "";

    const trimmedPhone = phone.trim();
    const numberPart = trimmedPhone.split(" ")[1];

    return numberPart || "";
};