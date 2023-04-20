use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct GlobalPool {
    //Total: 8 + 64
    pub super_admin: Pubkey,     //32
    pub juicing_fee_whey: u64,   //8
    pub juicing_fee_sol: u64,    //8
    pub total_juiced_count: u64, //8
    pub total_muted_count: u64,  //8
}

#[account]
#[derive(Default)]
pub struct NftPool {
    //Total: 8 + 35
    pub mint: Pubkey,     //32
    pub is_paid: bool,    //1
    pub is_juiced: bool,  //1
    pub is_mutable: bool, //1
}

#[account]
#[derive(Default)]
pub struct UserPool {
    //Total: 8 + 40
    pub owner: Pubkey,     //32
    pub juiced_count: u64, //8
}

impl NftPool {
    pub fn get_paid(&mut self) {
        self.is_paid = true;
    }

    pub fn juiced_status(&mut self, status: bool) {
        self.is_juiced = status;
    }

    pub fn mutable_status(&mut self, status: bool) {
        self.is_mutable = status;
    }
}
