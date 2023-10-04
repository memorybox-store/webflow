import { OmiseClient } from "omise-nodejs";
import { OMISE_PUBLIC_KEY, OMISE_SECRET_KEY } from "../constants/configs";


const omise = new OmiseClient({
  publicKey: OMISE_PUBLIC_KEY,
  secretKey: OMISE_SECRET_KEY
});

export default omise;