import React from 'react';
import { View, Modal, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectGallery: () => void;
}

const ImagePickerModal = ({ visible, onClose, onSelectCamera, onSelectGallery }: ImagePickerModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add Product Image</Text>
          
          <TouchableOpacity 
            style={styles.option} 
            onPress={onSelectCamera}
          >
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.option} 
            onPress={onSelectGallery}
          >
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.option, styles.cancelButton]} 
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  option: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelText: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ImagePickerModal; 