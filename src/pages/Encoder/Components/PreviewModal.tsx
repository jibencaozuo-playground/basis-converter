import * as React from 'react';
import { atom, useAtom } from 'jotai';

import {
  Modal,
  ModalHeader,
  ModalBody,
  SIZE,
  ROLE
} from 'baseui/modal';
import ReactCompareImage from 'react-compare-image';

export const openPreviewModalAtom = atom(false);
export const uncompressedUrlAtom = atom('');
export const compressedUrlAtom = atom('');

export const PreviewModal = () => {
  const [isOpen, setIsOpen] = useAtom(openPreviewModalAtom);
  const [uncompressedUrl, ] = useAtom(uncompressedUrlAtom);
  const [compressedUrl, ] = useAtom(compressedUrlAtom);

  return (
    <Modal
      onClose={() => setIsOpen(false)}
      closeable
      isOpen={isOpen}
      animate
      autoFocus
      size={SIZE.default}
      role={ROLE.dialog}
      unstable_ModalBackdropScroll={true}
    >
      <ModalHeader>Preview</ModalHeader>
      <ModalBody>
        <ReactCompareImage 
            leftImage={uncompressedUrl} 
            rightImage={compressedUrl}
            leftImageLabel="Original" 
            rightImageLabel="Compressed" 
        />
      </ModalBody>
    </Modal>
  );
}