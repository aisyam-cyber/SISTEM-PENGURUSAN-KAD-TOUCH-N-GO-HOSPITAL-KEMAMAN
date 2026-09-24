/**
 * SISTEM PENGURUSAN KAD TOUCH 'N GO HOSPITAL KEMAMAN
 * Versi: 1.3.0
 * Fail: js/vehicle.js
 * Fungsi: Logik Antaramuka & Modal Borang Pengurusan Kenderaan Rasmi
 */

let globalVehiclesData = [];

/**
 * Render Halaman Utama Pengurusan Kenderaan
 */
async function renderVehicleView() {
    const appContent = document.getElementById("appContent");

    appContent.innerHTML = `
        <div class="action-bar">
            <div class="search-box">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" id="vehicleSearchInput" placeholder="Cari nombor pendaftaran..." onkeyup="filterVehicles()">
            </div>
            <button class="btn-add" onclick="openCreateVehicleModal()">
                <i class="fa-solid fa-plus"></i> Daftar Kenderaan Baharu
            </button>
        </div>

        <div class="dashboard-section">
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID Kenderaan</th>
                            <th>No. Pendaftaran</th>
                            <th>Jenis Kenderaan</th>
                            <th>Model</th>
                            <th>Jabatan / Unit</th>
                            <th>Status</th>
                            <th>ID Kad Assigned</th>
                        </tr>
                    </thead>
                    <tbody id="vehicleTableBody">
                        <tr><td colspan="7" style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Memuatkan data...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- MODAL BORANG KENDERAAN -->
        <div id="vehicleModal" class="modal-overlay hidden">
            <div class="modal-card">
                <div class="modal-header">
                    <h3>Daftar Kenderaan Rasmi</h3>
                    <button class="btn-icon" onclick="closeVehicleModal()"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <form id="vehicleForm" onsubmit="handleSaveVehicle(event)">
                    <div class="form-group">
                        <label>No. Pendaftaran Kenderaan</label>
                        <input type="text" id="modalPlateNo" required placeholder="Contoh: W4050P">
                    </div>
                    <div class="form-group">
                        <label>Jenis Kenderaan</label>
                        <select id="modalVehicleType" style="width:100%; padding:10px; border-radius:6px; border:1px solid #cbd5e1;">
                            <option value="AMBULANS">AMBULANS</option>
                            <option value="VAN">VAN</option>
                            <option value="BAS">BAS</option>
                            <option value="KERETA">KERETA LOGISTIK</option>
                            <option value="LORI">LORI</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Model Kenderaan</label>
                        <input type="text" id="modalVehicleModel" placeholder="Contoh: Toyota Hiace">
                    </div>
                    <div class="form-group">
                        <label>Unit / Jabatan</label>
                        <input type="text" id="modalUnitDepartment" value="Unit Kenderaan">
                    </div>
                    <div id="vehicleFormAlert" class="alert-box hidden"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="closeVehicleModal()">Batal</button>
                        <button type="submit" class="btn-primary" style="width:auto;">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    await fetchAllVehicles();
}

async function fetchAllVehicles() {
    const token = localStorage.getItem("tng_session_token");
    const tbody = document.getElementById("vehicleTableBody");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ action: "GET_ALL_VEHICLES", token: token })
        });

        const result = await response.json();
        if (result.success) {
            globalVehiclesData = result.data;
            renderVehicleRows(globalVehiclesData);
        } else {
            tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">${result.message}</td></tr>`;
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">Ralat sambungan: ${e.message}</td></tr>`;
    }
}

function renderVehicleRows(vehicles) {
    const tbody = document.getElementById("vehicleTableBody");
    if (!vehicles || vehicles.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Tiada rekod kenderaan ditemui.</td></tr>`;
        return;
    }

    tbody.innerHTML = vehicles.map(v => `
        <tr>
            <td><strong>${v.vehicleId}</strong></td>
            <td><strong>${v.plateNo}</strong></td>
            <td>${v.vehicleType}</td>
            <td>${v.model}</td>
            <td>${v.unitDepartment}</td>
            <td><span class="badge-status active">${v.status}</span></td>
            <td>${v.cardAssigned}</td>
        </tr>
    `).join('');
}

function filterVehicles() {
    const query = document.getElementById("vehicleSearchInput").value.toLowerCase();
    const filtered = globalVehiclesData.filter(v => v.plateNo.toLowerCase().includes(query));
    renderVehicleRows(filtered);
}

function openCreateVehicleModal() {
    document.getElementById("modalPlateNo").value = "";
    document.getElementById("modalVehicleModel").value = "";
    document.getElementById("vehicleModal").classList.remove("hidden");
}

function closeVehicleModal() {
    document.getElementById("vehicleModal").classList.add("hidden");
}

async function handleSaveVehicle(event) {
    event.preventDefault();
    const user = JSON.parse(localStorage.getItem("tng_user") || "{}");
    const token = localStorage.getItem("tng_session_token");
    const alertBox = document.getElementById("vehicleFormAlert");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
                action: "CREATE_VEHICLE",
                token: token,
                currentUserRole: user.role,
                data: {
                    plateNo: document.getElementById("modalPlateNo").value,
                    vehicleType: document.getElementById("modalVehicleType").value,
                    model: document.getElementById("modalVehicleModel").value,
                    unitDepartment: document.getElementById("modalUnitDepartment").value
                }
            })
        });

        const result = await response.json();
        if (result.success) {
            closeVehicleModal();
            await fetchAllVehicles();
        } else {
            showAlert(alertBox, result.message, "error");
        }
    } catch (e) {
        showAlert(alertBox, "Ralat menyimpan kenderaan.", "error");
    }
}
