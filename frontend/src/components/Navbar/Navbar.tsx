import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


interface decodedToken {
    email: string,
    id : number
}

function Navbar() {
    const token = localStorage.getItem('token') as string;
    const decoded = jwtDecode<decodedToken>(token);
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

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
                        <div>
                            <button type="button" onClick={()=>navigate('/FormPage', {state : decoded.id})} className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Publish a Post</button>
                        </div>
                        <div>{decoded.email}</div>
                    </div>
                </nav>
            </div>
        </>
    )
}

export default Navbar