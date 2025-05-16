import { Application, Assets, Sprite } from 'pixi.js'
import { createButton } from './modules/createButton'

// Create and initialize the application
const app = new Application()

await app.init({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x1e1e1e, // dark gray
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  resizeTo: window, // auto resize with window
})

//example texture
await Assets.load('/assets/Spin.png')
const buttonBgTexture = Sprite.from('/assets/Spin.png')

// Add the canvas to the document
document.body.appendChild(app.canvas)

// Create and add the button
const myButton = createButton({
  // label: 'Click Me',
  width: 150,
  height: 80,
  x: '50%',
  y: '75%',
  labelStyle: {
    fontSize: 24,
    fill: '#0000ff', // white text
    align: 'center',
  },
  texture: buttonBgTexture,
  onClick: () => console.log('Button clicked'),
})


app.stage.addChild(myButton)
