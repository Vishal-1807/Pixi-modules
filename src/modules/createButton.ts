// createButton.ts
import { Graphics, Sprite, Container, Texture, Text, TextStyle } from 'pixi.js'

interface ButtonOptions {
  texture?: Texture | Sprite
  width?: number
  height?: number
  x?: number | string // supports % like "50%"
  y?: number | string
  anchorX?: number // 0 to 1, default 0.5 (center)
  anchorY?: number
  label?: string
  labelStyle?: Partial<TextStyle>
  onClick?: () => void
}

export function createButton(options: ButtonOptions = {}): Container {
  const {
    texture,
    width = 150,
    height = 80,
    x,
    y,
    anchorX = 0.5,
    anchorY = 0.5,
    label,
    labelStyle = {},
    onClick,
  } = options

  const button = new Container()

  let bg: Sprite | Graphics

  // If texture is provided, use it as the background
  if (texture) {
    bg = new Sprite(texture)
    bg.width = width
    bg.height = height
  } else { // Otherwise, create a default blue rounded rectangle
    const g = new Graphics()
    g.fill(0x007BFF) // Default blue
    g.roundRect(0, 0, width, height, 12)
    g.fill()
    // g.cacheAsTexture(true)
    bg = g
  }

  bg.eventMode = 'static'
  bg.cursor = 'pointer'
  button.addChild(bg)

  let text: Text | undefined
  const baseFontSize = 100 
  const minFontSize = 6

  if (label) {
    // Start with either user fontSize or baseFontSize
    const initialFontSize = labelStyle.fontSize ?? minFontSize
    const initialFontFamily = labelStyle.fontFamily ?? 'Arial'

    text = new Text({text: label, style:{
      fontSize: initialFontSize,
      fontFamily: initialFontFamily,
      fill: 0xffffff,
      align: 'center',
      ...labelStyle,
    }})
    text.anchor.set(0.5)
    button.addChild(text)
  }

  button.eventMode = 'static'
  button.cursor = 'pointer'

  if (onClick) {
    button.on('pointertap', onClick)
  }

  // Helper to resolve position based on number or percentage string
  function resolvePosition(
    coord: number | string | undefined,
    size: number,
    stageSize: number,
    anchor: number
  ): number {
    if (typeof coord === 'string' && coord.endsWith('%')) {
      const percent = parseFloat(coord) / 100
      return stageSize * percent - size * anchor
    } else if (typeof coord === 'number') {
      return coord
    }
    // Default to center
    return (stageSize - size) * anchor
  }

  // Resize handler: positions and scales the button and label
  const resize = () => {
    const stage = button.parent
    if (!stage) return

    const stageW = stage.width
    const stageH = stage.height

    button.x = resolvePosition(x, width, stageW, anchorX)
    button.y = resolvePosition(y, height, stageH, anchorY)

    // Resize background
    if (bg instanceof Sprite) {
      bg.width = width
      bg.height = height
    } else if (bg instanceof Graphics) {
      bg.clear()
      bg.fill(0x007BFF)
      bg.roundRect(0, 0, width, height, 12)
      bg.fill()
    }

    if (text) {
      // Position center
      text.x = width / 2
      text.y = height / 2

      // If user supplied fontSize, just scale accordingly
      if (labelStyle.fontSize) {
        text.scale.set(1)
      } else {
        // Auto fit logic: adjust font size to fit inside width (with padding)
        let fontSize = baseFontSize
        const padding = 10
        text.style.fontSize = fontSize
        text.text = text.text // force update

        // shrink font size until text width fits inside button width - padding*2, or minimum font size reached
        while (fontSize > minFontSize && text.width > width - padding * 2) {
          fontSize -= 1
          text.style.fontSize = fontSize
          text.text = text.text // re-render text 
        }

        // scale text so height fits about 40% of button height
        const scale = (height * 0.4) / fontSize
        text.scale.set(scale)
      }
    }
  }

  button.on('added', resize) // Call resize when added to stage
  window.addEventListener('resize', resize) // Call resize on window resize
  return button
}
