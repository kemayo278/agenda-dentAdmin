export interface Patient {
  id: string;

  title?: string | null;
  lastName?: string;
  firstName?: string;
  gender?: string | null;
  birthDate?: string | null;

  profileImage?: string | null;

  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string;

  phone?: string | null;
  mobile?: string | null;
  email?: string | null;

  preferredLanguage?: string;

  assignedPractitioner?: string | null;

  firstContact?: string | null;

  medicalNotes?: string | null;

  nissNumber?: string | null;
  idNumber?: string | null;

  insurance?: string | null;
  insuranceNumber?: string | null;
  eligibility?: string | null;
  mutualityNumber?: string | null;
  mutualityAffiliationNumber?: string | null;
  mutualityHolderId?: string | null;

  validityStartDate?: string | null;
  validityEndDate?: string | null;

  status?: string | null;

  ct1?: string | null;
  ct2?: string | null;

  statusBIM?: boolean;
  statusPAL?: boolean;
  tiersPagant?: boolean;
  statusAC?: boolean;
  tdsDIA?: boolean;
  tdsIR?: boolean;

  medicalHouseName?: string | null;
  unsubscribeReason?: string | null;
  medicalHouseStartDate?: string | null;
  medicalHouseEndDate?: string | null;

  firstBillingDate?: string | null;
  lastBillingDate?: string | null;

  createdAt?: string;
  updatedAt?: string;
}
