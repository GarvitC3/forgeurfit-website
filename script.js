const state = {
  cart: JSON.parse(localStorage.getItem("forgeCart") || "[]"),
  products: [
    { id:"brand-hoodie", name:"Hoodie with ForgeUrFit Design", category:"hoodies", price:25, icon:"👕", tag:"Brand design", desc:"A ready-to-wear ForgeUrFit hoodie with the brand's streetwear look." },
    { id:"custom-hoodie", name:"Custom Hoodie", category:"hoodies", price:45, icon:"🧥", tag:"Most popular", desc:"A hoodie customized with your name, graphic, quote, club, team, or event idea." },
    { id:"brand-shirt", name:"Shirt with ForgeUrFit Design", category:"shirts", price:15, icon:"👕", tag:"Lowest price", desc:"A clean brand-design shirt for customers who want a simple ForgeUrFit piece." },
    { id:"custom-shirt", name:"Custom T-Shirt", category:"shirts", price:25, icon:"👕", tag:"Custom", desc:"A personalized shirt designed around your own idea, text, or graphic." },
    { id:"custom-sweatpants", name:"Custom Sweatpants", category:"sweatpants", price:35, icon:"👖", tag:"Streetwear", desc:"Comfortable sweatpants personalized to match a hoodie, team, or group design." },
    { id:"design-setup", name:"Custom Design Setup", category:"services", price:10, icon:"✏️", tag:"Service", desc:"Extra design support when you need ForgeUrFit to build the concept for you." },
    { id:"rush-order", name:"Rush Order Add-On", category:"services", price:12, icon:"⏱️", tag:"Add-on", desc:"A faster turnaround option when your order is needed for an event or deadline." }
  ],
  faqs: [
    ["What does ForgeUrFit sell?", "ForgeUrFit sells personalized streetwear-style clothing, mainly shirts, hoodies, and sweatpants. Customers can choose a brand design or request a custom design."],
    ["Do I need to order in bulk?", "No. One of our advantages is that customers can order smaller quantities instead of needing a large bulk order."],
    ["How do custom designs work?", "Customers send their idea, name, logo, quote, school club, team, or event details. ForgeUrFit confirms the design before printing."],
    ["Who is the target customer?", "Our main target market is teens and young adults in the GTA, especially students who want affordable and personal clothing."],
    ["Are prices before tax?", "Yes. Product prices are shown before tax, and the pricing page also shows the estimated price after 13% HST."],
    ["Where is ForgeUrFit based?", "ForgeUrFit is focused on the local GTA community, including Brampton, Mississauga, Caledon, and nearby areas."],
    ["Can schools, clubs, or teams order?", "Yes. ForgeUrFit is a good fit for school clubs, sports teams, friend groups, senior year apparel, events, and matching designs."],
    ["Is the website a real checkout store?", "This version is an order-inquiry website. Customers can build a bag and send the order details for confirmation before payment."],
  ]
};

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const money = (n) => `$${Number(n).toFixed(2)}`;
const withTax = (n) => n * 1.13;

function routeTo(hash = window.location.hash) {
  const route = (hash || "#home").replace("#", "");
  $$("[data-page]").forEach(p => p.classList.toggle("active", p.dataset.page === route));
  $$('[data-route]').forEach(a => a.classList.toggle("active", a.dataset.route === route));
  $("[data-mobile-panel]").classList.remove("open");
  window.scrollTo({top:0, behavior:"smooth"});
}

function renderProducts(filter="all") {
  const grid = $("#productGrid");
  if (!grid) return;
  const items = state.products.filter(p => filter === "all" || p.category === filter);
  grid.innerHTML = items.map(p => `
    <article class="product-card reveal" data-category="${p.category}">
      <div class="product-visual"><div class="product-icon">${p.icon}</div></div>
      <div class="product-body">
        <span class="pill">${p.tag}</span>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="product-meta"><span>Starting at</span><strong class="price">${money(p.price)}</strong></div>
        <div class="product-actions">
          <button class="mini-btn add" data-add="${p.id}">Add to bag</button>
          <a class="mini-btn" href="#customize">Customize</a>
        </div>
      </div>
    </article>`).join("");
}

