import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../stylesheets/theme';

const DEFAULT_GRADIENT = ['#E21281', '#6E33A7'];
const DEFAULT_CARD_IMAGE = require('../../assets/img/game_placeholders/Solve_The_Puzzle.png');

const GameTile = ({
  title,
  icon = 'game-controller-outline',
  onPress,
  gradient = DEFAULT_GRADIENT,
  cardImage,
  variant = 'default',
}) => {
  if (variant === 'carousel') {
    const imageSource = cardImage || DEFAULT_CARD_IMAGE;
    return (
      <TouchableOpacity activeOpacity={0.8} style={styles.carouselTouchable} onPress={onPress}>
        <View style={styles.carouselCard}>
          <View style={styles.carouselImageWrap}>
            <Image source={imageSource} style={styles.carouselImage} resizeMode="cover" />
          </View>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.carouselFooterGradient}
          />
          <View style={styles.carouselFooterSection}>
            <View style={styles.carouselFooterRow}>
              <Text numberOfLines={2} style={styles.carouselTitle}>
                {title}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.tile} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={28} color={theme.primaryColor} />
      </View>
      <Text style={styles.tileText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  carouselTouchable: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.whiteColor,
    shadowOpacity: 0,
    elevation: 0,
  },
  carouselCard: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: 'transparent',
  },
  carouselImageWrap: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: '142%',
    marginTop: -76,
  },
  carouselFooterSection: {
    width: '100%',
    minHeight: 60,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  carouselFooterGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 60,
    bottom: 0,
  },
  carouselFooterRow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: theme.whiteColor,
    letterSpacing: 0.4,
  },
  tile: {
    backgroundColor: '#fff',
    width: '48%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.borderColor,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    backgroundColor: theme.neutralLight,
    borderRadius: 30,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default GameTile;
