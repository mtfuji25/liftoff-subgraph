import { log, Address } from "@graphprotocol/graph-ts";
import { zero, addressZero } from "./utils/constants";
import { TokenInsurance } from "../generated/schema";
import {
  Register,
  CreateInsurance,
  ClaimBaseFee,
  Claim,
  Redeem
} from "../generated/LiftoffInsurance/LiftoffInsurance";

export function handleRegister(event: Register): void {
  let tokenInsuranceId = event.params.tokenId.toString();
  let insurance = TokenInsurance.load(tokenInsuranceId);

  if (insurance != null) {
    insurance = new TokenInsurance(tokenInsuranceId);
    insurance.tokenId = event.params.tokenId;
    insurance.isRegistered = false;
    insurance.isInitialized = false;
  }

  insurance.isRegistered = true;
  insurance.save();
}

export function handleCreateInsurance(event: CreateInsurance): void {
  let tokenInsuranceId = event.params.tokenId.toString();
  let insurance = TokenInsurance.load(tokenInsuranceId);

  if (insurance == null) {
    log.info("cannot find insurance {}", [tokenInsuranceId]);
    return;
  }

  insurance.isInitialized = true;
  insurance.startTime = event.params.startTime.toI32();
  insurance.totalIgnited = event.params.totalIgnited;
  insurance.tokensPerEthWad = event.params.tokensPerEthWad;
  insurance.baseXEth = event.params.baseXEth;
  insurance.baseTokenLidPool = event.params.baseTokenLidPool;
  insurance.redeemedXEth = zero;
  insurance.claimedXEth = zero;
  insurance.deployed = event.params.deployed;
  insurance.dev = event.params.dev;
  insurance.isUnwound = false;
  insurance.hasBaseFeeClaimed = false;

  insurance.save();
}

export function handleClaimBaseFee(event: ClaimBaseFee): void {
  let tokenInsuranceId = event.params.tokenId.toString();
  let insurance = TokenInsurance.load(tokenInsuranceId);

  if (insurance == null) {
    log.info("cannot find insurance {}", [tokenInsuranceId]);
    return;
  }

  insurance.hasBaseFeeClaimed = true;
  insurance.save();
}

export function handleClaim(event: Claim): void {
  let tokenInsuranceId = event.params.tokenId.toString();
  let insurance = TokenInsurance.load(tokenInsuranceId);

  if (insurance == null) {
    log.info("cannot find insurance {}", [tokenInsuranceId]);
    return;
  }

  insurance.claimedXEth = insurance.claimedXEth.plus(event.params.xEthClaimed);
  insurance.claimedTokenLidPool = insurance.claimedTokenLidPool.plus(
    event.params.tokenClaimed
  );

  insurance.save();
}

export function handleRedeem(event: Redeem): void {
  let tokenInsuranceId = event.params.tokenId.toString();
  let insurance = TokenInsurance.load(tokenInsuranceId);

  if (insurance == null) {
    log.info("cannot find insurance {}", [tokenInsuranceId]);
    return;
  }

  insurance.redeemedXEth = insurance.redeemedXEth.plus(event.params.redeemEth);
  insurance.save();
}
