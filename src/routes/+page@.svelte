
<svelte:head>
    <title>Iain Marr Antiques</title>
</svelte:head>


<script>
    import { BACKEND_URL } from './conf';
    import { onMount } from 'svelte'; 
    
    let products = [];
    let selectedProducts = [];
    let searchTerm = "";
    let showPrintModal = false;
    let editedProduct = null;
    let isLoading = true;
    let error = null;
    let showSoldItems = false; // Toggle for showing sold items

    // Fetch data from your endpoint
    async function fetchProducts() {
        try {
            isLoading = true;
            error = null;
            const response = await fetch(BACKEND_URL+'/get_stock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({})
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Process data to match our UI needs
            products = data.map(item => ({
                id: item["SKU NO."],
                name: item["ITEM DESCRIPTION"],
                price: item["SELLING PRICE"],
                barcode: item["IM SKU"],
                sku: item["SKU NO."],
                purchasePrice: item["PURCHASE PRICE"],
                seller: item["NAME/ADDRESS SELLER"],
                dateBought: item["DATE BOUGHT"],
                sold: item["SOLD"] === "TRUE"
            }));
        } catch (err) {
            console.error("Failed to fetch products:", err);
            error = "Failed to load products. Please try again later.";
        } finally {
            isLoading = false;
        }
    }

    onMount(fetchProducts);

    // Filter products based on search term and sold status
    $: filteredProducts = products.filter(p => 
        (showSoldItems || !p.sold) && // Hide sold items unless toggled
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.barcode.includes(searchTerm) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Toggle product selection
    function toggleProduct(product) {
        if (selectedProducts.find(p => p.id === product.id)) {
            selectedProducts = selectedProducts.filter(p => p.id !== product.id);
        } else {
            selectedProducts = [...selectedProducts, {...product}];
        }
    }

    // Toggle all products
    function toggleAll() {
        if (selectedProducts.length === filteredProducts.length) {
            selectedProducts = [];
        } else {
            selectedProducts = [...filteredProducts];
        }
    }

    // Open edit modal for a product
    function openEditModal(product) {
        editedProduct = {...product};
        showPrintModal = true;
    }

    // Save edited product
    function saveEditedProduct() {
        if (editedProduct) {
            products = products.map(p => 
                p.id === editedProduct.id ? editedProduct : p
            );
            
            // Update selected products if they were edited
            selectedProducts = selectedProducts.map(p => 
                p.id === editedProduct.id ? {...editedProduct} : p
            );
            
            editedProduct = null;
            showPrintModal = false;
        }
    }

    // Print selected products
    function printSelected() {
        // In a real app, you would send the selectedProducts to your print API
        console.log("Printing products:", selectedProducts);
        alert(`Printing ${selectedProducts.length} labels...`);
        selectedProducts = [];
        showPrintModal = false;
    }
    
    // Toggle sold item visibility
    function toggleSoldItems() {
        showSoldItems = !showSoldItems;
    }
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8 text-center">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-800">Iain Marr Antiques</h1>
            <p class="text-gray-600 mt-2">Manage inventory and print price labels</p>
        </div>

        <!-- Loading State -->
        {#if isLoading}
            <div class="flex justify-center items-center h-64">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span class="ml-3 text-gray-600">Loading products...</span>
            </div>
        <!-- Error State -->
        {:else if error}
            <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-red-700">{error}</p>
                        <button 
                            on:click={fetchProducts}
                            class="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        <!-- Main Content -->
        {:else}
            <!-- Controls -->
            <div class="bg-white rounded-xl shadow-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <!-- Search -->
                <div class="relative w-full">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Search by name, SKU or barcode..." 
                        bind:value={searchTerm}
                    />
                </div>

                <!-- Toggle Sold Items -->
                <button 
                    on:click={toggleSoldItems}
                    class={`px-4 py-2.5 rounded-lg font-medium flex items-center transition-colors
                        ${showSoldItems ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Show Sold Items
                </button>

                <!-- Print Button -->
                <button 
                    on:click={() => showPrintModal = true}
                    disabled={selectedProducts.length === 0}
                    class="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Print Selected ({selectedProducts.length})
                </button>
            </div>

            <!-- Stats Summary -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-white rounded-xl shadow p-5">
                    <div class="text-gray-500 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <span class="font-medium">Total Items</span>
                    </div>
                    <div class="text-3xl text-black font-bold mt-2">{products.length}</div>
                </div>
                
                <div class="bg-white rounded-xl shadow p-5">
                    <div class="text-gray-500 flex items-center">
                        <svg class="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="font-medium">Available</span>
                    </div>
                    <div class="text-3xl font-bold mt-2 text-black">{products.filter(p => !p.sold).length}</div>
                </div>
                
                <div class="bg-white rounded-xl shadow p-5">
                    <div class="text-gray-500 flex items-center">
                        <svg class="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="font-medium">Sold</span>
                    </div>
                    <div class="text-3xl font-bold mt-2 text-black">{products.filter(p => p.sold).length}</div>
                </div>
            </div>

            <!-- Products Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {#each filteredProducts as product}
                    <div 
                        class={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all duration-200 relative
                            ${selectedProducts.find(p => p.id === product.id) ? 'border-blue-500 shadow-lg' : 'border-transparent'}
                            ${product.sold ? 'opacity-80' : ''}`}
                        on:click={() => toggleProduct(product)}
                    >
                        {#if product.sold}
                            <div class="absolute top-3 right-3 px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                                SOLD
                            </div>
                        {/if}
                        
                        <div class="p-4">
                            <div class="flex justify-between items-start">
                                <div class="pr-2">
                                    <h3 class="font-semibold text-gray-800 truncate">{product.name}</h3>
                                    <div class="mt-1">
                                        <span class="text-xl font-bold text-blue-600">£{product.price.toFixed(2)}</span>
                                        {#if product.sold}
                                            <span class="ml-2 text-sm text-red-600">(Sold)</span>
                                        {/if}
                                    </div>
                                </div>
                                <button 
                                    on:click|stopPropagation={() => openEditModal(product)}
                                    class={`text-gray-400 hover:text-blue-500 p-1 flex-shrink-0
                                        ${product.sold ? 'opacity-70' : ''}`}
                                    title="Edit product"
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                </button>
                            </div>
                            
                            <div class="mt-3 space-y-2 text-sm text-gray-600">
                                <div class="flex items-center">
                                    <svg class="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                                    </svg>
                                    <span>SKU: {product.sku}</span>
                                </div>
                                <div class="flex items-center">
                                    <svg class="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                                    </svg>
                                    <span>Barcode: {product.barcode}</span>
                                </div>
                                <div class="flex items-center">
                                    <svg class="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                    <span class="truncate">Seller: {product.seller}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class={`py-1 text-center text-sm font-medium
                            ${selectedProducts.find(p => p.id === product.id) 
                                ? product.sold 
                                    ? 'bg-red-100 text-red-700' 
                                    : 'bg-blue-50 text-blue-700' 
                                : 'hidden'}`}>
                            {product.sold ? 'Sold - Selected' : 'Selected'}
                        </div>
                    </div>
                {:else}
                    <div class="col-span-full text-center py-12">
                        <div class="text-gray-400 mb-4">
                            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-700">No products found</h3>
                        <p class="text-gray-500 mt-2">
                            {showSoldItems 
                                ? "No sold items match your search" 
                                : "No available items match your search"}
                        </p>
                    </div>
                {/each}
            </div>
            
            <!-- Select All Button -->
            {#if filteredProducts.length > 0}
                <div class="mt-6 flex justify-center">
                    <button 
                        on:click={toggleAll}
                        class="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700"
                    >
                        {selectedProducts.length === filteredProducts.length 
                            ? 'Deselect All' 
                            : 'Select All'}
                    </button>
                </div>
            {/if}
        {/if}
    </div>
    
    <!-- Print/Edit Modal -->
    {#if showPrintModal}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <!-- Modal Header -->
                <div class="p-6 border-b flex justify-between items-center">
                    <h2 class="text-xl font-bold text-gray-800">
                        {editedProduct ? 'Edit Product' : 'Print Labels'}
                    </h2>
                    <button 
                        on:click={() => { showPrintModal = false; editedProduct = null; }}
                        class="text-gray-400 hover:text-gray-600"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <!-- Modal Content -->
                <div class="flex-1 overflow-y-auto p-6">
                    {#if editedProduct}
                        <!-- Edit Product Form -->
                        <div class="space-y-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input 
                                    type="text" 
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    bind:value={editedProduct.name}
                                />
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Selling Price (£)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        bind:value={editedProduct.price}
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Purchase Price (£)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed" 
                                        bind:value={editedProduct.purchasePrice}
                                        disabled
                                    />
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                    <input 
                                        type="text" 
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed" 
                                        bind:value={editedProduct.sku}
                                        disabled
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                                    <input 
                                        type="text" 
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed" 
                                        bind:value={editedProduct.barcode}
                                        disabled
                                    />
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Seller</label>
                                    <input 
                                        type="text" 
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed" 
                                        bind:value={editedProduct.seller}
                                        disabled
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Date Bought</label>
                                    <input 
                                        type="text" 
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed" 
                                        bind:value={editedProduct.dateBought}
                                        disabled
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Sold Status</label>
                                <div class="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="soldCheckbox"
                                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        bind:checked={editedProduct.sold}
                                    />
                                    <label for="soldCheckbox" class="ml-2 block text-sm text-gray-900">
                                        Mark as sold
                                    </label>
                                </div>
                            </div>
                        </div>
                    {:else}
                        <!-- Print Preview -->
                        <div>
                            <div class="mb-4">
                                <p class="text-gray-600">You're about to print labels for {selectedProducts.length} products.</p>
                            </div>
                            
                            <div class="space-y-3 max-h-96 overflow-y-auto">
                                {#each selectedProducts as product}
                                    <div class={`flex items-center p-3 border rounded-lg hover:bg-gray-50
                                        ${product.sold ? 'bg-red-50 border-red-200' : ''}`}>
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center">
                                                <h3 class="font-semibold text-gray-800 truncate">{product.name}</h3>
                                                {#if product.sold}
                                                    <span class="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">Sold</span>
                                                {/if}
                                            </div>
                                            <div class="flex items-center mt-1 text-sm">
                                                <span class="font-medium text-blue-600">£{product.price.toFixed(2)}</span>
                                                <span class="mx-2 text-gray-300">•</span>
                                                <span class="text-gray-600 truncate">{product.sku}</span>
                                            </div>
                                        </div>
                                        <button 
                                            on:click={() => openEditModal(product)}
                                            class="ml-4 text-blue-600 hover:text-blue-800 flex items-center text-sm"
                                        >
                                            Edit
                                            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>
                
                <!-- Modal Footer -->
                <div class="p-6 border-t flex justify-end space-x-3">
                    <button 
                        on:click={() => { showPrintModal = false; editedProduct = null; }}
                        class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                    >
                        {editedProduct ? 'Cancel' : 'Back'}
                    </button>
                    <button 
                        on:click={editedProduct ? saveEditedProduct : printSelected}
                        class="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                    >
                        {editedProduct ? 'Save Changes' : 'Print Labels'}
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Custom scrollbar for modal */
    .overflow-y-auto::-webkit-scrollbar {
        width: 8px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb {
        background: #c5c5c5;
        border-radius: 4px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
</style>