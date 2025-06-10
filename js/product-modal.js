import { addToCart } from './cart.js';

const modal = document.getElementById('productModal');
const modalImg = modal.querySelector('.modal-product-img');
const modalTitle = modal.querySelector('.modal-product-title');
const modalDescription = modal.querySelector('.modal-product-description');
const modalColorGroup = document.getElementById('modal-color-group');
const modalColorDropdown = document.getElementById('modal-color-dropdown');
const modalColorDropdownBtn = document.getElementById('modal-color-dropdown-btn');
const modalColorDropdownList = document.getElementById('modal-color-dropdown-list');
const modalColorDropdownSelected = document.getElementById('modal-color-dropdown-selected');
const quantityInput = document.getElementById('quantity');
const decreaseQtyBtn = document.querySelector('.modal-qty-btn:first-child');
const increaseQtyBtn = document.querySelector('.modal-qty-btn:last-child');
const addToCartBtn = document.querySelector('.modal-add-to-cart');
const buyNowBtn = document.querySelector('.modal-buy-now');

let currentProduct = null;

function getAllColors() {
    const swatches = document.querySelectorAll('.color-swatch');
    const colors = [];
    swatches.forEach(swatch => {
        const color = swatch.getAttribute('data-color');
        if (color && !colors.includes(color)) colors.push(color);
    });
    return colors;
}

function setupModalColors(selectedColor) {
    const colors = getAllColors();
    modalColorDropdownList.innerHTML = '';
    if (colors.length > 0) {
        colors.forEach((color, idx) => {
            const opt = document.createElement('div');
            opt.className = 'shadcn-dropdown-option' + (selectedColor && selectedColor === color ? ' active' : '');
            opt.setAttribute('data-color', color);
            opt.innerHTML = `<span class="shadcn-dropdown-swatch" style="background:${color};"></span> ${color}`;
            opt.addEventListener('click', function() {
                setModalColor(color);
                closeDropdown();
            });
            modalColorDropdownList.appendChild(opt);
        });
        modalColorGroup.style.display = '';
        setModalColor(selectedColor || colors[0]);
    } else {
        modalColorGroup.style.display = 'none';
    }
}

function setModalColor(color) {
    modalColorDropdownSelected.innerHTML = `<span class="shadcn-dropdown-swatch" style="background:${color};"></span> ${color}`;
    modalColorDropdownBtn.setAttribute('data-color', color);
    modalImg.style.backgroundColor = color;
    modalColorDropdownList.querySelectorAll('.shadcn-dropdown-option').forEach(opt => {
        if (opt.getAttribute('data-color') === color) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

function getModalColor() {
    return modalColorDropdownBtn.getAttribute('data-color') || '';
}

function openDropdown() {
    modalColorDropdownList.style.display = 'block';
    modalColorDropdownBtn.setAttribute('aria-expanded', 'true');
}

function closeDropdown() {
    modalColorDropdownList.style.display = 'none';
    modalColorDropdownBtn.setAttribute('aria-expanded', 'false');
}

function openModal(product) {
    if (!product) return;
    
    currentProduct = product;
    
    // Update modal content
    modalImg.src = product.image_url;
    modalImg.alt = product.name;
    modalTitle.textContent = product.name;
    modalDescription.textContent = product.description || 'No description available.';
    quantityInput.value = 1;
    
    // Update button states
    const isOutOfStock = product.status === 'out-of-stock';
    addToCartBtn.disabled = isOutOfStock;
    buyNowBtn.disabled = isOutOfStock;
    
    addToCartBtn.textContent = isOutOfStock ? 'Out of Stock' : 'Add to Cart';
    buyNowBtn.textContent = isOutOfStock ? 'Out of Stock' : 'Buy Now';
    
    // Show modal
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    
    // Add event listeners
    attachModalEventListeners();
}

function closeModal() {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    currentProduct = null;
    
    // Remove event listeners
    removeModalEventListeners();
}

function updateQuantity(change) {
    if (!currentProduct) return;
    
    const currentValue = parseInt(quantityInput.value);
    const newValue = currentValue + change;
    
    if (newValue >= 1 && newValue <= (currentProduct.stock || 1)) {
        quantityInput.value = newValue;
    }
}

function addToCartFromModal() {
    if (!currentProduct) return;
    
    const quantity = parseInt(quantityInput.value);
    const cart = JSON.parse(localStorage.getItem('knitwear_cart') || '[]');
    
    const existingItem = cart.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            image_url: currentProduct.image_url,
            price: currentProduct.price,
            quantity: quantity
        });
    }
    
    localStorage.setItem('knitwear_cart', JSON.stringify(cart));
    updateCartCount();
    closeModal();
    
    // Show success message
    showToast('Product added to cart!', 'success');
}

