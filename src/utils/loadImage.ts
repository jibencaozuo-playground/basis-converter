export class ImageConvertFailed extends Error {
    name = 'ImageConvertFailed'
    constructor() {
        super('Unable to convert input image to PNG file')
    }
}

export const loadImage = async (url: string) => {
    const image = new Image();
    image.src = url;
    
    await new Promise<void>((resolve) => {
        image.onload = () => {
            resolve()
        }
    });

    const canvasWidth = Math.pow(2, Math.ceil(Math.log2(image.width)))
    const canvasHeight = Math.pow(2, Math.ceil(Math.log2(image.height)))

    const canvas = document.createElement('CANVAS') as HTMLCanvasElement
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    const context = canvas.getContext('2d')!
    context.drawImage(
        image, 
        (canvasWidth - image.width) / 2, 
        (canvasHeight - image.height) / 2
    )

    const imageBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) throw new ImageConvertFailed()

                resolve(blob)
            }, 
        'image/png'
        )
    })

    return { imageBlob, width: canvasWidth, height: canvasHeight }
}