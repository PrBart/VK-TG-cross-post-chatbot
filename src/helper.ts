const toEscapeMsg = function (str: string) {
  str = str
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/`/g, '\\`');
  return str;
};
export default toEscapeMsg;
