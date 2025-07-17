import { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export default function useFetchClinics() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        setError('');
        const session = await Auth.currentSession();
        const token = session.getAccessToken().getJwtToken();
        const config = {
          url: `${API_URL}/clinics`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };
        const response = await axios(config);
        const clinicsData = Array.isArray(response.data)
          ? response.data
          : response.data.clinics || response.data.data || [];
        setClinics(clinicsData.map(clinic => ({
  ...clinic,
  id: String(clinic.id)
})));
      } catch (err) {
        setError('Error al cargar las clínicas');
        setClinics([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  return { clinics, loading, error };
}
