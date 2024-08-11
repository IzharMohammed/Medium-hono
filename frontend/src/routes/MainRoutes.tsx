import { Route, Routes } from "react-router-dom";
import Signup from "../pages/signup";
import Signin from "../pages/signin";
import Blogs from "../pages/Blogs";

function MainRoutes() {
    return (
        <Routes>
            <Route path="/SignUp" element={<Signup />}></Route>
            <Route path="/SignIn" element={<Signin />}></Route>
            <Route path="/Blogs" element={<Blogs />}></Route>
        </Routes>
    )
}

export default MainRoutes;