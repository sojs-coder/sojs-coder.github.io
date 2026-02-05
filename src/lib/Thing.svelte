<script lang="ts">
    interface Props {
      path: String;
      name: String;
      des: String;
    }
    
    const {
      path, name, des
    } = $props();
</script>


<li>
    <a href={path} target="_blank">{name}</a>: {des}
</li>


<style>
    a {
        font-style: italic;
        font-weight: 800;
        color: white;
        text-decoration: underline;
    }
</style>
