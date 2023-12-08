import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const boxWidth = screenWidth - 10;

export const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#f4f6f8',
      },
      logoContainer: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
      },
      allBoxesContainer: {
        height: screenHeight,
        width: screenWidth,
        backgroundColor: '#f4f6f8',
      },
      box: {
        width: boxWidth,
        height: 65,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        margin: 5,
        flexDirection: 'row',
        position: 'absolute',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        alignSelf: 'flex-start',
        paddingTop: 5,
      },
      rowContainer: {
        width: '100%',
        justifyContent: 'space-between',
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,
      },
      blueTeamContainer: {
        position: 'absolute',
        top: 20,
        right: 0,
        width: 158,
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 1,
        alignItems: 'center',
      },
      redTeamContainer: {
        position: 'absolute',
        top: 400,
        right: 0,
        width: 158,
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 1,
        alignItems: 'center',
      },
      teamText: {
        alignItems: 'flex-start',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
      },
      teamTextBlue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'blue',
      },
      teamTextRed: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'red',
      },
      teamTextScore: {
        alignItems: 'flex-start',
        fontSize: 14,
      },
      textContainer: {
        justifyContent: 'center',
        alignItems: 'flex-start',
      },
      text: {
        color: '#333',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
      },
      tierImageContainer: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 10,
        paddingRight: 10,
      },
      tierImage: {
        width: 70,
        height: 70,
      },
      championImagesImageContainer: {
        position: 'absolute',
        right: 0,
        top: 100,
        width: 158,
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 1,
      },
      rerollButton: {
        width: 120,
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 42,
        left: 15,
      },
      championImagesImage: {
        width: 50,
        height: 50,
        margin: 1,
      },
      circleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        padding: 10,
      },
      circle: {
        width: 10,
        height: 10,
        borderRadius: 5,
      },
      tooltip: {
        position: 'absolute',
        right: 30,
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 5,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      tooltipText: {
        fontSize: 10,
        color: 'black',
      },
      championMasteryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      championImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
      },
      championScore: {
        fontSize: 10,
        marginLeft: 5,
      },
});