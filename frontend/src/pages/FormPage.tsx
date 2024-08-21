import { useLocation } from "react-router-dom"

function FormPage() {
    const location = useLocation();
    const id = location.state;
    console.log(id);

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="m-4 md: m-0 border border-slate-300 w-[35rem] h-[75vh] p-4 flex flex-col gap-10">
                <div>
                    <h1 className="text-2xl font-semibold mb-2">New Blog Post</h1>
                    <p>Fill out the form below to create a new blog</p>
                </div>
                <div>
                    <h3 className="font-semibold">Title</h3>
                    <input className="border border-slate-300 outline-none w-full rounded-sm h-[2rem] mb-4" type="text" />
                    <h3 className="font-semibold">Content</h3>
                    <input type="text" className="border border-slate-300 outline-none w-full rounded-sm h-[10rem]" />
                    <h3 className="font-semibold mt-6">Featured Image</h3>
                    <div className="mb-4">Still working on it ....</div>
                    <div className="flex justify-end">
                        <button className="bg-black text-white p-2 rounded-lg w-1/3 h-10 ">Publish</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FormPage