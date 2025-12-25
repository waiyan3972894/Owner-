import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, doc, onSnapshot, orderBy, query, increment, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCRjqWvCQRjij73KVcKIdCdyNb5jjlLSK8",
    authDomain: "mlbbbf.firebaseapp.com",
    projectId: "mlbbbf",
    storageBucket: "mlbbbf.firebasestorage.app",
    messagingSenderId: "725278425000",
    appId: "1:725278425000:web:09e91633b10c6e85c9679d"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productsCol = collection(db, "products");

// --- ၁။ ပစ္စည်းအသစ်တင်ခြင်း (Discount & Stock ပါဝင်သည်) ---
document.getElementById('addForm').onsubmit = async (e) => {
    e.preventDefault();
    const urls = document.getElementById('itemImageUrls').value.split('\n').map(l => l.trim()).filter(l => l !== "");
    try {
        await addDoc(productsCol, {
            name: document.getElementById('itemName').value,
            originalPrice: Number(document.getElementById('itemOriginalPrice').value) || 0,
            price: Number(document.getElementById('itemPrice').value),
            stock: Number(document.getElementById('itemStock').value),
            category: document.getElementById('itemCategory').value,
            images: urls,
            isSoldOut: false,
            createdAt: Date.now()
        });
        alert("အောင်မြင်စွာ တင်ပြီးပါပြီ!");
        e.target.reset();
    } catch (err) { alert(err.message); }
};

// --- ၂။ ဇယားတွင် ပစ္စည်းများ ပြသခြင်း (Discount & Edit Button ပါဝင်သည်) ---
onSnapshot(query(productsCol, orderBy("createdAt", "desc")), (snap) => {
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = "";
    snap.forEach(d => {
        const it = d.data();
        const safeName = it.name.replace(/'/g, "\\'");
        
        // Discount တွက်ချက်ပြသခြင်း
        const discountText = it.originalPrice > it.price ?
            `<span class="text-decoration-line-through text-muted small">${it.originalPrice}</span> ${it.price}` :
            `${it.price}`;
        
        tbody.innerHTML += `
        <tr>
            <td><img src="${it.images[0]}" class="img-preview"></td>
            <td class="text-start small">${it.name}</td>
            <td>${discountText} Ks</td>
            <td>${it.stock}</td>
            <td>
                <button onclick="window.toggleS('${d.id}', ${it.isSoldOut})" 
                    class="btn btn-sm ${it.isSoldOut ? 'btn-danger' : 'btn-success'} fw-bold" style="width: 80px;">
                    ${it.isSoldOut ? 'Sold Out' : 'Active'}
                </button>
            </td>
            <td>
                <div class="d-flex gap-1 justify-content-center">
                    <button onclick="window.openE('${d.id}', '${safeName}', ${it.price}, ${it.originalPrice || 0}, ${it.stock})" class="btn btn-primary btn-sm">Edit</button>
                    <button onclick="window.del('${d.id}')" class="btn btn-outline-danger btn-sm">Del</button>
                </div>
            </td>
        </tr>`;
    });
});

// --- ၃။ EDIT SYSTEM (ပြင်ဆင်ခြင်း) ---
const editModal = new bootstrap.Modal(document.getElementById('editModal'));
window.openE = (id, name, price, ogPrice, stock) => {
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editPrice').value = price;
    document.getElementById('editOriginalPrice').value = ogPrice;
    document.getElementById('editStock').value = stock;
    editModal.show();
};

document.getElementById('saveEditBtn').onclick = async () => {
    const id = document.getElementById('editId').value;
    try {
        await updateDoc(doc(db, "products", id), {
            name: document.getElementById('editName').value,
            price: Number(document.getElementById('editPrice').value),
            originalPrice: Number(document.getElementById('editOriginalPrice').value),
            stock: Number(document.getElementById('editStock').value)
        });
        editModal.hide();
        alert("ပြင်ဆင်ပြီးပါပြီ!");
    } catch (err) { alert(err.message); }
};

// --- ၄။ STATUS TOGGLE & DELETE & TOPUP ---
window.toggleS = async (id, s) => { await updateDoc(doc(db, "products", id), { isSoldOut: !s }); };
window.del = async (id) => { if (confirm("ဖျက်မှာ သေချာပါသလား?")) await deleteDoc(doc(db, "products", id)); };

document.getElementById('topupBtn').onclick = async () => {
    const uid = document.getElementById('topupUid').value.trim();
    const amt = Number(document.getElementById('topupAmount').value);
    if (!uid || amt <= 0) return alert("Check inputs!");
    try {
        const userRef = doc(db, "users", uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
            await updateDoc(userRef, { balance: increment(amt) });
            alert("ငွေဖြည့်သွင်းမှု အောင်မြင်ပါသည်!");
            document.getElementById('topupAmount').value = "";
        } else alert("User မရှိပါ။ UID မှန်အောင် ပြန်စစ်ပါ။");
    } catch (e) { alert(e.message); }
};    if(confirm("ဖျက်မှာ သေချာပါသလား?")) await deleteDoc(doc(db, "products", id)); 
   
