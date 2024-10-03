import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const navigate = useNavigate();

    async function setSignUp() {
        try {
            const response = await axios.post(`http://127.0.0.1:8787/api/v1/user/signup`, {
                email: email,
                password: password,
                username: username
            })

            const data = response.data.msg
            if (data === 'Invalid email') {
                toast.error('Invalid email')
            }

            if (data === 'Password must be minimum 6 characters') {
                toast.error('Password must be minimum 6 characters')
            }

            if (data === 'Email and password are necessary') {
                toast.error('Email and password are necessary');
            }

            if (data === 'Enter username') {
                toast.error('Enter username');
            }


            if (response.data.includes('logged in successfully')) {
                navigate('/')
                toast.success('Account created successfully')
            }

        } catch (error) {
            alert(error);
        }
    }

    return (
        <div className=" h-screen  flex justify-center items-center">
            <div className="border border-slate-600 w-[35rem] h-[30rem] m-auto flex flex-col justify-center items-center gap-9 rounded-md">
                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl font-semibold ">Welcome back</h1>
                    <p className="text-slate-500">Enter your email and password to create your account.</p>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="font-semibold">username</h2>
                        <input
                            type="text"
                            className="border outline-none w-[24rem] p-2 rounded-md text-black"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div>
                        <h2 className="font-semibold">Email</h2>
                        <input
                            type="text"
                            className="border outline-none w-[24rem] p-2 rounded-md text-black"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <h2 className="font-semibold">Password</h2>
                        <input
                            type="password"
                            className="border outline-none rounded-md w-[24rem] p-2 text-black"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} />
                    </div>
                </div>

                <div>
                    <button className="btn btn-ghost w-[24rem] p-2 border border-black font-bold bg-black text-white rounded" onClick={setSignUp}>
                        Sign up
                    </button>
                    <div className="cursor-pointer" onClick={() => navigate('/')}>Already have an account!!! Login</div>
                </div>
            </div>
        </div>
    )
}

export default Signup;
