/**
 * Admin Utilities - Authentication and Dashboard
 * Professional admin system for Classic Dreamspread
 */

(function() {
    'use strict';

    // Supabase Configuration (loaded from server /config endpoint)
    let SUPABASE_URL = '';
    let SUPABASE_ANON_KEY = '';

    const API_BASE = (location.protocol === 'file:' || location.hostname === 'localhost') 
        ? 'http://localhost:3000' 
        : 'https://att-home-decor-api.onrender.com';

    let supabaseClient;

    // Auto-generated notes for subcategories
    const SUBCATEGORY_NOTES = {
        // Bedspreads
        'single bed bedspreads': 'Designed to fit a standard single bed comfortably. Durable fabric, easy to wash, and suitable for everyday use.',
        'double bed bedspreads with two pillow cases': 'Sized for double beds and comes with two matching pillow cases. Offers a neat, coordinated bedroom look.',
        'king size with one sheet and two pillow cases': 'Full king-size coverage with one matching bedsheet and two pillow cases. Ideal for spacious, modern bedrooms.',
        'king size with two sheets with 4 pillow cases': 'Complete king-size set including two sheets and four pillow cases. Suitable for large households or premium setups.',
        'queen size with two pillow cases and 2 curtains of the same kind': 'Queen-size bedspread set with two pillow cases and two matching curtains. Provides full bedroom coordination.',
        'duvet with two pillow cases and a bedsheet': 'Comfortable duvet set with two pillow cases and a matching bedsheet. Suitable for all-season use.',
        'duvet': 'Soft and warm duvet designed for comfort and durability. Can be paired with any standard duvet cover.',
        'waterproof sheet': 'Protective sheet designed to prevent liquid penetration. Ideal for children, hospitals, and guest rooms.',
        // Pillows
        'comfortten': 'Soft, supportive pillow designed for neck and head comfort. Suitable for long-term sleeping use.',
        'normal cotton': 'Traditional cotton-filled pillow. Breathable, affordable, and easy to maintain.',
        // Blankets
        'student blankets': 'Lightweight and easy to carry. Suitable for students, hostels, and everyday use.',
        'big blanket': 'Large-sized blanket providing full body coverage and extra warmth. Ideal for home use.',
        // Curtains
        'two in one': 'Simple dual-layer curtain suitable for living rooms and bedrooms. Provides basic privacy and light control.',
        'two in one with designs': 'Dual-layer curtains with decorative patterns. Enhances interior appearance while maintaining functionality.',
        'three in one': 'Multi-layer curtain set offering improved light control, privacy, and decoration.',
        'door curtains': 'Designed specifically for doorways. Helps reduce dust, sunlight, and unwanted visibility.',
        'bathroom curtains': 'Water-resistant curtains suitable for bathroom use. Easy to clean and designed for moisture-rich areas.'
    };

    // Subcategories mapped by category
    const CATEGORY_SUBCATEGORIES = {
        'bedspreads': [
            'Single bed bedspreads',
            'Double bed bedspreads with two pillow cases',
            'King size with one sheet and two pillow cases',
            'King size with two sheets with 4 pillow cases',
            'Queen size with two pillow cases and 2 curtains of the same kind',
            'Duvet with two pillow cases and a bedsheet',
            'Duvet',
            'Waterproof sheet'
        ],
        'pillow': [
            'Comfortten',
            'Normal cotton'
        ],
        'blanket': [
            'Student blankets',
            'Big blanket'
        ],
        'curtain': [
            'Two in one',
            'Two in one with designs',
            'Three in one',
            'Door curtains',
            'Bathroom curtains'
        ]
    };

    // Function to populate subcategories dropdown
    function populateSubcategories(categorySelect, subcategorySelect) {
        let category = (categorySelect.value || '').toLowerCase().trim();
        
        // Normalize category names (handle plural/singular variations)
        if (category === 'pillows') category = 'pillow';
        if (category === 'blankets') category = 'blanket';
        if (category === 'curtains') category = 'curtain';
        if (category === 'bedspread') category = 'bedspreads';
        
        console.log('Populating subcategories for category:', category);
        
        if (category && CATEGORY_SUBCATEGORIES[category]) {
            console.log('Found subcategories:', CATEGORY_SUBCATEGORIES[category]);
            const menu = document.getElementById(subcategorySelect.id + 'Menu');
            if (menu) {
                menu.innerHTML = '';
                CATEGORY_SUBCATEGORIES[category].forEach(subcat => {
                    const option = document.createElement('div');
                    option.className = 'dropdown-option';
                    option.textContent = subcat;
                    option.dataset.value = subcat;
                    menu.appendChild(option);
                });
                // Re-attach click handlers
                attachDropdownHandlers();
            }
        } else {
            console.log('No subcategories found for category:', category);
        }
    }

    // Initialize custom dropdowns
    function initializeDropdowns() {
        const triggers = document.querySelectorAll('.dropdown-trigger');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', function(e) {
                e.stopPropagation();
                const menu = this.nextElementSibling;
                if (menu && menu.classList.contains('dropdown-menu')) {
                    // Close other menus
                    document.querySelectorAll('.dropdown-menu.open').forEach(m => {
                        if (m !== menu) {
                            m.classList.remove('open');
                            m.previousElementSibling.classList.remove('open');
                        }
                    });
                    // Toggle this menu
                    menu.classList.toggle('open');
                    this.classList.toggle('open');
                }
            });
        });
        
        attachDropdownHandlers();
    }

    function attachDropdownHandlers() {
        const options = document.querySelectorAll('.dropdown-option');
        
        options.forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                const menu = this.closest('.dropdown-menu');
                const trigger = menu.previousElementSibling;
                const selectId = trigger.dataset.select;
                const value = this.dataset.value;
                
                // Update hidden input
                const hiddenInput = document.getElementById(selectId);
                if (hiddenInput) {
                    hiddenInput.value = value;
                    
                    // Update trigger text
                    trigger.textContent = this.textContent;
                    trigger.dataset.value = value;
                    
                    // Mark as selected
                    menu.querySelectorAll('.dropdown-option').forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    // Close menu
                    menu.classList.remove('open');
                    trigger.classList.remove('open');
                    
                    // Trigger change event on hidden input for our listeners
                    hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu.open').forEach(menu => {
            menu.classList.remove('open');
            menu.previousElementSibling.classList.remove('open');
        });
    });

    // Function to populate subcategories dropdown
    function populateSubcategories(categorySelect, subcategorySelect) {
        let category = (categorySelect.value || '').toLowerCase().trim();
        
        // Normalize category names (handle plural/singular variations)
        if (category === 'pillows') category = 'pillow';
        if (category === 'blankets') category = 'blanket';
        if (category === 'curtains') category = 'curtain';
        if (category === 'bedspread') category = 'bedspreads';
        
        console.log('Populating subcategories for category:', category);
        subcategorySelect.innerHTML = '<option value="">-- Select Subcategory --</option>';
        
        if (category && CATEGORY_SUBCATEGORIES[category]) {
            console.log('Found subcategories:', CATEGORY_SUBCATEGORIES[category]);
            CATEGORY_SUBCATEGORIES[category].forEach(subcat => {
                const option = document.createElement('option');
                option.value = subcat;
                option.textContent = subcat;
                subcategorySelect.appendChild(option);
            });
        } else {
            console.log('No subcategories found for category:', category);
        }
    }

    // Load public config from server
    async function loadClientConfig() {
        // Hardcode public config to avoid fetch issues
        SUPABASE_URL = 'https://upmhieojblkvtgkxtocn.supabase.co';
        SUPABASE_ANON_KEY = 'sb_publishable_4lmKpyR0VTfgH5L4kkvLSQ_hi9XnpUM';
        return true;
    }

    /**
     * Initialize Supabase client
     */
    function initSupabase() {
        if (!window.supabase || typeof window.supabase.createClient !== 'function') {
            console.error('Supabase library not loaded');
            return null;
        }
        
        try {
            const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client created successfully');
            return client;
        } catch (err) {
            console.error('Error creating Supabase client:', err);
            return null;
        }
    }

    /**
     * Password Toggle Utility
     */
    class PasswordToggle {
        constructor(inputId, buttonId) {
            this.input = document.getElementById(inputId);
            this.button = document.getElementById(buttonId);
            
            if (!this.input || !this.button) {
                console.warn('PasswordToggle: Elements not found', { input: !!this.input, button: !!this.button });
      return null;
    }

            this.isVisible = false;
            this.init();
        }

        init() {
            // Store bound methods
            this.handleClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggle();
            };

            this.handleKeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggle();
                }
            };

            // Add event listeners
            this.button.addEventListener('click', this.handleClick);
            this.button.addEventListener('keydown', this.handleKeydown);

            // Set initial state
            this.updateUI();

            // Prevent form submission on button click
            this.button.type = 'button';
        }

        toggle() {
            this.isVisible = !this.isVisible;
            this.input.type = this.isVisible ? 'text' : 'password';
            this.updateUI();
            
            // Maintain focus on input for better UX
            if (document.activeElement !== this.input) {
                this.input.focus();
            }
        }

        updateUI() {
            const icon = this.button.querySelector('.toggle-icon');
            if (icon) {
                icon.textContent = this.isVisible ? '🙈' : '👁';
            }
            this.button.setAttribute('aria-label', this.isVisible ? 'Hide password' : 'Show password');
            this.button.setAttribute('aria-pressed', this.isVisible.toString());
            
            // Add class for styling
            if (this.isVisible) {
                this.button.classList.add('active');
                this.input.classList.add('password-revealed');
            } else {
                this.button.classList.remove('active');
                this.input.classList.remove('password-revealed');
            }
        }

        destroy() {
            if (this.button && this.handleClick) {
                this.button.removeEventListener('click', this.handleClick);
                this.button.removeEventListener('keydown', this.handleKeydown);
            }
        }
    }

    /**
     * Initialize Login Page
     */
    async function initLogin() {
        try {
            const loginForm = document.getElementById('loginForm');
            const loginBtn = document.getElementById('loginBtn');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const statusEl = document.getElementById('status');
            const emailError = document.getElementById('email-error');
            const passwordError = document.getElementById('password-error');

            if (!loginForm || !loginBtn || !emailInput || !passwordInput) {
                console.error('Login form elements not found');
                return;
            }

            // Form validation
            function validateForm() {
                let isValid = true;

                // Email validation
                if (!emailInput.value.trim() || !emailInput.validity.valid) {
                    emailError.textContent = 'Please enter a valid email address';
                    emailInput.setAttribute('aria-invalid', 'true');
                    isValid = false;
                } else {
                    emailError.textContent = '';
                    emailInput.setAttribute('aria-invalid', 'false');
                }

                // Password validation
                if (!passwordInput.value || passwordInput.value.length < 6) {
                    passwordError.textContent = 'Password must be at least 6 characters';
                    passwordInput.setAttribute('aria-invalid', 'true');
                    isValid = false;
                } else {
                    passwordError.textContent = '';
                    passwordInput.setAttribute('aria-invalid', 'false');
                }

                return isValid;
            }

            // Real-time validation
            emailInput.addEventListener('blur', validateForm);
            passwordInput.addEventListener('blur', validateForm);

            /**
             * Redirect to dashboard
             */
            function redirectToDashboard() {
                // Show success message
                showStatus('Login successful! Redirecting...', 'success');

                // Re-enable button (in case redirect fails)
                loginBtn.disabled = false;
                loginBtn.classList.remove('loading');
                loginBtn.setAttribute('aria-busy', 'false');

                // Use an absolute dashboard URL to avoid relative-path resolution issues
                const dashboardUrl = `${window.location.origin}/admin/dashboard.html`;
                console.log('Redirecting to (absolute):', dashboardUrl);

                // Redirect after brief delay to show success message
                setTimeout(() => {
                    try {
                        window.location.href = dashboardUrl;

                        // Fallback: if still on login page after 1 second, force replace
                        setTimeout(() => {
                            if (window.location.pathname.includes('login')) {
                                console.warn('Redirect failed, forcing absolute redirect...');
                                window.location.replace(dashboardUrl);
                            }
                        }, 1000);
                    } catch (err) {
                        console.error('Redirect error:', err);
                        // Force replace as last resort
                        window.location.replace(dashboardUrl);
                    }
                }, 600);
            }

            // Add form submission listener immediately to prevent page refresh
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Clear previous errors
                clearStatus();
                emailError.textContent = '';
                passwordError.textContent = '';

                // Check if Supabase is ready
                if (!supabaseClient) {
                    showStatus('Authentication system not ready. Please wait or refresh the page.', 'error');
                    return;
                }

                // Validate form
                if (!validateForm()) {
                    showStatus('Please fix the errors above', 'error');
                    return;
                }

                // Show loading state
                loginBtn.disabled = true;
                loginBtn.classList.add('loading');
                loginBtn.setAttribute('aria-busy', 'true');

                try {
                    const email = emailInput.value.trim();
                    const password = passwordInput.value;

                    console.log('Attempting login for:', email);

                    // Sign in with Supabase
                    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
                        email: email,
                        password: password
                    });

                    if (authError) {
                        console.error('Authentication error:', authError);
                        throw new Error(authError.message || 'Login failed. Please check your credentials.');
                    }

                    if (!authData || !authData.user) {
                        throw new Error('Login failed. No user data returned.');
                    }

                    console.log('Authentication successful, checking admin role...');

                    // Check if user has admin role
                    const { data: profile, error: profileError } = await supabaseClient
                        .from('profiles')
                        .select('role, email')
                        .eq('id', authData.user.id)
                        .single();

                    console.log('Profile check result:', { profile, profileError });

                    // Handle profile check errors
                    if (profileError) {
                        console.error('Profile error:', profileError);

                        // If profile doesn't exist or select failed, request the server to bootstrap the profile
                        // The server uses the service role key to upsert the profile safely.
                        try {
                            // Obtain a current access token from the client auth session
                            const sessionResp = await supabaseClient.auth.getSession();
                            const token = sessionResp?.data?.session?.access_token || null;

                            if (!token) {
                                console.error('No access token available to call bootstrap endpoint');
                                await supabaseClient.auth.signOut();
                                throw new Error('Access denied. Unable to verify admin privileges.');
                            }

                            const bootstrapRes = await fetch(API_BASE + '/api/profiles/bootstrap', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });

                            if (!bootstrapRes.ok) {
                                const body = await bootstrapRes.json().catch(() => ({}));
                                console.error('Bootstrap failed:', body);
                                await supabaseClient.auth.signOut();
                                throw new Error(body.error || 'Access denied. Unable to verify admin privileges.');
                            }

                            const newProfile = await bootstrapRes.json().catch(() => null);
                            if (newProfile && newProfile.role === 'admin') {
                                console.log('Admin profile created via bootstrap, redirecting...');
                                redirectToDashboard();
                                return;
                            }

                            console.error('Bootstrap did not return an admin profile', newProfile);
                            await supabaseClient.auth.signOut();
                            throw new Error('Access denied. Unable to verify admin privileges.');
                        } catch (bErr) {
                            console.error('Bootstrap error:', bErr);
                            await supabaseClient.auth.signOut();
                            throw new Error('Access denied. Unable to verify admin privileges.');
                        }
                    }

                    // Verify admin role
                    if (!profile || profile.role !== 'admin') {
                        console.warn('User does not have admin role:', profile);
                        await supabaseClient.auth.signOut();
                        throw new Error('Access denied. Admin privileges required.');
                    }

                    // Success - redirect to dashboard
                    console.log('Admin login successful, redirecting...');
                    redirectToDashboard();

                } catch (err) {
                    console.error('Login error:', err);
                    const errorMessage = err.message || 'Login failed. Please check your credentials.';
                    showStatus(errorMessage, 'error');
                    
                    // Hide password on error for security
                    if (passwordInput.type === 'text') {
                        passwordInput.type = 'password';
                    }

                    // Re-enable button on error
                    loginBtn.disabled = false;
                    loginBtn.classList.remove('loading');
                    loginBtn.setAttribute('aria-busy', 'false');
                }
            });

            // Initialize password toggle - simple implementation
            const toggleButton = document.getElementById('togglePassword');
            
            if (passwordInput && toggleButton) {
                let isVisible = false;
                toggleButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    isVisible = !isVisible;
                    passwordInput.type = isVisible ? 'text' : 'password';
                    const icon = toggleButton.querySelector('.toggle-icon');
                    if (icon) {
                        icon.textContent = isVisible ? '🙈' : '👁';
                    }
                    toggleButton.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password');
                });
                console.log('Password toggle initialized');
            } else {
                console.error('Password toggle elements not found');
            }

            // Check if Supabase client is available
            if (!supabaseClient) {
                showStatus('Unable to initialize authentication. Please refresh the page.', 'error');
                return;
            }

            console.log('Supabase client initialized successfully');
        } catch (initError) {
            console.error('Error initializing login page:', initError);
            const statusEl = document.getElementById('status');
            if (statusEl) {
                statusEl.textContent = 'Error initializing login form. Please refresh the page.';
                statusEl.className = 'error';
            }
        }
    }

    /**
     * Show status message
     */
    function showStatus(message, type = 'error') {
        const statusEl = document.getElementById('status');
        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.className = type;
        statusEl.setAttribute('role', 'alert');
    }

    /**
     * Clear status message
     */
    function clearStatus() {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = '';
            statusEl.className = '';
        }
    }

    /**
     * Initialize Dashboard
     */
    async function initDashboard() {
        const logoutBtn = document.getElementById('logoutBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        const productsTable = document.getElementById('productsTable');
        const userEmailEl = document.getElementById('userEmail');

        // Grouping toggle state
        let groupByCategory = false;
        const groupToggleBtn = document.getElementById('groupToggleBtn');
        if (groupToggleBtn) {
            try {
                groupByCategory = localStorage.getItem('groupByCategory') === 'true';
            } catch (e) { groupByCategory = false; }
            groupToggleBtn.setAttribute('aria-pressed', String(groupByCategory));
            groupToggleBtn.classList.toggle('active', groupByCategory);
            groupToggleBtn.addEventListener('click', () => {
                groupByCategory = !groupByCategory;
                try { localStorage.setItem('groupByCategory', String(groupByCategory)); } catch (e) {}
                groupToggleBtn.setAttribute('aria-pressed', String(groupByCategory));
                groupToggleBtn.classList.toggle('active', groupByCategory);
                // re-render table
                loadDashboard();
            });
        }

        // Bulk actions
        const selectAllCheckbox = document.getElementById('selectAll');
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const bulkStockBtn = document.getElementById('bulkStockBtn');

        function updateBulkButtons() {
            const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
            const hasSelection = checkedBoxes.length > 0;
            if (bulkDeleteBtn) bulkDeleteBtn.style.display = hasSelection ? 'inline-block' : 'none';
            if (bulkStockBtn) bulkStockBtn.style.display = hasSelection ? 'inline-block' : 'none';
        }

        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.product-checkbox');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
                updateBulkButtons();
            });
        }

        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', async () => {
                const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
                if (checkedBoxes.length === 0) return;
                const ids = Array.from(checkedBoxes).map(cb => cb.dataset.id).filter(Boolean);
                if (ids.length === 0) return;

                const ok = confirm(`Are you sure you want to delete ${ids.length} product(s)? This cannot be undone.`);
                if (!ok) return;

                bulkDeleteBtn.disabled = true;
                try {
                    const sessionResp = await supabaseClient.auth.getSession();
                    const token = sessionResp?.data?.session?.access_token || null;

                    for (const id of ids) {
                        const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`, {
                            method: 'DELETE',
                            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                        });
                        if (!res.ok) {
                            const err = await res.json().catch(() => ({}));
                            throw new Error(err.error || `Failed to delete ${id}`);
                        }
                    }

                    loadDashboard();
                } catch (err) {
                    console.error('Bulk delete error:', err);
                    alert('Error deleting products: ' + (err.message || err));
                } finally {
                    bulkDeleteBtn.disabled = false;
                }
            });
        }

        if (bulkStockBtn) {
            bulkStockBtn.addEventListener('click', async () => {
                const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
                if (checkedBoxes.length === 0) return;
                const ids = Array.from(checkedBoxes).map(cb => cb.dataset.id).filter(Boolean);
                if (ids.length === 0) return;

                const newStock = prompt('Enter new stock status (in_stock, low_stock, out_of_stock):', 'in_stock');
                if (!newStock || !['in_stock', 'low_stock', 'out_of_stock'].includes(newStock)) return;

                bulkStockBtn.disabled = true;
                try {
                    const sessionResp = await supabaseClient.auth.getSession();
                    const token = sessionResp?.data?.session?.access_token || null;

                    for (const id of ids) {
                        const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`, {
                            method: 'PUT',
                            headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'Authorization': `Bearer ${token}` } : {}),
                            body: JSON.stringify({ stock_status: newStock })
                        });
                        if (!res.ok) {
                            const err = await res.json().catch(() => ({}));
                            throw new Error(err.error || `Failed to update ${id}`);
                        }
                    }

                    loadDashboard();
                } catch (err) {
                    console.error('Bulk stock update error:', err);
                    alert('Error updating stock: ' + (err.message || err));
                } finally {
                    bulkStockBtn.disabled = false;
                }
            });
        }

        if (!logoutBtn) {
            return; // Not on dashboard page
        }

        // Check if Supabase client is available
        if (!supabaseClient) {
            console.error('Supabase client not available');
            document.body.innerHTML = '<div style="padding: 2rem; text-align: center;"><h2>Error</h2><p>Unable to initialize authentication. Please refresh the page.</p></div>';
            return;
        }

        // Check authentication
        checkAuth();

        // Load dashboard data
        loadDashboard();

        // Load click tracking stats (function defined below)

        // Clicks loader: fetch tracking stats and render in admin table
        async function loadClicks() {
            try {
                const resp = await fetch(API_BASE + '/api/tracking');
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const list = await resp.json();
                const tbody = document.getElementById('clicksTable');
                if (!tbody) return;
                if (!Array.isArray(list) || list.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="2">No click data available</td></tr>`;
                    return;
                }

                tbody.innerHTML = list.map(item => {
                    const title = item.name || item.id || 'Unknown';
                    const clicks = Number(item.clicks || 0).toLocaleString();
                    return `
                        <tr>
                            <td>${escapeHtml(title)}</td>
                            <td>${escapeHtml(clicks)}</td>
                        </tr>
                    `;
                }).join('');
            } catch (err) {
                console.error('Failed to load click stats:', err);
                const tbody = document.getElementById('clicksTable');
                if (tbody) tbody.innerHTML = `<tr><td colspan="2">Unable to load click statistics</td></tr>`;
            }
        }

        // Invoke after defining
        loadClicks();

        // Toggle WhatsApp Clicks section
        const toggleClicksBtn = document.getElementById('toggleClicksBtn');
        const clicksTableWrapper = document.getElementById('clicksTableWrapper');
        if (toggleClicksBtn && clicksTableWrapper) {
            toggleClicksBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const isHidden = clicksTableWrapper.style.display === 'none';
                clicksTableWrapper.style.display = isHidden ? '' : 'none';
                toggleClicksBtn.textContent = isHidden ? 'Hide' : 'Show';
                // Save preference to localStorage
                localStorage.setItem('clicksSectionHidden', !isHidden);
            });
            
            // Restore preference on page load
            if (localStorage.getItem('clicksSectionHidden') === 'true') {
                clicksTableWrapper.style.display = 'none';
                toggleClicksBtn.textContent = 'Show';
            }
        }

        // Logout handler
        logoutBtn.addEventListener('click', async () => {
            try {
                await supabaseClient.auth.signOut();
                window.location.href = './login.html';
            } catch (err) {
                console.error('Logout error:', err);
                alert('Error signing out. Please try again.');
            }
        });

        // Refresh handler
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                loadDashboard();
            });
        }

        // Add Product UI handlers
        const addProductBtn = document.getElementById('addProductBtn');
        const addProductModal = document.getElementById('addProductModal');
        const addProductForm = document.getElementById('addProductForm');
        const cancelAddProduct = document.getElementById('cancelAddProduct');

        function openAddModal() {
            if (addProductModal) addProductModal.classList.add('show');
        }
        function closeAddModal() {
            if (addProductModal) addProductModal.classList.remove('show');
        }

        if (addProductBtn) {
            addProductBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openAddModal();
            });
        }

        if (cancelAddProduct) {
            cancelAddProduct.addEventListener('click', (e) => {
                e.preventDefault();
                closeAddModal();
            });
        }

            // Subcategory behavior: show curtain-specific select when category is 'curtain'
            const curtainSubcategories = [
                'two in one',
                'three in one',
                'door curtains',
                'bathroom curtains'
            ];

            // Helper: Title-case for option labels
            function toTitleCase(str) {
                return String(str || '')
                    .split(' ')
                    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
                    .join(' ');
            }

            // Pillow and blanket subcategories
            // Pillow types per request: 'Comfortten' and 'Normal Cotton'
            const pillowSubcategories = [
                'comfortten',
                'normal cotton'
            ];

            const blanketSubcategories = [
                'student blankets',
                'big blanket'
            ];

            function renderSubcategoryField(categoryValue) {
                const container = document.getElementById('prodSubcategoryContainer');
                if (!container) return;

                const cat = String(categoryValue || '').trim().toLowerCase();
                if (cat === 'bedspreads' || cat === 'bedspread') {
                    // render select with bedspread options
                    const select = document.createElement('select');
                    select.id = 'prodSubcategory';
                    select.style.padding = '8px';
                    select.style.width = '100%';
                    const emptyOpt = document.createElement('option');
                    emptyOpt.value = '';
                    emptyOpt.textContent = 'Select bedspread type (optional)';
                    select.appendChild(emptyOpt);
                    const bedspreadsSubcategories = [
                        'Single bed bedspreads',
                        'Double bed bedspreads with two pillow cases',
                        'King size with one sheet and two pillow cases',
                        'King size with two sheets with 4 pillow cases',
                        'Queen size with two pillow cases and 2 curtains of the same kind',
                        'Duvet with two pillow cases and a bedsheet',
                        'Duvet',
                        'Waterproof sheet'
                    ];
                    bedspreadsSubcategories.forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s;
                        opt.textContent = toTitleCase(s);
                        select.appendChild(opt);
                    });
                    container.innerHTML = '';
                    container.appendChild(select);
                } else if (cat === 'pillow' || cat === 'pillows') {
                    // render select with pillow options
                    const select = document.createElement('select');
                    select.id = 'prodSubcategory';
                    select.style.padding = '8px';
                    select.style.width = '100%';
                    const emptyOpt = document.createElement('option');
                    emptyOpt.value = '';
                    emptyOpt.textContent = 'Select pillow type (optional)';
                    select.appendChild(emptyOpt);
                    pillowSubcategories.forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s;
                        opt.textContent = toTitleCase(s);
                        select.appendChild(opt);
                    });
                    container.innerHTML = '';
                    container.appendChild(select);
                } else if (cat === 'blanket' || cat === 'blankets') {
                    // render select with blanket options
                    const select = document.createElement('select');
                    select.id = 'prodSubcategory';
                    select.style.padding = '8px';
                    select.style.width = '100%';
                    const emptyOpt = document.createElement('option');
                    emptyOpt.value = '';
                    emptyOpt.textContent = 'Select blanket type (optional)';
                    select.appendChild(emptyOpt);
                    blanketSubcategories.forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s;
                        opt.textContent = toTitleCase(s);
                        select.appendChild(opt);
                    });
                    container.innerHTML = '';
                    container.appendChild(select);
                } else if (cat === 'curtain' || cat === 'curtains') {
                    // render select with curtain options
                    const select = document.createElement('select');
                    select.id = 'prodSubcategory';
                    select.style.padding = '8px';
                    select.style.width = '100%';
                    const emptyOpt = document.createElement('option');
                    emptyOpt.value = '';
                    emptyOpt.textContent = 'Select curtain type (optional)';
                    select.appendChild(emptyOpt);
                    curtainSubcategories.forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s;
                        opt.textContent = toTitleCase(s);
                        select.appendChild(opt);
                    });
                    container.innerHTML = '';
                    container.appendChild(select);
                } else {
                    // render text input for generic subcategory
                    const input = document.createElement('input');
                    input.id = 'prodSubcategory';
                    input.placeholder = 'Subcategory (e.g. Single bed bedspreads, Duvet, Comfortten)';
                    input.style.padding = '8px';
                    input.style.width = '100%';
                    container.innerHTML = '';
                    container.appendChild(input);
                }
                
                // Attach change listener to the newly created subcategory field
                const subcatElement = document.getElementById('prodSubcategory');
                if (subcatElement) {
                    subcatElement.addEventListener('change', (e) => {
                        const subcatValue = e.target.value.trim().toLowerCase();
                        console.log('Subcategory selected:', subcatValue);
                        
                        // Try to find notes element with retries
                        let notesEl = document.getElementById('prodNotes');
                        console.log('Notes element found on first try:', !!notesEl);
                        
                        if (!notesEl) {
                            console.log('Retrying to find notes element...');
                            // Search in parent form
                            const form = document.getElementById('addProductForm');
                            if (form) {
                                notesEl = form.querySelector('[id="prodNotes"]');
                                console.log('Found via querySelector:', !!notesEl);
                            }
                        }
                        
                        console.log('Note text available:', SUBCATEGORY_NOTES[subcatValue] ? 'YES' : 'NO');
                        if (notesEl && SUBCATEGORY_NOTES[subcatValue]) {
                            notesEl.value = SUBCATEGORY_NOTES[subcatValue];
                            console.log('Notes filled with:', SUBCATEGORY_NOTES[subcatValue].substring(0, 50) + '...');
                        } else {
                            console.log('Could not fill notes - notesEl:', !!notesEl, 'hasNote:', !!SUBCATEGORY_NOTES[subcatValue]);
                        }
                    });
                }
            }

            // Similar function for edit form
            function renderEditSubcategoryField(categoryValue, subcategoryValue) {
                const container = document.getElementById('editProdSubcategoryContainer');
                if (!container) return;

                const cat = String(categoryValue || '').trim().toLowerCase();
                if (cat === 'bedspreads' || cat === 'bedspread') {
                    // render select with bedspread options
                    const select = document.createElement('select');
                    select.id = 'editProdSubcategory';
                    select.style.padding = '8px';
                    select.style.width = '100%';
                    const emptyOpt = document.createElement('option');
                    emptyOpt.value = '';
                    emptyOpt.textContent = 'Select bedspread type (optional)';
                    select.appendChild(emptyOpt);
                    const bedspreadsSubcategories = [
                        'Single bed bedspreads',
                        'Double bed bedspreads with two pillow cases',
                        'King size with one sheet and two pillow cases',
                        'King size with two sheets with 4 pillow cases',
                        'Queen size with two pillow cases and 2 curtains of the same kind',
                        'Duvet with two pillow cases and a bedsheet',
                        'Duvet',
                        'Waterproof sheet'
                    ];
                    bedspreadsSubcategories.forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s;
                        opt.textContent = toTitleCase(s);
                        if (s.toLowerCase() === String(subcategoryValue || '').trim().toLowerCase()) {
                            opt.selected = true;
                        }
                        select.appendChild(opt);
                    });
                    container.innerHTML = '';
                    container.appendChild(select);
                } else if (cat === 'pillow' || cat === 'pillows') {
                    // render select with pillow options
                    const select = document.createElement('select');
                    select.id = 'editProdSubcategory';
                    select.style.padding = '8px';
                    select.style.width = '100%';
                    const emptyOpt = document.createElement('option');
                    emptyOpt.value = '';
                    emptyOpt.textContent = 'Select pillow type (optional)';
                    select.appendChild(emptyOpt);
                    pillowSubcategories.forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s;
                        opt.textContent = toTitleCase(s);
                        if (s.toLowerCase() === String(subcategoryValue || '').trim().toLowerCase()) {
                            opt.selected = true;
                        }
                        select.appendChild(opt);
                    });
                    container.innerHTML = '';
                    container.appendChild(select);
                } else if (cat === 'blanket' || cat === 'blankets') {
                    // render select with blanket options
                    const select = document.createElement('select');
                    select.id = 'editProdSubcategory';
                    select.style.padding = '8px';
                    select.style.width = '100%';
                    const emptyOpt = document.createElement('option');
                    emptyOpt.value = '';
                    emptyOpt.textContent = 'Select blanket type (optional)';
                    select.appendChild(emptyOpt);
                    blanketSubcategories.forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s;
                        opt.textContent = toTitleCase(s);
                        if (s.toLowerCase() === String(subcategoryValue || '').trim().toLowerCase()) {
                            opt.selected = true;
                        }
                        select.appendChild(opt);
                    });
                    container.innerHTML = '';
                    container.appendChild(select);
                } else if (cat === 'blanket' || cat === 'blankets') {
                    // render select with blanket options
                    const select = document.createElement('select');
                    select.id = 'editProdSubcategory';
                    select.style.padding = '8px';
                    select.style.width = '100%';
                    const emptyOpt = document.createElement('option');
                    emptyOpt.value = '';
                    emptyOpt.textContent = 'Select blanket type (optional)';
                    select.appendChild(emptyOpt);
                    blanketSubcategories.forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s;
                        opt.textContent = toTitleCase(s);
                        if (s.toLowerCase() === String(subcategoryValue || '').trim().toLowerCase()) {
                            opt.selected = true;
                        }
                        select.appendChild(opt);
                    });
                    container.innerHTML = '';
                    container.appendChild(select);
                } else if (cat === 'curtain' || cat === 'curtains') {
                    // render select with curtain options
                    const select = document.createElement('select');
                    select.id = 'editProdSubcategory';
                    select.style.padding = '8px';
                    select.style.width = '100%';
                    const emptyOpt = document.createElement('option');
                    emptyOpt.value = '';
                    emptyOpt.textContent = 'Select curtain type (optional)';
                    select.appendChild(emptyOpt);
                    curtainSubcategories.forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s;
                        opt.textContent = toTitleCase(s);
                        if (s.toLowerCase() === String(subcategoryValue || '').trim().toLowerCase()) {
                            opt.selected = true;
                        }
                        select.appendChild(opt);
                    });
                    container.innerHTML = '';
                    container.appendChild(select);
                } else {
                    // render text input for generic subcategory
                    const input = document.createElement('input');
                    input.id = 'editProdSubcategory';
                    input.placeholder = 'Subcategory (e.g. Single bed bedspreads, Duvet, Comfortten)';
                    input.style.padding = '8px';
                    input.style.width = '100%';
                    input.value = subcategoryValue || '';
                    container.innerHTML = '';
                    container.appendChild(input);
                }
                
                // Attach change listener to the newly created edit subcategory field
                const editSubcatElement = document.getElementById('editProdSubcategory');
                if (editSubcatElement) {
                    editSubcatElement.addEventListener('change', (e) => {
                        const subcatValue = e.target.value.trim().toLowerCase();
                        console.log('Edit Subcategory selected:', subcatValue);
                        
                        let notesEl = document.getElementById('editProdNotes');
                        console.log('Edit Notes element found on first try:', !!notesEl);
                        
                        if (!notesEl) {
                            console.log('Retrying to find edit notes element...');
                            const form = document.getElementById('editProductForm');
                            if (form) {
                                notesEl = form.querySelector('[id="editProdNotes"]');
                                console.log('Found via querySelector:', !!notesEl);
                            }
                        }
                        
                        console.log('Edit Note text available:', SUBCATEGORY_NOTES[subcatValue] ? 'YES' : 'NO');
                        if (notesEl && SUBCATEGORY_NOTES[subcatValue]) {
                            notesEl.value = SUBCATEGORY_NOTES[subcatValue];
                            console.log('Edit Notes filled with:', SUBCATEGORY_NOTES[subcatValue].substring(0, 50) + '...');
                        } else {
                            console.log('Could not fill edit notes - notesEl:', !!notesEl, 'hasNote:', !!SUBCATEGORY_NOTES[subcatValue]);
                        }
                    });
                }
            }

            // Normalize subcategory values for consistent storage
            function normalizeSubcategoryForCategory(categoryValue, subcategoryValue) {
                const cat = String(categoryValue || '').trim().toLowerCase();
                const val = String(subcategoryValue || '').trim();
                if (!val) return '';
                const low = val.toLowerCase();
                if (cat === 'curtain' || cat === 'curtains') {
                    // Map common variants to canonical curtain subcategories
                    const mapping = {
                        'two in one': 'two in one',
                        '2 in 1': 'two in one',
                        'two-in-one': 'two in one',
                        'three in one': 'three in one',
                        '3 in 1': 'three in one',
                        'three-in-one': 'three in one',
                        'door curtains': 'door curtains',
                        'door': 'door curtains',
                        'bathroom curtains': 'bathroom curtains',
                        'bathroom': 'bathroom curtains'
                    };
                    if (mapping[low]) return mapping[low];
                    for (const k of curtainSubcategories) {
                        if (low.includes(k.split(' ')[0])) return k;
                    }
                    return low;
                }

                if (cat === 'pillows' || cat === 'pillow') {
                        const mapping = {
                            'comfortten': 'comfortten',
                            'normal cotton': 'normal cotton',
                            'throw pillow': 'throw',
                            'throw': 'throw',
                            'lumbar pillow': 'lumbar',
                            'lumbar': 'lumbar',
                            'decorative': 'decorative',
                            'bolster': 'bolster',
                            'standard': 'standard'
                        };
                        if (mapping[low]) return mapping[low];
                        for (const k of pillowSubcategories) {
                            if (low.includes(k)) return k;
                        }
                        return low;
                }

                if (cat === 'blankets' || cat === 'blanket') {
                    const mapping = {
                        'duvet': 'duvet',
                        'duvet cover': 'duvet',
                        'comforter': 'comforter',
                        'throw': 'throw',
                        'electric': 'electric',
                        'weighted': 'weighted'
                    };
                    if (mapping[low]) return mapping[low];
                    for (const k of blanketSubcategories) {
                        if (low.includes(k)) return k;
                    }
                    return low;
                }

                return low;
            }

            // Attach listener to edit category input for dynamic subcategory field
            const editCategoryEl = document.getElementById('editProdCategory');
            if (editCategoryEl) {
                editCategoryEl.addEventListener('input', (e) => {
                    renderEditSubcategoryField(e.target.value, '');
                });
            }

            // Attach listener to edit subcategory for auto-fill notes
            const editSubcategoryInput = document.getElementById('editProdSubcategory');
            if (editSubcategoryInput) {
                editSubcategoryInput.addEventListener('change', (e) => {
                    const subcatValue = e.target.value.trim().toLowerCase();
                    const notesEl = document.getElementById('editProdNotes');
                    if (notesEl && SUBCATEGORY_NOTES[subcatValue]) {
                        notesEl.value = SUBCATEGORY_NOTES[subcatValue];
                    }
                });
            }

            // Attach listener to add category input for dynamic subcategory field
            const addCategoryEl = document.getElementById('prodCategory');
            if (addCategoryEl) {
                addCategoryEl.addEventListener('change', (e) => {
                    renderSubcategoryField(e.target.value);
                    // Clear notes when category changes
                    const notesEl = document.getElementById('prodNotes');
                    if (notesEl) notesEl.value = '';
                });
            }


        // Normalize WhatsApp numbers and provide a preview link
        const whatsappEl = document.getElementById('prodWhatsapp');
        function normalizeWhatsapp(s) {
            if (!s) return '';
            const t = String(s).trim();
            const lower = t.toLowerCase();
            if (lower.startsWith('http://') || lower.startsWith('https://') || lower.includes('wa.me')) return t;
            let digits = t.replace(/[^0-9+]/g, '');
            if (!digits) return '';
            if (digits.startsWith('+')) digits = digits.slice(1);
            if (digits.startsWith('00')) digits = digits.slice(2);
            if (digits.startsWith('0')) {
                digits = '233' + digits.slice(1);
            }
            if (!digits.startsWith('233') && digits.length <= 10) {
                digits = '233' + digits;
            }
            return `https://wa.me/${digits}`;
        }

        if (whatsappEl) {
            whatsappEl.addEventListener('blur', () => {
                const normalized = normalizeWhatsapp(whatsappEl.value);
                if (normalized) {
                    whatsappEl.value = normalized;
                    const hint = document.getElementById('prodWhatsappHint');
                    if (hint) hint.innerHTML = `<a href="${normalized}" target="_blank" rel="noopener noreferrer">Preview WhatsApp link</a>`;
                }
            });
            whatsappEl.addEventListener('input', () => {
                const hint = document.getElementById('prodWhatsappHint');
                if (hint) hint.textContent = '';
            });
        }

        // Add WhatsApp toggle buttons for add and edit forms
        const toggleProdWhatsappBtn = document.getElementById('toggleProdWhatsapp');
        if (toggleProdWhatsappBtn) {
            toggleProdWhatsappBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (whatsappEl) {
                    const isHidden = whatsappEl.style.display === 'none';
                    whatsappEl.style.display = isHidden ? '' : 'none';
                    const hintEl = document.getElementById('prodWhatsappHint');
                    if (hintEl) hintEl.style.display = isHidden ? '' : 'none';
                    toggleProdWhatsappBtn.textContent = isHidden ? 'Hide' : 'Show';
                }
            });
        }

        const toggleEditProdWhatsappBtn = document.getElementById('toggleEditProdWhatsapp');
        if (toggleEditProdWhatsappBtn) {
            toggleEditProdWhatsappBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const editWhatsappEl = document.getElementById('editProdWhatsapp');
                if (editWhatsappEl) {
                    const isHidden = editWhatsappEl.style.display === 'none';
                    editWhatsappEl.style.display = isHidden ? '' : 'none';
                    const hintEl = document.getElementById('editProdWhatsappHint');
                    if (hintEl) hintEl.style.display = isHidden ? '' : 'none';
                    toggleEditProdWhatsappBtn.textContent = isHidden ? 'Hide' : 'Show';
                }
            });
        }

        if (addProductForm) {
            // Populate subcategories when category changes
            const prodCategoryEl = document.getElementById('prodCategory');
            const prodSubcategoryEl = document.getElementById('prodSubcategory');
            
            if (prodCategoryEl && prodSubcategoryEl) {
                prodCategoryEl.addEventListener('change', function() {
                    console.log('Category changed to:', this.value);
                    populateSubcategories(this, prodSubcategoryEl);
                });
                // Initialize on page load
                if (prodCategoryEl.value) {
                    console.log('Initializing with category:', prodCategoryEl.value);
                    populateSubcategories(prodCategoryEl, prodSubcategoryEl);
                }
            }
            
            // Auto-populate notes when subcategory changes
            if (prodSubcategoryEl) {
                prodSubcategoryEl.addEventListener('change', function() {
                    const subcatValue = (this.value || '').trim().toLowerCase();
                    const notesEl = document.getElementById('prodNotes');
                    if (notesEl && subcatValue) {
                        const autoNote = SUBCATEGORY_NOTES[subcatValue];
                        if (autoNote) {
                            notesEl.value = autoNote;
                        }
                    }
                });
                prodSubcategoryEl.addEventListener('blur', function() {
                    const subcatValue = (this.value || '').trim().toLowerCase();
                    const notesEl = document.getElementById('prodNotes');
                    if (notesEl && subcatValue && !notesEl.value) {
                        const autoNote = SUBCATEGORY_NOTES[subcatValue];
                        if (autoNote) {
                            notesEl.value = autoNote;
                        }
                    }
                });
            }
            
            addProductForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const name = document.getElementById('prodName').value.trim();
                const category = document.getElementById('prodCategory').value.trim();
                let subcategory = document.getElementById('prodSubcategory') ? document.getElementById('prodSubcategory').value.trim() : '';
                subcategory = normalizeSubcategoryForCategory(category, subcategory);
                const price = document.getElementById('prodPrice').value;
                const whatsapp_input = document.getElementById('prodWhatsapp') ? document.getElementById('prodWhatsapp').value.trim() : '';
                const notes = document.getElementById('prodNotes') ? document.getElementById('prodNotes').value.trim() : '';

                const whatsapp_final = normalizeWhatsapp(whatsapp_input);
                const image_url_input = document.getElementById('prodImage').value.trim();
                const image_file_input = document.getElementById('prodImageFile');

                // Helper to detect local filesystem paths (Windows, UNC, file://)
                function isLocalPath(s) {
                    if (!s) return false;
                    try {
                        return /^[a-zA-Z]:\\|^\\\\|^file:\/\//i.test(s) || /^[a-zA-Z]:\//.test(s);
                    } catch (e) {
                        return false;
                    }
                }

                // Determine image_url: prefer uploaded file, then provided URL
                let final_image_url = image_url_input || null;

                // If user provided a local filesystem path (e.g. C:\\Users\\...), reject it here
                // Browser cannot upload from a local path string — warn the admin and abort.
                const hasSelectedFile = image_file_input && image_file_input.files && image_file_input.files.length > 0;
                if (!hasSelectedFile && final_image_url && isLocalPath(final_image_url)) {
                    alert('Local file paths are not allowed. Please use the file picker to upload the image, or provide a public URL starting with https://');
                    return;
                }
                // If a file is selected, upload it directly to Supabase Storage
                if (image_file_input && image_file_input.files && image_file_input.files.length > 0) {
                    const file = image_file_input.files[0];
                    try {
                        // Use a timestamped filename to avoid collisions
                        const filename = `${Date.now()}-${file.name}`;
                        const bucket = 'product-images';

                        // Upload directly from the browser using anon key
                        const { data: uploadData, error: uploadError } = await supabaseClient.storage
                            .from(bucket)
                            .upload(filename, file, { cacheControl: '3600', upsert: false });

                        if (uploadError) {
                            console.error('Upload error:', uploadError);
                            throw uploadError;
                        }

                        // Get public URL for the uploaded file
                        const { data: urlData } = supabaseClient.storage.from(bucket).getPublicUrl(filename);
                        final_image_url = urlData?.publicUrl || (SUPABASE_URL ? `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${filename}` : null);
                    } catch (uploadErr) {
                        console.error('Failed to upload image file:', uploadErr);
                        alert('Image upload failed: ' + (uploadErr.message || uploadErr));
                        // Re-enable submit button and abort
                        const submitBtn = document.getElementById('submitAddProduct');
                        if (submitBtn) submitBtn.disabled = false;
                        return;
                    }
                }

                if (!name || !category) {
                    alert('Name and category are required');
                    return;
                }

                // Disable submit
                const submitBtn = document.getElementById('submitAddProduct');
                submitBtn.disabled = true;

                try {
                    // Include current access token for admin endpoints
                    const sessionResp = await supabaseClient.auth.getSession();
                    const token = sessionResp?.data?.session?.access_token || null;

                    const res = await fetch(API_BASE + '/api/products', {
                        method: 'POST',
                        headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'Authorization': `Bearer ${token}` } : {}),
                        body: JSON.stringify({ name, category, subcategory, price, image_url: final_image_url, whatsapp_url: whatsapp_final, notes: notes || null })
                    });

                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.error || `HTTP ${res.status}`);
                    }

                    // Success
                    closeAddModal();
                    addProductForm.reset();
                    loadDashboard();
                } catch (err) {
                    console.error('Add product error:', err);
                    alert('Error creating product: ' + (err.message || err));
                } finally {
                    if (submitBtn) submitBtn.disabled = false;
                }
            });
        }

        // Edit modal handlers
        const editProductForm = document.getElementById('editProductForm');
        const cancelEditProduct = document.getElementById('cancelEditProduct');
        if (cancelEditProduct) {
            cancelEditProduct.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = document.getElementById('editProductModal');
                if (modal) modal.classList.remove('show');
            });
        }

        if (editProductForm) {
            // Populate subcategories when category changes
            const editProdCategoryEl = document.getElementById('editProdCategory');
            const editProdSubcategoryEl = document.getElementById('editProdSubcategory');
            
            if (editProdCategoryEl && editProdSubcategoryEl) {
                editProdCategoryEl.addEventListener('change', function() {
                    console.log('Edit category changed to:', this.value);
                    populateSubcategories(this, editProdSubcategoryEl);
                });
            }
            
            // Auto-populate notes when subcategory changes
            if (editProdSubcategoryEl) {
                editProdSubcategoryEl.addEventListener('change', function() {
                    const subcatValue = (this.value || '').trim().toLowerCase();
                    const notesEl = document.getElementById('editProdNotes');
                    if (notesEl && subcatValue) {
                        const autoNote = SUBCATEGORY_NOTES[subcatValue];
                        if (autoNote) {
                            notesEl.value = autoNote;
                        }
                    }
                });
                editProdSubcategoryEl.addEventListener('blur', function() {
                    const subcatValue = (this.value || '').trim().toLowerCase();
                    const notesEl = document.getElementById('editProdNotes');
                    if (notesEl && subcatValue && !notesEl.value) {
                        const autoNote = SUBCATEGORY_NOTES[subcatValue];
                        if (autoNote) {
                            notesEl.value = autoNote;
                        }
                    }
                });
            }
            
            editProductForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('editProdId').value;
                const name = document.getElementById('editProdName').value.trim();
                const category = document.getElementById('editProdCategory').value.trim();
                const subcategoryEl = document.getElementById('editProdSubcategory');
                let subcategory = subcategoryEl ? (subcategoryEl.value || '').trim() : '';
                subcategory = normalizeSubcategoryForCategory(category, subcategory);
                const price = document.getElementById('editProdPrice').value;
                const whatsapp_input = document.getElementById('editProdWhatsapp') ? document.getElementById('editProdWhatsapp').value.trim() : '';
                const notes = document.getElementById('editProdNotes') ? document.getElementById('editProdNotes').value.trim() : '';

                // Image upload handling (optional)
                const image_url_input = document.getElementById('editProdImage').value.trim();
                const image_file_input = document.getElementById('editProdImageFile');

                function isLocalPath(s) { if (!s) return false; try { return /^[a-zA-Z]:\\|^\\\\|^file:\/\//i.test(s) || /^[a-zA-Z]:\//.test(s); } catch (e) { return false; } }
                let final_image_url = image_url_input || null;
                const hasSelectedFile = image_file_input && image_file_input.files && image_file_input.files.length > 0;
                if (!hasSelectedFile && final_image_url && isLocalPath(final_image_url)) {
                    alert('Local file paths are not allowed. Please use the file picker to upload the image, or provide a public URL starting with https://');
                    return;
                }

                const submitBtn = document.getElementById('saveEditProduct');
                if (submitBtn) submitBtn.disabled = true;

                try {
                    if (hasSelectedFile) {
                        const file = image_file_input.files[0];
                        const filename = `${Date.now()}-${file.name}`;
                        const bucket = 'product-images';
                        const { data: uploadData, error: uploadError } = await supabaseClient.storage
                            .from(bucket)
                            .upload(filename, file, { cacheControl: '3600', upsert: false });
                        if (uploadError) throw uploadError;
                        const { data: urlData } = supabaseClient.storage.from(bucket).getPublicUrl(filename);
                        final_image_url = urlData?.publicUrl || (SUPABASE_URL ? `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${filename}` : null);
                    }

                    const whatsapp_final = normalizeWhatsapp(whatsapp_input);

                    const stock = document.getElementById('editProdStock') ? document.getElementById('editProdStock').value : 'in_stock';
                    const visibleEl = document.getElementById('editProdVisible');
                    const visible = visibleEl ? (visibleEl.value === 'true') : true;

                    const sessionResp = await supabaseClient.auth.getSession();
                    const token = sessionResp?.data?.session?.access_token || null;

                    const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`, {
                        method: 'PUT',
                        headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'Authorization': `Bearer ${token}` } : {}),
                        body: JSON.stringify({ name, category, subcategory, price, image_url: final_image_url, whatsapp_url: whatsapp_final, stock_status: stock, visible, notes: notes || null })
                    });

                    if (!res.ok) {
                        const body = await res.json().catch(() => ({}));
                        throw new Error(body.error || `HTTP ${res.status}`);
                    }

                    // Success - redirect to admin dashboard
                    window.location.href = '/admin/dashboard.html';
                } catch (err) {
                    console.error('Edit product error:', err);
                    alert('Error updating product: ' + (err.message || err));
                } finally {
                    if (submitBtn) submitBtn.disabled = false;
                }
            });
        }

        /**
         * Check if user is authenticated and has admin role
         */
        async function checkAuth() {
            try {
                const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

                if (userError || !user) {
                    window.location.href = './login.html';
                    return;
                }

                // Check admin role
                const { data: profile, error: profileError } = await supabaseClient
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profileError || !profile) {
                    // Try server bootstrap before giving up
                    try {
                        const sessionResp = await supabaseClient.auth.getSession();
                        const token = sessionResp?.data?.session?.access_token || null;
                        if (token) {
                            const bootstrapRes = await fetch(API_BASE + '/api/profiles/bootstrap', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (bootstrapRes.ok) {
                                const newProfile = await bootstrapRes.json().catch(() => null);
                                if (newProfile && newProfile.role === 'admin') {
                                    console.log('Bootstrapped admin profile from dashboard check');
                                    // proceed
                                }
                            }
                        }
                    } catch (e) {
                        console.warn('Bootstrap attempt failed during dashboard auth check', e);
                    }

                    // Re-fetch profile to confirm
                    const { data: refreshed, error: refErr } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

                    if (refErr || !refreshed || refreshed.role !== 'admin') {
                        await supabaseClient.auth.signOut();
                        window.location.href = './login.html';
                        return;
                    }
                }

                if (!profile || profile.role !== 'admin') {
                    await supabaseClient.auth.signOut();
                    window.location.href = './login.html';
                    return;
                }

                // Display user email
                if (userEmailEl) {
                    userEmailEl.textContent = user.email;
                }

            } catch (err) {
                console.error('Auth check error:', err);
                window.location.href = './login.html';
            }
        }

        /**
         * Load dashboard statistics and products
         */
  async function loadDashboard() {
            try {
                // Fetch products
                const { data: products, error } = await supabaseClient
      .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

    if (error) {
                    throw error;
                }

                // Update statistics
                updateStats(products || []);

                // Update products table
                updateProductsTable(products || []);

            } catch (err) {
                console.error('Error loading dashboard:', err);
                if (productsTable) {
                    productsTable.innerHTML = `
                        <tr>
                            <td colspan="7" class="empty-state">
                                <p>Unable to load products. Please try again later.</p>
                                <button class="btn-secondary" onclick="location.reload()" style="margin-top: 1rem;">
                                    Reload Page
                                </button>
                            </td>
                        </tr>
                    `;
                }
            }
        }

        /**
         * Update statistics cards
         */
        function updateStats(products) {
            const totalProducts = products.length;
            const categories = new Set(products.map(p => (p.category || '').toLowerCase()).filter(Boolean));
            const bedspreads = products.filter(p => (p.category || '').toLowerCase() === 'bedspreads').length;
            const curtains = products.filter(p => (p.category || '').toLowerCase() === 'curtain').length;
            const pillows = products.filter(p => (p.category || '').toLowerCase() === 'pillows').length;
            const blankets = products.filter(p => (p.category || '').toLowerCase() === 'blankets').length;

            updateStat('totalProducts', totalProducts);
            updateStat('categories', categories.size);
            updateStat('bedspreads', bedspreads);
            updateStat('curtains', curtains);
            updateStat('pillows', pillows);
            updateStat('blankets', blankets);
        }

        function updateStat(id, value) {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = value.toLocaleString();
            }
        }

        /**
         * Update products table
         */
        function updateProductsTable(products) {
            if (!productsTable) return;

            function stockLabel(s) {
                if (!s) return '';
                if (s === 'out_of_stock') return '<span class="stock-badge stock-out">Out of stock</span>';
                if (s === 'low_stock') return '<span class="stock-badge stock-low">Low stock</span>';
                if (s === 'in_stock') return '<span class="stock-badge stock-in">In stock</span>';
                return `<span class="stock-badge">${escapeHtml(s)}</span>`;
            }

            if (products.length === 0) {
                        productsTable.innerHTML = `
                            <tr>
                                <td colspan="7" class="empty-state">
                                    No products found
                                </td>
                            </tr>
                        `;
      return;
    }

            if (groupByCategory) {
                // Group products by category then by subcategory
                const groups = {};
                products.forEach(p => {
                    const cat = (p.category || 'uncategorized').toLowerCase();
                    if (!groups[cat]) groups[cat] = [];
                    groups[cat].push(p);
                });

                let html = '';
                Object.keys(groups).sort().forEach(cat => {
                    const items = groups[cat];
                    html += `
                        <tr class="group-header"><td colspan="7"><strong>${escapeHtml(cat)} (${items.length})</strong></td></tr>
                    `;

                    // Within each category, optionally group by subcategory
                    const subgroups = {};
                    items.forEach(p => {
                        const sub = (p.subcategory || '').toLowerCase() || '_none_';
                        if (!subgroups[sub]) subgroups[sub] = [];
                        subgroups[sub].push(p);
                    });

                    Object.keys(subgroups).sort().forEach(sub => {
                        if (sub !== '_none_') {
                            html += `
                                <tr class="subgroup-header"><td colspan="6" style="padding-left:20px; font-style:italic;">${escapeHtml(sub)} (${subgroups[sub].length})</td></tr>
                            `;
                        }
                        subgroups[sub].forEach(product => {
                            const imageUrl = product.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23f3f4f6"/></svg>';
                            const price = product.price ? Number(product.price).toLocaleString('en-GH') : '0';
                            const category = product.category || 'N/A';
                            const subcat = product.subcategory || '';
                            const name = product.name || 'Unnamed Product';
                            const id = product.id || '';
                            const stock = product.stock_status || 'in_stock';

                            function stockLabel(s) {
                                if (!s) return '';
                                if (s === 'out_of_stock') return '<span class="stock-badge stock-out">Out of stock</span>';
                                if (s === 'low_stock') return '<span class="stock-badge stock-low">Low stock</span>';
                                if (s === 'in_stock') return '<span class="stock-badge stock-in">In stock</span>';
                                return `<span class="stock-badge">${escapeHtml(s)}</span>`;
                            }

                            html += `
                                <tr data-id="${escapeHtml(id)}">
                                    <td><input type="checkbox" class="product-checkbox" data-id="${escapeHtml(id)}" aria-label="Select ${escapeHtml(name)}"></td>
                                    <td style="padding-left:40px"><strong>${escapeHtml(name)}</strong></td>
                                    <td><span style="text-transform: capitalize;">${escapeHtml(category)}${subcat ? ' / ' + escapeHtml(subcat) : ''}</span></td>
                                    <td>GHS ${price}</td>
                                    <td>
                                        <img src="${imageUrl}" alt="${escapeHtml(name)}" loading="lazy" width="60" height="60">
                                    </td>
                                    <td>${stockLabel(stock)}</td>
                                    <td>
                                        <button class="btn-secondary edit-product" data-id="${escapeHtml(id)}" aria-label="Edit ${escapeHtml(name)}">Edit</button>
                                        <button class="btn-danger delete-product" data-id="${escapeHtml(id)}" aria-label="Delete ${escapeHtml(name)}">Delete</button>
                                    </td>
                                </tr>
                            `;
                        });
                    });
                });

                productsTable.innerHTML = html;

                // Update bulk buttons
                updateBulkButtons();

                // Add listeners to checkboxes
                const checkboxes = productsTable.querySelectorAll('.product-checkbox');
                checkboxes.forEach(cb => {
                    cb.addEventListener('change', () => {
                        updateBulkButtons();
                        // Update select all
                        const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(c => c.checked);
                        if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
                    });
                });
            } else {
                productsTable.innerHTML = products.map(product => {
                    const imageUrl = product.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23f3f4f6"/></svg>';
                    const price = product.price ? Number(product.price).toLocaleString('en-GH') : '0';
                    const category = product.category || 'N/A';
                    const subcat = product.subcategory || '';
                    const name = product.name || 'Unnamed Product';
                    const id = product.id || '';
                    const stock = product.stock_status || 'in_stock';

                    return `
                        <tr data-id="${escapeHtml(id)}">
                            <td><input type="checkbox" class="product-checkbox" data-id="${escapeHtml(id)}" aria-label="Select ${escapeHtml(name)}"></td>
                            <td><strong>${escapeHtml(name)}</strong></td>
                            <td><span style="text-transform: capitalize;">${escapeHtml(category)}${subcat ? ' / ' + escapeHtml(subcat) : ''}</span></td>
                            <td>GHS ${price}</td>
                            <td>
                                <img src="${imageUrl}" alt="${escapeHtml(name)}" loading="lazy" width="60" height="60">
                            </td>
                            <td>${stockLabel(stock)}</td>
                            <td>
                                <button class="btn-secondary edit-product" data-id="${escapeHtml(id)}" aria-label="Edit ${escapeHtml(name)}">Edit</button>
                                <button class="btn-danger delete-product" data-id="${escapeHtml(id)}" aria-label="Delete ${escapeHtml(name)}">Delete</button>
                            </td>
                        </tr>
                    `;
                }).join('');

                // Update bulk buttons
                updateBulkButtons();

                // Add listeners to checkboxes
                const checkboxes = productsTable.querySelectorAll('.product-checkbox');
                checkboxes.forEach(cb => {
                    cb.addEventListener('change', () => {
                        updateBulkButtons();
                        // Update select all
                        const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(c => c.checked);
                        if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
                    });
                });
            }

            // Attach delete handlers
            const deleteButtons = productsTable.querySelectorAll('.delete-product');
            deleteButtons.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const id = btn.dataset.id;
                    const label = btn.getAttribute('aria-label') || 'this product';
                    if (!id) return alert('Product id missing');

                    const ok = confirm(`Are you sure you want to delete ${label}? This cannot be undone.`);
                    if (!ok) return;

                    btn.disabled = true;
                    try {
                        const sessionResp = await supabaseClient.auth.getSession();
                        const token = sessionResp?.data?.session?.access_token || null;
                        const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`, { method: 'DELETE', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
                        if (!res.ok) {
                            const body = await res.json().catch(() => ({}));
                            throw new Error(body.error || `HTTP ${res.status}`);
                        }
                        // Refresh products
                        await loadDashboard();
                    } catch (err) {
                        console.error('Delete product error:', err);
                        alert('Failed to delete product: ' + (err.message || err));
                    } finally {
                        btn.disabled = false;
                    }
                });
            });

            // Attach edit handlers
            const editButtons = productsTable.querySelectorAll('.edit-product');
            editButtons.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const id = btn.dataset.id;
                    if (!id) return alert('Product id missing');

                    // Fetch product details
                    try {
                        const resp = await fetch(API_BASE + '/api/products');
                        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                        const list = await resp.json();
                        console.log('Fetched products:', list);
                        console.log('Looking for product id:', id);
                        const product = (list || []).find(p => p.id === id);
                        if (!product) {
                            console.log('Product not found. Available IDs:', (list || []).map(p => p.id));
                            return alert('Product not found');
                        }

                        // Show modal first to ensure all elements are accessible
                        const modal = document.getElementById('editProductModal');
                        if (modal) modal.classList.add('show');

                        // Populate edit modal fields
                        const fields = {
                            'editProdId': product.id,
                            'editProdName': product.name,
                            'editProdCategory': product.category,
                            'editProdPrice': product.price,
                            'editProdWhatsapp': product.whatsapp_url,
                            'editProdImage': product.image_url,
                            'editProdNotes': product.notes
                        };
                        
                        for (const [fieldId, value] of Object.entries(fields)) {
                            const el = document.getElementById(fieldId);
                            if (el) {
                                el.value = value || '';
                            } else {
                                console.warn(`Element not found: ${fieldId}`);
                            }
                        }
                        
                        // render appropriate subcategory field
                        renderEditSubcategoryField(product.category || '', product.subcategory || '');

                        // set stock and visibility fields if present
                        const stockEl = document.getElementById('editProdStock');
                        if (stockEl) stockEl.value = product.stock_status || 'in_stock';
                        const visEl = document.getElementById('editProdVisible');
                        if (visEl) {
                            const visVal = (typeof product.visible === 'boolean') ? String(product.visible) : (product.visible === 'false' ? 'false' : 'true');
                            visEl.value = visVal;
                        }
                    } catch (err) {
                        console.error('Failed to load product for edit:', err);
                        alert('Unable to load product details for editing: ' + err.message);
                    }
                });
            });
        }
    }

    /**
     * Initialize Products page
     */
    async function initProducts() {
        const logoutBtn = document.getElementById('logoutBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        const productsTable = document.getElementById('productsTable');
        const userEmailEl = document.getElementById('userEmail');

        // Initialize custom dropdowns
        initializeDropdowns();

        // Grouping toggle state
        let groupByCategory = false;
        const groupToggleBtn = document.getElementById('groupToggleBtn');
        if (groupToggleBtn) {
            try {
                groupByCategory = localStorage.getItem('groupByCategory') === 'true';
            } catch (e) { groupByCategory = false; }
            groupToggleBtn.setAttribute('aria-pressed', String(groupByCategory));
            groupToggleBtn.classList.toggle('active', groupByCategory);
            groupToggleBtn.addEventListener('click', () => {
                groupByCategory = !groupByCategory;
                try { localStorage.setItem('groupByCategory', String(groupByCategory)); } catch (e) {}
                groupToggleBtn.setAttribute('aria-pressed', String(groupByCategory));
                groupToggleBtn.classList.toggle('active', groupByCategory);
                // re-render table
                loadProducts();
            });
        }

        // Bulk actions
        const selectAllCheckbox = document.getElementById('selectAll');
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const bulkStockBtn = document.getElementById('bulkStockBtn');

        function updateBulkButtons() {
            const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
            const hasSelection = checkedBoxes.length > 0;
            if (bulkDeleteBtn) bulkDeleteBtn.style.display = hasSelection ? 'inline-block' : 'none';
            if (bulkStockBtn) bulkStockBtn.style.display = hasSelection ? 'inline-block' : 'none';
        }

        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.product-checkbox');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
                updateBulkButtons();
            });
        }

        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', async () => {
                const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
                if (checkedBoxes.length === 0) return;

                if (!confirm(`Delete ${checkedBoxes.length} selected product(s)? This action cannot be undone.`)) return;

                try {
                    const ids = Array.from(checkedBoxes).map(cb => cb.value);
                    const { error } = await supabaseClient
                        .from('products')
                        .delete()
                        .in('id', ids);

                    if (error) throw error;

                    alert(`${ids.length} product(s) deleted successfully`);
                    loadProducts();
                } catch (err) {
                    console.error('Bulk delete error:', err);
                    alert('Failed to delete products');
                }
            });
        }

        if (bulkStockBtn) {
            bulkStockBtn.addEventListener('click', async () => {
                const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
                if (checkedBoxes.length === 0) return;

                const newStatus = prompt('Enter new stock status (in_stock, low_stock, out_of_stock):');
                if (!newStatus || !['in_stock', 'low_stock', 'out_of_stock'].includes(newStatus)) {
                    alert('Invalid stock status');
                    return;
                }

                try {
                    const ids = Array.from(checkedBoxes).map(cb => cb.value);
                    const { error } = await supabaseClient
                        .from('products')
                        .update({ stock: newStatus })
                        .in('id', ids);

                    if (error) throw error;

                    alert(`${ids.length} product(s) updated successfully`);
                    loadProducts();
                } catch (err) {
                    console.error('Bulk stock update error:', err);
                    alert('Failed to update stock status');
                }
            });
        }

        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await supabaseClient.auth.signOut();
                    window.location.href = './login.html';
                } catch (err) {
                    console.error('Logout error:', err);
                }
            });
        }

        // Refresh
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => loadProducts());
        }

        // User email
        if (userEmailEl) {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (user) userEmailEl.textContent = user.email;
        }

        // Load products
        await loadProducts();

        // Add product functionality
        initAddProduct();
        initEditProduct();
    }

    /**
     * Initialize Tracking page
     */
    async function initTracking() {
        const logoutBtn = document.getElementById('logoutBtn');
        const userEmailEl = document.getElementById('userEmail');

        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await supabaseClient.auth.signOut();
                    window.location.href = './login.html';
                } catch (err) {
                    console.error('Logout error:', err);
                }
            });
        }

        // User email
        if (userEmailEl) {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (user) userEmailEl.textContent = user.email;
        }

        // Load clicks
        await loadClicks();
    }

    /**
     * Load products for products page
     */
    async function loadProducts() {
        try {
            // Fetch products
            const { data: products, error } = await supabaseClient
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            // Update products table
            updateProductsTable(products || []);

        } catch (err) {
            console.error('Error loading products:', err);
            const productsTable = document.getElementById('productsTable');
            if (productsTable) {
                productsTable.innerHTML = `
                    <tr>
                        <td colspan="7" class="empty-state">
                            <p>Unable to load products. Please try again later.</p>
                            <button class="btn-secondary" onclick="location.reload()" style="margin-top: 1rem;">
                                Reload Page
                            </button>
                        </td>
                    </tr>
                `;
            }
        }
    }

    /**
     * Update products table
     */
    function updateProductsTable(products) {
        const productsTable = document.getElementById('productsTable');
        if (!productsTable) return;

        // Grouping toggle state
        let groupByCategory = false;
        const groupToggleBtn = document.getElementById('groupToggleBtn');
        if (groupToggleBtn) {
            try {
                groupByCategory = localStorage.getItem('groupByCategory') === 'true';
            } catch (e) { groupByCategory = false; }
        }

        // Bulk actions
        const selectAllCheckbox = document.getElementById('selectAll');
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const bulkStockBtn = document.getElementById('bulkStockBtn');

        function updateBulkButtons() {
            const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
            const hasSelection = checkedBoxes.length > 0;
            if (bulkDeleteBtn) bulkDeleteBtn.style.display = hasSelection ? 'inline-block' : 'none';
            if (bulkStockBtn) bulkStockBtn.style.display = hasSelection ? 'inline-block' : 'none';
        }

        function stockLabel(s) {
            if (!s) return '';
            if (s === 'out_of_stock') return '<span class="stock-badge stock-out">Out of stock</span>';
            if (s === 'low_stock') return '<span class="stock-badge stock-low">Low stock</span>';
            if (s === 'in_stock') return '<span class="stock-badge stock-in">In stock</span>';
            return `<span class="stock-badge">${escapeHtml(s)}</span>`;
        }

        if (products.length === 0) {
            productsTable.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        No products found
                    </td>
                </tr>
            `;
            return;
        }

        if (groupByCategory) {
            // Group products by category then by subcategory
            const groups = {};
            products.forEach(p => {
                const cat = (p.category || 'uncategorized').toLowerCase();
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push(p);
            });

            let html = '';
            Object.keys(groups).sort().forEach(cat => {
                const items = groups[cat];
                html += `
                    <tr class="group-header"><td colspan="7"><strong>${escapeHtml(cat)} (${items.length})</strong></td></tr>
                `;

                // Within each category, optionally group by subcategory
                const subgroups = {};
                items.forEach(p => {
                    const sub = (p.subcategory || '').toLowerCase() || '_none_';
                    if (!subgroups[sub]) subgroups[sub] = [];
                    subgroups[sub].push(p);
                });

                Object.keys(subgroups).sort().forEach(sub => {
                    if (sub !== '_none_') {
                        html += `
                            <tr class="subgroup-header"><td colspan="6" style="padding-left:20px; font-style:italic;">${escapeHtml(sub)} (${subgroups[sub].length})</td></tr>
                        `;
                    }
                    subgroups[sub].forEach(product => {
                        const imageUrl = product.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23f3f4f6"/></svg>';
                        const price = product.price ? Number(product.price).toLocaleString('en-GH') : '0';
                        const category = product.category || 'N/A';
                        const subcat = product.subcategory || '';
                        const name = product.name || 'Unnamed Product';
                        const id = product.id || '';
                        const stock = product.stock_status || 'in_stock';

                        html += `
                            <tr data-id="${escapeHtml(id)}">
                                <td><input type="checkbox" class="product-checkbox" data-id="${escapeHtml(id)}" aria-label="Select ${escapeHtml(name)}"></td>
                                <td style="padding-left:40px"><strong>${escapeHtml(name)}</strong></td>
                                <td><span style="text-transform: capitalize;">${escapeHtml(category)}${subcat ? ' / ' + escapeHtml(subcat) : ''}</span></td>
                                <td>GHS ${price}</td>
                                <td>
                                    <img src="${imageUrl}" alt="${escapeHtml(name)}" loading="lazy" width="60" height="60">
                                </td>
                                <td>${stockLabel(stock)}</td>
                                <td>
                                    <button class="btn-secondary edit-product" data-id="${escapeHtml(id)}" aria-label="Edit ${escapeHtml(name)}">Edit</button>
                                    <button class="btn-danger delete-product" data-id="${escapeHtml(id)}" aria-label="Delete ${escapeHtml(name)}">Delete</button>
                                </td>
                            </tr>
                        `;
                    });
                });
            });

            productsTable.innerHTML = html;

            // Update bulk buttons
            updateBulkButtons();

            // Add listeners to checkboxes
            const checkboxes = productsTable.querySelectorAll('.product-checkbox');
            checkboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    updateBulkButtons();
                    // Update select all
                    const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(c => c.checked);
                    if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
                });
            });
        } else {
            productsTable.innerHTML = products.map(product => {
                const imageUrl = product.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23f3f4f6"/></svg>';
                const price = product.price ? Number(product.price).toLocaleString('en-GH') : '0';
                const category = product.category || 'N/A';
                const subcat = product.subcategory || '';
                const name = product.name || 'Unnamed Product';
                const id = product.id || '';
                const stock = product.stock_status || 'in_stock';

                return `
                    <tr data-id="${escapeHtml(id)}">
                        <td><input type="checkbox" class="product-checkbox" data-id="${escapeHtml(id)}" aria-label="Select ${escapeHtml(name)}"></td>
                        <td><strong>${escapeHtml(name)}</strong></td>
                        <td><span style="text-transform: capitalize;">${escapeHtml(category)}${subcat ? ' / ' + escapeHtml(subcat) : ''}</span></td>
                        <td>GHS ${price}</td>
                        <td>
                            <img src="${imageUrl}" alt="${escapeHtml(name)}" loading="lazy" width="60" height="60">
                        </td>
                        <td>${stockLabel(stock)}</td>
                        <td>
                            <button class="btn-secondary edit-product" data-id="${escapeHtml(id)}" aria-label="Edit ${escapeHtml(name)}">Edit</button>
                            <button class="btn-danger delete-product" data-id="${escapeHtml(id)}" aria-label="Delete ${escapeHtml(name)}">Delete</button>
                        </td>
                    </tr>
                `;
            }).join('');

            // Update bulk buttons
            updateBulkButtons();

            // Add listeners to checkboxes
            const checkboxes = productsTable.querySelectorAll('.product-checkbox');
            checkboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    updateBulkButtons();
                    // Update select all
                    const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(c => c.checked);
                    if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
                });
            });
        }

        // Attach delete handlers
        const deleteButtons = productsTable.querySelectorAll('.delete-product');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                const label = btn.getAttribute('aria-label') || 'this product';
                if (!id) return alert('Product id missing');

                const ok = confirm(`Are you sure you want to delete ${label}? This cannot be undone.`);
                if (!ok) return;

                btn.disabled = true;
                try {
                    const sessionResp = await supabaseClient.auth.getSession();
                    const token = sessionResp?.data?.session?.access_token || null;
                    const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`, { method: 'DELETE', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
                    if (!res.ok) {
                        const body = await res.json().catch(() => ({}));
                        throw new Error(body.error || `HTTP ${res.status}`);
                    }
                    // Refresh products
                    await loadProducts();
                } catch (err) {
                    console.error('Delete product error:', err);
                    alert('Failed to delete product: ' + (err.message || err));
                } finally {
                    btn.disabled = false;
                }
            });
        });

        // Attach edit handlers
        const editButtons = productsTable.querySelectorAll('.edit-product');
        editButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                if (!id) return alert('Product id missing');

                // Fetch product details
                try {
                    const resp = await fetch(API_BASE + '/api/products');
                    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                    const list = await resp.json();
                    console.log('Fetched products:', list);
                    console.log('Looking for product id:', id);
                    const product = (list || []).find(p => p.id === id);
                    if (!product) {
                        console.log('Product not found. Available IDs:', (list || []).map(p => p.id));
                        return alert('Product not found');
                    }

                    // Show modal first to ensure all elements are accessible
                    const modal = document.getElementById('editProductModal');
                    if (modal) modal.classList.add('show');

                    // Populate edit modal fields
                    const fields = {
                        'editProdId': product.id,
                        'editProdName': product.name,
                        'editProdCategory': product.category,
                        'editProdPrice': product.price,
                        'editProdWhatsapp': product.whatsapp_url,
                        'editProdImage': product.image_url,
                        'editProdNotes': product.notes
                    };
                    
                    for (const [fieldId, value] of Object.entries(fields)) {
                        const el = document.getElementById(fieldId);
                        if (el) {
                            el.value = value || '';
                        } else {
                            console.warn(`Element not found: ${fieldId}`);
                        }
                    }
                    
                    // render appropriate subcategory field
                    renderEditSubcategoryField(product.category || '', product.subcategory || '');

                    // set stock and visibility fields if present
                    const stockEl = document.getElementById('editProdStock');
                    if (stockEl) stockEl.value = product.stock_status || 'in_stock';
                    const visEl = document.getElementById('editProdVisible');
                    if (visEl) {
                        const visVal = (typeof product.visible === 'boolean') ? String(product.visible) : (product.visible === 'false' ? 'false' : 'true');
                        visEl.value = visVal;
                    }
                } catch (err) {
                    console.error('Failed to load product for edit:', err);
                    alert('Unable to load product details for editing: ' + err.message);
                }
            });
        });
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Initialize based on current page
     */
    async function init() {
        // Wait a tick to ensure all elements are available
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const currentPath = window.location.pathname;
        
        // Check authentication state
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        const isAuthenticated = user && !error;
        
        console.log('Auth check:', { isAuthenticated, user: user?.email, path: currentPath });
        
        if (currentPath.includes('login') || currentPath.endsWith('/admin/') || currentPath.endsWith('/admin')) {
            if (isAuthenticated) {
                // Already logged in, redirect to dashboard
                console.log('Already authenticated, redirecting to dashboard...');
                const dashboardUrl = `${window.location.origin}/admin/dashboard.html`;
                window.location.href = dashboardUrl;
                return;
            }
            await initLogin();
        } else if (currentPath.includes('dashboard.html') || currentPath.includes('/admin/dashboard')) {
            if (!isAuthenticated) {
                // Not authenticated, redirect to login
                console.log('Not authenticated, redirecting to login...');
                const loginUrl = `${window.location.origin}/admin/login.html`;
                window.location.href = loginUrl;
                return;
            }
            await initDashboard();
        } else if (currentPath.includes('products.html')) {
            if (!isAuthenticated) {
                // Not authenticated, redirect to login
                console.log('Not authenticated, redirecting to login...');
                const loginUrl = `${window.location.origin}/admin/login.html`;
                window.location.href = loginUrl;
                return;
            }
            await initProducts();
        } else if (currentPath.includes('tracking.html')) {
            if (!isAuthenticated) {
                // Not authenticated, redirect to login
                console.log('Not authenticated, redirecting to login...');
                const loginUrl = `${window.location.origin}/admin/login.html`;
                window.location.href = loginUrl;
                return;
            }
            await initTracking();
        }
    }

    // Initialize when DOM is ready and Supabase is loaded
    async function startInit() {
        console.log('Starting initialization...');
        // Load client config (supabase URL + anon key)
        await loadClientConfig();

        // Initialize Supabase client
        supabaseClient = initSupabase();
        if (!supabaseClient) {
            console.error('Failed to initialize Supabase client');
            const statusEl = document.getElementById('status');
            if (statusEl) {
                statusEl.innerHTML = `
                    <strong>Error: Unable to initialize authentication</strong><br>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">
                        Please refresh the page and try again.
                    </p>
                    <button onclick="location.reload()" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: var(--admin-primary, #0a58ca); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        Reload Page
                    </button>
                `;
                statusEl.className = 'error';
            }

            // Also show alert if status element doesn't exist (for dashboard)
            if (!statusEl) {
                alert('Unable to initialize authentication. Please check your internet connection and refresh the page.');
            }
            return;
        }

        // Supabase is ready, proceed with initialization
        console.log('Supabase is ready, initializing...');
        
        // Set up auth state listener
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('Auth state change:', event, session?.user?.email);
            if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
                // Redirect to login if signed out or session invalid
                const currentPath = window.location.pathname;
                if (!currentPath.includes('login.html')) {
                    const loginUrl = `${window.location.origin}/admin/login.html`;
                    window.location.href = loginUrl;
                }
            }
        });
        
        await init();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startInit);
    } else {
        // DOM already ready, start initialization
        startInit();
    }

})();
