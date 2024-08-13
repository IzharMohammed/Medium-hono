
function Signup() {
    return (
        <div className="border border-black w-[50rem] h-[20rem] mx-auto  flex flex-col justify-center items-center gap-3 ">
            <div className="border border-black">
            <h1>Welcome back</h1>
            <p>Enter your email and password to create your account.</p>
            </div>

            <div className="border border-black">
                <h2>Email</h2>
                <input type="text" className="border outline-none" placeholder="m@example.com" />
            </div>
            <div>
                <h2>Password</h2>
                <input type="text" className="border outline-none " />
            </div>
            <div>
                <button className="btn btn-success">Sign up</button>
            </div>
        </div>
    )
}

export default Signup;