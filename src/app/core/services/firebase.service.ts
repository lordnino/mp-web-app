import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { environment } from 'environments/environment';

const app = initializeApp(environment.firebaseConfig);
const db = getFirestore(app);

export interface Station {
  id: string;
  name?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  name_en?: string;
  name_ar?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  async getStations(): Promise<Station[]> {
    const querySnapshot = await getDocs(collection(db, 'stations'));
    console.log(querySnapshot.docs.map(doc => doc.data()));
    console.log(querySnapshot.docs);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Station[];
  }
}