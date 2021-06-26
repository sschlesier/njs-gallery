import Head from 'next/head'
import { getGalleries } from '../lib/dynamic'
import styles from '../styles/Home.module.css'

export default function Home(props) {
  return (
    <div className={styles.container}>
      <Head>
        <title>A Gallery</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <ul>
          { props.galleries.map( (gallery) => (
            <li>
              {gallery.title}
              <img src={gallery.thumbnail} width="180" height="180" />
            </li>
          ))}
        </ul>
      </main>

      <footer className={styles.footer}>A Gallery</footer>
    </div>
  )
}

export async function getStaticProps(context) {
  const props = {props: await getGalleries()};
  console.log(JSON.stringify(props));
  return props;
}
