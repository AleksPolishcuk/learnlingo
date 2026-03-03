import { User } from '@/types';
import styles from './UserAvatar.module.css';

interface Props { user: User; size?: number; onClick?: () => void; }

export default function UserAvatar({ user, size = 40, onClick }: Props) {
  return (
    <div className={styles.avatar} style={{ width: size, height: size, fontSize: size * 0.38 }}
      onClick={onClick} role="button" aria-label="User menu">
      {user.name[0].toUpperCase()}
    </div>
  );
}
