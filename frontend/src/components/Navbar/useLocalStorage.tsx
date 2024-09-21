import { jwtDecode } from "jwt-decode";

interface decodedToken {
    email: string,
    id: number,
    username: string
}
function useLocalStorage(){
    const token = localStorage.getItem('token') as string;
    const decoded = jwtDecode<decodedToken>(token);
    return{
        decoded
    }
}

export default useLocalStorage;