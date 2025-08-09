import { StyleSheet, Text, View, ScrollView, Linking } from 'react-native';

export default function TabTwoScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Explore</Text>
      </View>
      
      <Text style={styles.paragraph}>This app includes example code to help you get started.</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>File-based routing</Text>
        <Text>
          This app has two screens: <Text style={styles.bold}>app/(tabs)/index.tsx</Text> and{' '}
          <Text style={styles.bold}>app/(tabs)/explore.tsx</Text>
        </Text>
        <Text>
          The layout file in <Text style={styles.bold}>app/(tabs)/_layout.tsx</Text>{' '}
          sets up the tab navigator.
        </Text>
        <Text 
          style={styles.link}
          onPress={() => Linking.openURL('https://docs.expo.dev/router/introduction')}>
          Learn more
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Android, iOS, and web support</Text>
        <Text>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <Text style={styles.bold}>w</Text> in the terminal running this project.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Light and dark mode components</Text>
        <Text>
          This template has light and dark mode support. The{' '}
        
          what the user's current color scheme is, so you can adjust UI colors accordingly.
        </Text>
        <Text 
          style={styles.link}
          onPress={() => Linking.openURL('https://docs.expo.dev/develop/user-interface/color-themes/')}>
          Learn more
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  titleContainer: {
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  link: {
    color: '#2e78b7',
    marginTop: 8,
  }
});
