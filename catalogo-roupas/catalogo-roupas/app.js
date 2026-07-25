const storeConfig = {
  storeName: "Natty Moda Feminina",
  welcomeText: "Moda feminina com estilo delicado e elegante para você arrasar.",
  whatsappNumber: "5534999999999",
  adminPassword: "natty123",
};

const defaultProducts = [
  {
    id: 1,
    name: "Vestido Floral",
    description: "Estampa leve e romântica com caimento suave.",
    price: 139.9,
    sizeInfo: "P, M, G",
    category: "Vestidos",
    color: "#d9a6c2",
    imageUrl: "",
  },
  {
    id: 2,
    name: "Blusa Laço",
    description: "Detalhe delicado e acabamento feminino.",
    price: 89.9,
    sizeInfo: "P, M, G",
    category: "Blusas",
    color: "#f4c6db",
    imageUrl: "",
  },
  {
    id: 3,
    name: "Saia Midi",
    description: "Elegância moderna com movimento leve.",
    price: 119.9,
    sizeInfo: "P, M, G",
    category: "Saias",
    color: "#c3b0d4",
    imageUrl: "",
  },
  {
    id: 4,
    name: "Macacão Chique",
    description: "Visual sofisticado para qualquer ocasião.",
    price: 169.9,
    sizeInfo: "P, M, G",
    category: "Macacões",
    color: "#a37b9c",
    imageUrl: "",
  },
  {
    id: 5,
    name: "Kimono Floral",
    description: "Peça leve para produções delicadas.",
    price: 129.9,
    sizeInfo: "P, M, G",
    category: "Kimono",
    color: "#f1d7c5",
    imageUrl: "",
  },
  {
    id: 6,
    name: "Short de Linho",
    description: "Conforto natural com toque feminino.",
    price: 99.9,
    sizeInfo: "P, M, G",
    category: "Shorts",
    color: "#e7d1b8",
    imageUrl: "",
  },
];

const state = {
  category: "all",
  cart: {},
  adminAuthenticated: false,
  editProductId: null,
  productImageData: "",
  products: [],
};

const cartStorageKey = "catalogo-roupas-cart";
const productsStorageKey = "catalogo-roupas-products";

function loadCart() {
  try {
    const saved = localStorage.getItem(cartStorageKey);
    state.cart = saved ? JSON.parse(saved) : {};
  } catch (_error) {
    state.cart = {};
  }
}

function saveCart() {
  localStorage.setItem(cartStorageKey, JSON.stringify(state.cart));
}

function loadProducts() {
  try {
    const saved = localStorage.getItem(productsStorageKey);
    state.products = saved ? JSON.parse(saved) : defaultProducts;
  } catch (_error) {
    state.products = [...defaultProducts];
  }
}

function saveProducts() {
  localStorage.setItem(productsStorageKey, JSON.stringify(state.products));
}

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function buildPlaceholderSvg(label, color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
      <rect width="800" height="1000" rx="40" fill="${color}" />
      <rect x="120" y="120" width="560" height="760" rx="28" fill="rgba(255,255,255,0.18)" />
      <text x="400" y="490" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="white">${label}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getCategories() {
  return ["all", ...new Set(state.products.map((product) => product.category))];
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Erro ao ler arquivo de imagem."));
    reader.readAsDataURL(file);
  });
}

function updateProductImagePreview(src) {
  const preview = document.getElementById("product-image-preview");
  if (!preview) return;

  if (!src) {
    preview.classList.add("hidden");
    preview.src = "";
    return;
  }

  preview.src = src;
  preview.classList.remove("hidden");
}

function getFilteredProducts() {
  if (state.category === "all") return state.products;
  return state.products.filter((product) => product.category === state.category);
}

