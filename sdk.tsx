type Data = {
  id: string;
  number: string;
  affiliateCode: string;
  affiliateName: string;
  status: string;
  productCode: string;
  insuranceVariant: string;
  startOfInsurance: string;
  endOfInsurance: string;
  policyData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  transfer1cStatus: Record<string, unknown>;
  createdBy: string;
  previousContractId: string;
  previousContractNumber: string;
  parties: Record<string, Party[]>;
  sumInsuredMethod: SumInsuredMethod;
  sumInsuredOrder: SumInsuredOrder;
  pagination: Pagination;
  links: Links;
};

type Party = {
  personCalculationId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  middleName: string;
  sex: string;
  organisationName: string;
  legalForm: string;
  inn: string;
  kpp: string;
  type: string;
  birthDate: string;
  phone: string;
  email: string;
  documents: Document[];
  address: string;
  roles: Role[];
};

type Document = {
  documentType: string;
  series: string;
  number: string;
  issuer: string;
  departmentCode: string;
  issueDate: string;
};

type Role = 'insured' | 'policyHolder';

type SumInsuredMethod =
  | 'DIFFERENT_FOR_ALL'
  | 'EQUAL_FOR_ALL';

type SumInsuredOrder =
  | 'SEPARATE'
  | 'UNIFIED'
  | 'COMBINED';

type Pagination = {
  cursor: number;
  totalLists: number;
  totalItems: number;
  limitFilter: number;
};

type Links = {
  self: string;
  first: string;
  prev: string;
  next: string;
};