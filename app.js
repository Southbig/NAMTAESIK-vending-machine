const PRODUCTS = {
  COKE: {
    name: '콜라',
    price: 1100,
    emoji: '🥤'
  },
  WATER: {
    name: '물',
    price: 600,
    emoji: '💧'
  },
  COFFEE: {
    name: '커피',
    price: 700,
    emoji: '☕'
  }
};

// 상태 관리
const state = {
  selectedProducts: {
    coke: 0,
    water: 0,
    coffee: 0
  },
  cashInserted: 0,
  totalAmount: 0,
  changeAmount: 0,
  cardInserted: false
};

// DOM 요소 선택
const elements = {
  products: {
    coke: document.querySelector('.coke'),
    water: document.querySelector('.water'),
    coffee: document.querySelector('.coffee')
  },
  cashButtons: document.querySelectorAll('.cash-button'),
  cashReturn: document.querySelector('.cash-return'),
  cashDisplay: document.querySelector('.cash-display'),
  selectedProducts: document.querySelector('.selected-products'),
  totalAmount: document.querySelector('.total-amount'),
  changeAmount: document.querySelector('.change-amount'),
  getChange: document.querySelector('.get-change'),
  cardInsert: document.querySelector('.card-insert'),
  cardStatus: document.querySelector('.card-status span'),
  paymentCash: document.querySelector('.payment-cash'),
  paymentCard: document.querySelector('.payment-card'),
  cancelButton: document.querySelector('.cancel-button'),
  resetButton: document.querySelector('.reset-button')
};


function init() {
  // 제품 선택
  elements.products.coke.addEventListener('click', () => selectProduct('coke'));
  elements.products.water.addEventListener('click', () => selectProduct('water'));
  elements.products.coffee.addEventListener('click', () => selectProduct('coffee'));

  // 현금 투입
  elements.cashButtons.forEach(button => {
    button.addEventListener('click', () => {
      insertCash(parseInt(button.dataset.value));
    });
  });

  // 현금 반환
  elements.cashReturn.addEventListener('click', returnCash);

  // 카드 삽입/제거
  elements.cardInsert.addEventListener('click', toggleCard);

  // 결제
  elements.paymentCash.addEventListener('click', processCashPayment);
  elements.paymentCard.addEventListener('click', processCardPayment);
  elements.getChange.addEventListener('click', getChange);

  // 제품 취소
  elements.cancelButton.addEventListener('click', cancelLastProduct);
  elements.resetButton.addEventListener('click', resetAllProducts);

  updateSelectedProductsDisplay();
  updateCashDisplay();
  updateTotalAmountDisplay();
}

function selectProduct(productType) {
  state.selectedProducts[productType]++;

  // 제품 가격에 따라 총액 업데이트
  switch (productType) {
    case 'coke':
      state.totalAmount += PRODUCTS.COKE.price;
      showNotification(`${PRODUCTS.COKE.name} 선택됨`);
      break;
    case 'water':
      state.totalAmount += PRODUCTS.WATER.price;
      showNotification(`${PRODUCTS.WATER.name} 선택됨`);
      break;
    case 'coffee':
      state.totalAmount += PRODUCTS.COFFEE.price;
      showNotification(`${PRODUCTS.COFFEE.name} 선택됨`);
      break;
  }

  updateSelectedProductsDisplay();
  updateTotalAmountDisplay();
}


function insertCash(amount) {
  state.cashInserted += amount;
  updateCashDisplay();
  showNotification(`${formatCurrency(amount)}이 투입되었습니다.`);
}


// 현금 반환 처리
function returnCash() {
  if (state.cashInserted <= 0) {
    showNotification('반환할 현금이 없습니다.');
    return;
  }

  showNotification(`${formatCurrency(state.cashInserted)}이 반환되었습니다.`);
  state.cashInserted = 0;
  updateCashDisplay();

  // 거스름돈 관련 UI 업데이트
  elements.changeAmount.textContent = '';
  elements.getChange.classList.add('hidden');
}


// 카드 삽입/제거 토글
function toggleCard() {
  state.cardInserted = !state.cardInserted;
  elements.cardStatus.textContent = state.cardInserted ? '삽입됨' : '미삽입';
  showNotification(state.cardInserted ? '카드가 삽입되었습니다.' : '카드가 제거되었습니다.');
}


// 현금 결제 처리
function processCashPayment() {
  // 제품 선택 확인
  if (!hasSelectedProducts()) {
    showNotification('제품을 선택해주세요.');
    return;
  }

  // 현금 확인
  if (state.cashInserted <= 0) {
    showNotification('현금을 투입해주세요.');
    return;
  }

  // 금액 부족 확인
  if (state.cashInserted < state.totalAmount) {
    showNotification('금액이 부족합니다.');
    return;
  }

  // 결제 처리
  state.changeAmount = state.cashInserted - state.totalAmount;
  showNotification('현금 결제가 완료되었습니다.');

  // 거스름돈 처리
  if (state.changeAmount > 0) {
    elements.changeAmount.textContent = `거스름돈: ${formatCurrency(state.changeAmount)}`;
    elements.getChange.classList.remove('hidden');
  }

  // 상태 업데이트
  elements.totalAmount.textContent = '결제 완료';
  state.cashInserted = 0;
  updateCashDisplay();
  resetSelectedProducts();
}


