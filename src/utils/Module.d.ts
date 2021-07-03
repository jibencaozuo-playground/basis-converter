export class BasisEncoder {
    constructor();
    delete(): void;
    encode(basisFileData: Uint8Array): number;
    setSliceSourceImage(
        sliceIndex: number,
        image: Uint8Array,
        width: number, height: number,
        isPng: boolean,
    ): void;
    setUASTC(flag: boolean): void;
    setYFlip(flag: boolean): void;
    setDebug(flag: boolean): void;
    setPerceptual(flag: boolean): void;
    setCheckForAlpha(flag: boolean): void;
    setForceAlpha(flag: boolean): void;
    setSwizzle(r: number, g: number, b: number, a: number): void;
    setRenormalize(flag: boolean): void;
    setMaxEndpointClusters(maxEndpointClusters: number): void;
    setMaxSelectorClusters(maxSelectorClusters: number): void;
    setQualityLevel(qualityLevel: number): void;
    setCompressionLevel(comp_level: number): void;
    setNormalMap(): void;
    setSelectorRDOThresh(selectorRDOThresh: number): void;
    setEndpointRDOThresh(endpointRDOThresh: number): void;
    setCreateKTX2File(flag: boolean): void;
    setKTX2UASTCSupercompression(flag: boolean): void;
    setKTX2SRGBTransferFunc(flag: boolean): void;
    setMipGen(flag: boolean): void;
    setMipScale(flag: boolean): void;
    setMipFilter(mipFilter: number): void;
    setMipSRGB(flag: boolean): void;
    setMipRenormalize(flag: boolean): void;
    setMipWrapping(flag: boolean): void;
    setMipSmallestDimension(mipSmallestDimension: number): void;
    setTexType(texType: number): void;
    setUserData0(userData0: number): void;
    setUserData1(userData1: number): void;
    setPackUASTCFlags(flag: number): void;
    setRDOUASTC(flag: boolean): void;
    setRDOUASTCQualityScalar(RDOQuality: number): void;
    setRDOUASTCDictSize(dictSize: number): void;
    setRDOUASTCMaxAllowedRMSIncreaseRatio(RDOUASTCMaxAllowedRMSIncreaseRatio: number): void;
    setRDOUASTCSkipBlockRMSThresh(RDOUASTCSkipBlockRMSThresh: number): void
    setNoSelectorRDO(flag: number): void;
    setNoEndpointRDO(flag: number): void;
    setComputeStats(flag: number): void;
    setDebugImages(flag: number): void;
}

interface FileDesc {
    endpointPaletteLen: number
    endpointPaletteOfs: number
    hasAlphaSlices: boolean
    numEndpoints: number
    numSelectors: number
    selectorPaletteLen: number
    selectorPaletteOfs: number
    tablesLen: number
    tablesOfs: number
    texFormat: number
    totalImages: number
    usPerFrame: number
    userdata0: number
    userdata1: number
    version: number
    yFlipped: boolean
}

interface ImageDesc {
    alphaFlag: boolean
    iframeFlag: boolean
    numBlocksX: number
    numBlocksY: number
    numLevels: number
    origHeight: number
    origWidth: number
}

interface ImageLevelDesc {
    alphaFileLen: number
    alphaFileOfs: number
    rgbFileLen: number
    rgbFileOfs: number
}

export class BasisFile {
    constructor(data: Uint8Array);
    close(): void;
    delete(): void;
    getHasAlpha(): boolean;
    isUASTC(): boolean;
    getNumImages(): number;
    getNumLevels(imageIndex: number): number;
    getImageWidth(imageIndex: number, levelIndex: number): number;
    getImageHeight(imageIndex: number, levelIndex: number): number;
    getImageTranscodedSizeInBytes(imageIndex: number, levelIndex: number, format: number): number;
    startTranscoding(): boolean;
    transcodeImage(dst: Uint8Array, imageIndex: number, levelIndex: number, format: number, unused: number, getAlphaForOpaqueFormats: number): boolean;
    getFileDesc(): FileDesc
    getImageDesc(imageIndex: number): ImageDesc
    getImageLevelDesc(imageIndex: number, levelIndex: number): ImageLevelDesc
}

class BindingError {
    name = 'BindingError'
}

class InternalError {
    name = 'InternalError'
}

export interface KTX2Header {
    dfdByteLength: number
    dfdByteOffset: number
    faceCount: number
    kvdByteLength: number
    kvdByteOffset: number
    layerCount: number
    levelCount: number
    pixelDepth: number
    pixelHeight: number
    pixelWidth: number
    sgdByteLength: number
    sgdByteOffset: number
    supercompressionScheme: number
    typeSize: number
    vkFormat: number
}

export interface LevelInfo {
    alphaFlag: boolean
    faceIndex: number
    height: number
    iframeFlag: boolean
    layerIndex: number
    levelIndex: number
    numBlocksX: number
    numBlocksY: number
    origHeight: number
    origWidth: number
    totalBlocks: number
    width: number
}

