<script>
    import Canvas from "../Canvas.svelte";
</script>

<section class="panel panel-1" aria-label="Intro">
    <Canvas />
    <div class="header-identity">
        <span class="name">Matthieu Fuller</span>
        <span class="header-desc"
            >UCSD CS &amp; Math &middot; Building <a
                href="https://signalor.app"
                target="_blank"
                rel="noreferrer">Signalor</a
            > &middot; Engineer</span
        >
    </div>
    <nav>
        <a href="mailto:sojscoder@gmail.com">sojscoder@gmail.com</a>
        <a
            href="https://www.linkedin.com/in/matthieu-fuller"
            target="_blank"
            rel="noreferrer">LinkedIn</a
        >
        <a href="https://github.com/sojs-coder" target="_blank" rel="noreferrer"
            >GitHub</a
        >
        <a href="/resume.html">Resume</a>
    </nav>
</section>

<style>
    .panel-1 {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: end;
        gap: 3rem;
        padding: 4rem 2rem 3rem;
        border-top: 1px solid #c8c8c2;
        border-left: 1px solid #c8c8c2;
        min-height: 100vh;
        height: 100vh;
    }

    .header-identity {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 1;
    }

    .name {
        font-size: 1.45rem;
        font-weight: 600;
        letter-spacing: 0.01em;
        color: #111;
    }

    .header-desc {
        font-size: 0.85rem;
        letter-spacing: 0.02em;
        color: rgba(17, 17, 17, 0.5);
        line-height: 1.5;
    }

    .header-desc a {
        color: rgba(17, 17, 17, 0.7);
        text-decoration: underline;
        text-underline-offset: 2px;
    }

    .header-desc a:hover {
        color: #111;
    }

    nav {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.75rem;
        z-index: 2;
    }

    nav a {
        font-size: 0.85rem;
        letter-spacing: 0.04em;
        color: rgba(17, 17, 17, 0.55);
        text-decoration: none;
        transition: color 0.15s ease;
    }

    nav a:hover {
        color: #111;
    }

    @media (max-width: 900px) {
        .panel-1 {
            grid-template-columns: 1fr;
            gap: 1.8rem;
            padding: 2.4rem 1.2rem 2rem;
        }

        nav {
            align-items: flex-start;
        }
    }
</style>
