import { useNavigate } from "react-router-dom";
import luffy from '../../public/luffy.jpeg';

function BlogsCard() {
    const text = "Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money. Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money";
    const navigate = useNavigate();

    const truncate = (str: any, count: number) => {
        const response = str.split("").splice(0, count).join("");
        return response + '.....';
    }


    return (
        <div className="border border-black w-[24rem] h-[25rem] flex flex-col gap-2 cursor-pointer" onClick={() => {
            navigate('/FullBlog')
        }}>
        <div>
            <img src={luffy}  className="size-full" />
        </div>
            <div className="p-2">
                <div className="">user name</div>
                <div className="text-3xl font-bold">
                    The Joke Tax Chronicles</div>
                <div>{truncate(text, 152)}</div>
            </div>
        </div>
    )
}

export default BlogsCard;