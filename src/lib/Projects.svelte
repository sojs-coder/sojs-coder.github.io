<script lang="ts">
  import ProjectCard from "./ProjectCard.svelte";

  const projects = [
    {
      title: "The Advocate",
      shortDescription:
        "The Advocate is a project that will attempt to lower the polarization of online media sources.",
      thumbnail: "/src/assets/the_advocate.png", // Example thumbnail
      fullDescription:
        'When scrolling through social media, people often find increasingly polar perspectives on global current events. Two sources can and will often say completely contradictory things about the same event, leading to confusion and frustration for the user. The Advocate aims to address this issue by providing a more balanced view of the news, incorporating multiple perspectives and sources. The name "Advocate" comes from the idea of "Advocating" for both sides of an issue instead of completely ignoring one. Currently, the project is not running due to a lack of qualified writers. It was built using Svelte, SvelteKit, Typescript, Google Cloud Platform for authentication, and Supabase BAAS (Backend as-a-service)',
      images: [
        ["/src/assets/the_advocate.png", "The Advocate, with an example article to show the interface"],
      ],
    },
    {
      title: "RoomMate",
      shortDescription: "RoomMate is a project designed to help people find roommate they match with more easily.",
      thumbnail: "/src/assets/roommate_home.png", // Example thumbnail
      fullDescription: "When I was applying for college, I found that a large number of students were struggling to find compatible roommates. RoomMate aims to solve this problem by using a matching algorithm that takes into account various factors such as lifestyle preferences, interests, and room type to find applicable roommates at the users school and chosen housing facility. The structure of the backend means that this project can easily scale past college-dorms and into the housing market to assist individuals in finding suitable living arrangements. Roommate was built using React, Vite, Typescript, and Appwrite's backend as-a-service",
      images: [
        ["/src/assets/roommate_advanced_search.png", "RoomMate allows you to effectively query all kinds of user attributes to find your match"],
        ["/src/assets/roommate_reachout.png", "Quickly manage reaching out and accepting roommate requests"],
        ["/src/assets/roommate_chat.png", "Easily chat with the people you match with"],
        ["/src/assets/roommate_login_options.png", "RoomMate offers various social login options to suit your needs"],
      ],
    },
    {
      title: "Mural",
      shortDescription: "Mural is a collaborative online art-drawing website",
      thumbnail: "/src/assets/navigation/fprojects.png", // Example thumbnail
      fullDescription:
        "Mural is a collaborative online art-drawing website that allows users to create artwork together in real-time. Each time a user enters, they are given a paint brush that can only draw one color. This forces everyone to work collaboratively through the voice chat to build something beautiful. It was built using HTML, CSS, JS, and a custom backend using WebSockets.",
      images: [
        ["/src/assets/mural1.png", "A tree"],
        ["/src/assets/mural2.png", "A car"],
        ["/src/assets/navigation/fprojects.png", "Another tree"],
      ],
    },
  ];
</script>

<section class="projects-container section">
  <h2>Projects</h2>
  <p>These are projects that are not currently in development, not actively maintained, or not published to the web</p>
  <div class="project-grid">
    {#each projects as project}
      <ProjectCard
        title={project.title}
        shortDescription={project.shortDescription}
        thumbnail={project.thumbnail}
        fullDescription={project.fullDescription}
        images={project.images as [string, string][]}
      />
    {/each}
  </div>
</section>

<style>
  .projects-container {
    padding: 20px;
    text-align: center;
    background-color: var(--section-background);
  }
  .projects-container h2 {
    margin-bottom: 30px;
    color: var(--text-white);
  }

  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    justify-content: center;
  }
</style>
