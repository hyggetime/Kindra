import 'server-only'

import { DEFAULT_KINDRA_BANK_TRANSFER } from './bank-transfer-defaults'
import type { BankTransferDisplay } from './bank-transfer'

export type { BankTransferDisplay }

/** 서버 전용 — 무통장 안내 계좌(코드 기본값 + `BANK_TRANSFER_*` 로 항목별 덮어쓰기). */
export function readBankTransferFromEnv(): BankTransferDisplay {
  const d = DEFAULT_KINDRA_BANK_TRANSFER
  return {
    bankName: process.env.BANK_TRANSFER_BANK_NAME?.trim() || d.bankName,
    accountNo: process.env.BANK_TRANSFER_ACCOUNT_NO?.trim() || d.accountNo,
    holder: process.env.BANK_TRANSFER_ACCOUNT_HOLDER?.trim() || d.holder,
  }
}
