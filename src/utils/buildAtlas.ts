
import { loadImage } from "./loadImage";
import { TextureFile } from "./TextureFile";

import { 
    RectXywhf, 
    FinderInput, 
    FlippingOption, 
    CallbackResult, 
    findBestPacking, 
} from "./atlas";

interface WH { 
    w: number;
    h: number;
}
interface XYWH { 
    x: number;
    y: number;
    w: number;
    h: number;
}

interface AtlasSubImageDescription {
	frame: XYWH;
	rotated: boolean;
	trimmed: boolean;
	spriteSourceSize: XYWH;
	sourceSize: WH;
}

export const buildAtlas = async (
    x: TextureFile[], 
    atlasAllowFlipping: boolean,
    atlasMaxSize: number
) => {
    // Load all metadata of each texture.
    const images = (await Promise.all(x.map(async (texture) => {
        const imageUrl = URL.createObjectURL(texture.file);
        const image = await loadImage(imageUrl, {
            resize: false,
            verticalAlign: null,
            horizontalAlign: null,
        }, texture.file.name);

        return {...image, url: imageUrl};
    })))
        .sort((a, b) => a.width * a.height - b.width * b.height)
        .filter((x) => {
            // Remove images that are too big.
            if (x.width > atlasMaxSize || x.height > atlasMaxSize) {
                console.warn(`Image ${x.width}x${x.height} is too big for atlas.`);
                return false;
            }
            return true;
        });

    let currentTask: typeof images = [...images];
    let nextTask: typeof images = [];

    let taskSuccess: boolean | null = null;
    const reportSuccessful = () => {
        taskSuccess = true;
        return CallbackResult.CONTINUE_PACKING;
    };
    const reportUnsuccessful = () => {
        taskSuccess = false; 
        return CallbackResult.ABORT_PACKING;
    };

    const canvases: HTMLCanvasElement[] = [];
    const metadata: Record<string, AtlasSubImageDescription>[] = [];

    // Create a canvas for each atlas image.
    const runTasks = () => {
        taskSuccess = null;
        const rectangles = currentTask.map((image) => {
            const rect = new RectXywhf(0, 0, image.width, image.height);
            return rect;
        });

        const findBestPackingResult = findBestPacking(
            rectangles,
            new FinderInput(
              atlasMaxSize,
              -4,
              reportSuccessful,
              reportUnsuccessful,
              atlasAllowFlipping ? FlippingOption.ENABLED : FlippingOption.DISABLED,
            ),
        );

        if (!taskSuccess) {
            console.log('Task failed, trying again.');
            const lastTask = currentTask.pop();
            
            if (lastTask) {
                nextTask.unshift(lastTask);
            }
            
            runTasks();
            return;
        }

        console.log('Task success, packing');

        const $canvas = document.createElement('canvas');
        $canvas.width = findBestPackingResult.w;
        $canvas.height = findBestPackingResult.h;

        const ctx = $canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Canvas context is null!');
        }
        
        const frames: Record<string, AtlasSubImageDescription> = {};

        for (let i = 0; i < currentTask.length; i += 1) {
            const image = currentTask[i];
            const rect = rectangles[i];

            ctx.drawImage(image.$image, rect.x, rect.y, rect.w, rect.h);

            const xywh = {
                x: rect.x,
                y: rect.y,
                w: rect.w,
                h: rect.h,
            };
            frames[image.fileName] = {
                frame: xywh,
                rotated: rect.flipped,
                trimmed: false,
                spriteSourceSize: xywh,
                sourceSize: { w: image.width, h: image.height },
            }
        }

        canvases.push($canvas);
        metadata.push(frames);

        if (nextTask.length > 0) {
            currentTask = nextTask;
            nextTask = [];
            runTasks();
        }
    }

    runTasks();

    return {
        canvases,
        metadata,
    }
}