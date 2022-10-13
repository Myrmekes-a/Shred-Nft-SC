export type JuicedProgram = {
  version: "0.1.0";
  name: "backend";
  instructions: [
    {
      name: "initialize";
      accounts: [
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "globalAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "bump";
          type: "u8";
        },
        {
          name: "newAdmin";
          type: {
            option: "publicKey";
          };
        },
        {
          name: "juicingFee";
          type: {
            option: "u64";
          };
        }
      ];
    },
    {
      name: "initializeNftPool";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
        },
        {
          name: "nftMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "bump";
          type: "u8";
        }
      ];
    },
    {
      name: "withdrawTreasuryFunds";
      accounts: [
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "globalAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userCostTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "costTokenVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "globalBump";
          type: "u8";
        },
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "juicingNft";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
        },
        {
          name: "nftMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "globalAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userCostTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "costTokenVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mintMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "updateAuthority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenMetadataProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "globalBump";
          type: "u8";
        },
        {
          name: "juiceUri";
          type: "string";
        }
      ];
    },
    {
      name: "switchToShreddedNft";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
        },
        {
          name: "nftMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "globalAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mintMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "updateAuthority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenMetadataProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "globalBump";
          type: "u8";
        },
        {
          name: "shredUri";
          type: "string";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "GlobalPool";
      type: {
        kind: "struct";
        fields: [
          {
            name: "superAdmin";
            type: "publicKey";
          },
          {
            name: "juicingFee";
            type: "u64";
          },
          {
            name: "totalJuicedCount";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "NftPool";
      type: {
        kind: "struct";
        fields: [
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "isPaid";
            type: "bool";
          },
          {
            name: "isJuiced";
            type: "bool";
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "InvalidGlobalPool";
      msg: "Invalid Global Pool Address";
    },
    {
      code: 6001;
      name: "Uninitialized";
      msg: "Uninitialized Account";
    },
    {
      code: 6002;
      name: "InvalidSuperOwner";
      msg: "Invalid Super Owner";
    },
    {
      code: 6003;
      name: "InvalidUpdateAuthority";
      msg: "Invalid Update Authority";
    },
    {
      code: 6004;
      name: "InvalidUserPool";
      msg: "Invalid User Pool Owner";
    },
    {
      code: 6005;
      name: "CollectionNotExist";
      msg: "Collection Address Is Not Exist";
    },
    {
      code: 6006;
      name: "CollectionAlreadyExist";
      msg: "Collection Address Already Added";
    },
    {
      code: 6007;
      name: "InvalidNFTAddress";
      msg: "Invalid NFT Address";
    },
    {
      code: 6008;
      name: "InvalidMetadata";
      msg: "Invalid Metadata Address";
    },
    {
      code: 6009;
      name: "MetadataCreatorParseError";
      msg: "Can't Parse The NFT's Creators";
    },
    {
      code: 6010;
      name: "UnkownOrNotAllowedNFTCollection";
      msg: "Unknown Collection Or The Collection Is Not Allowed";
    },
    {
      code: 6011;
      name: "NotEvolvedYet";
      msg: "Not Enough Evolution Period";
    },
    {
      code: 6012;
      name: "InsufficientEvolutionFee";
      msg: "Not Enough Evolution Fee in User Account";
    },
    {
      code: 6013;
      name: "InsufficientTreasuryFunds";
      msg: "Not Enough Treasury Balance";
    }
  ];
  metadata: {
    address: "8RQcCHy59Zvt22qXf1z5JE7zwqY12qySoaYWax3F4VxD";
  };
};

export const IDL: JuicedProgram = {
  version: "0.1.0",
  name: "backend",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "globalAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "bump",
          type: "u8",
        },
        {
          name: "newAdmin",
          type: {
            option: "publicKey",
          },
        },
        {
          name: "juicingFee",
          type: {
            option: "u64",
          },
        },
      ],
    },
    {
      name: "initializeNftPool",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "nftMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "bump",
          type: "u8",
        },
      ],
    },
    {
      name: "withdrawTreasuryFunds",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "globalAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userCostTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "costTokenVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "globalBump",
          type: "u8",
        },
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "juicingNft",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "nftMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "globalAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userCostTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "costTokenVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mintMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "updateAuthority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenMetadataProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "globalBump",
          type: "u8",
        },
        {
          name: "juiceUri",
          type: "string",
        },
      ],
    },
    {
      name: "switchToShreddedNft",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "nftMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "globalAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mintMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "updateAuthority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenMetadataProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "globalBump",
          type: "u8",
        },
        {
          name: "shredUri",
          type: "string",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "GlobalPool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "superAdmin",
            type: "publicKey",
          },
          {
            name: "juicingFee",
            type: "u64",
          },
          {
            name: "totalJuicedCount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "NftPool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "isPaid",
            type: "bool",
          },
          {
            name: "isJuiced",
            type: "bool",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidGlobalPool",
      msg: "Invalid Global Pool Address",
    },
    {
      code: 6001,
      name: "Uninitialized",
      msg: "Uninitialized Account",
    },
    {
      code: 6002,
      name: "InvalidSuperOwner",
      msg: "Invalid Super Owner",
    },
    {
      code: 6003,
      name: "InvalidUpdateAuthority",
      msg: "Invalid Update Authority",
    },
    {
      code: 6004,
      name: "InvalidUserPool",
      msg: "Invalid User Pool Owner",
    },
    {
      code: 6005,
      name: "CollectionNotExist",
      msg: "Collection Address Is Not Exist",
    },
    {
      code: 6006,
      name: "CollectionAlreadyExist",
      msg: "Collection Address Already Added",
    },
    {
      code: 6007,
      name: "InvalidNFTAddress",
      msg: "Invalid NFT Address",
    },
    {
      code: 6008,
      name: "InvalidMetadata",
      msg: "Invalid Metadata Address",
    },
    {
      code: 6009,
      name: "MetadataCreatorParseError",
      msg: "Can't Parse The NFT's Creators",
    },
    {
      code: 6010,
      name: "UnkownOrNotAllowedNFTCollection",
      msg: "Unknown Collection Or The Collection Is Not Allowed",
    },
    {
      code: 6011,
      name: "NotEvolvedYet",
      msg: "Not Enough Evolution Period",
    },
    {
      code: 6012,
      name: "InsufficientEvolutionFee",
      msg: "Not Enough Evolution Fee in User Account",
    },
    {
      code: 6013,
      name: "InsufficientTreasuryFunds",
      msg: "Not Enough Treasury Balance",
    },
  ],
  metadata: {
    address: "8RQcCHy59Zvt22qXf1z5JE7zwqY12qySoaYWax3F4VxD",
  },
};
