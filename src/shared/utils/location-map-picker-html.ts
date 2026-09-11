/**
 * Interactive map for location picker (WebView + Maps JavaScript API).
 * Temporary Expo Go–friendly path; native react-native-maps can replace this later.
 * Requires EXPO_PUBLIC_GOOGLE_MAPS_API_KEY with Maps JavaScript API enabled.
 * Reverse geocode stays in RN via expo-location — HTML only posts lat/lng.
 */
export function buildLocationMapPickerHtml(
  apiKey: string,
  initialPin: { latitude: number; longitude: number },
  language?: string,
): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body { height: 100%; margin: 0; padding: 0; }
      #map-wrap { position: relative; height: 100%; width: 100%; }
      #map { height: 100%; width: 100%; }
      #center-pin {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 28px;
        height: 40px;
        margin-left: -14px;
        margin-top: -40px;
        pointer-events: none;
        z-index: 2;
      }
    </style>
  </head>
  <body>
    <div id="map-wrap">
      <div id="map"></div>
      <svg id="center-pin" viewBox="0 0 28 40" aria-hidden="true">
        <path
          fill="#bb8727"
          stroke="#FFFFFF"
          stroke-width="2"
          d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z"
        />
        <circle cx="14" cy="14" r="5" fill="#FFFFFF" />
      </svg>
    </div>
    <script>
      let map;
      let idleTimer;

      function sendSelection(lat, lng) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ latitude: lat, longitude: lng }),
        );
      }

      function publishMapCenter() {
        const center = map.getCenter();
        if (!center) return;
        sendSelection(center.lat(), center.lng());
      }

      function schedulePublishMapCenter() {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(publishMapCenter, 250);
      }

      window.__MINING_SET_LOCATION = function(lat, lng) {
        if (!map) return;
        map.panTo({ lat: lat, lng: lng });
        map.setZoom(16);
        sendSelection(lat, lng);
      };

      function initMap() {
        const initial = { lat: ${initialPin.latitude}, lng: ${initialPin.longitude} };
        map = new google.maps.Map(document.getElementById('map'), {
          center: initial,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          rotateControl: false,
          scaleControl: false,
        });

        sendSelection(initial.lat, initial.lng);
        map.addListener('idle', schedulePublishMapCenter);
      }
    </script>
    <script async defer src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap${language ? `&language=${language}` : ''}"></script>
  </body>
</html>`;
}
