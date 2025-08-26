import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, onSnapshot } from 'firebase/firestore';
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
  is_active?: boolean;
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

  // Real-time listener for stations
  listenToStations(callback: (stations: Station[]) => void) {
    const unsubscribe = onSnapshot(collection(db, 'stations'), (querySnapshot) => {
      const stations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Station[];
      callback(stations);
    });
    return unsubscribe; // Call this to stop listening
  }
}