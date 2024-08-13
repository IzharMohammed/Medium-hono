import Footer from "../components/Footer/Footer"
import Navbar from "../components/Navbar/Navbar"

function Layout({ children }: { children: any }) {
    return (
        <>
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-grow flex ">
                {children}
            </div>
            <Footer />
        </div>
        </>
    )
}

export default Layout