import { jwtDecode } from "jwt-decode";

interface decodedToken {
    email: string
}

function Navbar() {
    const token = localStorage.getItem('token') as string;
    const decoded = jwtDecode<decodedToken>(token);


    return (
        <>
            <div className="border border-slate-500 mb-8">
                <nav className="flex justify-between p-4 border">
                    <div className=" text-2xl font-bold">
                        Medium
                    </div>
                    <div className="flex gap-4">
                        <div>Home</div>
                        <div>Trending</div>
                        <div>Topics</div>
                        <div>{decoded.email}</div>
                    </div>
                </nav>
            </div>
        </>
    )
}

export default Navbar