import { doc, getDoc } from 'firebase/firestore';
import { firestore } from './firebase.js';
import { inputUser } from './setDoc.js'; // inputUser 함수 import

export async function outputUser(summonerName) {
  try {
    const summonerNameLower = summonerName.toLowerCase(); // Convert summonerName to lowercase
    const summonerDocRef = doc(firestore, 'User_info', summonerNameLower); // Use lowercase summonerName
    let docSnap = await getDoc(summonerDocRef);

    if (!docSnap.exists()) {
      // 문서가 없다면 데이터를 저장하고 다시 가져옵니다.
      await inputUser(summonerNameLower); // Use lowercase summonerName
      docSnap = await getDoc(summonerDocRef); // 데이터 저장 후 다시 가져오기
    }

    if (docSnap.exists()) {
      console.log('Document data:', docSnap.data());
      return docSnap.data(); // 문서 데이터 반환
    } else {
      return null; // 문서가 여전히 없는 경우 null 반환
    }
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}