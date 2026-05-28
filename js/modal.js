const detailModal = document.getElementById('detail-modal');
const orderModal = document.getElementById('order-modal');

if (detailModal && orderModal) {
  const detailCloseBtn = detailModal.querySelector('[data-modal-close]');
  const modalTitle = detailModal.querySelector('.modal-title');
  const modalPrice = detailModal.querySelector('.modal-price');
  const modalDescription = detailModal.querySelector('.modal-description');
  const modalImg = detailModal.querySelector('.modal-product-img');
  const modalBuyBtn = detailModal.querySelector('.modal-buy-btn');
  const quantityInput = detailModal.querySelector('.modal-quantity-input');

  const orderCloseBtn = orderModal.querySelector('[data-modal-close]');
  const orderForm = orderModal.querySelector('.order-form');

  function updateScrollLock() {
    const isAnyModalOpen = detailModal.classList.contains('is-open') || orderModal.classList.contains('is-open');
    if (isAnyModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  function openDetailModal(productData) {
    if (modalTitle) modalTitle.textContent = productData.title;
    if (modalPrice) modalPrice.textContent = productData.price;
    if (modalDescription) modalDescription.textContent = productData.description;
    
    if (modalImg) {
      modalImg.src = productData.imgSrc;
      modalImg.alt = productData.imgAlt;
    }
    
    if (quantityInput) {
      quantityInput.value = 1;
    }

    detailModal.classList.add('is-open');
    updateScrollLock();
  }

  function closeAllModals() {
    detailModal.classList.remove('is-open');
    orderModal.classList.remove('is-open');
    updateScrollLock();
  }

  function handleCardClick(card) {
    const imgEl = card.querySelector('img');
    const imgSrc = imgEl ? imgEl.getAttribute('src') : '';
    const imgAlt = imgEl ? imgEl.getAttribute('alt') : 'Product Image';

    const title = card.querySelector('.bestsellers-item-title, .catalogue-item-title')?.textContent.trim() || 'Beautiful Bouquet';
    const price = card.querySelector('.bestsellers-item-price, .catalogue-item-price')?.textContent.trim() || '$0.00';
    const description = card.querySelector('.bestsellers-item-text, .catalogue-item-text')?.textContent.trim() || 
                        'A wonderful arrangement of fresh seasonal flowers created with love and care.';

    openDetailModal({ title, price, description, imgSrc, imgAlt });
  }

  const bestsellersList = document.querySelector('.bestsellers-list');
  if (bestsellersList) {
    bestsellersList.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      const card = e.target.closest('.bestsellers-item');
      if (card) {
        handleCardClick(card);
      }
    });
  }

  const catalogueList = document.querySelector('.catalogue-list.bouquets');
  if (catalogueList) {
    catalogueList.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      const card = e.target.closest('li');
      if (card) {
        handleCardClick(card);
      }
    });
  }

  if (modalBuyBtn) {
    modalBuyBtn.addEventListener('click', () => {
      detailModal.classList.remove('is-open');
      orderModal.classList.add('is-open');
      updateScrollLock();
    });
  }

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = orderForm.querySelector('.order-form-inputName');
      const name = nameInput ? nameInput.value.trim() : '';
      
      alert(`Thank you for your order, ${name}! Our manager will contact you shortly to confirm.`);
      
      orderForm.reset();
      closeAllModals();
    });
  }

  if (detailCloseBtn) {
    detailCloseBtn.addEventListener('click', () => {
      detailModal.classList.remove('is-open');
      updateScrollLock();
    });
  }
  if (orderCloseBtn) {
    orderCloseBtn.addEventListener('click', () => {
      orderModal.classList.remove('is-open');
      updateScrollLock();
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      detailModal.classList.remove('is-open');
      updateScrollLock();
    }
    if (e.target === orderModal) {
      orderModal.classList.remove('is-open');
      updateScrollLock();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
}
