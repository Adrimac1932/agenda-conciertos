if (!sessionStorage.getItem('loggedIn')) {
    window.location = 'login.html';
  }
  
import axios from 'axios';
import { el } from './documentUtil.js';
import { notifyOk } from './dialogUtil.js';

const API_URL = 'http://localhost:8081';

window.saveArtist = function(event) {
  event.preventDefault();
  const artist = {
    name:    el('name').value,
    genre:   el('genre').value,
    website: el('website').value
  };
  axios.post(`${API_URL}/artists`, artist)
    .then(response => {
      if (response.status === 201) {
        notifyOk('Artista creado').then(() => {
          window.location = 'index.html';
        });
      }
    })
    .catch(error => {
      console.error('Error creando artista:', error);
    });
};
