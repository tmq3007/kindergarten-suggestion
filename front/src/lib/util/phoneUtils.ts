// Format phone number function
export const formatPhoneNumber = (phone: string | undefined, i: number = 1): string => {
    if (!phone) return "";

    const trimmedPhone = phone.split(" ");
    let numberPart = trimmedPhone[1];
    let diaCodePart = trimmedPhone[0].trim();
    if (trimmedPhone.length == 1) {
        numberPart = trimmedPhone[0];
        diaCodePart = "+84"; //default to VN
    }
    if (i == 1) {
        return numberPart || "";
    } else {
        return diaCodePart || "";
    }
};