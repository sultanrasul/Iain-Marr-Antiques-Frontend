<script>
// @ts-nocheck
    export let filteredProducts;
    export let selectedProducts;
    export let toggleProduct;
    export let openEditModal;
    export let showSoldItems;

    // Pagination variables
    let currentPage = 1;
    let itemsPerPage = 24; // Show 24 items per page (good for grid layouts)
    
    // Calculate paginated products
    $: paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    
    // Calculate total pages
    $: totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    // Function to change page
    function goToPage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            // Scroll to top of products section for better UX
            const searchBar = document.getElementById('searchBar')
            if (searchBar) {
                searchBar.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
    
    // Function to generate page numbers for pagination controls
    $: pageNumbers = (() => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            // Show all pages if total pages is less than max visible
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always include first page
            pages.push(1);
            
            // Calculate start and end of visible pages
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);
            
            // Adjust if we're near the start
            if (currentPage <= 3) {
                endPage = 4;
            }
            
            // Adjust if we're near the end
            if (currentPage >= totalPages - 2) {
                startPage = totalPages - 3;
            }
            
            // Add ellipsis if needed after first page
            if (startPage > 2) {
                pages.push('...');
            }
            
            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            
            // Add ellipsis if needed before last page
            if (endPage < totalPages - 1) {
                pages.push('...');
            }
            
            // Always include last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }
        
        return pages;
    })();
</script>

<div class="products-container">
    <!-- Products Grid -->
    <div class="products-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {#each paginatedProducts as product}
            <!-- Product Card -->
            <div
                class={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all duration-200 relative cursor-pointer
                    ${selectedProducts.find(p => p.id === product.id) ? 'border-blue-500 shadow-lg' : 'border-transparent'}`}
                on:click={() => toggleProduct(product)}
            >

                <div class="absolute bottom-3 right-3 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                    Qty: {product.quantity}
                </div>
                {#if product.sold}
                    <div class="absolute top-14 right-3 px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                        SOLD
                    </div>
                {/if}
                
                <div class="p-4">
                    <div class="flex justify-between items-start">
                        <div class="pr-2  w-[79%]">
                            <h3 class="font-semibold text-gray-800 truncate">{product.name}</h3>
                            <div class="mt-1">
                                <span class="text-xl font-bold text-blue-600">£{product.price.toFixed(2)}</span>
                            </div>
                        </div>
                        <button 
                            on:click|stopPropagation={() => openEditModal(product)}
                            class={`p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors flex items-center group `}
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

    <!-- Pagination Controls -->
    {#if filteredProducts.length > itemsPerPage}
        <div class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-sm text-gray-600">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)} 
                to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} 
                of {filteredProducts.length} products
            </div>
            
            <div class="flex items-center gap-1">
                <!-- Previous Button -->
                <button
                    on:click={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    class="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                </button>
                
                <!-- Page Numbers -->
                {#each pageNumbers as page}
                    {#if page === '...'}
                        <span class="px-2 py-1.5 text-gray-500">...</span>
                    {:else}
                        <button
                            on:click={() => goToPage(page)}
                            class={`px-3 py-1.5 rounded-md border transition-colors
                                ${currentPage === page
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                            {page}
                        </button>
                    {/if}
                {/each}
                
                <!-- Next Button -->
                <button
                    on:click={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    class="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
            </div>
            
            <!-- Items Per Page Selector -->
            <div class="flex items-center gap-2 text-sm">
                <label for="itemsPerPage" class="text-gray-600">Items per page:</label>
                <select
                    id="itemsPerPage"
                    bind:value={itemsPerPage}
                    class="px-2 py-1 border border-gray-300 text-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                    <option value={96}>96</option>
                </select>
            </div>
        </div>
    {/if}
</div>

