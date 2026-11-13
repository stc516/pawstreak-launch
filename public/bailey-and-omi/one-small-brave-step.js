/* Bailey & Omi printable activity: same-origin script, compatible with site CSP. */
const printButton = document.querySelector('[data-print-activity]');
if (printButton) {
  printButton.addEventListener('click', () => {
    window.print();
  });
}
