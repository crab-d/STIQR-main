import React, { useState, useEffect } from 'react';
import { StyleSheet, Modal, View, Alert, TouchableOpacity, FlatList, BackHandler } from 'react-native';
import { TextInput, Button, Text, Card, Avatar, IconButton } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { db, auth } from '../FirebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const avatarIcons = [
  'account', 'star', 'heart', 'camera', 'emoticon', 'robot', 'alien', 'cat', 'dog'
];

export default function TeacherHome({ navigation, route }) {
  const [qrValue, setQrValue] = useState('');
  const email = route.params?.email || 'test@gmail.com';
  const [modalVisible, setModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('account');

  useEffect(() => {
    const backAction = () => {
      // Prevent default back action
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDocRef = doc(db, 'teachers', email);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSelectedAvatar(userData.avatarIcon || 'account');
      }
    };
    fetchUserData();
  }, [email]);

  const generateQRCode = () => {
    const today = new Date();
    const localDate = today.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
    console.log(`Generated QR Code for date: ${localDate}`); // Log the generated date
    setQrValue(localDate);
    setModalVisible(true);
  };

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "No",
          onPress: () => console.log("Logout cancelled"),
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await signOut(auth);
              await AsyncStorage.clear(); 
              navigation.navigate('Login');
            } catch (error) {
              Alert.alert('Error logging out:', error.message);
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  const handleAvatarSelect = async (icon) => {
    setSelectedAvatar(icon);
    setAvatarModalVisible(false);
    const userDocRef = doc(db, 'teachers', email);
    await updateDoc(userDocRef, { avatarIcon: icon });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
              <Avatar.Icon size={40} icon={selectedAvatar} />
            </TouchableOpacity>
            <Text style={styles.emailText}>{email}</Text>
            <IconButton
              icon="cog"
              size={24}
              onPress={() => navigation.navigate('Settings', { email, userType: 'teachers' })}
            />
          </View>
          <Button mode="contained" onPress={generateQRCode} style={styles.button}>
            Generate QR Code
          </Button>
          <Button mode="contained" onPress={() => navigation.navigate('StudentList', { email })} style={styles.button}>
            Student Records
          </Button>
          <Button mode="contained" onPress={() => navigation.navigate('CreateStudent', { email })} style={styles.button}>
            Student Creation
          </Button>
          <Button mode="contained" onPress={() => navigation.navigate('StudentDeletion', { email })} style={styles.button}>
            Student Deletion
          </Button>
          <Button mode="contained" onPress={() => navigation.navigate('RewardPunishmentSettings', { email })} style={styles.button}>
            Reward-Punishment Settings
          </Button>
          <Button mode="contained" onPress={() => navigation.navigate('FAQ')} style={styles.button}>
            FAQ
          </Button>
          <Button mode="contained" onPress={handleLogout} style={[styles.button, styles.logoutButton]}>
            Logout
          </Button>
        </Card.Content>
      </Card>
  
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.qrText}>Scan this QR code:</Text>
          <QRCode value={qrValue} size={300} />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <Text style={styles.textStyle}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
  
      <Modal
        animationType="slide"
        transparent={true}
        visible={avatarModalVisible}
        onRequestClose={() => {
          setAvatarModalVisible(!avatarModalVisible);
        }}
      >
        <View style={styles.avatarModalView}>
          <Text style={styles.qrText}>Select an Avatar Icon:</Text>
          <FlatList
            data={avatarIcons}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleAvatarSelect(item)}>
                <Avatar.Icon size={40} icon={item} style={styles.avatarIcon} />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            numColumns={3}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setAvatarModalVisible(!avatarModalVisible)}
          >
            <Text style={styles.textStyle}>Close</Text>
          </TouchableOpacity>
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
  card: {
    width: '100%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  emailText: {
    marginLeft: 10,
    fontSize: 18,
    flex: 1,
  },
  button: {
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: 'red', // Set the background color to red
  },
  modalView: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginTop: 'auto',
    margin: 20,
    padding: 35,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarModalView: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginTop: 'auto',
    margin: 20,
    padding: 35,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    backgroundColor: '#590de4',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 20,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  qrText: {
    fontSize: 20,
    marginBottom: 20,
  },
  avatarIcon: {
    margin: 10,
  },
});