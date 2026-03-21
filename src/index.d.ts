export type FontEntry = [name: string, data: Uint8Array | ArrayBufferLike];

export interface PdfOptions {
  pageSize?: [number, number];
  margins?: [number, number, number, number];
  resources?: Record<string, Uint8Array | ArrayBufferLike>;
  userStyle?: string;
  baseUrl?: string;
}

export interface ImageOptions {
  format?: "png" | "jpeg" | "webp";
  width?: number;
  height?: number;
  quality?: number;
  pageSize?: [number, number];
  margins?: [number, number, number, number];
  resources?: Record<string, Uint8Array | ArrayBufferLike>;
  userStyle?: string;
  baseUrl?: string;
}

export interface Book {
  pdf(html: string, options?: PdfOptions): Uint8Array;
  image(html: string, options?: ImageOptions): Uint8Array;
}

export interface CreateBookOptions {
  fonts?: FontEntry[];
}

export declare function createBook(options?: CreateBookOptions): Promise<Book>;

export declare const PageSize: {
  A3: [number, number];
  A4: [number, number];
  A5: [number, number];
  B4: [number, number];
  B5: [number, number];
  Letter: [number, number];
  Legal: [number, number];
  Ledger: [number, number];
};

export declare const Margins: {
  None: [number, number, number, number];
  Narrow: [number, number, number, number];
  Normal: [number, number, number, number];
  Moderate: [number, number, number, number];
  Wide: [number, number, number, number];
};
