<template>
  <div
    class='bg-grey-900 opacity-65 w-full h-full fixed z-20'
    @click.stop.prevent="emit('restart')"
    @pointerdown.stop.prevent="emit('restart')"
    @touchstart.stop.prevent="emit('restart')">
    <div class='bg-white rounded-lg w-10/12 h-50 fixed abs-center fixed animate-pulse'>
      <img :src='restartImgUrl' alt='' class='mx-auto top-[30%] relative invert animate-bounce max-w-full'>
    </div>
  </div>
</template>

<script lang='ts' setup>
  import '@/assets/scss/shared/abscenter.scss'
  import restartImgUrl from '@/assets/images/restart.webp'

  const emit = defineEmits<{
    (e: 'restart'): void
  }>()
</script>

<style lang='scss' scoped>
  .invert {
    filter: invert(100%);
  }
</style>
