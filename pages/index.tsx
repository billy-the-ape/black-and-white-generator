import type { NextPage } from 'next'
import Head from 'next/head'
import { Box, Container, Divider, Typography } from '@mui/material';
import { InputHTMLAttributes, useState } from 'react';
import ColorlessCanvas from '../components/ColorlessCanvas';

const Home: NextPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const onFileChange: InputHTMLAttributes<HTMLInputElement>['onChange'] = ({ target }) => {
    if(target.files && target.files.length) {
      setFiles(Array.from(target.files));
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
        <input multiple type="file" id="myFile" name="filename" accept="image/png, image/gif, image/jpeg" onChange={onFileChange} />
        <Box mt={3} />
        {files.map((file) => (
          <ColorlessCanvas file={file} />
        ))}
      </Box>
    </Container>
  )
}

export default Home;
