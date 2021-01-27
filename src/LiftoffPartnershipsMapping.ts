import {
  SetPartner,
  RequestPartnership,
  AcceptPartnership,
  CancelPartnership,
  AddFees,
  ClaimFees,
  UpdatePartnershipFee
} from "./../generated/LiftoffPartnerships/LiftoffPartnerships";
import { log, store, BigInt } from "@graphprotocol/graph-ts";
import { zero, addressZero } from "./utils/constants";
import {
  Partner,
  TokenSalePartnership,
  Partnership
} from "../generated/schema";

export function handleSetPartnerShip(event: SetPartner): void {
  let ID = event.params.ID.toString();
  let partner = Partner.load(ID);

  if (partner == null) {
    partner = new Partner(ID);
  }

  if (event.params.controller.toHexString() == addressZero) {
    store.remove("Partner", ID);
    return;
  }

  partner.partnerId = event.params.ID;
  partner.controller = event.params.controller;
  partner.ipfsHash = event.params.IPFSConfigHash;
  partner.save();
}

export function handleRequestPartnership(event: RequestPartnership): void {
  let tokenSalePartnershipId = event.params.tokenSaleId.toString();
  let tokenSalePartnership = TokenSalePartnership.load(tokenSalePartnershipId);

  if (tokenSalePartnership == null) {
    tokenSalePartnership = new TokenSalePartnership(tokenSalePartnershipId);
    tokenSalePartnership.tokenSaleId = event.params.tokenSaleId;
    tokenSalePartnership.totalPartnerships = zero.toI32();
    tokenSalePartnership.totalBPForPartners = zero;
  }

  let requestId = BigInt.fromI32(
    tokenSalePartnership.totalPartnerships
  ).toString();
  let partnershipId = tokenSalePartnershipId + "_" + requestId;
  let partnership = Partnership.load(partnershipId);

  if (partnership != null) {
    log.info("partnership exits {}", [partnershipId]);
    return;
  }

  tokenSalePartnership.totalPartnerships =
    tokenSalePartnership.totalPartnerships + 1;
  tokenSalePartnership.save();

  partnership = new Partnership(partnershipId);
  partnership.partnerId = event.params.partnerId;
  partnership.tokenSaleId = event.params.tokenSaleId;
  partnership.feeBP = event.params.feeBP;
  partnership.isApproved = false;
  partnership.partner = event.params.partnerId.toString();
  partnership.tokenSale = event.params.tokenSaleId.toString();
  partnership.tokenSalePartnership = tokenSalePartnershipId;
  partnership.save();
}

export function handleAcceptPartnership(event: AcceptPartnership): void {
  let tokenSalePartnershipId = event.params.tokenSaleId.toString();
  let partnershipId =
    tokenSalePartnershipId +
    "_" +
    BigInt.fromI32(event.params.requestId).toString();

  let tokenSalePartnership = TokenSalePartnership.load(tokenSalePartnershipId);
  let partnership = Partnership.load(partnershipId);

  if (tokenSalePartnership == null) {
    log.info("cannot find tokenSalePartnership {}", [tokenSalePartnershipId]);
    return;
  }

  if (partnership === null) {
    log.info("cannot find partnership {}", [partnershipId]);
    return;
  }

  partnership.isApproved = true;
  partnership.save();

  tokenSalePartnership.totalBPForPartners = tokenSalePartnership.totalBPForPartners.plus(
    partnership.feeBP
  );
  tokenSalePartnership.save();
}

export function handleCancelPartnership(event: CancelPartnership): void {
  let tokenSalePartnershipId = event.params.tokenSaleId.toString();
  let partnershipId =
    tokenSalePartnershipId +
    "_" +
    BigInt.fromI32(event.params.requestId).toString();

  let tokenSalePartnership = TokenSalePartnership.load(tokenSalePartnershipId);
  let partnership = Partnership.load(partnershipId);

  if (tokenSalePartnership == null) {
    log.info("cannot find tokenSalePartnership {}", [tokenSalePartnershipId]);
    return;
  }

  if (partnership === null) {
    log.info("cannot find partnership {}", [partnershipId]);
    return;
  }

  partnership.isApproved = false;
  partnership.save();

  tokenSalePartnership.totalBPForPartners = tokenSalePartnership.totalBPForPartners.minus(
    partnership.feeBP
  );
  tokenSalePartnership.save();
}

// NOTE: do we nee these handlers?
export function handleAddFees(event: AddFees): void {}
export function handleClaimFees(event: ClaimFees): void {}

export function handleUpdatePartnershipFee(event: UpdatePartnershipFee): void {
  let tokenSalePartnershipId = event.params.tokenSaleId.toString();
  let partnershipId =
    tokenSalePartnershipId +
    "_" +
    BigInt.fromI32(event.params.partnerId).toString();

  let tokenSalePartnership = TokenSalePartnership.load(tokenSalePartnershipId);
  let partnership = Partnership.load(partnershipId);

  if (tokenSalePartnership == null) {
    log.info("cannot find tokenSalePartnership {}", [tokenSalePartnershipId]);
    return;
  }

  if (partnership === null) {
    log.info("cannot find partnership {}", [partnershipId]);
    return;
  }

  let originalFeeBP = partnership.feeBP;
  tokenSalePartnership.totalBPForPartners = tokenSalePartnership.totalBPForPartners
    .plus(event.params.feeBP)
    .minus(originalFeeBP);
  tokenSalePartnership.save();

  partnership.feeBP = event.params.feeBP;
  partnership.save();
}
