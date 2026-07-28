<script>
    import { onMount } from "svelte";
    import Panel1 from "./lib/Panel1.svelte";
    import Panel2 from "./lib/Panel2.svelte";
    import Panel3 from "./lib/Panel3.svelte";

    let showScrollHint = $state(false);
    let hasScrolled = $state(false);
    let panel2 = $state(null);

    function dismissScrollHint() {
        if (window.scrollY > 0 || showScrollHint) {
            hasScrolled = true;
            showScrollHint = false;
        }
    }

    function scrollDownFromHint() {
        hasScrolled = true;
        showScrollHint = false;

        if (panel2) {
            panel2.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }

    onMount(() => {
        if (window.scrollY > 0) {
            hasScrolled = true;
            showScrollHint = false;
        }

        const hintTimeout = window.setTimeout(() => {
            if (!hasScrolled && window.scrollY < 8) {
                showScrollHint = true;
            }
        }, 5000);

        return () => {
            window.clearTimeout(hintTimeout);
        };
    });
</script>

<svelte:window
    onscroll={dismissScrollHint}
    onwheel={dismissScrollHint}
    ontouchmove={dismissScrollHint}
/>

<main>
    <Panel1 />
    <div bind:this={panel2}>
        <Panel2 />
    </div>
    <Panel3 />
</main>

{#if showScrollHint}
    <button
        class="scroll-hint"
        type="button"
        onclick={scrollDownFromHint}
        aria-label="Scroll down"
    >
        <span class="chevron"></span>
    </button>
{/if}

<style>
    :global(*) {
        box-sizing: border-box;
    }

    :global(html, body) {
        margin: 0;
        width: 100%;
        min-height: 100%;
        overflow-x: hidden;
        background: #f6f6f3;
        color: #111;
        font-family:
            "Cormorant Garamond", "Iowan Old Style", "Times New Roman", serif;
    }

    :global(#app) {
        width: 100%;
        min-height: 100%;
        overflow-x: hidden;
    }

    :global(*) {
        scrollbar-width: thin;
        scrollbar-color: #b7b7b0 transparent;
    }

    :global(*::-webkit-scrollbar) {
        width: 8px;
        height: 8px;
    }

    :global(*::-webkit-scrollbar-track) {
        background: transparent;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background: #b7b7b0;
        border-radius: 0;
    }

    :global(*::-webkit-scrollbar-corner) {
        background: transparent;
    }

    main {
        position: relative;
        z-index: 1;
        width: 100%;
        margin: 0;
        padding: 0;
    }

    .scroll-hint {
        all: unset;
        position: fixed;
        left: 50%;
        bottom: 1rem;
        transform: translateX(-50%);
        z-index: 40;
        width: 2.1rem;
        height: 2.1rem;
        cursor: pointer;
        display: grid;
        place-items: center;
        border-radius: 999px;
        background: rgba(17, 17, 17, 0.36);
        animation:
            hintFadeIn 0.5s ease forwards,
            hintBob 1.8s ease-in-out infinite 0.55s;
    }

    .chevron {
        width: 0.7rem;
        height: 0.7rem;
        border-right: 2px solid rgba(255, 255, 255, 0.95);
        border-bottom: 2px solid rgba(255, 255, 255, 0.95);
        transform: rotate(45deg) translate(-1px, -1px);
    }

    @keyframes hintFadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes hintBob {
        0%,
        100% {
            transform: translateX(-50%) translateY(0);
        }
        50% {
            transform: translateX(-50%) translateY(6px);
        }
    }
</style>
