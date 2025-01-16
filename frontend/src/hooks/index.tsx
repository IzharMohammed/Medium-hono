import axios from "axios";
import { useEffect, useState } from "react";
import { getBackendUrl } from "../lib/getBackendUrl";

interface Blog {
    authorId: number,
    content: string
    createdAt: string
    id: number
    imageUrl: string
    published: boolean
    title: string
}

export default function useBlogs() {

    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token') as string;
    //const decoded = jwtDecode<decodedToken>(token);
    const BACKEND_URL = getBackendUrl();

    useEffect(() => {
        setLoading(true);
        const fetchBlogs = async () => {
            const headers = {
                "Content-Type": "text/json",
                "token": token
            };
            const response = await axios.post(`${BACKEND_URL}/api/v1/blog/bulk`, {}, {
                headers
            })
            console.log(response);
            setBlogs(response.data);
            setLoading(false);
        }

        fetchBlogs();
    }, [])
    return {
        loading,
        blogs
    }
}
