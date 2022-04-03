import type { NextPage } from "next";
import Head from "next/head";
import { Box, Button, Container, Typography } from "@mui/material";
import { InputHTMLAttributes, useState } from "react";
import ColorlessCanvas from "../components/ColorlessCanvas";
import CollectionTokenSelector from "../components/CollectionTokenSelector";

export const removeItemAtIndex = <T extends unknown>(
  arr: T[],
  index: number
): T[] => [...arr.slice(0, index), ...arr.slice(index + 1, arr.length)];

const Home: NextPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<HTMLImageElement[]>([]);

  const onFileChange: InputHTMLAttributes<HTMLInputElement>["onChange"] = ({
    target,
  }) => {
    if (target.files && target.files.length) {
      setFiles(Array.from(target.files).concat(files));
    }
  };

  const onImageSelectionLoaded = (img: HTMLImageElement) => {
    setImages([img, ...images]);
  };

  const onFileRemove = (index: number) => {
    setFiles(removeItemAtIndex(files, index));
  };

  const onImageRemove = (index: number) => {
    setImages(removeItemAtIndex(images, index));
  };

  return (
    <Container>
      <Head>
        <title>NFT Coloring Book</title>
        <meta name="description" content="Make your NFT colorable" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography sx={{ mt: 5, mb: 3 }} variant="h4">
          NFT Coloring Book
        </Typography>
        <Box display="flex" alignItems="center" mb={2}>
          <Button variant="contained" component="label">
            Upload file(s)
            <input
              multiple
              type="file"
              id="myFile"
              hidden
              name="filename"
              accept="image/png, image/gif, image/jpeg"
              onChange={onFileChange}
            />
          </Button>
        </Box>
        <Box>
          <CollectionTokenSelector onSelectionLoaded={onImageSelectionLoaded} />
        </Box>
        {images.map((img, i) => (
          <ColorlessCanvas
            key={img.id}
            image={img}
            onRemove={() => onImageRemove(i)}
          />
        ))}
        {files.map((file, i) => (
          <ColorlessCanvas
            key={file.name}
            file={file}
            onRemove={() => onFileRemove(i)}
          />
        ))}
      </Box>
    </Container>
  );
};

export default Home;
