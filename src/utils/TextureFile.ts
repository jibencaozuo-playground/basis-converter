import { loadImage } from 'utils/loadImage';
import { encodePng, renderBasisTexture } from 'utils/basisEncoder';
import type { LoadFileParams } from 'utils/basisEncoder';
import { Renderer } from 'utils/Renderer';

const canvas = document.createElement('CANVAS') as HTMLCanvasElement;
const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })!;

gl.getExtension('WEBGL_compressed_texture_astc');
gl.getExtension('WEBGL_compressed_texture_etc1');
gl.getExtension('WEBGL_compressed_texture_s3tc');
gl.getExtension('WEBGL_compressed_texture_pvrtc');
gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');
gl.getExtension('EXT_texture_compression_bptc');

const renderer = new Renderer(gl);

class NotConvertedError extends Error {
    name = 'NotConvertedError';
    constructor() {
        super('Unable to preview texture, convert it to basis first.');
    }
}

export class TextureFile {
    file: File;
    width: number | null = null;
    height: number | null = null;
    compressedTexturePreviewUrl: string | null = null;
    previewFileBlob: Blob | null = null;
    uncompressedTexturePreviewUrl: string | null = null;
    textureFileBlob: Uint8Array | null = null;
    
    onConverted: (() => void) | null = null;

    constructor(file: File) {
        this.file = file;
    }

    async toBasis(params: Omit<LoadFileParams, 'sliceSourceImage'>, withObjectUrl: boolean = true) {
        if (this.compressedTexturePreviewUrl) {
            URL.revokeObjectURL(this.compressedTexturePreviewUrl);
        }
        this.previewFileBlob = null;

        const fileUrl = URL.createObjectURL(this.file);
        const {imageBlob, width, height} = await loadImage(fileUrl);
        
        URL.revokeObjectURL(fileUrl);

        const sliceArrayBuffer = new Uint8Array(await imageBlob.arrayBuffer());
        const basisTexture = await encodePng({
            ...params,
            sliceSourceImage: sliceArrayBuffer,
        });
        
        const url = withObjectUrl ? URL.createObjectURL(imageBlob) : null;

        if (url) {
            this.uncompressedTexturePreviewUrl = url;
        }

        this.textureFileBlob = basisTexture;
        this.width = width;
        this.height = height;

        this.onConverted?.();

        return { basisTexture, uncompressedTexturePreviewUrl: url, width, height }
    }

    async generatePreview(
        withObjectUrl: boolean = true
    ) {
        let blob: Blob
        let url: string | null = null

        if (this.previewFileBlob) {
            blob = this.previewFileBlob;
        } else {
            if (this.width === null || this.height === null) {
                throw new NotConvertedError();
            }
    
            canvas.width = this.width;
            canvas.height = this.height;
    
            if (!this.textureFileBlob) {
                throw new NotConvertedError();
            }
    
            await renderBasisTexture(this.textureFileBlob, canvas, renderer);
    
            blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => resolve(blob!), 'image/png');
            });
    
            this.previewFileBlob = blob;
        }

        if (withObjectUrl) {
            if (this.compressedTexturePreviewUrl) {
                url = this.compressedTexturePreviewUrl;
            } else {
                url = URL.createObjectURL(blob);
                this.compressedTexturePreviewUrl = url;
            }
        }

        return { blob, compressedTexturePreviewUrl: url }
    }
}