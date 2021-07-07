import * as React from 'react';
import { atom, useAtom } from 'jotai';

import { AlignParameter } from 'utils/typings';

export const sRGBAtom = atom(false);
export const mipmapAtom = atom(true);
export const modeAtom = atom<'UASTC' | 'ETC1S'>('ETC1S');
export const ETC1SQualityAtom = atom(1);
export const resizeAtom = atom(true);
export const verticalAlignAtom = atom(AlignParameter.Center);
export const horizontalAlignAtom = atom(AlignParameter.Center);

export const useConvertParameters = () => {
    const [sRGB] = useAtom(sRGBAtom);
    const [mipmap] = useAtom(mipmapAtom);
    const [mode] = useAtom(modeAtom);
    const [ETC1SQuality] = useAtom(ETC1SQualityAtom);
    const [resize] = useAtom(resizeAtom);
    const [verticalAlign] = useAtom(verticalAlignAtom);
    const [horizontalAlign] = useAtom(horizontalAlignAtom);

    const encodingParams =  React.useMemo(() => ({
        quality: ETC1SQuality,
        uastc: mode === 'UASTC',
        debug: false,
        sRGB,
        mipmap,
    }), [sRGB, mipmap, mode, ETC1SQuality]);

    const resizeParams = React.useMemo(() => ({
        resize, verticalAlign, horizontalAlign
    }), [resize, verticalAlign, horizontalAlign]);

    return { encodingParams, resizeParams }
}
