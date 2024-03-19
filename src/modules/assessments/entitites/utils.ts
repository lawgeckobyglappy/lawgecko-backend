import { fileManager } from 'apitoolz';
import { Context, Summary } from 'clean-schema';
import { AssessmentInput, Assessment } from '../types';
import { config } from '@config';

export { handleFileUpload, handleFailure, getFolderOnServer };

type DetailsSummary = Summary<AssessmentInput, Assessment>;
type DetailsCtx = Context<AssessmentInput, Assessment>;

type FileInputFields = '_image';

const fileInputToOutputMap = {
  _image: 'image',
} as const;

const appDomainAddress = `localhost:${config.port}`,
  STATIC_PATH = config.STATIC_PATH;

function handleFileUpload(inputField: FileInputFields) {
  return ({ context, previousValues }: DetailsSummary) => {
    const { _id, [inputField]: fileInfo } = context,
      outputField = fileInputToOutputMap[inputField];

    if (config.currentDeployment.isTest) return fileInfo;

    // prepare storage(remote/local) location
    const path = fileInfo.path,
      filename = path.split('/').at(-1),
      newPath = `${getFolderOnServer(_id)}/${filename}`;

    // upload to cloud
    fileManager.cutFile(path, newPath);

    // delete previous file if available
    if (previousValues?.[outputField])
      fileManager.deleteFile(getPathOnServer(_id, previousValues[outputField]));

    //  return sanitized values
    return {
      ...fileInfo,
      path: `${getFolderOnServer(_id, appDomainAddress)}/${filename}`,
    };
  };
}

function handleFailure(inputField: FileInputFields) {
  return (context: DetailsCtx) => {
    const fileInfo = context[inputField];

    fileManager.deleteFile(fileInfo.path);
  };
}

function getFolderOnServer(
  assessmentId: Assessment['_id'],
  basePath = STATIC_PATH,
) {
  return `${basePath}/files/assessments/${assessmentId}`;
}

function getPathOnServer(assessmentId: Assessment['_id'], path: string) {
  return `${getFolderOnServer(assessmentId)}/${path
    .split(`${getFolderOnServer(assessmentId, appDomainAddress)}/`)
    .at(-1)}`;
}
