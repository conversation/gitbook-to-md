const extractFilename = (urlStr: string): string => {
  const url = new URL(urlStr);
  const path = decodeURIComponent(url.pathname);
  const file = path.match(/([^\/]+)\/([^\/]+)\.(\w+)$/);

  // Select the file id and extension
  return file ? `${file[1]}.${file[3]}` : "unknown";
};

const isNullUndefinedOrEmptyString = (input: string | undefined | null) => {
  return input === undefined || input === null || input.length === 0;
};

export { extractFilename, isNullUndefinedOrEmptyString };
