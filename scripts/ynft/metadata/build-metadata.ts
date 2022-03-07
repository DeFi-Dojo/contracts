/* eslint-disable import/prefer-default-export */
type BuildMetadataProps = {
  name: string;
  description: string;
  imageBaseUri: string;
  imagePathUri?: string;
  platform: string;
  pool: string;
};

export const buildMetadata = ({
  name,
  description,
  imageBaseUri,
  imagePathUri,
  platform,
  pool,
}: BuildMetadataProps) => ({
  name,
  description,
  image: imageBaseUri + imagePathUri,
  properties: {
    platform: {
      name: "Platform",
      value: platform,
    },
    pool: {
      name: "Pool",
      value: pool,
    },
  },
});
