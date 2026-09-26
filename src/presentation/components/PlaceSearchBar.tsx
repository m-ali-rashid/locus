/**
 * presentation/components/PlaceSearchBar.tsx
 *
 * Floating search bar with Menu icon and GPS Crosshair button,
 * styled in crisp white with soft shadows matching the Waynest design.
 */
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import type { PlaceSuggestion } from '../../domain/entities/PlaceSuggestion';

interface Props {
  query: string;
  onChangeQuery: (text: string) => void;
  suggestions: PlaceSuggestion[];
  isSearching: boolean;
  onSelectSuggestion: (suggestion: PlaceSuggestion) => void;
  onClear: () => void;
  onCenterUserLocation?: () => void;
  onMenuPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const PlaceSearchBar: React.FC<Props> = ({
  query,
  onChangeQuery,
  suggestions,
  isSearching,
  onSelectSuggestion,
  onClear,
  onCenterUserLocation,
  onMenuPress,
  style,
}) => {
  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.row}>
        {/* Menu / Filter button */}
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={onMenuPress}
          activeOpacity={0.8}
        >
          <View style={styles.menuIconCol}>
            <View style={[styles.menuLine, { width: 16 }]} />
            <View style={[styles.menuLine, { width: 12 }]} />
            <View style={[styles.menuLine, { width: 18 }]} />
          </View>
        </TouchableOpacity>

        {/* Main Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="Search place or address..."
            placeholderTextColor="#8E8E93"
            value={query}
            onChangeText={onChangeQuery}
            autoCorrect={false}
            returnKeyType="search"
          />
          {isSearching && (
            <ActivityIndicator size="small" color="#1C1B1F" style={styles.loader} />
          )}
          {query.length > 0 ? (
            <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          ) : (
            onCenterUserLocation && (
              <TouchableOpacity
                onPress={onCenterUserLocation}
                style={styles.gpsBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.gpsIcon}>⌖</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      {/* Autocomplete Dropdown */}
      {suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={suggestions}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => onSelectSuggestion(item)}
                activeOpacity={0.7}
              >
                <View style={styles.pinCircle}>
                  <Text style={styles.pinIcon}>📍</Text>
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemSubtitle} numberOfLines={1}>
                    {item.formattedAddress}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 24,
    left: 16,
    right: 16,
    zIndex: 999,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  menuIconCol: {
    gap: 4,
    alignItems: 'flex-start',
  },
  menuLine: {
    height: 2,
    backgroundColor: '#1C1B1F',
    borderRadius: 1,
  },
  searchBar: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    color: '#1C1B1F',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },
  loader: {
    marginLeft: 6,
  },
  clearBtn: {
    padding: 6,
  },
  clearText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '700',
  },
  gpsBtn: {
    padding: 6,
  },
  gpsIcon: {
    fontSize: 18,
    color: '#1C1B1F',
    fontWeight: '800',
  },
  dropdown: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    maxHeight: 260,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F0F2',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pinIcon: {
    fontSize: 14,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    color: '#1C1B1F',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#F4F4F6',
    marginLeft: 60,
  },
});
