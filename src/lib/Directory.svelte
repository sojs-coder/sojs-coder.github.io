<script>
    import Thing from "./Thing.svelte";

    import ccported from "../assets/things/ccported.png";
    import forge from "../assets/things/forge.png";
    import m20c from "../assets/things/m20c.png";
    import quizzes from "../assets/things/quizzes.png";
    import interceptor from "../assets/things/interceptor.png";
    import reactionrush from "../assets/things/reactionrush.png";
    import ballz from "../assets/things/ballz.png";
    import tsfgokt from "../assets/things/tsfgokt.png";
    import mural from "../assets/things/mural.png";
    import journal from "../assets/things/journal.png";
    import adhoc from "../assets/things/adhoc.png";
    import advocate from "../assets/things/advocate.png";
    import threadmoverbot from "../assets/things/threadmoverbot.png";
    import roommateapp from "../assets/things/roommateapp.png";
    import not_tensorflow from "../assets/things/not_tensorflow.png";
    import sisyphian from "../assets/things/sisyphian.png";
    
</script>
<section class="section black">
    <h1>Directory</h1>
    <p>Interesting things I've made</p>
    <ul>
        <Thing name="CCPorted" path="https://ccported.github.io" des="Play video games" image={ccported} />
        <Thing name="Aidebase" path="#" des="(Closed source) CRM for non-profits." />
        <Thing name="/forge" path="https://sojs.dev/forge" des="Game Engine I built for CCPorted" image={forge} />
        <Thing name="/m20c" path="https://sojs.dev/m20c" des="Multivariable calculus study guide" image={m20c} />
        <Thing name="/quizzes" path="https://sojs.dev/quizzes" des="Assorted study guides for assorted topics" image={quizzes} />
        <Thing name="Interceptor" path="https://github.com/sojs-coder/Interceptor" des="Clone any webpage" image={interceptor} />
        <Thing name="Reaction Rush" path="https://ccported.github.io/play?gameID=game_8150_e650ab51a37ae8" des="Test your reaction speed!" />
        <Thing name="BallZ" path="https://ccported.github.io/play?gameID=game_a1a3_7ed8bf533bbdd" des="Don't let the bricks touch the ground!" image={ballz} />
        <Thing name="TSFGOKT" path="https://ccported.github.io/play?gameID=game_15f9_3ab4c653b68958" des="Don't let the monsters catch you!" image={tsfgokt} />
        <Thing name="Mural" path="https://github.com/sojs-coder/Cursors" des="Every player gets one color, work together to draw something cool" image={mural} />
        <Thing name="Journal" path="https://github.com/sojs-coder/Journal" des="Keep a journal" image={journal} />
        <Thing name="AdHoc" path="https://github.com/sojs-coder/adhoc" des="Ad network, complete with payment processing and AI ad placement" image={adhoc} />
        <Thing name="Advocate" path="https://github.com/sojs-coder/Advocate" des="News site project" image={advocate} />
        <Thing name="Thread Mover Bot" path="https://github.com/sojs-coder/Thread_Mover_Bot" des="Move messages in a discord conversation to a thread" image={threadmoverbot} />
        <Thing name="Roommate App" path="https://github.com/sojs-coder/roommate-app" des="App designed to help you find your roommates based on common interest/lifestyle" image={roommateapp} />
        <Thing name="Not Tensorflow" path="https://github.com/sojs-coder/Not_Tensorflow" des="Neural network, built from scratch in JS" image={not_tensorflow} />
        <Thing name="Sisyphian Game" path="https://sojs.dev/Sisyphian_Game/" des="You are Sisyphus, hunting for berries." image={sisyphian} />
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
