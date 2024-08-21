import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";


interface decodedToken {
    email: string,
    id : number
}

function Navbar() {
    const token = localStorage.getItem('token') as string;
    const decoded = jwtDecode<decodedToken>(token);
    const navigate = useNavigate();
    const goToHomePage = () =>{
        navigate('/');
    }

    return (
        <>
            <div className="border border-slate-500 mb-8">
                <nav className="flex flex-col justify-between p-4 border md:flex-row ">
                    <div className=" text-2xl font-bold">
                       <button onClick={goToHomePage}> Medium</button>
                    </div>
                    <div className="flex gap-4">
                        <div>Home</div>
                        <div>Trending</div>
                        <div>
                            <button type="button" onClick={()=>navigate('/FormPage', {state : decoded.id})} className="w-[6rem] h-[2rem] flex justify-center items-center text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Publish</button>
                        </div>
                        <div>{decoded.email}</div>
                    </div>
                </nav>
            </div>
        </>
    )
}

export default Navbar