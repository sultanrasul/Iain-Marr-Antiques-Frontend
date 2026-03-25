<!-- SalesList.svelte -->
<script lang="ts">
  import { Calendar, User, Package, DollarSign, Receipt, PoundSterling, ArrowLeft, Search, Filter, Eye } from 'lucide-svelte';
  import type { Sales } from '@/models/sales';
  import SaleInfo from './SaleInfo.svelte';
  import { BACKEND_URL } from '../conf';
  import { onMount } from 'svelte';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import type { Product } from '@/models/product';
  import type { PrintOptions } from '@/types';
  import ProductModal from './modals/ProductModal.svelte';
  import ProductInfo from './modals/ProductInfo.svelte';

  export let selectedProducts: Product[];
  export let show: boolean = false;
  export let products: Product[]
  export let printOptions: PrintOptions;
  let isLoading = false;
  let error: string | null;
  export let fetchProducts: () => Promise<void>;

  let selectedProductForDetails: Product | null;   // null = modal closed, else the product object


  let selectedSale: Sales | null = null;
  let sortBy: 'date' | 'customer' | 'amount' | 'items' = 'date';
  let sortOrder: 'asc' | 'desc' = 'desc';

  // Filter state
  let fromDate = '';
  let toDate = '';
  let searchField: 'customer' | 'orderId' = 'customer';
  let searchText = '';
  let minItems = 0;
  let minAmount = 0;

  // Pagination
  let currentPage = 1;
  let itemsPerPage = 20;


  // Pagination based on filtered sales
  $: totalPages = Math.ceil(products?.length / itemsPerPage);
  $: paginatedSales = products?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  $: {
    currentPage = 1;
  }

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

//   async function fetchSales() {
//     if (sales) return;
//     try {
//       isLoading = true;
//       error = null;

//       const response = await fetch(`${BACKEND_URL}/stock/get-sales`, {
//         headers: { Accept: 'application/json' }
//       });

//       if (!response.ok) throw new Error(`Failed to load products (${response.status})`);

//       sales = await response.json();
//     } catch (err) {
//       console.error(err);
//       error = err instanceof Error ? err.message : 'Unknown error';
//     } finally {
//       isLoading = false;
//     }
//   }

