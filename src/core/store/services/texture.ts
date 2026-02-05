import { Assets } from 'pixi.js'
import type { Texture, Spritesheet } from 'pixi.js'
import type { Species } from '@/core/resource'

export interface TextureService {
  loadResources: (resourcesLocation: string) => Promise<void>
  getLoadingProgress: () => number
  getAnimationTextures: (species: Species, name: string) => Array<Texture>
}

class TextureServiceConcrete implements TextureService {
  private _resourcesSheet!: Spritesheet
  private _loadingProgress = 0

  private _buildFallbackLocations(resourcesLocation: string): string[] {
    const trimmed = resourcesLocation.trim()
    const seen = new Set<string>()
    const add = (value: string) => {
      if (!value) return
      if (seen.has(value)) return
      seen.add(value)
    }

    add(trimmed)

    const stripLeadingDotSlash = (value: string) => value.replace(/^\.\//, '')
    const stripLeadingSlashes = (value: string) => value.replace(/^\/+/, '')

    if (trimmed.startsWith('./')) {
      const path = stripLeadingDotSlash(trimmed)
      add('/' + stripLeadingSlashes(path))
      add('../' + stripLeadingSlashes(path))
    }

    // If the base was built as /game/, also try the site root.
    if (trimmed.startsWith('/game/')) {
      const path = trimmed.replace(/^\/game\//, '')
      add('/' + stripLeadingSlashes(path))
      add('./' + stripLeadingSlashes(path))
      add('../' + stripLeadingSlashes(path))
    }

    return Array.from(seen)
  }

  private async _prepareLoadedResources(resourcesLocation: string): Promise<void> {
    const candidates = this._buildFallbackLocations(resourcesLocation)
    let lastError: unknown

    for (const candidate of candidates) {
      try {
        const sheet = await Assets.load(candidate)
        if (!sheet) continue
        this._resourcesSheet = sheet
        return
      } catch (e) {
        lastError = e
      }
    }

    const tried = candidates.join(', ')
    throw new Error(`Could not get game resources! Tried: ${tried}. Error: ${String(lastError)}`)
  }

  public async loadResources(resourcesLocation: string): Promise<void> {
    if (this._resourcesSheet) return
    await this._prepareLoadedResources(resourcesLocation)
  }

  public getLoadingProgress(): number {
    return this._loadingProgress
  }

  public getAnimationTextures(species: Species, name: string): Array<Texture> {
    const textures = this._resourcesSheet.animations[`${species}/${name}`]
    if (!textures) throw new Error(`Could not found the resource of ${species}/${name} !`)
    return textures
  }
}

export const createTextureService = (): TextureService => {
  return new TextureServiceConcrete()
}
