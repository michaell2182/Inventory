import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Nav = () => {
  return (
    <View style={styles.navContainer}>
      <View style={styles.navContent}>
        {/* Left side - Profile Image */}
        <View style={styles.profileCircle} />

        {/* Right side - Icons */}
        <View style={styles.iconsContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications-outline" size={24} color="#4b5563" />
          </View>
          <View style={styles.iconCircle}>
            <Ionicons name="camera-outline" size={24} color="#4b5563" />
          </View>
        </View>
      </View>
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
});

export default Nav; 