import { OmiseClient } from 'omise-nodejs';
import { OMISE_PUBLIC_KEY } from '../constants/configs';

export const createOmiseToken = async () => {

  const omise = new OmiseClient({
    publicKey: OMISE_PUBLIC_KEY,
    secretKey: ''
  });

  const token = await omise.token.create({
    card: {
      name: 'JOHN DOE',
      number: '4242424242424242',
      expiration_month: 2,
      expiration_year: 2027,
      security_code: '123',
    },
  });

  console.log(token);

  // Omise.createToken("card",
  //                 {
  //                   "expiration_month": 2,
  //                   "expiration_year": 2022,
  //                   "name": "Somchai Prasert",
  //                   "number": "4242424242424242",
  //                   "security_code": "123",
  //                   "street1": "476 Fifth Avenue",
  //                   "city": "New York",
  //                   "state": "NY",
  //                   "postal_code": "10320",
  //                   "country": "US"
  //                 },
  //                 function(statusCode, response) {
  //                   console.log(response["id"])
  //                 });
}