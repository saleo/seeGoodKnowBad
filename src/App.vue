<template>
  <view class="app-container">
    <slot />
  </view>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.app-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>