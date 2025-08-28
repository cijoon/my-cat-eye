import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  SafeAreaView,
  Button, // İzin istemek için eklendi
} from 'react-native';
// DEĞİŞİKLİK 1: 'Camera' yerine 'CameraView' ve 'useCameraPermissions' import edildi
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen({ navigation }) {
  // DEĞİŞİKLİK 2: İzin isteme yöntemi 'useCameraPermissions' hook'u ile değiştirildi
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [step, setStep] = useState(1); // 1: cat photo, 2: object photo
  const [catPhoto, setCatPhoto] = useState(null);
  const pawAnimation = useRef(new Animated.Value(0)).current;

  // Eski useEffect'e artık gerek yok, hook bunu hallediyor.

  useEffect(() => {
    // Animate paw button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pawAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pawAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({
          quality: 0.7,
          base64: true,
        });

        if (step === 1) {
          setCatPhoto(photo);
          setStep(2);
        } else {
          navigation.navigate('Result', {
            catPhoto: catPhoto,
            objectPhoto: photo,
          });
        }
      } catch (error) {
        console.error("Fotoğraf çekme hatası: ", error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };
  
  // DEĞİŞİKLİK 3: İzin durumu kontrolü yeni yapıya göre güncellendi
  if (!permission) {
    // İzin durumu henüz yüklenmediyse
    return <View />;
  }

  if (!permission.granted) {
    // Kamera izni verilmediyse kullanıcıya bir buton göster
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ textAlign: 'center', marginBottom: 16 }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* DEĞİŞİKLİK 4: <Camera> component'i <CameraView> ile ve prop'ları güncellendi */}
      <CameraView
        style={styles.camera}
        facing={'back'} // 'type' yerine 'facing' kullanıldı
        ref={(ref) => setCameraRef(ref)}
      >
        <View style={styles.overlay}>
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              {step === 1
                ? 'First, take a picture of your cat'
                : 'Now, take a picture of the object your cat is looking at'}
            </Text>
          </View>

          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => (step === 1 ? navigation.goBack() : setStep(1))}
            >
              <Text style={styles.backButtonText}>
                {step === 1 ? 'Back' : 'Retake Cat'}
              </Text>
            </TouchableOpacity>

            <Animated.View
              style={[
                styles.captureButtonContainer,
                {
                  transform: [
                    {
                      translateY: pawAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <Text style={styles.pawEmoji}>🐾</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.placeholder} />
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // İzin ekranı için yeni stil
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  instructionContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 10,
  },
  instructionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  captureButtonContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pawEmoji: {
    fontSize: 40,
  },
  placeholder: {
    width: 60, // Bu değer backButton'ın genişliğine yakın olmalı ki ortalama sağlansın
  },
});