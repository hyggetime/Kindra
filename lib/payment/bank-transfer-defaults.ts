import type { BankTransferDisplay } from './bank-transfer'

/** 무통장 안내 기본값(환경 변수로 항목별 덮어쓰기 가능). */
export const DEFAULT_KINDRA_BANK_TRANSFER: BankTransferDisplay = {
  bankName: '우리은행',
  accountNo: '1005-904-245412',
  holder: '휘게타임',
}
