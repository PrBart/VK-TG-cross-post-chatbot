const toEscapeMsg = (str: string): string => {
  const escapedStr = str
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/`/g, '\\`');
  return escapedStr;
};
export default toEscapeMsg;
