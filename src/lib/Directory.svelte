<script>
    import Thing from "./Thing.svelte";

</script>
<section class="section black">
    <h1>Directory</h1>
    <p>Interesting things I've made</p>
    <ul>
        <Thing name="CCPorted" path="https://ccported.github.io" des="Play video games" />
        <Thing name="Aidebase" path="#" des="(Closed source) CRM for non-profits." />
        <Thing name="/forge" path="https://sojs.dev/forge" des="Game Engine I built for CCPorted" />
        <Thing name="/m20c" path="https://sojs.dev/m20c" des="Multivariable calculus study guide" />
        <Thing name="/quizzes" path="https://sojs.dev/quizzes" des="Assorted study guides for assorted topics" />
        <Thing name="Interceptor" path="https://github.com/sojs-coder/Interceptor" des="Clone any webpage" />
        <Thing name="Reaction Rush" path="https://ccported.github.io/play?gameID=game_8150_e650ab51a37ae8" des="Test your reaction speed!" />
        <Thing name="BallZ" path="https://ccported.github.io/play?gameID=game_a1a3_7ed8bf533bbdd" des="Don't let the bricks touch the ground!" />
        <Thing name="TSFGOKT" path="https://ccported.github.io/play?gameID=game_15f9_3ab4c653b68958" des="Don't let the monsters catch you!" />
        <Thing name="Mural" path="https://github.com/sojs-coder/Cursors" des="Every player gets one color, work together to draw something cool" />
        <Thing name="Journal" path="https://github.com/sojs-coder/Journal" des="Keep a journal" />
        <Thing name="AdHoc" path="https://github.com/sojs-coder/adhoc" des="Ad network, complete with payment processing and AI ad placement" />
        <Thing name="Advocate" path="https://github.com/sojs-coder/Advocate" des="News site project" />
        <Thing name="Thread Mover Bot" path="https://github.com/sojs-coder/Thread_Mover_Bot" des="Move messages in a discord conversation to a thread" />
        <Thing name="Roommate App" path="https://github.com/sojs-coder/roommate-app" des="App designed to help you find your roommates based on common interest/lifestyle" />
        <Thing name="Not Tensorflow" path="https://github.com/sojs-coder/Not_Tensorflow" des="Neural network, built from scratch in JS" />
        <Thing name="Sisyphian Game" path="https://sojs.dev/Sisyphian_Game/" des="You are Sisyphus, hunting for berries." />
        <Thing name="Terminal Canvas" path="https://github.com/sojs-coder/Terminal-Canvas" des="Draw shapes in the terminal" />
    </ul>
</section>

<style>
    section {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        padding: 50px;
        z-index: 1;
    }
    section.section.black {
         background-color: rgba(99, 53, 64, 0.85); 

    }

</style>
