<script>
// @ts-nocheck

    export let filteredProducts;
    export let selectedProducts;
    export let toggleProduct;
    export let openEditModal;
    export let showSoldItems
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    {#each filteredProducts as product}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div 
            class={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all duration-200 relative cursor-pointer
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
                    <div class="pr-2  w-[79%]">
                        <h3 class="font-semibold text-gray-800 truncate">{product.name}</h3>
                        <div class="mt-1">
                            <span class="text-xl font-bold text-blue-600">£{product.price.toFixed(2)}</span>
                            {#if product.sold}
                                <span class="ml-2 text-sm text-red-600">(Sold)</span>
                            {/if}
                        </div>
                    </div>
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button 
                        on:click|stopPropagation={() => openEditModal(product)}
                        class={`p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors flex items-center group ${product.sold ? 'opacity-70' : ''}`}
                        title="Edit Print Info"
                    >
                        <svg class="w-5 h-5 text-blue-600 group-hover:text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        <span class="ml-1 text-sm font-medium text-blue-600 group-hover:text-blue-800 hidden md:inline">
                            Edit
                        </span>
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
                        <span>IM SKU: {product.imSKU}</span>
                    </div>
                    <div class="flex items-center">
                        <svg class="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <span class="truncate">Seller: {product.seller}</span>
                    </div>
                    <div class="flex items-center">
                        <svg class="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span class="truncate">Location: {product.location}</span>
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