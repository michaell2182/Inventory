import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Alert, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ImagePickerModal from './ImagePickerModal';
import AddProductForm from './AddProductForm';
import { useAuth } from '../store/AuthContext';
import { useRouter } from 'expo-router';

const Nav = () => {
  const { signOut, userTier } = useAuth();
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();

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

  const handleUpgrade = () => {
    router.push('/monetization');
  };

  const renderProfileMenu = () => (
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
          <View style={styles.popoverArrow} />
          
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarLarge} />
            <Text style={styles.profileName}>Test User</Text>
            <Text style={styles.profileEmail}>test@example.com</Text>
            
            {userTier !== 'Enterprise' && (
              <TouchableOpacity 
                style={styles.upgradeButton}
                onPress={handleUpgrade}
              >
                <View style={styles.upgradeContent}>
                  <Ionicons name="star" size={18} color="#fff" />
                  <Text style={styles.upgradeText}>Upgrade Now</Text>
                </View>
                {/* <View style={styles.upgradeBadge}>
                  <Text style={styles.upgradeBadgeText}>SAVE 20%</Text>
                </View> */}
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.menuDivider} />
          
          {/* Menu Items */}
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={22} color="#4b5563" />
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={22} color="#4b5563" />
            <Text style={styles.menuItemText}>Help & Support</Text>
          </TouchableOpacity>
          
          <View style={styles.menuDivider} />
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.signOutItem]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={22} color="#dc2626" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.navContainer}>
      <View style={styles.navContent}>
        <View style={styles.profileSection}>
          <TouchableOpacity 
            onPress={() => setShowProfileMenu(true)}
          >
            <View style={styles.profileCircle} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tierBadge}
            onPress={handleUpgrade}
          >
            <Text style={styles.tierText}>{userTier} Plan</Text>
            {userTier === 'Basic' && (
              <View style={styles.upgradeIndicator}>
                <Ionicons name="arrow-up-circle" size={16} color="#4f46e5" />
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.iconsContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications-outline" size={24} color="#4b5563" />
          </View>
          <TouchableOpacity style={styles.iconCircle} onPress={handleCameraPress}>
            <Ionicons name="camera-outline" size={24} color="#4b5563" />
          </TouchableOpacity>
        </View>
      </View>

      {renderProfileMenu()}

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
    paddingTop: 24, 


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
  },
  menuContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    width: Dimensions.get('window').width - 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  popoverArrow: {
    position: 'absolute',
    top: -10,
    left: 30,
    width: 20,
    height: 20,
    backgroundColor: 'white',
    transform: [{ rotate: '45deg' }],
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e2e8f0',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
  },
  signOutItem: {
    marginTop: 4,
    marginBottom: 4,
  },
  signOutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '500',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tierText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  upgradeIndicator: {
    backgroundColor: '#e0e7ff',
    padding: 4,
    borderRadius: 12,
  },
  upgradeButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upgradeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upgradeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default Nav; 