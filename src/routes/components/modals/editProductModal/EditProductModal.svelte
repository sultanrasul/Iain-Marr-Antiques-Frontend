<script>
// @ts-nocheck

    export let editedProduct;
    export let showEditProductModal;
    export let activeTab;
    export let saveEditedProduct;
    export let printSelected;
    export let selectedProducts;
    export let openEditModal;

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(value);
    };

</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                >
                    Product Details
                </button>
                <button 
                    class={`px-6 py-3 font-medium text-sm ${activeTab === 'financial' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    on:click={() => activeTab = 'financial'}
                >
                    Financial Details
                </button>
                <button 
                    class={`px-6 py-3 font-medium text-sm ${activeTab === 'print' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    on:click={() => activeTab = 'print'}
                    disabled={!editedProduct}
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
                                <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                <input 
                                    type="text" 
                                    class="text-black/50 w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-not-allowed" 
                                    bind:value={editedProduct.sku}
                                    disabled
                                />
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">IM SKU</label>
                                <input 
                                    type="text" 
                                    class="text-black w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    bind:value={editedProduct.imSKU}
                                />
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input 
                                type="text" 
                                class="text-black w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                bind:value={editedProduct.name}
                            />
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="text-black block text-sm font-medium text-gray-700 mb-1">Selling Price (£)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    class="text-black w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    bind:value={editedProduct.price}
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Purchase Price (£)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    class="text-black w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    bind:value={editedProduct.purchasePrice}
                                />
                            </div>
                        </div>
                        
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Seller</label>
                                <input 
                                    type="text" 
                                    class="text-black w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    bind:value={editedProduct.seller}
                                />
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input 
                                    type="text" 
                                    class="text-black w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    bind:value={editedProduct.location}
                                />
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Date Bought</label>
                                <input 
                                    type="text" 
                                    class="text-black w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    bind:value={editedProduct.dateBought}
                                />
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">On Website</label>
                                <div class="flex items-center mt-2">
                                    <input 
                                        type="checkbox" 
                                        id="onWebsite"
                                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        bind:checked={editedProduct.onWebsite}
                                    />
                                    <label for="onWebsite" class="ml-2 block text-sm text-gray-900">
                                        Published on website
                                    </label>
                                </div>
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
                                />
                                <label for="soldCheckbox" class="ml-2 block text-sm text-gray-900">
                                    Mark as sold
                                </label>
                            </div>
                        </div>
                    </div>
                
                <!-- Financial Details Tab -->
                {:else if activeTab === 'financial'}
                    <div class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="bg-blue-50 p-4 rounded-lg">
                                <div class="text-sm text-blue-700">Profit Potential</div>
                                <div class="text-xl font-bold text-blue-800">
                                    {formatCurrency(editedProduct.price - editedProduct.purchasePrice)}
                                </div>
                            </div>
                            <div class="bg-green-50 p-4 rounded-lg">
                                <div class="text-sm text-green-700">Commission</div>
                                <div class="text-xl font-bold text-green-800">
                                    {formatCurrency(editedProduct.commission)}
                                </div>
                            </div>
                            <div class="bg-purple-50 p-4 rounded-lg">
                                <div class="text-sm text-purple-700">Net Value</div>
                                <div class="text-xl font-bold text-purple-800">
                                    {formatCurrency(editedProduct.price - editedProduct.commission)}
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Commission (£)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    class="text-black w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    bind:value={editedProduct.commission}
                                />
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Date Sold</label>
                                <input 
                                    type="text" 
                                    class="text-black w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    bind:value={editedProduct.dateSold}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
                            <input 
                                type="text" 
                                class="text-black w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                bind:value={editedProduct.invoiceNo}
                            />
                        </div>
                        
                        <div class="bg-yellow-50 p-4 rounded-lg mt-4">
                            <div class="text-sm text-yellow-700">Financial Summary</div>
                            <div class="mt-2 space-y-1">
                                <div class="flex justify-between">
                                    <span>Purchase Price:</span>
                                    <span>{formatCurrency(editedProduct.purchasePrice)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Selling Price:</span>
                                    <span>{formatCurrency(editedProduct.price)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Commission:</span>
                                    <span>-{formatCurrency(editedProduct.commission)}</span>
                                </div>
                                <div class="flex justify-between border-t border-gray-300 pt-1 font-medium">
                                    <span>Net Profit:</span>
                                    <span>{formatCurrency(editedProduct.price - editedProduct.purchasePrice - editedProduct.commission)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                
                <!-- Print Preview Tab -->
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
                on:click={() => { 
                    if (activeTab === 'products') activeTab = 'financial';
                    else if (activeTab === 'financial') activeTab = 'print';
                    else activeTab = 'products';
                }}
                class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
                {activeTab === 'print' ? 'Back to Details' : 'Next'}
            </button>
            
            <button 
                on:click={() => { showEditProductModal = false}}
                class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
                Cancel
            </button>
            
            <button 
                on:click={saveEditedProduct}
                class="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
                Save Changes
            </button>
        </div>
    </div>
</div>