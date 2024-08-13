
function Navbar() {
    return (
        <>
            <div className="border border-slate-500 mb-8">
                <nav className="flex justify-between p-4 border">
                    <div className=" text-2xl font-bold">
                        Medium
                    </div>
                    <div className="flex gap-4">
                        <div>Home</div>
                        <div>Trending</div>
                        <div>Topics</div>
                        <div>write</div>
                    </div>
                </nav>
            </div>
        </>
    )
}

export default Navbar