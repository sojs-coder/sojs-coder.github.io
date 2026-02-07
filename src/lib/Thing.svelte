<script lang="ts">
    import { onMount } from "svelte";

    interface Props {
        path: string;
        name: string;
        des: string;
        image?: string;
    }

    const { path, name, des, image }: Props = $props();

    let hovered = $state(false);
    let img: HTMLImageElement | null = $state(null);
    let hoverTimeout: number | null = null;
    function handleMouseEnter() {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }
        hovered = true;
    }
    function handleMouseMove(e: MouseEvent) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        if (img) {
            const imgRect = img.getBoundingClientRect();
            const offsetX = 20; // Distance from the cursor
            const offsetY = 20;

            // Get the actual dimensions of the image
            const imgWidth = imgRect.width || 300;
            const imgHeight = imgRect.height || 300;

            // Calculate proposed position
            let imgX = mouseX + offsetX;
            let imgY = mouseY + offsetY;

            // Check if image would go off the right edge of viewport
            if (imgX + imgWidth > window.innerWidth) {
                imgX = mouseX - offsetX - imgWidth;
            }

            // Check if image would go off the bottom edge of viewport
            if (imgY + imgHeight > window.innerHeight) {
                imgY = mouseY - offsetY - imgHeight;
            }

            img.style.left = `${imgX}px`;
            img.style.top = `${imgY}px`;
        }
    }
    function handleMouseLeave() {
        hoverTimeout = setTimeout(() => {
            hovered = false;
        }, 40); // Delay hiding the image by 40ms
    }
    onMount(() => {});
</script>

<li onmouseenter={handleMouseEnter} onmouseleave={handleMouseLeave} onmousemove={handleMouseMove}>
    <a href={path} target="_blank">{name}</a>: {des}
</li>

{#if image}
    <img src={image} alt={name} class:visible={hovered} bind:this={img} />
{/if}

<style>
    li {
        position: relative;
    }

    a {
        font-style: italic;
        font-weight: 800;
        color: white;
        text-decoration: underline;
    }

    img.visible {
        display: block;
    }
    img {
        display: none;
        position: fixed;
        max-width: 400px;
        max-height: 400px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 1000;
    }
</style>
