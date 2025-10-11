import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Chào mừng đến với Next.js</h1>
      <p className={styles.description}>
        Đây là một dự án Next.js cơ bản sử dụng CSS Modules với Navbar. Bắt đầu bằng cách chỉnh sửa file{' '}
        <code>src/app/page.tsx</code>.
      </p>
      <Link href="/about" className={styles.link}>
        Xem trang Giới thiệu
      </Link>
    </div>
  );
}