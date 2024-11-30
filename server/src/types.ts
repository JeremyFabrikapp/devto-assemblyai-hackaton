export type FileBody = string | ArrayBuffer | ArrayBufferView | Blob | Buffer | File | FormData | NodeJS.ReadableStream | ReadableStream<any> | URLSearchParams
export type FileType = "image" | "audio" | undefined;
export interface WhatsAppMedia {
    url: string;
    mime_type: string;
    sha256: string;
    file_size: number;
    id: string;
    messaging_product: string;
}
