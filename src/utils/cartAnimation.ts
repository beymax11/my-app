export const createFlyingCartAnimation = (
  buttonElement: HTMLElement,
  cartIconElement: HTMLElement,
  onComplete?: () => void
) => {
  // Create a clone of the cart icon for animation
  const flyingIcon = document.createElement('div');
  flyingIcon.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 18C5.9 18 5.01 18.9 5.01 20S5.9 22 7 22 9 21.1 9 20 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.24 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.58 17.3 11.97L20.88 5H5.21L4.27 3H1V2ZM17 18C15.9 18 15.01 18.9 15.01 20S15.9 22 17 22 19 21.1 19 20 18.1 18 17 18Z" fill="currentColor"/>
    </svg>
  `;
  
  // Style the flying icon
  flyingIcon.style.position = 'fixed';
  flyingIcon.style.zIndex = '9999';
  flyingIcon.style.pointerEvents = 'none';
  flyingIcon.style.color = '#ef4444'; // red-500
  flyingIcon.style.width = '24px';
  flyingIcon.style.height = '24px';
  flyingIcon.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  flyingIcon.style.opacity = '1';
  flyingIcon.style.transform = 'scale(1)';

  // Get button position
  const buttonRect = buttonElement.getBoundingClientRect();
  const cartRect = cartIconElement.getBoundingClientRect();

  // Set initial position (at button)
  flyingIcon.style.left = `${buttonRect.left + buttonRect.width / 2 - 12}px`;
  flyingIcon.style.top = `${buttonRect.top + buttonRect.height / 2 - 12}px`;

  // Add to document
  document.body.appendChild(flyingIcon);

  // Trigger animation after a small delay
  setTimeout(() => {
    flyingIcon.style.left = `${cartRect.left + cartRect.width / 2 - 12}px`;
    flyingIcon.style.top = `${cartRect.top + cartRect.height / 2 - 12}px`;
    flyingIcon.style.transform = 'scale(0.5)';
    flyingIcon.style.opacity = '0.5';
  }, 50);

  // Clean up and trigger callback
  setTimeout(() => {
    document.body.removeChild(flyingIcon);
    if (onComplete) {
      onComplete();
    }
  }, 850);

  // Add a bounce effect to the cart icon
  cartIconElement.style.transform = 'scale(1.2)';
  cartIconElement.style.transition = 'transform 0.2s ease';
  setTimeout(() => {
    cartIconElement.style.transform = 'scale(1)';
  }, 200);
};

export const addToCartWithAnimation = async (
  buttonElement: HTMLElement,
  cartIconElement: HTMLElement,
  addToCartFunction: () => void | Promise<void>,
  onComplete?: () => void
) => {
  // Trigger the add to cart function
  await addToCartFunction();
  
  // Start the animation
  createFlyingCartAnimation(buttonElement, cartIconElement, onComplete);
};
