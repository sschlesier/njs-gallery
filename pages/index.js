import Head from 'next/head'
import Link from 'next/link'
import { getGalleries, getGlobalConfig } from '../lib/dynamic'
import styles from '../styles/Home.module.css'
//todo figure out static export

export default function Home(props) {
  return (
    <div>
      <Head>
        <title>A Gallery</title> {/* todo use a config value for title and description */}
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className={styles.outer} style={{columns: props.columns}}>
          { props.galleries.map( (gallery) => (
            <article className={styles.inner} key={gallery.title}>
              <a href={gallery.webPath}> {/* todo make Link work */}
                <img
                  src={gallery.thumbnail}
                  alt={gallery.title}
                  width="180"
                  height="180" /> {/* todo figure out optimized images for dynamic and static sites */ }
              </a>
            <h2>{gallery.title}</h2>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}

export async function getStaticProps(context) {
  var globalConfig = await getGlobalConfig();
  var galleries = await getGalleries();

  const obj = {props: {
      columns: 2,
      ...galleries,
      ...globalConfig}}
  // console.log(JSON.stringify(obj.props.columns));
  return obj;
}