import * as React from 'react';
import { atom, useAtom } from 'jotai';

import { FileUploader } from 'baseui/file-uploader';

import { TextureFile } from 'utils/TextureFile';

import { isConvertingAtom } from './ConvertAllButton';

export const filesAtom = atom<TextureFile[]>([]);

export const Uploader = () => {
    const [files, setFiles] = useAtom(filesAtom);
    const [isConverting, ] = useAtom(isConvertingAtom);

    return (
        <FileUploader
            accept="image/*"
            disabled={isConverting}
            onDrop={(acceptedFiles) => {
                setFiles([
                    ...files, 
                    ...acceptedFiles.map((file) => new TextureFile(file))
                ]);
            }}
        />
    );
}