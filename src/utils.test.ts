import * as utils from "./utils";

describe("extracts file names", () => {
  it("extracts the name from download url", async () => {
    const exampleDownloadUrl =
      "https://files.gitbook.com/v0/b/gitbook-legacy-files/o/assets%2F-M8N-2NuR5V0ryoqtTWk%2F-MC0GoHeyr3P9glwOxk7%2FVlKCZMuShVzkE0pdnffR%2Fmy-image.png?alt=media&token=5246ece1-816a-4432-b066-0f6709b06b4f";
    const out = utils.extractFilename(exampleDownloadUrl);
    expect(out).toEqual("VlKCZMuShVzkE0pdnffR.png");
  });
});

describe("string input check", () => {
  it("handles null", async () => {
    const input = null;
    const out = utils.isNullUndefinedOrEmptyString(input);
    expect(out).toBe(true);
  });
  it("handles undefined", async () => {
    const input = undefined;
    const out = utils.isNullUndefinedOrEmptyString(input);
    expect(out).toBe(true);
  });
  it("handles empty string", async () => {
    const input = "";
    const out = utils.isNullUndefinedOrEmptyString(input);
    expect(out).toBe(true);
  });
  it("handles string with data", async () => {
    const input = "a real string";
    const out = utils.isNullUndefinedOrEmptyString(input);
    expect(out).toBe(false);
  });
});
