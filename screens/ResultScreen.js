import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export default function ResultScreen({ route, navigation }) {
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const { catPhoto, objectPhoto } = route.params;

  useEffect(() => {
    generateArtisticImage();
  }, []);

  const generateArtisticImage = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with your actual serverless function URL
      const response = await fetch('https://my-cat-eye.vercel.app/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: objectPhoto.base64,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedImage(result.imageUrl);
      } else {
        Alert.alert('Error', 'Failed to generate artistic image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      Alert.alert('Error', 'Network error occurred');
      // For demo purposes, show a placeholder
      setGeneratedImage('https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Generated+Cat+Art');
    } finally {
      setLoading(false);
    }
  };

  const saveToGallery = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to save images');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(generatedImage);
      Alert.alert('Success', 'Image saved to gallery!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save image');
    }
  };

  const shareImage = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(generatedImage);
      } else {
        Alert.alert('Error', 'Sharing not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share image');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
          <Text style={styles.loadingText}>
            Creating artistic vision... 🎨
          </Text>
          <Text style={styles.loadingSubtext}>
            Your cat's perspective is being transformed into art
          </Text>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.title}>Your Cat's Artistic Vision</Text>
          
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: generatedImage }}
              style={styles.generatedImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={saveToGallery}
            >
              <Text style={styles.buttonText}>Save to Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.shareButton]}
              onPress={shareImage}
            >
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backHomeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backHomeText}>Create Another</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  loadingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
  resultContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  generatedImage: {
    width: width - 40,
    height: width - 40,
    borderRadius: 15,
    backgroundColor: '#ecf0f1',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  shareButton: {
    backgroundColor: '#3498db',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backHomeButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  backHomeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});