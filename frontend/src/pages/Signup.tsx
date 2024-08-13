function Signup() {
    return (
        <div className=" h-screen  flex justify-center items-center">
            <div className="border border-slate-600 w-[35rem] h-[24rem] m-auto flex flex-col justify-center items-center gap-9 rounded-md">
                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl font-semibold ">Welcome back</h1>
                    <p className="text-slate-500">Enter your email and password to create your account.</p>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="font-semibold">Email</h2>
                        <input type="text" className="border outline-none w-[24rem] p-2 rounded-md" placeholder="m@example.com" />
                    </div>
                    <div>
                        <h2 className="font-semibold">Password</h2>
                        <input type="password" className="border outline-none rounded-md w-[24rem] p-2" />
                    </div>
                </div>

                <div>
                    <button className="btn btn-ghost w-[24rem] p-2 border border-black font-bold bg-black text-white rounded">
                        Sign up
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Signup;
