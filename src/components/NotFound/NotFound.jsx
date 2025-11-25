import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1>Página no encontrada</h1>
        <p>Lo sentimos, la página que buscas no existe o ha sido movida.</p>
        
        <div className={styles.actions}>
          <Link to="/" className={styles.btnPrimary}>
            🏠 Volver al inicio
          </Link>
          <Link to="/map" className={styles.btnSecondary}>
            🗺️ Ver mapa
          </Link>
        </div>

        <div className={styles.suggestions}>
          <h3>Páginas disponibles:</h3>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/map">Mapa</Link></li>
            <li><Link to="/transactions">Transacciones</Link></li>
            <li><Link to="/finances">Finanzas</Link></li>
            <li><Link to="/analytics">Análisis</Link></li>
            <li><Link to="/users">Usuarios</Link></li>
            <li><Link to="/about">Acerca de</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
