<script lang="ts">
  import Router from "svelte-spa-router";

  import Intro from "./pages/Intro.svelte";
  import CreateSpace from "./pages/CreateSpace.svelte";
  import MySpaces from "./pages/MySpaces.svelte";
  import Space from "./pages/Space.svelte";
  import ExploreSpaces from "./pages/ExploreSpaces.svelte";
  import About from "./pages/About.svelte";
  import DefaultRoom0 from "./pages/DefaultRoom0.svelte";
  import DefaultRoom1 from "./pages/DefaultRoom1.svelte";
  import DefaultRoom2 from "./pages/DefaultRoom2.svelte";
  import Spaces from "./pages/Spaces.svelte";
  import NotFound from "./pages/NotFound.svelte";
  import ObjTest from "./pages/ObjTest.svelte";
  import ObjAframe from "./pages/ObjAframe.svelte";
  import Testroom from "./pages/Testroom.svelte";
  import UploadExample from "./pages/UploadExample.svelte";
  import DownloadFileExample from "./pages/DownloadFileExample.svelte";

  const routes = {
    // Exact path (with /# in front of route)
    "/": Intro,
    "/myspaces": MySpaces,
    "/create": CreateSpace,
    "/space/:spaceId": Space,
    "/explore": ExploreSpaces,
    "/about": About,
    "/defaultspace/0": DefaultRoom0,
    "/defaultspace/1": DefaultRoom1,
    "/defaultspace/2": DefaultRoom2,
    "/spaces": Spaces, //e.g. URL: https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/#/spaces
    "/objtest": ObjTest,
    "/objaframe": ObjAframe,
    "/testroom": Testroom,
    "/uploadExample": UploadExample,
    "/downloadFileExample" : DownloadFileExample,
    // Catch-all (this is optional, but if present it must be the last)
    "*": NotFound,
  };
</script>

<div class="App">
  <Router {routes} />
</div>
