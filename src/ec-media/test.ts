import { MediaType } from "./types";
import mediaFake from "./test.faker";
import { expectSuccess } from "../ec-test-utils/utils";
import { customRequest, testBaseUrl } from "../ec-test-utils/custom.request";
import { resolve } from "path";
import request from "supertest";
import { app } from "../app";
import { MediaFilesAttributes } from "./model.media.files";

export const jpgFilePath = resolve(__dirname, "dummy-files/test_image_1.jpeg");
export const pdfFilePath = resolve(__dirname, "dummy-files/test_pdf_1.pdf");
export const pngFilePath = resolve(__dirname, "dummy-files/test_image_2.png");

describe("Media Tests...", () => {
  // it("Can create folder", async () => {
  //   const payload = mediaFake.createFolder();
  //   const response = await customRequest({
  //     path: `/media/folder`,
  //     method: "post",
  //     payload,
  //   });

  //   expectSuccess(response);
  //   expect(response.body.data.folder.name).toBe(payload.name);
  // });

  it("Can create file(s)", async () => {
    const { tokens } = await global.signin();
    const { folder_id } = await mediaFake.rawCreateFolder();

    const response = await request(app)
      .post(`${testBaseUrl}/media/files`)
      .attach("files", jpgFilePath, { filename: "test_image_1.jpg" })
      .attach("files", pngFilePath, { filename: "test_image_2.png" })
      .attach("files", pdfFilePath, { filename: "test_pdf_1.pdf" })
      .field("folder_id", folder_id)
      .set("Authorization", `Bearer ${tokens.access.token}`);

    console.log(response.body);

    expectSuccess(response);
    expect(response.body.data.length).toBe(3);

    const jpgFile: MediaFilesAttributes = response.body.data[0];
    expect(jpgFile.name).toBe("test_image_1.jpg");
    expect(jpgFile.mime).toBe("image/jpeg");
    expect(jpgFile.width).toBeGreaterThan(0);
    expect(jpgFile.height).toBeGreaterThan(0);
    expect(jpgFile.variants).not.toEqual({});

    const pngFile: MediaFilesAttributes = response.body.data[1];
    expect(pngFile.name).toBe("test_image_2.png");
    expect(pngFile.mime).toBe("image/png");
    expect(pngFile.width).toBeGreaterThan(0);
    expect(pngFile.height).toBeGreaterThan(0);
    expect(pngFile.variants).not.toEqual({});

    const pdfFile: MediaFilesAttributes = response.body.data[2];
    expect(pdfFile.name).toBe("test_pdf_1.pdf");
    expect(pdfFile.mime).toBe("application/pdf");
    expect(pdfFile.width).toBeNull();
    expect(pdfFile.height).toBeNull();
    expect(pdfFile.variants).toEqual({});
  });
  // it("Can update folder", async () => {
  //   const { folder_id } = await mediaFake.rawCreateFolder();

  //   const payload = mediaFake.updateFolder();
  //   const response = await customRequest({
  //     path: `/media/folder/${folder_id}`,
  //     method: "patch",
  //     payload,
  //   });

  //   expectSuccess(response);
  //   expect(response.body.data.folder.name).toBe(payload.name);
  // });

  // it("Can update file", async () => {
  //   const { file_id } = await mediaFake.rawCreateFile();

  //   const payload = mediaFake.updateFolder();
  //   const response = await customRequest({
  //     path: `/media/file/${file_id}`,
  //     method: "patch",
  //     payload,
  //   });

  //   expectSuccess(response);
  //   expect(response.body.data.file.name).toBe(payload.name);
  // });
  // it("Can copy file(s)/folder(s)", async () => {
  //   const { folder_id: folder_id1, name: folderName1 } = await mediaFake.rawCreateFolder();
  //   const { folder_id: folder_id2 } = await mediaFake.rawCreateFolder({ parent_id: folder_id1 });
  //   const { folder_id: folder_id3 } = await mediaFake.rawCreateFolder();

  //   const { file_id: file_id1 } = await mediaFake.rawCreateFile({ folder_id: folder_id1 });
  //   const { file_id: file_id2 } = await mediaFake.rawCreateFile({ folder_id: folder_id1 });
  //   const { file_id: file_id3 } = await mediaFake.rawCreateFile({ folder_id: folder_id2 });
  //   const { file_id: file_id4 } = await mediaFake.rawCreateFile({ folder_id: folder_id2 });
  //   const { file_id: file_id5 } = await mediaFake.rawCreateFile();

  //   /*Home
  //     -->folder_id1
  //     ----->folder_id2
  //     -------->file_id3
  //     -------->file_id4
  //     ----->file_id1
  //     ----->file_id2
  //     -->file_id5
  //     -->folder_id3
  //   */

  //   const response = await customRequest({
  //     path: `/media/copy`,
  //     method: "post",
  //     payload: [
  //       { type: "folder", id: folder_id1, parent_id: folder_id3 },
  //       { type: "file", id: file_id5, parent_id: folder_id3 },
  //     ],
  //   });

  //   //Find children
  //   const { body } = await customRequest(`/media/children/${folder_id3}`);
  //   //find where one of the copied folder name from the children
  //   const findName = body.data.folders.find((f: any) => f.name === folderName1);

  //   expectSuccess(response);
  //   expect(findName.name).toBe(folderName1);
  // });
  // it("Can move file(s)/folder(s)", async () => {
  //   const { folder_id: folder_id1, name: folderName1 } = await mediaFake.rawCreateFolder();
  //   const { folder_id: folder_id2 } = await mediaFake.rawCreateFolder({ parent_id: folder_id1 });
  //   const { folder_id: folder_id3 } = await mediaFake.rawCreateFolder();

  //   const { file_id: file_id1 } = await mediaFake.rawCreateFile({ folder_id: folder_id1 });
  //   const { file_id: file_id2 } = await mediaFake.rawCreateFile({ folder_id: folder_id1 });
  //   const { file_id: file_id3 } = await mediaFake.rawCreateFile({ folder_id: folder_id2 });
  //   const { file_id: file_id4 } = await mediaFake.rawCreateFile({ folder_id: folder_id2 });
  //   const { file_id: file_id5 } = await mediaFake.rawCreateFile();

  //   /*Home
  //     -->folder_id1
  //     ----->folder_id2
  //     -------->file_id3
  //     -------->file_id4
  //     ----->file_id1
  //     ----->file_id2
  //     -->file_id5
  //     -->folder_id3
  //   */

  //   const response = await customRequest({
  //     path: `/media/move`,
  //     method: "post",
  //     payload: [
  //       { type: "folder", id: folder_id1, parent_id: folder_id3 },
  //       { type: "file", id: file_id5, parent_id: folder_id3 },
  //     ],
  //   });

  //   //Find children
  //   const { body } = await customRequest(`/media/children/${folder_id3}`);

  //   //find where one of the copied folder name from the children
  //   const findName = body.data.folders.find((f: any) => f.name === folderName1);

  //   expectSuccess(response);
  //   expect(findName.name).toBe(folderName1);
  // });
  // it("Can delete folder", async () => {
  //   const { folder_id } = await mediaFake.rawCreateFolder();

  //   const response = await customRequest({
  //     path: `/media/folder/${folder_id}`,
  //     method: "delete",
  //   });

  //   expectSuccess(response);
  //   expect(response.body.data).toBeTruthy();
  // });
  // it("Can delete file", async () => {
  //   const { file_id } = await mediaFake.rawCreateFile();

  //   const response = await customRequest({
  //     path: `/media/file/${file_id}`,
  //     method: "delete",
  //   });

  //   expectSuccess(response);
  //   expect(response.body.data).toBeTruthy();
  // });
  // it("Can find home file(s)/folder(s)", async () => {
  //   const { folder_id: folder_id1, name: folderName1 } = await mediaFake.rawCreateFolder();
  //   const { name: folderName3 } = await mediaFake.rawCreateFolder();

  //   const { name: fileName1 } = await mediaFake.rawCreateFile({ folder_id: null });

  //   const response1 = await customRequest(`/media/home?perPage=${1000}`);
  //   const response2 = await customRequest(
  //     `/media/home?media_type=${MediaType.FOLDER}&perPage=${1000}`
  //   );
  //   const response3 = await customRequest(
  //     `/media/home?media_type=${MediaType.FILE}&perPage=${1000}`
  //   );

  //   //find where one of the copied folder name from the children
  //   const findFolderName1 = response1.body.data.folders.find((f: any) => f.name === folderName1);
  //   const findFolderId1 = response1.body.data.folders.find((f: any) => f.folder_id === folder_id1);
  //   const findFolderName3 = response2.body.data.folders.find((f: any) => f.name === folderName3);
  //   const findFileName1 = response3.body.data.files.find((f: any) => f.name === fileName1);

  //   expectSuccess(response1);
  //   expectSuccess(response2);
  //   expectSuccess(response3);
  //   expect(findFolderName1.name).toBe(folderName1);
  //   expect(findFolderId1.folder_id).toBe(folder_id1);
  //   expect(findFolderName3.name).toBe(folderName3);
  //   expect(findFileName1.name).toBe(fileName1);
  // });

  // it("Can find folder file(s)/folder(s)", async () => {
  //   const { folder_id: folder_id1 } = await mediaFake.rawCreateFolder();
  //   const { folder_id: folder_id2 } = await mediaFake.rawCreateFolder({ parent_id: folder_id1 });
  //   const { folder_id: folder_id3 } = await mediaFake.rawCreateFolder({ parent_id: folder_id1 });

  //   const { file_id: file_id1 } = await mediaFake.rawCreateFile({ folder_id: folder_id1 });

  //   const response1 = await customRequest(`/media/folder/${folder_id1}`);
  //   const response2 = await customRequest(
  //     `/media/folder/${folder_id1}?media_type=${MediaType.FOLDER}`
  //   );
  //   const response3 = await customRequest(
  //     `/media/folder/${folder_id1}?media_type=${MediaType.FILE}`
  //   );

  //   //find where one of the copied folder name from the children
  //   const findFolderId2 = response1.body.data.folders.find((f: any) => f.folder_id === folder_id2);
  //   const findFolderId3 = response2.body.data.folders.find((f: any) => f.folder_id === folder_id3);
  //   const findFileId1 = response3.body.data.files.find((f: any) => f.file_id === file_id1);

  //   expectSuccess(response1);
  //   expectSuccess(response2);
  //   expectSuccess(response3);
  //   expect(findFolderId2.folder_id).toBe(folder_id2);
  //   expect(findFolderId3.folder_id).toBe(folder_id3);
  //   expect(findFileId1.file_id).toBe(file_id1);
  // });
  // it("Can find nested folder(s)/file(s)", async () => {
  //   const { folder_id: folder_id1 } = await mediaFake.rawCreateFolder();
  //   const { folder_id: folder_id2 } = await mediaFake.rawCreateFolder({ parent_id: folder_id1 });

  //   await mediaFake.rawCreateFile({ folder_id: folder_id1 });
  //   await mediaFake.rawCreateFile({ folder_id: folder_id2 });

  //   const response1 = await customRequest(`/media/folder/nested`);
  //   const response2 = await customRequest(`/media/folder/nested?folder_id=${folder_id1}`);
  //   const response3 = await customRequest(
  //     `/media/folder/nested?folder_id=${folder_id1}&include_files=${true}`
  //   );

  //   expectSuccess(response1);
  //   expectSuccess(response2);
  //   expectSuccess(response3);
  //   expect(response1.body.data.folders.length).toBeGreaterThan(0);
  //   expect(response2.body.data.folders.length).toBeGreaterThan(0);
  //   expect(response3.body.data.folders.length).toBeGreaterThan(0);
  //   expect(response3.body.data.folders[0].files.length).toBeGreaterThan(0);
  // });
  // it("Can find parent folders", async () => {
  //   const { folder_id: folder_id1, name: folderName1 } = await mediaFake.rawCreateFolder();
  //   const { folder_id: folder_id2 } = await mediaFake.rawCreateFolder({ parent_id: folder_id1 });
  //   const { folder_id: folder_id3 } = await mediaFake.rawCreateFolder({ parent_id: folder_id2 });

  //   const response = await customRequest(`/media/parent/${folder_id3}`);
  //   //find where one of the parent folder name from the children
  //   const findName = response.body.data.folders.find((f: any) => f.name === folderName1);

  //   expectSuccess(response);
  //   expect(findName.name).toBe(folderName1);
  //   expect(response.body.data.folders.length).toBeGreaterThan(0);
  // });
  // it("Can find children folders", async () => {
  //   const { folder_id: folder_id1 } = await mediaFake.rawCreateFolder();
  //   const { folder_id: folder_id2 } = await mediaFake.rawCreateFolder({ parent_id: folder_id1 });
  //   const { name: folderName3 } = await mediaFake.rawCreateFolder({ parent_id: folder_id2 });

  //   const response = await customRequest(`/media/children/${folder_id1}`);

  //   //find where one of the children folder name from the children
  //   const findName = response.body.data.folders.find((f: any) => f.name === folderName3);

  //   expectSuccess(response);
  //   expect(findName.name).toBe(folderName3);
  //   expect(response.body.data.folders.length).toBeGreaterThan(0);
  // });
});
