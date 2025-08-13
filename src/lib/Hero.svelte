<script>
    import HeroImage from '../assets/hero.png'
</script>


<style>
    .section {
        text-align: center;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    h1 {
        font-size: 6em;
        font-weight: 900;
        margin: 1rem;
        max-width: 1300px;
        color: var(--text-white);
    }

    p {
        font-size: 24px;
        margin-top: 1rem;
        color: var(--text-white-secondary);
    }

        section img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        position: fixed;
        top: 0px;
        left: 0px;
        z-index: -1;
        filter: brightness(0.2);
        background-color: rgba(0, 0, 0, 0.3);
        mix-blend-mode: multiply;

    }

    @media (max-width: 768px) {
        h1 {
            font-size: 4em;
        }

        p {
            font-size: 20px;
        }

        .section {
            padding: 1rem;
        }
    }

    @media (max-width: 480px) {
        h1 {
            font-size: 3em;
        }

        p {
            font-size: 18px;
        }

        .section {
            padding: 0.5rem;
        }
    }
</style>


<section class = "section">
    <h1>SoJS</h1>
    <p>WebDev, AI, CI/CD, DevOps</p>
    <img src={HeroImage} alt="SoJS Coder Hero" />
</section>

