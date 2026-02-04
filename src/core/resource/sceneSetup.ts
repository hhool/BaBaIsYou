import axios from 'axios'
import type { SceneSetup } from '@/core/types'
import type { Species } from '@/core/resource/index'
import type { ThingSetup } from '@/core/types/things'

export interface ThingsMapJson {
  readonly species: Species
  readonly name: string
  readonly thingSetup: Array<ThingSetup>
}

export interface SceneSetupJson {
  readonly id: string
  readonly name: string
  readonly sceneWidth: number
  readonly sceneHeight: number
  readonly thingsMap: Array<ThingsMapJson>
}

const baseUrl = (import.meta.env.BASE_URL || './').replace(/\/?$/, '/')
const normalizePath = (p: string) => p.replace(/^\/+/, '')
const buildSceneSetupUrl = (base: string, filePath: string) => {
  const cleanBase = base.replace(/\/?$/, '/')
  return cleanBase + 'sceneSetups/' + normalizePath(filePath)
}

const convertToSceneSetup = (sceneSetupJson: SceneSetupJson): SceneSetup => {
  const sceneWidth = sceneSetupJson.sceneWidth
  const sceneHeight = sceneSetupJson.sceneHeight
  const thingsMap = new Map<{ species: Species, name: string }, Array<ThingSetup>>()

  for (const thing of sceneSetupJson.thingsMap) {
    const key = { species: thing.species, name: thing.name }
    const thingSetup = new Array<ThingSetup>()

    for (const it of thing.thingSetup) {
      const setup: ThingSetup = {
        defaultBlockX: it.defaultBlockX,
        defaultBlockY: it.defaultBlockY,
        textureName: it.textureName,
        defaultTowards: it.defaultTowards
      }
      thingSetup.push(setup)
    }

    thingsMap.set(key, thingSetup)
  }

  return {
    id: sceneSetupJson.id,
    name: sceneSetupJson.name,
    sceneWidth,
    sceneHeight,
    thingsMap
  }
}

const loadSceneSetupJson = async (filePath: string): Promise<SceneSetupJson> => {
  const candidates = [
    buildSceneSetupUrl(baseUrl, filePath),
    buildSceneSetupUrl('/', filePath),
    buildSceneSetupUrl('../', filePath)
  ]

  let lastError: unknown
  for (const url of candidates) {
    try {
      const { data } = await axios.get(url)
      return data
    } catch (e) {
      lastError = e
    }
  }

  throw new Error(`Error occurred while loading SceneSetup JSON. Tried: ${candidates.join(', ')}. Error: ${String(lastError)}`)
}

export const getSceneSetup = async (filePath: string): Promise<SceneSetup> => {
  return convertToSceneSetup(await loadSceneSetupJson(filePath))
}