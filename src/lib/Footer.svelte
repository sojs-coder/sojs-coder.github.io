<script lang="ts">
  import BackgroundSlideshow from "./BackgroundSlideshow.svelte";
    import Directory from "./Directory.svelte";
</script>

<div class="footer-container">
  <BackgroundSlideshow />
  <section class="section">
    <h1>Matthieu Fuller</h1>
    <p>Building software @ <a href = "https://signalor.app">Signalor</a></p>
    <h2>Contact</h2>
    <ul>
        <li><a href="mailto:sojscoder@gmail.com">Email</a></li>
        <li>
            <a href="https://www.linkedin.com/in/matthieu-fuller"
                >LinkedIn</a
            >
        </li>
        <li><a href="https://github.com/sojs-coder">Github</a></li>
    </ul>

    <!-- <p>&copy; {new Date().getFullYear()} Matthieu Fuller. All rights reserved. "SoJS", "CCPorted", "Adhoc", and "Forge Game Engine" are protected names under common law copyright.</p> -->
  </section>
  <Directory />
  
</div>

<style>
    .footer-container {
        position: relative;
        width: 100%;
        min-height: 100vh;
    }
    
    

    section {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        padding: 50px;
        z-index: 1;
    }
    p {
        line-height: 0.5;
    }
    a {
        color: var(--text-secondary);
    }
    ul {
        list-style: none;
        padding: 0;
    }
    li {
        margin-bottom: 10px;
    }
</style>
