/**
 * SISTEM PENGURUSAN KAD TOUCH 'N GO HOSPITAL KEMAMAN
 * Versi: 1.3.0
 * Fail: js/app.js
 * Fungsi: Logik Utama APLIKASI Frontend & Routing View (Dikemas Kini untuk Fasa 6 & 7)
 */

document.addEventListener("DOMContentLoaded", () => {
    checkSessionAndRenderUI();
});

function checkSessionAndRenderUI() {
    const token = localStorage.getItem("tng_session_token");
    const userJson = localStorage.getItem("tng_user");

    const authContainer = document.getElementById("authContainer");
    const mainContainer = document.getElementById("mainContainer");

    if (token && userJson) {
        const user = JSON.parse(userJson);
        authContainer.classList.add("hidden");
        mainContainer.classList.remove("hidden");

        document.getElementById("navUserName").textContent = user.fullName || user.username;
        document.getElementById("navUserRole").textContent = user.role;

        renderNavigationMenu(user.role);
    } else {
        authContainer.classList.remove("hidden");
        mainContainer.classList.add("hidden");
    }
}

function renderNavigationMenu(role) {
    const navMenu = document.getElementById("navMenu");
    navMenu.innerHTML = "";

    let items = [];

    if (role === "PENYELIA") {
        items = [
            { icon: "fa-chart-line", label: "Dashboard", view: "dashboard" },
            { icon: "fa-users", label: "Pengurusan Pengguna", view: "users" },
            { icon: "fa-credit-card", label: "Kad Touch 'n Go", view: "cards" },
            { icon: "fa-van-shuttle", label: "Kenderaan", view: "vehicles" },
            { icon: "fa-user-gear", label: "Pemandu", view: "drivers" },
            { icon: "fa-right-left", label: "Serah Terima", view: "handover" },
            { icon: "fa-list-check", label: "Transaksi", view: "transactions" },
            { icon: "fa-wallet", label: "Tambah Nilai", view: "topup" },
            { icon: "fa-triangle-exclamation", label: "Kehilangan/Kerosakan", view: "loss" },
            { icon: "fa-file-invoice", label: "Laporan", view: "reports" },
            { icon: "fa-clock-rotate-left", label: "Audit Log", view: "audit" }
        ];
    } else {
        items = [
            { icon: "fa-chart-line", label: "Dashboard", view: "dashboard" },
            { icon: "fa-credit-card", label: "Kad Saya", view: "my-cards" },
            { icon: "fa-van-shuttle", label: "Kenderaan Saya", view: "my-vehicle" },
            { icon: "fa-right-left", label: "Serah / Terima", view: "handover" },
            { icon: "fa-clock-rotate-left", label: "Transaksi Saya", view: "my-transactions" },
            { icon: "fa-triangle-exclamation", label: "Lapor Masalah", view: "report-issue" }
        ];
    }

    items.forEach((item, index) => {
        const a = document.createElement("a");
        a.className = `nav-item ${index === 0 ? 'active' : ''}`;
        a.innerHTML = `<i class="fa-solid ${item.icon}"></i> <span>${item.label}</span>`;
        a.onclick = () => loadView(item.view, a);
        navMenu.appendChild(a);
    });

    loadView("dashboard");
}

function loadView(viewName, element) {
    if (element) {
        document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
        element.classList.add("active");
    }

    const appContent = document.getElementById("appContent");
    const pageTitle = document.getElementById("pageTitle");

    pageTitle.textContent = viewName.toUpperCase();

    if (viewName === "dashboard") {
        renderDashboardView();
    } else if (viewName === "cards") {
        renderCardView();
    } else if (viewName === "vehicles") {
        renderVehicleView();
    } else {
        appContent.innerHTML = `<div style="padding: 20px; background: white; border-radius: 8px;">
            <h3>Modul ${viewName.toUpperCase()}</h3>
            <p style="color: #64748b; margin-top: 10px;">Antaramuka modul ini akan dimuatkan dalam fasa seterusnya.</p>
        </div>`;
    }
}
