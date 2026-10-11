import styles from './App.module.css';
import { ConstructionHero } from './components/hero/ConstructionHero';
import { ProjectsSection } from './components/ProjectsSection';

export function App() {
  return (
    <main className={styles.ground}>
      <div className={styles.starfield} aria-hidden="true" />
      <div className={styles.content}>
        <ConstructionHero />
        <ProjectsSection />
      </div>
    </main>
  );
}
