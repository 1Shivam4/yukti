/**
 * Print-to-PDF Export Utility
 * Opens resume in new window with print dialog for smart page breaks
 */

import type { Resume } from "@yukti/shared";

/**
 * Export resume to PDF using browser's print dialog
 * This method provides:
 * - Smart page breaks (no content splitting)
 * - Vector text (perfect quality)
 * - Searchable/selectable text
 */
export async function exportToPdfPrint(
  elementId: string,
  filename: string = "resume.pdf"
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Get all stylesheets from the current page
  const styleSheets = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n");
      } catch {
        // Handle CORS issues with external stylesheets
        return "";
      }
    })
    .join("\n");

  // Get inline styles and computed styles
  const fonts = Array.from(document.fonts)
    .map((font) => `@font-face { font-family: '${font.family}'; }`)
    .join("\n");

  // Create print-optimized HTML
  const printHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    /* Include all page styles */
    ${styleSheets}
    
    /* Include fonts */
    ${fonts}
    
    /* Print-specific optimizations */
    @media print {
      @page {
        size: A4;
        margin: 12mm 6mm;
      }
      
      body {
        margin: 0;
        padding: 0;
        background: white;
      }
      
      /* Prevent content from splitting */
      section {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      h2, h3 {
        page-break-after: avoid;
        break-after: avoid;
      }
      
      /* Remove shadows for print */
      * {
        box-shadow: none !important;
      }
    }
    
    body {
      width: 210mm;
      margin: 0 auto;
      background: white;
    }
  </style>
</head>
<body>
  ${element.outerHTML}
  <script>
    // Auto-trigger print dialog after page loads
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
    
    // Close window after printing or canceling
    window.onafterprint = function() {
      // Don't auto-close, let user close manually
      // window.close();
    };
  </script>
</body>
</html>`;

  // Open in new window
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Failed to open print window. Please allow popups for this site.");
  }

  printWindow.document.write(printHTML);
  printWindow.document.close();
}
