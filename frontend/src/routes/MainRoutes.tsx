import { Route, Routes } from "react-router-dom";
import Signup from "../pages/Signup";
import Signin from "../pages/Signin";
import Blogs from "../pages/Blogs";
import FullBlog from "../pages/FullBlog";
import FormPage from "../pages/FormPage";

function MainRoutes() {
    return (
        <Routes>
            <Route path="/SignUp" element={<Signup />}></Route>
            <Route path="/SignIn" element={<Signin />}></Route>
            <Route path="/" element={<Blogs />}></Route>
            <Route path="/FullBlog" element={<FullBlog />}></Route>
            <Route path="/FormPage" element={<FormPage />}></Route>
        </Routes>
    )
}

export default MainRoutes;