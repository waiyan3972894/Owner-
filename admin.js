import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// ၁။ Firebase Config (သင့် Project မှ Config ကို ပြန်ထည့်ပါ)
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

// ၂။ Post အသစ်တင်ခြင်း (Bulk Image Links & Description ပါဝင်သည်)
document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;

    const rawLinks = document.getElementById('itemImageUrls').value;
    const imageUrlsArray = rawLinks.split('\n').map(link => link.trim()).filter(link => link !== "");

    try {
        await addDoc(productsCol, {
            name: document.getElementById('itemName').value,
            price: Number(document.getElementById('itemPrice').value),
            category: document.getElementById('itemCategory').value,
            desc: document.getElementById('itemDesc').value,
            images: imageUrlsArray,
            isSoldOut: false,
            createdAt: Date.now()
        });
        alert("အောင်မြင်စွာ တင်ပြီးပါပြီ!");
        e.target.reset();
    } catch (err) { alert("Error: " + err.message); }
    btn.disabled = false;
});

// ၃။ ပစ္စည်းစာရင်းပြသခြင်း
onSnapshot(query(productsCol, orderBy("createdAt", "desc")), (snap) => {
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = "";
    snap.forEach(d => {
        const it = d.data();
        const id = d.id;
        
        // JS Error မတက်စေရန် စာသားများကို ပြင်ဆင်ခြင်း
        const safeName = it.name.replace(/'/g, "\\'");
        const safeDesc = (it.desc || "").replace(/'/g, "\\'").replace(/\n/g, "\\n");

        tbody.innerHTML += `
        <tr>
            <td><img src="${it.images[0]}" class="img-preview"></td>
            <td>
                <div>${it.name}</div>
                <small class="badge bg-secondary">${it.category}</small>
            </td>
            <td>${it.price.toLocaleString()} Ks</td>
            <td>
                <button onclick="window.toggleS('${id}', ${it.isSoldOut})" class="btn btn-sm ${it.isSoldOut?'btn-danger':'btn-success'}">
                    ${it.isSoldOut?'Sold Out':'Active'}
                </button>
            </td>
            <td>
                <button onclick="window.openE('${id}', '${safeName}', ${it.price}, '${safeDesc}')" class="btn btn-primary btn-sm">Edit</button>
                <button onclick="window.del('${id}')" class="btn btn-outline-danger btn-sm">Del</button>
            </td>
        </tr>`;
    });
});

// ၄။ Edit Modal ဖွင့်ခြင်း (နဂို Description ပါ ပေါ်လာစေမည်)
const editM = new bootstrap.Modal(document.getElementById('editModal'));

window.openE = (id, name, price, desc) => {
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editPrice').value = price;
    document.getElementById('editDesc').value = desc;
    editM.show();
};

// ၅။ ပြင်ဆင်ချက်များကို Update လုပ်ခြင်း
document.getElementById('saveEditBtn').onclick = async () => {
    const id = document.getElementById('editId').value;
    const btn = document.getElementById('saveEditBtn');
    btn.disabled = true;

    try {
        await updateDoc(doc(db, "products", id), {
            name: document.getElementById('editName').value,
            price: Number(document.getElementById('editPrice').value),
            desc: document.getElementById('editDesc').value
        });
        alert("ပြင်ဆင်ပြီးပါပြီ!");
        editM.hide();
    } catch (err) { alert("Error: " + err.message); }
    
    btn.disabled = false;
};

// ၆။ Sold Out / Active အခြေအနေပြောင်းခြင်း
window.toggleS = async (id, s) => { 
    await updateDoc(doc(db, "products", id), { isSoldOut: !s }); 
};

// ၇။ ပစ္စည်းဖျက်ခြင်း
window.del = async (id) => { 
    if(confirm("ဖျက်မှာ သေချာပါသလား?")) await deleteDoc(doc(db, "products", id)); 
};