// 카드 결제 처리
function processCardPayment() {
  // 제품 선택 확인
  if (!hasSelectedProducts()) {
    showNotification('제품을 선택해주세요.');
    return;
  }

  // 카드 삽입 확인
  if (!state.cardInserted) {
    showNotification('카드를 삽입해주세요.');
    return;
  }

  // 결제 처리
  showNotification('카드 결제가 완료되었습니다.');

  // 카드 자동 반환
  state.cardInserted = false;
  elements.cardStatus.textContent = '미삽입';

  // 투입된 현금이 있으면 환불 처리
  if (state.cashInserted > 0) {
    state.changeAmount = state.cashInserted;
    elements.changeAmount.textContent = `환불 금액: ${formatCurrency(state.changeAmount)}`;
    elements.getChange.classList.remove('hidden');
    state.cashInserted = 0;
    updateCashDisplay();
  }

  // 상태 업데이트
  elements.totalAmount.textContent = '결제 완료';
  resetSelectedProducts();
}


// 거스름돈 수령 처리
function getChange() {
  showNotification(`${formatCurrency(state.changeAmount)}을 받았습니다.`);
  state.changeAmount = 0;
  elements.changeAmount.textContent = '';
  elements.getChange.classList.add('hidden');
  elements.totalAmount.textContent = '';
  state.totalAmount = 0;
}


// 선택된 제품이 있는지 확인 
function hasSelectedProducts() {
  return state.selectedProducts.coke > 0 ||
    state.selectedProducts.water > 0 ||
    state.selectedProducts.coffee > 0;
}


// 선택된 마지막 제품 취소
function cancelLastProduct() {
  // 선택된 제품이 있는지 확인
  if (!hasSelectedProducts()) {
    showNotification('취소할 제품이 없습니다.');
    return;
  }

  // 마지막으로 선택된 제품 찾기 
  if (state.selectedProducts.coke > 0) {
    state.selectedProducts.coke--;
    state.totalAmount -= PRODUCTS.COKE.price;
    showNotification(`${PRODUCTS.COKE.name} 1개가 취소되었습니다.`);
  } else if (state.selectedProducts.water > 0) {
    state.selectedProducts.water--;
    state.totalAmount -= PRODUCTS.WATER.price;
    showNotification(`${PRODUCTS.WATER.name} 1개가 취소되었습니다.`);
  } else if (state.selectedProducts.coffee > 0) {
    state.selectedProducts.coffee--;
    state.totalAmount -= PRODUCTS.COFFEE.price;
    showNotification(`${PRODUCTS.COFFEE.name} 1개가 취소되었습니다.`);
  }

  updateSelectedProductsDisplay();
  updateTotalAmountDisplay();
}


// 모든 선택 제품 취소

function resetAllProducts() {
  // 선택된 제품이 있는지 확인
  if (!hasSelectedProducts()) {
    showNotification('취소할 제품이 없습니다.');
    return;
  }

  resetSelectedProducts();
  showNotification('모든 선택이 취소되었습니다.');
}


// 선택된 제품 목록 초기화 
function resetSelectedProducts() {
  state.selectedProducts.coke = 0;
  state.selectedProducts.water = 0;
  state.selectedProducts.coffee = 0;
  state.totalAmount = 0;
  updateSelectedProductsDisplay();
  updateTotalAmountDisplay();
}


// 선택된 제품 디스플레이 업데이트 
function updateSelectedProductsDisplay() {
  const productsText = `선택된 제품: 
    ${PRODUCTS.COKE.emoji} ${PRODUCTS.COKE.name}: ${state.selectedProducts.coke}개, 
    ${PRODUCTS.WATER.emoji} ${PRODUCTS.WATER.name}: ${state.selectedProducts.water}개, 
    ${PRODUCTS.COFFEE.emoji} ${PRODUCTS.COFFEE.name}: ${state.selectedProducts.coffee}개`;

  elements.selectedProducts.textContent = productsText;
}


// 현금 디스플레이 업데이트 
function updateCashDisplay() {
  elements.cashDisplay.textContent = `투입 금액: ${formatCurrency(state.cashInserted)}`;
}


// 총 금액 디스플레이 업데이트 
function updateTotalAmountDisplay() {
  elements.totalAmount.textContent = `결제 금액: ${formatCurrency(state.totalAmount)}`;
}


// 통화 형식으로
function formatCurrency(amount) {
  return `${amount.toLocaleString()}원`;
}


// 사용자에게 알림 표시
function showNotification(message) {
  alert(message);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);