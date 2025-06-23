import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, SectionList, TouchableOpacity, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import Avatar from '@flipxyz/react-native-boring-avatars';
import themeVariables from '../styles/theme';

const ClassScreen = ({ classes, onBack }) => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  // Debug: log classes prop on mount/update
  useEffect(() => {
    console.log('ClassScreen props classes:', classes);
  }, [classes]);
  // Debug: log tab index changes
  useEffect(() => {
    const current = routes[index] || {};
    console.log('ClassScreen tab index changed:', index, 'route:', current);
  }, [index]);
  const [routes] = useState(
    classes.map((cls, idx) => ({ key: (cls.id ?? idx).toString(), title: cls.name }))
  );

  const renderScene = ({ route }) => {
    const cls = classes.find((c, idx) => (c.id ?? idx).toString() === route.key) || {};
    console.log('ClassScreen renderScene for route:', route);
    const sections = [
      { title: 'Teachers', data: cls.teachers || [] },
      { title: 'Students', data: cls.students || [] },
    ];
    console.log('ClassScreen sections for route', route.title, sections);
    return (
      <SectionList
        style={styles.scene}
        contentContainerStyle={styles.list}
        sections={sections}
        keyExtractor={(item, index) => (item.id ?? item.name ?? index).toString()}
        renderItem={({ item }) => (
          <View style={styles.personContainer}>
            {console.log('ClassScreen renderItem:', item)}
            {item.profilePicture ? (
              <Image source={{ uri: item.profilePicture }} style={styles.profileImage} />
            ) : (
              <Avatar size={50} name={item.name} variant="beam" />
            )}
            <Text style={styles.personName}>{item.name}</Text>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <>
            {console.log('ClassScreen renderSectionHeader:', title)}
            <Text style={styles.sectionTitle}>{title}</Text>
          </>
        )}
        ListHeaderComponent={() => (
          <>
            <Text style={styles.activityTitle}>{cls.activityTitle || cls.name}</Text>
            {cls.activityImage && <Image source={{ uri: cls.activityImage }} style={styles.banner} />}
          </>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Classes</Text>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={styles.indicator}
            style={styles.tabBar}
            // Custom label rendering to ensure visibility
            renderLabel={({ route, focused }) => (
              <Text
                style={[
                  styles.tabLabel,
                  { color: focused ? themeVariables.primaryColor : '#333' },
                ]}
              >
                {route.title}
              </Text>
            )}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: themeVariables.primaryColor,
    fontSize: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    paddingVertical: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: themeVariables.primaryColor,
  },
  tabText: {
    fontSize: 14,
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  banner: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  list: {
    paddingBottom: 16,
  },
  studentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  studentName: {
    marginLeft: 12,
    fontSize: 16,
  },
  // New styles for TabView scenes
  scene: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 8,
  },
  personContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  personName: {
    marginLeft: 12,
    fontSize: 16,
  },
  tabBar: {
    backgroundColor: '#fff',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  indicator: {
    backgroundColor: themeVariables.primaryColor,
  },
});

export default ClassScreen;