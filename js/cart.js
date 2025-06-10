// Cart Functionality
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const cartModalOverlay = document.getElementById('cartModalOverlay');
const closeCartModal = document.getElementById('closeCartModal');
const cartItems = document.getElementById('cartItems');
const cartBuyNowBtn = document.getElementById('cartBuyNowBtn');
const cartCount = document.getElementById('cartCount');

// Show cart modal
function showCartModal() {
    cartModal.style.display = 'flex';
    cartModalOverlay.style.display = 'block';
    document.body.classList.add('modal-open');
    renderCartItems();
}

// Hide cart modal
function hideCartModal() {
    cartModal.style.display = 'none';
    cartModalOverlay.style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Get cart items
function getCartItems() {
    return JSON.parse(localStorage.getItem('knitwear_cart') || '[]');
}

// Update cart count
function updateCartCount() {
    const cart = getCartItems();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Calculate cart total
function calculateCartTotal() {
    const cart = getCartItems();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Render cart items
function renderCartItems() {
    const cart = getCartItems();
    
    if (!cart || cart.length === 0) {
        cartItems.innerHTML = '<div id="cartEmptyMsg">Your cart is empty.</div>';
        cartBuyNowBtn.disabled = true;
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
            <img src="${item.image_url}" alt="${item.name}">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <div class="cart-item-meta">
                    <span class="cart-item-price">${formatPrice(item.price)}</span>
                    <span class="cart-item-qty">Qty: ${item.quantity}</span>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">&times;</button>
        </div>
    `).join('');
    
    // Update buy now button
    cartBuyNowBtn.disabled = false;
}

// Add to cart
function addToCart(product, quantity = 1) {
    try {
        const cart = getCartItems();
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                image_url: product.image_url,
                price: product.price,
                quantity: quantity
            });
        }
        
        localStorage.setItem('knitwear_cart', JSON.stringify(cart));
        updateCartCount();
        showToast('Product added to cart!', 'success');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Error adding product to cart. Please try again.', 'error');
    }
}

// Remove from cart
function removeFromCart(productId) {
    try {
        const cart = getCartItems();
        const updatedCart = cart.filter(item => item.id !== productId);
        
        localStorage.setItem('knitwear_cart', JSON.stringify(updatedCart));
        updateCartCount();
        renderCartItems();
        showToast('Product removed from cart', 'success');
    } catch (error) {
        console.error('Error removing from cart:', error);
        showToast('Error removing product from cart. Please try again.', 'error');
    }
}

// Update cart item quantity
function updateCartItemQuantity(productId, quantity) {
    try {
        const cart = getCartItems();
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            item.quantity = quantity;
            localStorage.setItem('knitwear_cart', JSON.stringify(cart));
            updateCartCount();
            renderCartItems();
        }
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        showToast('Error updating quantity. Please try again.', 'error');
    }
}

// Clear cart
function clearCart() {
    localStorage.removeItem('knitwear_cart');
    updateCartCount();
    renderCartItems();
}

// Show toast message
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Event Listeners
cartBtn?.addEventListener('click', showCartModal);
closeCartModal?.addEventListener('click', hideCartModal);
cartModalOverlay?.addEventListener('click', hideCartModal);
cartBuyNowBtn?.addEventListener('click', () => {
    const buyNowModal = document.getElementById('buyNowModal');
    if (buyNowModal) {
        hideCartModal();
        buyNowModal.style.display = 'flex';
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});

// Export functions
export {
    showCartModal,
    hideCartModal,
    getCartItems,
    updateCartCount,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart
}; 