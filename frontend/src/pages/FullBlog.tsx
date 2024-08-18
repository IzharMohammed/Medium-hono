import Layout from "../layout/Layout";
import luffy from '../../public/luffy.jpeg';

function FullBlog() {
    const text = `Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money. Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money. Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money
    Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money. Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One day, his advisors came to him with a problem: the kingdom was running out of money";
`;


    return (
        <Layout>
            <div className=" w-[60rem] flex flex-col m-auto h-screen p-8 ">
                <div>
                    <img src={luffy} className="w-[40rem] m-auto" />
                </div>
                <div className="text-center mt-8 font-bold  text-4xl">title</div>
                <div className="text-center mt-8 mb-6 font-semibold  text-4xl border-b-2 border-slate-300">username</div>
                <div className="text-left text-1xl font-medium p-4 ">{text}</div>
                <div className="text-left text-1xl font-medium p-4">{text}</div>

            </div>
        </Layout>
    )
}

export default FullBlog