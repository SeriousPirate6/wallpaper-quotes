const { authenticate } = require("./methods/authenticate");
const { getAllIdsWithToken } = require("./methods/getAllIdsWithToken");
const { createFolder } = require("./methods/createFolder");
const { delItem, deleteItems } = require("./methods/deleteItems");
const { uploadFile } = require("./methods/uploadFile");
const { updateFileParent } = require("./methods/updateFileParent");
const { shareFile, revokeSharePermission } = require("./methods/shareFile");
const { remainingSpace } = require("./methods/remainingSpace");
const { getPropsFromFile } = require("./methods/getPropsFromId");
const {
  nameToFileId,
  nameToFolderId,
  idToName,
} = require("./methods/getNameOrId");

module.exports = {
  DriveService: class DriveService {
    authenticate = async () => {
      this.auth = await authenticate();
    };

    remainingSpace = async ({ print = false }) => {
      return await remainingSpace({ auth: this.auth, print });
    };

    getAllIdsWithToken = async ({
      query = false,
      fields = false,
      orderBy = false,
    }) => {
      return await getAllIdsWithToken({
        auth: this.auth,
        query,
        fields,
        orderBy,
      });
    };

    nameToFileId = async ({ fileName, contains = false, folder = false }) => {
      return await nameToFileId({
        auth: this.auth,
        fileName,
        contains,
        folder,
      });
    };

    nameToFolderId = async ({ folderName, contains = false }) => {
      return await nameToFolderId({ auth: this.auth, folderName, contains });
    };

    idToName = async ({ fileId }) => {
      return await idToName({ auth: this.auth, fileId });
    };

    getPropsFromFile = async ({ fileId }) => {
      return await getPropsFromFile({ auth: this.auth, fileId });
    };

    createFolder = async ({ folderName, parentId = false }) => {
      return await createFolder({ auth: this.auth, folderName, parentId });
    };

    delItem = async ({ fileId }) => {
      return await delItem({ auth: this.auth, fileId });
    };

    deleteItems = async ({ ids }) => {
      return await deleteItems({ auth: this.auth, ids });
    };

    uploadFile = async ({
      fileName,
      description,
      file_props,
      parentFolder = null,
    }) => {
      return await uploadFile({
        auth: this.auth,
        fileName,
        description,
        file_props,
        parentFolder,
      });
    };

    updateFileParent = async ({ fileId, newParentId }) => {
      return await updateFileParent({ auth: this.auth, fileId, newParentId });
    };

    shareFile = async ({ fileId }) => {
      return await shareFile({ auth: this.auth, fileId });
    };

    revokeSharePermission = async ({ fileId, permissionId }) => {
      return await revokeSharePermission({
        auth: this.auth,
        fileId,
        permissionId,
      });
    };
  },
};
