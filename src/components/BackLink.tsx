import Link from 'next/link';
import { cn } from '@/lib/utils'; // Giả sử bạn có file utils với cn
import styles from './BackLink.module.css';

interface BackLinkProps {
  className?: string;
}

export default function BackLink({ className }: BackLinkProps) {
  return (
    <Link href="/" className={cn(styles.backLink, className)}>
      Quay về Trang chủ
    </Link>
  );
}