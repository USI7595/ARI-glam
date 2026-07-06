import Head from "next/head";
import "../src/styles.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/assets/ari-glam-box.jpeg" type="image/jpeg" />
        <link rel="shortcut icon" href="/assets/ari-glam-box.jpeg" type="image/jpeg" />
        <title>ARI Glam Makeup Artistry</title>
        <meta name="description" content="Soft glam, bridal beauty, and event-ready makeup with a polished finish made for your moment." />
      </Head>
      <Component {...pageProps} />
    </>
  );
}