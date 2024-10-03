import { useNavigate } from "react-router-dom";
import useBlogs from "../hooks";
import Skeleton from "react-loading-skeleton";


function BlogsCard({ search }: { search: string }) {
    // const text = "Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money. Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money";
    const navigate = useNavigate();
    const truncate = (str: any, count: number) => {
        const response = str.split("").splice(0, count).join("");
        return response + '.....';
    }

    const { loading, blogs } = useBlogs();
    console.log('blogs', blogs);


    return (
        <>
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
                        <div className="border border-slate-300 w-[25rem]  flex flex-col gap-4 cursor-pointer" onClick={() => {
                            navigate('/FullBlog', { state: blog.id })
                        }}>
                            <div>
                                <img src={blog.imageUrl} className="size-full" />
                            </div>
                            <div className="p-2 flex flex-col gap-5">
                                <div className="">Created At :- {blog.createdAt.split('T')[0]}</div>
                                <div className="text-3xl font-bold">
                                    {blog.title}</div>
                                <div>{truncate(blog.content, 152)}</div>
                            </div>
                        </div>
                    ))
            }
        </>
    )
}

export default BlogsCard;