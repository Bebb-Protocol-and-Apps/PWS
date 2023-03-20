<script lang="ts">
  import Router from "svelte-spa-router";

  import Login from "./components/Login.svelte";
  import Intro from "./pages/Intro.svelte";
  import CreateSpace from "./pages/CreateSpace.svelte";
  import Space from "./pages/Space.svelte";
  import ExploreSpaces from "./pages/ExploreSpaces.svelte";
  import DefaultRoom1 from "./pages/DefaultRoom1.svelte";
  import Spaces from "./pages/Spaces.svelte";
  import NotFound from "./pages/NotFound.svelte";
  import ObjTest from "./pages/ObjTest.svelte";
  import ObjAframe from "./pages/ObjAframe.svelte";
  import Testroom from "./pages/Testroom.svelte";

  const routes = {
    // Exact path (with /# in front of route)
    "/": Intro,
    "/create": CreateSpace,
    "/space/:spaceId": Space,
    "/explore": ExploreSpaces,
    "/defaultspace/1": DefaultRoom1,
    "/spaces": Spaces, //e.g. URL: https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/#/spaces
    "/objtest": ObjTest,
    "/objaframe": ObjAframe,
    "/testroom": Testroom,
    // Catch-all (this is optional, but if present it must be the last)
    "*": NotFound,
  };
</script>

<div class="App">
  <Router {routes} />
</div>
