import { Box, IconButton, Paper } from "@mui/material";
import { useEffect, useRef } from "react";
import DownloadIcon from '@mui/icons-material/Download';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

type ColorlessCanvasProps = {
  file: File;
  onRemove: () => void;
}

const ColorlessCanvas: React.FC<ColorlessCanvasProps> = ({ file, onRemove }) => {
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

              const imageData = ctx.getImageData(0, 0, img.width, img.height);

              // Only keep black, turn rest to white
              const newData = imageData.data.map((num) => num && 255);

              canvas2.current.width = img.width;
              canvas2.current.height = img.height;
              const ctx2 = canvas2.current.getContext("2d");

              if(ctx2) {
                ctx2.putImageData(new ImageData(newData, img.width, img.height), 0, 0);
                ctx2.scale(.3, .3);
              }
            }
          }
        };
      }
  }, [file]);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = `Color me - ${file.name}`;
    link.href = canvas2.current!.toDataURL()
    link.click();
  };

  return (
    <Paper sx={{mb: 2, px: 6, py: 4, display: 'flex', flexDirection: 'column'}}>
      <Box display="flex" justifyContent="flex-end" mb={1}>
        <IconButton onClick={downloadImage}><DownloadIcon /></IconButton>
        <IconButton sx={{ml: 1}} onClick={onRemove}><HighlightOffIcon /></IconButton>
      </Box>
      <canvas ref={canvas} style={{display: 'none'}} />
      <canvas ref={canvas2} style={{ maxWidth: '50vw' }} />
    </Paper>
  )
}

export default ColorlessCanvas;