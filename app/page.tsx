import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main} data-testid="home-page">
      <h1>Hello world!</h1>
    </main>
  );
}
