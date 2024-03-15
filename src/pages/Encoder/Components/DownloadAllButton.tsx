import * as React from 'react';
import { atom, useAtom } from 'jotai';
import JSZip from 'jszip';
import { Button } from 'baseui/button';

import { download } from 'utils/download';

import { filesAtom } from './Uploader';
import { IconDownload } from './IconDownload';
import { useConvertParameters } from '../hooks/useConvertParameters';
import { buildAtlas } from 'utils/buildAtlas';

const packagingProgressAtom = atom(0);

const COMPRESSION_PARAMETER =  { binary: true, compression: 'STORE' };

const atlasMeta = {
	"app": "https://basis.dev.jibencaozuo.com/",
}

const useDownloadAllCallback = () => {
    const [isPackaging, setIsPackaging] = React.useState(false);
    const [files] = useAtom(filesAtom);
    const [, setProgress] = useAtom(packagingProgressAtom);
    const { resizeParams, atlasParams } = useConvertParameters();

    const downloadAll = React.useCallback(async () => {
        if (isPackaging) return;

        const zip = new JSZip();
        setIsPackaging(true);
        
        zip.file('DO_NOT_README.txt', 'meh');

        for (let i = 0; i < files.length; i++) {
          console.log(`Zipping files ${i}/${files.length}`);
          setProgress(i / files.length);
          const file = files[i];
          const name = file.file.name.replace(/\.[^.]*$/, '');

          const { imageBlob } = await file.addPadding(resizeParams);
          zip.file(`original/${name}.png`, imageBlob);

          if (!file.basisTextureBlob) continue;
          zip.file(
            `basis/${name}.${file.container === 'BASIS' ? 'basis' : 'ktx2'}`, 
            file.basisTextureBlob, 
          
          );
          
          if (!file.compressedPngBlob) {
            await file.generatePreview(false);
          } 
          
          zip.file(`preview/${name}.png`, file.compressedPngBlob!);
        }

        if (atlasParams.atlas) {
          console.log('Packing atlas');
          const {
            canvases,
            metadata,
          } = await buildAtlas(
            files, 
            atlasParams.atlasAllowFlipping, 
            atlasParams.atlasMaxSize
          );

          for (let i = 0; i < canvases.length; i+= 1) {
            const canvas = canvases[i];
            const data = metadata[i];
            const blob = await Promise.resolve(
              new Promise((resolve) => canvas.toBlob(resolve, 'image/png')),
            );
            if (!blob) {
              throw new Error('canvas.toBlob failed');
            }

            zip.file(
              `atlas/atlas-${i}.png`,
              blob as Blob
            );
            zip.file(`atlas/atlas-${i}.json`, JSON.stringify({ frames: data, meta: atlasMeta }));
          }
        }
        
        const generatedZip = await zip.generateAsync({type : 'uint8array'});
        download('BasisPackage.zip', generatedZip);
        setIsPackaging(false);
    }, [
      files, 
      isPackaging, 
      atlasParams.atlas, 
      atlasParams.atlasAllowFlipping, 
      atlasParams.atlasMaxSize, 
      setProgress, 
      resizeParams,
    ]);

    return [isPackaging, downloadAll] as const
}

export const DownloadAllButton = () => {
    const [isPackaging, downloadAll] = useDownloadAllCallback();
  return (
    <Button disabled={isPackaging} onClick={downloadAll}><IconDownload /> Download All</Button>
  );
}
