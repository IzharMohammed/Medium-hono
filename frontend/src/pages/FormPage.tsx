import { useLocation, useNavigate } from "react-router-dom"
import { useState, useRef } from 'react';
import JoditEditor from 'jodit-react';
import axios from "axios";
import Navbar from "../components/Navbar/Navbar";
import "react-toastify/dist/ReactToastify.css";
import toast from "react-hot-toast";

function FormPage() {
    
    const navigate = useNavigate()
    
    const editor = useRef(null);
    
    const location = useLocation();
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const id = location.state;
    console.log(id);

    const token = localStorage.getItem('token') as string;
    
    const publishBlog = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);

        if (!file) {
            return;
        }

        formData.append('image', file);

        const response = await axios.post(`http://127.0.0.1:8787/api/v1/blog/add`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "token": token
            }
        })

        if (response.data == "Blog successfully created") {
            setTitle('');
            setContent('');
            setLoading(false);
            toast.success('Blog published successfully')
            navigate('/allBlogs');
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
                        <div className="overflow-y-scroll ">
                            <JoditEditor
                                className="overflow-auto  text-black"
                                ref={editor}
                                value={content}
                                onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
                                onChange={newContent => { setContent(newContent) }}
                            />
                        </div>
                        <div className="mb-0 mt-4  h-[4rem]">
                            <input type="file" onChange={(e: any) => {
                                const selectFile = e.target.files ? e.target.files[0] : null
                                if (selectFile) setFile(selectFile)
                            }} />
                        </div>
                        <div className="flex justify-end">
                            {
                                loading ?
                                    <button className="bg-slate-400  text-white p-2 rounded-lg w-1/3 h-10 " disabled>Publishing...</button>
                                    :
                                    <>
                                    <button onClick={publishBlog} className="bg-black text-white p-2 rounded-lg w-1/3 h-10 ">Publish</button>
                                    
                                    </>
                            }

                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default FormPage