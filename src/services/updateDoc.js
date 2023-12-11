import { doc, getDoc } from 'firebase/firestore';
import { firestore } from './firebase.js';
import { inputUser } from './setDoc.js'; // inputUser 함수 import

export async function updateUser(summonerName) {
  try {
    // 문서가 존재하든 없든, 새로운 정보를 가져와 데이터베이스에 저장
    const summonerNameLower = summonerName.toLowerCase(); // Convert summonerName to lowercase
    await inputUser(summonerNameLower);

    const summonerDocRef = doc(firestore, 'User_info', summonerNameLower); // Use lowercase summonerName
    let docSnap = await getDoc(summonerDocRef);

    console.log('Document data:', docSnap.data());
    return docSnap.data(); // 문서 데이터 반환
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}
