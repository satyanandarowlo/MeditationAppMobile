import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Sound from 'react-native-sound';
import KeepAwake from 'react-native-keep-awake'; // Import the older version of KeepAwake

const App: React.FC = () => {
  let [delay, setDelay] = useState<number>(1000); // Initial trance gap in milliseconds
  const [started, setStarted] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10); // Countdown timer
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false); // Track countdown state
  const [totalDuration, setTotalDuration] = useState<number>(0); // Track meditation duration
  const [currentDelay, setCurrentDelay] = useState<number>(0); // Current trance gap for display
  const startTimeRef = useRef<number>(0);

  // Initialize Sound instance
  const audio = useRef<Sound>(
    new Sound(require('./assets/bell-a-99888.mp3'), Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.error('Failed to load the sound', error);
      }
    })
  ).current;

  // Prevent the screen from locking during the session
  useEffect(() => {
    if (started) {
      KeepAwake.activate(); // Prevent the screen from locking
    }

    // Clean up after session ends
    return () => {
      KeepAwake.deactivate(); // Allow screen lock after the session
    };
  }, [started]);

  // Countdown logic
  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;
    if (isCountingDown && countdown > 0) {
      countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      handleStartMeditation();
    }
    return () => clearTimeout(countdownTimer);
  }, [countdown, isCountingDown]);

  // Start Meditation after countdown finishes
  const handleStartMeditation = () => {
    setStarted(true);
    setCurrentDelay(delay / 1000); // Display initial trance gap in seconds
    startTimeRef.current = Date.now();
    setTimeout(playSoundAndIncreaseDelay, delay);
  };

  // Play sound and increase trance gap gradually
  const playSoundAndIncreaseDelay = () => {
    if (audio) {
      audio.setCurrentTime(0);
      audio.play();

      delay = delay * 1.05; // Increase delay by 5%
      setDelay(delay);

      const now = Date.now();
      setTotalDuration(now - startTimeRef.current); // Update meditation duration
      setCurrentDelay(delay / 1000); // Update displayed trance gap

      // Schedule the next sound after the updated delay
      setTimeout(playSoundAndIncreaseDelay, delay);
    }
  };

  // Start countdown
  const handleStart = () => {
    setIsCountingDown(true);
  };

  return (
    <View style={styles.container}>
      {isCountingDown && countdown > 0 ? (
        <View style={styles.countdown}>
          <Text style={styles.text}>Meditation starts in {countdown}...</Text>
        </View>
      ) : (
        <>
          {started ? (
            <View style={styles.meditationInfo}>
              <Text style={styles.text}>Trance gap: {currentDelay.toFixed(2)} seconds</Text>
              <Text style={styles.text}>Meditation duration: {(totalDuration / 1000).toFixed(2)} seconds</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleStart} style={styles.startButton}>
                <Text style={styles.buttonText}>Start Meditation</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6e8efb', // Background color for mobile
  },
  text: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  countdown: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  meditationInfo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonText: {
    fontSize: 20,
    color: '#6e8efb',
    fontWeight: 'bold',
  },
});
