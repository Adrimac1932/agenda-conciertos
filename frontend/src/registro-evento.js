if (!sessionStorage.getItem('loggedIn')) {
    window.location = 'login.html';
  }

import axios from 'axios';
import { el } from './documentUtil.js';
import { notifyOk } from './dialogUtil.js';

const API_URL = 'http://localhost:8081';

window.loadArtists = function() {
  axios.get(`${API_URL}/artists`)
    .then(response => {
      const select = el('artistId');
      select.innerHTML = '<option value="">-- Selecciona Artista --</option>';
      response.data.forEach(a => {
        select.innerHTML += `<option value="${a.id}">${a.name}</option>`;
      });
    })
    .catch(error => {
      console.error('Error cargando artistas:', error);
    });
};

window.saveEvent = function(event) {
  event.preventDefault();
  const eventData = {
    artist_id: Number(el('artistId').value),
    name:      el('name').value,
    date:      el('date').value,
    location:  el('location').value,
    price:     el('price').value ? parseFloat(el('price').value) : null
  };
  axios.post(`${API_URL}/events`, eventData)
    .then(response => {
      if (response.status === 201) {
        notifyOk('Evento creado').then(() => {
          window.location = 'index.html';
        });
      }
    })
    .catch(error => {
      console.error('Error creando evento:', error);
    });
};
