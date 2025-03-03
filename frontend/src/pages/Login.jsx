import React from "react";
import Form from "../components/Form";

const Login = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <Form route="/api/token/" method="login" />
                <p className="text-center text-sm mt-4 text-gray-600">
                    Don't have an account?{" "}
                    <a href="/register" className="text-purple-500 hover:underline">
                        Register
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
