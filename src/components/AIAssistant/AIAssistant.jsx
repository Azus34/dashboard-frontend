import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AIAssistant.module.css';

export function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [businessData, setBusinessData] = useState({
    totalReservations: 0,
    totalRevenue: 0,
    activeRoutes: 0,
    completedTrips: 0,
    pendingReservations: 0,
    cancelledReservations: 0,
  });

  const fetchBusinessData = async () => {
    try {
      const [reservationsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/reservations`),
      ]);

      const reservations = reservationsRes.data || [];

      const completedTripsList = reservations.filter(
        (r) => r.status?.toLowerCase() === 'completed'
      );

      const totalRevenue = completedTripsList.reduce(
        (sum, r) => sum + (parseFloat(r.price) || 0),
        0
      );

      const data = {
        totalReservations: reservations.length,
        totalRevenue,
        activeRoutes: new Set(reservations.map((r) => r.route_id)).size,
        completedTrips: completedTripsList.length,
        pendingReservations: reservations.filter(
          (r) => r.status?.toLowerCase() === 'pending'
        ).length,
        cancelledReservations: reservations.filter(
          (r) => r.status?.toLowerCase() === 'cancelled'
        ).length,
      };

      setBusinessData(data);
      return data;
    } catch (error) {
      console.error('Error fetching business data:', error);
      return businessData;
    }
  };

  const getFallbackResponse = async (message) => {
    const data = await fetchBusinessData();
    const lower = message.toLowerCase();

    // 1. Análisis de ganancias (por defecto)
    if (
      !lower.includes('crecimiento') &&
      !lower.includes('reservas') &&
      !lower.includes('aumentar') &&
      !lower.includes('financi') &&
      !lower.includes('tarifa') &&
      !lower.includes('precio') &&
      !lower.includes('costo') &&
      !lower.includes('expansion') &&
      !lower.includes('ruta') &&
      !lower.includes('ciudad') &&
      !lower.includes('tecnolog') &&
      !lower.includes('app') &&
      !lower.includes('digital')
    ) {
      return `Análisis de Ganancias - Colibrí Arroyo Seco

**Datos actuales:**
• Reservas totales: ${data.totalReservations}
• Completadas: ${data.completedTrips}
• Pendientes: ${data.pendingReservations}
• Canceladas: ${data.cancelledReservations}

**Ingresos:**
• Bruto: $${data.totalRevenue.toFixed(2)} MXN
• Comisión 15%: $${(data.totalRevenue * 0.15).toFixed(2)} MXN
• Neto aproximado: $${(data.totalRevenue * 0.85).toFixed(2)} MXN

**Por viaje:**
• Tarifa promedio: $${(data.totalRevenue / Math.max(data.completedTrips, 1)).toFixed(2)} MXN
• Margen estimado (60%): $${(data.totalRevenue / Math.max(data.completedTrips, 1) * 0.6).toFixed(2)} MXN

**Recomendaciones:**
1. Recordatorios automáticos a pendientes
2. +20% tarifa en horas pico
3. Programa de referidos
4. Fidelización de clientes`;
    }

    if (lower.includes('crecimiento') || lower.includes('reservas') || lower.includes('aumentar')) {
      return `Estrategia de Crecimiento

**Estado actual:**
• ${data.totalReservations} reservas totales
• ${data.completedTrips} completadas (${((data.completedTrips / Math.max(data.totalReservations, 1)) * 100).toFixed(1)}% conversión)

**Metas próximas:**
• Convertir todas las pendientes
• Cancelaciones <20%
• Programa de referidos
• Alianzas locales

**Meta 2026:** 1000 reservas/mes`;
    }

    if (lower.includes('financi') || lower.includes('tarifa') || lower.includes('precio') || lower.includes('costo')) {
      return `Optimización Financiera

**Datos clave:**
• Ingresos: $${data.totalRevenue.toFixed(2)} MXN
• Tarifa promedio: $${(data.totalRevenue / Math.max(data.completedTrips, 1)).toFixed(2)} MXN

**Acciones:**
• Tarifas dinámicas
• Suscripciones mensuales
• Comisión reducida para conductores premium
• Optimizar rutas`;
    }

    if (lower.includes('expansion') || lower.includes('ruta') || lower.includes('ciudad')) {
      return `Plan de Expansión

**Próximas ciudades:** Guadalajara → Monterrey → Puebla

**Por ciudad:**
• 50 conductores
• Centro de operaciones
• Campaña de lanzamiento

**Inversión estimada:** ~$500K USD primer año`;
    }

    if (lower.includes('tecnolog') || lower.includes('app') || lower.includes('digital')) {
      return `Innovaciones Tecnológicas 2026

**Prioridades:**
1. App nativa iOS + Android
2. IA predicción de demanda
3. Integración transporte público
4. Calificaciones y confianza

**Beneficios:**
• +150% reservas por app
• -30% espera
• +40% satisfacción`;
    }

    // Respuesta genérica
    return `Asistente Estratégico - Colibrí Arroyo Seco

**Resumen:**
• Reservas: ${data.totalReservations}
• Completadas: ${data.completedTrips}
• Ingresos: $${data.totalRevenue.toFixed(2)} MXN
• Rutas: ${data.activeRoutes}

Pregúntame sobre ganancias, crecimiento, expansión o tecnología`;
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: message, timestamp: new Date() }]);

    try {
      const currentData = await fetchBusinessData();

      const context = `Datos reales:
- Reservas: ${currentData.totalReservations}
- Completadas: ${currentData.completedTrips}
- Ingresos: $${currentData.totalRevenue.toFixed(2)} MXN
- Rutas activas: ${currentData.activeRoutes}`;

      const res = await axios.post(`${process.env.REACT_APP_API_URL}/ai/query`, {
        message,
        context,
      });

      const content = res.data.success ? res.data.response : res.data.fallback || 'Error de conexión';

      setMessages((prev) => [...prev, { role: 'assistant', content, timestamp: new Date() }]);
    } catch (err) {
      console.error(err);
      const fallback = await getFallbackResponse(message);
      setMessages((prev) => [...prev, { role: 'assistant', content: fallback, timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
    setInputMessage('');
  };

  useEffect(() => {
    fetchBusinessData();
    
    // Mensaje de bienvenida automático
    const welcomeMessage = async () => {
      const data = await fetchBusinessData();
      const welcome = {
        role: 'assistant',
        content: `¡Hola! Soy tu Asistente Estratégico de Colibrí Arroyo Seco.

**Estado actual de tu negocio:**
• 📊 ${data.totalReservations} reservas totales
• ✅ ${data.completedTrips} viajes completados
• ⏳ ${data.pendingReservations} pendientes
• 💰 Ingresos: $${data.totalRevenue.toFixed(2)} MXN

¿En qué puedo ayudarte hoy? Pregúntame sobre:
• Ganancias y finanzas
• Estrategias de crecimiento
• Plan de expansión
• Innovaciones tecnológicas`,
        timestamp: new Date()
      };
      setMessages([welcome]);
    };
    
    welcomeMessage();
  }, []);

  return (
    <div className={styles.aiAssistant}>
      <div className={styles.header}>
        <h2>Asistente Estratégico IA</h2>
        <p>Analiza tu negocio en tiempo real</p>
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}
            >
              <div className={styles.messageContent}>
                {msg.role === 'assistant' && <strong>Asistente:</strong>} {msg.content}
              </div>
              <div className={styles.timestamp}>
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={styles.message}>
              <div className={styles.messageContent}>Asistente está escribiendo...</div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ej: ¿cómo aumentar ganancias?, ¿plan de expansión?..."
            disabled={isLoading}
            className={styles.input}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className={styles.sendButton}
          >
            {isLoading ? 'Enviando' : 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIAssistant;