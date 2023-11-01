# Memory Box Webflow JavaScript Integration

This document provides guidelines for integrating the provided JavaScript code into your Webflow project. 


# For Developers

This project utilizes TypeScript and Webpack for a streamlined development process. Follow the instructions below to set up the development environment and integrate the necessary files.

## Development Environment

To get started, make sure you have Node.js installed on your machine.

### Installation

Clone this repository.

```bash
git clone https://github.com/memorybox-store/webflow.git
cd memorybox-server
```

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
<form id="checkout-omise-form" method="POST" action="https://asia-southeast1-memorybox-store.cloudfunctions.net/app/opn/charge">
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

The `action` atrribute for **form** must be set to the charge endpoint at [https://asia-southeast1-memorybox-store.cloudfunctions.net/app/opn/charge](https://asia-southeast1-memorybox-store.cloudfunctions.net/app/opn/charge) on the server [asia-southeast1-memorybox-store.cloudfunctions.net/app](https://asia-southeast1-memorybox-store.cloudfunctions.net/app) running on [Firebase Hosting project](https://github.com/memorybox-store/server) because **Opn API** only works on **server-side** for security reasons.

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

- **Form Attribute - Redirect URI:** `data-redirect-uri`
- **Form ID:** `email-form`

## Logout

- **Button ID:** `logout-button`

## Register

- **Form Attribute - Redirect URI:** `data-redirect-uri`
- **Form ID:** `register-form`
- **Accep ID:** `register-accept`
- **Button ID:** `register-button`

## User

- **Name Class:** `user-name`
- **Avatar Class:** `user-avatar`
- **Tab Cart ID:** `user-tab-cart`
- **Tab Payment ID:** `user-tab-payment`
- **Tab Download ID:** `user-tab-download`

## Finder

- **Form Attribute - Result URI:** `data-result-uri`
- **Form Attribute - Empty Company Message:** `data-empty-company`
- **Form Attribute - Empty Date Message:** `data-empty-date`
- **Form Attribute - Empty Boat Message:** `data-empty-boat`
- **Form ID:** `finder-form`
- **Select Company ID:** `company-select`
- **Select Trip Date ID:** `date-input`
- **Select Boat ID:** `boat-select`
- **Dropdown Company ID (Deprecated):** `company-selector`
- **Dropdown Boat (Deprecated):** `boat-selector`
- **Select Class (Deprecated):** `w-dropdown-link`
- **Select Open Class (Deprecated):** `w--open`

## Social Connect

- **Facebook Button ID:** `fb-login-button`
- **Google Button ID:** `google-login-button`
- **Line Button ID:** `line-login-button`

## Opn Payments (Omise)

- **Checkout Form ID:** `checkout-omise-form`
- **Checkout Script ID:** `checkout-omise-script`
- **Checkout Button ID:** `omise-checkout-button`

## Cart

- **Checkout Badge Attribute - Result URI:** `data-checkout-uri`
- **Checkout Badge Attribute - Remove Prompt Message:** `data-remove-prompt` ({{name}} = Item name)
- **Checkout Badge Attribute - Cancel Button Confirm Text:** `data-remove-button-confirm`
- **Checkout Badge Attribute - Cancel Button Cancel Text:** `data-remove-button-cancel`
- **Items Badge ID:** `cart-items-badge`
- **Button ID:** `charge-button`
- **Checkout Button ID:** `cart-checkout-button`
- **Form Class:** `w-commerce-commercecartform`
- **List Class:** `w-commerce-commercecartlist`
- **Amount Class:** `w-commerce-commercecartordervalue`
- **Empty Class:** `w-commerce-commercecartemptystate`
- **Error Class:** `w-commerce-commercecarterrorstate`
- **Remove Button Class:** `cart-remove-button`
- **Checkout Button dnt- attribute:** `cart-checkout-button`
- **Modal Cart dnt- attribute:** `commerce-cart-container-wrapper`
- **Modal Cart Open Link dnt- attribute:** `commerce-cart-open-link`
- **Modal Cart Close Link dnt- attribute:** `commerce-cart-close-link`

## Face Scan

- **Button Attribute - No Face Message:** `data-noface`
- **Button Attribute - Scanning Message:** `data-scanning` ({{scanned}} = Scanned number, {{total}} = Total number, {{found}} = Found number)
- **Button Attribute - Scanning Status Message:** `data-scanning-status`
- **Button Attribute - Invalid Photo Message:** `data-invalid`
- **Button Attribute - Initializing Message:** `data-initializing`
- **Uploader ID:** `facescan-uploader`
- **Form ID:** `facescan-form`
- **Input ID:** `facescan-input`
- **Preview ID:** `facescan-preview`
- **Button ID:** `facescan-submit-button`
- **Photo Scanning Status ID:** `photo-scanning-status`
- **Photo Scanning ID:** `photo-scanning`

## Result (Product)

- **My Pic ID:** `result-my-pic`
- **Total ID:** `result-total-pic`
- **Boat ID:** `result-boat`
- **Company ID:** `result-company`
- **Header Company ID:** `result-header-company`
- **Header Date ID:** `result-header-date`
- **Container ID:** `result-container`
- **Sample ID:** `result-sample`
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

- **Form Attribute - Payment Return URI:** `data-payment-return-uri`
- **Form Attribute - Empty Item:** `data-empty`
- **Form Attribute - Loading:** `data-wait`
- **Count ID:** `payment-count`
- **Form ID:** `payment-form`
- **Summary ID:** `payment-summary`
- **Discount Badge ID:** `payment-discount-badge`
- **Total ID:** `payment-total`
- **List ID:** `payment-list`
- **Item Sample ID:** `payment-item-sample`
- **Checkout Button ID:** `payment-checkout-button`
- **Checkbox All ID:** `checkbox-payment-all`
- **Checkbox Payment Name:** `checkbox_payment`
- **Item Class:** `payment-item`
- **Item Name Class:** `payment-item-name`
- **Item Company Class:** `payment-item-company`
- **Item Size Class:** `payment-item-size`
- **Item Price Class:** `payment-item-price`
- **Item Image Class:** `payment-item-image`
- **Item Remove Button Class:** `payment-item-remove`


## Payment Process

- **ID:** `payment-process`
- **Scannable ID:** `payment-process-scannable`
- **Authorize ID:** `payment-process-authorize`
- **Scannable Helper ID:** `payment-process-scannable-helper`
- **Cancel ID:** `payment-process-cancel`

## Order

- **Form Attribute - Payment Return URI:** `data-payment-return-uri`
- **Form Attribute - Cancel Prompt Message:** `data-cancel-prompt` ({{name}} = Item name)
- **Form Attribute - Cancel Button Confirm Text:** `data-cancel-button-confirm`
- **Form Attribute - Cancel Button Cancel Text:** `data-cancel-button-cancel`
- **Count ID:** `order-count`
- **Form List ID:** `order-form-list`
- **Form Sample ID:** `order-form-sample`
- **Form Class:** `order-form`
- **No Class:** `order-no`
- **Summary Class:** `order-summary`
- **Total Class:** `order-total`
- **List Class:** `order-list`
- **Item Sample Class:** `order-item-sample`
- **Checkout Button Class:** `order-checkout-button`
- **Cancel Button Class:** `order-cancel-button`
- **Item Class:** `order-item`
- **Item Name Class:** `order-item-name`
- **Item Company Class:** `order-item-company`
- **Item Size Class:** `order-item-size`
- **Item Price Class:** `order-item-price`
- **Item Image Class:** `order-item-image`

## Download

- **List ID:** `download-list`
- **Count ID:** `download-count`
- **Item Class:** `download-item`
- **Button Class:** `download-button`
- **Item Sample ID:** `download-item-sample`