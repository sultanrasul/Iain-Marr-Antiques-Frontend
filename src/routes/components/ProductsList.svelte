<!-- ProductsList.svelte -->
<script lang="ts">
  import { Calendar, User, Package, DollarSign, Receipt, PoundSterling, ArrowLeft, Search, Filter, Eye, ArrowUpDown, X, Save, Edit, FileChartColumnIncreasingIcon } from 'lucide-svelte';
  import { BACKEND_URL } from '../conf';
  import { onMount } from 'svelte';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import type { Product } from '@/models/product';
  import type { PrintOptions, Stats } from '@/types';
  import ProductModal from './modals/ProductModal.svelte';
  import ProductInfo from './modals/ProductInfo.svelte';
  import { toast } from 'svelte-sonner';

  export let selectedProducts: Product[];
  export let show: boolean = false;
  export let products: Product[]
  export let printOptions: PrintOptions;
  export let stats: Stats;
  let isLoading = false;
  let error: string | null;

  let selectedProductForDetails: Product | null;   // null = modal closed, else the product object

  let sortField: 'sku_no' | 'im_sku' | 'description' | 'quantity' | 'selling_price' | 'purchase_price' = 'sku_no';
  let sortOrder: 'asc' | 'desc' = 'desc';

  // Filter state
  let skuText: string = ''; // text input for SKU
  let itemDescription = '';
  let minSellingPrice: number;
  let minPurchasePrice: number;

  // Pagination
  let currentPage = 1;
  let itemsPerPage = 20;


  // Pagination based on filtered sales
  $: totalPages = Math.ceil((stats?.total_products || 0) / itemsPerPage);
  $: paginated = products;

  $: pageNumbers = (() => {
    const delta = 2;
    const range = [];
    const rangeWithDots: any[] = [];
    let l: number;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  })();

  async function fetchProducts() { 
    let url = `${BACKEND_URL}/stock/get-stock?`;

    if (skuText) url += `sku_text=${encodeURIComponent(skuText)}&`;
    if (itemDescription) url += `description=${encodeURIComponent(itemDescription)}&`;
    if (minSellingPrice) url += `min_selling_price=${minSellingPrice}&`;
    if (minPurchasePrice) url += `min_purchase_price=${minPurchasePrice}&`;

    // Add sorting
    if (sortField) url += `sort_field=${sortField}&sort_order=${sortOrder}&`;

    // Add pagination
    url += `page=${currentPage}&items_per_page=${itemsPerPage}`;

    try {
      isLoading = true;
      error = null;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load products (${response.status})`);

      const data: {
          products: Product[];
          printer_connected: boolean;
      } = await response.json();
      products = data.products;

    } catch (err) {
      console.error(err);
      error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isLoading = false;
    }
  }

  // Automatically fetch products when the component mounts
  onMount(fetchProducts);

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      fetchProducts();
    }
    const salesHistoryEl = document.getElementById('salesHistory');
    if (salesHistoryEl) {
      salesHistoryEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Helper: check if a product is selected (using sku_no as unique identifier)
  function isSelected(product: Product): boolean {
    return selectedProducts.some(p => p.sku_no === product.sku_no);
  }

  // Toggle selection: add or remove a single product
  function toggleSelect(product: Product): void {

      if (selectedProducts.some((p) => p.sku_no === product.sku_no)) {
          // Remove product if already selected
          selectedProducts = selectedProducts.filter(
              (p) => p.sku_no !== product.sku_no
          );
      } else {
          // Add product copy with quantity = 1
          selectedProducts = [...selectedProducts, product];
      }
  }

  // Select/deselect all products on the current page
  function toggleSelectAll(): void {
      if (selectedProducts.length === paginated.length) {
          // Deselect all if all are already selected
          selectedProducts = [];
      } else {
          // Add all products from current page, each with quantity = 1
          selectedProducts = paginated.map((p) => ({ ...p, quantity: 1 }));
      }
  }

  function sortBy(field: typeof sortField) {
    if (sortField === field) {
      // Toggle between asc/desc if same column
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortOrder = 'asc'; // default to ascending on new column
    }
    fetchProducts();
  }

    // Edit mode for selected products
  let isEditingSelected = false;
  let editableSelectedProducts: Product[] = [];

  // Helper to get a copy of selected products for editing
  function startEditingSelected() {
    editableSelectedProducts = selectedProducts.map(p => ({ ...p }));
    isEditingSelected = true;
  }

  // Cancel editing – discard changes
  function cancelEditingSelected() {
    isEditingSelected = false;
    editableSelectedProducts = [];
  }

  // Save edited products – apply changes to original selectedProducts and to main products array
  async function saveEditingSelected() {
    let isSaving = true;

    try {
      if (!editableSelectedProducts.length) return;

      const res = await fetch(`${BACKEND_URL}/stock/modify-products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(editableSelectedProducts)
      });

      if (!res.ok) throw new Error("Request failed");

      selectedProducts = editableSelectedProducts.map(p => ({ ...p }));

      editableSelectedProducts.forEach(editedProduct => {
        const index = products.findIndex(p => p.sku_no === editedProduct.sku_no);
        if (index !== -1) {
          products[index] = { ...editedProduct };
        }
      });

      toast.success("Product updated successfully!");

      await fetchProducts(); // refresh from backend (source of truth)

      isEditingSelected = false;
      editableSelectedProducts = [];

    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
      // ❗ Keep edit mode open so user can retry
    } finally {
      isSaving = false;
    }
  }
  