function renderCategories() {
  const filters = document.getElementById("category-filters");
  const categories = getCategories();
  filters.innerHTML = "";

  categories.forEach((category) => {
    const label = category === "all" ? "Todas" : category;
    const button = document.createElement("button");
    button.className = `chip ${state.category === category ? "active" : ""}`;
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", () => {
      state.category = category;
      render();
    });
    filters.appendChild(button);
  });
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  const visibleProducts = getFilteredProducts();

  if (!visibleProducts.length) {
    grid.innerHTML = '<div class="empty-state">Nenhuma peça encontrada nesta categoria.</div>';
    return;
  }

  grid.innerHTML = "";
  visibleProducts.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const image = document.createElement("img");
    image.src = product.imageUrl ? product.imageUrl : buildPlaceholderSvg(product.name, product.color);
    image.alt = product.name;

    const info = document.createElement("div");
    info.className = "product-info";

    info.innerHTML = `
      <div class="product-name">${product.name}</div>
      <div class="product-meta">${product.description}</div>
      <div class="product-meta">Tamanhos: ${product.sizeInfo}</div>
      <div class="product-price">${formatCurrency(product.price)}</div>
    `;

    const button = document.createElement("button");
    button.className = "btn btn-primary btn-block";
    button.type = "button";
    button.textContent = "Adicionar";
    button.addEventListener("click", () => addToCart(product.id));

    info.appendChild(button);
    card.appendChild(image);
    card.appendChild(info);
    grid.appendChild(card);
  });
}

function addToCart(productId) {
  const existing = state.cart[productId] || 0;
  state.cart[productId] = existing + 1;
  saveCart();
  render();
}

function updateQty(productId, delta) {
  const current = state.cart[productId] || 0;
  const next = Math.max(0, current + delta);
  if (next === 0) {
    delete state.cart[productId];
  } else {
    state.cart[productId] = next;
  }
  saveCart();
  render();
}

function removeFromCart(productId) {
  delete state.cart[productId];
  saveCart();
  render();
}

function getCartItems() {
  return Object.entries(state.cart)
    .map(([productId, qty]) => {
      const product = state.products.find((item) => item.id === Number(productId));
      if (!product) return null;
      return { product, qty };
    })
    .filter(Boolean);
}

function getCartTotal() {
  return getCartItems().reduce((sum, item) => sum + item.product.price * item.qty, 0);
}

function renderCart() {
  const cartContent = document.getElementById("cart-content");
  const cartItems = getCartItems();
  const total = getCartTotal();

  document.getElementById("cart-count").textContent = String(
    cartItems.reduce((sum, item) => sum + item.qty, 0)
  );

  if (!cartItems.length) {
    cartContent.innerHTML = `
      <div class="empty-state">
        Seu carrinho está vazio.
        <br />
        Escolha algumas peças para continuar.
      </div>
    `;
    return;
  }

  const itemsMarkup = cartItems
    .map((item) => `
      <div class="cart-item">
        <img src="${buildPlaceholderSvg(item.product.name, item.product.color)}" alt="${item.product.name}" />
        <div class="cart-item-body">
          <div class="cart-item-top">
            <strong>${item.product.name}</strong>
            <span>${formatCurrency(item.product.price * item.qty)}</span>
          </div>
          <div class="qty-row">
            <button class="qty-btn" type="button" data-action="decrease" data-id="${item.product.id}">−</button>
            <input class="qty-input" type="number" min="1" value="${item.qty}" data-id="${item.product.id}" />
            <button class="qty-btn" type="button" data-action="increase" data-id="${item.product.id}">+</button>
          </div>
          <button class="remove-link" type="button" data-action="remove" data-id="${item.product.id}">Remover</button>
        </div>
      </div>
    `)
    .join("");

  cartContent.innerHTML = `
    <div>${itemsMarkup}</div>
    <div class="cart-summary">
      <div class="total-row">
        <span>Total</span>
        <span>${formatCurrency(total)}</span>
      </div>
      <button class="btn btn-primary btn-block" id="whatsapp-button" type="button">Enviar pedido no WhatsApp</button>
    </div>
  `;

  document.getElementById("whatsapp-button").addEventListener("click", sendToWhatsApp);
}

