import React, { useState, useRef } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/homeCss'; // 스타일 파일 경로
import SearchComponent from '../components/SearchComponent'; // Update the path to your SearchComponent file
import { updateUser } from '../services/updateDoc';
import axios from 'axios';


function Home() {

  // 현재 화면을 관리하는 상태 (useState)
  const [currentScreen, setCurrentScreen] = useState('summonersRift');
  // 검색창에 입력된 닉네임을 저장하는 state
  const [searchTerm, setSearchTerm] = useState('');
  // 검색창에 포커스를 맞출 때 사용하는 ref
  const searchInputRef = useRef(null);
  // 소환사 이름을 저장하는 state
  const [summonersName, setSummoners] = useState(Array(10).fill(''));
    // 소환사 정보을 저장하는 state
  const [summonersInfo, getSummoners] = useState(Array(10).fill(''));
  // 소환사 정보을 저장한 타임스탬프 state
  const [summonersTime, setTimestamp] = useState(Array(10).fill(''));
  // 버튼 활성화 상태를 확인하는 함수
  const isButtonDisabled = summonersName.some(name => name === '');
  // 'useNavigation' Hook을 사용하여 네비게이션 객체에 접근
  const navigation = useNavigation();
  // 로딩 상태를 관리하는 state 추가
  const [isLoading, setIsLoading] = useState(false);

  // 현재 화면 변경을 처리하는 함수
  const handleScreenChange = (screen) => {
    setCurrentScreen(screen);
  };

  // 검색 기능을 처리하는 함수
  const handleSearch = async (summonerData) => {
    if (summonerData && summonerData.profileInfo && summonerData.profileInfo.name) {
      const emptyIndex = summonersName.findIndex(name => name === '');
      if (emptyIndex !== -1) {
        const updatedSummoners = [...summonersName];
        updatedSummoners[emptyIndex] = summonerData.profileInfo.name;
        const updatedSummonersInfo = [...summonersInfo];
        updatedSummonersInfo[emptyIndex] = summonerData;
        const updatedSummonersTime = [...summonersTime];
        updatedSummonersTime[emptyIndex] = summonerData.timestamp;
        // 배열 값 콘솔 출력
        console.log(updatedSummoners);
        setSummoners(updatedSummoners);
        console.log(updatedSummonersInfo);
        getSummoners(updatedSummonersInfo);
        console.log(updatedSummonersTime);
        setTimestamp(updatedSummonersTime)
      }
      setSearchTerm('');

      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 5);
    }
  };
    // 최신 버전의 API를 확인하고 사용하는 함수
    const fetchLatestVersion = async () => {
      try {
        const versionUrl = 'https://ddragon.leagueoflegends.com/api/versions.json';
        const response = await axios.get(versionUrl);
        const versions = response.data;
        return versions[0];
      } catch (error) {
        console.error('Error fetching the latest version:', error);
        return null;
      }
    };
  // 최신 버전의 챔피언 목록을 가져오는 함수
  const fetchChampionList = async () => {
    try {
      const latestVersion = await fetchLatestVersion();
      if (!latestVersion) {
        throw new Error('Unable to fetch the latest version');
      }
      const championsUrl = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`;
      const response = await axios.get(championsUrl);
      const championsData = response.data.data;
      const championKeys = Object.keys(championsData);
      // 모든 챔피언 아이디 수집
      const championIds = championKeys.map(key => championsData[key].key);
      return championIds;
    } catch (error) {
      console.error('Error fetching champion data:', error);
      return [];
    }
  };
  const handleTeamMatch = async () => {
    setIsLoading(true); // 로딩 시작
    try {
      // 소환사 정보를 가공하기 전에 필요한 검사 수행
      const missingDataSummoner = summonersInfo.find(playerInfo => {
        return !playerInfo.leagueInfo.soloRankTier || playerInfo.championMasteries.length === 0;
      });
      if (missingDataSummoner) {
        // 필요한 정보가 누락된 경우 경고 메시지 표시
        Alert.alert(
          "정보 누락",
          `'${missingDataSummoner.profileInfo.name}'님의 정보를 최신화 부탁드립니다.`,
          [{ text: "확인" }]
        );
        setIsLoading(false);
        return; // 함수 실행 중단
      }

      if (currentScreen === 'summonersRift') {
        let apiPlayerData = summonersInfo.map(playerInfo => ({
          nickname: playerInfo.profileInfo.name,
          tier: playerInfo.leagueInfo.soloRankTier,
          TOPPreference: playerInfo.individualPositionDistribution.TOP || 0,
          JUNGLEPreference: playerInfo.individualPositionDistribution.JUNGLE || 0,
          MIDDLEPreference: playerInfo.individualPositionDistribution.MIDDLE || 0,
          BOTTOMPreference: playerInfo.individualPositionDistribution.BOTTOM || 0,
          UTILITYPreference: playerInfo.individualPositionDistribution.UTILITY || 0,
          championMasteries: playerInfo.championMasteries.slice(0, 3) // 상위 3개 챔피언 마스터리 정보
        }));
  
        const championImages = await fetchChampionList();
        console.log('apiPlayer Data:', apiPlayerData, championImages);
        navigation.navigate('Result', { apiPlayerData, championImages });
  
      } else if (currentScreen === 'howlingAbyss') {
        // 칼바람 나락 탭에서 팀 맞추기 로직
        let api2PlayerData = summonersInfo.map(playerInfo => ({
          nickname: playerInfo.profileInfo.name,
          tier: playerInfo.leagueInfo.soloRankTier,
          TOPPreference: 0, // 각 라인의 선호도를 0으로 설정
          JUNGLEPreference: 0,
          MIDDLEPreference: 0,
          BOTTOMPreference: 0,
          UTILITYPreference: 0
        }));
  
        const championImages = await fetchChampionList();
        console.log('api2Player Data:', api2PlayerData, championImages);
        navigation.navigate('Result', { api2PlayerData, championImages });
      }
    } catch (error) {
      console.error('Error during team match process:', error);
    } finally {
      setIsLoading(false);
    }
  };


    // 삭제 및 최신화를 처리하는 함수
    const handleAction = async (index, action) => {
      const summonerNameToUpdate = summonersName[index];
      if (summonerNameToUpdate) {
        try {
          if (action === 'update') {
            // updateUser 함수를 호출하여 정보 최신화
            const updatedSummonerData = await updateUser(summonerNameToUpdate);
            if (updatedSummonerData) {
              const updatedSummonersInfo = [...summonersInfo];
              updatedSummonersInfo[index] = updatedSummonerData;
              getSummoners(updatedSummonersInfo);
              console.log(updatedSummonersInfo);
              const updatedSummonersTime = [...summonersTime];
              updatedSummonersTime[index] = updatedSummonerData.timestamp;
              setTimestamp(updatedSummonersTime)
              console.log(updatedSummonersTime);
            }
          } else if (action === 'delete') {
            // 삭제 기능
            let updatedSummoners = [...summonersName];
            updatedSummoners.splice(index, 1);
            updatedSummoners.push('');
            setSummoners(updatedSummoners);
          }
        } catch (error) {
          console.error('Error during action:', error);
        }
      }
    };

  return (
    <View style={styles.outerContainer}>
      {/* 로딩 상태일 때 로딩 인디케이터 표시 */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      {/* 로고 필드 */}
      <View style={styles.logoContainer}>
      </View>
      {/* 소환사의 협곡, 칼바람 나락, 방 찾기 네비게이션 필드 */}
      <View style={styles.navContainer}>
        <Pressable 
          onPress={() => handleScreenChange('summonersRift')} 
          style={[styles.navButton, currentScreen === 'summonersRift' && styles.selectedTabButton]}>
          <Text style={[styles.navButtonText, currentScreen === 'summonersRift' && styles.selectedTabText]}>소환사의 협곡</Text>
        </Pressable>
        <Pressable 
          onPress={() => handleScreenChange('howlingAbyss')} 
          style={[styles.navButton, currentScreen === 'howlingAbyss' && styles.selectedTabButton]}>
          <Text style={[styles.navButtonText, currentScreen === 'howlingAbyss' && styles.selectedTabText]}>칼바람 나락</Text>
        </Pressable>
        <Pressable 
          onPress={() => handleScreenChange('roomSearch')} 
          style={[styles.navButton, currentScreen === 'roomSearch' && styles.selectedTabButton]}>
          <Text style={[styles.navButtonText, currentScreen === 'roomSearch' && styles.selectedTabText]}>방 찾기</Text>
        </Pressable>
      </View>
      {currentScreen === 'summonersRift' && (
        <SummonersRiftScreen
          summonersName={summonersName}
          setSummoners={setSummoners}
          getSummoners={getSummoners}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setTimestamp={setTimestamp} // 타임스탬프를 추가
        />
      )}
      {currentScreen === 'howlingAbyss' && (
        <HowlingAbyssScreen
          summonersName={summonersName}
          setSummoners={setSummoners}
          getSummoners={getSummoners}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setTimestamp={setTimestamp} // 타임스탬프를 추가
        />
      )}
      {currentScreen === 'roomSearch' ? (
      <RoomSearchScreen />
    ) : (
      <ScrollView style={styles.container}>
        {/* 검색창 입력 필드 */}
        <View style={styles.upsite}>
          <SearchComponent onSearch={handleSearch} />
        </View>
        {/* Player Section */}
        {summonersName.map((name, index) => (
          <View key={index} style={styles.playerRow}>
            <View style={styles.PlayerContainer}>
              <TextInput
                style={styles.PlayerInput}
                value={name}
                editable={false} // 수정 불가능하게 설정
                onChangeText={(text) => {
                  let Summonersname = [...summonersName];
                  Summonersname[index] = text;
                  setSummoners(Summonersname);
                }}
              />
              {/* 삭제 및 최신화 버튼 */}
              {name !== '' && (
                <View style={styles.buttonsContainer}>
                  {/* 타임스탬프를 출력 */}
                  <Text>{formatTimestamp(summonersTime[index])}</Text>
                  <Pressable
                    onPress={() => handleAction(index, 'update')}
                    style={styles.updateButton}
                  >
                    <Icon name="refresh" size={25} color="#808080" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleAction(index, 'delete')}
                    style={styles.deleteButton}
                  >
                    <Icon name="delete" size={25} color="#808080" />
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        ))}
      {/* Team Match Button */}
      <View style={styles.teamMatchButtonContainer}>
        <Pressable 
          style={[styles.teamMatchButton, isButtonDisabled && styles.teamMatchButtonDisabled]} 
          onPress={handleTeamMatch}
          disabled={isButtonDisabled}
        >
          <Text style={[styles.teamMatchText, isButtonDisabled && styles.teamMatchtextDisabled]}>팀 맞추기</Text>
        </Pressable>
      </View>
    </ScrollView>
    )}
    </View>
  );
}
// 타임스탬프를 날짜 및 시간 형식으로 변환하는 함수
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp.seconds * 1000); // 초 단위 타임스탬프를 밀리초로 변환
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더하고 두 자리로 포맷
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}.${month}.${day}. ${hours}시${minutes}분`;
};

function SummonersRiftScreen() {
  return (
    <View style={styles.outerContainer}>
    </View>
  );
}

function HowlingAbyssScreen() {
  return (
    <View style={styles.outerContainer}>
    </View>
  );
}

function RoomSearchScreen() {
  return (
    <View style={styles.outerContainer}>
      <Text>방 찾기 화면</Text>
    </View>
  );
}

export default Home;