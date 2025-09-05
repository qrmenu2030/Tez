const API_URL = "https://script.google.com/macros/s/AKfycbyxexbgHm0x6Dg5tI297fNdW9iQ8XwjESbJNyQ6_YyMASIP67d67I9EgyedCCg8LFAxow/exec";

let cart = {};

// === Загрузка меню ===
function loadMenu() {
  fetch(API_URL)
    .then(res => res.json())
    .then(menu => {
      const container = document.getElementById("menuList");
      container.innerHTML = "";
      menu.forEach(item => {
        const article = document.createElement("article");
        article.className = "menu-item";
        article.dataset.id = item.id;
        article.innerHTML = `
          <img src="${item.img}" alt="${item.name}">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <div class="price">${item.price} сом</div>
          <button class="add-to-cart">Добавить</button>
        `;
        container.appendChild(article);
        article.querySelector(".add-to-cart").onclick = () => addToCart(item);
      });
    });
}

// === Работа с корзиной ===
function addToCart(item) {
  if (!cart[item.id]) {
    cart[item.id] = { ...item, qty: 0 };
  }
  cart[item.id].qty++;
  renderCart();
}

function renderCart() {
  const list = document.getElementById("cartList");
  list.innerHTML = "";
  let total = 0;
  Object.values(cart).forEach(it => {
    total += it.qty * it.price;
    const li = document.createElement("li");
    li.textContent = `${it.name} x${it.qty} - ${it.price * it.qty} сом`;
    list.appendChild(li);
  });
  document.getElementById("cartTotal").textContent = `Итого: ${total} сом`;
}

// === Модалка заказа ===
const orderModal = document.getElementById("orderModal");
document.getElementById("checkoutBtn").onclick = () => {
  if (Object.keys(cart).length === 0) return alert("Корзина пуста");
  orderModal.style.display = "block";
};
document.getElementById("closeModal").onclick = () => orderModal.style.display = "none";

// === Отправка заказа ===
document.getElementById("orderForm").onsubmit = e => {
  e.preventDefault();
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const delivery = document.querySelector("input[name=delivery]:checked").value;

  const order = {
    name, phone, address, delivery,
    items: Object.values(cart).map(i => ({ name: i.name, qty: i.qty, price: i.price })),
    totalItems: Object.values(cart).reduce((sum, i) => sum + i.qty, 0),
    totalPrice: Object.values(cart).reduce((sum, i) => sum + i.qty * i.price, 0)
  };

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  })
  .then(res => res.json())
  .then(() => {
    alert("✅ Заказ отправлен в Telegram!");
    cart = {};
    renderCart();
    orderModal.style.display = "none";
    e.target.reset();
  })
  .catch(() => alert("❌ Ошибка отправки заказа"));
};

// === Запуск ===
window.addEventListener("load", loadMenu);