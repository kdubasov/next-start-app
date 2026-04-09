import styles from './Header.module.css';
import LanguageSelect from './language-select/LanguageSelect';
import ThemeToggle from './theme-toggle/ThemeToggle';

export default function Header() {
  return (
    <header className={styles.header}>
      <div />
      <div className={styles.right}>
        <div className={styles.controls}>
          <LanguageSelect />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
