import * as React from 'react';
import { useAtom } from 'jotai';
import { useStyletron } from 'baseui';

import { Block } from 'baseui/block';
import { Slider } from "baseui/slider";
import { Checkbox } from 'baseui/checkbox';
import { RadioGroup, Radio } from "baseui/radio";
import { Label1, Label2, Paragraph3, Paragraph4 } from 'baseui/typography';
import { Button } from 'baseui/button';
import { ButtonGroup, MODE, SIZE } from 'baseui/button-group';

import { IconAlignTop } from './IconAlignTop';
import { IconAlignVCenter } from './IconAlignVCenter';
import { IconAlignBottom } from './IconAlignBottom';
import { IconAlignLeft } from './IconAlignLeft';
import { IconAlignHCenter } from './IconAlignHCenter';
import { IconAlignRight } from './IconAlignRight';

import { 
    containerAtom,
    sRGBAtom, mipmapAtom, 
    modeAtom, ETC1SQualityAtom, 
    resizeAtom, atlasAtom, atlasAllowFlippingAtom, atlasMaxSizeAtom,
    verticalAlignAtom, horizontalAlignAtom,
} from '../hooks/useConvertParameters';

export const Sidebar = () => {
    const [css] = useStyletron();
    const [container, setContaner] = useAtom(containerAtom);
    const [sRGB, setSRGB] = useAtom(sRGBAtom);
    const [mipmap, setMipmap] = useAtom(mipmapAtom);
    const [mode, setMode] = useAtom(modeAtom);
    const [, setETC1SQuality] = useAtom(ETC1SQualityAtom);
    const [ETC1SQualityCurrentValue, setETC1SQualityCurrentValue] = React.useState([1]);
    const [resize, setResize] = useAtom(resizeAtom);
    const [verticalAlign, setVerticalAlign] = useAtom(verticalAlignAtom);
    const [horizontalAlign, setHorizontalAlign] = useAtom(horizontalAlignAtom);
    const [atlas, setAtlas] = useAtom(atlasAtom);
    const [atlasAllowFlipping, setAtlasAllowFlipping] = useAtom(atlasAllowFlippingAtom);
    const [atlasMaxSizeCurrentValue, setAtlasMaxSizeCurrentValue] = React.useState([2048]);
    const [atlasMaxSize, setAtlasMaxSize] = useAtom(atlasMaxSizeAtom);


    const bodyStyle = css({
        overflowX: 'hidden',
        overflowY: 'auto',
        flexShrink: 1,
        paddingTop: '20px',
        marginBottom: '20px',
    });

    const formSectionStyle = css({
        marginTop: '40px',
        marginBottom: '40px',
    });

    const firstFormSectionStyle = css({
        marginTop: '0',
        marginBottom: '40px',
    });

    const formItemStyle = css({
        marginTop: '12px',
        marginBottom: '12px',
    });

    const checkboxSubtitleStyle = css({
        marginTop: '2px',
        paddingLeft: '32px',
    });

    return (
        <Block className={bodyStyle}>
            <Block className={firstFormSectionStyle}>
                <Label1>Container</Label1>
                <Paragraph4>The texture produced by these two options will not differ in any essential way. KTX2 is just a container, and the texture inside it is still encoded with BASIS.</Paragraph4>
                <Block className={formItemStyle}>
                    <RadioGroup
                        value={container}
                        onChange={(event) => setContaner(event.currentTarget.value as any)}
                    >
                        <Radio 
                            value="BASIS"
                            description="Bare texture."
                        >
                            BASIS
                        </Radio>
                        <Radio
                            value="KTX2"
                            description="With a KTX2 container."
                        >
                            KTX2
                        </Radio>
                    </RadioGroup>
                </Block>
                <Label1>Parameters</Label1>
                <Block className={formItemStyle}>
                    <Block>
                        <Checkbox
                            checked={sRGB}
                            onChange={(event) => setSRGB(event.currentTarget.checked)}
                        >
                            sRGB Mode
                        </Checkbox>
                        
                        <Paragraph3 className={checkboxSubtitleStyle} color={['contentSecondary']}>
                            If checked, the input is assumed to be in sRGB space. Be sure to set this correctly! (Examples: True on photos, albedo/spec maps, and false on normal maps)
                        </Paragraph3>
                    </Block>
                </Block>
                <Block className={formItemStyle}>
                    <Checkbox
                        checked={mipmap}
                        onChange={(event) => setMipmap(event.currentTarget.checked)}
                    >
                        Generate Mipmap
                    </Checkbox>
                    <Paragraph3 className={checkboxSubtitleStyle} color={['contentSecondary']}>
                        If checked Mipmap will be generated from the source images.
                    </Paragraph3>
                </Block>
            </Block>
            <Block className={formSectionStyle}>
                <Label1>Encoding</Label1>
                <RadioGroup
                    value={mode}
                    onChange={(event) => setMode(event.currentTarget.value as any)}
                >
                    <Radio 
                        value="UASTC"
                        description="For extremely high quality textures."
                    >
                        UASTC
                    </Radio>
                    <Radio
                        value="ETC1S"
                        description="For very small files."
                    >
                        ETC1S
                    </Radio>
                </RadioGroup>
            </Block>
            {
                mode === 'ETC1S' && (
                    <Block className={formSectionStyle}>
                        <Label1>ETC1S Quality</Label1>
                        <Slider 
                            min={1} 
                            max={255} 
                            value={ETC1SQualityCurrentValue} 
                            onChange={(event) => setETC1SQualityCurrentValue(event.value)} 
                            onFinalChange={(event) => setETC1SQuality(event.value[0])} 
                        />
                    </Block>
                )
            }
            <Block className={formSectionStyle}>
                <Label1>Resize</Label1>
                <Block className={formItemStyle}>
                    <Block>
                        <Checkbox
                            checked={resize}
                            onChange={(event) => setResize(event.currentTarget.checked)}
                        >
                            Resize image
                        </Checkbox>
                    </Block>
                    <Paragraph3 className={checkboxSubtitleStyle} color={['contentSecondary']}>
                        This will resize your image size to 2<sup>n</sup>, which will make the texture works on PIXI.js.
                    </Paragraph3>
                </Block>
                {
                    resize && (
                        <Block className={formSectionStyle}>
                            <Label1>Alignment</Label1>
                            <Block className={formItemStyle}>
                                <ButtonGroup
                                    size={SIZE.compact}
                                    mode={MODE.radio}
                                    selected={verticalAlign}
                                    onClick={(_event, index) => {
                                        setVerticalAlign(index);
                                    }}
                                    >
                                    <Button startEnhancer={() =>  <IconAlignTop />}>
                                        Top
                                    </Button>
                                    <Button startEnhancer={() =>  <IconAlignVCenter />}>
                                        Center
                                    </Button>
                                    <Button startEnhancer={() => <IconAlignBottom />}>
                                        Bottom
                                    </Button>
                                </ButtonGroup>
                            </Block>
                            <Block className={formItemStyle}>
                                <ButtonGroup
                                    size={SIZE.compact}
                                    mode={MODE.radio}
                                    selected={horizontalAlign}
                                    onClick={(_event, index) => {
                                        setHorizontalAlign(index);
                                    }}
                                    >
                                    <Button startEnhancer={() =>  <IconAlignLeft />}>
                                        Left
                                    </Button>
                                    <Button startEnhancer={() =>  <IconAlignHCenter />}>
                                        Center
                                    </Button>
                                    <Button startEnhancer={() => <IconAlignRight />}>
                                        Right
                                    </Button>
                                </ButtonGroup>
                            </Block>
                        </Block>
                    )
                }
            </Block>
            <Block className={formSectionStyle}>
                <Label1>Atlas</Label1>
                <Block className={formItemStyle}>
                    <Checkbox
                        checked={atlas}
                        onChange={(event) => setAtlas(event.currentTarget.checked)}
                    >
                        Generate Atlas
                    </Checkbox>
                    <Paragraph3 className={checkboxSubtitleStyle} color={['contentSecondary']}>
                        To improve load performance and reduce memory usage.
                    </Paragraph3>
                </Block>
                {
                    atlas && (
                        <Block className={formSectionStyle}>
                            <Block className={formItemStyle}>
                                <Label1>Atlas Parameters</Label1>
                                <Block className={formItemStyle}>
                                    <Checkbox
                                        checked={atlasAllowFlipping}
                                        onChange={(event) => setAtlasAllowFlipping(event.currentTarget.checked)}
                                    >
                                        Allow Flipping
                                    </Checkbox>
                                    <Paragraph3 className={checkboxSubtitleStyle} color={['contentSecondary']}>
                                        If the algorithm will try to flip rectangles to better fit them.
                                    </Paragraph3>
                                </Block>
                            </Block>
                                <Label2>Max Side Size</Label2>
                                <Block className={formItemStyle}>
                                    <Slider 
                                        min={1}
                                        max={4096}
                                        value={atlasMaxSizeCurrentValue} 
                                        onChange={(event) => setAtlasMaxSizeCurrentValue(event.value)} 
                                        onFinalChange={(event) => setAtlasMaxSize(event.value[0])} 
                                    />
                                </Block>
                                {
                                    atlasMaxSize > 2048 && (
                                        <Paragraph3 color={['negative']}>
                                            The maximum atlas space size should not exceed 2048 or the texture might not be displayed correctly on some mobile device. 
                                        </Paragraph3>
                                    )
                                }
                                <Paragraph3 color={['contentSecondary']}>
                                    If the algorithm will try to flip rectangles to better fit them.
                                </Paragraph3>
                        </Block>
                    )
                }
            </Block>
        </Block>
    )
}