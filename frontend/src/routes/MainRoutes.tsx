import { Route, Routes } from "react-router-dom";
import Signup from "../pages/Signup";
import Signin from "../pages/Signin";
import Blogs from "../pages/Blogs";
import FullBlog from "../pages/FullBlog";
import FormPage from "../pages/FormPage";
import AllBlogs from "../pages/AllBlogs";
import * as io from "socket.io-client";
import ChatPage from "../pages/ChatPage";

const socket = io.connect("http://localhost:4000");

function MainRoutes() {
    return (
        <Routes>
            <Route path="/SignUp" element={<Signup />}></Route>
            <Route path="/" element={<Signin />}></Route>
            <Route path="/Blogs" element={<Blogs />}></Route>
            <Route path="/allBlogs" element={<AllBlogs />}></Route>
            <Route path="/FullBlog" element={<FullBlog />}></Route>
            <Route path="/FormPage" element={<FormPage />}></Route>
            <Route path="/chatPage" element={<ChatPage socket={socket} />}></Route>
        </Routes>
    )
}

export default MainRoutes;