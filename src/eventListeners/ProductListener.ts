import { addItemToCart, getCartItems } from "../api/cart";
import { getProducts } from "../api/product";
import { Product } from "../models/product";
import { updateCartItems } from "./CartListener";

export const ProductListener = (): void => {

  const add = (id: string, companyId: string, itemId: string) => {
    return new Promise(async (resolve, reject) => {
      await addItemToCart(id, companyId, itemId, 1).then(async (data: Array<any>) => {
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  const load = (boatId: string) => {
    return new Promise(async (resolve) => {

      const cardContainer = document.getElementById("cardContainer");
      const sampleElement: HTMLElement
        = document.getElementById('ModuleSample') as HTMLElement;
      sampleElement.style.opacity = '0';
      sampleElement.style.display = 'none';

      await getProducts(boatId).then(async (data: Product[]) => {
        console.log('Product', data);
        for (let item of data) {

          // Copy the card and it's style
          const cardElement: HTMLElement
            = sampleElement.cloneNode(true) as HTMLElement;

          cardElement.setAttribute('id', `product-${item.id}`);
          cardElement.style.opacity = '1';
          cardElement.style.display = '';

          //set image 
          const imgElement: HTMLImageElement
            = cardElement.querySelector('img') as HTMLImageElement;
          imgElement.srcset = item.image;
          imgElement.src = item.image;

          //card.querySelector('a[class="btn-primary small cart w-button"]').onclick = function(){alert(1)} //
          const addButtonElements: HTMLCollectionOf<HTMLElement>
            = cardElement.getElementsByTagName('a') as HTMLCollectionOf<HTMLElement>;
          for (const [_, addNode] of Object.entries(addButtonElements)) {
            addNode.classList.add('product-add-button');
            addNode.setAttribute('data-target', item.id || '');
            addNode.setAttribute('data-company', item.company?.id.toString() || '');
            addNode.setAttribute('data-item', item.itemId.toString() || '');
          }

          cardContainer.appendChild(cardElement);

        }

        const sumMyPicElement: HTMLElement
          = document.getElementById('myPic') as HTMLElement;
        if (sumMyPicElement) {
          sumMyPicElement.innerText = 'N/A';
        }

        const sumTotalElement: HTMLElement
          = document.getElementById('totalPic') as HTMLElement;
        if (sumTotalElement) {
          sumTotalElement.innerText = data.length.toString();
        }

        const sumBoatElement: HTMLElement
          = document.getElementById('boatName') as HTMLElement;
        if (sumBoatElement) {
          sumBoatElement.innerText = data.length ? data[0].name : '-';
        }

        const sumCompanyElement: HTMLElement
          = document.getElementById('comp_id') as HTMLElement;
        if (sumCompanyElement) {
          sumCompanyElement.innerText = data.length ? data[0].company?.name : '-';
        }

        const addElements: HTMLCollectionOf<HTMLElement>
          = document.getElementsByClassName('product-add-button') as HTMLCollectionOf<HTMLElement>;
        if (addElements && addElements.length) {
          for (const [_, addNode] of Object.entries(addElements)) {
            addNode.addEventListener('click', async () => {
              const productId = addNode.getAttribute('data-target');
              if (productId) {
                const companyId = addNode.getAttribute('data-company');
                const itemId = addNode.getAttribute('data-item');
                add(productId, companyId, itemId).then(async () => {
                  await getCartItems().then(async (updatedData: Array<any>) => {
                    updateCartItems(updatedData);
                  }).catch((error) => {
                    alert(error);
                  });
                }).catch((error) => {
                  alert(error);
                });
              }
            });
          }
        }

        resolve(data);
      }).catch((error) => {
        alert(error);
      });
    });
  }

  const path: string = window.location.pathname;
  if (path === '/result') {
    const url = new URL(window.location.href);
    const boatId = url.searchParams.get("fid");
    const imgeId = url.searchParams.get("mid");
    if (boatId) {
      load(boatId);
    }
  }

}