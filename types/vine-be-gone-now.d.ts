import { ObjectId } from "mongodb";

export type Karnfaifa = {
  businessName: string;
  fullName: string;
  aoj: string;
};
export type Geolocation = {
  lat: string;
  lon: string;
  karnfaifa: Karnfaifa | null;
};

export type ResponeUploadImageSuccess = {
  url: string;
  id: string;
};

export type ResponeUploadImageFail = {
  error: string;
};

export type ImgMediaCardProp = {
  uploadedImage: ResponeUploadImageSuccess;
  riskPoint: string;
  place: string;
  lat: string;
  lon: string;
  id: string | ObjectId;
  maintenance?: any;
};

export type MaintenanceVineBeGoneData = {
  filteredDocuments: ImgMediaCardProp[];
  totalDocuments: number;
};
export type RequestData = Geolocation & {
  riskPoint: string;
  place: string;
  uploadedImage: ResponeUploadImageSuccess;
};
