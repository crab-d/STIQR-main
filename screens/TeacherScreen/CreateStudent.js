import React, { useState } from 'react';
import { StyleSheet, View, Alert, Modal, Text, ActivityIndicator } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import { db } from '../FirebaseConfig';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function CreateStudent({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [section, setSection] = useState('ITM302');
  const [isCreating, setIsCreating] = useState(false);

  const createStudent = async () => {
    if (email && password && name && section) {
      setIsCreating(true);
      try {
        const studentDocRef = doc(db, 'students', email);
        const studentDocSnap = await getDoc(studentDocRef);

        if (studentDocSnap.exists()) {
          Alert.alert('Error', 'Student email already exists.\nYou can add this student to the section you want.');
          setIsCreating(false);
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const generateUniqueId = async () => {
          let uniqueId;
          let isUnique = false;
          while (!isUnique) {
            uniqueId = Math.floor(10000 + Math.random() * 90000).toString();
            const q = query(collection(db, 'students'), where('studentId', '==', uniqueId));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
              isUnique = true;
            }
          }
          return uniqueId;
        };
        const studentId = await generateUniqueId();

        await setDoc(studentDocRef, {
          password,
          name,
          section,
          tally: 0,
          classDates: [],
          createdAt: today,
          studentId: studentId
        });

        Alert.alert('Success', 'Student created successfully.');
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setIsCreating(false);
      }
    } else {
      Alert.alert('Error', 'Please fill in all fields.');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Create Student</Title>
          <Paragraph>Fill in the details to create a new student</Paragraph>
          <TextInput
            label="Student Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry
          />
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
          />
          <Button mode="contained" onPress={createStudent} style={[styles.button, styles.createButton]}>
            Create Student
          </Button>
          <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
            Back to Teacher Screen
          </Button>
        </Card.Content>
      </Card>

      <Modal
        transparent={true}
        animationType="slide"
        visible={isCreating}
        onRequestClose={() => setIsCreating(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text style={styles.modalText}>Creating student...</Text>
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
  card: {
    width: '100%',
    padding: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  createButton: {
    backgroundColor: '#6200ee',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginTop: 10,
    fontSize: 18,
    color: '#6200ee',
  },
});