import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert, ActivityIndicator, Text, TextInput, Modal } from 'react-native';
import { Card, Title, Paragraph, IconButton, Button } from 'react-native-paper';
import { db } from '../FirebaseConfig';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';

export default function StudentDeletion({ route, navigation }) {
  const { email } = route.params; // Receive the email parameter
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [deleteAll, setDeleteAll] = useState(false); // State to track if deleting all students

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'students'));
        const studentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudents(studentsList);
      } catch (error) {
        console.error("Error fetching students:", error);
        Alert.alert('Error', 'Failed to fetch students');
      }
    };

    fetchStudents();
  }, []);

  const verifyPasswordAndDelete = async () => {
    try {
      const teacherDocRef = doc(db, 'teachers', email);
      const teacherDocSnap = await getDoc(teacherDocRef);

      if (!teacherDocSnap.exists()) {
        Alert.alert('Error', 'Teacher not found');
        return;
      }

      const teacherData = teacherDocSnap.data();
      if (teacherData.password !== confirmPassword) {
        Alert.alert('Error', 'Incorrect password');
        return;
      }

      if (deleteAll) {
        await deleteAllStudents();
      } else {
        await deleteStudent(selectedStudentId);
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      Alert.alert('Error', 'Failed to verify password');
    } finally {
      setModalVisible(false);
      setConfirmPassword('');
      setDeleteAll(false);
    }
  };

  const deleteStudent = async (studentId) => {
    try {
      setLoading(true);
      setLoadingMessage('Deleting student...');
      const studentDocRef = doc(db, 'students', studentId);
      await deleteDoc(studentDocRef);
      setStudents(students.filter(student => student.id !== studentId));
      setLoadingMessage('Student deleted successfully');
      setTimeout(() => {
        setLoading(false);
        setLoadingMessage('');
      }, 2000);
    } catch (error) {
      console.error("Error deleting student:", error);
      setLoading(false);
      setLoadingMessage('');
      Alert.alert('Error', error.message);
    }
  };

  const deleteAllStudents = async () => {
    try {
      setLoading(true);
      setLoadingMessage('Deleting all students...');
      const deletePromises = students.map(student => {
        const studentDocRef = doc(db, 'students', student.id);
        return deleteDoc(studentDocRef);
      });
      await Promise.all(deletePromises);
      setStudents([]);
      setLoadingMessage('All students deleted successfully');
      setTimeout(() => {
        setLoading(false);
        setLoadingMessage('');
      }, 2000);
    } catch (error) {
      console.error("Error deleting all students:", error);
      setLoading(false);
      setLoadingMessage('');
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.sectionName}>All Students</Title>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
        </View>
      )}
      {!loading && (
        <FlatList
          data={students}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardContent}>
                  <View>
                    <Title onPress={() => navigation.navigate('StudentDetails', { studentId: item.id })}>{item.name}</Title>
                    <Paragraph>Student ID: {item.studentId}</Paragraph>
                    <Paragraph>Email: {item.id}</Paragraph>
                    <Paragraph>Created At: {item.createdAt}</Paragraph>
                  </View>
                  <IconButton
                    icon="delete"
                    onPress={() => {
                      setSelectedStudentId(item.id);
                      setDeleteAll(false); // Ensure deleteAll is false for single student deletion
                      setModalVisible(true);
                    }}
                  />
                </View>
              </Card.Content>
            </Card>
          )}
        />
      )}
      <Button mode="contained" onPress={() => {
        setDeleteAll(true);
        setModalVisible(true);
      }} style={styles.button}>
        Delete All Students
      </Button>
      <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
        Back to Folders
      </Button>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Please enter your password to confirm deletion:</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              secureTextEntry
              placeholder="Enter your password"
            />
            <Button mode="contained" onPress={verifyPasswordAndDelete} style={styles.button}>
              Confirm
            </Button>
            <Button mode="contained" onPress={() => setModalVisible(false)} style={styles.button}>
              Cancel
            </Button>
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
    padding: 20,
  },
  sectionName: {
    marginTop: 30,
    fontSize: 24,
  },
  card: {
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
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
    marginBottom: 10,
    fontSize: 18,
    textAlign: 'center',
  },
});