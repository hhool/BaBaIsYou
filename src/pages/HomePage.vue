<template>
  <div class='bg-[#080808] h-full'>
    <div
      :style="{backgroundImage: animationBgStyleUrlValue}"
      class='absolute bg-white h-full w-full opacity-70'
    />
    <header class='w-10/12 sm:w-9/12 lg:w-8/12 xl:w-7/12 2xl:w-6/12 h-auto relative header-img mx-auto'>
      <img :src='babaBackgroundUrl' alt='' class='w-full' loading='lazy'>
    </header>
    <div class='w-30 sm:w-40 relative top-15/200 mx-auto'>
      <router-link :to='{name: "Level"}'>
        <button
          class='my-10 py-1 px-2 sm:(py-2 px-4) flex justify-center items-center bg-red-600 hover:bg-red-700 focus:ring-red-500 focus:ring-offset-red-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg '
          type='button'>
          Start
        </button>
      </router-link>
      <a class='hidden' href='https://babaiswiki.fandom.com/wiki/Baba_Is_You_Wiki' rel='noreferrer noopener' target='_blank'>
        <button
          class='my-10 py-1 px-2 sm:(py-2 px-4) flex justify-center items-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg '
          type='button'>
          Wiki
        </button>
      </a>
      <a class='hidden' href='https://github.com/Xanonymous-GitHub/BaBaIsYou' rel='noreferrer noopener' target='_blank'>
        <button
          class='my-10 py-1 px-2 sm:(py-2 px-4) flex justify-center items-center bg-gray-900 hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-gray-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg '
          type='button'>
          GitHub
        </button>
      </a>
    </div>

    <div class='fixed bottom-4 right-4 z-50'>
      <div
        v-show='showFooter'
        class='absolute bottom-14 right-0 w-[min(85vw,360px)] rounded-xl bg-black/80 text-white shadow-xl ring-1 ring-white/15 backdrop-blur px-4 py-3'
      >
        <p class='text-center font-extrabold'>
          Please play in desktop mode.
        </p>
        <p class='mt-1 text-center font-extrabold'>
          Origin game created by ARVI TEIKARI
        </p>
        <p class='mt-1 text-center font-extrabold'>
          Re-implemented by
          <a href='https://xcc.tw' rel='noreferrer noopener' target='_blank' text-blue hover:text-lime>TU Xanonymous</a> &
          <a href='https://ricky-hu.com' rel='noreferrer noopener' target='_blank' text-blue hover:text-lime>RickyHu</a>.
        </p>
      </div>

      <button
        class='w-12 h-12 rounded-full bg-black/70 text-white font-extrabold text-xl flex items-center justify-center shadow-lg ring-1 ring-white/20 active:(scale-95)'
        type='button'
        aria-label='Info'
        @click.stop.prevent='toggleFooter'
      >
        I
      </button>
    </div>
  </div>
</template>

<script lang='ts' setup>
  import { ref } from 'vue'
  import babaBackgroundUrl from '@/assets/images/BaBaIsYou.webp'
  import animationBg from '../assets/images/animation-bg.webp'

  const animationBgStyleUrlValue = `url('${animationBg}')`

  const showFooter = ref(false)

  const toggleFooter = () => {
    showFooter.value = !showFooter.value
  }
</script>

<style lang='scss' scoped>
  .header-img {
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    top: 5%;
  }
</style>
