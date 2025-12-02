# Configuración PWA - SigitTuning Admin

## ✅ Cambios realizados

### 1. **Archivos de configuración PWA**

- ✅ `public/manifest.json` - Manifest completo con iconos, shortcuts y screenshots
- ✅ `public/robots.txt` - Archivo robots para SEO
- ✅ `public/sw.js` - Service Worker personalizado

### 2. **Actualización de HTML**

- ✅ `index.html` - Agregadas etiquetas meta para PWA:
  - `manifest.json` enlazado
  - Apple mobile meta tags
  - Viewport mejorado con viewport-fit
  - Registro del Service Worker

### 3. **Componentes y Hooks**

- ✅ `src/hooks/usePWA.js` - Hook para manejar actualizaciones
- ✅ `src/components/UpdatePrompt/UpdatePrompt.jsx` - Componente de notificación
- ✅ `src/components/UpdatePrompt/UpdatePrompt.css` - Estilos con animaciones

### 4. **Configuración Vite**

- ✅ `vite.config.js` - Configuración PWA mejorada con:
  - Workbox para cacheo inteligente
  - Estrategia Network First para APIs
  - Cache First para fuentes
  - Dev options para testing

### 5. **Integración en App**

- ✅ `src/App.jsx` - Importado UpdatePrompt para mostrar notificaciones

## 🚀 Próximos pasos

### 1. **Generar y agregar iconos**

Necesitas crear/agregar estos iconos en `public/`:

```
icon-192x192.png           (192x192 px)
icon-512x512.png           (512x512 px)
icon-192x192-maskable.png  (192x192 px - para adaptive icons)
icon-512x512-maskable.png  (512x512 px - para adaptive icons)
screenshot-540x720.png     (540x720 px)
screenshot-1280x720.png    (1280x720 px)
```

**Recomendación:** Usa herramientas online como:

- https://www.favicon-generator.org/
- https://maskable.app/

### 2. **Construir y probar**

```bash
npm run build
npm run preview
```

### 3. **Validar PWA**

En Chrome DevTools:

1. Abre DevTools (F12)
2. Ve a la pestaña "Application"
3. En el lado izquierdo verás "Service Workers" y "Manifest"
4. Verifica que el manifest se carga correctamente

### 4. **Instalar como app**

- En Chrome: URL bar → Install app
- En Android: Menu → Install app
- En iOS: Share → Add to Home Screen

## 📱 Funcionalidades PWA habilitadas

- ✅ **Instalable**: Funciona como aplicación nativa
- ✅ **Offline**: Cache de archivos principales
- ✅ **Actualizaciones**: Notificación cuando hay nueva versión
- ✅ **Responsive**: Funciona en cualquier dispositivo
- ✅ **Shortcuts**: Acceso directo a Dashboard y Compras
- ✅ **Apple compatible**: Meta tags para iOS

## 📋 Verificación final

Después de agregar los iconos, ejecuta:

```bash
npm run build
```

Busca en la salida mensajes como:

- `✓ Generated PWA registration file`
- `✓ Compiled successfully`

## 🔧 Personalización

### Cambiar colores tema

Edita en `vite.config.js`:

```javascript
theme_color: '#00BCD4',        // Color barra de estado
background_color: '#1a1a1a',   // Color fondo al abrir
```

### Agregar más shortcuts

En `public/manifest.json`, añade en el array `shortcuts`:

```json
{
  "name": "Nombre del Shortcut",
  "short_name": "Corto",
  "description": "Descripción",
  "url": "/ruta",
  "icons": [{ "src": "/icon-192x192.png", "sizes": "192x192" }]
}
```

### Cambiar estrategia de cache

En `vite.config.js` en la sección `workbox.runtimeCaching`:

- `NetworkFirst`: Intenta red primero, luego cache
- `CacheFirst`: Usa cache primero, luego red
- `StaleWhileRevalidate`: Sirve cache mientras actualiza en background

## 📚 Referencias

- https://web.dev/progressive-web-apps/
- https://vitejs.dev/guide/
- https://vite-plugin-pwa.netlify.app/