</script>

{#if selectedProductForDetails}
  <!-- Product Detail View -->
  <div class="bg-white rounded-xl shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <button
          on:click={()=> {selectedProductForDetails=null}}
          class="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          title="Back to products list"
        >
          <ArrowLeft class="w-5 h-5 text-gray-600" />
        </button>
        <div class="flex items-center space-x-2">
          <Receipt class="w-6 h-6 text-[#011993] invisible" />
          <h2 class="text-2xl font-semibold text-gray-800">Order Details</h2>
        </div>
      </div>
      <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
        {products.length} total products
      </span>
    </div>
    <ProductInfo fetchProducts={fetchProducts} bind:product={selectedProductForDetails} />
  </div>

{:else}
<!-- Products List View -->
  <div class="bg-white rounded-xl shadow p-6" id="salesHistory">
    <!-- Header with back button and summary -->
    <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <button
                on:click={() => { show = !show }}
              class="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              title="Back to products"
            >
              <ArrowLeft class="w-5 h-5 text-gray-600" />
            </button>
            <div class="flex items-center space-x-2">
              <PoundSterling class="w-6 h-6 text-[#011993]" />
              <h2 class="text-2xl font-semibold text-gray-800">Products</h2>
            </div>
          </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {products.length} total products
          </span>

          <!-- Edit Selected Button (only show if at least one product selected and not already editing) -->
          {#if !isEditingSelected && selectedProducts.length > 0}
            <button
              on:click={startEditingSelected}
              class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Edit class="w-4 h-4" />
              <span>Edit Selected ({selectedProducts.length})</span>
            </button>
          {/if}

          <!-- Save/Cancel buttons when editing -->
          {#if isEditingSelected}
            <div class="flex gap-2">
              <button
                on:click={saveEditingSelected}
                class="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Save class="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              <button
                on:click={cancelEditingSelected}
                class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                <X class="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          {/if}
        </div>
    </div>


    <!-- Product Filter Bar -->
    <form on:submit|preventDefault={fetchProducts} class="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200 shadow-sm text-black">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4">

        <!-- SKU Filter (single input for sku_no / im_sku) -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">SKU</label>
          <input
            type="text"
            bind:value={skuText}
            placeholder="SKU No or IM SKU"
            class="text-black block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Item Description -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Item Description</label>
          <input
            type="text"
            bind:value={itemDescription}
            placeholder="Item description"
            class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Selling Price -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Selling Price (Min)</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PoundSterling class="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              bind:value={minSellingPrice}
              placeholder="0.00"
              class="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <!-- Purchase Price -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Purchase Price (Min)</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PoundSterling class="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              bind:value={minPurchasePrice}
              placeholder="0.00"
              class="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <!-- Apply Button -->
        <div class="flex items-end">
          <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Apply filters"
          >
            <Search class="h-4 w-4" />
            <span class="hidden sm:inline">Apply</span>
          </button>
        </div>

      </div>
    </form>


    <!-- Sales table – now with checkboxes -->
    <div class="overflow-x-auto rounded-lg border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <!-- Select All checkbox (not sortable) -->
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input type="checkbox" checked={selectedProducts.length === paginated.length} on:change={toggleSelectAll} class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
            </th>

            <!-- Sortable columns -->
            <th on:click={() => sortBy('sku_no')} scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 group" data-sort-key="sku_no">
              <div class="flex items-center gap-1">
                SKU
                <ArrowUpDown class="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
              </div>
            </th>

            <th on:click={() => sortBy('im_sku')} scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 group" data-sort-key="im_sku">
              <div class="flex items-center gap-1">
                IM SKU
                <ArrowUpDown class="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
              </div>
            </th>

            <th on:click={() => sortBy('description')} scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 group" data-sort-key="item_description">
              <div class="flex items-center gap-1">
                Description
                <ArrowUpDown class="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
              </div>
            </th>

            <th on:click={() => sortBy('quantity')} scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 group" data-sort-key="quantity">
              <div class="flex items-center gap-1">
                Quantity
                <ArrowUpDown class="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
              </div>
            </th>

            <th on:click={() => sortBy('selling_price')} scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 group" data-sort-key="selling_price">
              <div class="flex items-center gap-1">
                Selling Price
                <ArrowUpDown class="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
              </div>
            </th>

            <th on:click={() => sortBy('purchase_price')} scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 group" data-sort-key="purchase_price">
              <div class="flex items-center gap-1">
                Purchase Price
                <ArrowUpDown class="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
              </div>
            </th>

            <!-- View column (not sortable) -->
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each paginated as product}
            <!-- Determine if this product is selected -->
            {@const selected = isSelected(product)}
            <!-- Find the editable version if in edit mode -->
            {@const editableProduct = isEditingSelected
              ? editableSelectedProducts.find(ep => ep.sku_no === product.sku_no)
              : null
            }

            <tr on:click={isEditingSelected ? undefined : () => toggleSelect(product)} class="text-black transition-colors cursor-pointer" class:bg-blue-50={isSelected(product)} class:hover:bg-blue-50={isSelected(product)} class:hover:bg-gray-50={!isSelected(product)}>
              <!-- Selection checkbox - disabled during edit mode -->
              <td class="px-4 py-2 whitespace-nowrap align-middle" on:click|stopPropagation>
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={isEditingSelected}
                  on:change={() => toggleSelect(product)}
                  class="rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-shadow"
                />
              </td>

              <!-- SKU (never editable) -->
              <td class="px-4 py-2 whitespace-nowrap text-sm font-mono font-medium text-gray-700">
                {product.sku_no || '—'}
              </td>

              <!-- IM SKU - editable if selected and in edit mode -->
              <td class="px-4 py-2 whitespace-nowrap text-sm font-mono">
                {#if isEditingSelected && editableProduct}
                  <input
                    type="text"
                    bind:value={editableProduct.im_sku}
                    placeholder="IM SKU"
                    class="w-32 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                {:else}
                  <span class="text-gray-500">{product.im_sku || '—'}</span>
                {/if}
              </td>

              <!-- Description - editable if selected and in edit mode -->
              <td class="px-4 py-2 text-sm max-w-xs">
                {#if isEditingSelected && editableProduct}
                  <input
                    type="text"
                    bind:value={editableProduct.item_description}
                    placeholder="Description"
                    class="w-full min-w-[200px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                {:else}
                  <div class="flex items-center gap-2">
                    <span class="capitalize text-gray-800 truncate" title={product.item_description}>
                      {product.item_description || '—'}
                    </span>
                  </div>
                {/if}
              </td>

              <!-- Quantity - editable if selected and in edit mode -->
              <td class="px-4 py-2 whitespace-nowrap text-sm">
                {#if isEditingSelected && editableProduct}
                  <input
                    type="number"
                    step="1"
                    min="0"
                    bind:value={editableProduct.quantity}
                    class="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                {:else}
                  <div class="flex items-center gap-1.5">
                    <Package class="w-4 h-4 text-gray-400" />
                    <span class="font-medium text-gray-700">{product.quantity}</span>
                  </div>
                {/if}
              </td>

              <!-- Selling Price - editable if selected and in edit mode -->
              <td class="px-4 py-2 whitespace-nowrap text-sm font-semibold">
                {#if isEditingSelected && editableProduct}
                  <div class="relative inline-block">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      bind:value={editableProduct.selling_price}
                      class="w-32 pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                {:else}
                  <span class="text-emerald-700 font-bold">£{product.selling_price}</span>
                {/if}
              </td>

              <!-- Purchase Price - editable if selected and in edit mode -->
              <td class="px-4 py-2 whitespace-nowrap text-sm">
                {#if isEditingSelected && editableProduct}
                  <div class="relative inline-block">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      bind:value={editableProduct.purchase_price}
                      class="w-32 pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                {:else}
                  <span class="text-gray-600">£{product.purchase_price}</span>
                {/if}
              </td>

              <!-- View button (disabled during edit mode) -->
              <td class="px-4 py-2 text-center align-middle" on:click|stopPropagation>
                <button
                  on:click={() => !isEditingSelected && (selectedProductForDetails = product)}
                  disabled={isEditingSelected}
                  class="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow disabled:opacity-40 disabled:cursor-not-allowed"
                  title="View full details"
                >
                  <Eye class="w-4 h-4" />
                  <span>View</span>
                </button>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="8" class="px-6 py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="p-4 bg-gray-100 rounded-full">
                    <Package class="w-10 h-10 text-gray-400" />
                  </div>
                  <p class="text-lg font-medium text-gray-700">No products found</p>
                  <p class="text-sm text-gray-500">Try adjusting your filters or clear them</p>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

  </div>

  <!-- Pagination -->
  {#if stats && stats.total_products > itemsPerPage}
    <div class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="text-sm text-gray-600">
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, products?.length)} 
        to {Math.min(currentPage * itemsPerPage, products?.length)} 
        of {products?.length} products
      </div>
      
      <div class="flex items-center gap-1">
        <button
          on:click={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          class="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {#each pageNumbers as page}
          {#if page === '...'}
            <span class="px-2 py-1.5 text-gray-500">...</span>
          {:else}
            <button
              on:click={() => goToPage(Number(page))}
              class={`px-3 py-1.5 rounded-md border transition-colors ${
                currentPage === page
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          {/if}
        {/each}
        
        <button
          on:click={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          class="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <div class="flex items-center gap-2 text-sm">
        <label for="itemsPerPage" class="text-gray-600">Items per page:</label>
        <select
          id="itemsPerPage"
          bind:value={itemsPerPage}
          on:change={fetchProducts}
          class="px-2 py-1 border border-gray-300 text-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  {/if}
{/if}