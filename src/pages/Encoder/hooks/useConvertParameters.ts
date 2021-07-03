import * as React from 'react';
import { atom, useAtom } from 'jotai';

export const sRGBAtom = atom(false);
export const mipmapAtom = atom(true);
export const modeAtom = atom<'UASTC' | 'ETC1S'>('ETC1S');
export const ETC1SQualityAtom = atom(1);

export const useConvertParameters = () => {
    const [sRGB] = useAtom(sRGBAtom);
    const [mipmap] = useAtom(mipmapAtom);
    const [mode] = useAtom(modeAtom);
    const [ETC1SQuality] = useAtom(ETC1SQualityAtom);

    return React.useMemo(() => ({
        quality: ETC1SQuality,
        uastc: mode === 'UASTC',
        debug: false,
        sRGB,
        mipmap,
    }), [sRGB, mipmap, mode, ETC1SQuality]);
}
