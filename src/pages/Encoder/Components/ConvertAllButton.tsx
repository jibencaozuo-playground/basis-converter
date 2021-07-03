import * as React from 'react';
import { atom, useAtom } from 'jotai';
import { Button } from 'baseui/button';

import { filesAtom } from './Uploader';
import { IconConvert } from './IconConvert';
import { useConvertParameters } from '../hooks/useConvertParameters';

export const convertProgressAtom = atom(1);
export const isConvertingAtom = atom(false);

const useConvertAllCallback = () => {
    const [, setConvertProgress] = useAtom(convertProgressAtom);
    const [isConverting, setIsConverting] = useAtom(isConvertingAtom);
    const [files] = useAtom(filesAtom);
    const convertParameters = useConvertParameters();

    const convertAll = React.useCallback(async () => {
        setIsConverting(true);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          await file.toBasis(convertParameters);
          setConvertProgress(i / files.length);
        }

        setIsConverting(false);
    }, [files, setConvertProgress, setIsConverting, convertParameters]);

    return [isConverting, convertAll] as const
}

export const ConvertAllButton = () => {
    const [isConverting, convertAll] = useConvertAllCallback();
  return (
    <Button disabled={isConverting} onClick={convertAll}><IconConvert /> Convert All</Button>
  );
}