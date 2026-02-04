<template>
  <Menu
    v-if='showMenu' :key='"menu"+menuKey' :mode='menuType'
    @restart='restartGame'
    @resume='handleEsc'
    @to-menu='toMenu'
    @to-home='toHome'
  />
  <NoYouAlertBar v-if='showNoYouAlertBar' :key='"alertBar"+alertBarKey' />
  <div
    id='game-layer'
    ref='gestureLayer'
    class='
       transform-gpu
        flex
        h-screen
        justify-center
        relative
        bg-gray-900'>
    <div
      ref='gameLayer'
      class='
         game-layer
         self-center'
    />
  </div>
</template>

<script lang='ts' setup>
  import { defineAsyncComponent, onBeforeUnmount, ref } from 'vue'
  import { tryOnMounted } from '@vueuse/core'
  import type { GameCore } from '@/core/types'
  import { GameResult } from '@/core/types'
  import type { ExtendedKeyboardEvent } from 'mousetrap'
  import mousetrap from 'mousetrap'
  import { useGlobalState } from '@/store'
  import { useRouter } from 'vue-router'
  import { MenuType } from '@/types'
  import '@/assets/scss/shared/abscenter.scss'

  const globalState = useGlobalState()
  const router = useRouter()

  const gestureLayer = ref<HTMLElement>({} as HTMLElement)
  const gameLayer = ref<HTMLElement>({} as HTMLElement)

  const showMenu = ref(false)
  const showNoYouAlertBar = ref(false)

  const menuKey = ref(0)
  const alertBarKey = ref(0)

  const menuType = ref(MenuType.GENERAL)

  const Menu = defineAsyncComponent(() => import('@/components/MainMenu.vue'))
  const NoYouAlertBar = defineAsyncComponent(() => import('@/components/NoYouAlertBar.vue'))

  let game: GameCore
  const audio = document.createElement('audio')

  let uninstallSwipeControls: null | (() => void) = null
  onBeforeUnmount(() => {
    uninstallSwipeControls?.()
    uninstallSwipeControls = null
  })

  const gamePause = () => {
    game.pause()
  }

  const gameResume = () => {
    game.resume()
  }

  const handleEsc = (event?: ExtendedKeyboardEvent) => {
    event?.preventDefault()
    event?.stopImmediatePropagation()
    event?.stopPropagation()
    menuKey.value++
    showMenu.value = !showMenu.value
    if (showMenu.value) {
      gamePause()
    } else {
      gameResume()
      menuType.value = MenuType.GENERAL
    }
  }

  const handleR = (event: ExtendedKeyboardEvent) => {
    event.preventDefault()
    event.stopImmediatePropagation()
    event.stopPropagation()
    menuType.value = MenuType.RESTART
    menuKey.value++
    gamePause()
    showMenu.value = true
  }

  const setAudioSrc = (filename?: string) => {
    const baseUrl = (import.meta.env.BASE_URL || './').replace(/\/?$/, '/')
    audio.src = baseUrl + 'music/' + (filename ?? '')
    audio.loop = true
  }

  type MoveCommand = 'up' | 'down' | 'left' | 'right'
  const triggerMove = (command: MoveCommand) => {
    if (showMenu.value) return
    mousetrap.trigger(command)
  }

  const installSwipeControls = () => {
    const el = gestureLayer.value
    if (!el) return () => {}

    let activePointerId: number | null = null
    let activeTouchId: number | null = null
    let startX = 0
    let startY = 0
    let startTime = 0

    const computeAndTrigger = (endX: number, endY: number) => {
      const dx = endX - startX
      const dy = endY - startY
      const dt = Date.now() - startTime

      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      const minDistance = Math.max(24, Math.min(window.innerWidth, window.innerHeight) * 0.06)
      const maxDuration = 700

      if (dt > maxDuration) return
      if (Math.max(absDx, absDy) < minDistance) return

      if (absDx > absDy) {
        triggerMove(dx > 0 ? 'right' : 'left')
      } else {
        triggerMove(dy > 0 ? 'down' : 'up')
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      if (showMenu.value) return
      activePointerId = event.pointerId
      startX = event.clientX
      startY = event.clientY
      startTime = Date.now()
      try {
        el.setPointerCapture(event.pointerId)
      } catch {
        // ignore
      }
    }

    const onPointerUp = (event: PointerEvent) => {
      if (activePointerId === null || event.pointerId !== activePointerId) return
      activePointerId = null
      computeAndTrigger(event.clientX, event.clientY)
    }

    const onPointerCancel = (event: PointerEvent) => {
      if (activePointerId === null || event.pointerId !== activePointerId) return
      activePointerId = null
    }

    const onTouchStart = (event: TouchEvent) => {
      if (showMenu.value) return
      if (event.changedTouches.length <= 0) return
      const t = event.changedTouches[0]
      activeTouchId = t.identifier
      startX = t.clientX
      startY = t.clientY
      startTime = Date.now()
      event.preventDefault()
    }

    const onTouchEnd = (event: TouchEvent) => {
      if (activeTouchId === null) return
      for (const t of Array.from(event.changedTouches)) {
        if (t.identifier !== activeTouchId) continue
        activeTouchId = null
        computeAndTrigger(t.clientX, t.clientY)
        event.preventDefault()
        return
      }
    }

    const onTouchCancel = (event: TouchEvent) => {
      if (activeTouchId === null) return
      for (const t of Array.from(event.changedTouches)) {
        if (t.identifier !== activeTouchId) continue
        activeTouchId = null
        event.preventDefault()
        return
      }
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerCancel)
    el.addEventListener('pointerleave', onPointerCancel)

    // Android WebView compatibility: some builds still deliver TouchEvent but not PointerEvent reliably.
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: false })
    el.addEventListener('touchcancel', onTouchCancel, { passive: false })

    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerCancel)
      el.removeEventListener('pointerleave', onPointerCancel)

      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchCancel)
    }
  }

  const startNewGame = async () => {
    const setupFileName = globalState.value.currentLevel.setupFileName
    if (!setupFileName) return
    await game.startLevel(setupFileName.trim())
    showNoYouAlertBar.value = false
    mousetrap.bind('esc', handleEsc)
    mousetrap.bind('r', handleR)
    setAudioSrc(globalState.value.currentLevel.backgroundMusic)
    await audio.play()
  }

  const gameOver = async (result: GameResult) => {
    switch (result) {
      case GameResult.WIN:
        menuType.value = MenuType.WIN
        menuKey.value++
        mousetrap.unbind(['esc', 'r'])
        showMenu.value = true
        audio.pause()
        break
      case GameResult.RESTART:
        await startNewGame()
        break
    }
  }

  const handleYouGone = async (existYou: boolean) => {
    audio.pause()
    if (!existYou) {
      alertBarKey.value++
    }
    showNoYouAlertBar.value = !existYou
  }

  const prepareGame = () => {
    game.setGameOverOutsideHandler(gameOver)
    game.setYouGoneOutsideHandler(handleYouGone)

    gameLayer.value.appendChild(
      game.gameView
    )
  }

  const restartGame = () => {
    handleEsc()
    startNewGame()
  }

  const toMenu = async () => {
    audio.pause()
    await router.replace({ name: 'Level' })
  }

  const toHome = async () => {
    audio.pause()
    await router.replace({ name: 'Home' })
  }

  tryOnMounted(async () => {
    game = await (async () => (await import('@/core')).default)()
    prepareGame()
    uninstallSwipeControls = installSwipeControls()
    await startNewGame()
  })
</script>

<style lang='scss' scoped>
  .game-layer {
    max-height: min-content;
    min-height: max-content;
    height: min-content;
  }

  #game-layer {
    touch-action: none;
  }
</style>
