import Footer from "../components/Footer/Footer"
import Navbar from "../components/Navbar/Navbar"

function Layout({ children }: { children: any }) {
    return (
        <>
        <div className="flex flex-col ">
            <Navbar />
            <div className="flex flex-grow overflow-auto ">
                {children}
            </div>
            <Footer />
        </div>
        </>
    )
}

export default Layout