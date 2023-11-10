import { fileManager } from 'apitoolz';
import { Context, Summary } from 'clean-schema';

import { config } from '@config';

import { InvitationDetailsInput, InvitationDetails } from '../../types';

export { getFolderOnServer, handleFileUpload, handleFailure };

type DetailsCtx = Context<InvitationDetailsInput, InvitationDetails>;
type DetailsSummary = Summary<InvitationDetailsInput, InvitationDetails>;

type FileInputFields = '_governmentID' | '_profilePicture';

const fileInputToOutputMap = {
  _governmentID: 'governmentID',
  _profilePicture: 'profilePicture',
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
  accountId: InvitationDetails['_id'],
  basePath = STATIC_PATH,
) {
  return `${basePath}/files/accounts/${accountId}`;
}

function getPathOnServer(accountId: InvitationDetails['_id'], path: string) {
  return `${getFolderOnServer(accountId)}/${path
    .split(`${getFolderOnServer(accountId, appDomainAddress)}/`)
    .at(-1)}`;
}
