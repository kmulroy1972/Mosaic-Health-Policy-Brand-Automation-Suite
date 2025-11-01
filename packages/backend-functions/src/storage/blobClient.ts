import type { InvocationContext } from '@azure/functions';
import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

/**
 * Azure Blob Storage client management
 */

let blobServiceClient: BlobServiceClient | null = null;
let containerClient: ContainerClient | null = null;

/**
 * Get or create Blob Service Client
 */
export function getBlobServiceClient(): BlobServiceClient {
  if (blobServiceClient) {
    return blobServiceClient;
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (connectionString) {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  } else if (accountName) {
    // Use managed identity
    const credential = new DefaultAzureCredential();
    blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      credential
    );
  } else {
    throw new Error(
      'Azure Storage not configured. Set AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_NAME.'
    );
  }

  return blobServiceClient;
}

/**
 * Get container client for MHP assets
 */
export async function getContainerClient(
  containerName: string = 'mhp-assets',
  context?: InvocationContext
): Promise<ContainerClient> {
  if (containerClient && containerClient.containerName === containerName) {
    return containerClient;
  }

  const serviceClient = getBlobServiceClient();
  const container = serviceClient.getContainerClient(containerName);

  // Create container if it doesn't exist
  try {
    await container.createIfNotExists();
    if (context) {
      context.log(`Blob storage container '${containerName}' ready`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (context) {
      context.error(`Failed to create/get container '${containerName}': ${errorMessage}`);
    }
    throw new Error(`Failed to create/get container '${containerName}': ${errorMessage}`);
  }

  containerClient = container;
  return container;
}

/**
 * Upload a blob
 */
export async function uploadBlob(
  containerName: string,
  blobName: string,
  content: Buffer | string,
  contentType?: string,
  context?: InvocationContext
): Promise<{ url: string; blobName: string }> {
  const container = await getContainerClient(containerName, context);
  const blockBlobClient = container.getBlockBlobClient(blobName);

  const contentBuffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;

  await blockBlobClient.uploadData(contentBuffer, {
    blobHTTPHeaders: {
      blobContentType: contentType || 'application/octet-stream'
    }
  });

  if (context) {
    context.log(`Blob uploaded: ${blobName}`, { size: contentBuffer.length });
  }

  return {
    url: blockBlobClient.url,
    blobName
  };
}

/**
 * Download a blob
 */
export async function downloadBlob(
  containerName: string,
  blobName: string,
  context?: InvocationContext
): Promise<Buffer> {
  const container = await getContainerClient(containerName, context);
  const blockBlobClient = container.getBlockBlobClient(blobName);

  const response = await blockBlobClient.download(0);
  const chunks: Buffer[] = [];

  if (!response.readableStreamBody) {
    throw new Error(`Failed to download blob: ${blobName}`);
  }

  for await (const chunk of response.readableStreamBody) {
    chunks.push(Buffer.from(chunk));
  }

  const buffer = Buffer.concat(chunks);

  if (context) {
    context.log(`Blob downloaded: ${blobName}`, { size: buffer.length });
  }

  return buffer;
}

/**
 * Delete a blob
 */
export async function deleteBlob(
  containerName: string,
  blobName: string,
  context?: InvocationContext
): Promise<void> {
  const container = await getContainerClient(containerName, context);
  const blockBlobClient = container.getBlockBlobClient(blobName);

  await blockBlobClient.delete();

  if (context) {
    context.log(`Blob deleted: ${blobName}`);
  }
}

/**
 * List blobs in container
 */
export async function listBlobs(
  containerName: string,
  prefix?: string,
  context?: InvocationContext
): Promise<Array<{ name: string; size: number; lastModified: Date }>> {
  const container = await getContainerClient(containerName, context);
  const blobs: Array<{ name: string; size: number; lastModified: Date }> = [];

  for await (const blob of container.listBlobsFlat({ prefix })) {
    blobs.push({
      name: blob.name,
      size: blob.properties.contentLength || 0,
      lastModified: blob.properties.lastModified || new Date()
    });
  }

  if (context) {
    context.log(`Listed blobs in '${containerName}'`, { count: blobs.length, prefix });
  }

  return blobs;
}
