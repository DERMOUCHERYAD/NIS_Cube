<template>
  <div class="app">
    <Navigation v-if="!isLandingPage" />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import { computed } from 'vue';
import Navigation from './components/Navigation.vue';

const route = useRoute();
const isLandingPage = computed(() => route.path === '/');
</script>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>