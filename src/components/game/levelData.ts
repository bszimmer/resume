import type { SectionId } from '@/stores/game'

export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 600

export const GRAVITY = 0.3
export const JUMP_FORCE = -6
export const MOVE_SPEED = 1.5
export const CLIMB_SPEED = 1.25

export interface Platform {
  x: number
  y: number
  width: number
  height: number
}

export interface Ladder {
  x: number
  topY: number
  bottomY: number
  width: number
}

export interface SectionZone {
  id: SectionId
  x: number
  y: number
  width: number
  height: number
  label: string
  color: string
}

export const platforms: readonly Platform[] = [
  // Ground floor (About)
  { x: 0, y: 510, width: 800, height: 12 },
  // Floor 2 (Experience)
  { x: 0, y: 370, width: 800, height: 12 },
  // Floor 3 (Education)
  { x: 0, y: 230, width: 800, height: 12 },
  // Floor 4 (Skills)
  { x: 0, y: 100, width: 800, height: 12 },
]

export const ladders: readonly Ladder[] = [
  // Ladder A: Floor 1 → Floor 2  (topY matches floor 2 platform surface)
  { x: 148, topY: 370, bottomY: 510, width: 24 },
  // Ladder B: Floor 2 → Floor 3  (topY matches floor 3 platform surface)
  { x: 388, topY: 230, bottomY: 370, width: 24 },
  // Ladder C: Floor 3 → Floor 4  (topY matches floor 4 platform surface)
  { x: 608, topY: 100, bottomY: 230, width: 24 },
]

export const zones: readonly SectionZone[] = [
  {
    id: 'about',
    x: 40,
    y: 474,
    width: 160,
    height: 36,
    label: 'ABOUT',
    color: '#44ff88',
  },
  {
    id: 'experience',
    x: 260,
    y: 334,
    width: 160,
    height: 36,
    label: 'EXPERIENCE',
    color: '#ff6b4a',
  },
  {
    id: 'education',
    x: 440,
    y: 194,
    width: 160,
    height: 36,
    label: 'EDUCATION',
    color: '#cc88ff',
  },
  {
    id: 'skills',
    x: 580,
    y: 64,
    width: 160,
    height: 36,
    label: 'SKILLS',
    color: '#ffdd44',
  },
]

export const PLAYER_START_X = 60
export const PLAYER_START_Y = 482
export const PLAYER_WIDTH = 20
export const PLAYER_HEIGHT = 28
