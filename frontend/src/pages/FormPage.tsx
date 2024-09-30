import { useLocation } from "react-router-dom"
import { useState, useRef } from 'react';
import JoditEditor from 'jodit-react';
import axios from "axios";
import Navbar from "../components/Navbar/Navbar";


function FormPage() {
    const location = useLocation();
    const id = location.state;

    console.log(id);
    const editor = useRef(null);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const token = localStorage.getItem('token') as string;

    const publishBlog = async () => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);

        const response = await axios.post(`http://127.0.0.1:8787/api/v1/blog/add`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "token": token
            }
        })
        if (response.data == "Blog successfully created") {
            alert('Form successfully created');
            setTitle('');
            setContent('');
        }
        console.log(response);

    }





    return (
        <div>
            <Navbar />
            <div className="flex justify-center items-center h-screen">
                <div className="m-4 md: m-0 border border-slate-300 w-[35rem] h-[75vh] p-4 flex flex-col gap-10">
                    <div>
                        <h1 className="text-2xl font-semibold mb-2">New Blog Post</h1>
                        <p>Fill out the form below to create a new blog</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Title</h3>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} className="border border-slate-300 outline-none w-full rounded-sm h-[2rem] mb-4 text-black" type="text" />
                        <h3 className="font-semibold">Content</h3>
                        <div >
                            <JoditEditor
                                className="overflow-auto text-black"
                                ref={editor}
                                value={content}
                                onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
                                onChange={newContent => { setContent(newContent) }}
                            />
                        </div>
                        <h3 className="font-semibold mt-6">Featured Image</h3>
                        <div className="mb-4  h-[4rem]">
                            working on it
                        </div>
                        <div className="flex justify-end">
                            <button onClick={publishBlog} className="bg-black text-white p-2 rounded-lg w-1/3 h-10 ">Publish</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default FormPage