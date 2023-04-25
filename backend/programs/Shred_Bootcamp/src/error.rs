use anchor_lang::prelude::*;

#[error_code]
pub enum StakingError {
    #[msg("Uninitialized account")]
    Uninitialized,
    #[msg("Invalid Super Owner")]
    InvalidSuperOwner,
    #[msg("Invalid User Pool Owner")]
    InvalidUserPool,
    #[msg("Invalid NFT Address")]
    InvalidNFTAddress,
    #[msg("Invalid Withdraw Time")]
    InvalidWithdrawTime,
    #[msg("Insufficient Reward Token Balance")]
    InsufficientRewardVault,
    #[msg("Invalid Metadata Address")]
    InvaliedMetadata,
    #[msg("Can't Parse The NFT's Creators")]
    MetadataCreatorParseError,
    #[msg("Unknown Collection Or The Collection Is Not Allowed")]
    UnkownOrNotAllowedNFTCollection,
    #[msg("Already converted to be mutable!")]
    InvalidMutableRequest,
    #[msg("Already upgraded for juicing!")]
    InvalidJuicingRequest,
}
