import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { supabaseUrl, supabaseKey } from './supabase-config.js';
import { addToCart, updateCartCount } from './cart.js';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// DOM Elements
const productsContainer = document.querySelector('.sonar-portfolio');
const productModal = document.getElementById('productModal');
const modalClose = document.querySelector('.modal-close');
const modalImage = document.querySelector('.modal-product-img');
const modalTitle = document.querySelector('.modal-product-title');
const modalDescription = document.querySelector('.modal-product-description');
const quantityInput = document.getElementById('quantity');
const decreaseQtyBtn = document.querySelector('.modal-qty-btn:first-child');
const increaseQtyBtn = document.querySelector('.modal-qty-btn:last-child');
const addToCartBtn = document.querySelector('.modal-add-to-cart');
const cartCount = document.getElementById('cartCount');

// State
let currentProduct = null;
let isLoading = false;

// Show loading state
function showLoading() {
    isLoading = true;
    productsContainer.innerHTML = '<div class="loading">Loading products...</div>';
}

// Show error state
function showError(message) {
    productsContainer.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
            <button onclick="window.location.reload()" class="btn btn-primary">Try Again</button>
        </div>
    `;
}

// Show empty state
function showEmptyState() {
    productsContainer.innerHTML = `
        <div class="empty-state">
            <p>No products available at the moment.</p>
            <p>Please check back later.</p>
        </div>
    `;
}

// Fetch products from Supabase
async function fetchProducts() {
    try {
        showLoading();
        const { data: products, error } = await supabase
            .from('products')
            .select(`
                *,
                product_tags (
                    tags (
                        id,
                        name
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        showError('Error loading products. Please try again later.');
        return [];
    } finally {
        isLoading = false;
    }
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Render products
function renderProducts(products) {
    if (!products || products.length === 0) {
        showEmptyState();
        return;
    }

    productsContainer.innerHTML = products.map(product => `
        <div class="single_gallery_item" data-product-id="${product.id}">
            <div class="gallery-img">
                <img src="${product.image_url}" alt="${product.name}" loading="lazy">
                ${product.status === 'out-of-stock' ? 
                    '<span class="status-badge status-out-of-stock">Out of Stock</span>' : 
                    product.status === 'new-arrival' ? 
                        '<span class="status-badge status-new">New Arrival</span>' : ''}
            </div>
            <div class="gallery-content">
                <h4>${product.name}</h4>
                <p class="price">${formatPrice(product.price)}</p>
                <button class="add-to-cart-btn" 
                    data-product-id="${product.id}"
                    ${product.status === 'out-of-stock' ? 'disabled' : ''}>
                    <span class="cart-icon">🛒</span>
                    ${product.status === 'out-of-stock' ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners
    attachEventListeners();
}

// Attach event listeners
function attachEventListeners() {
    // Product click handlers
    document.querySelectorAll('.single_gallery_item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.add-to-cart-btn')) {
                const productId = item.dataset.productId;
                openProductModal(productId);
            }
        });
    });

    // Add to cart button handlers
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = btn.dataset.productId;
            const product = {
                id: productId,
                name: btn.closest('.single_gallery_item').querySelector('h4').textContent,
                image_url: btn.closest('.single_gallery_item').querySelector('img').src,
                price: parseFloat(btn.closest('.single_gallery_item').querySelector('.price').textContent.replace(/[^0-9.-]+/g, ''))
            };
            addToCart(product);
        });
    });
}

// Open product modal
async function openProductModal(productId) {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) throw error;

        currentProduct = product;
        modalImage.src = product.image_url;
        modalImage.alt = product.name;
        modalTitle.textContent = product.name;
        modalDescription.textContent = product.description || 'No description available.';
        quantityInput.value = 1;
        
        // Update add to cart button state
        addToCartBtn.disabled = product.status === 'out-of-stock';
        addToCartBtn.textContent = product.status === 'out-of-stock' ? 'Out of Stock' : 'Add to Cart';

        // Show modal
        productModal.style.display = 'flex';
        document.body.classList.add('modal-open');
    } catch (error) {
        console.error('Error opening product modal:', error);
        showToast('Error loading product details. Please try again.', 'error');
    }
}

// Close product modal
function closeProductModal() {
    productModal.style.display = 'none';
    document.body.classList.remove('modal-open');
    currentProduct = null;
}

// Handle quantity changes
function updateQuantity(change) {
    if (!currentProduct) return;
    
    const currentValue = parseInt(quantityInput.value);
    const newValue = currentValue + change;
    
    if (newValue >= 1 && newValue <= (currentProduct.stock || 1)) {
        quantityInput.value = newValue;
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
modalClose?.addEventListener('click', closeProductModal);
productModal?.addEventListener('click', (e) => {
    if (e.target === productModal) closeProductModal();
});

decreaseQtyBtn?.addEventListener('click', () => updateQuantity(-1));
increaseQtyBtn?.addEventListener('click', () => updateQuantity(1));

addToCartBtn?.addEventListener('click', () => {
    if (!currentProduct) return;
    addToCart(currentProduct, parseInt(quantityInput.value));
    closeProductModal();
});

// Handle quantity input changes
quantityInput?.addEventListener('change', () => {
    if (!currentProduct) return;
    
    const value = parseInt(quantityInput.value);
    const maxStock = currentProduct.stock || 1;
    
    if (value < 1) quantityInput.value = 1;
    if (value > maxStock) quantityInput.value = maxStock;
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const products = await fetchProducts();
    renderProducts(products);
    updateCartCount();
});

// Export functions for use in other modules
export {
    renderProducts,
    openProductModal,
    closeProductModal,
    updateQuantity,
    addToCart,
    updateCartCount
}; 