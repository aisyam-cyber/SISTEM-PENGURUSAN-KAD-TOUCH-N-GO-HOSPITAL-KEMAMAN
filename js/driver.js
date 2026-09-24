/**
 * SISTEM PENGURUSAN KAD TOUCH 'N GO HOSPITAL KEMAMAN
 * Versi: 1.4.0
 * Fail: js/driver.js
 * Fungsi: Logik Antaramuka & Borang Pendaftaran Pemandu
 */

async function renderDriverView() {
    const appContent = document.getElementById("appContent");

    appContent.innerHTML = `
        <div class="action-bar">
            <div class="search-box">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" id="driverSearchInput" placeholder="Cari nama pemandu...">
            </div>
            <button class="btn-add" onclick="openCreateDriverModal()">
                <i class="fa-solid fa-user-plus"></i> Daftar Pemandu Baharu
            </button>
        </div>

        <div class="dashboard-section">
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID Pemandu</th>
                            <th>Nama Penuh</th>
                            <th>No. Kad Pengenalan</th>
                            <th>No. Telefon</th>
                            <th>Unit</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="driverTableBody">
                        <tr><td colspan="6" style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Memuatkan data...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- MODAL BORANG PEMANDU -->
        <div id="driverModal" class="modal-overlay hidden">
            <div class="modal-card">
                <div class="modal-header">
                    <h3>Daftar Pemandu Baharu</h3>
                    <button class="btn-icon" onclick="closeDriverModal()"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <form id="driverForm" onsubmit="handleSaveDriver(event)">
                    <div class="form-group">
                        <label>Nama Penuh Pemandu</label>
                        <input type="text" id="modalDriverName" required placeholder="Contoh: Ahmad Bin Hassan">
                    </div>
                    <div class="form-group">
                        <label>No. Kad Pengenalan / ID Pegawai</label>
                        <input type="text" id="modalDriverIc" required placeholder="Contoh: 880101-11-5050">
                    </div>
                    <div class="form-group">
                        <label>No. Telefon</label>
                        <input type="text" id="modalDriverPhone" required placeholder="Contoh: 012-3456789">
                    </div>
                    <div class="form-group">
                        <label>Unit / Jabatan</label>
                        <input type="text" id="modalDriverUnit" value="Unit Kenderaan">
                    </div>
                    <div id="driverFormAlert" class="alert-box hidden"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="closeDriverModal()">Batal</button>
                        <button type="submit" class="btn-primary" style="width:auto;">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    await fetchAllDrivers();
}

async function fetchAllDrivers() {
    const token = localStorage.getItem("tng_session_token");
    const tbody = document.getElementById("driverTableBody");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ action: "GET_ALL_DRIVERS", token: token })
        });

        const result = await response.json();
        if (result.success) {
            const drivers = result.data;
            if (drivers.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Tiada rekod pemandu.</td></tr>`;
                return;
            }
            tbody.innerHTML = drivers.map(d => `
                <tr>
                    <td><strong>${d.driverId}</strong></td>
                    <td>${d.fullName}</td>
                    <td>${d.icNo}</td>
                    <td>${d.phone}</td>
                    <td>${d.unit}</td>
                    <td><span class="badge-status active">${d.status}</span></td>
                </tr>
            `).join('');
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Ralat sambungan: ${e.message}</td></tr>`;
    }
}

function openCreateDriverModal() {
    document.getElementById("modalDriverName").value = "";
    document.getElementById("modalDriverIc").value = "";
    document.getElementById("modalDriverPhone").value = "";
    document.getElementById("driverModal").classList.remove("hidden");
}

function closeDriverModal() {
    document.getElementById("driverModal").classList.add("hidden");
}

async function handleSaveDriver(event) {
    event.preventDefault();
    const user = JSON.parse(localStorage.getItem("tng_user") || "{}");
    const token = localStorage.getItem("tng_session_token");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
                action: "CREATE_DRIVER",
                token: token,
                currentUserRole: user.role,
                data: {
                    fullName: document.getElementById("modalDriverName").value,
                    icNo: document.getElementById("modalDriverIc").value,
                    phone: document.getElementById("modalDriverPhone").value,
                    unit: document.getElementById("modalDriverUnit").value
                }
            })
        });

        const result = await response.json();
        if (result.success) {
            closeDriverModal();
            await fetchAllDrivers();
        } else {
            showAlert(document.getElementById("driverFormAlert"), result.message, "error");
        }
    } catch (e) {
        showAlert(document.getElementById("driverFormAlert"), "Ralat menyimpan pemandu.", "error");
    }
}
