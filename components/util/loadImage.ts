import { RgbaColor } from "react-colorful";

export const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () => reject(img);
});

export const loadImageFromFile = (file: File) => new Promise<HTMLImageElement>((resolve, reject) => {
  const fr = new FileReader();
  fr.readAsDataURL(file)
  fr.onload = () => {
    const img = new Image();
      img.src = String(fr.result);
      img.onload = () => resolve(img);
      img.onerror = () => reject(img);
  };
});

type LoadImagesIntoCanvasProps = {
  file: File;
  hiddenCanvas: HTMLCanvasElement;
  visibleCanvas: HTMLCanvasElement;
  threshold: number;
  fgCanvas: HTMLCanvasElement;
  bgCanvas: HTMLCanvasElement;
  fgColor: RgbaColor | null;
  bgColor: RgbaColor | null;
  fgImageUrl: string | null;
  bgImageUrl: string | null;
}

export const loadImagesIntoCanvas = async ({
  file,
  hiddenCanvas,
  visibleCanvas,
  fgCanvas,
  bgCanvas,
  fgImageUrl,
  bgImageUrl,
  threshold,
  fgColor,
  bgColor,
}: LoadImagesIntoCanvasProps) => {
  const img = await loadImageFromFile(file);
  hiddenCanvas.height = img.height;
  hiddenCanvas.width = img.width;
  const hiddenCtx = hiddenCanvas.getContext("2d");
  if(hiddenCtx) {
    hiddenCtx.drawImage(img, 0, 0);
    const { data } = hiddenCtx.getImageData(0, 0, img.width, img.height);

    // Only keep black, turn rest to white
    const newData = new Uint8ClampedArray(data.length);
    let bgImageData = new Uint8ClampedArray();
    let fgImageData = new Uint8ClampedArray();

    if (fgImageUrl) {
      const fgImage = await loadImage(fgImageUrl);
      fgCanvas.height = fgImage.height;
      fgCanvas.width = fgImage.width;
      const fgCtx = fgCanvas.getContext("2d");
      const fgScale = (img.width / fgImage.width) * 2;
      const fgWidth = img.width;
      const fgHeight = fgImage.height * fgScale;
      fgCanvas.width = fgWidth;
      fgCanvas.height = fgHeight;
      if (fgCtx) {
        fgCtx.drawImage(fgImage, 0, 0, fgWidth, fgHeight);
        const { data } = fgCtx.getImageData(0, 0, fgWidth, fgHeight);
        fgImageData = data;
      }
    }

    if (bgImageUrl) {
      const bgImage = await loadImage(bgImageUrl);
      const bgCtx = bgCanvas.getContext("2d");
      const bgScale = (img.width / bgImage.width) * 2;
      const bgWidth = img.width;
      const bgHeight = bgImage.height * bgScale;
      bgCanvas.width = bgWidth;
      bgCanvas.height = bgHeight;
      if (bgCtx) {
        bgCtx.drawImage(bgImage, 0, 0, bgWidth, bgHeight);
        const { data } = bgCtx.getImageData(0, 0, bgWidth, bgHeight);
        bgImageData = data;
      }
    }

    for (let i = 0; i <= data.length - 4; i += 4) {
      if ((data[i] + data[i + 1] + data[i + 2]) <= threshold) {
        newData[i] = fgColor?.r ?? fgImageData[i];
        newData[i + 1] = fgColor?.g ?? fgImageData[i + 1];
        newData[i + 2] = fgColor?.b ?? fgImageData[i + 2];
        newData[i + 3] = ((fgColor?.a ?? 0) * 255)  || fgImageData[i + 3];
      } else {
        newData[i] = bgColor?.r ?? bgImageData[i];
        newData[i + 1] = bgColor?.g ?? bgImageData[i + 1];
        newData[i + 2] = bgColor?.b ?? bgImageData[i + 2];
        newData[i + 3] = ((bgColor?.a ?? 0) * 255)  || bgImageData[i + 3];
      }
    }

    visibleCanvas.width = img.width;
    visibleCanvas.height = img.height;
    const visibleCtx = visibleCanvas.getContext("2d");

    if(visibleCtx) {
      visibleCtx.putImageData(new ImageData(newData, img.width, img.height), 0, 0);
    }
  }
}