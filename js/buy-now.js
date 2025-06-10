// Buy Now Functionality
const buyNowModal = document.getElementById('buyNowModal');
const closeBuyNowModal = document.getElementById('closeBuyNowModal');
const buyNowModalOverlay = document.getElementById('buyNowModalOverlay');
const buyNowForm = document.getElementById('buyNowForm');
const buyNowItems = document.getElementById('buyNowItems');
const buyNowTotal = document.getElementById('buyNowTotal');
const buyNowSubmitBtn = document.getElementById('buyNowSubmitBtn');

// Show buy now modal
function showBuyNowModal() {
    buyNowModal.style.display = 'flex';
    buyNowModalOverlay.style.display = 'block';
    document.body.classList.add('modal-open');
    renderBuyNowItems();
}

// Hide buy now modal
function hideBuyNowModal() {
    buyNowModal.style.display = 'none';
    buyNowModalOverlay.style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Calculate total
function calculateTotal() {
    const cart = JSON.parse(localStorage.getItem('knitwear_cart') || '[]');
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Render buy now items
function renderBuyNowItems() {
    const cart = JSON.parse(localStorage.getItem('knitwear_cart') || '[]');
    
    if (!cart || cart.length === 0) {
        buyNowItems.innerHTML = '<div class="empty-message">No items to purchase.</div>';
        buyNowSubmitBtn.disabled = true;
        return;
    }
    
    buyNowItems.innerHTML = cart.map(item => `
        <div class="buy-now-item">
            <img src="${item.image_url}" alt="${item.name}">
            <div class="buy-now-item-details">
                <h4 class="buy-now-item-title">${item.name}</h4>
                <div class="buy-now-item-meta">
                    <span class="buy-now-item-price">${formatPrice(item.price)}</span>
                    <span class="buy-now-item-qty">Qty: ${item.quantity}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // Update total
    const total = calculateTotal();
    buyNowTotal.textContent = formatPrice(total);
    
    // Enable submit button
    buyNowSubmitBtn.disabled = false;
}

// Handle form submission
async function handleBuyNowSubmit(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(buyNowForm);
        const orderData = {
            customer: {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                zip: formData.get('zip'),
                country: formData.get('country')
            },
            items: JSON.parse(localStorage.getItem('knitwear_cart') || '[]'),
            total: calculateTotal(),
            status: 'pending',
            created_at: new Date().toISOString()
        };
        
        // TODO: Send order to backend
        console.log('Order data:', orderData);
        
        // Clear cart and show success message
        localStorage.removeItem('knitwear_cart');
        hideBuyNowModal();
        showToast('Order placed successfully! We will contact you shortly.', 'success');
        
        // Reset form
        buyNowForm.reset();
    } catch (error) {
        console.error('Error submitting order:', error);
        showToast('Error placing order. Please try again.', 'error');
    }
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
closeBuyNowModal?.addEventListener('click', hideBuyNowModal);
buyNowModalOverlay?.addEventListener('click', hideBuyNowModal);
buyNowForm?.addEventListener('submit', handleBuyNowSubmit);

// Export functions
export {
    showBuyNowModal,
    hideBuyNowModal,
    renderBuyNowItems
}; 