function sendToWhatsApp() {
  const cartItems = getCartItems();
  if (!cartItems.length) return;

  const lines = ["Olá! Vim pelo catálogo e gostaria de comprar:", ""];
  cartItems.forEach((item) => {
    lines.push(`- ${item.product.name} (Qtd: ${item.qty}) - ${formatCurrency(item.product.price)} cada`);
  });
  lines.push("");
  lines.push(`Total: ${formatCurrency(getCartTotal())}`);

  const message = encodeURIComponent(lines.join("\n"));
  const link = `https://wa.me/${storeConfig.whatsappNumber}?text=${message}`;
  window.open(link, "_blank", "noopener,noreferrer");
}

function showAdminPage() {
  document.getElementById("catalog-page").classList.add("hidden");
  document.getElementById("admin-page").classList.remove("hidden");
  renderAdmin();
}

function showCatalogPage() {
  document.getElementById("admin-page").classList.add("hidden");
  document.getElementById("catalog-page").classList.remove("hidden");
}

function renderAdmin() {
  const loginSection = document.getElementById("admin-login");
  const dashboard = document.getElementById("admin-dashboard");
  const adminTitle = document.querySelector(".admin-header h2");

  if (!state.adminAuthenticated) {
    loginSection.classList.remove("hidden");
    dashboard.classList.add("hidden");
    adminTitle.textContent = "Gerenciar produtos";
    return;
  }

  loginSection.classList.add("hidden");
  dashboard.classList.remove("hidden");
  adminTitle.textContent = "Painel administrativo";
  renderAdminProductList();
}

function renderAdminProductList() {
  const container = document.getElementById("admin-product-list");
  if (!container) return;

  if (!state.products.length) {
    container.innerHTML = '<p class="empty-state">Nenhum produto cadastrado ainda.</p>';
    return;
  }

  container.innerHTML = state.products
    .map(
      (product) => `
      <div class="admin-product-item">
        <div class="admin-product-info">
          <strong>${product.name}</strong>
          <span>${product.category} • ${formatCurrency(product.price)} • ${product.sizeInfo}</span>
        </div>
        <div class="admin-product-actions">
          <button class="btn btn-secondary admin-edit" data-id="${product.id}" type="button">Editar</button>
          <button class="btn btn-secondary admin-delete" data-id="${product.id}" type="button">Excluir</button>
        </div>
      </div>
    `
    )
    .join("");
}

function clearProductForm() {
  document.getElementById("product-name").value = "";
  document.getElementById("product-price").value = "";
  document.getElementById("product-size").value = "";
  document.getElementById("product-category").value = "";
  document.getElementById("product-image").value = "";
  updateProductImagePreview("");
  state.productImageData = "";
  document.getElementById("product-color").value = "#c3b0d4";
  document.getElementById("product-description").value = "";
  state.editProductId = null;
}

function fillProductForm(product) {
  document.getElementById("product-name").value = product.name;
  document.getElementById("product-price").value = product.price;
  document.getElementById("product-size").value = product.sizeInfo;
  document.getElementById("product-category").value = product.category;
  document.getElementById("product-image").value = "";
  updateProductImagePreview(product.imageUrl || "");
  state.productImageData = product.imageUrl || "";
  document.getElementById("product-color").value = product.color;
  document.getElementById("product-description").value = product.description;
  state.editProductId = product.id;
}

function saveProductForm() {
  const name = document.getElementById("product-name").value.trim();
  const price = Number(document.getElementById("product-price").value);
  const sizeInfo = document.getElementById("product-size").value.trim();
  const category = document.getElementById("product-category").value.trim();
  const color = document.getElementById("product-color").value;
  const description = document.getElementById("product-description").value.trim();
  const fileInput = document.getElementById("product-image");
  const file = fileInput.files?.[0];

  if (!name || !description || !sizeInfo || !category || !price || price <= 0) {
    alert("Preencha todos os campos do produto corretamente.");
    return;
  }

  const saveWithImageUrl = (imageUrl) => {
    if (state.editProductId) {
      const product = state.products.find((item) => item.id === state.editProductId);
      if (!product) return;
      product.name = name;
      product.description = description;
      product.price = price;
      product.sizeInfo = sizeInfo;
      product.category = category;
      product.color = color;
      product.imageUrl = imageUrl || product.imageUrl || "";
    } else {
      const nextId = state.products.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      state.products.push({
        id: nextId,
        name,
        description,
        price,
        sizeInfo,
        category,
        color,
        imageUrl: imageUrl || "",
      });
    }

    saveProducts();
    clearProductForm();
    render();
    renderAdminProductList();
  };

  if (file) {
    readFileAsDataUrl(file)
      .then((dataUrl) => {
        state.productImageData = dataUrl;
        updateProductImagePreview(dataUrl);
        saveWithImageUrl(dataUrl);
      })
      .catch(() => {
        alert("Não foi possível ler a imagem escolhida. Tente outra foto.");
      });
  } else {
    saveWithImageUrl(state.productImageData);
  }
}

