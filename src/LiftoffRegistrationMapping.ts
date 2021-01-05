import { log } from "@graphprotocol/graph-ts";
import { TokenSale } from "../generated/schema";
import { TokenIpfsHash } from "../generated/LiftoffRegistration/LiftoffRegistration";

export function handleRegisterProject(event: TokenIpfsHash): void {
  let tokenSaleId = event.params.tokenId.toString();
  let tokenSale = TokenSale.load(tokenSaleId);

  if (tokenSale == null) {
    log.info("cannot find tokenSale {}", [tokenSaleId]);
    return;
  }

  tokenSale.ipfsHash = event.params.ipfsHash;
  tokenSale.save();
}
