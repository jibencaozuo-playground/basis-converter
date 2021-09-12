import * as React from 'react';
import { useAtom } from 'jotai';
import { useStyletron } from 'baseui';

import { Block } from 'baseui/block';
import { ButtonGroup, SHAPE } from "baseui/button-group";
import { Button, SIZE } from "baseui/button";

import { Table } from "baseui/table-semantic";

import { download } from 'utils/download';
import { TextureFile } from 'utils/TextureFile';

import { IconConvert } from './IconConvert';
import { IconPreview } from './IconPreview'; 
import { IconDelete } from './IconDelete';
import { IconDownload } from './IconDownload';
import { ConvertAllButton } from './ConvertAllButton';
import { DownloadAllButton } from './DownloadAllButton';

import { filesAtom } from './Uploader';

import { compressedUrlAtom, uncompressedUrlAtom, openPreviewModalAtom } from './PreviewModal';
import { useConvertParameters } from '../hooks/useConvertParameters';

const useConvertImageCallback = (file: TextureFile) => {
    const [convertedFile, setConvertedFile] = React.useState<Uint8Array | null>(null);
    const [uncompressedUrl, setUncompressedUrl] = React.useState<string>('');
    const [imageWidth, setImageWidth] = React.useState<number>(0);
    const [imageHeight, setImageHeight] = React.useState<number>(0);

    const { encodingParams, resizeParams } = useConvertParameters();

    React.useEffect(() => {
        file.onConverted = () => {
            setConvertedFile(file.basisTextureBlob);
            if (file.uncompressedTexturePreviewUrl) {
                setUncompressedUrl(file.uncompressedTexturePreviewUrl);
            }
    
            setConvertedFile(file.basisTextureBlob);

            if (file.width !== null && file.height !== null) {
                setImageWidth(file.width);
                setImageHeight(file.height);
            }
        }

        return () => {
            file.onConverted = null
        }
    }, [file]);

    const convertFile = React.useCallback(async () => {
        await file.toTexture(encodingParams, resizeParams);
    }, [encodingParams, resizeParams, file]);

    return { 
        convertedFile, 
        convertFile, 
        uncompressedUrl, 
        width: imageWidth, 
        height: imageHeight 
    }
}

const useDownloadFileCallback = (file: TextureFile) => {
    return React.useCallback(() => {
        if (!file.basisTextureBlob) return;

        const ext = file.container === 'BASIS' ? '.basis' : '.ktx2';

        const exportedFileName = file.file.name + ext;
        download(exportedFileName, file.basisTextureBlob);
    }, [file]);
}

const usePreviewCallback = (file: TextureFile) => {
    const [, setCompressedUrl] = useAtom(compressedUrlAtom);
    const [, setUncompressedUrl] = useAtom(uncompressedUrlAtom);
    const [, setOpenPreviewModal] = useAtom(openPreviewModalAtom);

    return React.useCallback(async () => {
        await file.generatePreview();

        if (!file.uncompressedTexturePreviewUrl) return;
        if (!file.compressedTexturePreviewUrl) return;
        setUncompressedUrl(file.uncompressedTexturePreviewUrl);
        setCompressedUrl(file.compressedTexturePreviewUrl);
        setOpenPreviewModal(true);
    }, [
        file,
        setCompressedUrl, setUncompressedUrl,
        setOpenPreviewModal
    ])
}

interface IActionButtonsProps {
    file: TextureFile;
    onDelete: (file: TextureFile) => void;
}

const ActionButtons = ({ file, onDelete }: IActionButtonsProps) => {
    const { convertedFile, convertFile } = useConvertImageCallback(file);
    const downloadFile = useDownloadFileCallback(file);
    const handlePreview = usePreviewCallback(file);

    const handleDeleteClick = React.useCallback(() => {
        onDelete(file);
    }, [file, onDelete]);

    return (
        <ButtonGroup size={SIZE.compact} shape={SHAPE.square}>
            <Button onClick={convertFile}><IconConvert /></Button>
            <Button disabled={!convertedFile} onClick={handlePreview}><IconPreview /></Button>
            <Button onClick={handleDeleteClick}><IconDelete/></Button>
            <Button disabled={!convertedFile} onClick={downloadFile}><IconDownload /></Button>
        </ButtonGroup>
    )
}

export const Files = () => {
    const [css] = useStyletron();
    const [files, setFiles] = useAtom(filesAtom);

    const bodyStyle = css({
        height: '100%',
        maxHeight: 'calc(100vh - 48px)',
        display: 'flex',
        flexDirection: 'column',
    });

    const tableStyle = css({
        flexGrow: 1,
        flexShrink: 1,
    });

    const footerStyles = css({
        display: 'flex',
        justifyContent: 'flex-end',
    });

    const tableOverrides = {
        Root: {
          style: {
            maxHeight: 'calc(100vh - 48px - 52px)',
          },
        },
      };

    const handleDelete = React.useCallback((file: TextureFile) => {
        const nextFiles = [...files];
        const index = nextFiles.indexOf(file);
        console.log(index);
        if (index > -1) {
            nextFiles.splice(index, 1);
            setFiles(nextFiles);
        }

    }, [files, setFiles]);

    const fileMetadata = React.useMemo(() => {
        return files.map((textureFile) => [
                textureFile.file.name,
                textureFile.file.size,
                textureFile.file.type,
                <ActionButtons 
                    key={textureFile.file.name} 
                    file={textureFile} 
                    onDelete={handleDelete} 
                />,
            ]
        )
    }, [files, handleDelete]);

    return (
        <Block className={bodyStyle}>
            <Block className={tableStyle}>
                <Table
                    overrides={tableOverrides}
                    columns={["Name", "Size", "Type", "Actions"]}
                    data={fileMetadata}
                />
            </Block>
            <Block className={footerStyles}>
                <ButtonGroup>
                    <ConvertAllButton />
                    <DownloadAllButton />
                </ButtonGroup>
            </Block>
        </Block>
    );
}