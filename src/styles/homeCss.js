import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#1a73e8',
        position: 'relative', // 상대 위치 지정
    },
    logoContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a73e8',
    },
    navContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a73e8',
    },
    navButton: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navButtonText: {
        color: 'white',
    },
    selectedTabButton: {
        backgroundColor: '#f4f6f8',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    selectedTabText: {
        color: '#000000',
    },
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f4f6f8',
        position: 'relative', // 상대 위치 지정
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
      },
    searchInput: {
        flex: 1,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 3,
        padding: 20,
    },
    searchIcon: {
        position: 'absolute',
        right: 20,
    },
    playerRow: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginLeft: 15,
        marginRight: 15,
        zIndex: 11, // 다른 요소들 위에 렌더링되도록 zIndex 설정
    },
    PlayerContainer: {
        position: 'relative',
        zIndex: 11, // 다른 요소들 위에 렌더링되도록 zIndex 설정
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#dddddd',
        borderRadius: 10,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
    },
    PlayerInput: {
        flex: 1,
        height: 30,
    },
    teamMatchButton: {
        backgroundColor: '#1a73e8',
        padding: 20,
        borderRadius: 30,
        marginTop: 25,
        marginBottom: 25,
        width: '60%',
        alignSelf: 'center',
    },
    teamMatchText: {
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    teamMatchButtonDisabled: {
        backgroundColor: '#cccccc',
    },
    teamMatchtextDisabled: {
        color: '#666666',
    },
    deleteIcon: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1,
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 78,
        left: '3%',
        right: '3%',
        backgroundColor: 'white',
        borderRadius: 10, // 모서리 둥글게
        borderWidth: 1.5, // 테두리 두께
        borderColor: '#cccccc', // 테두리 색상
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 20,
    },
    suggestionItem: {
        flexDirection: 'row', // 요소들을 수평으로 배치
        alignItems: 'center', // 요소들을 수직 중앙에 정렬
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
        height: 40, // 항목의 높이 조절
    },
    suggestionText: {
        fontSize: 16,
    },
    boxShadowExample: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
        // 기타 스타일
    },
    deleteIcon: {
        marginLeft: 'auto', // 왼쪽 여백을 자동으로 조정하여 오른쪽에 정렬
        padding: 10, // 클릭 가능 영역을 늘리기 위한 패딩
    },
    upsite: {
        zIndex: 20, // 다른 요소들 위에 렌더링되도록 zIndex 설정
    },
    suggestionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // 상단 정렬 대신 시작 지점 정렬
        padding: 10,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
    },    
    suggestionHeaderText: {
        fontSize: 16, // 글꼴 크기
        color: '#333333', // 글꼴 색상
    },
        // buttonsContainer 스타일 추가
    buttonsContainer: {
        flexDirection: 'row', // 좌우로 배치
        alignItems: 'center', // 수직 정렬
    },
    // updateButton 및 deleteButton 스타일 수정 (width 추가)
    updateButton: {
        width: 20, // 버튼의 너비
        marginRight: 10, // 최신화 버튼과 삭제 버튼 사이의 간격
        marginLeft: 10, // 최신화 버튼과 삭제 버튼 사이의 간격
    },
    deleteButton: {
        width: 20, // 버튼의 너비
    },
    // 제목 텍스트 스타일
    suggestionHeaderText: {
        fontSize: 16, // 글꼴 크기 증가
        fontWeight: 'bold', // 글꼴 굵기
        color: '#333333',
        marginTop: 2, // 위쪽으로부터 자동 여백
    },
    // 전체 삭제 텍스트 스타일
    clearText: {
        fontSize: 12,
        color: '#333333',
        alignSelf: 'flex-end', // 오른쪽 정렬
        marginTop: 8, // 위쪽으로부터 자동 여백
        marginBottom: 0,
    },
});