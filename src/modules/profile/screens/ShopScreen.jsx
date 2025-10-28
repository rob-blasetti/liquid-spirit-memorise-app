import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme from '../../../ui/stylesheets/theme';
import useParentalGate from '../../../hooks/useParentalGate';

const SHOP_ITEMS = [
  { id: 'sticker_pack_1', title: 'Sticker Pack: Ocean', price: 50, description: 'Fun ocean-themed stickers for messages.' },
  { id: 'avatar_frame_gold', title: 'Avatar Frame: Gold', price: 120, description: 'Give your avatar a shiny gold frame.' },
  { id: 'wallpaper_pearlina', title: 'Wallpaper: Pearlina', price: 80, description: 'A cheerful Pearlina home wallpaper.' },
  { id: 'color_theme_amethyst', title: 'Color Theme: Amethyst', price: 150, description: 'Unlock a purple amethyst app theme.' },
];

const ShopScreen = ({ profile, children = [], setChildren, setProfile, saveProfile }) => {
  const [giftModalItem, setGiftModalItem] = useState(null);
  const [hasGuardianAccess, setHasGuardianAccess] = useState(false);
  const { requestPermission, ParentalGate } = useParentalGate();

  const points = typeof profile?.totalPoints === 'number' ? profile.totalPoints : 0;
  const owned = useMemo(() => new Set(profile?.inventory || []), [profile?.inventory]);

  useEffect(() => {
    let isMounted = true;
    const verifyGuardian = async () => {
      const approved = await requestPermission();
      if (!isMounted) return;
      setHasGuardianAccess(Boolean(approved));
    };
    verifyGuardian();
    return () => {
      isMounted = false;
    };
  }, [requestPermission]);

  const requireGuardianAccess = async () => {
    if (hasGuardianAccess) return true;
    const approved = await requestPermission();
    if (approved) {
      setHasGuardianAccess(true);
      return true;
    }
    return false;
  };

  const canAfford = (price) => points >= price;

  const handleBuy = async (item) => {
    const allowed = await requireGuardianAccess();
    if (!allowed) return;
    if (owned.has(item.id)) {
      Alert.alert('Already owned', 'You already own this item.');
      return;
    }
    if (!canAfford(item.price)) {
      Alert.alert('Not enough points', 'Earn more points to buy this item.');
      return;
    }
    const next = {
      ...profile,
      totalPoints: points - item.price,
      inventory: Array.from(new Set([...(profile?.inventory || []), item.id])),
    };
    await saveProfile(next);
    setProfile(next);
    Alert.alert('Purchased', `You bought ${item.title}!`);
  };

  const recipientList = useMemo(() => {
    return (Array.isArray(children) ? children : []).map((entry) => entry.child || entry);
  }, [children]);

  const handleGiftTo = async (recipient) => {
    const allowed = await requireGuardianAccess();
    if (!allowed) return;
    const item = giftModalItem;
    if (!item) return;
    if (!canAfford(item.price)) {
      Alert.alert('Not enough points', 'Earn more points to gift this item.');
      return;
    }
    const updatedChildren = recipientList.map((c) => {
      if ((c._id || c.id) === (recipient._id || recipient.id)) {
        const inv = Array.isArray(c.inventory) ? c.inventory : [];
        if (inv.includes(item.id)) {
          // Already owned; just return
          return c;
        }
        return { ...c, inventory: [...inv, item.id] };
      }
      return c;
    });

    // Deduct points from current user
    const nextProfile = {
      ...profile,
      totalPoints: points - item.price,
    };
    await saveProfile(nextProfile);
    setProfile(nextProfile);
    await setChildren(updatedChildren);

    setGiftModalItem(null);
    Alert.alert('Gift sent', `You gifted ${item.title} to ${recipient.firstName || recipient.username || 'your friend'}!`);
  };

  const renderItem = ({ item }) => {
    const alreadyOwned = owned.has(item.id);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={styles.priceTag}>
            <Ionicons name="star" size={14} color="#f1c40f" />
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
        </View>
        <Text style={styles.cardDesc}>{item.description}</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, alreadyOwned ? styles.btnDisabled : (canAfford(item.price) ? styles.btnBuy : styles.btnDisabled)]}
            onPress={() => handleBuy(item)}
            disabled={alreadyOwned || !canAfford(item.price)}
          >
            <Ionicons name="cart" size={16} color={theme.whiteColor} />
            <Text style={styles.actionText}>{alreadyOwned ? 'Owned' : 'Buy'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, canAfford(item.price) ? styles.btnGift : styles.btnDisabled]}
            onPress={() => setGiftModalItem(item)}
            disabled={!canAfford(item.price) || recipientList.length === 0}
          >
            <Ionicons name="gift" size={16} color={theme.whiteColor} />
            <Text style={styles.actionText}>Gift</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!hasGuardianAccess ? (
        <View style={styles.lockedOverlay}>
          <Ionicons name="lock-closed" size={40} color={theme.whiteColor} />
          <Text style={styles.lockedTitle}>Parental permission required</Text>
          <Text style={styles.lockedMessage}>
            Please ask a parent or guardian to unlock the shop before continuing.
          </Text>
          <TouchableOpacity style={[styles.actionBtn, styles.btnUnlock]} onPress={requireGuardianAccess}>
            <Ionicons name="key" size={16} color={theme.whiteColor} />
            <Text style={styles.actionText}>Unlock</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Shop</Text>
        <View style={styles.balance}>
          <Ionicons name="star" size={16} color="#f1c40f" />
          <Text style={styles.balanceText}>{points}</Text>
        </View>
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={SHOP_ITEMS}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
      />

      <Modal visible={!!giftModalItem} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setGiftModalItem(null)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Gift to...</Text>
          {recipientList.length === 0 ? (
            <Text style={styles.noRecipients}>No recipients available.</Text>
          ) : (
            recipientList.map((r) => (
              <TouchableOpacity key={r._id || r.id} style={styles.recipientRow} onPress={() => handleGiftTo(r)}>
                <Ionicons name="person-circle" size={22} color={theme.primaryColor} />
                <Text style={styles.recipientText}>{r.firstName ? `${r.firstName} ${r.lastName || ''}`.trim() : (r.username || r.name || 'User')}</Text>
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity style={[styles.actionBtn, styles.btnClose]} onPress={() => setGiftModalItem(null)}>
            <Ionicons name="close" size={16} color={theme.whiteColor} />
            <Text style={styles.actionText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {ParentalGate}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    color: theme.whiteColor,
    fontSize: 22,
    fontWeight: '700',
  },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  balanceText: {
    color: theme.whiteColor,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 120,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: 'rgba(20, 18, 46, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  lockedTitle: {
    color: theme.whiteColor,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  lockedMessage: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  btnUnlock: {
    backgroundColor: theme.primaryColor,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: theme.whiteColor,
    fontSize: 16,
    fontWeight: '700',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  priceText: {
    color: theme.whiteColor,
    fontWeight: '700',
    fontSize: 13,
  },
  cardDesc: {
    color: theme.whiteColor,
    opacity: 0.9,
    marginTop: 6,
    marginBottom: 10,
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    color: theme.whiteColor,
    fontWeight: '600',
  },
  btnBuy: {
    backgroundColor: theme.primaryColor,
  },
  btnGift: {
    backgroundColor: '#2ecc71',
  },
  btnClose: {
    alignSelf: 'center',
    marginTop: 12,
    backgroundColor: '#888',
  },
  btnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    opacity: 0.6,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '25%',
    backgroundColor: theme.whiteColor,
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
  },
  noRecipients: {
    color: '#333',
    marginBottom: 8,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  recipientText: {
    color: '#111',
    fontSize: 15,
  },
});

export default ShopScreen;
