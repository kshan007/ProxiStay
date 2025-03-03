import React from "react";
import Form from "../components/Form";

const Register = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
                <Form route="/api/user/register/" method="register" />
                <p className="text-center text-gray-600 mt-4">
                    Already have an account?{" "}
                    <a href="/login" className="text-purple-600 font-medium hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Register;
