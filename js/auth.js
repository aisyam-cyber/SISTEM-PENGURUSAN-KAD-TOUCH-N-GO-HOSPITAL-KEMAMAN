/**
 * SISTEM PENGURUSAN KAD TOUCH 'N GO HOSPITAL KEMAMAN
 * Versi: 1.3.3
 * Fail: js/auth.js
 * Fungsi: Pengurusan Sesi, Pengesahan & Log Masuk Client Frontend
 */

// GANTIKAN DENGAN WEB APP URL GOOGLE APPS SCRIPT ANDA SEBENAR:
const API_URL = "https://script.google.com/macros/s/AKfycbxCf8Genk72FXf9-oyCZxyX6DzR91oNTWoFKy02U6CebjY2YKHKj6yYBt5grCQiJcxt/exec";

/**
 * Kendali Borang Log Masuk
 */
async function handleLogin(event) {
    event.preventDefault();

    const userIdInput = document.getElementById("userId").value;
    const passwordInput = document.getElementById("password").value;
    const alertBox = document.getElementById("loginAlert");
    const btnText = document.getElementById("btnText");
    const btnSpinner = document.getElementById("btnSpinner");

    if (API_URL.includes("MASUKKAN_WEB_APP_URL")) {
        showAlert(alertBox, "Sila kemas kini API_URL dalam js/auth.js dahulu.", "error");
        return;
    }

    // Tetapkan Keadaan Loading
    alertBox.classList.add("hidden");
    btnText.textContent = "MEMPROSES...";
    btnSpinner.classList.remove("hidden");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" }, // Digunakan untuk elak sekat CORS pada GAS
            body: JSON.stringify({
                action: "LOGIN",
                data: {
                    userId: userIdInput,
                    password: passwordInput
                }
            })
        });

        const result = await response.json();

        if (result.success) {
            // Simpan Sesi Pengguna Dalam LocalStorage
            localStorage.setItem("tng_session_token", result.data.session.token);
            localStorage.setItem("tng_user", JSON.stringify(result.data.user));

            // Peralihan ke Dashboard Utama
            checkSessionAndRenderUI();
        } else {
            showAlert(alertBox, result.message || "Gagal log masuk.", "error");
        }
    } catch (err) {
        showAlert(alertBox, "Ralat sambungan ke pelayan backend. Sila pastikan URL API dan kebenaran 'Anyone' pada Apps Script adalah betul.", "error");
    } finally {
        btnText.textContent = "LOG MASUK";
        btnSpinner.classList.add("hidden");
    }
}

/**
 * Kendali Log Keluar
 */
async function handleLogout() {
    const token = localStorage.getItem("tng_session_token");
    const user = JSON.parse(localStorage.getItem("tng_user") || "{}");

    if (token) {
        try {
            fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    action: "LOGOUT",
                    token: token,
                    data: { username: user.username, role: user.role }
                })
            });
        } catch (e) {
            console.warn("Ralat rangkaian semasa log keluar.");
        }
    }

    // Bersihkan Sesi Tempatan
    localStorage.removeItem("tng_session_token");
    localStorage.removeItem("tng_user");

    // Kembali ke Halaman Login
    checkSessionAndRenderUI();
}
