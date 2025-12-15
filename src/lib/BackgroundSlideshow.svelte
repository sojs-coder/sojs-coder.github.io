<script lang="ts">
    import { fade } from "svelte/transition";
    import { onMount } from "svelte";

    import Mural1 from "../assets/mural1.png";
    import Mural2 from "../assets/mural2.png";
    import Hero from "../assets/hero.png";
    import Journal from "../assets/journal.png";
    import AdHocHome from "../assets/adhoc_home.png";
    import Dragonball from "../assets/dragonball.png";
    import FlappySprite from "../assets/flappy_sprite.png";
    import ForgeEngineNodeEditor from "../assets/fe_ne.png";
    import ForgeEditor from "../assets/forgeeditor.png";
    import Minecraft from "../assets/minecraft.png";
    import Physics from "../assets/physics.png";
    import Roommate from "../assets/roommate_home.png";
    import TheAdvocate from "../assets/the_advocate.png";
    import SpriteBuilder from "../assets/spritebuilder.png";
    import AdHocAnatics from "../assets/adhoc_analytics.png";
    import CCPortedFeature from "../assets/ccported_feature.png";
    import RoomMateSearch from "../assets/roommate_advanced_search.png";

    // Hard-coded images for the slideshow
    const images = [
        Mural1,
        Mural2,
        Hero,
        Journal,
        AdHocHome,
        Dragonball,
        FlappySprite,
        ForgeEngineNodeEditor,
        ForgeEditor,
        Minecraft,
        Physics,
        Roommate,
        TheAdvocate,
        SpriteBuilder,
        AdHocAnatics,
        CCPortedFeature,
        RoomMateSearch,
    ];

    let currentIndex = $state(0);
    let intervalId: number | null = null;
    let lastTwoIndices = $state<number[]>([-1, -1]); // Initialize with invalid indices

    function nextImage() {
        // Get available indices (excluding the last two shown)
        const availableIndices = images
            .map((_, index) => index)
            .filter((index) => !lastTwoIndices.includes(index));

        // If we have fewer than 3 images total, or all images are in last two,
        // exclude only the current one to ensure we can always pick a different image
        const indicesToChooseFrom =
            availableIndices.length > 0
                ? availableIndices
                : images
                      .map((_, index) => index)
                      .filter((index) => index !== currentIndex);

        // Randomly select from available indices
        const randomIndex = Math.floor(
            Math.random() * indicesToChooseFrom.length,
        );
        const newIndex = indicesToChooseFrom[randomIndex];

        // Update tracking: move current to first position, previous first becomes second
        lastTwoIndices = [currentIndex, lastTwoIndices[0]];
        currentIndex = newIndex;
    }

    onMount(() => {
        // Auto-advance every 7 seconds (5 seconds visible + 2 seconds transition)
        intervalId = window.setInterval(nextImage, 7000);

        return () => {
            if (intervalId !== null) {
                clearInterval(intervalId);
            }
        };
    });
</script>

<div class="background-slideshow">
    <div class="slides-container">
        {#each images as image, index}
            {#if index === currentIndex}
                <div
                    class="slide"
                    in:fade={{ duration: 2000 }}
                    out:fade={{ duration: 2000 }}
                >
                    <img src={image} alt="Background slide {index + 1}" />
                </div>
            {/if}
        {/each}
    </div>
    <div class="rose-overlay"></div>
</div>

<style>
    .background-slideshow {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        overflow: hidden;
    }

    .slides-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .slide {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        filter: blur(10px);
    }

    .slide img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .rose-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #232323;
        opacity: 0.99;
        mix-blend-mode: multiply;
        z-index: 1;
        pointer-events: none;
    }
</style>
