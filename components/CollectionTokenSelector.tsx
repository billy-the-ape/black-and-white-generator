import { Autocomplete, Box, Button, TextField } from "@mui/material";
import { FormEventHandler, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

type CollectionItem = { label: string; value: string };

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

const DEFAULT_TOKENS: CollectionItem[] = [
  {
    label: "Azuki",
    value: "0xed5af388653567af2f388e6224dc7c4b3241c544",
  },
  {
    label: "Bored Ape Yacht Club",
    value: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
  },
  {
    label: "Doodles",
    value: "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e",
  },
  {
    label: "Mutant Ape Yacht Club",
    value: "0x60e4d786628fea6478f785a6d7e704777c86a7c6",
  },
];

type CollectionTokenSelectorProps = {
  onSelectionLoaded: (img: HTMLImageElement) => void;
};

const CollectionTokenSelector: React.FC<CollectionTokenSelectorProps> = ({
  onSelectionLoaded,
}) => {
  const [savedCollections, setSavedCollections] = useLocalStorage(
    "saved-collections",
    DEFAULT_TOKENS
  );
  const [selectedCollection, setSelectedCollection] =
    useState<CollectionItem | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState("");
  const [storeCollectionName, setStoreCollectionName] = useState(false);
  const [collectionError, setCollectionError] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const fetchTokenImage: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!selectedCollection) {
      setCollectionError(true);
      return;
    }

    if (!selectedTokenId) {
      setTokenError(true);
      return;
    }

    const { name, image_url, asset_contract } = await fetch(
      `https://api.opensea.io/api/v1/asset/${selectedCollection.value}/${selectedTokenId}/?include_orders=false`
    ).then((r) => r.json());

    const file = await fetch(image_url)
      .then((res) => res.blob())
      .then((blob) => window.URL.createObjectURL(blob));

    const img = new Image();
    img.src = file;
    img.id = "i" + String(Date.now());
    img.alt = name;

    img.onload = () => {
      onSelectionLoaded(img);
      console.log({ img });
    };

    if (storeCollectionName) {
      setStoreCollectionName(false);

      if (
        !savedCollections.some(({ value }) => value == asset_contract.address)
      ) {
        const newSavedCollections = [
          ...savedCollections,
          { label: asset_contract.name, value: asset_contract.address },
        ].sort((a, b) => a.label.localeCompare(b.label));

        setSavedCollections(newSavedCollections);
      }
    }
  };

  return (
    <form onSubmit={fetchTokenImage}>
      <Box display="flex" mb={2}>
        <Autocomplete
          freeSolo
          autoSelect
          options={savedCollections}
          sx={{ width: 300, mr: 2 }}
          onChange={(_, newValue) => {
            console.log({ newValue });
            if (newValue === selectedCollection?.label) return;
            if (typeof newValue === "string") {
              if (!ETH_ADDRESS_REGEX.test(newValue)) {
                setCollectionError(true);
                return;
              }
              setSelectedCollection({ label: "", value: newValue });
              setStoreCollectionName(true);
            } else {
              setSelectedCollection(newValue);
            }
          }}
          renderInput={(params) => (
            <TextField {...params} error={collectionError} label="Collection" />
          )}
        />
        <TextField
          error={tokenError}
          sx={{ width: 150, mr: 2 }}
          label="Token ID"
          onChange={({ target }) => setSelectedTokenId(target.value)}
        />
        <Button type="submit">Select</Button>
      </Box>
    </form>
  );
};

export default CollectionTokenSelector;
