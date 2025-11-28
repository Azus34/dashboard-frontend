import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

export function Header() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? styles.active : '';

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoLink}>
            <div className={styles.logoImg}>
              <img src="/colibri.png" alt="Colibri" className={styles.img} />
            </div>
            <div className={styles.logoText}>
              <h1>Colibri</h1>
              <p>Arroyo Seco</p>
            </div>
          </Link>
        </div>

        <nav className={styles.nav}>
          <Link to="/" className={`${styles.navLink} ${isActive('/')}`}>
            🏠 <span className={styles.label}>Inicio</span>
          </Link>
          <Link to="/map" className={`${styles.navLink} ${isActive('/map')}`}>
            🗺️ <span className={styles.label}>Mapa</span>
          </Link>
          <Link to="/routes-by-month" className={`${styles.navLink} ${isActive('/routes-by-month')}`}>
            📅 <span className={styles.label}>Rutas</span>
          </Link>
          <Link to="/trip-reports" className={`${styles.navLink} ${isActive('/trip-reports')}`}>
            📋 <span className={styles.label}>Reportes</span>
          </Link>
          <Link to="/transactions" className={`${styles.navLink} ${isActive('/transactions')}`}>
            💳 <span className={styles.label}>Transacciones</span>
          </Link>
          <Link to="/finances" className={`${styles.navLink} ${isActive('/finances')}`}>
            💰 <span className={styles.label}>Finanzas</span>
          </Link>
          <Link to="/analytics" className={`${styles.navLink} ${isActive('/analytics')}`}>
            📊 <span className={styles.label}>Análisis</span>
          </Link>
          <Link to="/users" className={`${styles.navLink} ${isActive('/users')}`}>
            👥 <span className={styles.label}>Usuarios</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
