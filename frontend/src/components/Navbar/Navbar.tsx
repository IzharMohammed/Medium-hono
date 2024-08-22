import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

import { Button } from "../../components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useTheme } from "../theme-provider"

interface decodedToken {
    email: string,
    id: number
}

function Navbar() {
    const token = localStorage.getItem('token') as string;
    const decoded = jwtDecode<decodedToken>(token);
    const navigate = useNavigate();
    const goToHomePage = () => {
        navigate('/');
    }
    const { setTheme } = useTheme()


    return (
        <>
            <div className="border border-slate-300 mb-8">
                <nav className="flex flex-col justify-between p-4 border md:flex-row ">
                    <div className=" text-2xl font-bold">
                        <button onClick={goToHomePage}> Medium</button>
                    </div>
                    <div className="flex gap-4">
                        <div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                        <span className="sr-only">Toggle theme</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setTheme("light")}>
                                        Light
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                                        Dark
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("system")}>
                                        System
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div>
                            <button type="button" onClick={() => navigate('/FormPage', { state: decoded.id })} className="w-[6rem] h-[2rem] flex justify-center items-center text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Publish</button>
                        </div>
                        <div>{decoded.email}</div>
                    </div>
                </nav>
            </div>
        </>
    )
}

export default Navbar