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
  maintenance?: {
    operator: {
      karnfaifa: string;
      firstname: string;
      lastname: string;
      userid: string;
      mobileno: string;
      role: string;
    };
    image: {
      url: string;
      id: string;
    };
  };
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

export type RequestDataMaintenance = {
  uploadedImage: ResponeUploadImageSuccess;
};

export type RequestDataForSendToReporter = {
  sub: string;
  riskPoint: string;
  place: string;
  img: string;
  id: string;
};
