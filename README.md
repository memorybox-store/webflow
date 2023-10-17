# Memory Box Webflow JavaScript Integration

This document provides guidelines for integrating the provided JavaScript code into your Webflow project. 


# For Developers

This project utilizes TypeScript and Webpack for a streamlined development process. Follow the instructions below to set up the development environment and integrate the necessary files.

## Development Environment

To get started, make sure you have Node.js installed on your machine.

### Installation

Clone the repository to your local device and run the following command.

```bash
npm install
```

### Development Server

To run the development server:

```bash
npm run dev
```

This command will use Webpack to serve the project in development mode.

### Build

For production build:

```bash
npm run build
```

The built files will be located in the `/dist` folder.

### Release

Push the built code to GitHub server. Go to [Releases](https://github.com/memorybox-store/webflow/releases) and click on [Draft a new release](https://github.com/memorybox-store/webflow/releases/new) to create new release with new version as tag name by using v for prefix.

#### Example:
`v1.0.0`

### CDN for Assets

This project utilizes the CDN service from [jsDelivr](https://www.jsdelivr.com/github) for hosting assets.
- /dist/assets/style.css
- /dist/bundle.js

### Update Webflow Custom Code

Go to [Site Settings](https://webflow.com/dashboard/sites/memorybox/general) > [Custom code](https://webflow.com/dashboard/sites/memorybox/code) in you webflow project

#### Stylesheet

Add the following line to the `Head code` section to include the stylesheet:

```bash
<!-- Includes Custom Style -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/memorybox-store/webflow@<VERSION>/dist/assets/style.css">
```

#### JavaScript Script

Add the following line to the `Footer code` section to include the script:

```bash
<!-- Includes Custom Script -->
<script src="https://cdn.jsdelivr.net/gh/memorybox-store/webflow@<VERSION>/dist/bundle.js"></script>
```

Replace `<VERSION>` with the new GitHub released version.

#### Opn Payments (Omise) Pre-build Form

The Opn Payments (Omise) prebuilt form is neccessary for payment, add the following code to the `Footer code` section:

```bash
<!-- Initialize Opn Payments (Omise) -->
<form id="checkout-omise-form" method="POST" action="https://memorybox-store.web.app/opn/charge">
  <script type="text/javascript" src="https://cdn.omise.co/omise.js"
          data-key="<PUBLIC_KEY>"
          data-button-label="Checkout 0.00 THB"
          data-amount="0"
          data-currency="THB"
          data-default-payment-method="credit_card"
          data-other-payment-methods="alipay,alipay_cn,alipay_hk,convenience_store,pay_easy,net_banking,googlepay,internet_banking,internet_banking_bay,internet_banking_bbl,mobile_banking_bay,mobile_banking_bbl,mobile_banking_kbank,mobile_banking_ktb,mobile_banking_scb,promptpay,points_citi,rabbit_linepay,shopeepay,truemoney"
  >
  </script>
</form>
```

Replace `<PUBLIC_KEY>` with **Opn Payments** `Public Key`.

The `action` atrribute for **form** must be set to the charge endpoint at [https://memorybox-store.web.app/opn/charge](https://memorybox-store.web.app/opn/charge) on the server [memorybox-store.web.app](https://memorybox-store.web.app) running on [Firebase Hosting project](https://github.com/memorybox-store/server) because **Opn API** only works on **server-side** for security reasons.

# For Designers

The JavaScript code defines various element IDs, classes, and names that are crucial for the proper functioning of your website.

## Table of Contents
1. [Login](#login)
2. [Register](#register)
3. [User](#user)
4. [Finder](#finder)
5. [Social Connect](#social-connect)
6. [Omise](#omise)
7. [Cart](#cart)
8. [Face Scan](#face-scan)
9. [Result (Product)](#result-product)
10. [Payment](#payment)
11. [Payment Process](#payment-process)
12. [Order](#order)

## Login

- **Login Form:** `email-form`
- **Logout Button:** `logout-button`

## Register

- **Register Form:** `register-form`
- **Register Accept:** `register-accept`

## User

- **User Name:** `user-name`
- **User Avatar:** `user-avatar`
- **User Tab Cart:** `user-tab-cart`
- **User Tab Payment:** `user-tab-payment`
- **User Tab Download:** `user-tab-download`

## Finder

- **Finder Form:** `finder-form`
- **Select Company:** `company-select`
- **Select Trip Date:** `date-input`
- **Select Boat:** `boat-select`
- **Dropdown Company:** `company-selector`
- **Dropdown Boat:** `boat-selector`
- **Select Class:** `w-dropdown-link`
- **Select Open Class:** `w--open`

## Social Connect

- **Facebook Button:** `fb-login-button`
- **Google Button:** `google-login-button`
- **Line Button:** `line-login-button`

## Omise

- **Checkout Omise Form:** `checkout-omise-form`
- **Checkout Omise Script:** `checkout-omise-script`
- **Omise Checkout Button:** `omise-checkout-button`

## Cart

- **Cart Items Badge:** `cart-items-badge`
- **Cart Button:** `charge-button`
- **Cart Checkout Button:** `cart-checkout-button`
- **Cart Form Class:** `w-commerce-commercecartform`
- **Cart List Class:** `w-commerce-commercecartlist`
- **Cart Amount Class:** `w-commerce-commercecartordervalue`
- **Cart Empty Class:** `w-commerce-commercecartemptystate`
- **Cart Error Class:** `w-commerce-commercecarterrorstate`
- **Don't Checkout Button:** `cart-checkout-button`
- **Remove Button Class:** `cart-remove-button`
- **Modal Cart Class:** `commerce-cart-container-wrapper`
- **Modal Cart Open Link Class:** `commerce-cart-open-link`
- **Modal Cart Close Link Class:** `commerce-cart-close-link`

## Face Scan

- **Facescan Uploader:** `facescan-uploader`
- **Facescan Form:** `facescan-form`
- **Facescan Input:** `facescan-input`
- **Facescan Preview:** `facescan-preview`
- **Facescan Button:** `facescan-submit-button`
- **Photo Scanning Status:** `photo-scanning-status`
- **Photo Scanning:** `photo-scanning`

## Result (Product)

- **Result My Pic:** `result-my-pic`
- **Result Total:** `result-total-pic`
- **Result Boat:** `result-boat`
- **Result Company:** `result-company`
- **Result Header Company:** `result-header-company`
- **Result Header Date:** `result-header-date`
- **Result Container:** `result-container`
- **Result Sample:** `result-sample`
- **Card Photo Class:** `card-photo`
- **Popup Image Class:** `popup-image`
- **Popup Close Button Class:** `popup-close-button`
- **Add to Cart Button Class:** `add-to-cart-button`
- **Add to Cart Popup Button Class:** `add-to-cart-popup-button`
- **Popup Title Class:** `data-popup-title`
- **Popup Subtitle Class:** `data-popup-subtitle`
- **Photo Image Class:** `photo-image`
- **Photo Class:** `photo`
- **Report Button Class:** `report-button`
- **Report Popup Class:** `popup-report`
- **Report Close Button Class:** `report-close-button`
- **Report Submit Button Class:** `report-submit-button`
- **Report Title Class:** `report-title`
- **Report Date Class:** `report-date`
- **Report Boat Class:** `report-boat`
- **Report Destination Class:** `report-destination`
- **Report Admin Class:** `report-admin`
- **Report Email Class:** `report-email`

## Payment

- **Payment Form:** `payment-form`
- **Payment Summary:** `payment-summary`
- **Payment Discount Badge:** `payment-discount-badge`
- **Payment Total:** `payment-total`
- **Payment List:** `payment-list`
- **Payment Item Sample:** `payment-item-sample`
- **Payment Checkout Button:** `payment-checkout-button`
- **Checkbox All ID:** `checkbox-payment-all`
- **Checkbox Payment Name:** `checkbox_payment`
- **Payment Item Class:** `payment-item`
- **Payment Item Name Class:** `payment-item-name`
- **Payment Item Company Class:** `payment-item-company`
- **Payment Item Size Class:** `payment-item-size`
- **Payment Item Price Class:** `payment-item-price`
- **Payment Item Image Class:** `payment-item-image`
- **Payment Item Remove Button Class:** `payment-item-remove`

## Payment Process

- **Payment Process ID:** `payment-process`
- **Payment Process Scannable ID:** `payment-process-scannable`
- **Payment Process Authorize ID:** `payment-process-authorize`
- **Payment Process Scannable Helper ID:** `payment-process-scannable-helper`
- **Payment Process Cancel ID:** `payment-process-cancel`

## Order

- **Order Count ID:** `order-count`
- **Order Form List ID:** `order-form-list`
- **Order Form Sample ID:** `order-form-sample`
- **Order Form Class:** `order-form`
- **Order No Class:** `order-no`
- **Order Summary Class:** `order-summary`
- **Order Total Class:** `order-total`
- **Order List Class:** `order-list`
- **Order Item Sample Class:** `order-item-sample`
- **Order Checkout Button Class:** `order-checkout-button`
- **Order Cancel Button Class:** `order-cancel-button`
- **Order Item Class:** `order-item`
- **Order Item Name Class:** `order-item-name`
- **Order Item Company Class:** `order-item-company`
- **Order Item Size Class:** `order-item-size`
- **Order Item Price Class:** `order-item-price`
- **Order Item Image Class:** `order-item-image`
