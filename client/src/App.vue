<template>
  <div id="app">
    <router-view />
    <ToastContainer />
  </div>
</template>

<script>
import ToastContainer from "@/components/common/ToastContainer.vue";

export default {
  name: "App",
  components: {
    ToastContainer,
  },
};
</script>

<style>
/* Global styles are imported in main.js */
</style>
