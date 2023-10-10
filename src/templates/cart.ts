export const cartItemTemplate = `
<div style="display: flex; margin-top: 10px; margin-bottom: 10px;">
  <img src="{{cartImage}}" style="flex: auto; width: 60px; border-radius: 12px;">
  <div style="flex: auto; padding: 12px;">
    <h5 style="margin: 0; color: #6f7182;">{{cartName}}</h5>
    <p style="margin: 0;">{{cartCompany}}</p>
    <p style="margin: 0;">฿ {{cartPrice}} THB</p>
    <p style="margin: 10px 0 0;">
      <a href="#" class="cart-remove-button" data-target="{{cartId}}" data-name="{{cartNamePrompt}}">
        Remove
      </a>
    </p>
  </div>
</div>
`;