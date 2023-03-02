export default class Controller {
  #view
  #worker
  #blinkCounter = 0
  #leftEyeBlinkCounter = 0
  #rightEyeBlinkCounter = 0
  #camera

  constructor({ view, worker, camera, videoUrl }) {
    this.#view = view
    this.#worker = this.#configureWorker(worker)
    this.#camera = camera

    this.#view.configureOnBtnClick(this.onBtnStart.bind(this))
    this.#view.setVideoSrc(videoUrl)
  }

  static async initialize(deps) {
    const controller = new Controller(deps)
    controller.log('Not yet detecting eye blink! Click in the button to start')
    return controller.init()
  }

  #configureWorker(worker) {
    let ready = false

    worker.onmessage = ({ data }) => {
      if ('READY' === data) {
        console.log("Worker is ready!")
        this.#view.enableButton()
        ready = true
        return
      }

      const {
        hasBlinked,
        hasRightEyeBlinked,
        hasLeftEyeBlinked
      } = data

      if (hasBlinked) {
        this.#blinkCounter += hasBlinked
        this.#view.togglePlayVideo()
      }

      if (hasRightEyeBlinked) {
        this.#rightEyeBlinkCounter += hasRightEyeBlinked
      }

      if (hasLeftEyeBlinked) {
        this.#leftEyeBlinkCounter += hasLeftEyeBlinked
      }
    }

    return {
      send(msg) {
        if (!ready) return

        worker.postMessage(msg)
      }
    }
  }

  async init() {
    console.log('init!')
  }

  loop() {
    const video = this.#camera.video
    const img = this.#view.getVideoFrame(video)

    this.#worker.send(img)
    this.log(`Detecting eye blink...`)

    setTimeout(() => this.loop(), 100)
  }

  log(text) {
    const times = `         - blinked times: ${this.#blinkCounter} | left eye blinked times: ${this.#leftEyeBlinkCounter} | right eye blinked times: ${this.#rightEyeBlinkCounter}`
    this.#view.log(`status: ${text}`.concat(this.#blinkCounter ? times : ""))
  }

  onBtnStart() {
    this.log('Initalizing detection...')
    this.#blinkCounter = 0

    this.loop()
  }
}