import Layout from "../layout/Layout";
import luffy from '../../public/luffy.jpeg';
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css';

interface Blog {
    title: string,
    content: string,
    createdAt: string
}

function FullBlog() {
    //     const text = `Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money. Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money. Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money
    //     Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money. Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money";
    // `;
    const location = useLocation();
    const id = location.state;
    console.log(id);
    const token = localStorage.getItem('token') as string;
    const [blog, setBlog] = useState<Blog>();
    const [loading, setloading] = useState(false);

    const fetchBlogById = async () => {
        setloading(true);
        const response = await axios.get(`http://127.0.0.1:8787/api/v1/blog/${id}`, {
            headers: {
                "Content-Type": "text/json",
                "token": token
            }
        });
        console.log(response);
        setBlog(response.data);
        setloading(false);
    }

    useEffect(() => {
        fetchBlogById();
    }, [])

    return (
        <Layout>
            {
                (loading || !blog) 
                
                ?
                    <div className=" w-[60rem] flex flex-col m-auto h-screen p-8 ">
                        <div>
                            <Skeleton />
                        </div>
                        <div className="text-center mt-8 font-bold  text-4xl"><Skeleton /> </div>
                        <div className="text-center mt-8 mb-6 font-semibold  text-1xl border-b-2 border-slate-300">created at :-<Skeleton /> </div>
                        <div className="text-left text-1xl font-medium p-4 "><Skeleton count={15} /></div>
                    </div>

                    :

                    <div className=" w-[60rem] flex flex-col m-auto h-screen p-8 ">
                        <div>
                            <img src={luffy} className="w-[40rem] m-auto" />
                        </div>
                        <div className="text-center mt-8 font-bold  text-4xl">{blog.title}</div>
                        <div className="text-center mt-8 mb-6 font-semibold  text-1xl border-b-2 border-slate-300">created at :-{blog.createdAt?.split('T')[0]}</div>
                        <div className="text-left text-1xl font-medium p-4 " dangerouslySetInnerHTML={{ __html: blog.content }} ></div>
                    </div>
            }

        </Layout>
    )
}

export default FullBlog