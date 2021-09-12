import debug from 'debug';

import { Module } from './Module';
import type { BasisFile, KTX2File } from './Module';
import { Renderer } from './Renderer';

const log = debug('basis-studio:encoder');

const BASIS_FORMAT = {
    cTFETC1: 0,
    cTFETC2: 1,
    cTFBC1: 2,
    cTFBC3: 3,
    cTFBC4: 4,
    cTFBC5: 5,
    cTFBC7: 6,
    cTFPVRTC1_4_RGB: 8,
    cTFPVRTC1_4_RGBA: 9,
    cTFASTC_4x4: 10,
    cTFATC_RGB: 11,
    cTFATC_RGBA_INTERPOLATED_ALPHA: 12,
    cTFRGBA32: 13,
    cTFRGB565: 14,
    cTFBGR565: 15,
    cTFRGBA4444: 16,
    cTFFXT1_RGB: 17,
    cTFPVRTC2_4_RGB: 18,
    cTFPVRTC2_4_RGBA: 19,
    cTFETC2_EAC_R11: 20,				
    cTFETC2_EAC_RG11: 21	
};

export interface LoadFileParams {
    container: 'BASIS' | 'KTX2';
    sliceSourceImage: Uint8Array;
    quality: number;
    uastc: boolean;
    debug: boolean;
    computeStats?: number;
    sRGB: boolean;
    mipmap: boolean;
}

class EncodeBasisTextureFailed extends Error {
    name = 'EncodeBasisTextureFailed';
    constructor() {
        super('encodeBasisTexture() failed!');
    }
}

