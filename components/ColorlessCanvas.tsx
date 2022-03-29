import { Box, IconButton, Paper, Slider, styled, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import DownloadIcon from '@mui/icons-material/Download';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { RgbaColor } from "react-colorful";
import ColorPicker from "./ColorPicker";

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
  const [bgColor, setBgColor] = useState<RgbaColor>({ r: 255, b: 255, g: 255, a: 1 });
  const [fgColor, setFgColor] = useState<RgbaColor>({ r: 0, b: 0, g: 0, a: 1 });
  const [threshold, setThreshold] = useState(200);

  const swapColors = () => {
    const prevBg = { ...bgColor };
    setBgColor({ ...fgColor });
    setFgColor(prevBg);
  };

  useEffect(() => {
    const fr = new FileReader();
      fr.readAsDataURL(file)
      fr.onload = () => {
        const img = new Image();
        img.src = String(fr.result);
        img.onload = () => {
          if(canvas.current && canvas2.current) {
            canvas.current.width = img.width;
            canvas.current.height = img.height;
            const ctx = canvas.current.getContext("2d");
            if(ctx) {
              ctx.drawImage(img, 0, 0);

              const { data } = ctx.getImageData(0, 0, img.width, img.height);

              // Only keep black, turn rest to white
              const newData = new Uint8ClampedArray(data.length);


              for (let i = 0; i <= data.length - 4; i += 4) {
                if ((data[i] + data[i + 1] + data[i + 2]) <= threshold) {
                  newData[i] = fgColor.r;
                  newData[i+1] = fgColor.g;
                  newData[i+2] = fgColor.b;
                  newData[i+3] = fgColor.a * 255;
                } else {
                  newData[i] = bgColor.r;
                  newData[i+1] = bgColor.g;
                  newData[i+2] = bgColor.b;
                  newData[i+3] = bgColor.a * 255;
                }
              }

              canvas2.current.width = img.width;
              canvas2.current.height = img.height;
              const ctx2 = canvas2.current.getContext("2d");

              if(ctx2) {
                ctx2.putImageData(new ImageData(newData, img.width, img.height), 0, 0);
              }
            }
          }
        };
      }
  }, [file, bgColor, fgColor, threshold]);

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
          <ColorPicker label="Foreground" color={fgColor} onChange={setFgColor} />
            <IconButton onClick={swapColors}><SwapHorizIcon /></IconButton>
          <ColorPicker label="Background" color={bgColor} onChange={setBgColor} />
        </Box>
        <Box>
          <Typography variant="body1">Color Threshold</Typography>
          <Slider
            defaultValue={threshold}
            min={10}
            max={500}
            onChange={(_, value) => setThreshold(Number(value))}
          />
        </Box>
        <Box display="flex" justifyContent="flex-end" flexBasis={150}>
          <IconButton onClick={downloadImage}><DownloadIcon /></IconButton>
          <IconButton sx={{ml: 1}} onClick={onRemove}><HighlightOffIcon /></IconButton>
        </Box>
      </Box>
      <canvas ref={canvas} style={{display: 'none'}} />
      <StyledCanvas ref={canvas2} />
    </Paper>
  )
}

export default ColorlessCanvas;