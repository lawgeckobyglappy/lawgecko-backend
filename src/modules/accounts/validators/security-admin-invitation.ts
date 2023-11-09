export { validateGovernmentID, validateProfilePicture };

const acceptedFormats = ['jpg', 'jpeg', 'png', 'webp'];
const GOVERNMENTID_MAX_SIZE = 5 * 1024 * 1024;
const PROFILEPICTURE_MAX_SIZE = 5 * 1024 * 1024;

function validateGovernmentID(val: any) {
  return validateFile(val, GOVERNMENTID_MAX_SIZE);
}

function validateProfilePicture(val: any) {
  return validateFile(val, PROFILEPICTURE_MAX_SIZE);
}

function validateFile(val: any, maxSize: number) {
  const extension = val?.mimetype.split('/').at(-1);

  if (!acceptedFormats.includes(extension))
    return { valid: false, reason: 'Wrong Extension' };

  if (val?.size > maxSize)
    return { valid: false, reason: 'Maximum File Size Exceeded' };

  return true;
}