export class KTX2File {
    constructor(data: Uint8Array);
    close(): void;
    delete(): void;
    getDFD(dvdData: Uint8Array): void;
    getDFDChannelID0(): number;
    getDFDChannelID0(): number;
    getDFDColorModel(): number;
    getDFDColorPrimaries(): number;
    getDFDFlags(): number;
    getDFDSize(): number;
    getDFDTotalSamples(): number;
    getDFDTransferFunc(): number;
    getETC1SImageDescImageFlags(levelIndex: number, layerIndex: number, faceIndex): number;
    getFaces(): number;
    getFormat(): number;
    getHasAlpha(): boolean;
    getHeader(): KTX2Header;
    getHeight(): number;
    getImageLevelInfo(levelIndex: number, layerIndex: number, faceIndex): LevelInfo;
    getImageTranscodedSizeInBytes(levelIndex: number, levelIndex: number, faceIndex: number, format: number): number;
    getKey(index: number): string;
    getKeyValue(keyName: string, dst: Uint8Array): boolean;
    getKeyValueSize(keyName: string): number;
    getLayers(): number;
    getLevels(): number;
    getTotalKeys(): number;
    getWidth(): number;
    hasKey(keyName: string): boolean;
    isETC1S(): boolean;
    isUASTC(): boolean;
    isValid(): boolean;
    isVideo(): boolean;
    startTranscoding(): number;
    transcodeImage(
        dst: Uint8Array, 
        imageIndex: number, 
        levelIndex: number, 
        format: number, 
        unused: number, 
        getAlphaForOpaqueFormats: number, 
        channel0: number, 
        channel1: number
    ): boolean;
}

export class LowLevelETC1SImageTranscoder {
    constructor();
    decodePalettes(numEndpoints: number, endpointData: Uint8Array, numSelectors: number, selectorData: UInt8Array): boolean
    decodeTables(tableData: Uint8Array): boolean
    transcodeImage(): boolean
    transcodeUASTCImage(
        targetFormat: number,
        outputBlocks: UInt8Array,
        outputBlocksBufSizeInBlocksOrPixels: number,
        compressedData: UInt8Array,
        numBlocksX: number,
        numBlocksY: number,
        origWidth: number,
        origHeight: number,
        levelIndex: number,
        rgbOffset: number,
        rgbLength: number,
        alphaOffset: number,
        alphaLength: number,
        decodeFlags: number,
        basisFileHasAlphaSlices: boolean,
        isVideo: number,
        outputRowPitchInBlocksOrPixels: number,
        outputRowsInPixels: number
    ): boolean
    transcoderSupportsKTX2(): boolean;
    transcoderSupportsKTX2Zstd(): boolean;
}

export class UnboundTypeError {
    name = 'UnboundTypeError'
}

interface ModuleType {
    static BASISU_DEFAULT_COMPRESSION_LEVEL: number
    static BASISU_DEFAULT_ENDPOINT_RDO_THRESH: number
    static BASISU_DEFAULT_HYBRID_SEL_CB_QUALITY_THRESH: number
    static BASISU_DEFAULT_QUALITY: number
    static BASISU_DEFAULT_SELECTOR_RDO_THRESH: number
    static BASISU_MAX_COMPRESSION_LEVEL: number
    static BASISU_MAX_ENDPOINT_CLUSTERS: number
    static BASISU_MAX_IMAGE_DIMENSION: number
    static BASISU_MAX_RESAMPLER_FILTERS: number
    static BASISU_MAX_SELECTOR_CLUSTERS: number
    static BASISU_MAX_SLICES: number
    static BASISU_MAX_SUPPORTED_TEXTURE_DIMENSION: number
    static BASISU_QUALITY_MAX: number
    static BASISU_QUALITY_MIN: number
    static BASISU_RDO_UASTC_DICT_SIZE_DEFAULT: number
    static BASISU_RDO_UASTC_DICT_SIZE_MAX: number
    static BASISU_RDO_UASTC_DICT_SIZE_MIN: number
    BasisEncoder: typeof BasisEncoder
    BasisFile: typeof BasisFile
    BindingError: typeof BindingError
    static HEAP8: Int8Array
    static HEAP16: Int8Array
    static HEAP32: Int8Array
    static HEAPF32: Int8Array
    static HEAPF64: Int8Array
    static HEAPU8: Int8Array
    static HEAPU16: Int8Array
    static HEAPU32: Int8Array
    InternalError: typeof InternalError
    initializeBasis: () => void
    KTX2File: typeof KTX2File
    static KTX2_IMAGE_IS_P_FRAME: number
    static KTX2_KDF_DF_MODEL_ETC1S: number
    static KTX2_KDF_DF_MODEL_UASTC: number
    static KTX2_KHR_DF_TRANSFER_LINEAR: number
    static KTX2_KHR_DF_TRANSFER_SRGB: number
    static KTX2_MAX_SUPPORTED_LEVEL_COUNT: number
    static KTX2_UASTC_BLOCK_SIZE: number
    static KTX2_VK_FORMAT_UNDEFINED: number 
    LowLevelETC1SImageTranscoder: typeof LowLevelETC1SImageTranscoder
    static UASTC_RDO_DEFAULT_MAX_ALLOWED_RMS_INCREASE_RATIO: number
    static UASTC_RDO_DEFAULT_SKIP_BLOCK_RMS_THRESH: number
    UnboundTypeError: typeof UnboundTypeError
    calledRun: boolean
    transcodeUASTCImage: LowLevelETC1SImageTranscoder['transcodeUASTCImage']
    transcoderSupportsKTX2: LowLevelETC1SImageTranscoder['transcoderSupportsKTX2']
    transcoderSupportsKTX2Zstd: LowLevelETC1SImageTranscoder['transcoderSupportsKTX2Zstd']
}

export const Module: Promise<ModuleType>