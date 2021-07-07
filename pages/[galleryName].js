import Head from 'next/head'
import { getImages } from '../lib/dynamic'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'

export default function Gallery(props) {
  const router = useRouter()
  const { galleryName } = router.query

  return (
    <div>
      <Head>
        <title>{galleryName}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className={styles.outer} style={{columns: props.columns}}>
          { props.images.map( (imagePath) => (
            <article className={styles.inner} key={imagePath}>
              <img
              src={imagePath}
              alt={imagePath}
              width="180"
              height="180" />
            <h2>{imagePath}</h2>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}

export async function getStaticProps(context) {
  const images = await getImages(context.params.galleryName);

  const obj = {props: {
      columns: 2,
      images: images,
      }}
  // console.log(JSON.stringify(obj));
  return obj;
}

export async function getStaticPaths() {
  return { paths: ['/birds'], fallback: false };
}