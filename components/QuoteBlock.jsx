import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import themeVariables from '../styles/theme';

const stripPunctuation = (str) => str.replace(/[.,!?;:'"“”‘’]/g, '').toLowerCase();

const QuoteBlock = ({ quote, references = [], backgroundImage, backgroundColor = themeVariables.neutralLight }) => {
  const [activeRef, setActiveRef] = useState(null);
  const refMap = references.reduce((acc, r) => {
    acc[r.word.toLowerCase()] = r.examples;
    return acc;
  }, {});

  const tokens = quote.split(/(\s+)/).map((tok, idx) => {
    if (/^\s+$/.test(tok)) return { text: tok, key: `space-${idx}` };
    const clean = stripPunctuation(tok);
    if (refMap[clean]) {
      return { text: tok, underline: true, key: `w-${idx}`, examples: refMap[clean] };
    }
    return { text: tok, key: `w-${idx}` };
  });

  return (
    <ImageBackground source={backgroundImage} style={[styles.background, { backgroundColor }]}>
      <Text style={styles.quoteText}>
        {tokens.map(part => {
          if (part.underline) {
            return (
              <Text key={part.key} style={styles.underline} onPress={() => setActiveRef(part.examples)}>
                {part.text}
              </Text>
            );
          }
          return <Text key={part.key}>{part.text}</Text>;
        })}
      </Text>
      <Modal visible={!!activeRef} transparent animationType="fade" onRequestClose={() => setActiveRef(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {activeRef && activeRef.map((ex, i) => (
                <Text key={i} style={styles.exampleText}>• {ex}</Text>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setActiveRef(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 18,
    textAlign: 'center',
  },
  underline: {
    textDecorationLine: 'underline',
    color: themeVariables.primaryColor,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    maxHeight: '80%',
  },
  exampleText: {
    fontSize: 16,
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: themeVariables.primaryColor,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: themeVariables.borderRadiusPill,
  },
  closeButtonText: {
    color: themeVariables.whiteColor,
  },
});

export default QuoteBlock;
