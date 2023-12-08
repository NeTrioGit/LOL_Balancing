import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { outputUser } from '../services/getDoc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../styles/homeCss';

// 로컬 스토리지에서 최근 검색어를 가져오는 함수
const getRecentSearches = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('recentSearches');
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    // 오류 처리
    console.error("Error reading recent searches", e);
    return [];
  }
};

const saveSearchTerm = async (profileName) => {
  try {
    let recentSearches = await getRecentSearches();

    // 중복 검색어 제거 (대소문자 구분 없이)
    recentSearches = recentSearches.filter(term => term.toLowerCase() !== profileName.toLowerCase());
    
    // 새 검색어 추가
    recentSearches.unshift(profileName);
    
    // 최대 저장 개수 유지 (예: 최대 5개)
    if (recentSearches.length > 5) {
      recentSearches.pop();
    }
    
    const jsonValue = JSON.stringify(recentSearches);
    await AsyncStorage.setItem('recentSearches', jsonValue);
  } catch (e) {
    console.error("Error saving search term", e);
  }
};

export default function SearchComponent({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [onoff, setOnOff] = useState(false);

  const timeoutRef = useRef();

  const [searchMode, setSearchMode] = useState('recent'); // 'recent' 또는 'suggestions'
  const searchInputRef = useRef();

  useEffect(() => {
    // 컴포넌트가 마운트될 때 한 번만 최근 검색어 로드
    const loadRecentSearches = async () => {
      const recentSearches = await getRecentSearches();
      setSuggestions(recentSearches);
    };
  
    // searchTerm 상태가 변경될 때마다 실행
    const handleSearchTermChange = async () => {
      if (searchTerm.length == 0) {

        setSearchMode('recent');
        await loadRecentSearches();
      } else {

        setSearchMode('suggestions');
        fetchSummoners(searchTerm);
      }
    };

    handleSearchTermChange();
  }, [searchTerm]); // searchTerm이 변경될 때마다 useEffect가 다시 실행됩니다.

  const fetchSummoners = async (name) => {
    const summonerRef = collection(firestore, "User_info");
    const nameLower = name.toLowerCase(); // Convert input name to lowercase
    const querySnapshot = await getDocs(summonerRef);
  
    // Filter suggestions based on document keys (case-insensitive)
    const filteredSuggestions = querySnapshot.docs
      .filter(doc => doc.id.toLowerCase().includes(nameLower))
      .map(doc => doc.data().profileInfo.name); // Use the profileInfo.name for display
  
    setSuggestions(filteredSuggestions);
  };

  const handleSearchChange = (text) => {
    setSearchTerm(text);
  };
  const handleSearchFocus = () => {
    setOnOff(true)
  };

  const handleSearchBlur = () => {
    timeoutRef.current = setTimeout(() => {
      setOnOff(false);
    }, 100);
  };
  
  // Clear the timeout if the component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSearchSubmit = async () => {
    if (searchTerm) {
      const summonerData = await outputUser(searchTerm);
      if (summonerData) {
        saveSearchTerm(summonerData.profileInfo.name);
        setSearchTerm('');
        onSearch(summonerData);
        loadRecentSearches(); // 최근 검색 목록 다시 로드
      }
    }
  };
  const loadRecentSearches = async () => {
    const recentSearches = await getRecentSearches();
    setSuggestions(recentSearches);
  };


  const handleSelectSummoner = async (name) => {
    console.log("Select Summoner:", name);
    const summonerData = await outputUser(name);
    if (summonerData) {
      setSearchTerm('');
      saveSearchTerm(name);
      onSearch(summonerData);
      setOnOff(false);
    }
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem('recentSearches');
      setSuggestions([]);
    } catch (e) {
      console.error("Error clearing recent searches", e);
    }
  };
  const deleteRecentSearch = async (nameToDelete) => {
    console.log("Select Summoner:", nameToDelete); // 디버그 로그 추가
    let recentSearches = await getRecentSearches();
    recentSearches = recentSearches.filter(name => name !== nameToDelete);

    const jsonValue = JSON.stringify(recentSearches);
    await AsyncStorage.setItem('recentSearches', jsonValue);
    setSuggestions(recentSearches);
  };
  return (
    <View>
      {/* 검색창 입력 필드 */}
      <View style={styles.searchContainer}>
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="소환사 이름을 입력하세요."
          placeholderTextColor="#cccccc"
          value={searchTerm}
          onChangeText={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          onSubmitEditing={handleSearchSubmit}
        />
        <Pressable onPress={handleSearchSubmit} style={styles.searchIcon}>
          <Icon name="search" size={30} color="#808080" />
        </Pressable>
      </View>

      {/* 연관 검색어 및 최근 검색어 목록 */}
      {onoff && (
        <View style={styles.suggestionsContainer}
              onMouseEnter={() => {
                setOnOff(true);
              }} // 커서가 연관 검색 창 위에 올라갔을 때
              onMouseLeave={() => {
                timeoutRef.current = setTimeout(() => {
                  setOnOff(false);
                }, 100);
              }} // 커서가 연관 검색 창에서 벗어났을 때
            >
            <View style={styles.suggestionHeader}>
              <Text style={styles.suggestionHeaderText}>
                {searchMode === 'suggestions' ? '연관 검색어' : '최근 검색어'}
              </Text>
              {searchMode === 'recent' && (
                <Pressable onPress={clearRecentSearches}>
                  <Text style={styles.clearText}>전체 삭제</Text>
                </Pressable>
              )}
            </View>
          {suggestions.map((name, index) => (
            <View key={index} style={styles.suggestionItem}>
              <Pressable onPress={() => handleSelectSummoner(name)} style={{ flex: 1 }}>
                <Text style={styles.suggestionText}>{name}</Text>
              </Pressable>
              {searchMode === 'recent' && (
                <Pressable onPress={() => deleteRecentSearch(name)} style={styles.deleteIcon}>
                  <Icon name="delete" size={20} color="#808080" />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}