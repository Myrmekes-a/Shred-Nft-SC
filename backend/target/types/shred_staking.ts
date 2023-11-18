export type ShredStaking = {
  "version": "0.1.0",
  "name": "shred_staking",
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
          "name": "rewardVault",
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
        }
      ]
    },
    {
      "name": "initializeUserPool",
      "accounts": [
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "stakeNftToPool",
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
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destNftTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
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
          "name": "isLegendary",
          "type": "u8"
        }
      ]
    },
    {
      "name": "withdrawNftFromPool",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destNftTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
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
        }
      ]
    },
    {
      "name": "claimReward",
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
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userRewardAccount",
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
        }
      ]
    },
    {
      "name": "checkReborn",
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
          "name": "juicingNftInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "juicingProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [],
      "returns": "u8"
    },
    {
      "name": "mutBootcampNft",
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
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newNftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juicingGlobal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juicingNftInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakedTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newStakedTokenAccount",
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
          "name": "juicingProgram",
          "isMut": false,
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
          "name": "juicingGlobalBump",
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
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
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
          "name": "juicingUserPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juicingNftPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juicingGlobalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juicingSolVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juicingProgram",
          "isMut": false,
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
          "name": "globalBump",
          "type": "u8"
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
            "name": "totalStakedCount",
            "type": "u64"
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
            "name": "stakedCount",
            "type": "u64"
          },
          {
            "name": "stakedMints",
            "type": {
              "array": [
                {
                  "defined": "StakedData"
                },
                100
              ]
            }
          },
          {
            "name": "lastRewardTime",
            "type": "i64"
          },
          {
            "name": "remainingRewards",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "StakedData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "stakedTime",
            "type": "i64"
          },
          {
            "name": "isLegendary",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Uninitialized",
      "msg": "Uninitialized account"
    },
    {
      "code": 6001,
      "name": "InvalidSuperOwner",
      "msg": "Invalid Super Owner"
    },
    {
      "code": 6002,
      "name": "InvalidUserPool",
      "msg": "Invalid User Pool Owner"
    },
    {
      "code": 6003,
      "name": "InvalidNFTAddress",
      "msg": "Invalid NFT Address"
    },
    {
      "code": 6004,
      "name": "InvalidWithdrawTime",
      "msg": "Invalid Withdraw Time"
    },
    {
      "code": 6005,
      "name": "InsufficientRewardVault",
      "msg": "Insufficient Reward Token Balance"
    },
    {
      "code": 6006,
      "name": "InvaliedMetadata",
      "msg": "Invalid Metadata Address"
    },
    {
      "code": 6007,
      "name": "MetadataCreatorParseError",
      "msg": "Can't Parse The NFT's Creators"
    },
    {
      "code": 6008,
      "name": "UnkownOrNotAllowedNFTCollection",
      "msg": "Unknown Collection Or The Collection Is Not Allowed"
    },
    {
      "code": 6009,
      "name": "InvalidMutableRequest",
      "msg": "Already converted to be mutable!"
    },
    {
      "code": 6010,
      "name": "InvalidJuicingRequest",
      "msg": "Already upgraded for juicing!"
    }
  ]
};

export const IDL: ShredStaking = {
  "version": "0.1.0",
  "name": "shred_staking",
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
          "name": "rewardVault",
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
        }
      ]
    },
    {
      "name": "initializeUserPool",
      "accounts": [
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "stakeNftToPool",
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
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destNftTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
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
          "name": "isLegendary",
          "type": "u8"
        }
      ]
    },
    {
      "name": "withdrawNftFromPool",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destNftTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
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
        }
      ]
    },
    {
      "name": "claimReward",
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
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userRewardAccount",
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
        }
      ]
    },
    {
      "name": "checkReborn",
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
          "name": "juicingNftInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "juicingProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [],
      "returns": "u8"
    },
    {
      "name": "mutBootcampNft",
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
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newNftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juicingGlobal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juicingNftInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakedTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newStakedTokenAccount",
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
          "name": "juicingProgram",
          "isMut": false,
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
          "name": "juicingGlobalBump",
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
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
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
          "name": "juicingUserPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juicingNftPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juicingGlobalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juicingSolVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "juicingProgram",
          "isMut": false,
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
          "name": "globalBump",
          "type": "u8"
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
            "name": "totalStakedCount",
            "type": "u64"
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
            "name": "stakedCount",
            "type": "u64"
          },
          {
            "name": "stakedMints",
            "type": {
              "array": [
                {
                  "defined": "StakedData"
                },
                100
              ]
            }
          },
          {
            "name": "lastRewardTime",
            "type": "i64"
          },
          {
            "name": "remainingRewards",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "StakedData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "stakedTime",
            "type": "i64"
          },
          {
            "name": "isLegendary",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Uninitialized",
      "msg": "Uninitialized account"
    },
    {
      "code": 6001,
      "name": "InvalidSuperOwner",
      "msg": "Invalid Super Owner"
    },
    {
      "code": 6002,
      "name": "InvalidUserPool",
      "msg": "Invalid User Pool Owner"
    },
    {
      "code": 6003,
      "name": "InvalidNFTAddress",
      "msg": "Invalid NFT Address"
    },
    {
      "code": 6004,
      "name": "InvalidWithdrawTime",
      "msg": "Invalid Withdraw Time"
    },
    {
      "code": 6005,
      "name": "InsufficientRewardVault",
      "msg": "Insufficient Reward Token Balance"
    },
    {
      "code": 6006,
      "name": "InvaliedMetadata",
      "msg": "Invalid Metadata Address"
    },
    {
      "code": 6007,
      "name": "MetadataCreatorParseError",
      "msg": "Can't Parse The NFT's Creators"
    },
    {
      "code": 6008,
      "name": "UnkownOrNotAllowedNFTCollection",
      "msg": "Unknown Collection Or The Collection Is Not Allowed"
    },
    {
      "code": 6009,
      "name": "InvalidMutableRequest",
      "msg": "Already converted to be mutable!"
    },
    {
      "code": 6010,
      "name": "InvalidJuicingRequest",
      "msg": "Already upgraded for juicing!"
    }
  ]
};
