import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ImagePickerModal from './ImagePickerModal';
import AddProductForm from './AddProductForm';
import { useAuth } from '../store/AuthContext';

const Nav = () => {
  const { signOut } = useAuth();
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleCameraPress = () => {
    setImagePickerVisible(true);
  };

  const handleCamera = async () => {
    setImagePickerVisible(false);
    
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setFormVisible(true);
    }
  };

  const handleGallery = async () => {
    setImagePickerVisible(false);

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Gallery permission is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setFormVisible(true);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              setShowProfileMenu(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.navContainer}>
      <View style={styles.navContent}>
        <TouchableOpacity 
          onPress={() => setShowProfileMenu(true)}
        >
          <View style={styles.profileCircle} />
        </TouchableOpacity>
        
        <View style={styles.iconsContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications-outline" size={24} color="#4b5563" />
          </View>
          <TouchableOpacity style={styles.iconCircle} onPress={handleCameraPress}>
            <Ionicons name="camera-outline" size={24} color="#4b5563" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Menu Modal */}
      <Modal
        visible={showProfileMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProfileMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={24} color="#dc2626" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Existing Modals */}
      <ImagePickerModal
        visible={imagePickerVisible}
        onClose={() => setImagePickerVisible(false)}
        onSelectCamera={handleCamera}
        onSelectGallery={handleGallery}
      />

      {selectedImage && (
        <AddProductForm
          visible={formVisible}
          onClose={() => {
            setFormVisible(false);
            setSelectedImage(null);
          }}
          imageUri={selectedImage}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: '#fff',
    paddingTop: 24, // Adjust based on your device's status bar

  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  iconsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#4b5563',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    backgroundColor: 'white',
    marginTop: 80, // Adjust based on your nav height
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  signOutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Nav; 