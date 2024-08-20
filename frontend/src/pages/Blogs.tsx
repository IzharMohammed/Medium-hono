import BlogsCard from "../components/BlogsCard"
import Layout from "../layout/Layout"

function Blogs() {
//  https://backend.izharmohammed21.workers.dev


  return (
    <Layout>
      <div className=" flex flex-wrap gap-8 justify-evenly mb-12">
        <BlogsCard />
      </div>
    </Layout>
  )
}

export default Blogs