function bindAdminEvents() {
  const adminBack = document.getElementById("admin-back");
  const adminLogout = document.getElementById("admin-logout");
  const adminLoginButton = document.getElementById("admin-login-button");
  const productSave = document.getElementById("product-save");

  const productImageInput = document.getElementById("product-image");
  productImageInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      state.productImageData = "";
      updateProductImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem.");
      event.target.value = "";
      state.productImageData = "";
      updateProductImagePreview("");
      return;
    }

    readFileAsDataUrl(file)
      .then((dataUrl) => {
        state.productImageData = dataUrl;
        updateProductImagePreview(dataUrl);
      })
      .catch(() => {
        alert("Não foi possível ler a imagem escolhida. Tente outra foto.");
      });
  });

  adminBack.addEventListener("click", () => {
    showCatalogPage();
  });

  adminLogout.addEventListener("click", () => {
    state.adminAuthenticated = false;
    clearProductForm();
    renderAdmin();
  });

  adminLoginButton.addEventListener("click", () => {
    const password = document.getElementById("admin-password").value;
    if (password === storeConfig.adminPassword) {
      state.adminAuthenticated = true;
      renderAdmin();
      document.getElementById("admin-password").value = "";
    } else {
      alert("Senha incorreta. Tente novamente.");
    }
  });

  productSave.addEventListener("click", saveProductForm);

  document.addEventListener("click", (event) => {
    const editButton = event.target.closest("button.admin-edit");
    const deleteButton = event.target.closest("button.admin-delete");

    if (editButton) {
      const id = Number(editButton.dataset.id);
      const product = state.products.find((item) => item.id === id);
      if (product) {
        fillProductForm(product);
        showAdminPage();
      }
    }

    if (deleteButton) {
      const id = Number(deleteButton.dataset.id);
      state.products = state.products.filter((item) => item.id !== id);
      saveProducts();
      render();
      renderAdminProductList();
    }
  });
}

function bindCartEvents() {
  const cartToggle = document.getElementById("cart-toggle");
  const cartPanel = document.getElementById("cart-panel");
  const cartClose = document.getElementById("cart-close");
  const cartOverlay = document.getElementById("cart-overlay");

  function openCart() {
    cartPanel.classList.add("open");
    cartOverlay.classList.add("open");
  }

  function closeCart() {
    cartPanel.classList.remove("open");
    cartOverlay.classList.remove("open");
  }

  cartToggle.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const { action, id } = button.dataset;
    if (action === "increase") updateQty(Number(id), 1);
    if (action === "decrease") updateQty(Number(id), -1);
    if (action === "remove") removeFromCart(Number(id));
  });

  document.addEventListener("change", (event) => {
    const input = event.target.closest("input.qty-input");
    if (!input) return;
    const qty = Number(input.value);
    if (!Number.isFinite(qty) || qty < 1) {
      removeFromCart(Number(input.dataset.id));
      return;
    }
    state.cart[Number(input.dataset.id)] = qty;
    saveCart();
    render();
  });
}

function render() {
  document.getElementById("store-name").textContent = storeConfig.storeName;
  document.getElementById("welcome-text").textContent = storeConfig.welcomeText;
  renderCategories();
  renderProducts();
  renderCart();
  renderAdmin();
}

function init() {
  loadCart();
  loadProducts();
  bindCartEvents();
  bindAdminEvents();
  render();

  if (window.location.hash === "#admin") {
    showAdminPage();
  }
}

init();
