<script lang="ts">
  import { Motion, useAnimation, animate } from "svelte-motion";
  import { LayoutGridIcon, ChevronRightIcon, House, Contact, LucideMenu} from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { onMount } from "svelte";

  export let mainPage = false;


  function scrollToElementWithOffset(id: string) {
        const element = document.getElementById(id);
        const yOffset = -100; // Adjust this value as needed
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({ top: y, behavior: 'smooth' });
    }

  function navbarButtonClicked(id: string, event){
    event.preventDefault();
    window.location.href = window.location.origin + id;
  }



  //  List Items
  let items = [
    { icon: House, link: "/", name: "Home" },
    { icon: Contact, link: "/details", name: "Manage Booking" },
    { icon: LayoutGridIcon, link: "/contact",name: "Contact" },
    // {
    //   icon: TrashIcon,
    //   name: "Remove account",
    //   customStyle:
    //     "!text-red-500 hover:bg-red-500/10 focus-visible:text-red-500 focus-visible:bg-red-500/10 focus-visible:border-red-500/10",
    // },
  ];
  let svgControls = useAnimation();
  let isOpen = false;

  //  Ui List
  let list = {
    visible: {
      clipPath: "inset(0% 0% 0% 0% round 12px)",
      transition: {
        type: "spring",
        bounce: 0,
      },
    },
    hidden: {
      clipPath: "inset(10% 50% 90% 50% round 12px)",
      transition: {
        duration: 0.3,
        type: "spring",
        bounce: 0,
      },
    },
  };
  //  Li Items
  let variants = {
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.3,
        delay: i * 0.15,
      },
    }),
    hidden: {
      opacity: 0,
      scale: 0.3,
      filter: "blur(20px)",
    },
  };
</script>
<!-- ml-auto flex h-full items-center space-x-6 -->
<nav class={cn("max-w-[120px] w-full ml-auto space-y-2 z-[100]")}>
  <Motion
    whileTap={{
      scale: 0.97,
    }}
    let:motion
  >
    <button
      use:motion
      on:click={() => (isOpen = !isOpen)}
      class="bg-neutral-900 border border-neutral-800 max-w-[120px] w-full flex items-center justify-between p-2.5 rounded-xl outline-none"
    >
      <span class="text-sm font-medium text-neutral-300">Menu</span>
      <div style=" transformOrigin: '50% 55%'">
        <Motion animate={svgControls} let:motion>
            <LucideMenu color={"white"}/>
        </Motion>
      </div>
    </button>
    <Motion
      animate={isOpen ? "visible" : "hidden"}
      variants={list}
      initial="hidden"
      let:motion
    >
      <ul
        use:motion
        class={cn(
          "absolute z-[1] max-w-[120px] w-full space-y-3 p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl",
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        {#each items as item, i}
          <Motion
            custom={i + 1}
            {variants}
            initial="hidden"
            animate={isOpen ? "visible" : "hidden"}
            let:motion
          >
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <li use:motion>
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_missing_attribute -->
              <a
              on:click={() => navbarButtonClicked(item.link,event)}

                class={cn(
                  "group flex items-center gap-2 rounded-md border border-transparent text-neutral-400 hover:text-neutral-300 focus-visible:text-neutral-300 focus-visible:border-neutral-800 focus-visible:outline-none",
                  item?.customStyle
                )}
              >
                <svelte:component
                  this={item.icon}
                  size={16}
                  strokeWidth={1.4}
                />
                <span class="flex items-center gap-1 text-sm font-medium">
                  {item.name}
                  <ChevronRightIcon
                    size={12}
                    class="-translate-x-1 scale-0 opacity-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all"
                  />
                </span>
              </a>
            </li>
          </Motion>
          {/each}
          <Motion
            custom={4}
            {variants}
            initial="hidden"
            animate={isOpen ? "visible" : "hidden"}
            let:motion
          >
            <!-- svelte-ignore a11y_no_static_element_interactions -->

          </Motion>
      </ul>
    </Motion>
  </Motion>
</nav>

