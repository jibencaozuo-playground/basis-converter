import * as React from 'react';
import { atom, useAtom } from 'jotai';
import JSZip from 'jszip';
import { Button } from 'baseui/button';

import { download } from 'utils/download';

import { filesAtom } from './Uploader';
import { IconDownload } from './IconDownload';

const packagingProgressAtom = atom(0);

const useDownloadAllCallback = () => {
    const [isPackaging, setIsPackaging] = React.useState(false);
    const [files] = useAtom(filesAtom);
    const [, setProgress] = useAtom(packagingProgressAtom);

    const downloadAll = React.useCallback(async () => {
        if (isPackaging) return;

        const zip = new JSZip();
        setIsPackaging(true);
        
        zip.file('DO_NOT_README.txt', 'meh');

        console.log('Tasks:', files);
        for (let i = 0; i < files.length; i++) {
          setProgress(i / files.length);
          const file = files[i];

          console.log('compressing:', file);

          if (!file.textureFileBlob) continue;
          zip.file(file.file.name + '.basis', file.textureFileBlob, { binary: true });
          
          if (!file.previewFileBlob) {
            await file.generatePreview(false);
          } 
          
          zip.file(file.file.name + '.preview.png', file.previewFileBlob!, { binary: true, compression: 'STORE' });
        }
        
        const generatedZip = await zip.generateAsync({type : 'uint8array'});
        download('BasisPackage.zip', generatedZip);
        setIsPackaging(false);
    }, [isPackaging, files, setProgress]);

    return [isPackaging, downloadAll] as const
}

export const DownloadAllButton = () => {
    const [isPackaging, downloadAll] = useDownloadAllCallback();
  return (
    <Button disabled={isPackaging} onClick={downloadAll}><IconDownload /> Download All</Button>
  );
}