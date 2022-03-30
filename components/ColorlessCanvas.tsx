import { Box, debounce, IconButton, Paper, Slider, styled, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import DownloadIcon from '@mui/icons-material/Download';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { RgbaColor } from "react-colorful";
import ColorPicker from "./ColorPicker";
import { loadImageFromFile, loadImagesIntoCanvas } from "./util/loadImage";

const DEFAULT_THRESHOLD = 200;

const StyledCanvas = styled('canvas')(({theme: {breakpoints}}) => ({
  maxWidth: '50vw',
  [breakpoints.down('sm')]: {
    maxWidth: '70vw',
  }
}))

type ColorlessCanvasProps = {
  file: File;
  onRemove: () => void;
}

const ColorlessCanvas: React.FC<ColorlessCanvasProps> = ({ file, onRemove }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const canvas2 = useRef<HTMLCanvasElement>(null);
  const fgCanvas = useRef<HTMLCanvasElement>(null);
  const bgCanvas = useRef<HTMLCanvasElement>(null);
  const [initialBgColor, setInitialBgColor] = useState<RgbaColor | null>({ r: 255, b: 255, g: 255, a: 1 });
  const [initialFgColor, setInitialFgColor] = useState<RgbaColor | null>({ r: 0, b: 0, g: 0, a: 1 });
  const [bgColor, setBgColor] = useState<RgbaColor | null>({ r: 255, b: 255, g: 255, a: 1 });
  const [fgColor, setFgColor] = useState<RgbaColor | null>({ r: 0, b: 0, g: 0, a: 1 });
  const [fgImageUrl, setFgImageUrl] = useState<string | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);

  const swapColors = () => {
    setFgImageUrl(bgImageUrl);
    setBgImageUrl(fgImageUrl);
    setBgColor(fgColor);
    setFgColor(bgColor);
    setInitialBgColor(fgColor);
    setInitialFgColor(bgColor);
  };

  useEffect(() => {
    if(canvas.current && canvas2.current && fgCanvas.current && bgCanvas.current) {
      loadImagesIntoCanvas({
        file,
        threshold,
        fgImageUrl,
        bgImageUrl,
        fgColor,
        bgColor,
        fgCanvas: fgCanvas.current,
        bgCanvas: bgCanvas.current,
        hiddenCanvas: canvas.current,
        visibleCanvas: canvas2.current,
      });
    }
  }, [
    file,
    threshold,
    fgImageUrl,
    bgImageUrl,
    bgColor,
    fgColor,
  ]);

  const debounceThreshold = useCallback(debounce((value: number) => setThreshold(value), 200), [setThreshold]);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = `Color me - ${file.name}`;
    link.href = canvas2.current!.toDataURL()
    link.click();
  };

  return (
    <Paper sx={{mb: 2, px: 6, pb: 4, pt:1, display: 'flex', flexDirection: 'column'}}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center">
          <ColorPicker label="Foreground" color={initialFgColor} image={fgImageUrl} onChange={
            (val) => {
              if(typeof val === 'string') {
                setFgImageUrl(val)
                setFgColor(null)
              } else {
                setFgImageUrl(null)
                setFgColor(val)
              };
            }
          } />
            <IconButton onClick={swapColors}><SwapHorizIcon /></IconButton>
          <ColorPicker label="Background" color={initialBgColor} image={bgImageUrl}  onChange={
            (val) => {
              if(typeof val === 'string') {
                setBgImageUrl(val)
                setBgColor(null)
              } else {
                setBgImageUrl(null)
                setBgColor(val)
              };
            }
          } />
        </Box>
        <Box>
          <Typography variant="body1">Color Threshold</Typography>
          <Slider
            defaultValue={DEFAULT_THRESHOLD}
            min={10}
            max={700}
            onChange={(_, value) => debounceThreshold(Number(value))}
          />
        </Box>
        <Box display="flex" justifyContent="flex-end" flexBasis={150}>
          <IconButton onClick={downloadImage}><DownloadIcon /></IconButton>
          <IconButton sx={{ml: 1}} onClick={onRemove}><HighlightOffIcon /></IconButton>
        </Box>
      </Box>
      <StyledCanvas ref={canvas2} />
      <canvas ref={fgCanvas}  style={{display: 'none'}} />
      <canvas ref={canvas} style={{display: 'none'}} />
      <canvas ref={bgCanvas} style={{display: 'none'}} />
    </Paper>
  )
}

export default ColorlessCanvas;