use anchor_lang::prelude::*;

#[error_code]
pub enum EvolutionError {
    #[msg("Invalid Global Pool Address")]
    InvalidGlobalPool,
    #[msg("Uninitialized Account")]
    Uninitialized,
    #[msg("Invalid Super Owner")]
    InvalidSuperOwner,
    #[msg("Invalid Update Authority")]
    InvalidUpdateAuthority,
    #[msg("Invalid User Pool Owner")]
    InvalidUserPool,
    #[msg("Invalid Nft Pool Mint")]
    InvalidNftPool,
    #[msg("Collection Address Is Not Exist")]
    CollectionNotExist,
    #[msg("Collection Address Already Added")]
    CollectionAlreadyExist,
    #[msg("Invalid NFT Address")]
    InvalidNFTAddress,
    #[msg("Invalid Metadata Address")]
    InvalidMetadata,
    #[msg("Can't Parse The NFT's Creators")]
    MetadataCreatorParseError,
    #[msg("Unknown Collection Or The Collection Is Not Allowed")]
    UnkownOrNotAllowedNFTCollection,
    #[msg("Not Enough Evolution Period")]
    NotEvolvedYet,
    #[msg("Not Enough Evolution Fee in User Account")]
    InsufficientEvolutionFee,
    #[msg("Not Enough Treasury Balance")]
    InsufficientTreasuryFunds,
    #[msg("Already Juiced before")]
    InvalidJuicingRequest,
    #[msg("No matching Id")]
    InvalidNftId,
    #[msg("Already converted to be mutable!")]
    InvalidMutableRequest,
}
