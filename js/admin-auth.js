import { supabase } from './supabase-config.js';

// List of admin emails
const ADMIN_EMAILS = ['ganeshdeep@gmail.com'];

// Function to update user metadata
async function updateUserMetadata(userId) {
    const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { role: 'admin' } }
    );
    if (error) {
        console.error('Error updating user metadata:', error);
        return false;
    }
    return true;
}

// Login handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        const loginButton = document.getElementById('loginButton');
        const loading = document.getElementById('loading');
        errorMessage.style.display = 'none';
        loginButton.disabled = true;
        loading.style.display = 'block';
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            
            // Get user metadata to check role
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            
            // Debug logging
            console.log('Full user object:', user);
            console.log('User metadata:', user.user_metadata);
            
            // Check if user's email is in the admin list
            if (!ADMIN_EMAILS.includes(user.email)) {
                throw new Error('Unauthorized access: Not an admin');
            }
            
            window.location.href = 'admin.html';
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
            loginButton.disabled = false;
            loading.style.display = 'none';
        }
    });
}

// Logout handler
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', async function() {
        await supabase.auth.signOut();
        window.location.href = 'admin-login.html';
    });
}

// Auth check for admin.html
if (window.location.pathname.endsWith('admin.html')) {
    (async function checkAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = 'admin-login.html';
            return;
        }
        
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            window.location.href = 'admin-login.html';
            return;
        }
        
        // Check if user's email is in the admin list
        if (!ADMIN_EMAILS.includes(user.email)) {
            window.location.href = 'admin-login.html';
        }
    })();
} 