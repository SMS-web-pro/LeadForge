// ============================================================
// LeadForge AI — Notification Toast System
// Affiche les notifications pour les erreurs API (rate limit, crédits épuisés)
// ============================================================

import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { eventBus, LeadForgeEvents } from '../lib/events';
import { apiErrorState, ApiError } from '../lib/api-error-state';
import '../styles/notifications.css';

interface Notification {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  service?: string;
  timestamp: number;
  persistent?: boolean;
}

export function NotificationContainer() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Écouter les événements d'erreur API
    const handleApiError = (error: ApiError) => {
      const notification: Notification = {
        id: `api-error-${Date.now()}`,
        type: error.type === 'rate_limit' ? 'warning' : 'error',
        title: getTitleForError(error),
        message: error.message,
        service: error.service,
        timestamp: Date.now(),
        persistent: error.type === 'credits_exhausted',
      };

      setNotifications(prev => {
        // Éviter les doublons dans les 5 dernières secondes
        const recent = prev.filter(n => 
          n.timestamp > Date.now() - 5000 && 
          n.service === error.service &&
          n.type === notification.type
        );
        if (recent.length > 0) return prev;
        
        return [notification, ...prev].slice(0, 5); // Max 5 notifications
      });

      // Auto-remove pour les non-persistent
      if (!notification.persistent) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, 10000);
      }
    };

    // Écouter l'arrêt des agents
    const handleAgentsStopped = (data: { reason: string; agentIds: string[] }) => {
      const notification: Notification = {
        id: `agents-stopped-${Date.now()}`,
        type: 'error',
        title: 'Agents arrêtés',
        message: `Les agents ont été arrêtés suite à une erreur API. Vérifiez vos crédits ou réessayez plus tard.`,
        timestamp: Date.now(),
        persistent: true,
      };

      setNotifications(prev => [notification, ...prev].slice(0, 5));
    };

    eventBus.on(LeadForgeEvents.API_ERROR, handleApiError);
    eventBus.on(LeadForgeEvents.AGENTS_STOPPED, handleAgentsStopped);

    return () => {
      eventBus.off(LeadForgeEvents.API_ERROR, handleApiError);
      eventBus.off(LeadForgeEvents.AGENTS_STOPPED, handleAgentsStopped);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleReset = () => {
    apiErrorState.reset();
    setNotifications([]);
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-md">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
          onReset={handleReset}
        />
      ))}
    </div>
  );
}

function NotificationToast({ 
  notification, 
  onClose,
  onReset 
}: { 
  notification: Notification; 
  onClose: () => void;
  onReset: () => void;
}) {
  const Icon = getIconForType(notification.type);
  const colors = getColorsForType(notification.type);

  return (
    <div
      className={`rounded-lg shadow-lg border ${colors.bg} ${colors.border} p-4 min-w-[320px] notification-enter`}
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${colors.iconBg}`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${colors.title}`}>
            {notification.title}
          </h4>
          <p className={`text-sm mt-1 ${colors.message}`}
               style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {notification.message}
          </p>
          
          {notification.service && (
            <span className={`text-xs mt-2 inline-block px-2 py-1 rounded ${colors.badge}`}>
              {notification.service.toUpperCase()}
            </span>
          )}
          
          {notification.persistent && (
            <button
              onClick={onReset}
              className={`mt-3 text-xs flex items-center gap-1 ${colors.resetButton} hover:underline`}
            >
              <RefreshCw className="w-3 h-3" />
              Réinitialiser et reprendre
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className={`p-1 rounded-full hover:bg-gray-200 transition-colors ${colors.close}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function getTitleForError(error: ApiError): string {
  switch (error.type) {
    case 'rate_limit':
      return 'Rate Limit Atteint';
    case 'credits_exhausted':
      return 'Crédits Épuisés';
    case 'network_error':
      return 'Erreur Réseau';
    case 'api_error':
      return 'Erreur API';
    default:
      return 'Erreur';
  }
}

function getIconForType(type: Notification['type']) {
  switch (type) {
    case 'error':
      return AlertCircle;
    case 'warning':
      return AlertTriangle;
    case 'info':
      return Info;
    default:
      return Info;
  }
}

function getColorsForType(type: Notification['type']) {
  switch (type) {
    case 'error':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-600',
        iconBg: 'bg-red-100',
        title: 'text-red-900',
        message: 'text-red-700',
        badge: 'bg-red-100 text-red-800',
        close: 'text-red-500 hover:text-red-700',
        resetButton: 'text-red-600',
      };
    case 'warning':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'text-amber-600',
        iconBg: 'bg-amber-100',
        title: 'text-amber-900',
        message: 'text-amber-700',
        badge: 'bg-amber-100 text-800',
        close: 'text-amber-500 hover:text-amber-700',
        resetButton: 'text-amber-600',
      };
    case 'info':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        iconBg: 'bg-blue-100',
        title: 'text-blue-900',
        message: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-800',
        close: 'text-blue-500 hover:text-blue-700',
        resetButton: 'text-blue-600',
      };
    default:
      return getColorsForType('info');
  }
}

// Status indicator component
export function ApiStatusIndicator() {
  const [status, setStatus] = useState(apiErrorState.getStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(apiErrorState.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!status.agentsStopped && status.recentErrorsCount === 0) return null;

  return (
    <div className={`fixed bottom-4 left-4 z-[100] px-4 py-2 rounded-lg shadow-lg ${
      status.agentsStopped 
        ? 'bg-red-600 text-white' 
        : 'bg-amber-500 text-white'
    }`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium">
          {status.agentsStopped 
            ? `Agents arrêtés (${status.recentErrorsCount} erreurs)` 
            : `${status.recentErrorsCount} erreurs API récentes`
          }
        </span>
      </div>
    </div>
  );
}