//   onMount(fetchSales);

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
    const salesHistoryEl = document.getElementById('salesHistory');
    if (salesHistoryEl) {
      salesHistoryEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function selectSale(sale: Sales) {
    selectedSale = sale;
  }

  function closeSaleDetail() {
    selectedSale = null;
  }

  // Formatting helpers
  function formatDate(date: Date | string): string {
    if (!date) return '—';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(value);
  }

  // test
  // Helper: check if a product is selected (using sku_no as unique identifier)
  function isSelected(product: Product): boolean {
    return selectedProducts.some(p => p.sku_no === product.sku_no);
  }

  // Toggle selection: add or remove the whole product object
  function toggleSelect(product: Product): void {
    if (isSelected(product)) {
      // Remove product – filter out by sku_no
      selectedProducts = selectedProducts.filter(p => p.sku_no !== product.sku_no);
    } else {
      // Add the whole product (or a subset if you prefer, but must match Product interface)
      selectedProducts = [...selectedProducts, product];
    }
  }

  // Select/deselect all products on the current page
  function toggleSelectAll(): void {
    if (selectedProducts.length === paginatedSales.length) {
      // Deselect all if all are already selected
      selectedProducts = [];
    } else {
      // Add all products from the current page (full objects)
      selectedProducts = [...paginatedSales];
    }
  }

  // Remove a single product from the selected list (by sku_no)
  function removeSelected(product: Product): void {
    selectedProducts = selectedProducts.filter(p => p.sku_no !== product.sku_no);
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
          title="Back to sales list"
        >
          <ArrowLeft class="w-5 h-5 text-gray-600" />
        </button>
        <div class="flex items-center space-x-2">
          <Receipt class="w-6 h-6 text-[#011993] invisible" />
          <h2 class="text-2xl font-semibold text-gray-800">Order Details</h2>
        </div>
      </div>
      <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
        10 total sales
      </span>
    </div>
    <ProductInfo fetchProducts={fetchProducts} bind:product={selectedProductForDetails} />
  </div>

{:else}
  <!-- Sales List View -->
  <!-- Sales List View - Redesigned -->
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
          <h2 class="text-2xl font-semibold text-gray-800">Sales History</h2>
        </div>
      </div>
      <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
        1 total sales
      </span>
    </div>


    <!-- Filter Bar – with embedded search dropdown and Apply button -->
    <div class="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200 shadow-sm">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4">
        <!-- Date From -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">From</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar class="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="date"
              bind:value={fromDate}
              class="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <!-- Date To -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">To</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar class="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="date"
              bind:value={toDate}
              class="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <!-- Search with embedded dropdown -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Search</label>
          <div class="flex rounded-md shadow-sm">
            <select
              bind:value={searchField}
              class="rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-700 text-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="customer">Customer</option>
              <option value="orderId">Order ID</option>
            </select>
            <input
              type="text"
              bind:value={searchText}
              placeholder={searchField === 'customer' ? 'Customer name' : 'Order ID'}
              class="text-black block w-full rounded-r-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Combined Min Items & Min Amount -->
        <div>
          <div class="flex gap-2">
            <!-- Min Items -->
            <div class="flex-1">
              <label class="block text-xs font-medium text-gray-700 mb-1">Items</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package class="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="number"
                  min="0"
                  bind:value={minItems}
                  placeholder="0"
                  class="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <!-- Min Amount -->
            <div class="flex-1">
              <label class="block text-xs font-medium text-gray-700 mb-1">Amount</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PoundSterling class="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  bind:value={minAmount}
                  placeholder="0.00"
                  class="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Apply Button Column (auto width) -->
        <div class="flex items-end">
          <button
            class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Apply filters"
          >
            <Search class="h-4 w-4" />
            <span class="hidden sm:inline">Apply</span>
          </button>
        </div>
      </div>
    </div>


  <!-- Sales table – now with checkboxes -->
  <div class="overflow-x-auto rounded-lg border border-gray-200">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <!-- Select All checkbox -->
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <input
              type="checkbox"
              checked={selectedProducts.length === paginatedSales.length}
              on:change={toggleSelectAll}
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IM SKU</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
          <th scope="col" class="px-6 py-3 text-center text-xs font-medium rounded-l bg-gray-200 text-gray-500 uppercase tracking-wider">View</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each paginatedSales as product}
          <tr class="hover:bg-gray-50 transition-colors cursor-pointer" class:bg-blue-50={isSelected(product)} on:click={() => toggleSelect(product)}>
            <!-- Selection checkbox - stop propagation to prevent double toggle -->
            <td class="px-6 py-4 whitespace-nowrap" on:click|stopPropagation>
              <input
                type="checkbox"
                checked={isSelected(product)}
                on:change={() => toggleSelect(product)}
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{product.sku_no || '—'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{product.im_sku || '—'}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate" title={product.item_description}>
              <div class="flex items-center">
                <span class="capitalize">{product.item_description}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              <div class="flex items-center">
                <Package class="w-4 h-4 text-gray-400 mr-2" />
                {product.quantity}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600"> {product.selling_price}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">{product.purchase_price}</td>
            <td class="px-6 py-4 text-center" on:click={() => selectedProductForDetails = product}>
              <button
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                title="View full details"
              >
                <Eye class="w-4 h-4" />
                <span>View</span>
              </button>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="7" class="px-6 py-12 text-center text-gray-500">
              <div class="flex flex-col items-center">
                <Package class="w-12 h-12 text-gray-300 mb-3" />
                <p class="text-lg font-medium text-gray-700">No Products found</p>
                <p class="text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  </div>

  <!-- Pagination -->
  {#if products && products?.length > itemsPerPage}
    <div class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="text-sm text-gray-600">
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, products?.length)} 
        to {Math.min(currentPage * itemsPerPage, products?.length)} 
        of {products?.length} sales
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