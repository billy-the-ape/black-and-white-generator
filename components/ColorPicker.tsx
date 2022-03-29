import { Box, BoxProps, Button, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { RgbaColorPicker, RgbaColor } from "react-colorful";

type ColorPickerProps = {
  color: RgbaColor;
  label: string;
  onChange?: (newColor: RgbaColor) => void;
  onSelect?: (newColor: RgbaColor) => void;
  sx?: BoxProps['sx']
}
const noop = () => {};

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  label,
  sx = {},
  onChange = noop,
  onSelect = noop,
}) => {
  const [colorState, setColorState] = useState<RgbaColor>(color);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => { setColorState(color) }, [color.r, color.g, color.b, color.a])

  const handleChange = (newColor: RgbaColor) => {
    setColorState(newColor);
    onChange(newColor);
  }
  
  const handleSelect = () => {
    setShowPicker(false);
    onSelect(colorState);
  }

  return (
    <Box position="relative">
      {showPicker && (
        <Box top={-5} left={-5} position="absolute" zIndex={1} display="flex" flexDirection="column">
          <RgbaColorPicker color={color} onChange={handleChange} />
          <Button sx={{ mt: 1 }} variant="contained" color="info" onClick={handleSelect}>Select {label}</Button>
        </Box>
      )}
      <Tooltip title={`Select ${label} Color`}>
        <Box px={2} sx={{
          height: 40,
          width: 55,
          cursor: 'pointer',
          ...sx,
          backgroundColor: `rgba(${colorState.r},${colorState.g},${colorState.b},${colorState.a})`
        }} onClick={() => setShowPicker(true)} />
      </Tooltip>
    </Box>
  )
}

export default ColorPicker;