import * as React from 'react';
import { useStyletron } from 'baseui';

import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';

import { Sidebar } from './Components/Sidebar';
import { Uploader } from './Components/Uploader';
import { Files } from './Components/Files';
import { PreviewModal } from './Components/PreviewModal';


export const Encoder = () => {
    const [css] = useStyletron();
    const bodyStyle = css({
        padding: '24px',
        height: '100%',
        maxHeight: '100vh',
    })

    const leftSideStyles = css({
        width: '20%',
        maxWidth: '320px',
        height: '100%',
        maxHeight: 'calc(100vh - 48px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    })

    return (
        <>
            <FlexGrid
                className={bodyStyle}
                flexGridColumnCount={2}
                flexGridColumnGap="scale800"
                flexGridRowGap="scale800"
                marginBottom="scale800"
            >
                <FlexGridItem className={leftSideStyles}>
                    <Sidebar />
                    <Uploader />
                </FlexGridItem>
                <FlexGridItem>
                    <Files />
                </FlexGridItem>
            </FlexGrid>
            <PreviewModal />
        </>
    )
}