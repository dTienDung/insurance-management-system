// Helper functions để download file từ blob

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Download Word document
export const downloadWordDoc = (blob, filename) => {
  const fullFilename = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  downloadFile(blob, fullFilename);
};

// Download Excel file
export const downloadExcel = (blob, filename) => {
  const fullFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  downloadFile(blob, fullFilename);
};

// Download PDF
export const downloadPDF = (blob, filename) => {
  const fullFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  downloadFile(blob, fullFilename);
};

// Download any file with extension
export const downloadWithExtension = (blob, filename, extension) => {
  const fullFilename = filename.endsWith(extension) ? filename : `${filename}.${extension}`;
  downloadFile(blob, fullFilename);
};
