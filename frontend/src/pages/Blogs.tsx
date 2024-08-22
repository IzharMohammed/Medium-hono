import { useState } from "react"
import BlogsCard from "../components/BlogsCard"
import Layout from "../layout/Layout"

function Blogs() {
  //  https://backend.izharmohammed21.workers.dev
  const [search, setsearch] = useState('');

  return (
    <Layout>
      <div className="flex flex-col gap-10">
        <div className="m-auto flex gap-7 md: flex-row ">
          <input
            type="text"
            placeholder="search blog posts"
            className="w-[15rem] p-5 rounded-md outline-none border border-slate-300 md:w-[70rem] h-[30px] "
            value={search}
            onChange={(e) => setsearch(e.target.value)}
          />
          <button className="bg-black text-white w-[7rem] h-[38px] rounded-lg">search</button>
        </div>
        <div className=" flex flex-wrap gap-8 justify-evenly mb-12">
          <BlogsCard search={search} />
        </div>
      </div>
    </Layout>
  )
}

export default Blogs