import { styles } from '../styles/resultCss'; // 스타일 파일 경로
import React, { useState, useEffect, useRef } from 'react';
import { Image, View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';

const Result = ({route}) => {
  // route를 통해 전달된 apiPlayerData를 추출
  const { apiPlayerData, api2PlayerData, championImages } = route.params;
  // 활성화된 데이터 타입을 추적하기 위한 상태
  const [activeDataType, setActiveDataType] = useState(null);
  // 최적화된 팀 데이터를 관리하는 상태
  const [optimizedTeamData, setOptimizedTeamData] = useState([]);
  // 블루팀의 평균 티어 점수 관리
  const [averageTierScoreBlue, setAverageTierScoreBlue] = useState(0);
  // 레드팀의 평균 티어 점수 관리
  const [averageTierScoreRed, setAverageTierScoreRed] = useState(0);
  // 선택된 플레이어의 인덱스 관리
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(null);
  // 스왑 발생했는지 여부를 관리
  const [hasSwapped, setHasSwapped] = useState(false);
  // 초기 팀 구성 및 플레이어 위치 저장을 위한 상태
  const [initialTeamData, setInitialTeamData] = useState(null);
  const [initialPositions, setInitialPositions] = useState({ xPositions: [], yPositions: [] });
  const [championImagesBlue, setChampionImagesBlue] = useState([]);
  const [championImagesRed, setChampionImagesRed] = useState([]);
  // boxWidth 상태 초기화
  const [boxWidth, setBoxWidth] = useState(Dimensions.get('window').width - 10);
  const [zIndexes, setZIndexes] = useState(Array.from({ length: 10 }, () => 0));
  
  // 로마숫자를 숫자로 변환하는 함수
  const romanToInt = (s) => {
    const romanMap = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4 };
    return romanMap[s] || 0;
  };
  
  // 티어를 점수로 변환하는 함수
  const calculateTierScore = (player) => {
    const tiers = {
      UNRANKED: 13,
      IRON: 1,
      BRONZE: 2,
      SILVER: 3,
      GOLD: 4,
      PLATINUM: 5,
      EMERALD: 6,
      DIAMOND: 7,
      // 마스터 이상의 티어 점수는 별도 로직으로 처리
    };
    let score;
    const [tierType, divisionOrPoints] = player.tier.split(' ');
    if (tierType === 'UNRANKED') {
      // 언랭크 플레이어의 점수 반환
      return tiers.UNRANKED;
    } else if (tierType === 'MASTER' || tierType === 'GRANDMASTER' || tierType === 'CHALLENGER') {
      // 마스터 이상의 티어 점수 계산
      const points = parseInt(divisionOrPoints, 10);
      score = (points / 100) * 6 + 100;
    } else {
      // 다이아몬드 이하의 티어 점수 계산
      const tierScoreBase = (tiers[tierType] - 1) * 4 * 3;
      const divisionScore = (4 - romanToInt(divisionOrPoints)) * 3;
      score = 16 + tierScoreBase + divisionScore;
    }
    return score;
  };
  
  // 팀의 평균 티어 점수를 계산하는 함수
  const calculateAverageTierScore = (team) => {
    const totalScore = team.reduce((acc, player) => acc + calculateTierScore(player), 0);
    return totalScore / team.length;
  };
  
  // 점수를 티어로 변환하는 함수
  const scoreToTier = (score) => {(typeof score !== 'number' || isNaN(score))
    const divisions = ['IV', 'III', 'II', 'I'];
    const tiers = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND'];
    const reverseMasterScoreCalculation = (score) => {
      return Math.round((score - 100) / 6 * 100);
    };
    if (score >= 100) {
      return `${score >= 148 ? 'CHALLENGER' : score >= 133 ? 'GRANDMASTER' : 'MASTER'} ${reverseMasterScoreCalculation(score)}`;
    } else {
      let tierIndex = Math.floor((score - 16) / 12);
      let divisionIndex = ((score - 16) % 12) / 3;
      return `${tiers[tierIndex]} ${divisions[Math.floor(divisionIndex)]}`;
    }
  };

  const handleRefresh = () => {
    // 초기 상태로 복원
    if (initialTeamData && initialPositions) {
      const restoredTeamData = calculateAllPlayerScores(initialTeamData);
      setOptimizedTeamData(restoredTeamData); // 초기 플레이어 데이터와 선호도 색상을 복원
      setXPositions([...initialPositions.xPositions]);
      setYPositions([...initialPositions.yPositions]);
      setHasSwapped(false); // 스왑 상태 초기화
      setAverageTierScoreBlue(calculateAverageTierScore(initialTeamData.blueTeam));
      setAverageTierScoreRed(calculateAverageTierScore(initialTeamData.redTeam));
      setSelectedPlayerIndex(null); // 선택된 플레이어 인덱스 초기화
    }
  };

  // 티어 이미지를 가져오는 함수
  const tierImages = {
    UNRANKED: require('../assets/RankedEmblemsLatest/RankUnknown.png'),
    IRON: require('../assets/RankedEmblemsLatest/RankIron.png'),
    BRONZE: require('../assets/RankedEmblemsLatest/RankBronze.png'),
    SILVER: require('../assets/RankedEmblemsLatest/RankSilver.png'),
    GOLD: require('../assets/RankedEmblemsLatest/RankGold.png'),
    PLATINUM: require('../assets/RankedEmblemsLatest/RankPlatinum.png'),
    EMERALD: require('../assets/RankedEmblemsLatest/RankEmerald.png'),
    DIAMOND: require('../assets/RankedEmblemsLatest/RankDiamond.png'),
    MASTER: require('../assets/RankedEmblemsLatest/RankMaster.png'),
    GRANDMASTER: require('../assets/RankedEmblemsLatest/RankGrandmaster.png'),
    CHALLENGER: require('../assets/RankedEmblemsLatest/RankChallenger.png'),
  };
  
  // 소환사의 협곡을 위한 팀 구성 함수
  const formTeams = (apiPlayerData) => {
    // 라인별 선호도 초기화
    const linePreferences = {
      TOP: 0,
      JUNGLE: 0,
      MIDDLE: 0,
      BOTTOM: 0,
      UTILITY: 0,
    };
    // 라인별 선호도를 기반으로 팀을 구성하는 함수
    apiPlayerData.forEach(player => {
      linePreferences.TOP += player.TOPPreference;
      linePreferences.JUNGLE += player.JUNGLEPreference;
      linePreferences.MIDDLE += player.MIDDLEPreference;
      linePreferences.BOTTOM += player.BOTTOMPreference;
      linePreferences.UTILITY += player.UTILITYPreference;
    });
    // 라인별 인기 순위 정렬
    const lineRankings = Object.entries(linePreferences).sort((a, b) => b[1] - a[1]);
    // 선택된 플레이어 추적
    const selectedPlayers = new Set();
    // 각 라인에서 선호도가 가장 높은 소환사를 선택
    const teamAssignments = {
      TOP: [],
      JUNGLE: [],
      MIDDLE: [],
      BOTTOM: [],
      UTILITY: []
    };
    lineRankings.forEach(([line]) => {
      const sortedPlayers = apiPlayerData
        .filter(player => !selectedPlayers.has(player.nickname))
        .sort((a, b) => b[`${line}Preference`] - a[`${line}Preference`]);
      if (sortedPlayers.length > 0) {
        const playerWithLine = { ...sortedPlayers[0], assignedLine: line };
        teamAssignments[line].push(playerWithLine);
        selectedPlayers.add(sortedPlayers[0].nickname);
        if (sortedPlayers.length > 1) {
          const playerWithLine2 = { ...sortedPlayers[1], assignedLine: line };
          teamAssignments[line].push(playerWithLine2);
          selectedPlayers.add(sortedPlayers[1].nickname);
        }
      }
    });
    // 선호도에 따른 라인 배정 결과를 반환
    return {
      blue: [teamAssignments.TOP[0], teamAssignments.JUNGLE[0], teamAssignments.MIDDLE[0], teamAssignments.BOTTOM[0], teamAssignments.UTILITY[0]],
      red: [teamAssignments.TOP[1], teamAssignments.JUNGLE[1], teamAssignments.MIDDLE[1], teamAssignments.BOTTOM[1], teamAssignments.UTILITY[1]],
    };
  };
  
  // 팀의 점수를 이용해 각 라인끼리 스왑하여 평균 점수를 맞추는 함수
  const optimizeTeams = (blueTeam, redTeam) => {
    let optimized = false;
    while (!optimized) {
      optimized = true; // 최적화가 필요 없다고 가정
        for (let i = 0; i < blueTeam.length; i++) {
          // 각 라인별 플레이어 스왑 시도
          const bluePlayer = blueTeam[i];
          const redPlayer = redTeam[i];
          // 스왑 후의 평균 점수 차이 계산
          let tempBlueTeam = [...blueTeam];
          let tempRedTeam = [...redTeam];
          tempBlueTeam[i] = redPlayer;
          tempRedTeam[i] = bluePlayer;
          const currentDifference = Math.abs(calculateAverageTierScore(blueTeam) - calculateAverageTierScore(redTeam));
          const newDifference = Math.abs(calculateAverageTierScore(tempBlueTeam) - calculateAverageTierScore(tempRedTeam));
          // 새로운 차이가 더 작으면 스왑 수행
          if (newDifference < currentDifference) {
            blueTeam = tempBlueTeam;
            redTeam = tempRedTeam;
            optimized = false; // 최적화 발생
          }
        }
      }
    return { blueTeam, redTeam };
  };

  // 라인 꼬임 표시 함수
  const preferenceColor = (player) => {
    const preferences = [
      { line: 'TOP', value: player.TOPPreference },
      { line: 'JUNGLE', value: player.JUNGLEPreference },
      { line: 'MIDDLE', value: player.MIDDLEPreference },
      { line: 'BOTTOM', value: player.BOTTOMPreference },
      { line: 'UTILITY', value: player.UTILITYPreference },
    ];
    // 선호도에 따라 정렬
    const sortedPreferences = preferences.sort((a, b) => b.value - a.value);
    // 배정받은 라인이 선호도 상위 라인인지 확인
    const assignedLineRank = sortedPreferences.findIndex(preference => preference.line === player.assignedLine);
    // 조건에 따라 색상 결정
    if (assignedLineRank === 0) {
      return 'transparent'; // 가장 선호하는 라인에 배정받음
    } else if (assignedLineRank === 1 && sortedPreferences[1].value === 0) {
      return 'red'; // 두 번째로 선호하는 라인이지만 선호도가 0
    } else if (assignedLineRank > 1) {
      return 'red'; // 세 번째 이하의 선호도 라인에 배정
    } else {
      return 'orange'; // 나머지 조건 (두 번째로 선호하는 라인에 배정받고 선호도가 0이 아님)
    }
  };

  // 라인 꼬임 표시 툴팁 함수
  const onCircleClick = (index) => {
    if (selectedPlayerIndex === index) {
      // 이미 선택된 원을 다시 클릭하면 선택 해제 (툴팁 숨김)
      setSelectedPlayerIndex(null);
    } else {
      // 다른 원을 클릭하면 선택 (툴팁 표시)
      setSelectedPlayerIndex(index);
    }
  };

  const calculateAllPlayerScores = (optimizedTeams) => {
    return [...optimizedTeams.blueTeam, ...optimizedTeams.redTeam].map(player => {
      const preferences = [
        { line: 'TOP', value: player.TOPPreference },
        { line: 'JUNGLE', value: player.JUNGLEPreference },
        { line: 'MIDDLE', value: player.MIDDLEPreference },
        { line: 'BOTTOM', value: player.BOTTOMPreference },
        { line: 'UTILITY', value: player.UTILITYPreference },
      ];
      // 선호도에 따라 정렬
      const sortedPreferences = preferences.sort((a, b) => b.value - a.value);
      const primaryLine = sortedPreferences[0].value > 0 ? sortedPreferences[0].line : '없음';
      const secondaryLine = sortedPreferences[1].value > 0 ? sortedPreferences[1].line : '없음';
      const topTwoPreferences = `주라인: ${primaryLine}\n부라인: ${secondaryLine}`;
      // 팀 색상 할당
      const teamColor = optimizedTeams.blueTeam.includes(player) ? 'blue' : 'red';
      // 점수 조정
      let adjustedScore = calculateTierScore(player);
      const color = preferenceColor(player);
      if (color === 'yellow') {
        adjustedScore -= 6;
      } else if (color === 'orange') {
        adjustedScore -= 9;
      } else if (color === 'red') {
        adjustedScore -= 12;
      }
      // 조정된 점수를 티어로 변환
      const adjustedTier = scoreToTier(adjustedScore);
      return {
        ...player,
        team: teamColor,
        adjustedScore: adjustedScore,
        color: color,
        topTwoPreferences: topTwoPreferences,
        adjustedTier: adjustedTier,
      };
    });
  };

  // 칼바람 나락을 위한 팀 구성 함수
  const howlingAbyssTeams = (api2PlayerData) => {
    // 플레이어의 티어 점수 계산
    const playerScores = api2PlayerData.map(player => ({
      nickname: player.nickname,
      tier: player.tier,
      score: calculateTierScore(player)
    }));
    // 플레이어를 티어 점수에 따라 정렬
    playerScores.sort((a, b) => b.score - a.score);
    // 두 팀 초기화
    let blueTeam = [], redTeam = [];
    // 초기 팀 배분
    playerScores.forEach((player, index) => {
      if (index % 2 === 0) {
        blueTeam.push(player);
      } else {
        redTeam.push(player);
      }
    });
    // 밸런스 조정
    let balanced = false;
    while (!balanced) {
      balanced = true; // 최적화가 필요 없다고 가정
      for (let i = 0; i < blueTeam.length; i++) {
        for (let j = 0; j < redTeam.length; j++) {
          let tempBlueTeam = [...blueTeam];
          let tempRedTeam = [...redTeam];
          [tempBlueTeam[i], tempRedTeam[j]] = [tempRedTeam[j], tempBlueTeam[i]];
          const currentDifference = Math.abs(calculateAverageTierScore(blueTeam) - calculateAverageTierScore(redTeam));
          const newDifference = Math.abs(calculateAverageTierScore(tempBlueTeam) - calculateAverageTierScore(tempRedTeam));
          if (newDifference < currentDifference) {
            [blueTeam[i], redTeam[j]] = [redTeam[j], blueTeam[i]];
            balanced = false;
          }
        }
      }
    }
    return { blueTeam, redTeam };
  };

  // 챔피언 이미지를 랜덤하게 선택하는 함수
  const selectRandomChampionImages = (championImages, count = 15, excludeImages = []) => {
    if (!championImages || championImages.length === 0) {
      return [];
    }
    // 이미 선택된 이미지를 제외
    const availableImages = championImages.filter(image => !excludeImages.includes(image));
    const shuffledImages = availableImages.sort(() => 0.5 - Math.random());
    return shuffledImages.slice(0, count);
  };

  // 블루팀 챔피언 리롤 핸들링 함수
  const handleRerollBlue = () => {
    // 레드팀 이미지를 제외하고 새로운 블루팀 이미지를 선택
    const newBlueTeamImages = selectRandomChampionImages(championImages, 15, championImagesRed);
    setChampionImagesBlue(newBlueTeamImages);
  };

  // 레드팀 챔피언 리롤 핸들링 함수
  const handleRerollRed = () => {
    // 블루팀 이미지를 제외하고 새로운 레드팀 이미지를 선택
    const newRedTeamImages = selectRandomChampionImages(championImages, 15, championImagesBlue);
    setChampionImagesRed(newRedTeamImages);
  };

  // 초기화 함수 수정
  const initializeChampionImages = () => {
    // 각 팀에 대해 겹치지 않는 이미지 세트를 초기화
    const initialBlueTeamImages = selectRandomChampionImages(championImages, 15);
    setChampionImagesBlue(initialBlueTeamImages);
    const initialRedTeamImages = selectRandomChampionImages(championImages, 15, initialBlueTeamImages);
    setChampionImagesRed(initialRedTeamImages);
  };

  useEffect(() => {
    let teams, optimizedTeams;
    const screenWidth = Dimensions.get('window').width;
    if (apiPlayerData && apiPlayerData.length > 0) {
      setActiveDataType('apiPlayerData');
      teams = formTeams(apiPlayerData);
      optimizedTeams = optimizeTeams(teams.blue, teams.red);
      setBoxWidth(screenWidth - 10);
    } else if (api2PlayerData && api2PlayerData.length > 0) {
      setActiveDataType('api2PlayerData');
      teams = howlingAbyssTeams(api2PlayerData);
      optimizedTeams = teams;
      setBoxWidth(screenWidth - 170);
      initializeChampionImages();
    } else {
      return;
    }
    const allPlayersWithScores = calculateAllPlayerScores(optimizedTeams);
    setOptimizedTeamData(allPlayersWithScores);
    setAverageTierScoreBlue(calculateAverageTierScore(optimizedTeams.blueTeam));
    setAverageTierScoreRed(calculateAverageTierScore(optimizedTeams.redTeam));
    setInitialTeamData(optimizedTeams);
    setInitialPositions({ xPositions: Array.from({ length: 10 }, () => 0), yPositions: Array.from({ length: 10 }, (_, i) => (i >= 5 ? 60 : 30) + i * (65 + 5)) });
  }, [apiPlayerData, api2PlayerData, championImages]);

  const updateTeamScores = (newOptimizedTeamData) => {
    const newBlueTeam = newOptimizedTeamData.slice(0, 5);
    const newRedTeam = newOptimizedTeamData.slice(5);
    setAverageTierScoreBlue(calculateAverageTierScore(newBlueTeam));
    setAverageTierScoreRed(calculateAverageTierScore(newRedTeam));
  };

  // 박스의 X축 위치와 Y축 위치를 관리하기 위한 상태 변수
  const [xPositions, setXPositions] = useState(Array.from({ length: 10 }, () => 0));
  const [yPositions, setYPositions] = useState(Array.from({ length: 10 }, (_, i) => (i >= 5 ? 60 : 30) + i * (65 + 5)));
  // 드래그 중인 박스의 인덱스와 시작 위치를 추적하기 위한 참조
  const draggingIndex = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);

  // 제스처 이벤트 핸들링 함수
  const onGestureEvent = (event, index) => {
    // 제스처가 활성화되었을 때의 로직
    if (event.nativeEvent.state === State.ACTIVE) {
      // 드래그를 시작하는 순간의 인덱스와 위치를 저장
      if (draggingIndex.current === null) {
        draggingIndex.current = index;
        startX.current = xPositions[index];
        startY.current = yPositions[index];
        let newZIndexes = [...zIndexes];
        newZIndexes[index] = 1;
        setZIndexes(newZIndexes);
      }
      // 드래그 중 박스의 새로운 위치 계산
      const newX = event.nativeEvent.translationX + startX.current;
      const newY = event.nativeEvent.translationY + startY.current;
      let newXPositions = [...xPositions];
      let newYPositions = [...yPositions];
      newXPositions[draggingIndex.current] = newX;
      newYPositions[draggingIndex.current] = newY;
      setXPositions(newXPositions);
      setYPositions(newYPositions);
    } else if (event.nativeEvent.state === State.END) {
      // 드래그 종료 시, 박스의 새로운 위치 계산
      const newX = event.nativeEvent.translationX + startX.current;
      const newY = event.nativeEvent.translationY + startY.current;
      let closest = index;
      let minDistance = Number.MAX_VALUE;
      // 드래그 종료 시, 가장 가까운 박스 찾기
      for (let i = 0; i < xPositions.length; i++) {
        if (i !== index) {
          const distance = Math.sqrt(Math.pow(xPositions[i] - newX, 2) + Math.pow(yPositions[i] - newY, 2));
          if (distance < minDistance) {
            minDistance = distance;
            closest = i;
          }
        }
      }
      if (closest !== index && minDistance <= 65 / 2) {
        let newOptimizedTeamData = [...optimizedTeamData];
        // 스왑할 플레이어들의 assignedLine 업데이트
        let tempLine = newOptimizedTeamData[index].assignedLine;
        newOptimizedTeamData[index].assignedLine = newOptimizedTeamData[closest].assignedLine;
        newOptimizedTeamData[closest].assignedLine = tempLine;
        // 스왑
        [newOptimizedTeamData[index], newOptimizedTeamData[closest]] = [newOptimizedTeamData[closest], newOptimizedTeamData[index]];
        // 스왑된 플레이어들의 preferenceColor 및 조정된 점수 업데이트
        setHasSwapped(true); // 스왑이 발생했음을 표시
        newOptimizedTeamData = newOptimizedTeamData.map(player => {
          const color = preferenceColor(player);
          let adjustedScore = calculateTierScore(player);
          if (color === 'orange') {
            adjustedScore -= 6;
          } else if (color === 'red') {
            adjustedScore -= 12;
          }
          return {
            ...player,
            color: color,
            adjustedScore: adjustedScore
          };
        });
        setOptimizedTeamData(newOptimizedTeamData);
        updateTeamScores(newOptimizedTeamData);
        // 가장 가까운 박스와 스왑
        let newXPositions = [...xPositions];
        let newYPositions = [...yPositions];
        newXPositions[index] = startX.current;
        newYPositions[index] = startY.current;
        newXPositions[closest] = xPositions[closest];
        newYPositions[closest] = yPositions[closest];
        setXPositions(newXPositions);
        setYPositions(newYPositions);
      } else {
        // 자신과 가장 가까운 경우, 원래 위치로 복원
        let newXPositions = [...xPositions];
        let newYPositions = [...yPositions];
        newXPositions[index] = startX.current;
        newYPositions[index] = startY.current;
        setXPositions(newXPositions);
        setYPositions(newYPositions);
      }
      // zIndex 초기화
      let newZIndexes = [...zIndexes];
      newZIndexes[draggingIndex.current] = 0;
      setZIndexes(newZIndexes);
      draggingIndex.current = null;
    }
  };

  return (
    <GestureHandlerRootView>
      <View style={styles.outerContainer}>
        {/* 로고 필드 */}
        <View style={styles.logoContainer}>
        </View>
        <View style={styles.allBoxesContainer}>
          {/* 블루팀 평균티어 필드 */}
          <View style={[styles.rowContainer, { top: 5 }]}>
            <Text style={[styles.teamTextBlue]}> BlueTeam </Text>
            <Text style={[styles.teamText, styles.teamTextScore]}>평균 티어: {scoreToTier(averageTierScoreBlue)}</Text>
            <View style={{alignItems: 'flex-end', flex: 1 }}>
              <TouchableOpacity onPress={handleRefresh}>
                <Icon name="refresh" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
          {activeDataType === 'api2PlayerData' && (
            <View style={styles.blueTeamContainer}>
              <View style={styles.rerollButton}>
                <TouchableOpacity onPress={handleRerollBlue}>
                  <Icon name="casino" size={36} color="#000" />
                </TouchableOpacity>
              </View>
              {championImagesBlue.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.championImagesImage}
                />
              ))}
            </View>
          )}
          {/* 레드팀 평균티어 필드 */}
          <View style={[styles.rowContainer, { top: 385 }]}>
            <Text style={[styles.teamTextRed]}> RedTeam </Text>
            <Text style={[styles.teamText, styles.teamTextScore]}>평균 티어: {scoreToTier(averageTierScoreRed)}</Text>
            <View style={{alignItems: 'flex-end', flex: 1 }}>
            </View>
          </View>
          {activeDataType === 'api2PlayerData' && (
            <View style={styles.redTeamContainer}>
              <View style={styles.rerollButton}>
                <TouchableOpacity onPress={handleRerollRed}>
                  <Icon name="casino" size={36} color="#000" />
                </TouchableOpacity>
              </View>
              {championImagesRed.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.championImagesImage}
                />
              ))}
            </View>
          )}
          {optimizedTeamData.map((player, index) => (
            <PanGestureHandler
              key={player.nickname}
              onGestureEvent={(event) => onGestureEvent(event, index)}
              onHandlerStateChange={(event) => onGestureEvent(event, index)}
            >
              <View key={player.nickname} style={{
                ...styles.box, 
                width: boxWidth,
                left: xPositions[index], 
                top: yPositions[index],
                zIndex: zIndexes[index] // zIndex 적용
              }}>
                {/* 티어 이미지 필드 */}
                <View style={styles.tierImageContainer}>
                  <Image source={tierImages[player.tier.split(' ')[0]]} style={styles.tierImage} />
                </View>
                {/* 닉네임, 티어 필드 */}
                <View style={styles.textContainer}>
                  <Text style={styles.text}>{player.nickname}</Text>
                  <Text style={styles.text}>{player.tier}</Text>
                </View>
                {/* 라인 꼬임 표시 필드 */}
                {activeDataType === 'apiPlayerData' && (
                <TouchableOpacity
                  style={styles.circleContainer}
                  onPress={() => onCircleClick(index)}
                >
                  <View style={[styles.circle, { backgroundColor: preferenceColor(player) }]}/>
                  {selectedPlayerIndex === index && (
                    <View style={styles.tooltip}>
                      <Text style={styles.tooltipText}>{player.topTwoPreferences}</Text>
                      {!hasSwapped && player.tier !== 'UNRANKED' && (
                        <Text style={styles.tooltipText}>{player.adjustedTier}점 (조정됨)</Text>
                      )}
                      {!hasSwapped && player.tier === 'UNRANKED' && <Text style={styles.tooltipText}>UNRANKED (조정됨)</Text>} 
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </PanGestureHandler>
        ))}
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

export default Result;