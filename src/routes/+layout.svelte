<script>
	import '../app.css';
	import '@fontsource/merriweather/300.css';
	import '@fontsource/merriweather/400.css';
	import '@fontsource/merriweather/700.css';
	import '@fontsource/merriweather/900.css';

	import { afterNavigate } from "$app/navigation";
	import { onMount, tick } from 'svelte';
	import { Toaster } from 'svelte-sonner';
	import { browser } from '$app/environment';

	import { ModeWatcher, setMode } from 'mode-watcher';

	import { initFlowbite } from 'flowbite';
	import Navbar from './Navbar.svelte';
	import Drawer from './Drawer.svelte';
	import Footer from './Footer.svelte';
	import { page } from '$app/stores';

	let lastPath = '';
	let currentRoute = '';
	let previousRoute = '';
	let show = true;

	setMode('dark');

	async function initPackages() {
		if (!browser) return;

		// Initialize Flowbite (always works)
		if (typeof initFlowbite === 'function') {
			initFlowbite();
			console.log("Flowbite initialized");
		}

		// Delay Preline's init until DOM is fully stable
		await tick(); // Wait for Svelte DOM updates
		await tick(); // Extra safety (optional)

		requestAnimationFrame(() => {
			setTimeout(() => {
				if (window?.HSStaticMethods?.autoInit) {
					window.HSStaticMethods.autoInit();
					console.log("Preline initialized");
				} else {
					console.warn("Preline HSStaticMethods not found"); 
				}
			}, 50); // Delay slightly for safety
		});
	}


	async function transitionToNewPage() {
		show = false;
		await tick(); // DOM unmount
		show = true;
		await tick(); // DOM remount
		initPackages(); // Now safe to re-init
	}

	afterNavigate(() => {
		// Optional if you want to re-init on browser back/forward
		initPackages();
	});

	$: currentRoute = $page.url.pathname;

	$: if (currentRoute !== previousRoute) {
		console.log(currentRoute);
		transitionToNewPage();
		previousRoute = currentRoute;
	}

	onMount(() => {
		initPackages();
	});
	

</script>

<Drawer />
<Toaster position="top-right" richColors={true} />
<ModeWatcher />

{#if show}
	<div on:introend={initPackages}>
		<slot/>
	</div>
{/if}

<style>
	:global(.swiper-pagination-bullet) {
		background: #C09A5B !important;
		opacity: 0.5 !important;
		width: 10px;
		height: 10px;
	}

	:global(.swiper-pagination-bullet-active) {
		opacity: 1 !important;
		background: #C09A5B !important;
	}

	:global(body) {
		touch-action: manipulation;
	}
</style>