function buyNow() {
    if (!currentProduct) return;
    
    const quantity = parseInt(quantityInput.value);
    const cart = [{
        id: currentProduct.id,
        name: currentProduct.name,
        image_url: currentProduct.image_url,
        price: currentProduct.price,
        quantity: quantity
    }];
    
    localStorage.setItem('knitwear_cart', JSON.stringify(cart));
    closeModal();
    
    // Open buy now modal
    const buyNowModal = document.getElementById('buyNowModal');
    if (buyNowModal) {
        buyNowModal.style.display = 'flex';
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('knitwear_cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

function attachModalEventListeners() {
    const modalClose = document.querySelector('.modal-close');
    const productModal = document.getElementById('productModal');
    
    modalClose?.addEventListener('click', closeModal);
    productModal?.addEventListener('click', (e) => {
        if (e.target === productModal) closeModal();
    });
    
    decreaseQtyBtn?.addEventListener('click', () => updateQuantity(-1));
    increaseQtyBtn?.addEventListener('click', () => updateQuantity(1));
    addToCartBtn?.addEventListener('click', addToCartFromModal);
    buyNowBtn?.addEventListener('click', buyNow);
    
    quantityInput?.addEventListener('change', () => {
        if (!currentProduct) return;
        
        const value = parseInt(quantityInput.value);
        const maxStock = currentProduct.stock || 1;
        
        if (value < 1) quantityInput.value = 1;
        if (value > maxStock) quantityInput.value = maxStock;
    });
}

function removeModalEventListeners() {
    const modalClose = document.querySelector('.modal-close');
    const productModal = document.getElementById('productModal');
    
    modalClose?.removeEventListener('click', closeModal);
    productModal?.removeEventListener('click', closeModal);
    decreaseQtyBtn?.removeEventListener('click', () => updateQuantity(-1));
    increaseQtyBtn?.removeEventListener('click', () => updateQuantity(1));
    addToCartBtn?.removeEventListener('click', addToCartFromModal);
    buyNowBtn?.removeEventListener('click', buyNow);
    quantityInput?.removeEventListener('change', () => {});
}

document.addEventListener('DOMContentLoaded', function() {
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    modalColorDropdownBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (modalColorDropdownList.style.display === 'block') {
            closeDropdown();
        } else {
            openDropdown();
        }
    });
    document.addEventListener('click', function() {
        closeDropdown();
    });
    modalColorDropdownList.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    const qtyInput = document.getElementById('modal-qty');
    const qtyBtns = document.querySelectorAll('.modal-qty-btn');
    qtyBtns[0].addEventListener('click', function() {
        let val = parseInt(qtyInput.value, 10) || 1;
        if (val > 1) qtyInput.value = val - 1;
    });
    qtyBtns[1].addEventListener('click', function() {
        let val = parseInt(qtyInput.value, 10) || 1;
        qtyInput.value = val + 1;
    });
    qtyInput.addEventListener('input', function() {
        if (this.value < 1) this.value = 1;
    });
    document.querySelector('.modal-add-to-cart').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const imgSrc = modalImg.src;
        const productTitle = modalTitle.textContent;
        const qty = parseInt(document.getElementById('modal-qty').value, 10) || 1;
        const color = getModalColor();
        addToCart({ title: productTitle, img: imgSrc, qty, color });
        closeModal();
    });
    document.querySelector('.modal-buy-now').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const imgSrc = modalImg.src;
        const productTitle = modalTitle.textContent;
        const qty = parseInt(document.getElementById('modal-qty').value, 10) || 1;
        const color = getModalColor();
        addToCart({ title: productTitle, img: imgSrc, qty, color });
        closeModal();
        document.getElementById('cartModal').style.display = 'block';
        document.getElementById('buyNowModal').style.display = 'flex';
    });
});

export { openModal, closeModal, updateQuantity, addToCartFromModal, buyNow }; 