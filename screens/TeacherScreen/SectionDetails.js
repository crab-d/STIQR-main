import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert, TextInput, Modal, Text } from 'react-native';
import { Card, Title, Paragraph, Button, IconButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { db } from '../FirebaseConfig';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';

export default function SectionDetails({ route, navigation }) {
  const { sectionId, sectionName, email } = route.params;
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [resetAll, setResetAll] = useState(false); // State to track if resetting all tallies
  const [resetStudentId, setResetStudentId] = useState(null); // State to track the student ID for resetting tally

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'students'));
        const studentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllStudents(studentsList);
        setStudents(studentsList.filter(student => student.section === sectionId));
      } catch (error) {
        console.error("Error fetching students:", error);
        Alert.alert('Error', 'Failed to fetch students');
      }
    };

    fetchStudents();
  }, [sectionId]);

  const verifyPasswordAndResetTally = async () => {
    try {
      console.log("Verifying password...");
      console.log("Email:", email); // Log the email to ensure it's being passed correctly
      const teacherDocRef = doc(db, 'teachers', email);
      const teacherDocSnap = await getDoc(teacherDocRef);
  
      if (!teacherDocSnap.exists()) {
        console.log("Teacher not found");
        Alert.alert('Error', 'Teacher not found');
        return;
      }
  
      const teacherData = teacherDocSnap.data();
      console.log("Teacher data:", teacherData);
  
      if (!teacherData || !teacherData.password) {
        console.log("Teacher data or password is undefined");
        Alert.alert('Error', 'Teacher data is incomplete');
        return;
      }
  
      if (teacherData.password !== confirmPassword) {
        console.log("Incorrect password");
        Alert.alert('Error', 'Incorrect password');
        return;
      }
  
      if (resetAll) {
        console.log("Resetting all tallies...");
        await resetAllTally();
      } else {
        console.log("Resetting tally for student ID:", resetStudentId);
        await resetUserTally(resetStudentId);
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      console.log("Error details:", error.message, error.stack);
      Alert.alert('Error', 'Failed to verify password');
    } finally {
      setModalVisible(false);
      setConfirmPassword('');
      setResetAll(false);
      setResetStudentId(null);
    }
  };

  const resetUserTally = async (studentId) => {
    try {
      const studentDocRef = doc(db, 'students', studentId);
      await updateDoc(studentDocRef, { tally: 0 });
      setStudents(students.map(student => student.id === studentId ? { ...student, tally: 0 } : student));
      Alert.alert('Success', 'Tally reset successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const resetAllTally = async () => {
    try {
      const resetPromises = students.map(student => {
        const studentDocRef = doc(db, 'students', student.id);
        return updateDoc(studentDocRef, { tally: 0 });
      });
      await Promise.all(resetPromises);
      setStudents(students.map(student => ({ ...student, tally: 0 })));
      Alert.alert('Success', 'All tallies reset successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const addStudentToSection = async () => {
    if (selectedStudentId.trim() === '') {
      Alert.alert('Error', 'Please select a student');
      return;
    }
    try {
      const studentDocRef = doc(db, 'students', selectedStudentId);
      await updateDoc(studentDocRef, { section: sectionId });
      setStudents([...students, allStudents.find(student => student.id === selectedStudentId)]);
      setSelectedStudentId('');
      Alert.alert('Success', 'Student added to folder');
    } catch (error) {
      console.error("Error adding student to section:", error);
      Alert.alert('Error', error.message);
    }
  };

  const removeStudentFromSection = async (studentId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to remove this student from the folder?",
      [
        {
          text: "No",
          onPress: () => console.log("Delete cancelled"),
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const studentDocRef = doc(db, 'students', studentId);
              await updateDoc(studentDocRef, { section: 'ITM302' });
              setStudents(students.filter(student => student.id !== studentId));
              Alert.alert('Success', 'Student removed from folder');
            } catch (error) {
              console.error("Error removing student from section:", error);
              Alert.alert('Error', error.message);
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Title style={styles.sectionName}>{sectionName}</Title>
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
                  <Paragraph>Tally: {item.tally}</Paragraph>
                </View>
                <IconButton
                  icon="delete"
                  onPress={() => removeStudentFromSection(item.id)}
                />
              </View>
              <Button
                mode="contained"
                onPress={() => {
                  setResetStudentId(item.id);
                  setResetAll(false); // Ensure resetAll is false for single student tally reset
                  setModalVisible(true);
                }}
                style={styles.resetUserButton}
              >
                Reset Tally
              </Button>
            </Card.Content>
          </Card>
        )}
      />
      <Picker
        selectedValue={selectedStudentId}
        onValueChange={(itemValue) => setSelectedStudentId(itemValue)}
        style={styles.input}
      >
        <Picker.Item label="Select a student" value="" />
        {allStudents.filter(student => student.section !== sectionId).map(student => (
          <Picker.Item key={student.id} label={student.name} value={student.id} />
        ))}
      </Picker>
      <Button mode="contained" onPress={addStudentToSection} style={styles.button}>
        Add Existing Student not in Folder
      </Button>
      <Button mode="contained" onPress={() => {
        setResetAll(true);
        setModalVisible(true);
      }} style={[styles.button, styles.resetAllButton]}>
        Reset All Tally
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate('DocumentImport', { sectionId, sectionName, students })} style={styles.button}>
        Import Students using Excel
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
            <Text style={styles.modalText}>Please enter your password to confirm reset:</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              secureTextEntry
              placeholder="Enter your password"
            />
            <Button mode="contained" onPress={verifyPasswordAndResetTally} style={styles.button}>
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
  resetAllButton: {
    backgroundColor: 'red', // Change the color of the "Reset All Tally" button
  },
  resetUserButton: {
    backgroundColor: '#6200ee', // Change the color of the "Reset Tally" button
    marginTop: 10, // Add margin to the top to separate it from the content above
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