<script>
    // @ts-nocheck
    import { BACKEND_URL } from "../../../conf";
    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';
    
    export let editedProduct;
    export let showEditProductModal;
    export let activeTab;
    export let products;
    
    // New states
    let isSaving = false;
    let originalProduct = null;
    // let toast = {
    //     show: false,
    //     message: '',
    //     type: 'success' // 'success' or 'error'
    // };
    
    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(value);
    };
    
    // Add this helper function
    function isEmptyOrZero(value) {
        return value === '' || value === 0 || value === null || value === undefined;
    }
    
    // Check if changes were made
    function hasChanges() {
        return JSON.stringify(originalProduct) !== JSON.stringify(editedProduct);
    }

    $: if (editedProduct && !originalProduct) {
        originalProduct = JSON.parse(JSON.stringify(editedProduct));
    }

    
    async function updateProduct(editedProduct) {
        try {
            const response = await fetch(BACKEND_URL + '/modify_product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    editedProduct: editedProduct
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (err) {
            console.error("Failed to update product:", err);
            throw new Error("Failed to update product. Please try again later.");
        }
    }
    
    // Save edited product
    async function saveEditedProduct() {
        if (!hasChanges()) return;
        
        isSaving = true;
        
        try {
            await updateProduct(editedProduct);
            
            // Update products list
            products = products.map(p =>
                p.id === editedProduct.id ? editedProduct : p
            );
            
            // Update original product reference
            originalProduct = JSON.parse(JSON.stringify(editedProduct));

            toast.success('Product updated successfully!');

            showEditProductModal = false;
            
        } catch (error) {
            console.error("Save error:", error);
            toast.error(error.message || 'Failed to update product', 'error');
        } finally {
            isSaving = false;
        }
    }
    
    // Initialize when modal opens
    onMount(() => {
        if (editedProduct) {
            // Store original state for change detection
            originalProduct = JSON.parse(JSON.stringify(editedProduct));
            console.log(originalProduct)
        }
    });
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <!-- Toast Notification -->

    
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-800">
                Edit Product
            </h2>
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button
                on:click={() => { showEditProductModal = false; }}
                class="text-gray-400 hover:text-gray-600"
                disabled={isSaving}
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        
        <!-- Tab Navigation -->
        <div class="border-b">
            <div class="flex">
                <button 
                    class={`px-6 py-3 font-medium text-sm ${activeTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    on:click={() => activeTab = 'products'}
                    disabled={isSaving}
                >
                    Product Details
                </button>
                <button 
                    class={`px-6 py-3 font-medium text-sm ${activeTab === 'print' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    on:click={() => activeTab = 'print'}
                    disabled={!editedProduct || isSaving}
                >
                    Print Preview
                </button>
            </div>
        </div>

        <!-- Modal Content -->
        <div class="flex-1 overflow-y-auto p-6">
            {#if editedProduct}
                <!-- Product Details Tab -->
                {#if activeTab === 'products'}
                    <div class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div class="flex items-center mb-1">
                                    <label class="block text-sm font-medium text-gray-700">SKU</label>
                                    {#if isEmptyOrZero(editedProduct.sku)}
                                        <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                                    {/if}
                                </div>
                                <input 
                                    type="text" 
                                    class={`text-black/50 w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-not-allowed
                                        ${isEmptyOrZero(editedProduct.sku) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-gray-100'}`}
                                    bind:value={editedProduct.sku}
                                    disabled
                                />
                            </div>
                            
                            <div>
                                <div class="flex items-center mb-1">
                                    <label class="block text-sm font-medium text-gray-700">IM SKU</label>
                                    {#if isEmptyOrZero(editedProduct.imSKU)}
                                        <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                                    {/if}
                                </div>
                                <input 
                                    type="text" 
                                    class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                        ${isEmptyOrZero(editedProduct.imSKU) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                    bind:value={editedProduct.imSKU}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                        <div>
                            <div class="flex items-center mb-1">
                                <label class="block text-sm font-medium text-gray-700">Product Name</label>
                                {#if isEmptyOrZero(editedProduct.name)}
                                    <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                                {/if}
                            </div>
                            <input 
                                type="text" 
                                class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                    ${isEmptyOrZero(editedProduct.name) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                bind:value={editedProduct.name}
                                disabled={isSaving}
                            />
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div class="flex items-center mb-1">
                                    <label class="text-black block text-sm font-medium text-gray-700">Selling Price (£)</label>
                                    {#if editedProduct.price === 0}
                                        <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Zero</span>
                                    {/if}
                                </div>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                        ${editedProduct.price === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                    bind:value={editedProduct.price}
                                    disabled={isSaving}
                                />
                            </div>
                            <div>
                                <div class="flex items-center mb-1">
                                    <label class="block text-sm font-medium text-gray-700">Purchase Price (£)</label>
                                    {#if editedProduct.purchasePrice === 0}
                                        <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Zero</span>
                                    {/if}
                                </div>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                        ${editedProduct.purchasePrice === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                    bind:value={editedProduct.purchasePrice}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                        
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div class="flex items-center mb-1">
                                    <label class="block text-sm font-medium text-gray-700">Seller</label>
                                    {#if isEmptyOrZero(editedProduct.seller)}
                                        <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                                    {/if}
                                </div>
                                <input 
                                    type="text" 
                                    class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                        ${isEmptyOrZero(editedProduct.seller) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                    bind:value={editedProduct.seller}
                                    disabled={isSaving}
                                />
                            </div>
                            
                            <div>
                                <div class="flex items-center mb-1">
                                    <label class="block text-sm font-medium text-gray-700">Location</label>
                                    {#if isEmptyOrZero(editedProduct.location)}
                                        <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                                    {/if}
                                </div>
                                <input 
                                    type="text" 
                                    class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                        ${isEmptyOrZero(editedProduct.location) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                    bind:value={editedProduct.location}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div class="flex items-center mb-1">
                                    <label class="block text-sm font-medium text-gray-700">Date Bought</label>
                                    {#if isEmptyOrZero(editedProduct.dateBought)}
                                        <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                                    {/if}
                                </div>
                                <input 
                                    type="text" 
                                    class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                        ${isEmptyOrZero(editedProduct.dateBought) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                    bind:value={editedProduct.dateBought}
                                    disabled={isSaving}
                                />
                            </div>
                            <div>
                                <div class="flex items-center mb-1">
                                    <label class="block text-sm font-medium text-gray-700">Date Sold</label>
                                    {#if isEmptyOrZero(editedProduct.dateSold)}
                                        <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                                    {/if}
                                </div>
                                <input 
                                    type="text" 
                                    class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                        ${isEmptyOrZero(editedProduct.dateSold) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                    bind:value={editedProduct.dateSold}
                                    disabled={isSaving}
                                />
                            </div>
                            
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div class="flex items-center mb-1">
                                    <label class="block text-sm font-medium text-gray-700">Commission (£)</label>
                                    {#if editedProduct.commission === 0}
                                        <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Zero</span>
                                    {/if}
                                </div>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                        ${editedProduct.commission === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                    bind:value={editedProduct.commission}
                                    disabled={isSaving}
                                />
                            </div>
                            
                            <div>
                                <div class="flex items-center mb-1">
                                    <label class="block text-sm font-medium text-gray-700">Invoice No</label>
                                    {#if isEmptyOrZero(editedProduct.invoiceNo)}
                                        <span class="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Empty</span>
                                    {/if}
                                </div>
                                <input 
                                    type="text" 
                                    class={`text-black w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                        ${isEmptyOrZero(editedProduct.invoiceNo) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
                                    bind:value={editedProduct.invoiceNo}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">On Website</label>
                                <div class="flex items-center mt-2">
                                    <input 
                                        type="checkbox" 
                                        id="onWebsite"
                                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        bind:checked={editedProduct.onWebsite}
                                        disabled={isSaving}
                                    />
                                    <label for="onWebsite" class="ml-2 block text-sm text-gray-900">
                                        Published on website
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Sold Status</label>
                                <div class="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="soldCheckbox"
                                        class="text-black h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        bind:checked={editedProduct.sold}
                                        disabled={isSaving}
                                    />
                                    <label for="soldCheckbox" class="ml-2 block text-sm text-gray-900">
                                        Mark as sold
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Validation Summary -->
                        <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div class="flex items-center text-yellow-800">
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                                <span class="font-medium">Note on empty fields</span>
                            </div>
                            <p class="text-sm text-yellow-700 mt-2">
                                Yellow highlighted fields are empty or contain zero values. These fields are not required, 
                                but you may want to review them before saving.
                            </p>
                        </div>
                    </div>
                
                {:else}
                    <div class="bg-gray-50 p-4 rounded-lg mb-4">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                            </svg>
                            <h3 class="font-medium">Label Preview</h3>
                        </div>
                        <p class="text-sm text-gray-600 mt-1">This is a preview of how the label will look</p>
                    </div>
                    
                    <div class="border border-gray-300 rounded-lg p-6 max-w-xs mx-auto">
                        <div class="text-center mb-4">
                            <div class="text-xl font-bold">Iain Marr Antiques</div>
                            <div class="text-xs text-gray-500">Est. 1990</div>
                        </div>
                        
                        <div class="text-center mb-2">
                            <div class="font-semibold text-lg">{editedProduct.name}</div>
                            <div class="text-2xl font-bold text-blue-700">£{editedProduct.price.toFixed(2)}</div>
                        </div>
                        
                        <div class="flex justify-between text-xs mt-4">
                            <div>SKU: {editedProduct.sku}</div>
                            <div>IM: {editedProduct.imSKU}</div>
                        </div>
                        
                        <div class="mt-6 text-center text-xs text-gray-500">
                            <div>{editedProduct.location}</div>
                            <div>{new Date().toLocaleDateString('en-GB')}</div>
                        </div>
                    </div>
                {/if}
            

            {/if}
        </div>
        
        <!-- Modal Footer -->
        <div class="p-6 border-t flex justify-end space-x-3">
            <button 
                on:click={() => { showEditProductModal = false; }}
                class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                disabled={isSaving}
            >
                Cancel
            </button>
            
            <button 
                on:click={saveEditedProduct}
                class="px-5 py-2.5 rounded-lg flex items-center justify-center min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                class:bg-blue-600={!isSaving && hasChanges()}
                class:bg-gray-400={!hasChanges() || isSaving}
                class:hover:bg-blue-700={!isSaving && hasChanges()}
                disabled={!hasChanges() || isSaving}
            >
                {#if isSaving}
                    <!-- Spinner -->
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-white">Saving...</span>
                {:else}
                    <span class="text-white">Save Changes</span>
                {/if}
            </button>
        </div>
    </div>
</div>

<style>
    /* Spinner animation */
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .animate-spin {
        animation: spin 1s linear infinite;
    }
    
    /* Smooth transitions */
    button, input, .bg-yellow-50 {
        transition: all 0.2s ease;
    }
    
    /* Toast animation */
    .toast-enter {
        animation: toast-enter 0.3s ease-out forwards;
    }
    
    @keyframes toast-enter {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>