declare module 'pdfjs-dist/build/pdf.mjs' {
    export interface PDFDocumentLoadingTask {
        promise: Promise<PDFDocumentProxy>;
    }

    export interface PDFDocumentProxy {
        numPages: number;
        getPage(pageNumber: number): Promise<PDFPageProxy>;
    }

    export interface PDFPageProxy {
        getTextContent(): Promise<TextContent>;
    }

    export interface TextContent {
        items: TextItem[];
    }

    export interface TextItem {
        str: string;
    }

    export interface GetDocumentOptions {
        data: Uint8Array;
        useSystemFonts?: boolean;
        verbosity?: number;
    }

    export function getDocument(src: GetDocumentOptions | string | ArrayBuffer): PDFDocumentLoadingTask;
}
