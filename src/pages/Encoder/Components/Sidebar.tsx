import * as React from 'react';
import { useAtom } from 'jotai';
import { useStyletron } from 'baseui';

import { Block } from 'baseui/block';
import { Slider } from "baseui/slider";
import { Checkbox } from 'baseui/checkbox';
import { RadioGroup, Radio } from "baseui/radio";
import { StatefulTooltip } from "baseui/tooltip";
import { Label1 } from 'baseui/typography';

import { sRGBAtom, mipmapAtom, modeAtom, ETC1SQualityAtom } from '../hooks/useConvertParameters';

export const Sidebar = () => {
    const [css] = useStyletron();
    const [sRGB, setSRGB] = useAtom(sRGBAtom);
    const [mipmap, setMipmap] = useAtom(mipmapAtom);
    const [mode, setMode] = useAtom(modeAtom);
    const [, setETC1SQuality] = useAtom(ETC1SQualityAtom); 
    const [ETC1SQualityCurrentValue, setETC1SQualityCurrentValue] = React.useState([1]);

    const bodyStyle = css({
        overflowY: 'auto',
        flexShrink: 1,
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

    return (
        <Block className={bodyStyle}>
            <Block className={firstFormSectionStyle}>
                <Block className={formItemStyle}>
                    <StatefulTooltip 
                        returnFocus
                        autoFocus
                        content="If checked, the input is assumed to be in sRGB space. Be sure to set this correctly! (Examples: True on photos, albedo/spec maps, and false on normal maps.)"
                    >
                        <Block>
                            <Checkbox
                                checked={sRGB}
                                onChange={(event) => setSRGB(event.currentTarget.checked)}
                            >
                                sRGB Mode
                            </Checkbox>
                        </Block>
                    </StatefulTooltip>
                </Block>
                <Block className={formItemStyle}>
                    <StatefulTooltip 
                        returnFocus
                        autoFocus
                        content={"If checked Mipmap will be generated from the source images."}
                    >
                        <Block>
                            <Checkbox
                                checked={mipmap}
                                onChange={(event) => setMipmap(event.currentTarget.checked)}
                            >
                                Generate Mipmap
                            </Checkbox>
                        </Block>
                    </StatefulTooltip>
                </Block>
            </Block>
            <Block className={formSectionStyle}>
                <Label1>Modes</Label1>
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
        </Block>
    )
}