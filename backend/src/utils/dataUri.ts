/* import DataURIParser from "datauri/parser";
import path from "node:path";

const getDataUri = (file: any) => {
    const parser = new DataURIParser();
    const extName = path.extname(file.originalname).toString();
    console.log(extName);
    return parser.format(extName, file.buffer);
}

export default getDataUri; */