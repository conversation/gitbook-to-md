const extractFilename = (urlStr: string): string => {
  const url = new URL(urlStr);
  const path = decodeURIComponent(url.pathname);
  const file = path.match(/([^\/])+$/);

  return file ? file[0] : "unknown";
};

export { extractFilename };