const gl = (document.createElement('CANVAS') as HTMLCanvasElement).getContext('webgl')!;
const astcSupported = !!gl.getExtension('WEBGL_compressed_texture_astc');
const etcSupported = !!gl.getExtension('WEBGL_compressed_texture_etc1');
const dxtSupported = !!gl.getExtension('WEBGL_compressed_texture_s3tc');
const pvrtcSupported = !!(gl.getExtension('WEBGL_compressed_texture_pvrtc')) 
        || !!(gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc'));
const bc7Supported = !!gl.getExtension('EXT_texture_compression_bptc');

export const encodePngToTexture = async (params: LoadFileParams) => {
    const { BasisEncoder, initializeBasis } = await Module;
        
    initializeBasis();
    
	// Create a destination buffer to hold the compressed .basis file data. 
    // If this buffer isn't large enough compression will fail.
	const basisFileData = new Uint8Array(1024*1024*10);
            
    let num_output_bytes;
    
    // Compress using the BasisEncoder class.
    log('BasisEncoder::encode() started:');

    const basisEncoder = new BasisEncoder();

    const qualityLevel = params.quality;
    const uastcFlag = params.uastc;

    if (params.container === 'KTX2') {
        basisEncoder.setCreateKTX2File(true);
        basisEncoder.setKTX2UASTCSupercompression(true);
        basisEncoder.setKTX2SRGBTransferFunc(true);
    }
    
    basisEncoder.setSliceSourceImage(0, params.sliceSourceImage, 0, 0, true);
    basisEncoder.setDebug(params.debug);
    basisEncoder.setComputeStats(params.computeStats || 0);
    basisEncoder.setPerceptual(params.sRGB);
    basisEncoder.setMipSRGB(params.sRGB);
    basisEncoder.setQualityLevel(qualityLevel);
    basisEncoder.setUASTC(uastcFlag);
    basisEncoder.setMipGen(params.mipmap);
    
    if (!uastcFlag) {
        log('Encoding at ETC1S quality level ' + qualityLevel);
    }
        
    const startTime = performance.now();
    
    num_output_bytes = basisEncoder.encode(basisFileData);
    
    const elapsed = performance.now() - startTime;
    
    log('encoding time', elapsed.toFixed(2));
    
    const encodedTextureFile = new Uint8Array(basisFileData.buffer, 0, num_output_bytes);

    basisEncoder.delete();
       
    if (num_output_bytes === 0) {
        throw new EncodeBasisTextureFailed();
    } else {
        log('encodeBasisTexture() succeeded, output size ' + num_output_bytes);
        
        return encodedTextureFile
    }
}

class InvalidKtx2FileError extends Error {
    name = 'InvalidKtx2FileError';
    constructor() {
        super('Invalid or unsupported .ktx2 file');
    }
}

class InvalidBasisFileError extends Error {
    name = 'InvalidBasisFileError';
    constructor() {
        super('Invalid or unsupported .basis file');
    }
}

class PVRTC1SizeError extends Error {
    name = 'PVRTC1SizeError';
    constructor() {
        super('PVRTC1 requires square power of 2 textures');
    }
}

class StartTranscodingFailed extends Error {
    name = 'StartTranscodingFailed';
    constructor() {
        super('Start transcoding failed');
    }
}

class BasisFiletranscodeError extends Error {
    name = 'BasisFiletranscodeError';
    constructor() {
        super('binaryFile.transcodeImage');
    }
}

class Ktx2FiletranscodeError extends Error {
    name = 'Ktx2FiletranscodeError';
    constructor() {
        super('ktx2File.transcodeImage failed');
    }
}

// ASTC format, from:
// https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_astc/
export const COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93B0;

// DXT formats, from:
// http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
export const COMPRESSED_RGB_S3TC_DXT1_EXT  = 0x83F0;
export const COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
export const COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
export const COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;

// BC7 format, from:
// https://www.khronos.org/registry/webgl/extensions/EXT_texture_compression_bptc/
export const COMPRESSED_RGBA_BPTC_UNORM = 0x8E8C;

// ETC format, from:
// https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_etc1/
export const COMPRESSED_RGB_ETC1_WEBGL = 0x8D64;

// PVRTC format, from:
// https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_pvrtc/
export const COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8C00;
export const COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8C02;

export const DXT_FORMAT_MAP = {
    [BASIS_FORMAT.cTFBC1]: COMPRESSED_RGB_S3TC_DXT1_EXT,
    [BASIS_FORMAT.cTFBC3]: COMPRESSED_RGBA_S3TC_DXT5_EXT,
    [BASIS_FORMAT.cTFBC7]: COMPRESSED_RGBA_BPTC_UNORM,
};

const RenderTexture = <T extends  BasisFile | KTX2File>(
    getBinary: (data: Uint8Array) => Promise<{ binaryFile: T, width: number, height: number}>,
    transcodeImage: (x: T, dst: Uint8Array, format: number) => void,
    getDstSize: (x: T, format: number) => number,
) => async (
    data: Uint8Array, 
    canvas: HTMLCanvasElement, 
    renderer: Renderer,
    drawMode: 0 | 1 | 2 = 0,
) => {
    log('Done loading .ktx2 file, decoded header:');

    const { initializeBasis } = await Module;
    initializeBasis();
  
    const { binaryFile, width, height } = await getBinary(data);
    const has_alpha = binaryFile.getHasAlpha();
    
    // Note: If the file is UASTC, the preferred formats are ASTC/BC7.
    // If the file is ETC1S and doesn't have alpha, the preferred formats are ETC1 and BC1. 
    // For alpha, the preferred formats are ETC2, BC3 or BC7. 
  
    let formatString = 'UNKNOWN';
    let format: number;
    if (astcSupported) {
      formatString = 'ASTC';
      format = BASIS_FORMAT.cTFASTC_4x4;
    } else if (bc7Supported) {
      formatString = 'BC7';
      format = BASIS_FORMAT.cTFBC7;
    } else if (dxtSupported) {
      if (has_alpha) {
        formatString = 'BC3';
        format = BASIS_FORMAT.cTFBC3;
      } else {
        formatString = 'BC1';
        format = BASIS_FORMAT.cTFBC1;
      }
    }
    else if (pvrtcSupported) {
      if (has_alpha) {
        formatString = 'PVRTC1_RGBA';
        format = BASIS_FORMAT.cTFPVRTC1_4_RGBA;
      } else {
        formatString = 'PVRTC1_RGB';
        format = BASIS_FORMAT.cTFPVRTC1_4_RGB;
      }
      
      if (
           ((width & (width - 1)) !== 0) 
           || ((height & (height - 1)) !== 0)
      ) {
        throw new PVRTC1SizeError();
      }
      if (width !== height) {
        throw new PVRTC1SizeError();
      }
    } else if (etcSupported) {
      formatString = 'ETC1';
      format = BASIS_FORMAT.cTFETC1;
    } else {
      formatString = 'RGB565';
      format = BASIS_FORMAT.cTFRGB565;
      log('Decoding .basis data to 565');
    }
  
    if (!binaryFile.startTranscoding()) {
      binaryFile.close();
      binaryFile.delete();
      throw new StartTranscodingFailed();
    }
  
    const dstSize = getDstSize(binaryFile, format);
    const dst = new Uint8Array(dstSize);
  
    transcodeImage(binaryFile, dst, format);
  
    binaryFile.close();
    binaryFile.delete();

    let tex, 
        alignedWidth, alignedHeight,
        displayWidth, displayHeight;
  
    alignedWidth = (width + 3) & ~3;
    alignedHeight = (height + 3) & ~3;
    
    displayWidth = alignedWidth;
    displayHeight = alignedHeight;

    canvas.width = alignedWidth;
    canvas.height = alignedHeight;
  
    switch (format) {
        case BASIS_FORMAT.cTFASTC_4x4:
            tex = renderer.createCompressedTexture(dst, alignedWidth, alignedHeight, COMPRESSED_RGBA_ASTC_4x4_KHR);
            break;
        case BASIS_FORMAT.cTFBC3:
        case BASIS_FORMAT.cTFBC1:
        case BASIS_FORMAT.cTFBC7:
            tex = renderer.createCompressedTexture(dst, alignedWidth, alignedHeight, DXT_FORMAT_MAP[format]);
            break;
        case BASIS_FORMAT.cTFETC1:
            tex = renderer.createCompressedTexture(dst, alignedWidth, alignedHeight, COMPRESSED_RGB_ETC1_WEBGL);
            break;
        case BASIS_FORMAT.cTFPVRTC1_4_RGB:
            tex = renderer.createCompressedTexture(dst, alignedWidth, alignedHeight, COMPRESSED_RGB_PVRTC_4BPPV1_IMG);
            break;
        case BASIS_FORMAT.cTFPVRTC1_4_RGBA:
            tex = renderer.createCompressedTexture(dst, alignedWidth, alignedHeight, COMPRESSED_RGBA_PVRTC_4BPPV1_IMG);
            break;
        default:
            canvas.width = width;
            canvas.height = height;
            displayWidth = width;
            displayHeight = height;
         
            // Create 565 texture. 
            var dstTex = new Uint16Array(width * height);
            
            // Convert the array of bytes to an array of uint16's.
            var pix = 0;
            for (var y = 0; y < height; y++)
               for (var x = 0; x < width; x++, pix++)
                  dstTex[pix] = dst[2 * pix + 0] | (dst[2 * pix + 1] << 8);
         
            tex = renderer.createRgb565Texture(dstTex, width, height);
    }
  
    renderer.drawTexture(tex, displayWidth, displayHeight, drawMode);

    return formatString
}

export const renderKtx2Texture = RenderTexture(
    async (data) => {
        const { KTX2File } = await Module;

        const ktx2File = new KTX2File(data);
    
        if (!ktx2File.isValid()) {
            ktx2File.close();
            ktx2File.delete();
            throw new InvalidKtx2FileError();
        }

        const width = ktx2File.getWidth();
        const height = ktx2File.getHeight();
        const levels = ktx2File.getLevels();
          
        if (!width || !height || !levels) {
            ktx2File.close();
            ktx2File.delete();
            throw new InvalidKtx2FileError();
        }

        return { binaryFile: ktx2File, width, height}
    },
    (binaryFile, dst, format) => {
        if (!binaryFile.transcodeImage(dst, 0, 0, 0, format, 0, -1, -1)) {
            binaryFile.close();
            binaryFile.delete();

            throw new Ktx2FiletranscodeError();
          }
    },
    (binaryFile, format) => binaryFile.getImageTranscodedSizeInBytes(0, 0, 0, format)
)

export const renderBasisTexture =  RenderTexture(
    async (data) => {
        const { BasisFile } = await Module;

        const basisFile = new BasisFile(data);

        const width = basisFile.getImageWidth(0, 0);
        const height = basisFile.getImageHeight(0, 0);
        const images = basisFile.getNumImages();
        const levels = basisFile.getNumLevels(0);
    
        if (!width || !height || !images || !levels) {
            basisFile.close();
            basisFile.delete();
            throw new InvalidBasisFileError();
        }

        return { binaryFile: basisFile, width, height}
    },
    (binaryFile, dst, format) => {
        if (!binaryFile.transcodeImage(dst, 0, 0, format, 0, 0)) {
            binaryFile.close();
            binaryFile.delete();

            throw new BasisFiletranscodeError();
          }
    },
    (binaryFile, format) => binaryFile.getImageTranscodedSizeInBytes(0, 0, format)
)