function saveCart(){localStorage.setItem("forgeCart", JSON.stringify(state.cart));}
function addToCart(productId, qty=1, details="") {
  const product = state.products.find(p => p.id === productId) || {id:Date.now().toString(), name:productId, price:0};
  state.cart.push({ id: `${product.id}-${Date.now()}`, productId: product.id, name: product.name, price: product.price, qty, details });
  saveCart();
  renderCart();
  openCart();
}
function removeCart(id){state.cart = state.cart.filter(item => item.id !== id); saveCart(); renderCart();}
function renderCart(){
  $("#cartCount").textContent = state.cart.reduce((s,i)=>s+i.qty,0);
  const list = $("#cartItems");
  if (!state.cart.length) {
    list.innerHTML = `<div class="notice">Your bag is empty. Add a product or build a custom order.</div>`;
  } else {
    list.innerHTML = state.cart.map(item => `
      <div class="cart-item">
        <strong>${item.name}</strong>
        <small>${item.details || "No extra notes"}</small>
        <div><span>${item.qty} × ${money(item.price)}</span><button data-remove="${item.id}">Remove</button></div>
      </div>`).join("");
  }
  const subtotal = state.cart.reduce((s,i)=>s+i.price*i.qty,0);
  $("#cartSubtotal").textContent = money(subtotal);
  $("#cartTax").textContent = money(subtotal * .13);
  $("#cartTotal").textContent = money(withTax(subtotal));
}
function openCart(){ $("[data-cart-drawer]").classList.add("open"); $("[data-overlay]").classList.add("open");}
function closeCart(){ $("[data-cart-drawer]").classList.remove("open"); $("[data-overlay]").classList.remove("open");}

function updateEstimate(){
  const select = $("#buildProduct"); if (!select) return;
  const option = select.selectedOptions[0];
  const base = Number(option.dataset.price || 0);
  const qty = Math.max(1, Number($("#buildQty").value || 1));
  const rush = $("#rushToggle").checked ? 12 : 0;
  const subtotal = (base * qty) + rush;
  $("#estimateTotal").textContent = money(withTax(subtotal));
  $("#estimateLines").innerHTML = `
    <div><span>${option.value} × ${qty}</span><strong>${money(base * qty)}</strong></div>
    <div><span>Rush order</span><strong>${money(rush)}</strong></div>
    <div><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
    <div><span>13% HST</span><strong>${money(subtotal*.13)}</strong></div>`;
}

function renderFaq(){
  const list = $("#faqList"); if (!list) return;
  list.innerHTML = state.faqs.map(([q,a], i) => `
    <div class="faq-item ${i===0 ? "open" : ""}">
      <button class="faq-question" type="button">${q}<span>+</span></button>
      <div class="faq-answer">${a}</div>
    </div>`).join("");
}

function generateMessage(){
  const name = $("#contactName").value.trim();
  const info = $("#contactInfo").value.trim();
  const message = $("#contactMessage").value.trim();
  const bag = state.cart.length
    ? state.cart.map(i => `- ${i.qty} × ${i.name} (${money(i.price)} each) ${i.details ? `| ${i.details}` : ""}`).join("\n")
    : "No bag items added yet.";
  const output = `Hi ForgeUrFit,\n\nMy name is ${name || "[name]"}.\nContact: ${info || "[contact]"}\n\nOrder idea:\n${message || "[message]"}\n\nBag summary:\n${bag}\n\nPlease confirm the final price, timing, colours, and next steps.\n\nThank you!`;
  $("#generatedMessage").textContent = output;
  $("#emailMessage").href = `mailto:orders@forgeurfit.com?subject=${encodeURIComponent("ForgeUrFit Order Inquiry")}&body=${encodeURIComponent(output)}`;
}

document.addEventListener("click", (e) => {
  const filter = e.target.closest(".filter");
  if (filter) { $$(".filter").forEach(f=>f.classList.remove("active")); filter.classList.add("active"); renderProducts(filter.dataset.filter); }
  const add = e.target.closest("[data-add]");
  if (add) addToCart(add.dataset.add);
  const remove = e.target.closest("[data-remove]");
  if (remove) removeCart(remove.dataset.remove);
  if (e.target.closest("[data-open-cart]")) openCart();
  if (e.target.closest("[data-close-cart]") || e.target.matches("[data-overlay]")) closeCart();
  if (e.target.closest("[data-menu-button]")) $("[data-mobile-panel]").classList.toggle("open");
  const faq = e.target.closest(".faq-question");
  if (faq) faq.parentElement.classList.toggle("open");
  if (e.target.id === "copyMessage") navigator.clipboard?.writeText($("#generatedMessage").textContent);
});

window.addEventListener("hashchange", () => routeTo());

document.addEventListener("input", (e) => {
  if (["buildProduct","buildQty","rushToggle"].includes(e.target.id)) updateEstimate();
});
document.addEventListener("change", (e) => {
  if (["buildProduct","buildQty","rushToggle"].includes(e.target.id)) updateEstimate();
});

$("#builderForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const select = $("#buildProduct");
  const option = select.selectedOptions[0];
  const qty = Math.max(1, Number($("#buildQty").value || 1));
  const details = `Size: ${$("#buildSize").value}; Colour: ${$("#buildColour").value || "Not specified"}; Notes: ${$("#buildNotes").value || "None"}`;
  addToCart(option.value, qty, details);
  if ($("#rushToggle").checked) addToCart("Rush Order Add-On", 1, "Added from custom order builder");
});
$("#resetBuilder")?.addEventListener("click", () => { $("#builderForm").reset(); updateEstimate(); });
$("#contactForm")?.addEventListener("submit", (e) => { e.preventDefault(); generateMessage(); });

renderProducts();
renderFaq();
renderCart();
updateEstimate();
routeTo(window.location.hash);
