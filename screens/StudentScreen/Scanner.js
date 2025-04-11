import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Text, Button, IconButton } from 'react-native-paper';
import { db } from '../FirebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export default function Scanner({ route }) {
  const email = route.params?.email || 'test@gmail.com';
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [tally, setTally] = useState(0);
  const [markedDates, setMarkedDates] = useState({});
  const [studentName, setStudentName] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [cameraActive, setCameraActive] = useState(true); // Set initial state to true
  const [settings, setSettings] = useState({ warning: 3, communityService: 5 });
  const navigation = useNavigation();

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Camera permission is required to scan QR codes');
      }
    };

    const fetchStudentData = async () => {
      const docRef = doc(db, 'students', email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTally(data.tally);
        setStudentName(data.name);
        const dates = data.classDates.reduce((acc, date) => {
          const dateOnly = date.split('T')[0];
          acc[dateOnly] = { marked: true, dotColor: 'green' };
          return acc;
        }, {});
        setMarkedDates(dates);
      } else {
        Alert.alert('No such student found');
      }
    };

    const fetchSettings = async () => {
      const docRef = doc(db, 'settings', 'rewardPunishment');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data().thresholds);
      }
    };

    getBarCodeScannerPermissions();
    fetchStudentData();
    fetchSettings();
  }, [email]);

  const handleBarCodeScanned = async ({ type, data }) => {
    try {
      setScanned(true);
      setModalMessage('Analyzing...');
      setModalVisible(true);

      const now = new Date().toISOString();
      const today = now.split('T')[0];

      if (data !== today) {
        setModalMessage('Invalid QR Code');
        setTimeout(() => {
          setModalVisible(false);
          setScanned(false);
          setCameraActive(true); // Keep camera active
        }, 2000);
        return;
      }

      const docRef = doc(db, 'students', email);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        setModalMessage('No such student found');
        setTimeout(() => {
          setModalVisible(false);
          setScanned(false);
          setCameraActive(true); // Keep camera active
        }, 2000);
        return;
      }

      const studentData = docSnap.data();
      const alreadyScannedToday = studentData.classDates.some(date => date.startsWith(today));

      if (alreadyScannedToday) {
        setScanCount(scanCount + 1);
        if (scanCount >= 1) {
          await updateDoc(docRef, {
            tally: tally - 1,
            classDates: arrayRemove(now),
          });
          setTally(tally - 1);
          setMarkedDates((prevDates) => {
            const newDates = { ...prevDates };
            delete newDates[today];
            return newDates;
          });
          setModalMessage('Scan Warning: Tally Decreased');
          setTimeout(() => {
            setModalVisible(false);
            Alert.alert(
              'Scan Warning',
              `You have already scanned for today. Tally has been decreased.\n\nEmail: ${email}\nName: ${studentName}\nTally: ${tally - 1}\nDate: ${formatDateTime(now)}`,
              [{ text: 'OK', onPress: () => setScanned(false) }]
            );
            setCameraActive(true); // Keep camera active
          }, 2000);
          setScanCount(0); // Reset scan count after decrementing tally
        } else {
          setModalMessage('Scan Warning: Already Scanned Today');
          setTimeout(() => {
            setModalVisible(false);
            Alert.alert(
              'Scan Warning',
              `You have already scanned for today. Scanning again will decrease your tally.\n\nEmail: ${email}\nName: ${studentName}\nTally: ${tally}\nDate: ${formatDateTime(now)}`,
              [{ text: 'OK', onPress: () => setScanned(false) }]
            );
            setCameraActive(true); // Keep camera active
          }, 2000);
        }
      } else {
        await updateDoc(docRef, {
          tally: tally + 1,
          classDates: arrayUnion(now),
        });
        setTally(tally + 1);
        setMarkedDates({
          ...markedDates,
          [today]: { marked: true, dotColor: 'green' },
        });
        setModalMessage('Scan Successful');
        setTimeout(() => {
          setModalVisible(false);
          Alert.alert(
            'Scan Successful',
            `Student Information:\n\nEmail: ${email}\nName: ${studentName}\nTally: ${tally + 1}\nDate: ${formatDateTime(now)}`,
            [{ text: 'Present', onPress: () => setScanned(false) }]
          );
          setCameraActive(true); // Keep camera active
        }, 2000);
        setScanCount(0); // Reset scan count after successful scan
      }
    } catch (error) {
      setModalMessage(`Error: ${error.message}`);
      setTimeout(() => {
        setModalVisible(false);
        setScanned(false);
        setCameraActive(true); // Keep camera active
      }, 2000);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={() => BarCodeScanner.requestPermissionsAsync()} mode="contained">
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.navigate('StudentHome', { email })}
        />
        <Text style={styles.headerText}>Scanner</Text>
      </View>
      <View style={styles.scannerContainer}>
        {cameraActive && (
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        )}
      </View>
      {!cameraActive && (
        <Button mode="contained" onPress={() => setCameraActive(true)} style={styles.button}>
          Tap to Scan Again
        </Button>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.modalText}>{modalMessage}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  scannerContainer: {
    width: '100%',
    height: height * 0.7,
    marginBottom: height * 0.02,
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  button: {
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginTop: 10,
    fontSize: 18,
    textAlign: 'center',
  },
});