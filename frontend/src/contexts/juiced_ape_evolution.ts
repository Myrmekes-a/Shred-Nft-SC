export type JuicedApeEvolution = {
  "version": "0.1.0",
  "name": "juiced_ape_evolution",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "newAdmin",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "juicingFeeWhey",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "juicingFeeSol",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "initializeNftPool",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeUserPool",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "withdrawTreasuryFunds",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userCostTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "costTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "globalBump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawSol",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "globalBump",
          "type": "u8"
        },
        {
          "name": "solBump",
          "type": "u8"
        },
        {
          "name": "solAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "nftToMutable",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newUserTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "burnAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintMetadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "globalBump",
          "type": "u8"
        },
        {
          "name": "nftBump",
          "type": "u8"
        },
        {
          "name": "newNftId",
          "type": "string"
        }
      ]
    },
    {
      "name": "juicingNft",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "rebirthUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "switchingNft",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "genesisUri",
          "type": "string"
        },
        {
          "name": "rebirthUri",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "superAdmin",
            "type": "publicKey"
          },
          {
            "name": "juicingFeeWhey",
            "type": "u64"
          },
          {
            "name": "juicingFeeSol",
            "type": "u64"
          },
          {
            "name": "totalJuicedCount",
            "type": "u64"
          },
          {
            "name": "totalMutedCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "nftPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "isPaid",
            "type": "bool"
          },
          {
            "name": "isJuiced",
            "type": "bool"
          },
          {
            "name": "isMutable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "userPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "juicedCount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidGlobalPool",
      "msg": "Invalid Global Pool Address"
    },
    {
      "code": 6001,
      "name": "Uninitialized",
      "msg": "Uninitialized Account"
    },
    {
      "code": 6002,
      "name": "InvalidSuperOwner",
      "msg": "Invalid Super Owner"
    },
    {
      "code": 6003,
      "name": "InvalidUpdateAuthority",
      "msg": "Invalid Update Authority"
    },
    {
      "code": 6004,
      "name": "InvalidUserPool",
      "msg": "Invalid User Pool Owner"
    },
    {
      "code": 6005,
      "name": "InvalidNftPool",
      "msg": "Invalid Nft Pool Mint"
    },
    {
      "code": 6006,
      "name": "CollectionNotExist",
      "msg": "Collection Address Is Not Exist"
    },
    {
      "code": 6007,
      "name": "CollectionAlreadyExist",
      "msg": "Collection Address Already Added"
    },
    {
      "code": 6008,
      "name": "InvalidNFTAddress",
      "msg": "Invalid NFT Address"
    },
    {
      "code": 6009,
      "name": "InvalidMetadata",
      "msg": "Invalid Metadata Address"
    },
    {
      "code": 6010,
      "name": "MetadataCreatorParseError",
      "msg": "Can't Parse The NFT's Creators"
    },
    {
      "code": 6011,
      "name": "UnkownOrNotAllowedNFTCollection",
      "msg": "Unknown Collection Or The Collection Is Not Allowed"
    },
    {
      "code": 6012,
      "name": "NotEvolvedYet",
      "msg": "Not Enough Evolution Period"
    },
    {
      "code": 6013,
      "name": "InsufficientEvolutionFee",
      "msg": "Not Enough Evolution Fee in User Account"
    },
    {
      "code": 6014,
      "name": "InsufficientTreasuryFunds",
      "msg": "Not Enough Treasury Balance"
    },
    {
      "code": 6015,
      "name": "InvalidJuicingRequest",
      "msg": "Already Juiced before"
    },
    {
      "code": 6016,
      "name": "InvalidNftId",
      "msg": "No matching Id"
    },
    {
      "code": 6017,
      "name": "InvalidMutableRequest",
      "msg": "Already converted to be mutable!"
    }
  ]
};

export const IDL: JuicedApeEvolution = {
  "version": "0.1.0",
  "name": "juiced_ape_evolution",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "newAdmin",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "juicingFeeWhey",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "juicingFeeSol",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "initializeNftPool",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeUserPool",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "withdrawTreasuryFunds",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userCostTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "costTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "globalBump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawSol",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "globalBump",
          "type": "u8"
        },
        {
          "name": "solBump",
          "type": "u8"
        },
        {
          "name": "solAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "nftToMutable",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newUserTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "burnAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintMetadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "globalBump",
          "type": "u8"
        },
        {
          "name": "nftBump",
          "type": "u8"
        },
        {
          "name": "newNftId",
          "type": "string"
        }
      ]
    },
    {
      "name": "juicingNft",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "rebirthUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "switchingNft",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "genesisUri",
          "type": "string"
        },
        {
          "name": "rebirthUri",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "superAdmin",
            "type": "publicKey"
          },
          {
            "name": "juicingFeeWhey",
            "type": "u64"
          },
          {
            "name": "juicingFeeSol",
            "type": "u64"
          },
          {
            "name": "totalJuicedCount",
            "type": "u64"
          },
          {
            "name": "totalMutedCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "nftPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "isPaid",
            "type": "bool"
          },
          {
            "name": "isJuiced",
            "type": "bool"
          },
          {
            "name": "isMutable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "userPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "juicedCount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidGlobalPool",
      "msg": "Invalid Global Pool Address"
    },
    {
      "code": 6001,
      "name": "Uninitialized",
      "msg": "Uninitialized Account"
    },
    {
      "code": 6002,
      "name": "InvalidSuperOwner",
      "msg": "Invalid Super Owner"
    },
    {
      "code": 6003,
      "name": "InvalidUpdateAuthority",
      "msg": "Invalid Update Authority"
    },
    {
      "code": 6004,
      "name": "InvalidUserPool",
      "msg": "Invalid User Pool Owner"
    },
    {
      "code": 6005,
      "name": "InvalidNftPool",
      "msg": "Invalid Nft Pool Mint"
    },
    {
      "code": 6006,
      "name": "CollectionNotExist",
      "msg": "Collection Address Is Not Exist"
    },
    {
      "code": 6007,
      "name": "CollectionAlreadyExist",
      "msg": "Collection Address Already Added"
    },
    {
      "code": 6008,
      "name": "InvalidNFTAddress",
      "msg": "Invalid NFT Address"
    },
    {
      "code": 6009,
      "name": "InvalidMetadata",
      "msg": "Invalid Metadata Address"
    },
    {
      "code": 6010,
      "name": "MetadataCreatorParseError",
      "msg": "Can't Parse The NFT's Creators"
    },
    {
      "code": 6011,
      "name": "UnkownOrNotAllowedNFTCollection",
      "msg": "Unknown Collection Or The Collection Is Not Allowed"
    },
    {
      "code": 6012,
      "name": "NotEvolvedYet",
      "msg": "Not Enough Evolution Period"
    },
    {
      "code": 6013,
      "name": "InsufficientEvolutionFee",
      "msg": "Not Enough Evolution Fee in User Account"
    },
    {
      "code": 6014,
      "name": "InsufficientTreasuryFunds",
      "msg": "Not Enough Treasury Balance"
    },
    {
      "code": 6015,
      "name": "InvalidJuicingRequest",
      "msg": "Already Juiced before"
    },
    {
      "code": 6016,
      "name": "InvalidNftId",
      "msg": "No matching Id"
    },
    {
      "code": 6017,
      "name": "InvalidMutableRequest",
      "msg": "Already converted to be mutable!"
    }
  ]
};
