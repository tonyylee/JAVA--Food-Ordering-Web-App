import { menuArray } from './data.js'

// Global cart object to track selected items
let cart = {}

// Central click handler using event delegation
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]')
  if (!btn) return

  e.preventDefault()

  const id = btn.dataset.uuid
  const action = btn.dataset.action

  switch (action) {
    case 'plus':
      addToCart(id)
      break
    case 'minus':
      removeFromCart(id)
      break
    case 'remove':
      delete cart[id]
      break
    case 'complete':
      document.getElementById('modal').classList.remove('hidden')
      break  
    case 'pay':
      document.getElementById('modal').classList.add('hidden')
      break
  }

  render()
})

// Adds an item or increments quantity if already in cart
function addToCart(id) {
  const item = menuArray.find(m => m.uuid === id)
  if (!item) return

  if (!cart[id]) {
    cart[id] = {
      name: item.name,
      price: item.price,
      quantity: 1
    }
  } else {
    cart[id].quantity++
  }
}

// Decreases quantity or removes item if quantity reaches 0
function removeFromCart(id) {
  if (!cart[id]) return

  cart[id].quantity--

  if (cart[id].quantity === 0) {
    delete cart[id]
  }
}

// Generates HTML for menu items plus discount banner
function getMenuHtml() {
  const menuHtml = menuArray.map(({ emoji, name, ingredients, price, uuid }) => `
    <div class="menu-outer" data-uuid="${uuid}">
      <div class="menu-item">
        <div class="emoji">${emoji}</div>
        <div class="menu-item-info">
          <h2>${name}</h2>
          <p class="ingredients">${ingredients}</p>
          <p class="price">$${price}</p>
        </div>
      </div>
      <div class="cart-btns">
        <button class="cart" data-uuid="${uuid}" data-action="plus">+</button>
        <button class="cart" data-uuid="${uuid}" data-action="minus">-</button>
      </div>
    </div>
  `).join('')

  return `
    <div class="menu-html">
      <div class="discount-title">
        <h3 class="discount">New customers get 20% off their first order!</h3>
      </div>
      ${menuHtml}
    </div>
  `
}

// Generates HTML for the order summary including discounts
function getOrderTotalHtml() {
  const ids = Object.keys(cart)
  if (ids.length === 0) return ''

  let totalPrice = 0

  const orderItemsHtml = ids.map(id => {
    const { name, price, quantity } = cart[id]
    totalPrice += price * quantity

    return `
      <div class="item-order">
        <div class="name-container">
          <p class="item-name">${name}</p>
          <button class="remove-button" data-uuid="${id}" data-action="remove">remove</button>
        </div>
        <p class="item-quantity">${quantity}</p>
      </div>
    `
  }).join('')

  const discountedTotal = (totalPrice * 0.8).toFixed(2)

  return `
    <div class="order-total-container">
      <div class="order-title">
        <h2 class="title">Your Order</h2>
      </div>
      ${orderItemsHtml}
      <div class="bot-order">
        <div class="total-price-container">
          <h3 class="total-text">Total price:</h3>
          <div class="price-num">
            (<span class="total-amount">$${totalPrice}</span>)
            -
            <span class="discount">20%</span>
            =
            <h3 class="total-text">$${discountedTotal}</h3>
          </div>
        </div>
        <button class="complete-order-btn" id="complete-btn" data-action="complete">Complete order</button>
      </div>
    </div>
  `
}

// Payment form handling
const form = document.getElementById('payment-form')

form.addEventListener('submit', e => {
  e.preventDefault()

  if (!form.checkValidity()) return

  document.getElementById('modal').classList.add('hidden')

  const userName = form.name.value || 'Customer'
  const orderTotalEl = document.getElementById('order-total')

  orderTotalEl.innerHTML = ''

  const finalDiv = document.createElement('div')
  finalDiv.classList.add('final-order')

  const heading = document.createElement('h2')
  heading.textContent = `Thanks ${userName}! Your order is on its way!`

  finalDiv.appendChild(heading)
  orderTotalEl.appendChild(finalDiv)

  cart = {}
  form.reset()
})

// Render menu and order summary on page load or updates
function render() {
  document.getElementById('menu').innerHTML = getMenuHtml()
  document.getElementById('order-total').innerHTML = getOrderTotalHtml()
}

render()
