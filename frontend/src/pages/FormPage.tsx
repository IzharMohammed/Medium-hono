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
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState('');
    const [imagelink, setImageLink] = useState('');
    // const [progress, setProgress] = useState({ started: false, pc: 0 });

    const publishBlog = async () => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (!file) {
            setMsg('no file selected');
            return;
        }

        // const fd = new FormData();
        formData.append('image', file);
        setMsg('...uploading');
        console.log('file', file);
        // console.log('fd', fd);


        // axios.post('http://127.0.0.1:8787/upload', fd, {
        //     headers: {
        //         'Content-Type': 'multipart/form-data'
        //     }
        // }).then(res => {
        //     setMsg('upload successful');
        //     console.log(res.data.results.secure_url);
        // }).catch(err => {
        //     setMsg('upload failed');
        //     console.log('Error', err);
        // })


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

    // const handleUpload = () => {
    //     if (!file) {
    //         setMsg('no file selected');
    //         return;
    //     }

    //     const fd = new FormData();
    //     fd.append('image', file);
    //     setMsg('...uploading');
    //     console.log('file', file);
    //     console.log('fd', fd);


    //     axios.post('http://127.0.0.1:8787/upload', fd, {
    //         headers: {
    //             'Content-Type': 'multipart/form-data'
    //         }
    //     }).then(res => {
    //         setMsg('upload successful');
    //         setFile(null);
    //         console.log(res.data.results.secure_url);
    //     }).catch(err => {
    //         setMsg('upload failed');
    //         console.log('Error', err);
    //     })

    // }



    return (
        <div>
            <Navbar />
            {msg && <span>{msg}</span>}
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
                        {/* <h3 className="font-semibold mt-6">Featured Image</h3> */}
                        <div className="mb-0 mt-4  h-[4rem]">
                            <input type="file" onChange={(e: any) => {
                                const selectFile = e.target.files ? e.target.files[0] : null
                                if (selectFile) setFile(selectFile)
                            }} />
                            {/* <Button disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                uploading
                            </Button> */}
                            {/* <button onClick={handleUpload}>Upload</button> */}
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