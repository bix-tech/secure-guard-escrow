import { createContext, useContext, useState } from 'react';
import { DealTimeline, Deliverable, PaymentScheduleInfo } from '../../../declarations/backend/backend.did';


export type DealData = {
  dealName: string;
  dealType: User;
  dealStatus: DealStatus;
  from: string;
  to: string;
  dealDescription: string;
  dealAmount: number;
  paymentSchedule: PaymentScheduleInfo[];
  dealCategory: DealCategory;
  dealTimeline: DealTimeline[];
  deliverables: Deliverable[];
  supportDocuments: string[];
  submissionTime: Date;
  buyerCancelRequest: boolean;
  sellerCancelRequest: boolean;
}

export enum DealStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  SubmittedDeliverables = 'SubmittedDeliverables',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum DealCategory {
  NFT = 'NFT',
  DomainName = 'Domain name',
  Services = 'Services',
  PhysicalProducts = 'Physical Products',
  DigitalProducts = 'Digital Products',
  Tokens = 'Tokens',
}

export enum User {
  Buyer = 'Buyer',
  Seller = 'Seller',
}

const initiateDealData: DealData = {
  dealName: '',
  dealType: User.Buyer,
  dealStatus: DealStatus.Pending,
  from: '',
  to: '',
  dealDescription: '',
  dealAmount: 0,
  paymentSchedule: [],
  dealCategory: DealCategory.NFT,
  dealTimeline: [],
  deliverables: [],
  supportDocuments: [],
  submissionTime:  new Date(),
  buyerCancelRequest: false,
  sellerCancelRequest: false,
}

const DealDataContext = createContext<{
  dealData: DealData;
  setDealData: React.Dispatch<React.SetStateAction<DealData>>;
}>({
  dealData: initiateDealData,
  setDealData: () => { },
});

export const DealDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dealData, setDealData] = useState<DealData>(initiateDealData);

  return (
    <DealDataContext.Provider value={{ dealData, setDealData }}>
      {children}
    </DealDataContext.Provider>
  );
};

export const useDealData = () => useContext(DealDataContext);