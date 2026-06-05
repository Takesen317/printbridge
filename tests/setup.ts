// Vitest global setup for jsdom environment
// Provides ImageData constructor since jsdom doesn't have it

class ImageDataMock {
  width: number
  height: number
  data: Uint8ClampedArray

  constructor(data: Uint8ClampedArray | number[], width: number, height?: number) {
    if (typeof width !== 'number') {
      throw new TypeError('Failed to construct ImageData: width is not a number')
    }

    if (Array.isArray(data)) {
      this.data = new Uint8ClampedArray(data)
    } else {
      this.data = data
    }

    this.width = width
    this.height = height ?? (this.data.length / (width * 4))
  }
}

// @ts-ignore
globalThis.ImageData = ImageDataMock