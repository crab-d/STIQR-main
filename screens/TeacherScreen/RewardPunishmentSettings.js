import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, View, Alert, Platform } from 'react-native';
import { Card, Title, Button, TextInput, IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../FirebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function RewardPunishmentSettings({ navigation }) {
  const [thresholds, setThresholds] = useState({ warning: 3, communityService: 5 });
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'rewardPunishment');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setThresholds(data.thresholds || { warning: 3, communityService: 5 });
          setDeadline(data.deadline ? new Date(data.deadline) : new Date());
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        Alert.alert('Error', 'Failed to fetch settings');
      }
    };

    fetchSettings();
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'settings', 'rewardPunishment');
      await setDoc(docRef, { thresholds, deadline: deadline.toISOString() });
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || deadline;
    setShowDatePicker(Platform.OS === 'ios');
    setDeadline(currentDate);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => nav.goBack()}
        />
        <Title style={styles.title}>Reward and Punishment Settings</Title>
      </View>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Thresholds</Title>
          <TextInput
            label="Warning Threshold"
            value={thresholds.warning.toString()}
            onChangeText={(text) => setThresholds({ ...thresholds, warning: parseInt(text) })}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Community Service Threshold"
            value={thresholds.communityService.toString()}
            onChangeText={(text) => setThresholds({ ...thresholds, communityService: parseInt(text) })}
            keyboardType="numeric"
            style={styles.input}
          />
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Deadline</Title>
          <Button onPress={() => setShowDatePicker(true)} style={styles.input}>
            {deadline.toDateString()}
          </Button>
          {showDatePicker && (
            <DateTimePicker
              value={deadline}
              mode="date"
              display="default"
              onChange={onChangeDate}
              minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))} // Set minimum date to tomorrow
            />
          )}
        </Card.Content>
      </Card>
      <Button mode="contained" onPress={saveSettings} loading={loading} style={styles.button}>
        Save Settings
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginLeft: 10,
  },
  card: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  button: {
    marginTop: 10,
  },
});