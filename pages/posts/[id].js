/*
* @Author: Mario Ravalli
* @Date:   2021-02-19 17:50:41
* @Last Modified by:   Mario Ravalli
* @Last Modified time: 2021-03-26 00:53:41
*/
import Head from 'next/head'
import Date from '../../components/date'
import Layout from '../../components/layout'
import { getAllPostIds, getPostData } from '../../lib/posts'

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id)
  return {
    props: {
      postData
    }
  }
}

export async function getStaticPaths() {
  const paths = getAllPostIds()
  return {
    paths,
    fallback: false
  }
}

export default function Post({ postData }) {
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <section className="relative py-16 bg-gray-300">
        <div className="container mx-auto px-4">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64">
            <div className="px-6 pb-12">
              <div className="flex flex-wrap justify-center">
                <article>
                  <h1>{postData.title}</h1>
                  <div className="-mt-16 mb-16"><Date dateString={postData.date} /></div>
                  <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
