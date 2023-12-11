import axios from 'axios';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from './firebase.js';
import { RIOT_API_KEY } from '@env';

const api_key = RIOT_API_KEY;

export async function inputUser(summonerName) {
  let summonerData;

  try {
    // 소환사 정보 가져오기
    const summonerResponse = await axios.get(`https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${api_key}`);
    summonerData = summonerResponse.data;
  } catch (error) {
    // 잘못된 소환사 이름으로 인한 오류 처리
    console.log(`잘못된 소환사 이름: ${summonerName}`);
    return; // 함수 종료
  }

  // 소환사의 랭크 정보 가져오기
  const leagueResponse = await axios.get(`https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}?api_key=${api_key}`);
  let soloRankTier = 'Unranked';
  leagueResponse.data.forEach(league => {
    if (league.queueType === 'RANKED_SOLO_5x5') {
      if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(league.tier)) {
        soloRankTier = `${league.tier} ${league.leaguePoints}`;
      } else {
        soloRankTier = `${league.tier} ${league.rank}`;
      }}
  });
  
  const matchInfoList = [];
  const totalMatchesToRetrieve = 20; // 총 몇 개의 매치를 가져올 것인지
  const matchesPerRequest = 10; // 한 번에 몇 개의 매치 정보를 가져올 것인지
  
  // 시도 횟수와 재시도 간격 설정
  const maxRetries = 2; // 최대 시도 횟수
  const retryDelay = 10000; // 재시도 간격 (10초)
  
  // 시도 횟수 초기화
  let retries = 0;
  
  // matchesResponse를 여러 번 요청하여 데이터를 가져옴
  async function fetchMatches(start) {
    try {
      const matchesResponse = await axios.get(`https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${summonerData.puuid}/ids?queue=420&type=ranked&start=${start}&count=${matchesPerRequest}&api_key=${api_key}`);
      const matchIds = matchesResponse.data;
  
      // 각 매치 정보를 가져와 matchInfoList에 추가
      const matchInfos = await Promise.all(matchIds.map(async (matchId) => {
        const matchDetailResponse = await axios.get(`https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${api_key}`);
        return matchDetailResponse.data.info.participants.find(participant => participant.summonerId === summonerData.id);
      }));
  
      matchInfoList.push(...matchInfos);
    } catch (error) {
      // 오류 발생 시 재시도
      if (retries < maxRetries) {
        console.error('오류 발생, 재시도 중...');
        retries++;
        setTimeout(() => fetchMatches(start), retryDelay);
      } else {
        console.error('재시도 횟수 초과, 작업 중단.');
      }
    }
  }

  // matchesResponse를 여러 번 요청
  for (let start = 0; start < totalMatchesToRetrieve; start += matchesPerRequest) {
    await fetchMatches(start);

    // 현재까지 가져온 매치 정보 개수 출력
    console.log(`현재까지 가져온 매치 정보 개수: ${matchInfoList.length}`);
  }

  // 소환사의 챔피언 마스터리 정보 가져오기
  const championMasteryUrl = `https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerData.id}?api_key=${api_key}`;
  const championMasteryResponse = await axios.get(championMasteryUrl);
  const championMasteries = championMasteryResponse.data;

  const distributionResult = await calculateDistribution(matchInfoList);

  // Firestore에 저장
  const userDocRef = doc(firestore, 'User_info', summonerData.name.toLowerCase());
  await setDoc(userDocRef, {
    // 저장하는 데이터는 동일
    profileInfo: summonerData,
    leagueInfo: { soloRankTier },
    individualPositionDistribution: distributionResult.individualPositionDistribution,
    championDistribution: distributionResult.championDistribution,
    championMasteries: championMasteries, // 챔피언 마스터리 정보 추가
    timestamp: new Date()
  }); 
}

function calculateDistribution(matchInfoList) {
  const individualPositionCounts = {};
  const championCounts = {};
  const totalMatches = matchInfoList.length;

  for (const matchInfo of matchInfoList) {
    const { individualPosition, championName } = matchInfo;

    individualPositionCounts[individualPosition] = (individualPositionCounts[individualPosition] || 0) + 1;
    championCounts[championName] = (championCounts[championName] || 0) + 1;
  }

  const individualPositionPercentages = {};
  for (const [individualPosition, count] of Object.entries(individualPositionCounts)) {
    individualPositionPercentages[individualPosition] = (count / totalMatches) * 100;
  }

  // 라인 분포도 내림차순 정렬
  const sortedIndividualPositionPercentages = Object.entries(individualPositionPercentages).sort(
    (a, b) => b[1] - a[1]
  );

  const championDistribution = Object.entries(championCounts).map(([name, count]) => ({
    championName: name,
    percentage: (count / totalMatches) * 100,
  }));

  // 챔피언 분포도 내림차순 정렬
  const sortedChampionDistribution = championDistribution.sort(
    (a, b) => b.percentage - a.percentage
  );

  return {
    individualPositionDistribution: Object.fromEntries(sortedIndividualPositionPercentages),
    championDistribution: sortedChampionDistribution,
  };
}
