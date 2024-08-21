import Layout from "../layout/Layout";
import luffy from '../../public/luffy.jpeg';
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function FullBlog() {
    const text = `Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money. Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money. Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money
    Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money. Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money";
`;
    const location = useLocation();
    const id = location.state;
    console.log(id);
    const token = localStorage.getItem('token') as string;
    const [blogs, setBlogs] = useState({});

    const fetchBlogById = async () => {
        const response = await axios.get(`https://backend.izharmohammed21.workers.dev/api/v1/blog/${id}`, {
            headers: {
                "Content-Type": "text/json",
                "token": token
            }
        });
        console.log(response);
        setBlogs(response.data);
    }

    useEffect(() => {
        fetchBlogById();
    }, [])

    return (
        <Layout>
            <div className=" w-[60rem] flex flex-col m-auto h-screen p-8 ">
                <div>
                    <img src={luffy} className="w-[40rem] m-auto" />
                </div>
                <div className="text-center mt-8 font-bold  text-4xl">{blogs.title}</div>
                <div className="text-center mt-8 mb-6 font-semibold  text-1xl border-b-2 border-slate-300">created at :-{blogs.createdAt?.split('T')[0]}</div>
                <div className="text-left text-1xl font-medium p-4 ">{blogs.content}</div>
            </div>
        </Layout>
    )
}

export default FullBlog