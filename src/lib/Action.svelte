<script lang="ts">
    export let type: "primary" | "secondary" = "primary";
    export let href: string = "#";
    export let target: string = "_self";
</script>


<a
  class="action-button {type}"
  href={href}
  target={target}
>
  <slot></slot>
</a>

<style>
    .action-button {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: var(--secondary-radius);;
        text-decoration: none;
        color: var(--text-white);
        font-weight: bold;
        transition: var(--primary-transition);
    }
    
    .primary {
        background-color: var(--rose-gold);
    }
    
    .secondary {
        background-color: var(--text-primary);
    }
    
    .action-button:hover {
        opacity: 0.8;
        transition: var(--primary-transition)
    }
</style>