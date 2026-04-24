import { createContext, useContext, useState } from 'react';
// Importamos exatamente o nome que está no seu mockData
import { alertas } from '../data/mockData'; 

const AlertsContext = createContext();

export function AlertsProvider({ children }) {
  // Inicia o estado com a sua const
  const [alerts, setAlerts] = useState(alertas || []);

  // Procura todos onde "lido" é falso
  const unreadCount = alerts.filter(alert => !alert.lido).length;

  // Função para marcar um alerta específico
  const markAsRead = (id) => {
    setAlerts(prev => prev.map(alert => 
      // Muda a propriedade 'lido' para true
      alert.id === id ? { ...alert, lido: true } : alert
    ));
  };

  // Aproveitei para criar uma função bônus caso queira um botão "Limpar todos"
  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, lido: true })));
  };

  return (
    <AlertsContext.Provider value={{ alerts, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  return useContext(AlertsContext);
}