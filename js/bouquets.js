import { apiClient } from "./apiClient.js";

const LIMIT = 8;
let currentPage = 1;
let allBouquets = [];
let isLocalMode = false;
let isLoading = false;

const catalogueList = document.querySelector('.catalogue-list.bouquets');
const loadMoreBtn = document.getElementById('load-more-btn');

function renderBouquets(bouquets) {
  if (!catalogueList) return;

  const markup = bouquets.map(bouquet => `
    <li class="catalogue-item" data-id="${bouquet.id}" style="cursor: pointer;">
      <picture>
        <source type="image/webp" srcset="./images/${bouquet.imageBase}@X1.webp 1x, ./images/${bouquet.imageBase}@X2.webp 2x">
        <img loading="lazy" src="./images/${bouquet.imageBase}@X1.jpg" srcset="./images/${bouquet.imageBase}@X2.jpg 2x" alt="${bouquet.title}" class="catalogue-img" width="400" height="296">
      </picture>
      <h3 class="catalogue-item-title">${bouquet.title}</h3>
      <p class="catalogue-item-text">${bouquet.description}</p>
      <p class="catalogue-item-price">$${bouquet.price}</p>
    </li>
  `).join('');

  catalogueList.insertAdjacentHTML('beforeend', markup);
}

function showEndMessage() {
  if (document.querySelector('.end-collection-message')) return;

  const messageHtml = `
    <p class="end-collection-message text" style="text-align: center; margin-top: 24px; color: rgba(3, 12, 1, 0.6); font-style: italic;">
      You've viewed all of our wonderful bouquets!
    </p>
  `;
  if (catalogueList) {
    catalogueList.insertAdjacentHTML('afterend', messageHtml);
  }
}

async function loadBouquets() {
  if (isLoading) return;
  isLoading = true;

  if (loadMoreBtn) {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';
  }

  try {
    let bouquetsToRender = [];
    let hasMore = true;

    if (isLocalMode) {
      const startIndex = (currentPage - 1) * LIMIT;
      const endIndex = currentPage * LIMIT;
      bouquetsToRender = allBouquets.slice(startIndex, endIndex);
      hasMore = endIndex < allBouquets.length;
    } else {
      try {
        const response = await apiClient.get('/bouquets', {
          params: { _page: currentPage, _per_page: LIMIT }
        });

        const responseData = response.data;

        if (responseData && responseData.data && Array.isArray(responseData.data)) {
          bouquetsToRender = responseData.data;
          hasMore = responseData.next !== null && responseData.next !== undefined;
        } else if (Array.isArray(responseData)) {
          allBouquets = responseData;
          const startIndex = (currentPage - 1) * LIMIT;
          const endIndex = currentPage * LIMIT;
          bouquetsToRender = allBouquets.slice(startIndex, endIndex);
          hasMore = endIndex < allBouquets.length;
        } else {
          throw new Error('Unknown API structure');
        }
      } catch (serverError) {
        console.warn('API unavailable. Falling back to local db.json:', serverError);
        isLocalMode = true;

        const localResponse = await apiClient.get('./db.json');
        if (localResponse.data && Array.isArray(localResponse.data.bouquets)) {
          allBouquets = localResponse.data.bouquets;
          const startIndex = (currentPage - 1) * LIMIT;
          const endIndex = currentPage * LIMIT;
          bouquetsToRender = allBouquets.slice(startIndex, endIndex);
          hasMore = endIndex < allBouquets.length;
        } else {
          throw new Error('Invalid local data');
        }
      }
    }

    renderBouquets(bouquetsToRender);

    if (loadMoreBtn) {
      if (hasMore && bouquetsToRender.length > 0) {
        loadMoreBtn.style.display = 'inline-flex';
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Show More';
      } else {
        loadMoreBtn.style.display = 'none';
        showEndMessage();
      }
    }
  } catch (error) {
    console.error('Error loading bouquets:', error);
    if (loadMoreBtn) {
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Show More';
    }
  } finally {
    isLoading = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadBouquets();

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      currentPage += 1;
      loadBouquets();
    });
  }
});
