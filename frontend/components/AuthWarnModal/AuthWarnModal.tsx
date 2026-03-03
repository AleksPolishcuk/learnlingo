import styles from './AuthWarnModal.module.css';

interface Props { onLogin: () => void; onRegister: () => void; }

export default function AuthWarnModal({ onLogin, onRegister }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>🔒</div>
      <h2 className={styles.title}>Login Required</h2>
      <p className={styles.text}>
        This feature is only available for authorized users.<br />
        Please log in or create an account to continue.
      </p>
      <div className={styles.actions}>
        <button className={styles.btnSecondary} onClick={onLogin}>Log In</button>
        <button className={styles.btnPrimary} onClick={onRegister}>Register</button>
      </div>
    </div>
  );
}
