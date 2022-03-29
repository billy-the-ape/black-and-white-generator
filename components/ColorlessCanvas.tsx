import { Box, IconButton, Paper, styled } from "@mui/material";
import { useEffect, useRef } from "react";
import DownloadIcon from '@mui/icons-material/Download';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const StyledCanvas = styled('canvas')(({theme: {breakpoints}}) => ({
  maxWidth: '50vw',
  [breakpoints.down('sm')]: {
    maxWidth: '70vw',
  }
}))

type ColorlessCanvasProps = {
  file: File;
  onRemove: () => void;
  invert?: boolean;
}

const ColorlessCanvas: React.FC<ColorlessCanvasProps> = ({ file, invert, onRemove }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const canvas2 = useRef<HTMLCanvasElement>(null);

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

              const fg = invert ? 255 : 0;
              const bg = invert ? 0 : 255;

              for (let i = 0; i <= data.length - 4; i += 4) {
                if ((data[i] + data[i + 1] + data[i + 2]) <= 240) {
                  newData[i] = newData[i+1] = newData[i+2] = fg;
                } else {
                  newData[i] = newData[i+1] = newData[i+2] = bg;
                }
                newData[i+3] = data[i+3];
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
  }, [file, invert]);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = `Color me - ${file.name}`;
    link.href = canvas2.current!.toDataURL()
    link.click();
  };

  return (
    <Paper sx={{mb: 2, px: 6, pb: 4, pt:1, display: 'flex', flexDirection: 'column'}}>
      <Box display="flex" justifyContent="flex-end" mb={1}>
        <IconButton onClick={downloadImage}><DownloadIcon /></IconButton>
        <IconButton sx={{ml: 1}} onClick={onRemove}><HighlightOffIcon /></IconButton>
      </Box>
      <canvas ref={canvas} style={{display: 'none'}} />
      <StyledCanvas ref={canvas2} />
    </Paper>
  )
}

export default ColorlessCanvas;