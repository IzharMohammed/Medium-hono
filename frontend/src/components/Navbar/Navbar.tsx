import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

import { Button } from "../../components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
} from "../ui/dropdown-menu"
import { useTheme } from "../theme-provider"
import { useState } from "react";

interface decodedToken {
    email: string,
    id: number,
    username: string
}

function Navbar() {
    const token = localStorage.getItem('token') as string;
    const decoded = jwtDecode<decodedToken>(token);
    const [position, setPosition] = useState("bottom")
    const navigate = useNavigate();
    const goToHomePage = () => {
        navigate('/allBlogs');
    }
    const { setTheme } = useTheme()

    const handleSignIn = () => {
        localStorage.removeItem('token')
        navigate('/')
    }

    const handleSignUp = () => {
        localStorage.removeItem('token')
        navigate('/SignUp')
    }

    return (
        <>
            <div className="border border-slate-300 mb-8">
                <nav className="flex flex-col justify-between p-4 border md:flex-row  ">
                    <div className=" text-2xl font-bold mb-4 flex  md:mb-0">
                        <button onClick={goToHomePage}> Medium</button>
                    </div>
                    <div className="flex gap-1 md:gap-4">
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
                            <button type="button" onClick={() => navigate('/FormPage', { state: decoded.id })} className="w-[6rem] h-[2rem] flex justify-center items-center text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm p-5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Publish</button>
                        </div>
                        <div>
                            <button type="button" onClick={() => navigate('/Blogs')} className="w-[6.3rem] h-[2rem] flex justify-center items-center text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm p-5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">My Blogs</button>
                        </div>
                        <div className="flex justify-center items-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">{decoded.username}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                                        <DropdownMenuRadioItem value="top" onClick={handleSignIn}>sign in</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="bottom" onClick={handleSignUp}>sign up</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <div></div>
                        </div>
                    </div>
                </nav>
            </div>
        </>
    )
}

export default Navbar