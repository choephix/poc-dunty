export function downloadDataAsCSV(data: {
  filename: string;
  rows: any[][];
  headers?: string[];
  columnDelimiter?: string;
  lineDelimiter?: string;
}): void {
  const lines = new Array<string>();
  const { rows, headers = null, columnDelimiter = ",", lineDelimiter = "\n" } = data;
  if (headers) {
    lines.push(headers.join(columnDelimiter));
  }
  for (const row of rows) {
    lines.push(row.join(columnDelimiter));
  }
  const csv = lines.join(lineDelimiter);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", data.filename);
  link.click();
}
