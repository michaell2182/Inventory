import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Add type definition for your routes
type RootStackParamList = {
  Home: undefined;
  // Add other routes here
};

const Nav = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.navContainer}>
      <View style={styles.navContent}>
        {/* Left side - Profile Image */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          style={styles.profileContainer}
        >
          <Image
            source={require('../assets/images/TestImage.jpg')} // Update path to your image
            style={styles.profileImage}
          />
        </TouchableOpacity>

        {/* Right side - Navigation Icons */}
        <View style={styles.iconsContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications-outline" size={30} color="#4b5563" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.iconCircle}>
              <Ionicons name="camera-outline" size={30} color="#4b5563" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: '#f5f5f5',
    
    borderBottomColor: '#e5e7eb',
    paddingTop: 24,
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  profileContainer: {
    height: 62,
    width: 62,
    borderRadius: 100,
    overflow: 'hidden',
  },
  profileImage: {
    height: '100%',
    width: '100%',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    padding: 8,
  },
  iconCircle: {
    height: 44,
    width: 44,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Nav; 