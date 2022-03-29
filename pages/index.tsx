import type { NextPage } from 'next'
import Head from 'next/head'
import { Box, Container, Divider, Typography } from '@mui/material';
import { InputHTMLAttributes, useRef } from 'react';

const Home: NextPage = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const canvas2 = useRef<HTMLCanvasElement>(null);
  /* const [files, setFiles] = useState<File[]>([]); */
  const onFileChange: InputHTMLAttributes<HTMLInputElement>['onChange'] = ({ target }) => {
    if(target.files && target.files.length) {
      /* setFiles(Array.from(target.files)); */
      const fr = new FileReader();
      fr.readAsDataURL(target.files[0])
      fr.onload = () => {
        const img = new Image();
        img.src = String(fr.result);
        img.onload = () => {
          if(canvas.current && canvas2.current) {
            canvas.current.width = img.width;
            canvas.current.height = img.height;
            const ctx = canvas.current.getContext("2d");
            ctx?.drawImage(img, 0, 0);

            const imageData = ctx!.getImageData(0, 0, img.width, img.height);      
            const newData = imageData.data.map((num) => num && 255);
            
            canvas2.current.width = img.width;
            canvas2.current.height = img.height;
            const ctx2 = canvas2.current.getContext("2d");
            
            ctx2?.putImageData(new ImageData(newData, img.width, img.height), 0, 0);
            ctx2?.scale(.5, .5);
          }
        };
      }
    }
  }


  return (
    <Container>
      <Head>
        <title>Doodle Coloring Book</title>
        <meta name="description" content="Make your doodle colorable" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography sx={{mt:5, mb:3}} variant="h3">Doodle Coloring Book</Typography>
        <input type="file" id="myFile" name="filename" accept="image/png, image/gif, image/jpeg" onChange={onFileChange} />
        <Box mt={3} />
        <Divider />
        <canvas ref={canvas} style={{ display: 'none' }} />
        <canvas ref={canvas2} />
      </Box>
    </Container>
  )
}

export default Home;
