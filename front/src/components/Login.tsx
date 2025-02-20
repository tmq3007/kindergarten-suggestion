import {useState} from "react";
import {useLoginMutation} from "@/redux/services/authApi";

const Login = () => {

    const [login] = useLoginMutation();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const handleTest = async () => {
        const response = await fetch("http://localhost:8080/api/test/hello", {
            method: "GET",
            credentials: "include", // Quan trọng: gửi cookie trong request
        });

    }
    const handleLogin = async () => {
        try {
            const loginVO = await login({username: username, password: password}).unwrap();
            await fetch("/api/auth", {
                method: "POST",
                credentials: "include", // Gửi cookie nếu có
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginVO),
            })
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-80">
                <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
                <input
                    type="text"
                    placeholder="Username"
                    className="w-full p-2 border rounded-md mb-2 focus:outline-blue-400"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 border rounded-md mb-2 focus:outline-blue-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    className="w-full bg-blue-500 text-white p-2 rounded-md mt-2 hover:bg-blue-600 disabled:bg-gray-300"
                    onClick={handleLogin}

                >
                    Login
                </button>
                <button
                    className="w-full bg-blue-500 text-white p-2 rounded-md mt-2 hover:bg-blue-600 disabled:bg-gray-300"
                    onClick={handleTest}

                >
                    Test
                </button>
            </div>
        </div>
    );
};

export default Login;
