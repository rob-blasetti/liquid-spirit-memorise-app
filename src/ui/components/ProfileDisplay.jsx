import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import themeVariables from '../stylesheets/theme';
import Chip from './Chip';

const STAR_ICON_SIZE = 14; // compact star so it fits beside the grade

const ProfileDisplay = ({
  profile,
  onProfilePress,
  canSwitchAccount,
  onPointsPress,
  showGradeChip = true,
  showPoints = true,
}) => {
  const { firstName, lastName, username, totalPoints } = profile;
  const fullName = [ firstName, lastName ]
    .filter(part => typeof part === 'string' && part.trim().length > 0)
    .join(' ');
  const displayName = fullName || username;
  const rawGradeValue = profile.grade;
  const gradeString = rawGradeValue === null || typeof rawGradeValue === 'undefined'
    ? ''
    : String(rawGradeValue).trim();
  const shouldShowGradeChip = gradeString.length > 0
    && ![ 'n/a', 'na', 'null', 'undefined', 'nan' ].includes(gradeString.toLowerCase());
  const formattedGradeLabel = shouldShowGradeChip
    ? gradeString.replace(
      /[a-z]+/gi,
      segment => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase(),
    )
    : null;
  const gradeChipText = (() => {
    if (!formattedGradeLabel) return null;
    const labelLower = formattedGradeLabel.toLowerCase();
    if (labelLower.startsWith('grade ')) return formattedGradeLabel;
    if (/^\d/.test(formattedGradeLabel)) return `Grade ${formattedGradeLabel}`;
    if (labelLower === '2b') return 'Grade 2B';
    return formattedGradeLabel;
  })();
  const canPressProfile = typeof onProfilePress === 'function';

  return (
    <LinearGradient
      colors={['#b13cb3', '#5a2ca0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.profileContent}
          onPress={canPressProfile ? onProfilePress : undefined}
          disabled={!canPressProfile}
          activeOpacity={0.75}
          accessibilityRole={canPressProfile ? 'button' : undefined}
          accessibilityLabel={canPressProfile ? 'View profile' : undefined}
        >
          <View style={styles.gradeRow}>
            <View style={styles.gradeContent}>
              {showGradeChip && shouldShowGradeChip && gradeChipText ? (
                <Chip
                  text={gradeChipText}
                  icon="school-outline"
                  color={themeVariables.primaryColor}
                  bg="rgba(255, 255, 255, 0.85)"
                  style={styles.gradeChip}
                />
              ) : null}
              {showPoints ? (
                <TouchableOpacity
                  style={styles.pointsDisplay}
                  onPress={onPointsPress}
                  accessibilityRole="button"
                  accessibilityLabel="View achievements"
                  disabled={typeof onPointsPress !== 'function'}
                  activeOpacity={0.75}
                >
                  <View style={styles.starButton}>
                    <Ionicons name="star-outline" size={STAR_ICON_SIZE} color={themeVariables.blackColor} />
                  </View>
                  <Text style={styles.pointsText}>{totalPoints ?? 0}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {canSwitchAccount ? (
              <View style={styles.gradeChevronButton}>
                <Ionicons name="chevron-down" size={12} color={themeVariables.blackColor} />
              </View>
            ) : null}
          </View>

          <View style={[styles.nameContainer, showGradeChip && shouldShowGradeChip && styles.nameIndented]}>
            <Text style={styles.profileName}>{displayName}</Text>
            {(profile.linkedAccount || profile.type === 'linked') && (
              <Ionicons name="link" size={14} color={themeVariables.whiteColor} style={styles.linkIcon} />
            )}
          </View>

          {/* Lesson moved out of ProfileDisplay to Home screen */}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 50, // more rounded
    overflow: 'hidden',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  profileContent: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeVariables.whiteColor,
  },
  gradeChip: {
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
  },
  gradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  starButton: {
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 14,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    marginRight: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
    color: themeVariables.whiteColor,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameIndented: {
    marginLeft: 6,
  },
  gradeChevronButton: {
    marginLeft: 12,
    backgroundColor: themeVariables.whiteColor,
    borderRadius: 14,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
  },
  linkIcon: {
    marginLeft: 8,
  },
});

export default ProfileDisplay;
