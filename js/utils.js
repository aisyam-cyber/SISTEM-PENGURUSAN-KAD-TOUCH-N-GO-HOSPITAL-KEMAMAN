/**
 * SISTEM PENGURUSAN KAD TOUCH 'N GO HOSPITAL KEMAMAN
 * Versi: 1.3.2
 * Fail: js/utils.js
 * Fungsi: Fungsi Pembantu Umum Frontend & Pembuka Format
 */

/**
 * Format Angka Kepada Ringgit Malaysia (RM)
 */
function formatRM(amount) {
    const val = parseFloat(amount) || 0.0;
    return "RM " + val.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format Tarikh Standard (YYYY-MM-DD)
 */
function formatDateMs(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toISOString().split('T')[0];
}

/**
 * Format Tarikh Masa Lengkap
 */
function formatDateTimeMs(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('ms-MY', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

/**
 * Paparkan Mesej Notifikasi / Alert Pada Borang
 */
function showAlert(element, message, type = 'error') {
    if (!element) return;
    element.textContent = message;
    element.className = `alert-box ${type}`;
    element.classList.remove("hidden");
}

/**
 * Sembunyikan Mesej Notifikasi / Alert
 */
function hideAlert(element) {
    if (!element) return;
    element.classList.add("hidden");
}
