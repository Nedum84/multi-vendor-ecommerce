import { chain, compact } from "lodash";
import sharp from "sharp";
import { bucketName, defaultImageBreakpoints } from "./constants";
import { getImageDimensions, isProcessableImage } from "./image.optimization";
import { MediaFilesAttributes } from "./model.media.files";
import { generateBaseUrl, uploadFile } from "./utils.s3";
import { File, ImageBreakpoints, ImageVariantContent, VideoBreakpoints } from "./types";
import { uploadPath } from "./utils";

export async function createAndUploadVariants(
  file: File,
  fileName: string,
  breakpoints?: ImageBreakpoints | VideoBreakpoints
): Promise<MediaFilesAttributes["variants"]> {
  // IMAGE
  const processableImage = await isProcessableImage(file.data);
  if (processableImage) {
    const imageVariantContents = await createImageVariants({
      file,
      breakpoints,
      fileName,
    });

    if (imageVariantContents.length === 0) return {};

    await Promise.all(
      imageVariantContents.map((content) => uploadFile(content.metadata.key, content.buffer))
    );

    return chain(imageVariantContents)
      .map((content) => [content.variantName, content.metadata])
      .fromPairs()
      .value();
  }

  // VIDEO
  const processableVideo = await Promise.resolve(false);
  if (processableVideo) {
    // TODO: later
  }

  return {};
}

async function createImageVariants(params: {
  file: File;
  fileName: string;
  breakpoints?: ImageBreakpoints;
}): Promise<ImageVariantContent[]> {
  const breakpoints = params.breakpoints ?? defaultImageBreakpoints;
  const originalDimensions = await getImageDimensions(params.file.data);
  const originalWidth = originalDimensions.width;

  if (!originalWidth) return [];

  const variants: ImageVariantContent[] = [];
  for await (let [variantName, width] of Object.entries(breakpoints)) {
    if (!width) continue;
    if (width >= originalWidth) continue; // If original size is same the size I'm converting to

    const variant = await createImageVariant({
      file: params.file,
      fileName: params.fileName,
      maxWidth: width,
      variantName,
    });
    if (variant) {
      variants.push(variant);
    }
  }

  return compact(variants);
}

async function createImageVariant(params: {
  file: File;
  fileName: string;
  maxWidth: number;
  variantName: string;
}): Promise<ImageVariantContent | undefined> {
  const fileName = `${params.variantName}_${params.fileName}`;
  const key = `${uploadPath(fileName)}/${fileName}`;

  const resizedImage = await resizeImage(params.file, params.maxWidth);

  if (resizedImage) {
    return {
      variantName: params.variantName,
      metadata: {
        url: generateBaseUrl(key),
        key,
        bucket: bucketName,
        width: resizedImage.width,
        height: resizedImage.height,
      },
      buffer: resizedImage.buffer,
    };
  }

  return undefined;
}

async function resizeImage(
  file: File,
  maxWidth: number
): Promise<{ buffer: Buffer; width: number; height: number } | undefined> {
  try {
    const buffer = await sharp(file.data)
      .withMetadata()
      .resize({
        width: maxWidth,
        // height: 1200,
        // fit:'contain',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .png({ quality: 80, progressive: true, compressionLevel: 9 })
      .toBuffer();

    if (!buffer) {
      return undefined;
    }

    const { width, height } = await getImageDimensions(buffer);

    return {
      width: width || 0,
      height: height || 0,
      buffer,
    };
  } catch (error) {
    return undefined;
  }
}
