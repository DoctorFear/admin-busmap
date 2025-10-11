import Link from 'next/link';
import styles from './page.module.css';

export default function Contact() {
  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Trang Liên hệ</h1>
      <p className={styles.description}>
        Liên hệ với chúng tôi qua email: <a href="mailto:contact@myapp.com">contact@myapp.com</a>
      </p>
      <Link href="/" className={styles.link}>
        Quay về Trang chủ
      </Link>
    </div>
  );
}