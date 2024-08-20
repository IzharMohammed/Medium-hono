import axios from "axios";
import { useEffect, useState } from "react";

interface Blog {
    authorId: number,
    content: string
    createdAt: string
    id: number
    published: boolean
    title: string
}

export default function useBlogs() {

    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token') as string;
    //const decoded = jwtDecode<decodedToken>(token);

    useEffect(() => {
        const fetchBlogs = async () => {
            const headers = {
                "Content-Type": "text/json",
                "token": token
            };
            const response = await axios.post('https://backend.izharmohammed21.workers.dev/api/v1/blog/bulk', {}, {
                headers
            })
            console.log(response);
            setBlogs(response.data);
        }

        fetchBlogs();
    }, [])
    return {
        blogs
    }
}
useBlogs