import { CREATED } from "http-status";
import { MediaType } from "../../src/enum/media.enum";
import mediaFake from "../factories/media.fake";
import { expectSuccess } from "../testing.utils";

const request = global.buildRequest;
beforeAll(async () => {});

describe("Media Tests...", () => {
  it("Can create folder", async () => {
    const payload = mediaFake.createFolder();
    const response = await request({
      path: `/media/folder`,
      method: "post",
      payload,
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.folder.name).toBe(payload.name);
  });

  it("Can create file", async () => {
    const payload = mediaFake.createFile();
    const response = await request({
      path: `/media/file`,
      method: "post",
      payload,
    });

    expectSuccess(response, CREATED);
    expect(response.body.data.file.name).toBe(payload.name);
  });
  it("Can update folder", async () => {
    const { folder_id } = await mediaFake.rawCreateFolder();

    const payload = mediaFake.updateFolder();
    const response = await request({
      path: `/media/folder/${folder_id}`,
      method: "patch",
      payload,
    });

    expectSuccess(response);
    expect(response.body.data.folder.name).toBe(payload.name);
  });

  it("Can update file", async () => {
    const { file_id } = await mediaFake.rawCreateFile();

    const payload = mediaFake.updateFolder();
    const response = await request({
      path: `/media/file/${file_id}`,
      method: "patch",
      payload,
    });

    expectSuccess(response);
    expect(response.body.data.file.name).toBe(payload.name);
  });
  it("Can copy file(s)/folder(s)", async () => {
    const { folder_id: folder_id1, name: folderName1 } = await mediaFake.rawCreateFolder();
    const { folder_id: folder_id2 } = await mediaFake.rawCreateFolder({ parent_id: folder_id1 });
    const { folder_id: folder_id3 } = await mediaFake.rawCreateFolder();

    const { file_id: file_id1 } = await mediaFake.rawCreateFile({ folder_id: folder_id1 });
    const { file_id: file_id2 } = await mediaFake.rawCreateFile({ folder_id: folder_id1 });
    const { file_id: file_id3 } = await mediaFake.rawCreateFile({ folder_id: folder_id2 });
    const { file_id: file_id4 } = await mediaFake.rawCreateFile({ folder_id: folder_id2 });
    const { file_id: file_id5 } = await mediaFake.rawCreateFile();

    /*Home
      -->folder_id1
      ----->folder_id2
      -------->file_id3
      -------->file_id4
      ----->file_id1
      ----->file_id2
      -->file_id5
      -->folder_id3
    */

    const response = await request({
      path: `/media/copy`,
      method: "post",
      payload: [
        { type: "folder", id: folder_id1, parent_id: folder_id3 },
        { type: "file", id: file_id5, parent_id: folder_id3 },
      ],
    });

    //Find children
    const { body } = await request(`/media/children/${folder_id3}`);
    //find where one of the copied folder name from the children
    const findName = body.data.folders.find((f: any) => f.name === folderName1);

    expectSuccess(response);
    expect(findName.name).toBe(folderName1);
  });
  it("Can move file(s)/folder(s)", async () => {
    const { folder_id: folder_id1, name: folderName1 } = await mediaFake.rawCreateFolder();
    const { folder_id: folder_id2 } = await mediaFake.rawCreateFolder({ parent_id: folder_id1 });
    const { folder_id: folder_id3 } = await mediaFake.rawCreateFolder();

    const { file_id: file_id1 } = await mediaFake.rawCreateFile({ folder_id: folder_id1 });
    const { file_id: file_id2 } = await mediaFake.rawCreateFile({ folder_id: folder_id1 });
    const { file_id: file_id3 } = await mediaFake.rawCreateFile({ folder_id: folder_id2 });
    const { file_id: file_id4 } = await mediaFake.rawCreateFile({ folder_id: folder_id2 });
    const { file_id: file_id5 } = await mediaFake.rawCreateFile();

    /*Home
      -->folder_id1
      ----->folder_id2
      -------->file_id3
      -------->file_id4
      ----->file_id1
      ----->file_id2
      -->file_id5
      -->folder_id3
    */

    const response = await request({
      path: `/media/move`,
      method: "post",
      payload: [
        { type: "folder", id: folder_id1, parent_id: folder_id3 },
        { type: "file", id: file_id5, parent_id: folder_id3 },
      ],
    });

    //Find children
    const { body } = await request(`/media/children/${folder_id3}`);

    //find where one of the copied folder name from the children
    const findName = body.data.folders.find((f: any) => f.name === folderName1);

    expectSuccess(response);
    expect(findName.name).toBe(folderName1);
  });
  it("Can delete folder", async () => {
    const { folder_id } = await mediaFake.rawCreateFolder();

    const response = await request({
      path: `/media/folder/${folder_id}`,
      method: "delete",
    });

    expectSuccess(response);
    expect(response.body.data).toBeTruthy();
  });
  it("Can delete file", async () => {
    const { file_id } = await mediaFake.rawCreateFile();

    const response = await request({
      path: `/media/file/${file_id}`,
      method: "delete",
    });

    expectSuccess(response);
    expect(response.body.data).toBeTruthy();
  });
  it("Can find home file(s)/folder(s)", async () => {
    const { folder_id: folder_id1, name: folderName1 } = await mediaFake.rawCreateFolder();
    const { name: folderName3 } = await mediaFake.rawCreateFolder();

    const { name: fileName1 } = await mediaFake.rawCreateFile({ folder_id: null });

    const response1 = await request(`/media/home?limit=${100}`);
    const response2 = await request(`/media/home?media_type=${MediaType.FOLDER}&limit=${100}`);
    const response3 = await request(`/media/home?media_type=${MediaType.FILE}&limit=${100}`);

    //find where one of the copied folder name from the children
    const findFolderName1 = response1.body.data.folders.find((f: any) => f.name === folderName1);
    const findFolderId1 = response1.body.data.folders.find((f: any) => f.folder_id === folder_id1);
    const findFolderName3 = response2.body.data.folders.find((f: any) => f.name === folderName3);
    const findFileName1 = response3.body.data.files.find((f: any) => f.name === fileName1);

    expectSuccess(response1);
    expectSuccess(response2);
    expectSuccess(response3);
    expect(findFolderName1.name).toBe(folderName1);
    expect(findFolderId1.folder_id).toBe(folder_id1);
    expect(findFolderName3.name).toBe(folderName3);
    expect(findFileName1.name).toBe(fileName1);
  });

  it("Can find folder file(s)/folder(s)", async () => {
    const { folder_id: folder_id1 } = await mediaFake.rawCreateFolder();
    const { folder_id: folder_id2 } = await mediaFake.rawCreateFolder({ parent_id: folder_id1 });
    const { folder_id: folder_id3 } = await mediaFake.rawCreateFolder({ parent_id: folder_id1 });

    const { file_id: file_id1 } = await mediaFake.rawCreateFile({ folder_id: folder_id1 });

    const response1 = await request(`/media/folder/${folder_id1}`);
    const response2 = await request(`/media/folder/${folder_id1}?media_type=${MediaType.FOLDER}`);
    const response3 = await request(`/media/folder/${folder_id1}?media_type=${MediaType.FILE}`);

    //find where one of the copied folder name from the children
    const findFolderId2 = response1.body.data.folders.find((f: any) => f.folder_id === folder_id2);
    const findFolderId3 = response2.body.data.folders.find((f: any) => f.folder_id === folder_id3);
    const findFileId1 = response3.body.data.files.find((f: any) => f.file_id === file_id1);

    expectSuccess(response1);
    expectSuccess(response2);
    expectSuccess(response3);
    expect(findFolderId2.folder_id).toBe(folder_id2);
    expect(findFolderId3.folder_id).toBe(folder_id3);
    expect(findFileId1.file_id).toBe(file_id1);
  });
  it("Can find nested folder(s)/file(s)", async () => {
    const { folder_id: folder_id1 } = await mediaFake.rawCreateFolder();
    const { folder_id: folder_id2 } = await mediaFake.rawCreateFolder({ parent_id: folder_id1 });

    await mediaFake.rawCreateFile({ folder_id: folder_id1 });
    await mediaFake.rawCreateFile({ folder_id: folder_id2 });

    const response1 = await request(`/media/folder/nested`);
    const response2 = await request(`/media/folder/nested?folder_id=${folder_id1}`);
    const response3 = await request(`/media/folder/nested?folder_id=${folder_id1}&include_files=${true}`);

    expectSuccess(response1);
    expectSuccess(response2);
    expectSuccess(response3);
    expect(response1.body.data.folders.length).toBeGreaterThan(0);
    expect(response2.body.data.folders.length).toBeGreaterThan(0);
    expect(response3.body.data.folders.length).toBeGreaterThan(0);
    expect(response3.body.data.folders[0].files.length).toBeGreaterThan(0);
  });
  it("Can find parent folders", async () => {
    const { folder_id: folder_id1, name: folderName1 } = await mediaFake.rawCreateFolder();
    const { folder_id: folder_id2 } = await mediaFake.rawCreateFolder({ parent_id: folder_id1 });
    const { folder_id: folder_id3 } = await mediaFake.rawCreateFolder({ parent_id: folder_id2 });

    const response = await request(`/media/parent/${folder_id3}`);
    //find where one of the parent folder name from the children
    const findName = response.body.data.folders.find((f: any) => f.name === folderName1);

    expectSuccess(response);
    expect(findName.name).toBe(folderName1);
    expect(response.body.data.folders.length).toBeGreaterThan(0);
  });
  it("Can find children folders", async () => {
    const { folder_id: folder_id1 } = await mediaFake.rawCreateFolder();
    const { folder_id: folder_id2 } = await mediaFake.rawCreateFolder({ parent_id: folder_id1 });
    const { name: folderName3 } = await mediaFake.rawCreateFolder({ parent_id: folder_id2 });

    const response = await request(`/media/children/${folder_id1}`);

    //find where one of the children folder name from the children
    const findName = response.body.data.folders.find((f: any) => f.name === folderName3);

    expectSuccess(response);
    expect(findName.name).toBe(folderName3);
    expect(response.body.data.folders.length).toBeGreaterThan(0);
  });
});
