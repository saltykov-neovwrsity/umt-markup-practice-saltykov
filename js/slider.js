import { apiClient } from "./apiClient.js";

const setupSlider = (wrapperSelector, listSelector, prevSelector, nextSelector, dotsContainerSelector) => {
  const wrapper = document.querySelector(wrapperSelector);
  if (!wrapper) return;

  const list = wrapper.querySelector(listSelector);
  const prevBtn = wrapper.querySelector(prevSelector);
  const nextBtn = wrapper.querySelector(nextSelector);
  const dotsContainer = wrapper.querySelector(dotsContainerSelector);

  if (!list || list.children.length === 0) return;

  let dots = [];

  const scrollToItem = (index) => {
    const items = list.children;
    if (items.length === 0 || index < 0 || index >= items.length) return;
    const itemWidth = items[0].getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(list).gap) || 0;
    list.scrollTo({
      left: index * (itemWidth + gap),
      behavior: 'smooth'
    });
  };

  const createDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';

    const items = list.children;
    if (items.length === 0) return;

    const itemWidth = items[0].getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(list).gap) || 0;
    const fullWidth = itemWidth + gap;
    const maxScroll = list.scrollWidth - list.clientWidth;

    const pagesCount = maxScroll <= 5 ? 1 : Math.round(maxScroll / fullWidth) + 1;

    for (let i = 0; i < pagesCount; i++) {
      const li = document.createElement('li');
      li.classList.add('dot');
      if (i === 0) li.classList.add('active');
      dotsContainer.appendChild(li);
    }

    dots = dotsContainer.querySelectorAll('.dot');

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        scrollToItem(index);
      });
    });
  };

  const updateButtons = () => {
    if (!prevBtn && !nextBtn) return;
    const scrollPos = list.scrollLeft;
    const maxScroll = list.scrollWidth - list.clientWidth;

    if (prevBtn) prevBtn.disabled = scrollPos <= 0;
    if (nextBtn) nextBtn.disabled = scrollPos >= maxScroll - 5;
  };

  const updateDots = () => {
    if (!dots.length) return;

    const scrollPos = list.scrollLeft;
    const itemWidth = list.children[0].getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(list).gap) || 0;
    const fullWidth = itemWidth + gap;

    const index = Math.round(scrollPos / fullWidth);

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const itemWidth = list.children[0].getBoundingClientRect().width;
      const gap = parseFloat(window.getComputedStyle(list).gap) || 0;
      list.scrollBy({ left: -(itemWidth + gap), behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const itemWidth = list.children[0].getBoundingClientRect().width;
      const gap = parseFloat(window.getComputedStyle(list).gap) || 0;
      list.scrollBy({ left: itemWidth + gap, behavior: 'smooth' });
    });
  }

  list.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
      updateDots();
      updateButtons();
    });
  });

  window.addEventListener('resize', () => {
    requestAnimationFrame(() => {
      createDots();
      updateDots();
      updateButtons();
    });
  });

  createDots();
  updateButtons();
  updateDots();
};

function renderBestsellers(items) {
  const list = document.querySelector('.bestsellers-list');
  if (!list) return;
  list.innerHTML = items.map(item => `
    <li class="bestsellers-item">
      <picture>
        <source type="image/webp" srcset="./images/${item.imageBase}@X1.webp 1x, ./images/${item.imageBase}@X2.webp 2x">
        <img loading="lazy" src="./images/${item.imageBase}@X1.jpg" srcset="./images/${item.imageBase}@X2.jpg 2x" alt="${item.title}" class="bestsellers-img" width="400" height="320">
      </picture>
      <h3 class="bestsellers-item-title">${item.title}</h3>
      <p class="text bestsellers-item-text">${item.description}</p>
      <p class="bestsellers-item-price">$${item.price}</p>
    </li>
  `).join('');
}

function renderFeedbacks(items) {
  const list = document.querySelector('.feedbacks-list');
  if (!list) return;
  list.innerHTML = items.map(item => `
    <li class="feedbacks-item">
      <p class="text">"${item.text}"</p>
      <p class="feedback-person">${item.author}</p>
    </li>
  `).join('');
}

async function loadSlidersData() {
  try {
    let bestsellers = [];
    try {
      const response = await apiClient.get('/bestsellers');
      bestsellers = response.data;
    } catch (e) {
      console.warn("Failed to load bestsellers, using local fallback:", e);
      const dbResponse = await apiClient.get('./db.json');
      bestsellers = dbResponse.data.bestsellers;
    }
    if (Array.isArray(bestsellers)) {
      renderBestsellers(bestsellers);
    }

    let feedbacks = [];
    try {
      const response = await apiClient.get('/feedbacks');
      feedbacks = response.data;
    } catch (e) {
      console.warn("Failed to load feedbacks, using local fallback:", e);
      const dbResponse = await apiClient.get('./db.json');
      feedbacks = dbResponse.data.feedbacks;
    }
    if (Array.isArray(feedbacks)) {
      renderFeedbacks(feedbacks);
    }

  } catch (error) {
    console.error("Error loading sliders data:", error);
  } finally {
    setupSlider(
      '.bestsellers-slider-wrapper',
      '.bestsellers-list',
      '.prev-btn',
      '.next-btn',
      '.pagination-dots'
    );

    setupSlider(
      '.feedback-slider-wrapper',
      '.feedbacks-list',
      '.prev-btn',
      '.next-btn',
      '.pagination-dots'
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadSlidersData();
});
