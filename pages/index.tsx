import type { NextPage } from 'next'
import Head from 'next/head'
import { Box, Button, Container, IconButton, Typography } from '@mui/material';
import { InputHTMLAttributes, useState } from 'react';
import ColorlessCanvas from '../components/ColorlessCanvas';
import { RgbaColor } from "react-colorful";
import ColorPicker from '../components/ColorPicker';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

export const removeItemAtIndex = <T extends unknown>(
  arr: T[],
  index: number
): T[] => [...arr.slice(0, index), ...arr.slice(index + 1, arr.length)];

const Home: NextPage = () => {
  const [files, setFiles] = useState<File[]>([]);

  const onFileChange: InputHTMLAttributes<HTMLInputElement>['onChange'] = ({ target }) => {
    if(target.files && target.files.length) {
      
      setFiles(Array.from(target.files).concat(files));
    }
  }

  const onFileRemove = (index: number) => {
    setFiles(removeItemAtIndex(files, index));
  }

  return (
    <Container>
      <Head>
        <title>Doodle Coloring Book</title>
        <meta name="description" content="Make your doodle colorable" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography sx={{ mt:5, mb:3 }} variant="h4">Doodle Coloring Book</Typography>
        <Box display="flex" alignItems="center" mb={2}>
          <Button variant="contained" component="label">
            Choose file(s)
            <input multiple type="file" id="myFile" hidden name="filename" accept="image/png, image/gif, image/jpeg" onChange={onFileChange} />
          </Button>
        </Box>
        {files.map((file, i) => (
          <ColorlessCanvas
            key={file.name}
            file={file}
            onRemove={() => onFileRemove(i)}
          />
        ))}
      </Box>
    </Container>
  )
}

export default Home;
