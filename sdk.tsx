type PaymentFrequency =
  | 'Single'
  | 'TwoEqualPayments'
  | 'Quarterly'
  | 'Other';

type BaseRateAttributes = {
  coveragePeriod?: string;
  payoutOption?: string;
};

type CoefficientAttributes = {
  insuredQuantity: number;
  professionKind: string;
  ruleNumber?: number;
  professionId?: string;
  sumInsuredOrder: string;
  duration: number;
  payPercent?: number;
  payDays?: number;
  payOutTable?: string;
  antimite?: boolean;
  toxicoInfectionFood?: boolean;
  improperMedicalManipulations?: boolean;
  sport?: boolean;
  sportTypesIds?: string[];
  lossFreeYears?: number;
  active?: boolean;
  specialProgram?: string;
  promo?: string;
};

type InsuranceRiskAttributes = {
  baseRateAttributes: BaseRateAttributes;
  coefficientAttributes: CoefficientAttributes;
};

type InsuredObject = {
  id: string;
  code: string;
  type: string;
  description: string;
  sumInsured: number;
  groupNames: string[];
};

type InsuranceRisk = {
  id: string;
  objectRef: string;
  sumInsured?: number;
  boxedProgramDuration?: number;
  insuranceVariant: string;
  massEventVariantNumber?: number;
  elementaryRisk?: string;
  programId: string;
  elementaryRiskId: string;
  attributes?: InsuranceRiskAttributes;
};

type PaymentPlanItem = {
  paymentDate: string;
  paymentAmount: number;
  paymentNumber: number;
};

type PaymentData = {
  paymentFrequency: PaymentFrequency;
  paymentPlan?: PaymentPlanItem[];
};

type CalculationRequest = {
  objects: InsuredObject[];
  items: InsuranceRisk[];
  paymentData?: PaymentData;
  startDate: string;
  endDate: string;
  sumInsuredMethod: string;
  sumInsuredOrder: string;
};