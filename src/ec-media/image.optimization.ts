import sharp, { Metadata } from "sharp";

type SharpImageFormat = NonNullable<Metadata["format"]>;

export const processableImageFormats: SharpImageFormat[] = ["jpeg", "jpg", "png"];

/**
 * Checks if it's image & contains @var processableImageFormats formats
 * @param buffer Buffer
 * @returns boolean
 */
export const isProcessableImage = async (buffer: Buffer): Promise<boolean> => {
  const metadata = await getImageMetadata(buffer);

  return !!metadata?.format && processableImageFormats.includes(metadata?.format);
};

export const getImageDimensions = async (buffer: Buffer) => {
  const metadata = await getImageMetadata(buffer);

  return { width: metadata?.width, height: metadata?.height };
};

export const getImageMetadata = async (buffer: Buffer): Promise<Metadata | undefined> => {
  try {
    const metadata = await sharp(buffer).metadata();

    return metadata;
  } catch (error) {
    // Intentionally ignore errors
    return undefined;
  }
};
