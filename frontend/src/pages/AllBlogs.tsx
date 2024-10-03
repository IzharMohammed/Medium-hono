import axios from 'axios';
import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import luffy from '../../public/luffy.jpeg';
import Layout from '../layout/Layout';
import Skeleton from "react-loading-skeleton";

interface Blog {
    authorId: number,
    content: string
    createdAt: string
    id: number
    imageUrl: string
    published: boolean
    title: string
}

function AllBlogs() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const navigate = useNavigate();
    const [loading, setloading] = useState(true);
    const [search, setsearch] = useState('');

    const fetchBlogById = async () => {
        setloading(true);
        const response = await axios.get(`http://127.0.0.1:8787/api/v1/allBlogs`);
        console.log(response);
        setBlogs(response.data);
        setloading(false);
    }

    useEffect(() => {
        fetchBlogById();
    }, []);
    console.log('all blogs', blogs);

    const truncate = (str: any, count: number) => {
        const response = str.split("").splice(0, count).join("");
        return response + '.....';
    }

    return (
        <>
            <Layout>
                <div className="flex flex-col gap-10">
                    <div className="m-auto flex gap-7 md: flex-row ">
                        <input
                            type="text"
                            placeholder="search blog posts"
                            className="w-[15rem] p-5 text-black rounded-md outline-none border border-slate-300 md:w-[70rem] h-[30px] "
                            value={search}
                            onChange={(e) => setsearch(e.target.value)}
                        />
                        <button className="bg-black text-white w-[7rem] h-[38px] rounded-lg">search</button>
                    </div>
                    <div className=" flex flex-wrap gap-8 justify-evenly  mb-12">
                        <div className='flex flex-wrap gap-8 justify-evenly mb-12'>
                            {
                                loading ?
                                    (
                                        Array.from({ length: 10 }).map((_, index) => (
                                            <div
                                                key={index}
                                                className="border border-slate-100 w-[25rem] flex flex-col gap-4 cursor-pointer"
                                            >
                                                <div>
                                                    <Skeleton height={200} />
                                                </div>
                                                <div className="p-2 flex flex-col gap-5">
                                                    <div className="text-3xl font-bold">
                                                        <Skeleton width={`80%`} />
                                                    </div>
                                                    <div>
                                                        <Skeleton count={3} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) :
                                    blogs.filter(blog => blog.title.includes(search)).map(blog => (
                                        <div className="transition ease-in-out delay-150  hover:-translate-y-1 hover:scale-110  duration-500  border border-slate-300 w-[25rem]  flex flex-col gap-4 cursor-pointer m-4" onClick={() => {
                                            navigate('/FullBlog', { state: blog.id })
                                        }}>
                                            <div>
                                                {
                                                    blog.imageUrl ?
                                                        <img src={blog.imageUrl} className="size-full" />
                                                        :
                                                        <img src={luffy} className="size-full" />
                                                }
                                            </div>
                                            <div className="p-2 flex flex-col gap-5">
                                                <div className="">Created At :- {blog.createdAt.split('T')[0]}</div>
                                                <div className="text-3xl font-bold">
                                                    {blog.title}</div>
                                                <div dangerouslySetInnerHTML={{ __html: truncate(blog.content, 152) }}></div>
                                            </div>
                                        </div>
                                    ))

                            }
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    )
}

export default AllBlogs