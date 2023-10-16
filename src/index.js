import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
const endMessage = document.querySelector('.end-message');
const imageCountElement = document.getElementById('image-count');

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '39999105-294a8a0dd5096756c71c44741';

let page = 1;
let searchQuery = '';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  searchQuery = e.target.searchQuery.value;
  page = 1;
  gallery.innerHTML = '';
  endMessage.style.display = 'none';
  loadMoreButton.style.display = 'none';
  await fetchImages();
});

loadMoreButton.addEventListener('click', () => {
  page += 1;
  fetchImages();
});

async function fetchImages() {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40,
      },
    });

    if (response.status !== 200) {
      throw new Error('Помилка запиту до сервера');
    }

    const data = response.data;

    if (data.hits.length === 0) {
      if (page === 1) {
        gallery.innerHTML = `<p class="no-results">Sorry, there are no images matching your search query. Please try again.</p>`;
      } else {
        loadMoreButton.style.display = 'none';
        endMessage.style.display = 'block';
      }
    } else {
      data.hits.forEach((image) => {
        const card = createImageCard(image);
        gallery.appendChild(card);
      });

      if (data.totalHits <= page * 40) {
        loadMoreButton.style.display = 'none';
        endMessage.style.display = 'block';
      } else {
        loadMoreButton.style.display = 'block';
      }

      const displayedImagesCount = page * 40;
      imageCountElement.textContent = `Images displayed: ${displayedImagesCount || 0}`;

      Notiflix.Notify.success(`Hooray! We found ${displayedImagesCount} images.`);

      const lightbox = new SimpleLightbox('.gallery a');
      lightbox.refresh();
    }
  } catch (error) {
    Notiflix.Notify.failure(`Помилка: ${error.message}`);
  }
}

function createImageCard(image) {
  const card = document.createElement('a');
  card.href = image.largeImageURL;
  card.title = image.tags;
  card.dataset.lightbox = 'gallery';

  const imageElement = document.createElement('img');
  imageElement.src = image.webformatURL;
  imageElement.alt = image.tags;
  imageElement.loading = 'lazy';

  card.appendChild(imageElement);

  const info = document.createElement('div');
  info.classList.add('info');
  info.innerHTML = `
    <div class="info-item"><b>Likes:</b><p>${image.likes}</p></div>
    <div class="info-item"><b>Views:</b><p>${image.views}</p></div>
    <div class="info-item"><b>Comments:</b><p>${image.comments}</p></div>
    <div class="info-item"><b>Downloads:</b><p>${image.downloads}</p></div>
  `;

  card.appendChild(info);

  return card;
}