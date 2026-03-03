export function isValid(filename, exportName) {
  // Skip index, test, spec, and stories files
  if (
    /^index\./.test(filename) ||
    /\.spec\./.test(filename) ||
    /\.test\./.test(filename) ||
    /\.stories\./.test(filename)
  ) {
    return true;
  }

  // Strip .ts / .tsx / .js / .jsx extension
  const withoutExt = filename.replace(/\.[jt]sx?$/, '');

  const fileNameNormalized = withoutExt.replace(/-/g, '').replace(/\./g, '');
  const exportNameNormalized = exportName.replace(/_/g, '');

  return (
    fileNameNormalized.toLowerCase() === exportNameNormalized.toLowerCase()
  );
}
