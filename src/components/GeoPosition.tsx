import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useGeolocated } from 'react-geolocated';

type CoordinatesType = {
  lat: number;
  lng: number;
  source: string;
};

const GeoFinder = () => {
  const [inputAddress, setInputAddress] = useState('');
  const [coordinates, setCoordinates] = useState<CoordinatesType | null>(null);

  // GOOGLE GEOCODING API KEY (remplace par la tienne)

  // A. Géocodage Google Maps : adresse → coordonnées
  const handleGeocode = async () => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: inputAddress,
          key: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
        },
      });

      const location = response.data.results[0].geometry.location;
      setCoordinates({
        lat: location.lat,
        lng: location.lng,
        source: 'Adresse (Google Maps)',
      });
    } catch (error) {
      console.error("Erreur avec l'adresse :", error);
    }
  };

  // B. Position actuelle avec react-geolocated
  const { coords, getPosition } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    suppressLocationOnMount: true,
  });

  const handleUseCurrentLocation = () => {
    getPosition(); // demande la localisation
  };

  useEffect(() => {
    if (coords) {
      setCoordinates({
        lat: coords.latitude,
        lng: coords.longitude,
        source: 'Position actuelle',
      });
    }
  }, [coords]);

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px' }}>
      <h2>Obtenir des coordonnées</h2>

      {/* Champ d'adresse */}
      <input
        type="text"
        placeholder="Adresse ou ville"
        value={inputAddress}
        onChange={e => setInputAddress(e.target.value)}
        style={{ width: '100%', padding: '8px' }}
      />
      <button onClick={handleGeocode} style={{ marginTop: '10px' }}>
        🔍 Trouver avec Google Maps
      </button>

      <hr style={{ margin: '20px 0' }} />

      {/* Bouton localisation */}
      <button onClick={handleUseCurrentLocation}>📍 Utiliser ma position actuelle</button>

      {/* Affichage résultat */}
      {coordinates && (
        <div style={{ marginTop: '20px' }}>
          <h4>Coordonnées obtenues :</h4>
          <p>
            <strong>Latitude :</strong> {coordinates.lat}
          </p>
          <p>
            <strong>Longitude :</strong> {coordinates.lng}
          </p>
          <p>
            <em>Source : {coordinates.source}</em>
          </p>
        </div>
      )}
    </div>
  );
};

export default GeoFinder;
