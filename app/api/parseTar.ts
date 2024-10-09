export default function parseTar(input: Uint8Array, onFile: (file: TarFile<Uint8Array<ArrayBufferLike>>) => void, onCompletion?: () => void) {
    const noOfBlocks = input.byteLength / 512;
    {
        let blockIdx = 0;
        while (blockIdx < noOfBlocks) {
            const block = input.slice(blockIdx * 512, (blockIdx + 1) * 512);
            if (isEmptyBlock(block)) break;
            const file = parseTarHeader<Uint8Array>(block.buffer);
            const fileBlocksCount = Math.ceil(file.size / 512);
            file.contents = input.slice((blockIdx + 1) * 512, (blockIdx + 1 + fileBlocksCount) * 512).slice(0, file.size);
            onFile(file);
            blockIdx += fileBlocksCount + 1;
        }

        onCompletion?.();
    }
}
function isEmptyBlock(block: Blob): Promise<boolean>;
function isEmptyBlock(block: Uint8Array): boolean;
function isEmptyBlock(block: Blob | Uint8Array) {
    if (block instanceof Blob)
        return block
            .arrayBuffer()
            .then((val) => new Uint8Array(val))
            .then((buf) => buf.every((val) => val === 0));
    return block.every((val) => val === 0);
}
// https://en.wikipedia.org/wiki/Tar_(computing)#Header
export const enum TarFileType {
    NormalFile = 0,
    HardLink = 1,
    SymbolicLink = 2,
    CharacterSpecial = 3,
    BlockSpecial = 4,
    Directory = 5,
    NamedFIFOPipe = 6,
    ContiguousFile = 7,
    Vendor = 'vendor'
}
export class TarFile<T extends Blob | Uint8Array> {
    name: string = '';
    mode: number = 0;
    uid: number = 0;
    gid: number = 0;
    size: number = 0;
    mtime: Date = new Date(0);
    type: TarFileType = TarFileType.NormalFile;
    linkname: string = '';
    contents?: T;
    uname: string = '';
    gname: string = '';
    deviceMajor: number = 0;
    deviceMinor: number = 0;
    fileNamePrefix: string = '';
}
let ustarWarned = false;
function parseTarHeader<T extends Blob | Uint8Array>(header: ArrayBuffer) {
    const file = new TarFile<T>();
    file.name = readString(0, 100);
    file.mode = readOctal(100, 8);
    file.uid = readOctal(108, 8);
    file.gid = readOctal(116, 8);
    file.size = readOctal(124, 12);
    file.mtime = new Date(readOctal(136, 12) * 1000);
    const checksum = readString(148, 8);
    const ftype = readString(156, 1);
    if (ftype)
        if (ftype.charCodeAt(0) >= 48 && ftype.charCodeAt(0) <= 57) file.type = ftype.charCodeAt(0);
        else file.type = TarFileType.Vendor;
    else file.type = TarFileType.NormalFile;
    file.linkname = readString(157, 100);

    const ustarIndicator = readString(257, 6);
    if (ustarIndicator === 'ustar') {
        file.uname = readString(265, 32);
        file.gname = readString(297, 32);
        file.deviceMajor = readOctal(329, 8);
        file.deviceMinor = readOctal(337, 8);
        file.fileNamePrefix = readString(345, 155);
    } else if (!ustarWarned) {
        console.warn('No Ustar indicator detected in tar file');
        ustarWarned = true;
    }
    return file;
    function readString(start: number = 0, size?: number) {
        const decoder = new TextDecoder('ascii');
        let buf = new Uint8Array(header.slice(start, size ? start + size : undefined));
        const nullIdx = buf.indexOf(0);
        buf = buf.slice(0, nullIdx);
        return decoder.decode(buf);
    }
    function readOctal(start: number = 0, end?: number) {
        return parseInt(readString(start, end), 8);
    }
}
