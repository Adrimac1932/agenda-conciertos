import axios from 'axios';
import { el, td, icon } from './documentUtil.js';
import { notifyOk, confirmDelete } from './dialogUtil.js';

const API_URL = 'http://localhost:8081';

window.readArtists = function() {
  axios.get(`${API_URL}/artists`)
    .then(response => {
      const artists = response.data;
      const tableBody = el('artistsTableBody');
      tableBody.innerHTML = '';

      artists.forEach(artist => {
        const row = document.createElement('tr');
        row.innerHTML =
          td(artist.name) +
          td(artist.genre || '') +
          td(artist.website || '') +
          `<td>
             <a class="btn btn-warning me-2" href="modify-artista.html?id=${artist.id}">
               ${icon('edit')}
             </a>
             <a class="btn btn-danger" href="javascript:window.removeArtist(${artist.id})">
               ${icon('delete')}
             </a>
           </td>`;
        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error cargando artistas:', error);
    });
};

window.removeArtist = function(id) {
  confirmDelete('¿Deseas eliminar este artista?')
    .then(confirmed => {
      if (!confirmed) return;
      return axios.delete(`${API_URL}/artists/${id}`);
    })
    .then(response => {
      if (response && response.status === 204) {
        notifyOk('Artista eliminado').then(() => window.readArtists());
      }
    })
    .catch(error => {
      console.error('Error eliminando artista:', error);
    });
};

window.logout = function() {
    sessionStorage.removeItem('loggedIn');
    window.location = 'login.html';
  };