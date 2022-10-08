<template>
  <div class="my">{{ message }}</div>
</template>

<script>
import { ref } from 'vue'
export default {
  name: 'App',
  setup() {
    const message = ref('hello')
    return {
      message
    }
  }
}
</script>

<style>
.my {
  color: red;
}
</style>
