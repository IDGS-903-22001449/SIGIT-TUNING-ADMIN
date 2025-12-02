// Componente para notificar actualizaciones disponibles
import { usePWA } from '../../hooks/usePWA';
import './UpdatePrompt.css';

export const UpdatePrompt = () => {
  const { updateAvailable, updateApp } = usePWA();

  if (!updateAvailable) return null;

  return (
    <div className="update-prompt">
      <div className="update-content">
        <p>Una nueva versión de la aplicación está disponible.</p>
        <button onClick={updateApp} className="update-button">
          Actualizar ahora
        </button>
      </div>
    </div>
  );
};

export default UpdatePrompt;
