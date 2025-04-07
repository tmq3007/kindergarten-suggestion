const setClientCookie = (name: string, value: string, maxAgeSeconds: number) => {
    document.cookie = `${name}=${value}; Max-Age=${maxAgeSeconds}; Path=/; Secure; SameSite=None; Domain=kinder-taupe.vercel.app`;
};

export default setClientCookie;