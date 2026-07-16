/**
 * Downloads any text content as a file.
 */
export function downloadFile(
  filename: string,
  content: string,
  type = "application/json",
): void {
  const blob = new Blob([content], {
    type,
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
