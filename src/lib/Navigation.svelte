<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import LogoLarge from '../assets/logo-large.png';
    import NavMenu from './NavMenu.svelte';

    let showNav = true;
    let lastScrollY = 0;

    function handleScroll() {
        const currentScrollY = window.scrollY;
        if (currentScrollY < 100) {
            showNav = true;
        } else if (currentScrollY > lastScrollY) {
            // Scrolling down
            showNav = false;
        } else {
            // Scrolling up
            showNav = true;
        }
        lastScrollY = currentScrollY;
    }

    function handleMouseMove(event: MouseEvent) {
        if (event.clientY < 100) {
            showNav = true; // Show nav when mouse is near the top
        }
    }
    onMount(() => {
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousemove', handleMouseMove);
    });

    onDestroy(() => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mousemove', handleMouseMove);
    });
</script>

<style>
    .navigation {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        background-color: var(--nav-background);
        padding: 36px;
        height: 100px;
        width: 100%;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        box-sizing: border-box;
        position: fixed;
        top: 0;
        left: 0;
        transition: transform var(--primary-transition) ease;
        z-index: 100;
    }
    .hide {
        transform: translateY(-110px);
    }
    img {
        height: 50px;
        width: auto;
    }
</style>

<div class="navigation {showNav ? '' : 'hide'}">
    <img src={LogoLarge} alt="UCSD Logo" />
    <NavMenu />
</div>