import { Button } from "../components/ui/button";
import Layout from "../layout/Layout";
import Luffy from "../../public/luffy.jpeg"

function UserDetails() {
    return (
        <>
            <Layout>
                <div className="h-screen w-full">
                    <div className="border border-red-800 h-[25rem]
                                    w-[23rem]          /* Default width for small screens */
                                    m-auto mt-8 p-8
                                    md:w-[40rem]       /* Width 40rem on medium screens and above */
                                    md:border-green-800
                    ">
                        <div className="flex gap-12 mb-12">
                            <div>
                                <img src={Luffy} className="w-[8rem] rounded-full h-[8rem]" />
                            </div>
                            <div>
                                <div className="font-semibold text-3xl">Jane Doe</div>
                                <div className="text-slate-500">@janedoe</div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-8">
                            <div>Software Developer | Coffee Enthusiast</div>
                            <div className="flex ">
                                <div>1234 Followers |  </div>
                                <div> 567 Following</div>
                            </div>
                            <Button className="w-[10rem]">Follow</Button>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    )
}

export default UserDetails;