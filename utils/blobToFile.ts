
export default function blobToFile(theBlob: Blob, fileName: string): File {
    const b: any = theBlob
    //A Blob() is almost a File() - it's just missing th two properties below
    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return b as File
}