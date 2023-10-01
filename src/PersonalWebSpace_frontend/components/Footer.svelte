<script lang="ts">
  import { location } from 'svelte-spa-router';
  import { submitEmailSignUpForm } from "../helpers/utils.js";

  let message = "";
  const submitForm = async (event) => {
    event.preventDefault();
    const email = document.getElementById('hero-email').value;
    message = await submitEmailSignUpForm(email, $location);
  };
</script>

<footer class='py-12 items-center text-center bg-slate-100' style="background: #fff3e9;" id='about'>
  <div>
    <p class="text-gray-500 mb-2 mt-12"><sup>*</sup>part of <a href='https://u4375-ryaaa-aaaai-acqsq-cai.icp0.io/' target='_blank' rel="noreferrer" class='underline '>Future Web Initiative</a> and hosted on <a href='https://internetcomputer.org/' target='_blank' rel="noreferrer" class='underline'>Internet Computer</a></p>
    <p class="text-4xl text-gray-700  mt-0 mb-12">Want to be the first to hear about updates in the Open Internet Metaverse?</p>

    <form on:submit={submitForm} class="email-signup-form mb-12">
      <input type="email" id="hero-email" class="email-signup-form-input rounded-l-full" placeholder="&nbsp;&nbsp;&nbsp;Enter your email...">
      <button type="submit" class="w-48 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-r-full  text-sm px-5 py-3 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
    </form>
    {#if message}
      <h2>{message}</h2>
    {/if}
  </div>
</footer>

<footer class="bg-white rounded-lg shadow dark:bg-gray-900 m-4">
  <div class="w-full max-w-screen-xl mx-auto p-4 md:py-8">
    <div class="sm:flex sm:items-center sm:justify-between">
      <a href="#top" class="flex items-center mb-4 sm:mb-0">
        <img src="/images/open-internet-metaverse.svg" class="h-8 mr-3" alt="OIM logo" />
      </a>
      <ul class="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
        <li>
          <a href="#/create" class="mr-4 hover:underline md:mr-6 ">Create</a>
        </li>
        <li>
          <a href="#/myspaces" class="mr-4 hover:underline md:mr-6">My Spaces</a>
        </li>
        <li>
          <a href="#/explore" class="mr-4 hover:underline md:mr-6 ">Explore</a>
        </li>
        <li>
          <a href="#/about" class="mr-4 hover:underline md:mr-6 ">About</a>
        </li>
      </ul>
    </div>
    <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
    <span class="block text-sm text-gray-500 sm:text-center dark:text-gray-400"><p>Powered by <a href='https://vdfyi-uaaaa-aaaai-acptq-cai.ic0.app/' target='_blank' rel="noreferrer" class='underline'>Open Internet Metaverse</a></span>
  </div>
</footer>

<style>
  .email-signup-form {
      display: flex;
      justify-content: center;
      align-items: center;
  }

  .email-signup-form-input[type="email"] {
      padding: 10px;
      font-size: 1em;
      margin-right: 10px;
      color: #000000;
  }

  .email-signup-form-input {
    width: 50vw;
    background: #dddddd;
    color: #1d1d2f;
  }

  .email-signup-form-button {
      padding: 10px 20px;
      font-size: 1em;
      background-color: #4ebaa5;
      color: #ffffff;
      border: none;
      cursor: pointer;
  }
  </style>
