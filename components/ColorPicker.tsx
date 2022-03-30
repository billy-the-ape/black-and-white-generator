import { Box, BoxProps, Button, debounce, styled, Tooltip } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { RgbaColorPicker, RgbaColor } from "react-colorful";

const BackgroundBox = styled(Box)(({theme: { palette, spacing }}) => ({
  top: -5,
  left: -5,
  position: "absolute",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: 'center',
  backgroundColor: palette.background.default,
  padding: spacing(1),
  borderRadius: spacing(1), 
}));

const RAINBOW_ASSET_URL = '/assets/rainbow-gradient.png';

type ColorPickerProps = {
  color?: RgbaColor | null;
  initialColor?: RgbaColor | null;
  image?: string | null;
  label: string;
  onChange?: (newColor: RgbaColor | string) => void;
  onSelect?: (newColor: RgbaColor | string) => void;
  sx?: BoxProps['sx'];
}
const noop = () => {};

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  label,
  image,
  sx = {},
  onChange = noop,
  onSelect = noop,
}) => {
  const [colorState, setColorState] = useState<RgbaColor>(color!);
  const [selectedImage, setSelectedImage] = useState(image);
  const [showPicker, setShowPicker] = useState(false);

  const debounceColorChange = useCallback(debounce((color: RgbaColor) => onChange(color), 300), [onChange]);

  useEffect(() => {
    setSelectedImage(image);
    if(color) setColorState(color);
  }, [color?.a, color?.b, color?.g, color?.r, image])

  const handleChange = (newColor: RgbaColor) => debounceColorChange(newColor);
  
  const handleSelectColor = () => {
    setShowPicker(false);
    onChange(colorState);
    onSelect(colorState);
  }

  const handleSelectRainbow = () => {
    setShowPicker(false);
    setSelectedImage(RAINBOW_ASSET_URL);
    onChange(RAINBOW_ASSET_URL);
    onSelect(RAINBOW_ASSET_URL);
  }

  return (
    <Box position="relative">
      {showPicker && (
        <BackgroundBox>
          <RgbaColorPicker color={colorState} onChange={handleChange} />
          <Box display="flex" flexDirection="column" px={3} mt={1}>
            <Button
              sx={{ flex: 1, backgroundImage: `url(${RAINBOW_ASSET_URL})` }}
              onClick={handleSelectRainbow}
              variant="contained"
            >
              Rainbow
            </Button>
            <Button
              sx={{ flex: 1, mt: 1 }}
              variant="contained"
              color="info"
              onClick={handleSelectColor}
            >
              Select color
            </Button>
          </Box>
        </BackgroundBox>
      )}
      <Tooltip title={`Select ${label} Color`}>
        <Box px={2} sx={{
          height: 40,
          width: 55,
          cursor: 'pointer',
          ...sx,
          backgroundColor: selectedImage ? undefined : `rgba(${colorState.r},${colorState.g},${colorState.b},${colorState.a})`,
          ... (selectedImage ? { backgroundImage: `url(${selectedImage})`, backgroundSize: 'cover' } : {})
        }} onClick={() => setShowPicker(true)} />
      </Tooltip>
    </Box>
  )
}

export default ColorPicker;