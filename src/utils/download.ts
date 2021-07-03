export const download = (filename: string, body: Uint8Array) => {
  const element = document.createElement('A') as HTMLAnchorElement;

  const blob = new Blob([body]);
  const url = URL.createObjectURL(blob);
  element.setAttribute('href', url);
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}