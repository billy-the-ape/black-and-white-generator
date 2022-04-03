import { Autocomplete, Box, Button, TextField } from "@mui/material";
import { FormEventHandler, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { parseQuery, updateQueryParam } from "./util/parseQuery";

type CollectionItem = { label?: string; value: string; icon?: string };

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const IPFS_REGEX = /^ipfs:\/\/(.*)/;

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

const INITIAL_VALUES = parseQuery();

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
  const [addressError, setAddressError] = useState(false);
  const [address, setAddress] = useState(INITIAL_VALUES.wallet ?? "");
  const [tokenIds, setTokenIds] = useState<CollectionItem[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

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

    const { name, image_original_url, image_url, asset_contract } = await fetch(
      `https://api.opensea.io/api/v1/asset/${selectedCollection.value}/${selectedTokenId}/?include_orders=false`
    ).then((r) => r.json());

    let url = image_original_url ?? image_url;

    const ipfsMatch = IPFS_REGEX.exec(url);

    if (ipfsMatch) {
      url = `https://ipfs.io/ipfs/${ipfsMatch[1]}`;
    }

    const file = await fetch(url)
      .then((res) => res.blob())
      .then((blob) => window.URL.createObjectURL(blob));

    const img = new Image();
    img.src = file;
    img.id = "i" + String(Date.now());
    img.alt = name;

    img.onload = () => {
      onSelectionLoaded(img);
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

  const fetchUserTokens = async (walletAddress: string) => {
    setAddress(walletAddress);
    if (!ETH_ADDRESS_REGEX.test(walletAddress)) {
      setAddressError(true);
      return;
    }
    updateQueryParam("wallet", walletAddress);
    setAddressError(false);
    const result = await fetch(
      `https://api.opensea.io/api/v1/collections?asset_owner=${walletAddress}&offset=0&limit=300`
    )
      .then((r) => r.json())
      .then(
        (r) =>
          r
            .reduce(
              (
                acc: CollectionItem[],
                { primary_asset_contracts, name, hidden }: any
              ) => {
                if (primary_asset_contracts.length && !hidden)
                  acc.push({
                    label: name,
                    value: primary_asset_contracts[0].address,
                  });
                return acc;
              },
              []
            )
            .sort((a: CollectionItem, b: CollectionItem) =>
              a.label!.localeCompare(b.label!)
            ) as CollectionItem[]
      );
    setSavedCollections(result);
  };

  const fetchWalletAssets = async (tokenAddress: string) => {
    if (
      !ETH_ADDRESS_REGEX.test(tokenAddress) ||
      !ETH_ADDRESS_REGEX.test(address)
    ) {
      return;
    }
    setLoadingTokens(true);
    setSelectedTokenId("");
    const result = await fetch(
      `https://api.opensea.io/api/v1/assets?owner=${address}&asset_contract_address=${tokenAddress}&include_orders=false`
    )
      .then((r) => r.json())
      .then(
        (r: { assets: { token_id: string }[] }) =>
          r?.assets
            ?.map(
              ({ token_id, image_thumbnail_url }: any = {}) =>
                ({
                  value: token_id,
                  icon: image_thumbnail_url,
                } as CollectionItem)
            )
            .sort((a, b) => Number(a.value) - Number(b.value)) ?? []
      );

    setTokenIds(result);
    setLoadingTokens(false);
  };

  return (
    <form onSubmit={fetchTokenImage}>
      <TextField
        label="Wallet"
        value={address}
        onChange={({ target }) => fetchUserTokens(target.value)}
        error={addressError}
        sx={{ width: "100%", mb: 2 }}
      />
      <Box display="flex" mb={3}>
        <Autocomplete
          freeSolo
          autoSelect
          options={savedCollections}
          sx={{ width: 300, mr: 2 }}
          value={selectedCollection}
          onChange={async (_, newValue) => {
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
              if (newValue) {
                await fetchWalletAssets(newValue.value);
              }
            }
          }}
          renderInput={(params) => (
            <TextField {...params} error={collectionError} label="Collection" />
          )}
        />
        <Autocomplete
          freeSolo
          autoSelect
          options={loadingTokens ? [] : tokenIds}
          sx={{ width: 100, mr: 2 }}
          loading={loadingTokens}
          value={selectedTokenId}
          onChange={(_, val) =>
            setSelectedTokenId(typeof val === "string" ? val : val?.value ?? "")
          }
          renderInput={(params) => (
            <TextField {...params} error={tokenError} label="Token ID" />
          )}
          renderOption={(props, option) => (
            <Box
              component="li"
              sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
              {...props}
            >
              <img loading="lazy" width="30" src={option.icon} alt="" />
              {option.value}
            </Box>
          )}
        />
        <Button type="submit">Select</Button>
      </Box>
    </form>
  );
};

export default CollectionTokenSelector;
