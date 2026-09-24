/**
 * SISTEM PENGURUSAN KAD TOUCH 'N GO HOSPITAL KEMAMAN
 * Versi: 1.4.0
 * Fail: js/handover.js
 * Fungsi: Logik Antaramuka Borang Pengambilan & Pemulangan Kad TNG
 */

async function renderHandoverView() {
    const appContent = document.getElementById("appContent");

    appContent.innerHTML = `
        <div class="action-bar">
            <h3>Rekod Pengambilan & Pemulangan Kad</h3>
            <button class="btn-add" onclick="openHandoverModal()">
                <i class="fa-solid fa-right-left"></i> Rekod Serah / Terima Kad
            </button>
        </div>

        <div class="dashboard-section">
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID Rekod</th>
                            <th>Tarikh / Masa</th>
                            <th>No. Kad</th>
                            <th>Kenderaan</th>
                            <th>Pemandu</th>
                            <th>Jenis Transaksi</th>
                            <th>Baki Serah (RM)</th>
                            <th>Baki Terima (RM)</th>
                        </tr>
                    </thead>
                    <tbody id="handoverTableBody">
                        <tr><td colspan="8" style="text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Memuatkan rekod...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- MODAL BORANG SERAH TERIMA -->
        <div id="handoverModal" class="modal-overlay hidden">
            <div class="modal-card">
                <div class="modal-header">
                    <h3>Borang Serah / Terima Kad TNG</h3>
                    <button class="btn-icon" onclick="closeHandoverModal()"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <form id="handoverForm" onsubmit="handleSaveHandover(event)">
                    <div class="form-group">
                        <label>Jenis Transaksi</label>
                        <select id="modalHandoverType" style="width:100%; padding:10px; border-radius:6px; border:1px solid #cbd5e1;">
                            <option value="SERAH">SERAH (Pemandu Ambil Kad)</option>
                            <option value="TERIMA">TERIMA (Pemandu Pulang Kad)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Pilih Kad TNG</label>
                        <select id="modalHandoverCard" style="width:100%; padding:10px; border-radius:6px; border:1px solid #cbd5e1;" required>
                            <!-- Pilihan Kad Diisi Secara Dinamik -->
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Pilih Pemandu</label>
                        <select id="modalHandoverDriver" style="width:100%; padding:10px; border-radius:6px; border:1px solid #cbd5e1;" required>
                            <!-- Pilihan Pemandu Diisi Secara Dinamik -->
                        </select>
                    </div>
                    <div class="form-group">
                        <label>No. Pendaftaran Kenderaan</label>
                        <input type="text" id="modalHandoverPlate" placeholder="Contoh: W4050P" required>
                    </div>
                    <div class="form-group">
                        <label>Baki Semasa Kad (RM)</label>
                        <input type="number" step="0.01" id="modalHandoverBalance" required placeholder="0.00">
                    </div>
                    <div id="handoverFormAlert" class="alert-box hidden"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="closeHandoverModal()">Batal</button>
                        <button type="submit" class="btn-primary" style="width:auto;">Simpan Rekod</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    await fetchAllHandovers();
}

async function fetchAllHandovers() {
    const token = localStorage.getItem("tng_session_token");
    const tbody = document.getElementById("handoverTableBody");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ action: "GET_ALL_HANDOVERS", token: token })
        });

        const result = await response.json();
        if (result.success) {
            const list = result.data;
            if (list.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Tiada rekod serah terima.</td></tr>`;
                return;
            }
            tbody.innerHTML = list.map(h => `
                <tr>
                    <td><strong>${h.handoverId}</strong></td>
                    <td>${h.date} ${h.time}</td>
                    <td>${h.cardNumber}</td>
                    <td>${h.plateNo}</td>
                    <td>${h.driverName}</td>
                    <td><span class="badge-status ${h.transactionType === 'SERAH' ? 'warning' : 'active'}">${h.transactionType}</span></td>
                    <td>${h.initialBalance !== '-' ? 'RM ' + h.initialBalance.toFixed(2) : '-'}</td>
                    <td>${h.returnBalance !== '-' ? 'RM ' + h.returnBalance.toFixed(2) : '-'}</td>
                </tr>
            `).join('');
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" style="color:red; text-align:center;">Ralat: ${e.message}</td></tr>`;
    }
}

async function openHandoverModal() {
    const token = localStorage.getItem("tng_session_token");

    // Muat turun senarai kad & pemandu untuk dropdown
    const resCards = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "GET_ALL_CARDS", token: token }) });
    const resDrivers = await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "GET_ALL_DRIVERS", token: token }) });

    const cardsResult = await resCards.json();
    const driversResult = await resDrivers.json();

    const cardSelect = document.getElementById("modalHandoverCard");
    const driverSelect = document.getElementById("modalHandoverDriver");

    cardSelect.innerHTML = cardsResult.data.map(c => `<option value="${c.cardId}" data-no="${c.cardNumber}">${c.cardName} (${c.cardNumber}) - Baki: RM ${c.balance.toFixed(2)}</option>`).join('');
    driverSelect.innerHTML = driversResult.data.map(d => `<option value="${d.driverId}" data-name="${d.fullName}">${d.fullName} (${d.driverId})</option>`).join('');

    document.getElementById("handoverModal").classList.remove("hidden");
}

function closeHandoverModal() {
    document.getElementById("handoverModal").classList.add("hidden");
}

async function handleSaveHandover(event) {
    event.preventDefault();
    const user = JSON.parse(localStorage.getItem("tng_user") || "{}");
    const token = localStorage.getItem("tng_session_token");

    const cardSelect = document.getElementById("modalHandoverCard");
    const driverSelect = document.getElementById("modalHandoverDriver");

    const selectedCardOption = cardSelect.options[cardSelect.selectedIndex];
    const selectedDriverOption = driverSelect.options[driverSelect.selectedIndex];

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
                action: "RECORD_HANDOVER",
                token: token,
                currentUserRole: user.role,
                data: {
                    cardId: cardSelect.value,
                    cardNumber: selectedCardOption.getAttribute("data-no"),
                    driverId: driverSelect.value,
                    driverName: selectedDriverOption.getAttribute("data-name"),
                    plateNo: document.getElementById("modalHandoverPlate").value,
                    transactionType: document.getElementById("modalHandoverType").value,
                    balance: document.getElementById("modalHandoverBalance").value
                }
            })
        });

        const result = await response.json();
        if (result.success) {
            closeHandoverModal();
            await fetchAllHandovers();
        } else {
            showAlert(document.getElementById("handoverFormAlert"), result.message, "error");
        }
    } catch (e) {
        showAlert(document.getElementById("handoverFormAlert"), "Ralat merekodkan serah terima.", "error");
    }
}
