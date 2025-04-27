<script lang="ts" setup>
// prettier-ignoreç

const props = withDefaults(
  defineProps<{
    data: any;
  }>(),
  {}
);
</script>

<style scoped lang="scss"></style>

<template>
  <div class="mb-4">
    <pre>{{ props.data }}</pre>
    <!-- <p>Compania : </p> -->
  </div>
</template>
