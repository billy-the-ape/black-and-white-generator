import type { NextPage } from 'next'
import Head from 'next/head'
import { Box, Button, Checkbox, Container, FormControlLabel, Typography } from '@mui/material';
import { InputHTMLAttributes, useMemo, useState } from 'react';
import ColorlessCanvas from '../components/ColorlessCanvas';


export const removeItemAtIndex = <T extends unknown>(
  arr: T[],
  index: number
): T[] => [...arr.slice(0, index), ...arr.slice(index + 1, arr.length)];

const Home: NextPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [invert, setInvert] = useState(false);

  const onFileChange: InputHTMLAttributes<HTMLInputElement>['onChange'] = ({ target }) => {
    if(target.files && target.files.length) {
      
      setFiles(Array.from(target.files).concat(files));
    }
  }

  const onFileRemove = (index: number) => {
    setFiles(removeItemAtIndex(files, index));
  }

  const fileLabel = useMemo(() => 
    files.length > 1 ? `${files.length} files selected` : files[0]?.name ?? '',
    [files]
  )


  return (
    <Container>
      <Head>
        <title>Doodle Coloring Book</title>
        <meta name="description" content="Make your doodle colorable" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography sx={{ mt:5, mb:3 }} variant="h4">Doodle Coloring Book</Typography>
        <Box display="flex" alignItems="center" mb={1}>
          <Button variant="contained" sx={{ mr: 2 }} component="label">
            Choose file(s)
            <input multiple type="file" id="myFile" hidden name="filename" accept="image/png, image/gif, image/jpeg" onChange={onFileChange} />
          </Button>
          <FormControlLabel control={
            <Checkbox checked={invert} onChange={({target}) => setInvert(target.checked)
          } />} label="Invert colors" />
        </Box>
        <Typography sx={{mb: 2 }}>{fileLabel}</Typography>
        {files.map((file, i) => (
          <ColorlessCanvas invert={invert} key={file.name} file={file} onRemove={() => onFileRemove(i)} />
        ))}
      </Box>
    </Container>
  )
}

export default Home;
